import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
} from '@mui/material'
import { PopoverPopup, PopoverPositioner, PopoverRoot, PopoverTrigger } from 'prosekit/react/popover'
import type { CSSProperties, ReactNode } from 'react'
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
  children: ReactNode
  triggerStyle?: CSSProperties
  open: boolean
  onClose: () => void
  onSubmit: (value: LinkEditorSubmitValue) => void
  onRemove?: () => void
  initialHref?: string
  initialTitle?: string
  initialType?: LinkEditorType
  initialTarget?: LinkEditorTarget
  showAdvancedOptions?: boolean
  submitLabel?: string
}

export type LinkEditorPanelProps = Omit<LinkEditorPopoverProps, 'children' | 'triggerStyle'>

export function LinkEditorPanel({
  open,
  onClose,
  onSubmit,
  onRemove,
  initialHref = '',
  initialTitle = '',
  initialType = 'icon',
  initialTarget = '_blank',
  showAdvancedOptions = false,
  submitLabel = '保存链接',
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
    if (!href.trim()) {
      return
    }

    onSubmit({
      href: href.trim(),
      title: title.trim(),
      type,
      target,
    })
  }

  return (
    <Stack
      gap={2}
      sx={{
        p: 2,
        width: 350,
        bgcolor: '#fff',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        boxShadow: 3,
        '.MuiFormControlLabel-label': {
          fontSize: '0.875rem',
        },
      }}
    >
            <Stack direction="row" gap={2} alignItems="center">
              <Box sx={{ fontSize: '0.875rem', color: 'text.secondary', flexShrink: 0 }}>地址</Box>
              <TextField
                fullWidth
                inputRef={inputRef}
                value={href}
                size="small"
                placeholder="https://example.com"
                required
                error={href.length > 0 && !href.trim()}
                helperText={href.length > 0 && !href.trim() ? '请输入有效的链接地址' : ''}
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
            </Stack>
            {showAdvancedOptions ? (
              <>
                <Stack direction="row" gap={2} alignItems="center">
                  <Box sx={{ fontSize: '0.875rem', color: 'text.secondary', flexShrink: 0 }}>标题</Box>
                  <TextField
                    fullWidth
                    value={title}
                    size="small"
                    placeholder="链接标题（可选）"
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </Stack>
                <FormControl component="fieldset">
                  <Stack direction="row" gap={2} alignItems="center">
                    <FormLabel component="legend" sx={{ fontSize: '0.875rem', flexShrink: 0 }}>
                      风格
                    </FormLabel>
                    <RadioGroup
                      row
                      value={type}
                      onChange={(event) => setType(event.target.value as LinkEditorType)}
                    >
                      <FormControlLabel value="text" control={<Radio size="small" />} label="文字" />
                      <FormControlLabel value="icon" control={<Radio size="small" />} label="图标文字" />
                      <FormControlLabel value="block" control={<Radio size="small" />} label="卡片" />
                    </RadioGroup>
                  </Stack>
                </FormControl>
                <FormControl component="fieldset">
                  <Stack direction="row" gap={2} alignItems="center">
                    <FormLabel component="legend" sx={{ fontSize: '0.875rem', flexShrink: 0 }}>
                      打开
                    </FormLabel>
                    <RadioGroup
                      row
                      value={target}
                      onChange={(event) => setTarget(event.target.value as LinkEditorTarget)}
                    >
                      <FormControlLabel value="_blank" control={<Radio size="small" />} label="新窗口" />
                      <FormControlLabel value="_self" control={<Radio size="small" />} label="当前窗口" />
                    </RadioGroup>
                  </Stack>
                </FormControl>
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
                  取消链接
                </Button>
              ) : null}
              <Button
                size="small"
                onMouseDown={(event) => event.preventDefault()}
                onClick={onClose}
                className="normal-case"
              >
                取消
              </Button>
              <Button
                size="small"
                variant="contained"
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleSubmit}
                disabled={!href.trim()}
                className="normal-case"
              >
                {submitLabel}
              </Button>
            </Stack>
    </Stack>
  )
}

export function LinkEditorPopover({
  children,
  triggerStyle,
  open,
  onClose,
  ...panelProps
}: LinkEditorPopoverProps) {
  return (
    <PopoverRoot
      style={{ display: 'contents' }}
      open={open}
      onOpenChange={(event) => {
        if (!event.detail.open) {
          onClose()
        }
      }}
    >
      <PopoverTrigger style={triggerStyle}>{children}</PopoverTrigger>
      <PopoverPositioner placement="bottom" offset={8} hoist>
        <PopoverPopup className="prosekit-link-editor-popover">
          <LinkEditorPanel open={open} onClose={onClose} {...panelProps} />
        </PopoverPopup>
      </PopoverPositioner>
    </PopoverRoot>
  )
}
