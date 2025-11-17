# iOS SDK Examples

## Complete Integration Example

```swift
import UIKit
import MxLSdk

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, 
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // Initialize SDK
        let config = SdkConfiguration(
            apiKey: Bundle.main.infoDictionary?["MXL_API_KEY"] as? String ?? "",
            endpoint: "https://api.mxl.adlcom.com",
            enableCrashReporting: true,
            enablePerformanceMonitoring: true,
            enableNetworkMonitoring: true,
            enableUserTracking: true,
            samplingRate: 1.0
        )
        
        do {
            try MxLSdk.initialize(configuration: config)
        } catch {
            print("Failed to initialize MxL SDK: \(error)")
        }
        
        // Check GDPR consent
        if !GdprManager.hasConsent() {
            showConsentDialog()
        }
        
        return true
    }
    
    private func showConsentDialog() {
        // Show your consent UI
        // On accept: GdprManager.setConsent(true)
    }
}
```

## View Controller Integration

```swift
import UIKit
import MxLSdk

class MainViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Track screen view
        UserInteractionTracker.trackScreenView(self)
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        UserInteractionTracker.trackScreenView(self)
    }
    
    @IBAction func loginButtonTapped(_ sender: UIButton) {
        performLogin { user in
            // Identify user after login
            let sdkState = MxLSdk.getSdkState()
            sdkState?.sessionManager.identify(
                userId: user.id,
                attributes: [
                    "name": user.name,
                    "email": user.email
                ]
            )
        }
    }
}
```

## Custom Event Tracking

```swift
// Track button tap
@IBAction func purchaseButtonTapped(_ sender: UIButton) {
    UserInteractionTracker.trackEvent("button_clicked", properties: [
        "button_id": "purchase_button",
        "product_id": product.id,
        "price": product.price
    ])
}

// Track purchase completion
func onPurchaseComplete(order: Order) {
    UserInteractionTracker.trackEvent("purchase_completed", properties: [
        "order_id": order.id,
        "amount": order.total,
        "currency": order.currency,
        "items": order.items.count
    ])
}
```

## Error Handling

```swift
import MxLSdk

func performRiskyOperation() {
    do {
        // Risky code
        try riskyCode()
    } catch {
        // Report to MxL
        CrashReporter.reportError(error, context: [
            "operation": "risky_operation",
            "user_id": currentUserId,
            "timestamp": Date().timeIntervalSince1970
        ])
        
        // Handle error
        showErrorAlert(message: error.localizedDescription)
    }
}
```

## Performance Monitoring

```swift
import MxLSdk

func measureOperation() {
    let startTime = Date()
    
    // Perform operation
    performHeavyOperation()
    
    let duration = Date().timeIntervalSince(startTime) * 1000 // Convert to ms
    PerformanceMonitor.reportMetric("heavy_operation_duration", value: duration, unit: "ms")
}
```

## GDPR Compliance

```swift
// Request user consent
func requestConsent() {
    let alert = UIAlertController(
        title: "Data Collection Consent",
        message: "We collect usage data to improve our app...",
        preferredStyle: .alert
    )
    
    alert.addAction(UIAlertAction(title: "Accept", style: .default) { _ in
        GdprManager.setConsent(true)
    })
    
    alert.addAction(UIAlertAction(title: "Decline", style: .cancel) { _ in
        GdprManager.setConsent(false)
    })
    
    present(alert, animated: true)
}

// Export user data
func exportUserData(userId: String) {
    Task {
        if let json = await GdprManager.exportUserData(userId: userId) {
            // Save or send JSON to user
            saveToFile(json)
        }
    }
}

// Delete user data
func deleteUserData(userId: String) {
    Task {
        let success = await GdprManager.deleteUserData(userId: userId)
        if success {
            showMessage("Your data has been deleted")
        }
    }
}
```

