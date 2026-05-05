declare module '*.css'

declare module 'emoji-mart/dist/module.js' {
  export function init(options: { data: unknown }): Promise<unknown>

  export const SearchIndex: {
    search: (
      value: string,
      options?: {
        maxResults?: number
        caller?: string
      },
    ) => Promise<unknown[]>
  }
}
