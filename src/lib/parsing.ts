export function parseToString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value
  }
  return
}

export function parseToNumber(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return value
  }
  return
}

export function parseToObject(value: unknown): object | null {
  if (typeof value === 'object') {
    return value
  }
  return null
}
