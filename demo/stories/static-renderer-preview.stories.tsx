import 'prosekit/basic/typography.css'
import 'prosekit/extensions/list/style.css'
import 'prosekit/extensions/table/style.css'

import { demoContent } from '../components/prosekit-astrobook-demo'
import { renderProseKitReact } from '../../src/prosekit/static-renderer'
import { PlaygroundShell } from './playground-shell'

function StaticRendererPreviewStory() {
  return (
    <PlaygroundShell
      eyebrow="Static renderer"
      title="Read-only demo content"
      copy="The same JSON used by the editor demo, rendered through the static React renderer without editor interactions."
    >
      <div className="pk:rounded-2xl pk:border pk:border-black/8 pk:bg-white pk:p-6 pk:shadow-sm">
        {renderProseKitReact(demoContent)}
      </div>
    </PlaygroundShell>
  )
}

export default {
  component: StaticRendererPreviewStory,
}

export const RichContent = {}
