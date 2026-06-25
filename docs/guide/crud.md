# CRUD

Create, read, update, and delete records on a model — every async operation returns a promise you resolve with `:await()`.

## Create, build & save

`create` builds a record and INSERTs it in one step, populating the primary key. `build` returns an unsaved record you persist later with `save`.

```lua
local u = User:create({ name = "Zoe" }):await()       -- build + INSERT, id populated
local u = User:build({ name = "Zoe" })                -- unsaved; persist later with :save()
u.coins = u.coins + 10; u:save():await()              -- INSERT if new, UPDATE if loaded (dirty-tracked)
```

### Dirty tracking

Every loaded record is snapshotted, so `save` writes only the columns you actually changed — and a no-op save issues no query at all.

::: tip
With `{ timestamps = true }`, `created_at` / `updated_at` are managed by Norm in UTC, so they behave identically on SQLite and MySQL. See [Models](./models).
:::

### Reload & delete

```lua
u:reload():await()                                    -- re-read columns from the DB
u:delete():await()                                    -- DELETE (soft delete if enabled)
```

## Reading records

```lua
local one  = User:find(1):await()                     -- by primary key -> record | nil
local byEm = User:find_by({ email = "a@b.c" }):await()
local all  = User:all():await()
local n    = User:count():await()
```

For anything more selective, reach for the [Query builder](./query-builder).

## Find-or-create family

```lua
-- find-or-create family
User:find_or_create({ account_id = id }, { name = "Guest" }):await()
User:update_or_create({ account_id = id }, { last_seen = ts }):await()
User:find_or_new({ email = e }, { name = "Anon" }):await()        -- unsaved if missing
```

- `find_or_create` — return the matching row, or create one from the merged attributes.
- `update_or_create` — return the matching row updated with the new attributes, or create one.
- `find_or_new` — return the matching row, or an **unsaved** record if missing.

## Atomic upsert

```lua
-- atomic upsert (race-safe; needs a UNIQUE/PK on the conflict columns)
User:upsert({ account_id = id, name = nick }, { conflict = { "account_id" } }):await()
```

::: warning
`upsert` is race-safe but requires a `UNIQUE` (or primary key) constraint on the `conflict` columns, otherwise the database has nothing to detect the conflict against.
:::

## Bulk insert

`insert_many` writes every row in a single statement. Pass `{ records = true }` to get records back with their generated ids (via `RETURNING`).

```lua
-- bulk insert (one statement). { records = true } returns records with ids (RETURNING).
User:insert_many({ { name = "a" }, { name = "b" } }):await()
User:insert_many({ { name = "a" }, { name = "b" } }, { records = true }):await()
```

## Atomic counters

`increment` / `decrement` update a column in the database without a read-modify-write round trip. On a record, the in-memory field is updated too.

```lua
-- atomic counters (no read-modify-write)
User:where("id", id):increment("coins", 50):await()
u:decrement("lives"):await()                          -- on a record; updates u.lives too
```

## Raw escape hatch

When you need SQL Norm doesn't model, drop down to `db:query` (rows) or `db:execute` (no result set). Values are always **bound**, never interpolated.

```lua
-- raw escape hatch (values are always bound, never interpolated)
db:query("SELECT * FROM `users` WHERE `coins` > ?", { 100 }):await()
db:execute("DELETE FROM `users` WHERE `id` = ?", { 1 }):await()
```

To run several writes atomically, wrap them in a [transaction](./transactions).
