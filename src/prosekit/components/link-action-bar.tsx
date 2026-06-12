import { Box, Divider, IconButton, Stack, Tooltip } from '@mui/material'

import {
  CarouselViewIcon,
  CopyIcon,
  EditLineIcon,
  LinkUnlinkIcon,
  ScrollToBottomLineIcon,
  TextIcon,
} from '../../icons'
import type { LinkDisplayType } from '../extensions/link/types'

export type LinkActionBarProps = {
  href: string
  type: LinkDisplayType
  onEdit: (event: React.MouseEvent<HTMLButtonElement>) => void
  onCopy: (event: React.MouseEvent<HTMLButtonElement>) => void
  onRemove: (event: React.MouseEvent<HTMLButtonElement>) => void
  onChangeDisplay: (type: LinkDisplayType, event: React.MouseEvent<HTMLButtonElement>) => void
}

export function LinkActionBar({
  href,
  type,
  onEdit,
  onCopy,
  onRemove,
  onChangeDisplay,
}: LinkActionBarProps) {
  const iconSx = { fontSize: '1rem' }

  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={0.5}
      sx={{
        p: 0.75,
        bgcolor: '#fff',
        borderRadius: 1,
        '.MuiIconButton-root': {
          color: 'text.secondary',
          borderRadius: 1,
          '&:hover': {
            bgcolor: 'action.hover',
            color: 'text.primary',
          },
          '&.MuiIconButton-colorPrimary': {
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          },
        },
      }}
    >
      <Box
        component="span"
        sx={{
          width: 200,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          px: 1,
          fontSize: '0.875rem',
          color: 'text.secondary',
        }}
      >
        {href}
      </Box>
      <Tooltip title="编辑">
        <IconButton size="small" onClick={onEdit}>
          <EditLineIcon sx={iconSx} />
        </IconButton>
      </Tooltip>
      <Tooltip title="复制链接">
        <IconButton size="small" onClick={onCopy}>
          <CopyIcon sx={iconSx} />
        </IconButton>
      </Tooltip>
      <Tooltip title="取消链接">
        <IconButton size="small" onClick={onRemove}>
          <LinkUnlinkIcon sx={iconSx} />
        </IconButton>
      </Tooltip>
      <Divider
        orientation="vertical"
        flexItem
        sx={{ height: '1rem', mx: 0.5, alignSelf: 'center', borderColor: 'divider' }}
      />
      <Tooltip title="文字">
        <IconButton
          size="small"
          color={type === 'text' ? 'primary' : 'default'}
          onClick={(event) => onChangeDisplay('text', event)}
        >
          <TextIcon sx={iconSx} />
        </IconButton>
      </Tooltip>
      <Tooltip title="图标文字">
        <IconButton
          size="small"
          color={type === 'icon' ? 'primary' : 'default'}
          onClick={(event) => onChangeDisplay('icon', event)}
        >
          <ScrollToBottomLineIcon sx={{ ...iconSx, transform: 'rotate(90deg)' }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="卡片">
        <IconButton
          size="small"
          color={type === 'block' ? 'primary' : 'default'}
          onClick={(event) => onChangeDisplay('block', event)}
        >
          <CarouselViewIcon sx={{ ...iconSx, transform: 'rotate(90deg)' }} />
        </IconButton>
      </Tooltip>
    </Stack>
  )
}
