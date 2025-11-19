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
export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return "฿0.00";

  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompactNumber(number: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  }).format(number);
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

/**
 * Calculates the Thai fiscal year and month from a Date object.
 * Thai FY starts in October (month 9).
 * @param date The input Date object
 * @returns { fiscalYear: number, month: number }
 */
export const getFiscalYearAndMonth = (date: Date) => {
  const month = date.getMonth(); // 0-11 (Jan=0, Dec=11)
  const year = date.getFullYear();

  // Fiscal month is 1-12
  const fiscalMonth = month + 1;

  // October (9) is the start of the new fiscal year (e.g., Oct 2023 is FY 2024)
  // Thai year (BE) = AD + 543
  const fiscalYear = month >= 9 ? year + 543 + 1 : year + 543;

  return { fiscalYear: fiscalYear, month: fiscalMonth };
};

export function getCurrentFiscalYear() {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const year = now.getFullYear() + 543; // Buddhist Era

  // If month is October (9), November (10), or December (11)
  if (month >= 9) {
    return year + 1;
  }
  return year;
}
