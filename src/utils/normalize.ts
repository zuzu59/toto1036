export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeEmail(value: string): string {
  return normalizeText(value).replace(/\s+/g, '')
}

export function normalizePhone(value: string): string {
  return value.replace(/[^\d+]/g, '')
}
