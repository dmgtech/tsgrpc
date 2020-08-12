export type Reducer<TState, TEvent> = (state: TState | undefined, event: TEvent) => TState;

export function keepLast<TResponse>(): Reducer<TResponse, TResponse> {
    return reduceKeepLast;
};

export function keepAll<TResponse>(): Reducer<TResponse[], TResponse> {
    return reduceKeepAll;
}

type KeyedState<TRecord extends {key: string, value: any}> = TRecord[]

export function keepLastByKey<TResponse extends {records: TRecord[]}, TRecord extends {key: string, value: any} = TResponse["records"][0]>(): Reducer<KeyedState<TRecord>, TResponse> {
    return (state, response) => {
        const delta = response.records;
        if (!state) {
            return delta;
        }
        const next = [];
        const keys = new Set<string>();
        for (let i = delta.length - 1; i >= 0; i--) {
            const record = delta[i]
            const {key} = record;
            if (!keys.has(key)) {
                if (record.value)
                    next.push(record)
            }
            else {
                keys.add(key);
            }
        }
        for (let i = state.length - 1; i >= 0; i--) {
            const record = state[i]
            const {key} = record;
            if (!keys.has(key)) {
                if (record.value)
                    next.push(record)
            }
            else {
                keys.add(key);
            }
        }
        next.reverse();
        return next;
    }
}

function reduceKeepLast<TResponse>(state: TResponse | undefined, response: TResponse): TResponse {
    return response;
}

function reduceKeepAll<TResponse>(state: TResponse[] | undefined, response: TResponse): TResponse[] {
    return state ? [...state, response] : [response];
}

