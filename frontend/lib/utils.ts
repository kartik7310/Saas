import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPrice = (price: number | string) => {
  const value = Number(price);
  if (!value || isNaN(value)) return "Price on Request";

  if (value >= 10000000) {
    const cr = value / 10000000;
    return `₹${Number(cr.toFixed(2))} Cr`;
  } else if (value >= 100000) {
    const l = value / 100000;
    return `₹${Number(l.toFixed(2))} Lakh`;
  }
  return `₹${value.toLocaleString('en-IN')}`;
};


