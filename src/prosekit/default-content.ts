import { type NodeJSON } from "prosekit/core";

export const defaultContent: NodeJSON = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Minimal ProseKit editor' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'This is the first integration slice for ' },
        {
          type: 'text',
          text: 'ProseKit + MUI',
          marks: [{ type: 'bold' }],
        },
        {
          type: 'text',
          text: '. The editor is using ProseKit’s basic extension set and a small Material UI shell.',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Try typing into the document and selecting text.' }],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'This is the stable base for the next toolbar step.' }],
    },
  ],
}


