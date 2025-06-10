
/**
 * Formats a phone number string into a WhatsApp-compatible international format.
 * Assumes Brazilian phone numbers and adds the '55' country code if not present.
 * Removes all non-numeric characters.
 * 
 * @param phone The phone number string (e.g., "(11) 98765-4321", "11987654321", "5511987654321").
 * @returns The formatted phone number (e.g., "5511987654321") or an empty string if input is invalid.
 */
export function formatPhoneNumberForWhatsApp(phone: string | undefined | null): string {
  if (!phone) {
    return "";
  }

  let numericPhone = phone.replace(/\D/g, ''); // Remove all non-digits

  // Common Brazilian mobile format: 11 digits (DDD + 9 + number)
  // Common Brazilian landline format: 10 digits (DDD + number)
  // If it already starts with 55 and is long enough, assume it's correct
  if (numericPhone.startsWith('55') && numericPhone.length >= 12) { // 55 + DDD (2) + number (8 or 9)
    return numericPhone;
  }

  // If it doesn't start with 55, add it.
  if (!numericPhone.startsWith('55')) {
    // If it has 10 or 11 digits (common for DDD + number), prepend 55
    if (numericPhone.length === 10 || numericPhone.length === 11) {
      numericPhone = `55${numericPhone}`;
    } else {
      // Not a clearly recognizable Brazilian format to prepend 55 to,
      // or too short. Return as is or handle as an error.
      // For this function, we'll return it and let wa.me handle it,
      // or you could return "" to indicate an issue.
      // If it's very short, it's unlikely to be valid.
      if (numericPhone.length < 10) return ""; // Or some error indication
      return numericPhone; // Return as is if it's not a clear case
    }
  }
  
  return numericPhone;
}
