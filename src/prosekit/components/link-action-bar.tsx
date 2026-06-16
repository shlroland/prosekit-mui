import { Button, Separator, Tooltip } from '../../ui'
import {
  CarouselViewIcon,
  CopyIcon,
  EditLineIcon,
  LinkUnlinkIcon,
  ScrollToBottomLineIcon,
  TextIcon,
} from '../../icons'
import { cn } from '../../utils/cn'
import type { LinkDisplayType } from '../extensions/link/types'

export type LinkActionBarProps = {
  href: string
  type: LinkDisplayType
  onEdit: (event: React.MouseEvent<HTMLButtonElement>) => void
  onCopy: (event: React.MouseEvent<HTMLButtonElement>) => void
  onRemove: (event: React.MouseEvent<HTMLButtonElement>) => void
  onChangeDisplay: (type: LinkDisplayType, event: React.MouseEvent<HTMLButtonElement>) => void
}

type LinkActionButtonProps = {
  label: string
  active?: boolean
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  children: React.ReactNode
}

function LinkActionButton({
  label,
  active = false,
  onClick,
  children,
}: LinkActionButtonProps) {
  return (
    <Tooltip content={label}>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-8 w-8 rounded-lg',
          active
            ? 'bg-[var(--editor-primary)] text-white hover:bg-[var(--editor-primary-hover)]'
            : 'text-[var(--editor-muted-foreground)] hover:text-[var(--editor-foreground)]',
        )}
        onClick={onClick}
      >
        {children}
      </Button>
    </Tooltip>
  )
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
    <div className="flex items-center gap-1 rounded-lg bg-white p-1.5">
      <span className="w-[200px] overflow-hidden truncate whitespace-nowrap px-2 text-sm text-[var(--editor-muted-foreground)]">
        {href}
      </span>
      <LinkActionButton label="编辑" onClick={onEdit}>
        <EditLineIcon sx={iconSx} />
      </LinkActionButton>
      <LinkActionButton label="复制链接" onClick={onCopy}>
        <CopyIcon sx={iconSx} />
      </LinkActionButton>
      <LinkActionButton label="取消链接" onClick={onRemove}>
        <LinkUnlinkIcon sx={iconSx} />
      </LinkActionButton>
      <Separator orientation="vertical" className="mx-1 h-4" />
      <LinkActionButton
        label="文字"
        active={type === 'text'}
        onClick={(event) => onChangeDisplay('text', event)}
      >
        <TextIcon sx={iconSx} />
      </LinkActionButton>
      <LinkActionButton
        label="图标文字"
        active={type === 'icon'}
        onClick={(event) => onChangeDisplay('icon', event)}
      >
        <ScrollToBottomLineIcon sx={{ ...iconSx, transform: 'rotate(90deg)' }} />
      </LinkActionButton>
      <LinkActionButton
        label="卡片"
        active={type === 'block'}
        onClick={(event) => onChangeDisplay('block', event)}
      >
        <CarouselViewIcon sx={{ ...iconSx, transform: 'rotate(90deg)' }} />
      </LinkActionButton>
    </div>
  )
}
