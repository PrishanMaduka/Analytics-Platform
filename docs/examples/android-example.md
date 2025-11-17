# Android SDK Examples

## Complete Integration Example

```kotlin
package com.example.myapp

import android.app.Application
import com.adlcom.mxl.sdk.MxLSdk
import com.adlcom.mxl.sdk.config.SdkConfiguration
import com.adlcom.mxl.sdk.interaction.UserInteractionTracker
import com.adlcom.mxl.sdk.compliance.GdprManager

class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        // Initialize SDK
        val config = SdkConfiguration.Builder()
            .apiKey(BuildConfig.MXL_API_KEY)
            .endpoint("https://api.mxl.adlcom.com")
            .enableCrashReporting(true)
            .enablePerformanceMonitoring(true)
            .enableNetworkMonitoring(true)
            .enableUserTracking(true)
            .samplingRate(1.0f)
            .build()
        
        try {
            MxLSdk.initialize(this, config)
        } catch (e: Exception) {
            // Handle initialization error
            e.printStackTrace()
        }
        
        // Check GDPR consent
        if (!GdprManager.hasConsent(this)) {
            // Show consent dialog
            showConsentDialog()
        }
    }
    
    private fun showConsentDialog() {
        // Show your consent UI
        // On accept: GdprManager.setConsent(this, true)
    }
}
```

## Activity Integration

```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // Track screen view
        UserInteractionTracker.trackScreenView(this)
        
        // Identify user after login
        loginButton.setOnClickListener {
            performLogin { user ->
                val sdkState = getSdkState()
                sdkState?.sessionManager?.identify(
                    user.id,
                    mapOf(
                        "name" to user.name,
                        "email" to user.email
                    )
                )
            }
        }
    }
    
    override fun onResume() {
        super.onResume()
        UserInteractionTracker.trackScreenView(this)
    }
}
```

## Custom Event Tracking

```kotlin
// Track button click
button.setOnClickListener {
    UserInteractionTracker.trackEvent("button_clicked", mapOf(
        "button_id" to "purchase_button",
        "product_id" to product.id,
        "price" to product.price
    ))
}

// Track purchase completion
fun onPurchaseComplete(order: Order) {
    UserInteractionTracker.trackEvent("purchase_completed", mapOf(
        "order_id" to order.id,
        "amount" to order.total,
        "currency" to order.currency,
        "items" to order.items.size
    ))
}
```

## Error Handling

```kotlin
import com.adlcom.mxl.sdk.crash.CrashReporter

fun performRiskyOperation() {
    try {
        // Risky code
    } catch (e: Exception) {
        // Report to MxL
        CrashReporter.reportError(e, mapOf(
            "operation" to "risky_operation",
            "user_id" to currentUserId,
            "timestamp" to System.currentTimeMillis()
        ))
        
        // Handle error
        showErrorDialog(e.message)
    }
}
```

## Performance Monitoring

```kotlin
import com.adlcom.mxl.sdk.performance.PerformanceMonitor

fun measureOperation() {
    val startTime = System.currentTimeMillis()
    
    // Perform operation
    performHeavyOperation()
    
    val duration = System.currentTimeMillis() - startTime
    PerformanceMonitor.reportMetric("heavy_operation_duration", duration.toDouble(), "ms")
}
```

## GDPR Compliance

```kotlin
// Request user consent
fun requestConsent() {
    val dialog = AlertDialog.Builder(this)
        .setTitle("Data Collection Consent")
        .setMessage("We collect usage data to improve our app...")
        .setPositiveButton("Accept") { _, _ ->
            GdprManager.setConsent(this, true)
        }
        .setNegativeButton("Decline") { _, _ ->
            GdprManager.setConsent(this, false)
        }
        .create()
    
    dialog.show()
}

// Export user data
fun exportUserData(userId: String) {
    GdprManager.exportUserData(userId) { json ->
        if (json != null) {
            // Save or send JSON to user
            saveToFile(json)
        }
    }
}

// Delete user data
fun deleteUserData(userId: String) {
    GdprManager.deleteUserData(userId) { success ->
        if (success) {
            showMessage("Your data has been deleted")
        }
    }
}
```

