import { Box, IconButton, Stack } from '@mui/material'
import { Copy, LayoutPanelTop, PencilLine, Type, Unlink } from 'lucide-react'

export type LinkActionBarProps = {
  href: string
  isBlock: boolean
  onEdit: (event: React.MouseEvent<HTMLButtonElement>) => void
  onCopy: (event: React.MouseEvent<HTMLButtonElement>) => void
  onRemove: (event: React.MouseEvent<HTMLButtonElement>) => void
  onToggleDisplay: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export function LinkActionBar({
  href,
  isBlock,
  onEdit,
  onCopy,
  onRemove,
  onToggleDisplay,
}: LinkActionBarProps) {
  return (
    <Stack direction="row" alignItems="center" gap={0.5}>
      <Box
        component="span"
        sx={{
          maxWidth: 220,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {href}
      </Box>
      <IconButton size="small" onClick={onEdit}>
        <PencilLine size={14} />
      </IconButton>
      <IconButton size="small" onClick={onCopy}>
        <Copy size={14} />
      </IconButton>
      <IconButton size="small" onClick={onRemove}>
        <Unlink size={14} />
      </IconButton>
      <IconButton size="small" onClick={onToggleDisplay}>
        {isBlock ? <Type size={14} /> : <LayoutPanelTop size={14} />}
      </IconButton>
    </Stack>
  )
}
