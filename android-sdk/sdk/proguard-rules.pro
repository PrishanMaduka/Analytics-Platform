# Keep SDK classes
-keep class com.adlcom.mxl.sdk.** { *; }

# Keep data classes
-keepclassmembers class com.adlcom.mxl.sdk.** {
    *;
}

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**

# Gson
-keepattributes Signature
-keepattributes *Annotation*
-keep class sun.misc.Unsafe { *; }
-keep class com.google.gson.** { *; }

