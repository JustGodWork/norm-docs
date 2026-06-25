# Migrations

`sync()` only creates missing tables; `migrate()` evolves an existing schema, with each migration running exactly once and in order.

## `db:migrate({ ... })`

Pass a list of migrations. Each has an `id` and an `up` function that receives a builder:

```lua
db:migrate({
    { id = "2026_06_25_add_last_seen", up = function(m)
        m:add_column("players", "last_seen", Norm.types.datetime())
        m:add_index("players", "idx_players_account", { "account_id" }, { unique = true })
    end },
}):await()
```

## Builder methods

The `m` object passed to each `up` function exposes:

- **`add_column(table, name, type)`** — add a column, using a `Norm.types.*` definition (see [Models](./models)).
- **`drop_column(table, name)`** — remove a column.
- **`rename_column(table, from, to)`** — rename a column.
- **`add_index(table, name, columns, options?)`** — add an index over `columns`; `options` accepts `{ unique = true }`.
- **`drop_index(table, name)`** — remove an index.
- **`drop_table(table)`** — drop a table.
- **`raw(sql)`** — run arbitrary SQL for anything the builder doesn't cover.

## Run-once tracking

Each migration runs once, tracked in the `norm_migrations` table by its `id`, and migrations run in the order you list them. Re-running `migrate()` is therefore safe — already-applied migrations are skipped.

## Run `sync()` first

::: warning
Run `sync()` (which creates tables and marks the ORM ready) **before** `migrate()` — only `sync()` flips readiness.
:::

```lua
coroutine.wrap(function()
    db:sync():await()       -- create tables, mark the ORM ready
    db:migrate({ ... }):await()
end)()
```

See [Getting started](./getting-started) for the boot sequence and [Models](./models) for the column types used in `add_column`.
