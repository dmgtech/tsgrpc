package com.reactnativegrpc

import android.os.Build
import android.util.Log
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import io.grpc.*
import io.grpc.stub.ClientCalls
import io.grpc.stub.StreamObserver
import java.util.*
import java.util.concurrent.Executors
import com.facebook.react.bridge.WritableMap


const val NAME = "Grpc"
const val TAG = "react-native-grpc"

val emptyJsMap: ReadableMap = Arguments.createMap()

@ReactModule(name = NAME)
class GrpcModule(reactContext: ReactApplicationContext?) : ReactContextBaseJavaModule(reactContext) {
  private val executor = Executors.newSingleThreadExecutor()
  private var nextId: Int = 1
  private val channels = HashMap<String, Channel>()
  private val activeCalls = HashMap<String, ClientCall<String, String>>()

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  fun check(promise: Promise?) {
    executor.submit {
      promise?.resolve("available")
    }
  }

  @ReactMethod
  fun ping(number: Double, promise: Promise?) {
    executor.submit {
      val args = Arguments.createMap();
      args.putString("type", "pong")
      args.putDouble("number", number)
      emit("grpc-call-event", args)
      promise?.resolve("sent")
    }
  }

  @RequiresApi(api = Build.VERSION_CODES.O)
  @ReactMethod
  fun createCall(args: ReadableMap, promise: Promise?) {
    val createCall = try {
      val host = args.getString("host")
      val port = args.getDouble("port")
      val method = args.getString("method")
      val serverStream = args.getBoolean("serverStream")
      val messageBase64 = if (args.hasKey("messageBase64")) args.getString("messageBase64") else null
      val secure = if (args.hasKey("secure")) args.getBoolean("secure") else true
      CreateCall(
        host!!,
        port,
        method!!,
        messageBase64,
        serverStream,
        secure,
        promise!!
      )
    }
    catch (e: Exception) {
      promise?.reject(e)
      return
    }
    dispatch(createCall)
  }

  @ReactMethod
  fun send(callId: String?, messageBase64: String?, promise: Promise?) {
    val send = try {
      Send(
        callId!!, messageBase64!!, promise!!
      )
    }
    catch (e: Exception) {
      promise?.reject(e)
      return
    }
    dispatch(send)
  }

  data class CreateCall(
    val host: String,
    val port: Double,
    val method: String,
    val messageBase64: String?, // if specified, clientStreaming is inferred to be false
    val serverStream: Boolean,
    val secure: Boolean,
    val result: Promise,
  )

  data class Send(
    val callId: String,
    val messageBase64: String,
    val result: Promise,
  )

  data class DidReceive(
    val callId: String,
    val messageBase64: String?,
  )

  data class DidFail(
    val callId: String,
    val throwable: Throwable?,
  )

  data class DidEnd(
    val callId: String
  )

  @RequiresApi(Build.VERSION_CODES.O)
  fun dispatch(createCall: CreateCall) {
    executor.submit {
      try {
        val callNumber = nextId + 1
        val callId = "$callNumber"
        nextId++
        val (host, port, method, messageBase64, serverStream, secure, result) = createCall
        val channel: Channel = getChannel(host, port.toInt(), secure)
        val clientStream = null == messageBase64
        val methodType = getMethodType(clientStream, serverStream)
        val methodDescriptor = createMethodDescriptor(method, methodType)
        val callOptions = createCallOptions()
        val call = channel.newCall(methodDescriptor, callOptions)
        activeCalls[callId] = call
        when (methodType) {
          MethodDescriptor.MethodType.UNARY -> ClientCalls.asyncUnaryCall(call, messageBase64, CallObserver(callId, this))
          MethodDescriptor.MethodType.SERVER_STREAMING -> ClientCalls.asyncServerStreamingCall(call, messageBase64, CallObserver(callId, this))
          MethodDescriptor.MethodType.CLIENT_STREAMING -> ClientCalls.asyncClientStreamingCall(call, CallObserver(callId, this))
          MethodDescriptor.MethodType.BIDI_STREAMING -> ClientCalls.asyncBidiStreamingCall(call, CallObserver(callId, this))
          else -> throw RuntimeException("unknown method type in create call")
        }
        result.resolve(callId)
      }
      catch (e: Exception) {
        createCall.result.reject(e)
      }
    }
  }

  fun dispatch(send: Send) {
    executor.submit {
      try {
        val call = activeCalls[send.callId] ?: throw NoSuchCallException(send.callId)
        call.sendMessage(send.messageBase64)
        send.result.resolve(false)
      }
      catch (e: Exception) {
        send.result.reject(e)
      }
    }
  }

  fun dispatch(didReceive: DidReceive) {
    executor.submit {
      val args = Arguments.createMap()
      args.putString("type", "receive");
      args.putString("callId", didReceive.callId)
      args.putString("messageBase64", didReceive.messageBase64)
      emit("grpc-call-event", args)
    }
  }

  fun dispatch(didFail: DidFail) {
    executor.submit {
      val args = Arguments.createMap()
      args.putString("type", "fail");
      args.putString("callId", didFail.callId)
      args.putMap("error", throwableToError(didFail.throwable))
      emit("grpc-call-event", args)
      activeCalls.remove(didFail.callId)
    }
  }

  fun dispatch(didEnd: DidEnd) {
    executor.submit {
      val args = Arguments.createMap()
      args.putString("type", "end");
      args.putString("callId", didEnd.callId)
      emit("grpc-call-event", args)
      activeCalls.remove(didEnd.callId)
    }
  }

  private fun emit(eventName: String, params: WritableMap?) {
    val reactContext = reactApplicationContext
    val cls = DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
    val module = reactContext.getJSModule(cls)
    module.emit(eventName, params)
  }

  private fun getChannel(host: String, port: Int, secure: Boolean): Channel {
    val key = "$host:$port:${if (secure) "(secure)" else "(insecure)"}"
    val channel = channels[key]
    if (null != channel) {
      Log.i(TAG, "Reusing existing channel $key")
      return channel
    }
    Log.i(TAG, "Creating new channel $key")
    var builder = ManagedChannelBuilder.forAddress(host, port)
    builder = if (secure) builder.useTransportSecurity() else builder.usePlaintext()
    val newChannel = builder.build()
    channels[key] = newChannel
    return newChannel
  }
}

private fun throwableToError(throwable: Throwable?): ReadableMap? {
  if (null == throwable)
    return null
  return when (throwable) {
    is StatusRuntimeException -> grpcExceptionToError(throwable)
    is StatusException -> grpcExceptionToError(throwable)
    else -> nativeExceptionToError(throwable)
  }
}

private fun grpcExceptionToError(e: StatusRuntimeException): ReadableMap {
  val error = Arguments.createMap()
  error.putString("kind", "grpc")
  error.putDouble("code", e.status.code.value().toDouble())
  error.putString("status", e.status.toString())
  error.putString("message", recurseCause(e))
  return error;
}

private fun grpcExceptionToError(e: StatusException): ReadableMap {
  val error = Arguments.createMap()
  error.putString("kind", "grpc")
  error.putDouble("code", e.status.code.value().toDouble())
  error.putString("status", e.status.toString())
  error.putString("message", recurseCause(e))
  return error;
}

private fun nativeExceptionToError(e: Throwable): ReadableMap {
  val error = Arguments.createMap()
  error.putString("kind", "native")
  error.putString("message", recurseCause(e))
  val cause = e.cause;
  if (null != cause) error.putMap("error", nativeExceptionToError(cause))
  return error;
}

private fun recurseCause(e: Throwable): String {
  val cause = e.cause;
  return if (null == cause) (e.message ?: "null") else "${e.message}: ${recurseCause(cause)}"
}

@RequiresApi(Build.VERSION_CODES.O)
private fun createMethodDescriptor(fullMethodName: String, methodType: MethodDescriptor.MethodType): MethodDescriptor<String, String> {
  return MethodDescriptor.newBuilder<String, String>()
    .setType(methodType)
    .setFullMethodName(fullMethodName)
    .setSampledToLocalTracing(true)
    .setRequestMarshaller(Base64Marshaller())
    .setResponseMarshaller(Base64Marshaller())
    .build()
}

private fun getMethodType(clientStream: Boolean, serverStream: Boolean): MethodDescriptor.MethodType {
  return if (clientStream)
    if (serverStream)
      MethodDescriptor.MethodType.BIDI_STREAMING
    else
      MethodDescriptor.MethodType.CLIENT_STREAMING
  else if (serverStream)
    MethodDescriptor.MethodType.SERVER_STREAMING
  else
    MethodDescriptor.MethodType.UNARY
}

private fun createCallOptions(): CallOptions {
  return CallOptions.DEFAULT
}


class CallObserver(private val callId: String, private val module: GrpcModule) : StreamObserver<String> {
  override fun onNext(messageBase64: String?) {
    module.dispatch(GrpcModule.DidReceive(callId, messageBase64))
  }

  override fun onError(throwable: Throwable?) {
    module.dispatch(GrpcModule.DidFail(callId, throwable))
  }

  override fun onCompleted() {
    module.dispatch(GrpcModule.DidEnd(callId))
  }
}
