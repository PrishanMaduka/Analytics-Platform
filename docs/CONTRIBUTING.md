# Contributing to MxL SDK

Thank you for your interest in contributing to the MxL SDK project!

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Write tests
6. Submit a pull request

## Development Setup

### Android SDK

```bash
cd android-sdk
./gradlew build
./gradlew test
```

### iOS SDK

```bash
cd ios-sdk
swift build
swift test
```

### Backend

```bash
cd backend
npm install
npm run dev
npm test
```

### Frontend

```bash
cd frontend
npm install
npm run dev
npm test
```

## Code Style

### Android/Kotlin
- Follow Kotlin coding conventions
- Use ktlint for formatting
- Write meaningful variable names
- Add KDoc comments for public APIs

### iOS/Swift
- Follow Swift API design guidelines
- Use SwiftLint for formatting
- Write meaningful variable names
- Add documentation comments

### TypeScript/JavaScript
- Follow ESLint rules
- Use TypeScript strict mode
- Write meaningful variable names
- Add JSDoc comments

## Testing

- Write tests for new features
- Maintain or improve test coverage
- Run all tests before submitting PR
- Test on multiple devices/platforms

## Pull Request Process

1. Update CHANGELOG.md
2. Update documentation if needed
3. Ensure all tests pass
4. Get code review approval
5. Merge to main branch

## Issue Reporting

When reporting issues, please include:
- Platform and version
- SDK version
- Steps to reproduce
- Expected vs actual behavior
- Logs or error messages

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

