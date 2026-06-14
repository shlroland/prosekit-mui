# Table Implementation Plan

## Current State

- `defineBasicExtension()` already includes ProseKit `defineTable()`.
- The demo imports `prosekit/extensions/table/style.css`.
- The demo toolbar currently inserts a fixed `3 x 4` table through `editor.commands.insertTable({ row: 3, col: 4 })`.
- There is no table size picker, table command menu, row/column handle UI, or table-specific command state wrapper yet.

## Goals

- Reuse ProseKit table schema, commands, and table-handle primitives.
- Use MUI for visual controls, menus, buttons, and surfaces.
- Avoid a custom table node view until there is a concrete limitation in ProseKit's native table DOM.
- Build table features in small independently usable layers.

## Phase 1: Table Size Picker

Replace the fixed table toolbar button with a size picker.

### Components

- `src/prosekit/components/table-size-picker.tsx`

### Behavior

- Open from the existing table toolbar button.
- Show a hoverable row/column grid.
- Default preview should start around `3 x 4`.
- Support a practical max size, for example `10 x 10`.
- Display the current hovered size as text.
- On click, run `editor.commands.insertTable({ row, col })`.
- Focus the editor before command execution.

### Acceptance Criteria

- Users can insert different table sizes from the toolbar.
- Inserted table places the selection inside the first cell.
- Picker closes after insertion.
- `aube run build` passes.

## Phase 2: Table Command Menu

Add structure editing commands for an existing table.

### Components

- `src/prosekit/components/table-menu.tsx`
- Optional shared helper: `src/prosekit/components/table-command-utils.ts`

### Commands

- Add row before.
- Add row after.
- Add column before.
- Add column after.
- Delete row.
- Delete column.
- Delete table.
- Merge selected cells.
- Split current cell.

### UI

- Use MUI menu or popover primitives.
- Use existing icons:
  - `InsertRowTopIcon`
  - `InsertRowBottomIcon`
  - `InsertColumnLeftIcon`
  - `InsertColumnRightIcon`
  - `DeleteRowIcon`
  - `DeleteColumnIcon`
  - merge/split icons already available in `src/icons`
- Disable commands when the current selection is not in a valid table context.

### Acceptance Criteria

- Commands work when the selection is inside a table.
- Commands are disabled outside tables.
- Merge and split are only enabled when valid.
- Deleting a table leaves the document in an editable state.
- `aube run build` passes.

## Phase 3: Table Handles

Add row and column handle UI using ProseKit table-handle primitives.

### Components

- `src/prosekit/components/table-handles.tsx`
- `src/prosekit/components/table-row-menu.tsx`
- `src/prosekit/components/table-column-menu.tsx`

### ProseKit Primitives

Use `prosekit/react/table-handle`:

- `TableHandleRoot`
- row positioner / popup / menu root / menu trigger
- column positioner / popup / menu root / menu trigger
- drop indicator
- drag preview

### Behavior

- Hovering table rows and columns should reveal handles.
- Clicking a row or column handle should open a menu.
- Menus should reuse Phase 2 command helpers.
- Row/column drag reordering is P2 inside this phase: wire it only if the ProseKit primitive is stable and straightforward in this app.

### Acceptance Criteria

- Row and column handles appear on hover.
- Handle menus can add/delete rows and columns.
- Handles do not interfere with text selection inside cells.
- Drag preview/drop indicator either works correctly or remains intentionally omitted.
- `aube run build` passes.

## Phase 4: Table Styling

Tune table visuals to match the editor.

### Scope

- Table border color.
- Cell padding.
- Header cell styling if enabled by ProseKit defaults.
- Selected cell and multi-cell selection background.
- Handle hover states.
- Menu surfaces and shadows.
- Horizontal overflow behavior inside editor content.

### Constraints

- Keep selectors scoped to editor/table classes.
- Do not replace ProseKit table DOM unless native output blocks a required feature.
- Preserve accessibility affordances from ProseKit primitives.

### Acceptance Criteria

- Tables visually fit the current MUI editor surface.
- Cell content remains readable at narrow widths.
- Selection and hover states are visible but not visually noisy.
- `aube run build` passes.

## Suggested Implementation Order

1. Implement `TableSizePicker`.
2. Add table command helpers and toolbar menu.
3. Add ProseKit table handles.
4. Polish styles after behavior is stable.

This order keeps insertion, command behavior, handle positioning, and visual polish separated so each step can be tested independently.
