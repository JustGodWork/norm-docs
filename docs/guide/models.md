# Defining models

`db:define(name, schema, options?)` returns a model — your handle for everything Norm does with that table.

## `db:define(name, schema, options)`

```lua
local User = db:define("users", {
    id         = Norm.types.id(),                                 -- INT PK AUTO_INCREMENT
    name       = Norm.types.string({ length = 64, nullable = false }),
    email      = Norm.types.string({ length = 128, unique = true }),
    coins      = Norm.types.integer({ default = 0 }),
    bio        = Norm.types.text(),
    settings   = Norm.types.json(),                               -- Lua table <-> JSON string
    created_at = Norm.types.datetime({ default = Norm.types.raw("CURRENT_TIMESTAMP") }),
}, {
    timestamps   = true,          -- manage created_at / updated_at (Norm-side, UTC)
    soft_deletes = true,          -- add deleted_at; queries exclude trashed by default
    indexes      = { { columns = { "name" }, unique = false } },
})
```

The first argument is the table name, the second is the schema (a map of column name → type), and the third is an optional table of behaviours.

## Column types

The `Norm.types` constructors are:

`id, integer, bigint, string, text, float, double, boolean, datetime, date, json`, plus `raw(sql)` for raw SQL defaults.

- **`Norm.types.id()`** is a convenience for an `INT PRIMARY KEY AUTO_INCREMENT` column.
- **`Norm.types.json()`** (de)serialises automatically — assign a Lua table, read one back.
- **`Norm.types.raw(sql)`** injects raw SQL, typically as a column `default` (e.g. `Norm.types.raw("CURRENT_TIMESTAMP")`).

### Type options

Most type constructors accept a common options table:

```lua
{ length, nullable, unique, index, primary, autoincrement, default }
```

- **`length`** — column length (e.g. `string({ length = 64 })`).
- **`nullable`** — whether the column accepts `NULL`.
- **`unique`** — add a UNIQUE constraint.
- **`index`** — create a single-column index on this column (see [Indexes](#indexes)).
- **`primary`** — mark the column as the primary key.
- **`autoincrement`** — auto-increment the column.
- **`default`** — a default value; use `Norm.types.raw(sql)` for a SQL expression.

## Define options

The third argument to `define` configures per-model behaviours:

| Option | Purpose |
|---|---|
| `timestamps` | Manage `created_at` / `updated_at` automatically. |
| `soft_deletes` | Add a nullable `deleted_at` and exclude trashed rows by default. |
| `hooks` | Register lifecycle hooks at define time. |
| `scopes` | Declare reusable named query fragments. |
| `indexes` | Declare table indexes (see below). |

- **`timestamps`** adds `created_at` / `updated_at`, set by Norm in UTC. See [Timestamps & soft deletes](./timestamps-soft-deletes).
- **`soft_deletes`** adds a nullable `deleted_at`; queries (and eager/lazy relations) exclude soft-deleted rows by default. See [Timestamps & soft deletes](./timestamps-soft-deletes).
- **`hooks`** registers per-model lifecycle handlers (e.g. `before_save`, `after_create`). See [Hooks](./hooks).
- **`scopes`** declares reusable, named query fragments. See [Scopes](./query-builder#scopes).
- **`indexes`** declares table indexes (below).

## Indexes

There are two ways to declare an index.

**Per column** — set `index = true` (or `unique = true`) in a column's type options for a single-column index:

```lua
local User = db:define("users", {
    id    = Norm.types.id(),
    email = Norm.types.string({ length = 128, unique = true }),  -- unique index
    name  = Norm.types.string({ length = 64, index = true }),    -- plain index
})
```

**Per table** — use the `indexes` define option for multi-column or explicitly-named indexes:

```lua
local User = db:define("users", {
    id   = Norm.types.id(),
    name = Norm.types.string({ length = 64 }),
}, {
    indexes = { { columns = { "name" }, unique = false } },
})
```

Each entry takes `columns` (a list of column names) and an optional `unique` flag.

Indexes are emitted by `sync()` when the table is created. To add or drop indexes on an existing table, use [Migrations](./migrations) (`add_index` / `drop_index`).
