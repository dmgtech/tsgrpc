import { createCancelable } from '@dmgtech/cancelable';
import { useReducer, Reducer, useEffect } from 'react';
import { assertNever } from 'assert-never';
import { Grpc, Services } from '@dmgtech/tsgrpc';
import delay from 'delay';
import debug from 'debug';

const log = debug('grpc-react');

type ExternalState<TState, TArgs> =
  | {
      status: 'pending';
      args: TArgs;
    }
  | {
      status:
        | 'current' // result is up-to-date but subject to change
        | 'finished' // result is complete
        | 'stale'; // result was current but a disconnection means we now no longer know if it is current
      args: TArgs;
      state: TState;
    }
  | {
      status: 'failed'; // the call failed before getting any results
      args: TArgs;
      error: any;
    };

type ExternalStateCallEvent<TState, TArgs> =
  | { event: 'did-send'; args: TArgs }
  | { event: 'did-receive'; state: Readonly<TState> }
  | { event: 'did-end'; reason: 'ended' }
  | { event: 'did-end'; reason: 'threw'; error: any };

type RunningCall = {
  complete: Promise<any>;
  cancel: () => void;
};

/**
 * Usage example:
 * @example
 *  const extState = useExternalState(ProviderInvoiceScreenState.InvoiceInfoForJob, {jobId: "d34b12d3-b070-87f3-3581-625fa276e513~31"})
 *  if (extState.status === "pending") {
 *      return <Wait />
 *  }
 *  else if (extState.status === "failed") {
 *      return <Failed error={extState.status.error} />;
 *  }
 *  else {
 *      return <Data state={extState.state} />;
 *  }
 * @param api
 * @param args
 */
export function useExternalState<TArgs, TState, TResponse>(
  method:
    | Services.GrpcUnaryMethod<TArgs, TState>
    | Services.GrpcServerStreamingMethod<TArgs, TResponse, TState>,
  args: TArgs
): ExternalState<TState, TArgs> {
  const [extState, dispatch] = useReducer<
    Reducer<ExternalState<TState, TArgs>, ExternalStateCallEvent<TState, TArgs>>
  >(externalStateCallReducer, { status: 'pending', args });
  useEffect(
    () => {
      const runningCall = (method.reducer !== undefined)
        ? runServerStreamingCall<TArgs, TState, TResponse>(
            dispatch,
            args,
            method
          )
        : runUnaryCall<TArgs, TState>(dispatch, args, method);
      return () => {
        runningCall.cancel();
      };
    },
    [method, args] // <- we will create a new request and cancel the old every time any of these things changes
  );
  return extState;
}

function messageFromError(error: any): string {
  if (error instanceof Error) return error.message;
  if (error.message) return error.message;
  if (typeof error === 'string') return error;
  return JSON.stringify(error);
}

function isRetryableError(_error: any) {
  return true;
}

function externalStateCallReducer<TState, TArgs>(
  prev: ExternalState<TState, TArgs>,
  event: ExternalStateCallEvent<TState, TArgs>
): ExternalState<TState, TArgs> {
  switch (event.event) {
    case 'did-send': {
      return {
        status: 'pending',
        args: event.args,
      };
    }
    case 'did-receive': {
      switch (prev.status) {
        case 'stale':
        case 'pending':
        case 'current':
          return {
            args: prev.args,
            state: event.state,
            status: 'current',
          };
        default:
          console.warn(`Invalid event ${event.event} at status ${prev.status}`);
          return prev;
      }
    }
    case 'did-end': {
      switch (prev.status) {
        case 'failed': {
          // should we warn here that this transition doesn't make sense?
          return prev;
        }
        case 'pending': {
          // any end without a receive is a failure
          return {
            status: 'failed',
            args: prev.args,
            error:
              event.reason === 'ended'
                ? 'call ended with no results'
                : messageFromError(event.error),
          };
        }
        default: {
          switch (event.reason) {
            case 'ended':
              return {
                status: 'finished',
                args: prev.args,
                state: prev.state,
              };
            case 'threw':
              return {
                status: 'stale',
                args: prev.args,
                state: prev.state,
              };
            default:
              assertNever(event);
          }
        }
      }
    }
  }
}

let nextCallId = 1;

function runServerStreamingCall<TArgs, TState, TResponse>(
  dispatch: (value: ExternalStateCallEvent<TState, TArgs>) => void,
  args: TArgs,
  method: Services.GrpcServerStreamingMethod<TArgs, TResponse, TState>
): RunningCall {
  const callArgs = {
    host: '10.10.10.20',
    port: 50051,
    method: `${method.service.name}/${method.name}`,
    message: method.encode(args),
    reduce: method.reducer,
    options: { secure: false },
  };

  const callId = nextCallId++;
  log(callId, 'start call');
  const cancelable = createCancelable();
  // make sure we don't dispatch anything to this dispatch function once cancel has been called
  cancelable.register(() => {
    dispatch = () => {};
  });
  const doCallLoop = async () => {
    while (!cancelable.isCanceled()) {
      let state: TState | undefined;
      const reduce = method.reducer();
      const call = Grpc.serverStreamingCall(callArgs);
      log(callId, 'requested', args);
      dispatch({ event: 'did-send', args });
      const callCancel = cancelable.register(() => call.cancel());
      let error: any | undefined;
      try {
        for await (const response of call.response) {
          const decoded = method.decode(response.message);
          log(callId, 'data', decoded);
          const nextState = reduce(state, decoded);
          dispatch({ event: 'did-receive', state: nextState });
        }
      } catch (e) {
        log(callId, 'catch', e);
        error = e;
        dispatch({ event: 'did-end', reason: 'threw', error: e });
        call.cancel();
      } finally {
        cancelable.unregister(callCancel);
      }
      if (isRetryableError(error)) {
        log(callId, 'retrying in 1s');
        await delay(1000);
        log(callId, 'retrying');
        continue;
      }
      dispatch({ event: 'did-end', reason: 'ended' });
      break;
    }
    log('ended');
  };
  const complete = doCallLoop();
  const cancel = () => {
    log(callId, 'cancel');
    cancelable.cancel();
  };
  return { complete, cancel };
}

function runUnaryCall<TArgs, TResponse>(
  dispatch: (value: ExternalStateCallEvent<TResponse, TArgs>) => void,
  args: TArgs,
  method: Services.GrpcUnaryMethod<TArgs, TResponse>
): RunningCall {
  const callArgs = {
    host: '/api',
    method: method.name,
    message: method.encode(args),
    options: { secure: true },
  };
  const call = Grpc.unaryCall(callArgs);
  dispatch({ event: 'did-send', args });
  call
    .then((response) => {
      const decoded = method.decode(response.message);
      dispatch({ event: 'did-receive', state: decoded });
      dispatch({ event: 'did-end', reason: 'ended' });
    })
    .catch((reason) => {
      dispatch({ event: 'did-end', reason: 'threw', error: reason });
    });

  const cancel = () => {
    dispatch = () => {};
  };
  return {
    complete: call,
    cancel,
  };
}
