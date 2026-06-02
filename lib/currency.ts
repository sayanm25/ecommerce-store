/**
 * Format a numeric amount (in rupees) as an Indian-locale INR string,
 * e.g. 3999 -> "₹3,999". Prices are whole rupees, so no decimals.
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
