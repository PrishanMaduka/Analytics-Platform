// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "MxLSdk",
    platforms: [
        .iOS(.v12)
    ],
    products: [
        .library(
            name: "MxLSdk",
            targets: ["MxLSdk"]
        ),
    ],
    dependencies: [
        .package(url: "https://github.com/apple/swift-log.git", from: "1.5.0"),
        .package(url: "https://github.com/apple/swift-crypto.git", from: "2.6.0"),
    ],
    targets: [
        .target(
            name: "MxLSdk",
            dependencies: [
                .product(name: "Logging", package: "swift-log"),
                .product(name: "Crypto", package: "swift-crypto"),
            ]
        ),
        .testTarget(
            name: "MxLSdkTests",
            dependencies: ["MxLSdk"]
        ),
    ]
)

