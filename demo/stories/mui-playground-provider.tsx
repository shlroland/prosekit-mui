import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import { CssBaseline, GlobalStyles, StyledEngineProvider } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import type { ReactNode } from 'react'

const theme = createTheme({
  cssVariables: true,
  modularCssLayers:
    '@layer theme, base, mui.global, mui.components, mui.theme, mui.custom, mui.sx, components, utilities;',
  shape: {
    borderRadius: 16,
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#171717',
    },
    secondary: {
      main: '#b85c38',
    },
    background: {
      default: '#fcfaf5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.04em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
})

export function MuiPlaygroundProvider({ children }: { children?: ReactNode }) {
  return (
    <StyledEngineProvider enableCssLayer>
      <ThemeProvider theme={theme}>
        <GlobalStyles
          styles="@layer theme, base, mui.global, mui.components, mui.theme, mui.custom, mui.sx, components, utilities;"
        />
        <CssBaseline />
        <GlobalStyles
          styles={{
            ':root': {
              colorScheme: 'light',
            },
            body: {
              minHeight: '100vh',
            },
          }}
        />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  )
}
