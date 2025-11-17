# API Key Management Guide

## What is an API Key?

The API key (`your-api-key`) is a **unique authentication token** that identifies and authorizes your application to send telemetry data to the MxL backend API. It acts as a credential that:

- Authenticates your mobile app with the backend service
- Associates telemetry data with your specific application/project
- Enables access control and rate limiting
- Tracks usage and billing (if applicable)

## How It Works

### In the SDK

The API key is configured when initializing the SDK:

**Android:**
```kotlin
MxLSdk.initialize(context, SdkConfiguration.Builder()
    .apiKey("your-actual-api-key-here")  // Replace with your real API key
    .endpoint("https://api.mxl.adlcom.com")
    .build())
```

**iOS:**
```swift
try MxLSdk.initialize(configuration: SdkConfiguration(
    apiKey: "your-actual-api-key-here",  // Replace with your real API key
    endpoint: "https://api.mxl.adlcom.com"
))
```

### In API Requests

The SDK automatically includes the API key in the `Authorization` header of all HTTP requests:

```
Authorization: Bearer your-api-key
```

The backend validates this key before processing any telemetry data.

## How to Obtain an API Key

1. **Contact ADLcom Support**
   - Email: `mxl-support@adlcom.com`
   - Request an API key for your application
   - Provide your application details (name, platform, expected usage)

2. **Through Admin Dashboard** (if available)
   - Log into the MxL dashboard
   - Navigate to Settings → API Keys
   - Generate a new API key for your project

3. **Via Backend API** (for administrators)
   - Use the admin API to create API keys programmatically

## Best Practices for Managing API Keys

### 1. **Never Hardcode API Keys in Source Code**

❌ **BAD:**
```kotlin
// DON'T DO THIS!
.apiKey("sk_live_abc123xyz789")
```

✅ **GOOD - Use Build Configuration:**

**Android (`build.gradle.kts` or `local.properties`):**
```kotlin
// In build.gradle.kts
android {
    defaultConfig {
        buildConfigField("String", "MXL_API_KEY", "\"${project.findProperty("mxlApiKey") ?: ""}\"")
    }
}

// In local.properties (add to .gitignore)
mxlApiKey=sk_live_your_actual_key_here

// In your Application class
.apiKey(BuildConfig.MXL_API_KEY)
```

**iOS (`Info.plist` or environment variables):**
```swift
// In Info.plist (add to .gitignore or use secure storage)
let apiKey = Bundle.main.infoDictionary?["MXL_API_KEY"] as? String ?? ""

// Or use environment variables
let apiKey = ProcessInfo.processInfo.environment["MXL_API_KEY"] ?? ""
```

### 2. **Use Different Keys for Different Environments**

- **Development/Staging**: Use a test API key
- **Production**: Use a production API key
- **CI/CD**: Use environment-specific keys

**Android Example:**
```kotlin
val apiKey = when {
    BuildConfig.DEBUG -> BuildConfig.MXL_API_KEY_STAGING
    else -> BuildConfig.MXL_API_KEY_PRODUCTION
}
```

**iOS Example:**
```swift
#if DEBUG
let apiKey = "sk_test_..."
#else
let apiKey = "sk_live_..."
#endif
```

### 3. **Store Keys Securely**

**Options (in order of security):**

1. **Android Keystore / iOS Keychain** (Most Secure)
   - Store encrypted keys in platform keychains
   - Requires user authentication to access

2. **Environment Variables** (Good for CI/CD)
   ```bash
   export MXL_API_KEY=sk_live_...
   ```

3. **Build Configuration Files** (Acceptable)
   - Use `local.properties` (Android) or `.xcconfig` (iOS)
   - **Always add to `.gitignore`**

4. **Remote Configuration** (Advanced)
   - Fetch API key from secure remote config service
   - Rotate keys without app updates

### 4. **Rotate Keys Regularly**

- Generate new keys periodically
- Revoke old keys that are no longer needed
- Update keys in all environments simultaneously

### 5. **Monitor Key Usage**

- Track which keys are being used
- Set up alerts for unusual activity
- Review access logs regularly

## Security Considerations

### ⚠️ Important Security Rules

1. **Never commit API keys to version control**
   - Add to `.gitignore`:
     ```
     local.properties
     *.xcconfig
     .env
     ```

2. **Use different keys per environment**
   - Prevents production keys from being used in development

3. **Implement key rotation**
   - Change keys if they're compromised
   - Have a process to update keys across all apps

4. **Restrict key permissions**
   - Use keys with minimal required permissions
   - Revoke unused keys immediately

5. **Monitor for leaks**
   - Use tools like GitGuardian or GitHub secret scanning
   - Regularly audit where keys are stored

## API Key Format

API keys typically follow this format:
```
sk_live_<random-string>
sk_test_<random-string>
```

Where:
- `sk_` = secret key prefix
- `live`/`test` = environment indicator
- `<random-string>` = cryptographically secure random string

## Troubleshooting

### "Invalid API Key" Error

1. **Check the key is correct**
   - Verify no extra spaces or characters
   - Ensure you're using the right key for the environment

2. **Verify key is active**
   - Check if the key has been revoked
   - Confirm the key hasn't expired

3. **Check endpoint matches**
   - Staging keys work with staging endpoints
   - Production keys work with production endpoints

### "Unauthorized" Error (401)

- API key is missing or invalid
- Key has been revoked
- Wrong key for the environment

### Rate Limiting (429)

- Too many requests with the same key
- Consider using multiple keys for high-traffic apps
- Implement exponential backoff

## Example: Complete Setup

### Android Setup

1. **Create `local.properties`** (in project root, add to `.gitignore`):
   ```properties
   mxlApiKey=sk_live_your_key_here
   mxlApiKeyStaging=sk_test_your_key_here
   ```

2. **Update `build.gradle.kts`**:
   ```kotlin
   android {
       defaultConfig {
           val apiKey = project.findProperty("mxlApiKey") as String? ?: ""
           val apiKeyStaging = project.findProperty("mxlApiKeyStaging") as String? ?: ""
           
           buildConfigField("String", "MXL_API_KEY", "\"$apiKey\"")
           buildConfigField("String", "MXL_API_KEY_STAGING", "\"$apiKeyStaging\"")
       }
   }
   ```

3. **Use in Application class**:
   ```kotlin
   val apiKey = if (BuildConfig.DEBUG) {
       BuildConfig.MXL_API_KEY_STAGING
   } else {
       BuildConfig.MXL_API_KEY
   }
   
   MxLSdk.initialize(this, SdkConfiguration.Builder()
       .apiKey(apiKey)
       .endpoint("https://api.mxl.adlcom.com")
       .build())
   ```

### iOS Setup

1. **Create `Config.xcconfig`** (add to `.gitignore`):
   ```xcconfig
   MXL_API_KEY = sk_live_your_key_here
   MXL_API_KEY_STAGING = sk_test_your_key_here
   ```

2. **Add to Build Settings**:
   - Add `Config.xcconfig` to your target's build settings
   - Reference in `Info.plist` or code

3. **Use in AppDelegate**:
   ```swift
   #if DEBUG
   let apiKey = Bundle.main.infoDictionary?["MXL_API_KEY_STAGING"] as? String ?? ""
   #else
   let apiKey = Bundle.main.infoDictionary?["MXL_API_KEY"] as? String ?? ""
   #endif
   
   try MxLSdk.initialize(configuration: SdkConfiguration(
       apiKey: apiKey,
       endpoint: "https://api.mxl.adlcom.com"
   ))
   ```

## Support

For API key issues:
- **Email**: mxl-support@adlcom.com
- **Documentation**: https://docs.mxl.adlcom.com
- **GitHub Issues**: https://github.com/adlcom/mxl-sdk

