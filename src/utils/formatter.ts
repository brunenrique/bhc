
/**
 * Formats a phone number string into a WhatsApp-compatible international format (E.164 like).
 * Primarily targets Brazilian phone numbers by adding the '55' country code if not present
 * and ensuring it's numeric.
 * 
 * @param phone The phone number string (e.g., "(11) 98765-4321", "11987654321", "5511987654321").
 * @returns The formatted phone number (e.g., "+5511987654321") or an empty string if input is invalid/unclear.
 */
export function formatPhoneNumberToE164(phone: string | undefined | null): string {
  if (!phone) {
    return "";
  }

  let numericPhone = phone.replace(/\D/g, ''); // Remove all non-digits

  // Check if it already starts with country code (e.g., 55 for Brazil)
  if (numericPhone.startsWith('55') && (numericPhone.length === 12 || numericPhone.length === 13)) { // 55 + DDD (2) + num (8 ou 9)
    return `+${numericPhone}`;
  }

  // Common Brazilian formats without country code:
  // DDD (2) + 9 (mobile identifier) + number (8) = 11 digits
  // DDD (2) + number (8) = 10 digits (less common for WhatsApp but possible for landlines)
  if (numericPhone.length === 10 || numericPhone.length === 11) {
    return `+55${numericPhone}`;
  }
  
  // If it doesn't match common Brazilian patterns or already has a '+'
  // (but not a valid one we recognized), we return it as is if it starts with '+',
  // or try to prepend '+' if it looks like an international number missing it.
  // This part is heuristic. For robust E.164, a library is better.
  if (phone.startsWith('+') && numericPhone.length > 7) { // Already has '+', assume it might be E.164
    return `+${numericPhone}`; // Ensure only one '+'
  }
  
  // If it's a long number without '+' and not starting with 55, it's hard to guess the country code.
  // For this app, we'll assume if it's not Brazilian, it's not what we expect for 'contato'.
  return ""; // Return empty if cannot be confidently formatted to +55...
}

/**
 * Formats a phone number string into a WhatsApp-compatible international format.
 * Assumes Brazilian phone numbers and adds the '55' country code if not present.
 * Removes all non-numeric characters. This version does NOT add the '+'.
 * 
 * @param phone The phone number string (e.g., "(11) 98765-4321", "11987654321", "5511987654321").
 * @returns The formatted phone number (e.g., "5511987654321") or an empty string if input is invalid.
 */
export function formatPhoneNumberForWhatsApp(phone: string | undefined | null): string {
  const e164 = formatPhoneNumberToE164(phone);
  return e164.startsWith('+') ? e164.substring(1) : e164;
}

/**
 * Validates if a phone number string is potentially a valid Brazilian number
 * that can be formatted to E.164.
 * Checks for 10 or 11 digits after cleaning, or if it's already in a 55+... format.
 * @param phone The phone number string.
 * @returns True if potentially valid, false otherwise.
 */
export function isValidBrazilianPhoneNumber(phone: string | undefined | null): boolean {
    if (!phone) return false;
    const numericPhone = phone.replace(/\D/g, '');
    if (numericPhone.startsWith('55') && (numericPhone.length === 12 || numericPhone.length === 13)) {
        return true;
    }
    if (numericPhone.length === 10 || numericPhone.length === 11) {
        return true;
    }
    return false;
}
