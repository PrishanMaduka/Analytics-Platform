package com.adlcom.mxl.sdk.tracing

import com.adlcom.mxl.sdk.config.SdkConfiguration
import com.adlcom.mxl.sdk.internal.SdkState
import com.adlcom.mxl.sdk.internal.getSdkState
import com.adlcom.mxl.sdk.logging.Logger
import io.opentelemetry.api.OpenTelemetry
import io.opentelemetry.api.trace.Span
import io.opentelemetry.api.trace.SpanKind
import io.opentelemetry.api.trace.Tracer
import io.opentelemetry.api.trace.propagation.W3CTraceContextPropagator
import io.opentelemetry.context.Context
import io.opentelemetry.context.propagation.ContextPropagators
import io.opentelemetry.sdk.OpenTelemetrySdk
import io.opentelemetry.sdk.trace.SdkTracerProvider

/**
 * Distributed tracing manager using OpenTelemetry.
 */
class TracingManager private constructor(
    private val configuration: SdkConfiguration,
    private val tracer: Tracer
) {
    companion object {
        fun create(configuration: SdkConfiguration): TracingManager? {
            if (!configuration.enableDistributedTracing) {
                return null
            }

            try {
                val sdk = OpenTelemetrySdk.builder()
                    .setTracerProvider(SdkTracerProvider.builder().build())
                    .setPropagators(
                        ContextPropagators.create(W3CTraceContextPropagator.getInstance())
                    )
                    .build()

                val tracer = sdk.getTracer("com.adlcom.mxl.sdk")

                return TracingManager(configuration, tracer)
            } catch (e: Exception) {
                Logger.e("Error initializing tracing", e)
                return null
            }
        }
    }

    /**
     * Start a new span.
     */
    fun startSpan(name: String, kind: SpanKind = SpanKind.INTERNAL): Span {
        return tracer.spanBuilder(name)
            .setSpanKind(kind)
            .startSpan()
    }

    /**
     * Get current span.
     */
    fun getCurrentSpan(): Span? {
        return Span.current()
    }

    /**
     * Add attribute to current span.
     */
    fun addAttribute(key: String, value: String) {
        Span.current().setAttribute(key, value)
    }

    /**
     * Add event to current span.
     */
    fun addEvent(name: String) {
        Span.current().addEvent(name)
    }

    /**
     * End current span.
     */
    fun endSpan(span: Span) {
        span.end()
    }

    /**
     * Get trace context for propagation.
     */
    fun getTraceContext(): Map<String, String> {
        val context = Context.current()
        val headers = mutableMapOf<String, String>()
        
        // Extract trace context for HTTP headers using W3C Trace Context
        val propagator = W3CTraceContextPropagator.getInstance()
        propagator.inject(
            context,
            headers,
            object : io.opentelemetry.context.propagation.TextMapSetter<MutableMap<String, String>> {
                override fun set(carrier: MutableMap<String, String>, key: String, value: String) {
                    carrier[key] = value
                }
            }
        )
        
        return headers
    }
    
    /**
     * Extract trace context from headers.
     */
    fun extractTraceContext(headers: Map<String, String>): Context {
        val propagator = W3CTraceContextPropagator.getInstance()
        return propagator.extract(
            Context.current(),
            headers,
            object : io.opentelemetry.context.propagation.TextMapGetter<Map<String, String>> {
                override fun keys(carrier: Map<String, String>): Iterable<String> {
                    return carrier.keys
                }
                
                override fun get(carrier: Map<String, String>, key: String): String? {
                    return carrier[key]
                }
            }
        )
    }
}

