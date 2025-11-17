import Foundation

/**
 * PII (Personally Identifiable Information) detector and redactor.
 */
internal class PiiDetector {
    private static let redactionString = "[REDACTED]"
    
    // Common PII patterns
    private static let emailPattern = try! NSRegularExpression(
        pattern: #"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"#,
        options: .caseInsensitive
    )
    
    private static let phonePattern = try! NSRegularExpression(
        pattern: #"\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b"#,
        options: .caseInsensitive
    )
    
    private static let creditCardPattern = try! NSRegularExpression(
        pattern: #"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b"#,
        options: .caseInsensitive
    )
    
    private static let ssnPattern = try! NSRegularExpression(
        pattern: #"\b\d{3}-\d{2}-\d{4}\b"#,
        options: .caseInsensitive
    )
    
    private static let ipAddressPattern = try! NSRegularExpression(
        pattern: #"\b(?:\d{1,3}\.){3}\d{1,3}\b"#,
        options: .caseInsensitive
    )
    
    /**
     * Detect PII in text.
     */
    static func detectPii(_ text: String) -> [PiiMatch] {
        var matches: [PiiMatch] = []
        
        // Email detection
        emailPattern.enumerateMatches(in: text, range: NSRange(text.startIndex..., in: text)) { match, _, _ in
            if let match = match, let range = Range(match.range, in: text) {
                matches.append(PiiMatch(type: .email, value: String(text[range]), range: match.range))
            }
        }
        
        // Phone detection
        phonePattern.enumerateMatches(in: text, range: NSRange(text.startIndex..., in: text)) { match, _, _ in
            if let match = match, let range = Range(match.range, in: text) {
                matches.append(PiiMatch(type: .phone, value: String(text[range]), range: match.range))
            }
        }
        
        // Credit card detection
        creditCardPattern.enumerateMatches(in: text, range: NSRange(text.startIndex..., in: text)) { match, _, _ in
            if let match = match, let range = Range(match.range, in: text) {
                matches.append(PiiMatch(type: .creditCard, value: String(text[range]), range: match.range))
            }
        }
        
        // SSN detection
        ssnPattern.enumerateMatches(in: text, range: NSRange(text.startIndex..., in: text)) { match, _, _ in
            if let match = match, let range = Range(match.range, in: text) {
                matches.append(PiiMatch(type: .ssn, value: String(text[range]), range: match.range))
            }
        }
        
        // IP address detection
        ipAddressPattern.enumerateMatches(in: text, range: NSRange(text.startIndex..., in: text)) { match, _, _ in
            if let match = match, let range = Range(match.range, in: text) {
                matches.append(PiiMatch(type: .ipAddress, value: String(text[range]), range: match.range))
            }
        }
        
        return matches
    }
    
    /**
     * Redact PII from text.
     */
    static func redactPii(_ text: String) -> String {
        let matches = detectPii(text).sorted { $0.range.location > $1.range.location }
        
        var redactedText = text
        for match in matches {
            if let range = Range(match.range, in: redactedText) {
                redactedText.replaceSubrange(range, with: redactionString)
            }
        }
        
        return redactedText
    }
    
    /**
     * Redact PII from dictionary recursively.
     */
    static func redactFromDictionary(_ data: [String: Any]) -> [String: Any] {
        var result: [String: Any] = [:]
        for (key, value) in data {
            if isPiiKey(key) {
                result[key] = redactionString
            } else {
                switch value {
                case let stringValue as String:
                    result[key] = redactPii(stringValue)
                case let dictValue as [String: Any]:
                    result[key] = redactFromDictionary(dictValue)
                case let arrayValue as [Any]:
                    result[key] = arrayValue.map { item in
                        if let stringItem = item as? String {
                            return redactPii(stringItem)
                        } else if let dictItem = item as? [String: Any] {
                            return redactFromDictionary(dictItem)
                        }
                        return item
                    }
                default:
                    result[key] = value
                }
            }
        }
        return result
    }
    
    /**
     * Check if a key suggests PII.
     */
    private static func isPiiKey(_ key: String) -> Bool {
        let lowerKey = key.lowercased()
        return lowerKey.contains("email") ||
               lowerKey.contains("phone") ||
               lowerKey.contains("ssn") ||
               lowerKey.contains("credit") ||
               lowerKey.contains("card") ||
               lowerKey.contains("password") ||
               lowerKey.contains("token") ||
               lowerKey.contains("secret") ||
               lowerKey.contains("address") ||
               lowerKey.contains("name")
    }
}

struct PiiMatch {
    let type: PiiType
    let value: String
    let range: NSRange
}

enum PiiType {
    case email
    case phone
    case creditCard
    case ssn
    case ipAddress
}

