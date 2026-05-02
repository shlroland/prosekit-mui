import 'prosekit/basic/typography.css'

import { Box, Chip, Stack, Typography } from '@mui/material'

import { ProseKitProvider } from '../../src'
import { MuiPlaygroundProvider } from '../stories/MuiPlaygroundProvider'

export function MinimalEditorPage() {
  return (
    <MuiPlaygroundProvider>
      <Box className="mx-auto w-full max-w-5xl rounded-[2rem] border border-black/8 bg-white/86 p-6 shadow-[0_24px_80px_rgba(23,23,23,0.08)] md:p-8">
        <Stack spacing={2}>
          <div>
            <Chip
              label="ProseKit Minimal"
              className="border border-black/8 bg-stone-100 text-stone-700"
            />
          </div>
          <Typography variant="h3" className="max-w-3xl text-neutral-950">
            First working ProseKit + MUI editor slice
          </Typography>
          <Typography variant="body1" color="text.secondary" className="max-w-3xl">
            This page follows the official minimal ProseKit example and wraps it in a
            small Material UI shell. It gives us a stable base before adding toolbar,
            command state, and richer extension wiring.
          </Typography>
          <ProseKitProvider />
        </Stack>
      </Box>
    </MuiPlaygroundProvider>
  )
}
