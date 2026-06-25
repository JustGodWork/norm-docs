# Timestamps & Soft Deletes

How Norm manages automatic timestamps, only writes the columns you change, and keeps "deleted" rows recoverable.

## Timestamps & dirty tracking

Enabling `{ timestamps = true }` on a model adds `created_at` / `updated_at`, set **by Norm** in UTC — so they behave identically on SQLite and MySQL.

```lua
local User = db:define("users", {
    id    = Norm.types.id(),
    name  = Norm.types.string({ length = 64, nullable = false }),
    email = Norm.types.string({ length = 128, unique = true }),
}, { timestamps = true })
```

When a record is created, `created_at` and `updated_at` are stamped. On a subsequent update, `updated_at` is refreshed.

### Dirty tracking

Every loaded record is snapshotted, so `:save()` writes **only the columns you changed**.

```lua
local u = User:find(1):await()
u.coins = u.coins + 10
u:save():await()             -- UPDATE touches only `coins` (and `updated_at`)
```

::: tip
A no-op `:save()` issues no query at all — if nothing changed since the record was loaded, there is nothing to write.
:::

See [CRUD & Records](./crud) for the full create / save / reload flow.

## Soft deletes

Enabling `{ soft_deletes = true }` adds a nullable `deleted_at` column. Queries — including eager and lazy [relations](./relations) — exclude soft-deleted rows by default.

```lua
local Post = db:define("posts", {
    id   = Norm.types.id(),
    body = Norm.types.text(),
}, { soft_deletes = true })
```

### Deleting, restoring, and inspecting

```lua
post:delete():await()        -- sets deleted_at instead of removing the row
post:restore():await()       -- clears it; post:trashed() reports the state
post:force_delete():await()  -- real DELETE
```

- `delete` — soft delete: sets `deleted_at` rather than removing the row.
- `restore` — clears `deleted_at`, bringing the row back.
- `force_delete` — a real `DELETE`, permanently removing the row.
- `trashed` — reports whether the record is currently soft-deleted.

### Query scopes for trashed rows

By default queries hide trashed rows. Two scopes change that:

```lua
Post:with_trashed():all():await()   -- include them
Post:only_trashed():all():await()   -- just the trashed ones
```

::: warning
`force_delete` bypasses the soft-delete mechanism and removes the row for good — there is no `restore` after it.
:::
