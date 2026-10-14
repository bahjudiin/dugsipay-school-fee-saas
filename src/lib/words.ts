const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigits(n: number): string {
  return n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]}${n % 10 ? "-" + ONES[n % 10] : ""}`;
}

function threeDigits(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  return `${h ? ONES[h] + " Hundred" : ""}${h && rest ? " " : ""}${rest ? twoDigits(rest) : ""}`.trim();
}

/** 1234.5 -> "One Thousand Two Hundred Thirty-Four" */
export function amountInWords(amount: number): string {
  const n = Math.floor(Math.abs(amount));
  if (n === 0) return "Zero";
  const parts: string[] = [];
  const scales: [number, string][] = [
    [1_000_000_000, "Billion"],
    [1_000_000, "Million"],
    [1_000, "Thousand"],
    [1, ""],
  ];
  let rem = n;
  for (const [scale, label] of scales) {
    if (rem >= scale) {
      const chunk = Math.floor(rem / scale);
      rem %= scale;
      parts.push(`${threeDigits(chunk)}${label ? " " + label : ""}`);
    }
  }
  return parts.join(" ");
}
