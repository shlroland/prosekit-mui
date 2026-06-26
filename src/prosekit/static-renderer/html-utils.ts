export function escapeHTML(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function escapeAttribute(value: unknown): string {
  return escapeHTML(value)
}

export function joinHTML(children: string | string[]): string {
  return Array.isArray(children) ? children.join('') : children
}

export function attribute(name: string, value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  return ` ${name}="${escapeAttribute(value)}"`
}

export function styleAttribute(styles: Record<string, string | number | null | undefined>): string {
  const value = Object.entries(styles)
    .filter(([, styleValue]) => styleValue !== null && styleValue !== undefined && styleValue !== '')
    .map(([name, styleValue]) => `${name}: ${styleValue}`)
    .join('; ')

  return value ? attribute('style', `${value};`) : ''
}
