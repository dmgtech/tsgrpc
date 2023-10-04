import Foundation
import GRPC
import NIO
import SwiftProtobuf

@objc(Grpc)
class Grpc: RCTEventEmitter {
    var activeCalls = [String:Any]()
    var channels = [String:GRPCChannel]()
    lazy var executor: OperationQueue = {
        var queue = OperationQueue()
        queue.maxConcurrentOperationCount = 1
        return queue
    }()
    let group = MultiThreadedEventLoopGroup(numberOfThreads: 1)
    var nextId = 1

    @objc(check:withRejecter:)
    func check(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        executor.addOperation {
            resolve("available")
        }
    }

    @objc(ping:withResolver:withRejecter:)
    func ping(number: Double, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        executor.addOperation {
            let args: [String:String] = [
                "type": "pong",
                "number": String(number)
            ]
            self.emit(eventName: "grpc-call-event", params: args)
            resolve("sent")
        }
    }

    @objc(createCall:withResolver:withRejecter:)
    func createCall(args: [String:Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        let createCall = CreateCall(
            host: args["host"] as? String ?? "",
            port: args["port"] as? Int ?? 8888,
            method: args["method"] as? String ?? "",
            messageBase64: args["messageBase64"] as? String,
            serverSteam: args["serverStream"] as? Bool ?? false,
            secure: args["secure"] as? Bool ?? true,
            resolve: resolve,
            reject: reject
        )
        self.dispatch(createCall: createCall)
    }
    
    @objc(send:withMessageBase64:withResolver:withRejecter:)
    func send(callId: String, messageBase64: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        let send = Send(
            callId: callId,
            messageBase64: messageBase64,
            resolve: resolve,
            reject: reject
        )
        self.dispatch(send: send)
    }
    
    func dispatch(createCall: CreateCall) -> Void {
        executor.addOperation {
            let callId = String(self.nextId)
            self.nextId += 1
            let channel = self.getChannel(host: createCall.host, port: createCall.port, secure: createCall.secure)
            let callType = getCallType(clientStream: createCall.messageBase64 == nil, serverStream: createCall.serverSteam)
            switch (callType) {
            case .unary:
                let unaryCall = channel.makeUnaryCall(
                    path: "/\(createCall.method)",
                    request: Base64Payload(messageBase64: createCall.messageBase64 ?? ""),
                    callOptions: createCallOptions(),
                    interceptors: [CallInterceptor(callId: callId, module: self)]
                )
                self.activeCalls[callId] = unaryCall
            default: break
            }
            createCall.resolve(callId)
        }
    }
    
    func dispatch(didEnd: DidEnd) -> Void {
        executor.addOperation {
            let args: [String:String] = [
                "type": "end",
                "callId": didEnd.callId
            ]
            self.emit(eventName: "grpc-call-event", params: args)
            self.activeCalls[didEnd.callId] = nil
        }
    }
    
    func dispatch(didFail: DidFail) -> Void {
        executor.addOperation {
            let args: [String:Any] = [
                "type": "fail",
                "callId": didFail.callId,
                "error": didFail.error ?? []
            ]
            self.emit(eventName: "grpc-call-event", params: args)
            self.activeCalls[didFail.callId] = nil
        }
    }
    
    func dispatch(didReceive: DidReceive) -> Void {
        executor.addOperation {
            let args: [String:Any] = [
                "type": "receive",
                "callId": didReceive.callId,
                "messageBase64": didReceive.messageBase64 as Any
            ]
            self.emit(eventName: "grpc-call-event", params: args)
        }
    }
    
    func dispatch(send: Send) -> Void {
        executor.addOperation {
            
        }
    }
    
    private func emit(eventName: String, params: [String:Any]) -> Void {
        sendEvent(withName: eventName, body: params)
    }
    
    private func getChannel(host: String, port: Int, secure: Bool) -> GRPCChannel {
        let key = "\(host):\(port):\(secure ? "(secure)" : "(insecure)")"
        if let channel = channels[key] {
            return channel
        }
        let configuration = ClientConnection.Configuration.init(
            target: .hostAndPort(host, port),
            eventLoopGroup: group,
            tls: secure ? ClientConnection.Configuration.TLS() : nil
        )
        let channel = ClientConnection(configuration: configuration)
        channels[key] = channel
        return channel
    }
    
    struct CreateCall {
        var host: String
        var port: Int
        var method: String
        var messageBase64: String?
        var serverSteam: Bool
        var secure: Bool
        var resolve: RCTPromiseResolveBlock
        var reject: RCTPromiseRejectBlock
    }
    
    struct Send {
        var callId: String
        var messageBase64: String
        var resolve: RCTPromiseResolveBlock
        var reject: RCTPromiseRejectBlock
    }
    
    struct DidReceive {
        var callId: String
        var messageBase64: String?
    }
    
    struct DidFail {
        var callId: String
        var error: [String:Any]
    }
    
    struct DidEnd {
        var callId: String
    }

    override static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    override func supportedEvents() -> [String]! {
        return ["grpc-call-event"]
    }
}

private func createCallOptions() -> CallOptions {
    return CallOptions()
}

private func getCallType(clientStream: Bool, serverStream: Bool) -> GRPCCallType {
    if (clientStream && serverStream) {
        return GRPCCallType.bidirectionalStreaming
    }
    if (clientStream) {
        return GRPCCallType.clientStreaming
    }
    if (serverStream) {
        return GRPCCallType.serverStreaming
    }
    return GRPCCallType.unary
}

class CallInterceptor: ClientInterceptor<Base64Payload, Base64Payload> {
    let callId: String
    let module: Grpc

    init(callId: String, module: Grpc) {
        self.callId = callId
        self.module = module
    }
    
    override func receive(_ part: GRPCClientResponsePart<Base64Payload>, context: ClientInterceptorContext<Base64Payload, Base64Payload>) {
        switch part {
        case let .message(response):
            module.dispatch(didReceive: Grpc.DidReceive(callId: callId, messageBase64: response.messageBase64))
        case let .end(status, trailers):
            if (status.isOk) {
                module.dispatch(didEnd: Grpc.DidEnd(callId: callId))
            }
            else {
                let error: [String:Any] = [
                    "kind": "grpc",
                    "code": status.code,
                    "status": trailers.first(name: "status") ?? "",
                    "message": status.message ?? ""
                ]
                module.dispatch(didFail: Grpc.DidFail(callId: callId, error: error))
            }
        default: break
        }
        context.receive(part)
    }
}

struct Base64Payload: GRPCPayload {
  var messageBase64: String

  init(messageBase64: String) {
    self.messageBase64 = messageBase64
  }

  init(serializedByteBuffer: inout ByteBuffer) throws {
    self.messageBase64 = serializedByteBuffer.readData(length: serializedByteBuffer.readableBytes)!.base64EncodedString()
  }

  func serialize(into buffer: inout ByteBuffer) throws {
    buffer.writeData(Data(base64Encoded: self.messageBase64)!)
  }
}
