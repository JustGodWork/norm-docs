---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Norm"
  text: "A dependency-free Lua ORM"
  tagline: Model your tables, query them fluently, and await the results. Runs on nanos world, FiveM, and plain Lua.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/JustGodWork/norm

features:
  - title: Zero dependencies, one file
    details: Ships as a single self-contained bundle with light-class embedded. No require chains, no external libraries.
  - title: Promises, your way
    details: Every async operation returns a promise of your framework (nanos, FiveM, or built-in) with a uniform promise:await().
  - title: Full relations
    details: belongsTo / hasOne / hasMany / many-to-many, with lazy and eager loading (no N+1), nested includes, and per-relation options.
  - title: A real query builder
    details: where_*, joins, aggregations, group_by / having, paginate, named scopes, where_has and with_count.
  - title: The grown-up stuff
    details: Migrations, soft deletes, transactions, lifecycle hooks, auto timestamps with dirty tracking, atomic upsert and bulk inserts.
  - title: Fully typed
    details: LuaCATS annotations everywhere, so User:find(1):await() is typed as NormRecord? with editor autocomplete.
---
