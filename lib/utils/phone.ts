/**
 * Format Israeli phone number for WhatsApp wa.me links
 *
 * Israeli numbers are typically stored with a leading 0 (e.g., "0555020829")
 * WhatsApp requires international format without the leading 0 (e.g., "972555020829")
 *
 * @param phoneNumber - Israeli phone number (may include spaces, dashes, or other formatting)
 * @returns Formatted number for WhatsApp URL (e.g., "972555020829")
 */
export function formatPhoneForWhatsApp(phoneNumber: string): string {
  // Remove all non-numeric characters
  const digitsOnly = phoneNumber.replace(/[^0-9]/g, '')

  // If number starts with 0, replace it with 972 (Israel country code)
  if (digitsOnly.startsWith('0')) {
    return '972' + digitsOnly.slice(1)
  }

  // If number already starts with 972, return as-is
  if (digitsOnly.startsWith('972')) {
    return digitsOnly
  }

  // If number starts with +972, remove the + and return
  if (phoneNumber.startsWith('+972')) {
    return digitsOnly
  }

  // Default: assume it's a local Israeli number without leading 0, add 972
  return '972' + digitsOnly
}
