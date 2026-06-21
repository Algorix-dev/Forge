import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId() {
  return crypto.randomUUID()
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function daysUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function calcForgeScore(commitments: { status: string }[], debriefs: unknown[]) {
  if (!commitments.length) return 0
  const completed = commitments.filter((c) => c.status === 'completed').length
  const total = commitments.filter((c) => c.status !== 'active').length
  if (!total) return 0
  const followThrough = Math.round((completed / total) * 100)
  const debriefBonus = Math.min(debriefs.length * 2, 20)
  return Math.min(followThrough + debriefBonus, 100)
}
