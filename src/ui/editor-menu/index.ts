/**
 * Editor menu primitives.
 *
 * Use these exports instead of importing Base UI Menu directly in editor
 * features. The wrappers keep the editor surface style, z-index, portal
 * behavior, and interaction boundaries consistent across toolbar dropdowns,
 * block handles, table handles, slash commands, and code-block controls.
 *
 * Selection guide:
 * - `EditorDropdownMenu`: a menu with its own visible trigger button.
 * - `EditorAnchoredMenu`: a menu positioned against an external element or
 *   virtual anchor owned by editor state.
 * - `EditorMenuSurface` and button helpers: menu content inside an existing
 *   floating container, without creating another Base UI menu root.
 * - `EditorComboboxMenu`: searchable single-choice menus, such as language
 *   pickers or dense option lists.
 * - `EditorSlashMenu`: visual content for ProseKit autocomplete slash menus;
 *   ProseKit owns the floating positioner and keyboard selection.
 */
export {
  EditorAnchoredMenu,
  EditorAnchoredMenuDivider,
  EditorAnchoredMenuItem,
  EditorAnchoredMenuQuickAction,
  EditorAnchoredMenuSectionLabel,
  EditorAnchoredMenuSubmenu,
  type EditorAnchoredMenuProps,
} from './anchored-menu'
export {
  editorMenuIconClassName,
  editorMenuItemClassName,
  editorMenuQuickActionClassName,
  editorMenuSubmenuTriggerClassName,
  editorMenuSurfaceClassName,
} from './classes'
export {
  EditorMenuCountBadge,
  EditorMenuDivider,
  EditorMenuItemButton,
  EditorMenuQuickAction,
  EditorMenuSectionLabel,
  EditorMenuSubmenuTriggerButton,
  EditorMenuSurface,
  type EditorMenuItemButtonProps,
  type EditorMenuSubmenuTriggerButtonProps,
  type EditorMenuSurfaceProps,
} from './content'
export {
  EditorDropdownMenu,
  EditorDropdownMenuCustomItem,
  EditorDropdownMenuDivider,
  EditorDropdownMenuItem,
  EditorDropdownMenuSectionLabel,
  EditorDropdownMenuSubmenu,
  type EditorDropdownMenuProps,
  type EditorDropdownMenuCustomItemProps,
} from './dropdown-menu'
export { EditorComboboxMenu, type EditorComboboxMenuProps } from './combobox-menu'
export {
  EditorSlashMenu,
  EditorSlashMenuItemView,
  editorSlashMenuEmptyClassName,
  editorSlashMenuItemClassName,
  editorSlashMenuPopupClassName,
  editorSlashMenuPopupStyle,
  type EditorSlashMenuGroup,
  type EditorSlashMenuItem,
  type EditorSlashMenuProps,
} from './slash-menu'
export type { EditorMenuAction, EditorMenuOption } from './types'
