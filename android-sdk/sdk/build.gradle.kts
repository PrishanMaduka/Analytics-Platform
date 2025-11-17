plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
    id("kotlin-kapt")
    id("maven-publish")
    id("signing")
}

android {
    namespace = "com.adlcom.mxl.sdk"
    compileSdk = 34

    defaultConfig {
        minSdk = 21
        targetSdk = 34

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        consumerProguardFiles("consumer-rules.pro")
        
        buildConfigField("boolean", "DEBUG", "false")
    }

    buildTypes {
        debug {
            buildConfigField("boolean", "DEBUG", "true")
        }
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            buildConfigField("boolean", "DEBUG", "false")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
    
    buildFeatures {
        buildConfig = true
    }
}

dependencies {
    // Core Android
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    
    // Networking
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    
    // JSON
    implementation("com.google.code.gson:gson:2.10.1")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
    
    // WorkManager for background tasks
    implementation("androidx.work:work-runtime-ktx:2.9.0")
    
    // Room for local storage
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")
    
    // OpenTelemetry
    implementation("io.opentelemetry:opentelemetry-api:1.32.0")
    implementation("io.opentelemetry:opentelemetry-sdk:1.32.0")
    implementation("io.opentelemetry:opentelemetry-exporter-otlp:1.32.0")
    
    // Testing
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.mockito:mockito-core:5.7.0")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
    testImplementation("org.robolectric:robolectric:4.11.1")
    testImplementation("androidx.test:core:1.5.0")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
}

// Maven publishing configuration
afterEvaluate {
    publishing {
        publications {
            create<MavenPublication>("release") {
                from(components["release"])
                
                groupId = "com.adlcom.mxl"
                artifactId = "sdk"
                version = "1.0.0"
                
                pom {
                    name.set("MxL Android SDK")
                    description.set("Mobile SDK for ADLcom's Monitoring Experience Layer")
                    url.set("https://github.com/adlcom/mxl-android-sdk")
                    
                    licenses {
                        license {
                            name.set("Proprietary")
                            url.set("https://adlcom.com/license")
                        }
                    }
                    
                    developers {
                        developer {
                            id.set("adlcom")
                            name.set("ADLcom Limited")
                            email.set("mxl-support@adlcom.com")
                        }
                    }
                }
            }
        }
        
        repositories {
            maven {
                name = "MavenCentral"
                url = uri("https://oss.sonatype.org/service/local/staging/deploy/maven2/")
                credentials {
                    username = project.findProperty("ossrhUsername") as String?
                    password = project.findProperty("ossrhPassword") as String?
                }
            }
        }
    }
    
    signing {
        sign(publishing.publications["release"])
    }
}

