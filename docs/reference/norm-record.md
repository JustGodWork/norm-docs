---
outline: [2, 3]
---

# NormRecord <Badge type="info" text="class" />

A single row, returned by queries. Persist changes, reload, delete, and traverse relations.

::: info Auto-generated
This page is generated from the source annotations by `scripts/gen-api.mjs`. Edit the LuaCATS doc comments in the Norm sources, not here.
:::

A single row. Column values are plain fields (e.g. `record.name`).

<small>:link: [Source: `src/model.lua`](https://github.com/JustGodWork/norm/blob/master/src/model.lua#L70)</small>

| Member | Returns | Description |
|---|---|---|
| [`attach`](#attach) | `NormNumberPromise` _(async)_ | Link this record to one or more `target` rows of a `belongs_to_many` relation |
| [`decrement`](#decrement) | `NormRecordPromise` _(async)_ | Atomically subtract `amount` (default 1) from a column of this record. |
| [`delete`](#delete) | `NormRecordPromise` _(async)_ | Delete this record. |
| [`detach`](#detach) | `NormNumberPromise` _(async)_ | Unlink this record from `target` rows of a `belongs_to_many` relation by |
| [`force_delete`](#force_delete) | `NormRecordPromise` _(async)_ | Physically DELETE this record by its primary key, even on a soft-delete model. |
| [`increment`](#increment) | `NormRecordPromise` _(async)_ | Atomically add `amount` (default 1) to a column of THIS record |
| [`load`](#load) | `NormPromise` _(async)_ | Lazily load a declared relation, cache it on `self[name]`, and resolve with |
| [`reload`](#reload) | `NormRecordPromise` _(async)_ | Re-read this record's columns from the database (discarding local changes). |
| [`restore`](#restore) | `NormRecordPromise` _(async)_ | Un-delete a soft-deleted record (clears `deleted_at`). |
| [`save`](#save) | `NormRecordPromise` _(async)_ | Persist the record: INSERT if new, UPDATE (only changed columns) if it was |
| [`sync_pivot`](#sync_pivot) | `NormPromise` _(async)_ | Make this record's pivot links for a `belongs_to_many` relation exactly match |
| [`to_table`](#to_table) | `table<string, any>` | Plain `{ column = value }` table for this record (e.g. |
| [`trashed`](#trashed) | `boolean` | Whether this record is currently soft-deleted (its `deleted_at` is set). |

## attach <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#attach}

```lua
NormRecord:attach(name: string, ids: any, pivot?: table<string, any>)
  -> promise: NormNumberPromise
```

Link this record to one or more `target` rows of a `belongs_to_many` relation
by inserting pivot rows. `ids` is a key value, an array of them, or record(s).
`pivot` adds extra columns to each pivot row. Resolves with the number attached.
```lua
    user:attach("roles", { 1, 2 }):await()
    user:attach("roles", role, { granted_by = adminId }):await()
```

## decrement <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#decrement}

```lua
NormRecord:decrement(column: string, amount?: number)
  -> promise: NormRecordPromise
```

Atomically subtract `amount` (default 1) from a column of this record.

## delete <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#delete}

```lua
NormRecord:delete()
  -> promise: NormRecordPromise
```

Delete this record. For a soft-delete model this sets the `deleted_at` column
(the row stays, but queries exclude it by default); otherwise it physically
removes the row. Resolves with the record.
```lua
    local user = User:find(1):await()
    user:delete():await()
```

## detach <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#detach}

```lua
NormRecord:detach(name: string, ids?: any)
  -> promise: NormNumberPromise
```

Unlink this record from `target` rows of a `belongs_to_many` relation by
deleting pivot rows. With `ids` -> only those; without -> ALL links. Resolves
with the affected row count.
```lua
    user:detach("roles", { 1 }):await()  -- remove one link
    user:detach("roles"):await()          -- remove every link
```

## force_delete <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#force_delete}

```lua
NormRecord:force_delete()
  -> promise: NormRecordPromise
```

Physically DELETE this record by its primary key, even on a soft-delete model.
The record is flagged not-persisted (a later `:save()` re-inserts it). Resolves
with the record. Fires `before_delete` / `after_delete`.

## increment <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#increment}

```lua
NormRecord:increment(column: string, amount?: number)
  -> promise: NormRecordPromise
```

Atomically add `amount` (default 1) to a column of THIS record
(`SET col = col + ?` by primary key — no read-modify-write). Also updates the
in-memory value when it is a number, and resnapshots. Resolves with the record.
```lua
    player:increment("coins", 50):await()  -- player.coins is updated locally too
```

## load <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#load}

```lua
NormRecord:load(name: string)
  -> promise: NormPromise
```

Lazily load a declared relation, cache it on `self[name]`, and resolve with
it. Returns a single record (belongs_to / has_one), nil, or an array (has_many).
```lua
    local author = post:load("author"):await()  -- also sets post.author
    local posts  = user:load("posts"):await()   -- also sets user.posts (array)
```

## reload <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#reload}

```lua
NormRecord:reload()
  -> promise: NormRecordPromise
```

Re-read this record's columns from the database (discarding local changes).
Resolves with the record.
```lua
    user:reload():await()
```

## restore <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#restore}

```lua
NormRecord:restore()
  -> promise: NormRecordPromise
```

Un-delete a soft-deleted record (clears `deleted_at`). Resolves with the record.
```lua
    local post = Post:only_trashed():where("id", 5):first():await()
    post:restore():await()
```

## save <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#save}

```lua
NormRecord:save()
  -> promise: NormRecordPromise
```

Persist the record: INSERT if new, UPDATE (only changed columns) if it was
loaded from the database. Resolves with the record itself.
```lua
    local user = User:find(1):await()
    user.coins = user.coins + 50
    user:save():await()
```

## sync_pivot <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#sync_pivot}

```lua
NormRecord:sync_pivot(name: string, ids: any)
  -> promise: NormPromise
```

Make this record's pivot links for a `belongs_to_many` relation exactly match
`ids`: attach the missing, detach the extra, leave the rest. Resolves with
`{ attached = n, detached = m }`.
```lua
    user:sync_pivot("roles", { 1, 2, 3 }):await()
```

## to_table <Badge type="info" text="method" /> {#to_table}

```lua
NormRecord:to_table()
  -> table<string, any>
```

Plain `{ column = value }` table for this record (e.g. to serialise it).
```lua
    local data = user:to_table() --> { id = 1, name = "John", ... }
```

## trashed <Badge type="info" text="method" /> {#trashed}

```lua
NormRecord:trashed()
  -> boolean
```

Whether this record is currently soft-deleted (its `deleted_at` is set).
