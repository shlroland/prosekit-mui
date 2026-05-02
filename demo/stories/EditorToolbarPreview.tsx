import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { CommandButton } from './CommandButton'
import { StatusChip } from './StatusChip'

export function EditorToolbarPreview() {
  return (
    <Card className="rounded-[1.5rem] border border-black/8 bg-white/72 p-4 shadow-none md:p-5">
      <Stack spacing={2}>
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          className="flex-wrap rounded-[1.2rem] border border-black/8 bg-stone-100/90 p-3"
        >
          <CommandButton label="H1" />
          <CommandButton label="Bold" active />
          <CommandButton label="Italic" />
          <CommandButton label="Code" />
          <Divider orientation="vertical" flexItem className="mx-1 hidden md:block" />
          <CommandButton label="Comment" tone="ghost" />
          <CommandButton label="Publish" tone="accent" />
        </Stack>
        <Stack direction="row" spacing={1} useFlexGap className="flex-wrap">
          <StatusChip label="Draft" />
          <StatusChip label="Synced" tone="success" />
          <StatusChip label="2 suggestions" tone="warning" />
        </Stack>
        <div className="rounded-[1.2rem] border border-black/8 bg-white p-4">
          <Typography variant="h6" className="mb-2 font-bold text-neutral-950">
            Article intro
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={4}
            defaultValue="Tailwind should remain the primary surface language for app components, while Material UI provides primitives, accessibility, and theming hooks."
            className="rounded-2xl"
          />
        </div>
      </Stack>
    </Card>
  )
}
