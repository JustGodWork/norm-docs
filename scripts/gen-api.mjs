// Generate the VitePress API reference from lua-language-server's doc.json.
//
//   1) in the norm repo:  lua-language-server --doc ./src --doc_out_path ./api-doc
//   2) here:              node scripts/gen-api.mjs [path/to/doc.json]
//
// It keeps only the public members of the documented `Norm*` classes and writes
// one page per class under docs/reference/. Re-run it whenever the annotations
// change. The sidebar grouping lives in .vitepress/config.mts (keep them in sync).

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const DOC_JSON = process.argv[2] ||
  path.resolve(root, './api-doc/doc.json')

const OUT_DIR = path.resolve(root, 'docs/reference')

// Base URL for "Source" links (class definition on GitHub).
const SRC_BASE = 'https://github.com/JustGodWork/norm/blob/master/src'

// The structure of the reference. Each page renders one or more classes.
// `slug` becomes reference/<slug>.md; single-class pages use the class as title.
const PAGES = [
  // --- Entry point -----------------------------------------------------------
  { slug: 'norm', title: 'Norm', classes: ['Norm'],
    intro: 'The value returned by the bundle (and the global `Norm`): factories, type constructors, and the entry point `Norm.new`.' },
  { slug: 'norm-orm', title: 'NormOrm', classes: ['NormOrm'],
    intro: 'The ORM instance returned by `Norm.new`. Defines models, runs migrations, and owns the adapter.' },

  // --- Models & Records ------------------------------------------------------
  { slug: 'norm-model', title: 'NormModel', classes: ['NormModel'],
    intro: 'A model is your handle for a table: CRUD, query entry points, hooks, scopes, and schema.' },
  { slug: 'norm-record', title: 'NormRecord', classes: ['NormRecord'],
    intro: 'A single row, returned by queries. Persist changes, reload, delete, and traverse relations.' },

  // --- Querying --------------------------------------------------------------
  { slug: 'norm-query-builder', title: 'NormQueryBuilder', classes: ['NormQueryBuilder'],
    intro: 'The fluent builder behind every query: `where_*`, joins, aggregations, scopes, pagination, and bulk writes.' },

  // --- Async -----------------------------------------------------------------
  { slug: 'norm-promise', title: 'NormPromise', classes: ['NormPromise'],
    intro: 'The promise wrapper every async operation returns. Await it, or chain with your framework promise.' },

  // --- Adapters & Providers (single page) ------------------------------------
  { slug: 'adapters', title: 'Adapters & Providers',
    classes: ['NormAdapter', 'NormNanosAdapter', 'NormOxMySQLAdapter', 'NormPromiseLib', 'NormJsonLib'],
    intro: 'The seams that make Norm portable: database adapters, promise providers, and JSON providers.' },

  // --- Types & Options (single page) -----------------------------------------
  { slug: 'types', title: 'Types & Options',
    classes: [
      'NormOptions', 'NormDefineOptions', 'NormColumn', 'NormColumnOptions',
      'NormRelationOptions', 'NormMigration', 'NormForeignKey', 'NormExecResult',
      'NormQueryState', 'NormDialect', 'NormPromiseProvider', 'NormJsonProvider',
    ],
    intro: 'Option tables and value shapes referenced throughout the API.' },
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
  const name = String(field.name || '')
  // skip private (_-prefixed) and LuaLS index signatures like `[string]`
  return field.visible === 'public' && !name.startsWith('_') && !name.startsWith('[')
}

// method | function | field, from the hover view.
function kindOf(field) {
  const v = (field.extends && field.extends.view) || ''
  if (v.startsWith('(method)')) return 'method'
  if (/^function\b/.test(v)) return 'function'
  return 'field'
}

// Async = returns a promise (annotated, or the return type is a *Promise).
function isAsync(field) {
  const v = (field.extends && field.extends.view) || ''
  return field.async === true || /->\s*(?:promise:|[^\n]*Promise\b)/.test(v)
}

// The return type text, for the members index ("-> X").
function returnType(field) {
  const v = (field.extends && field.extends.view) || ''
  const m = v.match(/->\s*(?:promise:\s*)?([^\n]+)/)
  return m ? m[1].trim() : ''
}

// First sentence/line of a description, for the index table.
function summary(field) {
  const d = cleanDesc(field.rawdesc || field.desc || '')
  const firstPara = d.split('\n').find((l) => l.trim() && !l.startsWith('```')) || ''
  const sentence = firstPara.split(/(?<=\.)\s/)[0]
  return sentence.replace(/\|/g, '\\|').trim()
}

function badges(field) {
  const out = []
  if (isAsync(field)) out.push('<Badge type="tip" text="async" />')
  out.push(`<Badge type="info" text="${kindOf(field)}" />`)
  return out.join(' ')
}

function publicFields(entry) {
  const seen = new Set()
  const fields = []
  for (const f of entry.fields || []) {
    if (!isPublic(f)) continue
    if (seen.has(f.name)) continue // dedupe overloaded/convenience entries
    seen.add(f.name)
    fields.push(f)
  }
  fields.sort((a, b) => a.name.localeCompare(b.name))
  return fields
}

function sourceLink(def) {
  if (!def || !def.file || !def.start) return ''
  const line = def.start[0]
  return `<small>:link: [Source: \`src/${def.file}\`](${SRC_BASE}/${def.file}#L${line})</small>`
}

// Render one class. `level` is the heading depth for the class name (2 on a
// single-class page where the H1 is the title, but the class block reuses H2 for
// members; 2 for the class name and 3 for members on multi-class pages).
function classMarkdown(name, { multi }) {
  const entry = byName.get(name)
  if (!entry) return `## ${name}\n\n_Not found in doc.json._\n`
  const def = (entry.defines && entry.defines[0]) || {}
  const classDesc = cleanDesc(def.rawdesc || def.desc || '')
  const fields = publicFields(entry)

  // member heading level: ## on single-class pages, ### under a ## on multi pages
  const memH = multi ? '###' : '##'
  // anchors must be unique per page: namespace by class on multi-class pages
  const anchor = (f) => (multi ? `${name.toLowerCase()}-${f.name.toLowerCase()}` : f.name.toLowerCase())

  let md = ''
  if (multi) md += `## ${name}\n\n`
  if (classDesc) md += `${classDesc}\n\n`
  const src = sourceLink(def)
  if (src) md += `${src}\n\n`

  if (fields.length) {
    // Members index
    md += '| Member | Returns | Description |\n|---|---|---|\n'
    for (const f of fields) {
      const ret = returnType(f).replace(/\|/g, '\\|')
      const a = isAsync(f) ? ' _(async)_' : ''
      md += `| [\`${f.name}\`](#${anchor(f)}) | ${ret ? `\`${ret}\`${a}` : '—'} | ${summary(f) || ''} |\n`
    }
    md += '\n'

    // Member detail
    for (const f of fields) {
      md += `${memH} ${f.name} ${badges(f)} {#${anchor(f)}}\n\n`
      const sig = signature(f)
      if (sig) md += '```lua\n' + sig + '\n```\n\n'
      const desc = cleanDesc(f.rawdesc || f.desc || '')
      if (desc) md += `${desc}\n\n`
    }
  }
  return md
}

fs.mkdirSync(OUT_DIR, { recursive: true })

for (const page of PAGES) {
  const multi = page.classes.length > 1
  let md = '---\noutline: [2, 3]\n---\n\n'

  if (multi) {
    md += `# ${page.title}\n\n${page.intro}\n\n`
  } else {
    md += `# ${page.title} <Badge type="info" text="class" />\n\n${page.intro}\n\n`
  }

  md += '::: info Auto-generated\n'
  md += 'This page is generated from the source annotations by `scripts/gen-api.mjs`. '
  md += 'Edit the LuaCATS doc comments in the Norm sources, not here.\n:::\n\n'

  for (const cls of page.classes) md += classMarkdown(cls, { multi }) + '\n'

  const out = path.join(OUT_DIR, `${page.slug}.md`)
  fs.writeFileSync(out, md.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n')
  console.log('wrote', path.relative(root, out))
}
