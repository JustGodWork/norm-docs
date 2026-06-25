// Generate the VitePress API reference from lua-language-server's doc.json.
//
//   1) in the norm repo:  lua-language-server --doc ./src --doc_out_path ./api-doc
//   2) here:              node scripts/gen-api.mjs [path/to/doc.json]
//
// It keeps only the public members of the documented `Norm*` classes and writes
// docs/reference/*.md. Re-run it whenever the annotations change.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const DOC_JSON = process.argv[2] ||
  path.resolve(root, './api-doc/doc.json')

const OUT_DIR = path.resolve(root, 'docs/reference')

// Which classes go on which page, in order. Anything not listed is skipped.
const PAGES = [
  {
    slug: 'core', title: 'Core API',
    intro: 'The objects you use day to day: the `Norm` entry point, the ORM, models, records, and the query builder.',
    classes: ['Norm', 'NormOrm', 'NormModel', 'NormRecord', 'NormQueryBuilder', 'NormPromise'],
  },
  {
    slug: 'adapters', title: 'Adapters & Providers',
    intro: 'The seams that make Norm portable: database adapters, promise providers, and JSON providers.',
    classes: ['NormAdapter', 'NormNanosAdapter', 'NormOxMySQLAdapter', 'NormPromiseLib', 'NormJsonLib'],
  },
  {
    slug: 'types', title: 'Types & Options',
    intro: 'Option tables and value shapes referenced by the API.',
    classes: [
      'NormOptions', 'NormDefineOptions', 'NormColumn', 'NormColumnOptions',
      'NormRelationOptions', 'NormMigration', 'NormForeignKey', 'NormExecResult',
      'NormQueryState', 'NormDialect', 'NormPromiseProvider', 'NormJsonProvider',
    ],
  },
]

const data = JSON.parse(fs.readFileSync(DOC_JSON, 'utf-8'))
const byName = new Map()
for (const e of data) if (e && e.name) byName.set(e.name, e)

// Strip the uniform single-space indent LuaLS puts on every description line.
function cleanDesc(s) {
  if (!s) return ''
  const lines = s.replace(/\r/g, '').split('\n')
  const out = lines.map((l) => (l.startsWith(' ') ? l.slice(1) : l))
  return out.join('\n').trim()
}

// A member's display signature (drop the "(method)"/"(field)" lead-in noise).
function signature(field) {
  const view = (field.extends && field.extends.view) || ''
  return view.replace(/^\((method|field)\)\s*/, '').trim()
}

function isPublic(field) {
  return field.visible === 'public' && !String(field.name || '').startsWith('_')
}

function classMarkdown(name) {
  const entry = byName.get(name)
  if (!entry) return `## ${name}\n\n_Not found in doc.json._\n`
  const def = (entry.defines && entry.defines[0]) || {}
  const classDesc = cleanDesc(def.rawdesc || def.desc || '')
  let md = `## ${name}\n\n`
  if (classDesc) md += `${classDesc}\n\n`

  const fields = (entry.fields || []).filter(isPublic)
  for (const f of fields) {
    md += `### ${f.name}\n\n`
    const sig = signature(f)
    if (sig) md += '```lua\n' + sig + '\n```\n\n'
    const desc = cleanDesc(f.rawdesc || f.desc || '')
    if (desc) md += `${desc}\n\n`
  }
  return md
}

fs.mkdirSync(OUT_DIR, { recursive: true })

for (const page of PAGES) {
  let md = `# ${page.title}\n\n${page.intro}\n\n`
  md += '::: info Auto-generated\nThis page is generated from the source annotations '
  md += '(`scripts/gen-api.mjs`). Edit the doc comments in the Norm-docs/api-doccs sources, not here.\n:::\n\n'
  for (const cls of page.classes) md += classMarkdown(cls) + '\n'
  fs.writeFileSync(path.join(OUT_DIR, `${page.slug}.md`), md.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n')
  console.log('wrote', path.relative(root, path.join(OUT_DIR, `${page.slug}.md`)))
}
