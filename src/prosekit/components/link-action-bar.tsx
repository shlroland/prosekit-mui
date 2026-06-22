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
  onChangeDisplay: (type: LinkDisplayType) => void
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
          'pk:h-8 pk:w-8 pk:rounded-lg',
          active
            ? 'pk:bg-[var(--editor-primary)] pk:text-white pk:hover:bg-[var(--editor-primary-hover)]'
            : 'pk:text-[var(--editor-muted-foreground)] pk:hover:text-[var(--editor-foreground)]',
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
  return (
    <div className="pk:flex pk:items-center pk:gap-1 pk:p-1.5">
      <span className="pk:w-[200px] pk:overflow-hidden pk:truncate pk:whitespace-nowrap pk:px-2 pk:text-sm pk:text-[var(--editor-muted-foreground)]">
        {href}
      </span>
      <LinkActionButton label="编辑" onClick={onEdit}>
        <EditLineIcon className="pk:text-base" />
      </LinkActionButton>
      <LinkActionButton label="复制链接" onClick={onCopy}>
        <CopyIcon className="pk:text-base" />
      </LinkActionButton>
      <LinkActionButton label="取消链接" onClick={onRemove}>
        <LinkUnlinkIcon className="pk:text-base" />
      </LinkActionButton>
      <Separator orientation="vertical" className="pk:mx-1 pk:h-4" />
      <LinkActionButton
        label="文字"
        active={type === 'text'}
        onClick={() => onChangeDisplay('text')}
      >
        <TextIcon className="pk:text-base" />
      </LinkActionButton>
      <LinkActionButton
        label="图标文字"
        active={type === 'icon'}
        onClick={() => onChangeDisplay('icon')}
      >
        <ScrollToBottomLineIcon className="pk:text-base" style={{ transform: 'rotate(90deg)' }} />
      </LinkActionButton>
      <LinkActionButton
        label="卡片"
        active={type === 'block'}
        onClick={() => onChangeDisplay('block')}
      >
        <CarouselViewIcon className="pk:text-base" style={{ transform: 'rotate(90deg)' }} />
      </LinkActionButton>
    </div>
  )
}
