package com.adlcom.mxl.sdk.network

import com.adlcom.mxl.sdk.config.SdkConfiguration
import com.adlcom.mxl.sdk.internal.SdkState
import com.adlcom.mxl.sdk.internal.getSdkState
import com.adlcom.mxl.sdk.logging.Logger
import okhttp3.Interceptor
import okhttp3.Request
import okhttp3.Response
import java.io.IOException

/**
 * Network monitor interceptor for OkHttp.
 */
class NetworkMonitorInterceptor(
    private val configuration: SdkConfiguration
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        if (!configuration.enableNetworkMonitoring) {
            return chain.proceed(chain.request())
        }

        val request = chain.request()
        val requestStartTime = System.currentTimeMillis()

        var response: Response? = null
        var exception: Exception? = null

        try {
            response = chain.proceed(request)
            return response
        } catch (e: IOException) {
            exception = e
            throw e
        } finally {
            val requestEndTime = System.currentTimeMillis()
            val duration = requestEndTime - requestStartTime

            recordNetworkEvent(
                request = request,
                response = response,
                exception = exception,
                duration = duration
            )
        }
    }

    /**
     * Record network event.
     */
    private fun recordNetworkEvent(
        request: Request,
        response: Response?,
        exception: Exception?,
        duration: Long
    ) {
        val sdkState = getSdkState() ?: return

        val requestBodySize = request.body?.contentLength() ?: 0L
        val responseBodySize = response?.body?.contentLength() ?: 0L
        val statusCode = response?.code ?: -1
        val isSuccess = response?.isSuccessful ?: false

        val networkEvent = NetworkEvent(
            sessionId = sdkState.sessionManager.getSessionId() ?: "unknown",
            userId = sdkState.sessionManager.getUserId(),
            url = request.url.toString(),
            method = request.method,
            statusCode = statusCode,
            isSuccess = isSuccess,
            requestSize = requestBodySize,
            responseSize = responseBodySize,
            duration = duration,
            timestamp = System.currentTimeMillis(),
            error = exception?.message,
            headers = request.headers.toMultimap()
        )

        storeNetworkEvent(networkEvent, sdkState)
    }

    /**
     * Store network event.
     */
    private fun storeNetworkEvent(event: NetworkEvent, sdkState: SdkState) {
        kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.IO).launch {
            try {
                sdkState.storageManager.storeEvent(
                    eventType = "network",
                    eventData = event,
                    sessionId = event.sessionId,
                    userId = event.userId
                )
                Logger.d("Network event stored: ${event.method} ${event.url} - ${event.statusCode} (${event.duration}ms)")
            } catch (e: Exception) {
                Logger.e("Error storing network event", e)
            }
        }
    }
}

data class NetworkEvent(
    val sessionId: String,
    val userId: String?,
    val url: String,
    val method: String,
    val statusCode: Int,
    val isSuccess: Boolean,
    val requestSize: Long,
    val responseSize: Long,
    val duration: Long,
    val timestamp: Long,
    val error: String?,
    val headers: Map<String, List<String>>
)

