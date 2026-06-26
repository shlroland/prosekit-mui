export type StaticRendererAssetOptions = {
  baseUrl?: string
}

export function resolveAssetUrl(url: unknown, baseUrl?: string): string {
  const value = typeof url === 'string' ? url.trim() : ''

  if (!value || !baseUrl || /^([a-z][a-z\d+\-.]*:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value
  }

  try {
    return new URL(value, baseUrl).toString()
  } catch {
    return value
  }
}
