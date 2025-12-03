import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const STATUS_LABELS: Record<string, string> = {
  planning: '准备做',
  in_progress: '正在做',
  completed: '做完了',
  abandoned: '放弃了',
}

export const STATUS_COLORS: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  planning: 'default',
  in_progress: 'primary',
  completed: 'success',
  abandoned: 'danger',
}

