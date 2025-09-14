/**
 * Checks if a message contains invalid content using rules fetched from the backend
 * @param {string} message The message to validate
 * @param {object} rules The validation rules object { bannedWords, emailRegex, phoneRegex }
 * @returns {boolean} Returns true if the content is INVALID, false otherwise
 */
export function isMessageContentInvalid(message, rules) {
    // If rules haven't been loaded yet, or there's no message, consider it valid
    if (!message || !rules) {
        return false;
    }

    const lowerCaseMessage = message.toLowerCase();

    // Create RegExp objects from the regex strings provided by the backend
    const emailPattern = new RegExp(rules.emailRegex);
    const phonePattern = new RegExp(rules.phoneRegex);

    // Check for banned words from the server
    if (rules.bannedWords.some(bannedWord => lowerCaseMessage.includes(bannedWord.toLowerCase()))) {
        return true;
    }

    // Check for email patterns
    if (emailPattern.test(message)) {
        return true;
    }

    // Check for phone number patterns
    if (phonePattern.test(message)) {
        return true;
    }

    return false;
}