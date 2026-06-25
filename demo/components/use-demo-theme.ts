import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'

export type DemoTheme = 'light' | 'dark'

const darkThemeMediaQuery = '(prefers-color-scheme: dark)'

export const lightThemeStyle = {
  '--radius': '0.25rem',
  '--background': 'oklch(1 0 0)',
  '--foreground': 'oklch(0 0 0 / 0.87)',
  '--card': 'oklch(1 0 0)',
  '--card-foreground': 'oklch(0 0 0 / 0.87)',
  '--popover': 'oklch(1 0 0)',
  '--popover-foreground': 'oklch(0 0 0 / 0.87)',
  '--primary': 'oklch(0.565 0.163 253.3)',
  '--primary-foreground': 'oklch(1 0 0)',
  '--secondary': 'oklch(0.517 0.215 321.2)',
  '--secondary-foreground': 'oklch(1 0 0)',
  '--muted': 'oklch(0.97 0 0)',
  '--muted-foreground': 'oklch(0 0 0 / 0.6)',
  '--accent': 'oklch(0.565 0.163 253.3 / 0.08)',
  '--accent-foreground': 'oklch(0.565 0.163 253.3)',
  '--destructive': 'oklch(0.568 0.2 26.4)',
  '--destructive-foreground': 'oklch(1 0 0)',
  '--border': 'oklch(0 0 0 / 0.12)',
  '--input': 'oklch(0 0 0 / 0.23)',
  '--ring': 'oklch(0.565 0.163 253.3)',
  '--sand-50': '#fcfaf5',
  '--sand-100': '#f5efe4',
  '--clay-500': '#b85c38',
  '--ink-950': '#171717',
  '--moss-700': '#2f5d50',
  '--editor-background': 'var(--background)',
  '--editor-surface': 'var(--popover)',
  '--editor-surface-muted': 'oklch(0.985 0 0)',
  '--editor-foreground': 'var(--foreground)',
  '--editor-muted-foreground': 'var(--muted-foreground)',
  '--editor-border': 'var(--border)',
  '--editor-muted': 'var(--muted)',
  '--editor-primary': 'var(--primary)',
  '--editor-primary-hover': 'oklch(0.51 0.163 253.3)',
  '--editor-primary-soft': 'var(--accent)',
  '--editor-ring': 'var(--ring)',
  '--pk-editor-bg': 'var(--background)',
  '--pk-editor-fg': 'var(--foreground)',
  '--pk-editor-placeholder': 'oklch(0 0 0 / 0.38)',
  '--pk-editor-selection': 'oklch(0.565 0.163 253.3 / 0.18)',
  '--pk-editor-toolbar-bg': 'var(--background)',
  '--pk-editor-toolbar-border': 'var(--border)',
  '--pk-editor-code-bg': 'var(--muted)',
  background: 'radial-gradient(circle at top left, rgb(184 92 56 / 0.14), transparent 28rem), radial-gradient(circle at bottom right, rgb(47 93 80 / 0.14), transparent 26rem), linear-gradient(180deg, var(--sand-50) 0%, var(--sand-100) 100%)',
  color: 'var(--ink-950)',
} satisfies CSSProperties

export const darkThemeStyle = {
  '--radius': '0.25rem',
  '--background': 'oklch(0.182 0 0)',
  '--foreground': 'oklch(1 0 0)',
  '--card': 'oklch(0.235 0 0)',
  '--card-foreground': 'oklch(1 0 0)',
  '--popover': 'oklch(0.235 0 0)',
  '--popover-foreground': 'oklch(1 0 0)',
  '--primary': 'oklch(0.816 0.09 243.6)',
  '--primary-foreground': 'oklch(0 0 0 / 0.87)',
  '--secondary': 'oklch(0.744 0.116 321.6)',
  '--secondary-foreground': 'oklch(0 0 0 / 0.87)',
  '--muted': 'oklch(1 0 0 / 0.08)',
  '--muted-foreground': 'oklch(1 0 0 / 0.7)',
  '--accent': 'oklch(0.816 0.09 243.6 / 0.12)',
  '--accent-foreground': 'oklch(0.816 0.09 243.6)',
  '--destructive': 'oklch(0.643 0.215 28.8)',
  '--destructive-foreground': 'oklch(1 0 0)',
  '--border': 'oklch(1 0 0 / 0.12)',
  '--input': 'oklch(1 0 0 / 0.23)',
  '--ring': 'oklch(0.816 0.09 243.6)',
  '--sand-50': '#0f1218',
  '--sand-100': '#171b22',
  '--clay-500': '#d8845f',
  '--ink-950': '#f5f7fa',
  '--moss-700': '#7fb0a2',
  '--editor-background': 'var(--background)',
  '--editor-surface': 'var(--popover)',
  '--editor-surface-muted': 'oklch(0.24 0 0)',
  '--editor-foreground': 'var(--foreground)',
  '--editor-muted-foreground': 'var(--muted-foreground)',
  '--editor-border': 'var(--border)',
  '--editor-muted': 'var(--muted)',
  '--editor-primary': 'var(--primary)',
  '--editor-primary-hover': 'oklch(0.86 0.09 243.6)',
  '--editor-primary-soft': 'var(--accent)',
  '--editor-ring': 'var(--ring)',
  '--pk-editor-bg': 'var(--background)',
  '--pk-editor-fg': 'var(--foreground)',
  '--pk-editor-placeholder': 'oklch(1 0 0 / 0.5)',
  '--pk-editor-selection': 'oklch(0.816 0.09 243.6 / 0.24)',
  '--pk-editor-toolbar-bg': 'var(--background)',
  '--pk-editor-toolbar-border': 'var(--border)',
  '--pk-editor-code-bg': 'var(--muted)',
  background: 'radial-gradient(circle at top left, rgb(216 132 95 / 0.14), transparent 28rem), radial-gradient(circle at bottom right, rgb(127 176 162 / 0.12), transparent 26rem), linear-gradient(180deg, var(--sand-50) 0%, var(--sand-100) 100%)',
  color: 'var(--foreground)',
} satisfies CSSProperties

export function getSystemDemoTheme(): DemoTheme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light'
  }

  return window.matchMedia(darkThemeMediaQuery).matches ? 'dark' : 'light'
}

export function getDemoThemeStyle(theme: DemoTheme): CSSProperties {
  return theme === 'dark' ? darkThemeStyle : lightThemeStyle
}

export function useDemoTheme(): DemoTheme {
  const [theme, setTheme] = useState<DemoTheme>(getSystemDemoTheme)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    const mediaQueryList = window.matchMedia(darkThemeMediaQuery)
    const updateTheme = () => {
      setTheme(mediaQueryList.matches ? 'dark' : 'light')
    }

    updateTheme()
    mediaQueryList.addEventListener('change', updateTheme)

    return () => {
      mediaQueryList.removeEventListener('change', updateTheme)
    }
  }, [])

  return theme
}
