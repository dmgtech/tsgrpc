package com.reactnativegrpc

class NoSuchCallException(callId: String) : Exception("No such call: $callId") {
}
