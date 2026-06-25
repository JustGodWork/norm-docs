import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "docs",

  // GitHub Pages project site -> "/<repo-name>/". Use "/" for a user/org page
  // (justgodwork.github.io) or a custom domain.
  base: "/norm-docs/",

  title: "Norm",
  titleTemplate: ":title · Docs",
  description: "A dependency-free Lua ORM with pluggable adapters and promises - for nanos world, FiveM, and plain Lua.",

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Guide', link: '/guide/getting-started', activeMatch: '/guide/' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Adapters & Providers', link: '/guide/adapters' },
          ],
        },
        {
          text: 'Schema',
          items: [
            { text: 'Defining Models', link: '/guide/models' },
            { text: 'Migrations', link: '/guide/migrations' },
          ],
        },
        {
          text: 'Working with Data',
          items: [
            { text: 'CRUD & Records', link: '/guide/crud' },
            { text: 'Query Builder', link: '/guide/query-builder' },
            { text: 'Relations', link: '/guide/relations' },
            { text: 'JSON Columns', link: '/guide/json-columns' },
          ],
        },
        {
          text: 'Behaviours',
          items: [
            { text: 'Timestamps & Soft Deletes', link: '/guide/timestamps-soft-deletes' },
            { text: 'Lifecycle Hooks', link: '/guide/hooks' },
            { text: 'Transactions', link: '/guide/transactions' },
          ],
        },
        {
          text: 'Async',
          items: [
            { text: 'Promises & await', link: '/guide/promises' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/JustGodWork/norm' }
    ],

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/JustGodWork/norm-docs/edit/main/docs/:path'
    },
  }
})
