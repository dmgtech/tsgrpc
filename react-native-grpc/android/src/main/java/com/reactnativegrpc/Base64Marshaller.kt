package com.reactnativegrpc

import android.os.Build
import android.util.Base64
import android.util.Base64InputStream
import androidx.annotation.RequiresApi
import io.grpc.MethodDescriptor.Marshaller
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.IOException
import java.io.InputStream
import java.nio.charset.StandardCharsets

class Base64Marshaller @RequiresApi(api = Build.VERSION_CODES.O) constructor() : Marshaller<String> {
  @RequiresApi(api = Build.VERSION_CODES.KITKAT)
  override fun stream(value: String): InputStream {
    val bytes = value.toByteArray(StandardCharsets.US_ASCII)
    return Base64InputStream(ByteArrayInputStream(bytes), Base64.DEFAULT)
  }

  override fun parse(stream: InputStream): String {
    return try {
      val bytes = readAllBytes(stream)
      Base64.encodeToString(bytes, Base64.DEFAULT)
    } catch (e: IOException) {
      ""
    }
  }

  companion object {
    @Throws(IOException::class)
    private fun readAllBytes(inputStream: InputStream): ByteArray {
      val bufLen = 4 * 0x400 // 4KB
      val buf = ByteArray(bufLen)
      var readLen: Int
      var exception: IOException? = null
      try {
        ByteArrayOutputStream().use { outputStream ->
          while (inputStream.read(buf, 0, bufLen).also { readLen = it } != -1) outputStream.write(buf, 0, readLen)
          return outputStream.toByteArray()
        }
      } catch (e: IOException) {
        exception = e
        throw e
      } finally {
        if (exception == null) inputStream.close() else try {
          inputStream.close()
        } catch (e: IOException) {
          exception.addSuppressed(e)
        }
      }
    }
  }
}
