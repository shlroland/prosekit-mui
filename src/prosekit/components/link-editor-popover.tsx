import { Button, FormControlLabel, Popover, Radio, RadioGroup, Stack, TextField } from '@mui/material'
import { useEffect, useRef, useState } from 'react'

export type LinkEditorType = 'text' | 'icon' | 'block'
export type LinkEditorTarget = '_blank' | '_self'

export type LinkEditorSubmitValue = {
  href: string
  title: string
  type: LinkEditorType
  target: LinkEditorTarget
}

export type LinkEditorPopoverProps = {
  anchorEl: HTMLElement | null
  open: boolean
  onClose: () => void
  onSubmit: (value: LinkEditorSubmitValue) => void
  onRemove?: () => void
  initialHref?: string
  initialTitle?: string
  initialType?: LinkEditorType
  initialTarget?: LinkEditorTarget
  showAdvancedOptions?: boolean
}

export function LinkEditorPopover({
  anchorEl,
  open,
  onClose,
  onSubmit,
  onRemove,
  initialHref = '',
  initialTitle = '',
  initialType = 'icon',
  initialTarget = '_blank',
  showAdvancedOptions = false,
}: LinkEditorPopoverProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [href, setHref] = useState(initialHref)
  const [title, setTitle] = useState(initialTitle)
  const [type, setType] = useState<LinkEditorType>(initialType)
  const [target, setTarget] = useState<LinkEditorTarget>(initialTarget)

  useEffect(() => {
    if (!open) {
      return
    }

    setHref(initialHref)
    setTitle(initialTitle)
    setType(initialType)
    setTarget(initialTarget)
  }, [initialHref, initialTarget, initialTitle, initialType, open])

  useEffect(() => {
    if (!open) {
      return
    }

    inputRef.current?.focus()
    inputRef.current?.select()
  }, [open])

  function handleSubmit() {
    onSubmit({
      href: href.trim(),
      title: title.trim(),
      type,
      target,
    })
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Stack gap={1.5} sx={{ p: 1.5, width: 320 }}>
        <TextField
          inputRef={inputRef}
          value={href}
          size="small"
          placeholder="Paste the link..."
          onChange={(event) => setHref(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault()
              onClose()
            }

            if (event.key === 'Enter') {
              event.preventDefault()
              handleSubmit()
            }
          }}
        />
        {showAdvancedOptions ? (
          <>
            <TextField
              value={title}
              size="small"
              placeholder="Link title"
              onChange={(event) => setTitle(event.target.value)}
            />
            <RadioGroup
              row
              value={type}
              onChange={(event) => setType(event.target.value as LinkEditorType)}
            >
              <FormControlLabel value="text" control={<Radio size="small" />} label="文字" />
              <FormControlLabel value="icon" control={<Radio size="small" />} label="图标" />
              <FormControlLabel value="block" control={<Radio size="small" />} label="卡片" />
            </RadioGroup>
            <RadioGroup
              row
              value={target}
              onChange={(event) => setTarget(event.target.value as LinkEditorTarget)}
            >
              <FormControlLabel value="_blank" control={<Radio size="small" />} label="新窗口" />
              <FormControlLabel value="_self" control={<Radio size="small" />} label="当前窗口" />
            </RadioGroup>
          </>
        ) : null}
        <Stack direction="row" gap={1}>
          {onRemove ? (
            <Button
              size="small"
              onMouseDown={(event) => event.preventDefault()}
              onClick={onRemove}
              className="normal-case"
            >
              Remove
            </Button>
          ) : null}
          <Button
            size="small"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClose}
            className="normal-case"
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleSubmit}
            className="normal-case"
          >
            Save
          </Button>
        </Stack>
      </Stack>
    </Popover>
  )
}
