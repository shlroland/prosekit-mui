const shortcutAliases: Record<string, string> = {
  ctrl: 'Ctrl',
  cmd: 'Cmd',
  command: 'Cmd',
  shift: 'Shift',
  alt: 'Alt',
  option: 'Option',
  enter: 'Enter',
  esc: 'Esc',
}

export function getShortcutKeyText(shortcutKey: string[] = []) {
  return shortcutKey
    .map((key) => shortcutAliases[key.toLowerCase()] ?? key.toUpperCase())
    .join(' + ')
}
