export function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function normalizeNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export function getStaticTextContent(children: unknown): string {
  return typeof children === 'string' ? children : ''
}
