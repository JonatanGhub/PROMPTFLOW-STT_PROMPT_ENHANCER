import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncate(str: string, maxLen: number): string {
  return str.length <= maxLen ? str : str.slice(0, maxLen - 3) + '...'
}

export function formatCost(usd: number): string {
  if (usd < 0.001) return '<$0.001'
  return `$${usd.toFixed(3)}`
}
