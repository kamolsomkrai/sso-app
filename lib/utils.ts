// lib/utils.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number or string as Thai Baht currency.
 * @param amount The number or string to format.
 * @returns A string formatted as currency (e.g., "฿1,250.00").
 */
export function formatCurrency(amount: number | string): string {
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;

  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  }).format(numericAmount);
}

export function formatNumber(number: number): string {
  return new Intl.NumberFormat("th-TH").format(number);
}
/**
 * Thai Fiscal Year Months (Oct-Sep)
 */
export const THAI_FY_MONTHS = [
  "ต.ค.", // 10
  "พ.ย.", // 11
  "ธ.ค.", // 12
  "ม.ค.", // 1
  "ก.พ.", // 2
  "มี.ค.", // 3
  "เม.ย.", // 4
  "พ.ค.", // 5
  "มิ.ย.", // 6
  "ก.ค.", // 7
  "ส.ค.", // 8
  "ก.ย.", // 9
];
