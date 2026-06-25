---
outline: [2, 3]
---

# NormModel <Badge type="info" text="class" />

A model is your handle for a table: CRUD, query entry points, hooks, scopes, and schema.

::: info Auto-generated
This page is generated from the source annotations by `scripts/gen-api.mjs`. Edit the LuaCATS doc comments in the Norm sources, not here.
:::

<small>:link: [Source: `src/model.lua`](https://github.com/JustGodWork/norm/blob/master/src/model.lua#L707)</small>

| Member | Returns | Description |
|---|---|---|
| [`all`](#all) | `NormRecordListPromise` _(async)_ | Resolves with every record in the table. |
| [`autoincrement_pk`](#autoincrement_pk) | — |  |
| [`avg`](#avg) | `NormNumberPromise` _(async)_ | AVG of a column across the whole table. |
| [`build`](#build) | `NormRecord` | Build an *unsaved* record from a data table (nothing hits the database until |
| [`columns`](#columns) | — |  |
| [`columns_by_name`](#columns_by_name) | — |  |
| [`count`](#count) | `NormNumberPromise` _(async)_ | Resolves with the total row count of the table. |
| [`create`](#create) | `NormRecordPromise` _(async)_ | Build and immediately INSERT a record. |
| [`find`](#find) | `NormRecordOrNilPromise` _(async)_ | Find a single record by its primary key. |
| [`find_by`](#find_by) | `NormRecordOrNilPromise` _(async)_ | Find the first record matching a `{ column = value }` filter (ANDed). |
| [`find_or_create`](#find_or_create) | `NormRecordPromise` _(async)_ | Find the first record matching `attributes`; if none exists, INSERT one built |
| [`find_or_new`](#find_or_new) | `NormRecordOrNilPromise` _(async)_ | Find the first record matching `attributes`; if none exists, return an |
| [`group_by`](#group_by) | `NormQueryBuilder` |  |
| [`having`](#having) | `NormQueryBuilder` |  |
| [`hook`](#hook) | `self: NormModel` | Register a lifecycle hook handler. |
| [`hooks`](#hooks) | — | event -> { fn, ... |
| [`indexes`](#indexes) | — | Indexes emitted at sync(). |
| [`insert_many`](#insert_many) | `NormNumberPromise\|NormRecordListPromise` _(async)_ | Bulk-insert many rows in ONE statement. |
| [`join`](#join) | `NormQueryBuilder` |  |
| [`left_join`](#left_join) | `NormQueryBuilder` |  |
| [`limit`](#limit) | `NormQueryBuilder` |  |
| [`max`](#max) | `NormNumberPromise` _(async)_ | MAX of a column across the whole table. |
| [`min`](#min) | `NormNumberPromise` _(async)_ | MIN of a column across the whole table. |
| [`omit`](#omit) | `NormQueryBuilder` |  |
| [`only_trashed`](#only_trashed) | `NormQueryBuilder` | Start a query over ONLY soft-deleted rows (soft-delete models only). |
| [`order`](#order) | `NormQueryBuilder` | dir: |
| [`orm`](#orm) | — |  |
| [`paginate`](#paginate) | `NormPromise` _(async)_ | Paginate the whole table. |
| [`parse`](#parse) | `any` | Convert a raw driver value into a Lua value for the given column (decode). |
| [`primary_key`](#primary_key) | — |  |
| [`query`](#query) | `NormQueryBuilder` | Start a chainable query against this model's table. |
| [`record_class`](#record_class) | — | A single row. |
| [`relations`](#relations) | — |  |
| [`scope`](#scope) | `self: NormModel` | Register a reusable, named query fragment. |
| [`scopes`](#scopes) | — | name -> fn(query, ...), reusable query fragments |
| [`select`](#select) | `NormQueryBuilder` |  |
| [`select_raw`](#select_raw) | `NormQueryBuilder` |  |
| [`serialize`](#serialize) | `any` | Convert a Lua value into something storable for the given column (encode). |
| [`soft_deletes`](#soft_deletes) | — | The soft-delete column name (nil if disabled). |
| [`sum`](#sum) | `NormNumberPromise` _(async)_ | SUM of a column across the whole table. |
| [`sync`](#sync) | `NormBooleanPromise` _(async)_ | Create this model's table (CREATE TABLE IF NOT EXISTS). |
| [`table`](#table) | — |  |
| [`timestamps`](#timestamps) | — | Auto-managed timestamp columns (nil if disabled). |
| [`update_or_create`](#update_or_create) | `NormRecordPromise` _(async)_ | Find the first record matching `attributes` and UPDATE it with `values`; if |
| [`upsert`](#upsert) | `NormRecordOrNilPromise` _(async)_ | **Atomic** upsert: a single `INSERT ... |
| [`where`](#where) | `NormQueryBuilder` | Shortcut for `:query():where(...)`. |
| [`where_between`](#where_between) | `NormQueryBuilder` |  |
| [`where_doesnt_have`](#where_doesnt_have) | `NormQueryBuilder` |  |
| [`where_has`](#where_has) | `NormQueryBuilder` |  |
| [`where_in`](#where_in) | `NormQueryBuilder` |  |
| [`where_like`](#where_like) | `NormQueryBuilder` |  |
| [`where_not`](#where_not) | `NormQueryBuilder` |  |
| [`where_not_in`](#where_not_in) | `NormQueryBuilder` |  |
| [`with_count`](#with_count) | `NormQueryBuilder` |  |
| [`with_trashed`](#with_trashed) | `NormQueryBuilder` | Start a query that INCLUDES soft-deleted rows (soft-delete models only). |
| [`wrap`](#wrap) | `NormRecord` | Wrap a DB row into a persisted record (fires `after_find`). |

## all <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#all}

```lua
NormModel:all()
  -> promise: NormRecordListPromise
```

Resolves with every record in the table.
```lua
    local users = User:all():await()
    for _, u in ipairs(users) do print(u.name) end
```

## autoincrement_pk <Badge type="info" text="field" /> {#autoincrement_pk}

```lua
boolean
```

## avg <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#avg}

```lua
NormModel:avg(column: string)
  -> promise: NormNumberPromise
```

AVG of a column across the whole table.

## build <Badge type="info" text="method" /> {#build}

```lua
NormModel:build(data: table<string, any>)
  -> NormRecord
```

Build an *unsaved* record from a data table (nothing hits the database until
you call `:save()`). Useful to prepare a record then persist it later.
```lua
    local user = User:build({ name = "John" })
    user.email = "john@x.io"
    user:save():await()
```

## columns <Badge type="info" text="field" /> {#columns}

```lua
NormColumn[]
```

## columns_by_name <Badge type="info" text="field" /> {#columns_by_name}

```lua
table<string, NormColumn>
```

## count <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#count}

```lua
NormModel:count()
  -> promise: NormNumberPromise
```

Resolves with the total row count of the table.
```lua
    local total = User:count():await()
```

## create <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#create}

```lua
NormModel:create(data: table<string, any>)
  -> promise: NormRecordPromise
```

Build and immediately INSERT a record. Resolves with the saved record, whose
auto-increment primary key is populated.
```lua
    local user = User:create({ name = "John", email = "john@x.io" }):await()
    print(user.id) --> 1
```

## find <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#find}

```lua
NormModel:find(pk: any)
  -> promise: NormRecordOrNilPromise
```

Find a single record by its primary key. Resolves with the record or nil.
```lua
    local user = User:find(1):await()
    if (user) then print(user.name) end
```

## find_by <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#find_by}

```lua
NormModel:find_by(filter: table<string, any>)
  -> promise: NormRecordOrNilPromise
```

Find the first record matching a `{ column = value }` filter (ANDed).
```lua
    local user = User:find_by({ email = "john@x.io" }):await()
```

## find_or_create <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#find_or_create}

```lua
NormModel:find_or_create(attributes: table<string, any>, values?: table<string, any>)
  -> promise: NormRecordPromise
```

Find the first record matching `attributes`; if none exists, INSERT one built
from `attributes` merged with `values`. Resolves with the (existing or newly
created) record. Not atomic: a unique constraint is the only true guard
against a concurrent double-insert.
```lua
    local player = Player:find_or_create({ account_id = id }, { name = "Guest" }):await()
```

## find_or_new <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#find_or_new}

```lua
NormModel:find_or_new(attributes: table<string, any>, values?: table<string, any>)
  -> promise: NormRecordOrNilPromise
```

Find the first record matching `attributes`; if none exists, return an
**unsaved** record built from `attributes` merged with `values` (nothing is
written until you `:save()` it). Resolves with the record.
```lua
    local u = User:find_or_new({ email = "a@b.c" }, { name = "Anon" }):await()
    if (not u.__persisted) then u:save():await() end
```

## group_by <Badge type="info" text="method" /> {#group_by}

```lua
NormModel:group_by(...string)
  -> NormQueryBuilder
```

## having <Badge type="info" text="method" /> {#having}

```lua
NormModel:having(...any)
  -> NormQueryBuilder
```

## hook <Badge type="info" text="method" /> {#hook}

```lua
NormModel:hook(event: string, fn: fun(record: NormRecord))
  -> self: NormModel
```

Register a lifecycle hook handler. Events: `before_create`, `after_create`,
`before_update`, `after_update`, `before_save`, `after_save`, `before_delete`,
`after_delete`, `after_find`. Handlers run **synchronously** with the record;
a `before_*` handler that raises cancels the operation (the promise rejects).
Convenience methods exist per event (e.g. `Model:before_save(fn)`).
```lua
    User:before_save(function(u) assert(u.name ~= nil, "name required") end)
    User:after_create(function(u) print("created #" .. u.id) end)
```

## hooks <Badge type="info" text="field" /> {#hooks}

```lua
nil
```

event -> { fn, ... }, created on first registration

## indexes <Badge type="info" text="field" /> {#indexes}

```lua
{ name: string, columns: string[], unique: boolean }[]?
```

Indexes emitted at sync().

## insert_many <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#insert_many}

```lua
NormModel:insert_many(rows: table<string, any>[], opts?: { records: boolean })
  -> promise: NormNumberPromise|NormRecordListPromise
```

Bulk-insert many rows in ONE statement. A fast path: it does NOT fire create
hooks. Timestamps are stamped; auto-increment ids are left to the DB; columns
missing from a row are inserted as NULL.

By default (no per-row ids available from a multi-row insert) it resolves with
the affected row count. Pass `{ records = true }` to get the inserted rows back
as records WITH their ids — this uses `INSERT ... RETURNING *` and therefore
requires a RETURNING-capable adapter (SQLite >= 3.35 / PostgreSQL / MariaDB >=
10.5); it **throws** otherwise.
```lua
    local n    = Log:insert_many({ { level = "info" }, { level = "warn" } }):await()
    local recs = Log:insert_many(rows, { records = true }):await()  -- recs[1].id, …
```

## join <Badge type="info" text="method" /> {#join}

```lua
NormModel:join(...any)
  -> NormQueryBuilder
```

## left_join <Badge type="info" text="method" /> {#left_join}

```lua
NormModel:left_join(...any)
  -> NormQueryBuilder
```

## limit <Badge type="info" text="method" /> {#limit}

```lua
NormModel:limit(...any)
  -> NormQueryBuilder
```

## max <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#max}

```lua
NormModel:max(column: string)
  -> promise: NormNumberPromise
```

MAX of a column across the whole table.

## min <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#min}

```lua
NormModel:min(column: string)
  -> promise: NormNumberPromise
```

MIN of a column across the whole table.

## omit <Badge type="info" text="method" /> {#omit}

```lua
NormModel:omit(...string|string[])
  -> NormQueryBuilder
```

## only_trashed <Badge type="info" text="method" /> {#only_trashed}

```lua
NormModel:only_trashed()
  -> NormQueryBuilder
```

Start a query over ONLY soft-deleted rows (soft-delete models only).

## order <Badge type="info" text="method" /> {#order}

```lua
NormModel:order(...any)
  -> NormQueryBuilder
```

```lua
dir:
   | "ASC"
   | "DESC"
```

## orm <Badge type="info" text="field" /> {#orm}

```lua
NormOrm
```

## paginate <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#paginate}

```lua
NormModel:paginate(page?: number, per_page?: number)
  -> NormPromise
```

Paginate the whole table. See `NormQueryBuilder:paginate`.

## parse <Badge type="info" text="method" /> {#parse}

```lua
NormModel:parse(column: NormColumn, value: any)
  -> any
```

Convert a raw driver value into a Lua value for the given column (decode).

## primary_key <Badge type="info" text="field" /> {#primary_key}

```lua
string?
```

## query <Badge type="info" text="method" /> {#query}

```lua
NormModel:query()
  -> NormQueryBuilder
```

Start a chainable query against this model's table.
```lua
    local admins = User:query():where("admin", true):order("name"):all():await()
```

## record_class <Badge type="info" text="field" /> {#record_class}

```lua
NormRecord
```

A single row. Column values are plain fields (e.g. `record.name`).

## relations <Badge type="info" text="field" /> {#relations}

```lua
table<string, NormRelation>
```

## scope <Badge type="info" text="method" /> {#scope}

```lua
NormModel:scope(name: string, fn: fun(query: NormQueryBuilder, ...any))
  -> self: NormModel
```

Register a reusable, named query fragment. `fn(query, ...)` applies conditions
to a query builder. The scope becomes callable as a starter (`Model:active()`)
and chainable (`query:scope("active")`). The name must not collide with a
built-in method.
```lua
    User:scope("active", function(q) q:where("active", true) end)
    User:scope("older_than", function(q, age) q:where("age", ">", age) end)
    User:active():scope("older_than", 18):all():await()
```

## scopes <Badge type="info" text="field" /> {#scopes}

```lua
nil
```

name -> fn(query, ...), reusable query fragments

## select <Badge type="info" text="method" /> {#select}

```lua
NormModel:select(...string|string[])
  -> NormQueryBuilder
```

## select_raw <Badge type="info" text="method" /> {#select_raw}

```lua
NormModel:select_raw(expr: string)
  -> NormQueryBuilder
```

## serialize <Badge type="info" text="method" /> {#serialize}

```lua
NormModel:serialize(column: NormColumn, value: any)
  -> any
```

Convert a Lua value into something storable for the given column (encode).
Only `json` tables are transformed; a value already a string is passed
through (so a pre-encoded string is never double-encoded).

## soft_deletes <Badge type="info" text="field" /> {#soft_deletes}

```lua
string?
```

The soft-delete column name (nil if disabled).

## sum <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#sum}

```lua
NormModel:sum(column: string)
  -> promise: NormNumberPromise
```

SUM of a column across the whole table.
```lua
    local total = User:sum("coins"):await()
```

## sync <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#sync}

```lua
NormModel:sync()
  -> promise: NormBooleanPromise
```

Create this model's table (CREATE TABLE IF NOT EXISTS). Prefer `orm:sync()`
to create every model at once (it also orders tables by their foreign-key
dependencies). Emits this model's `belongsTo` foreign keys when enabled.
Resolves with true.
```lua
    User:sync():await()
```

## table <Badge type="info" text="field" /> {#table}

```lua
string
```

## timestamps <Badge type="info" text="field" /> {#timestamps}

```lua
{ created: string, updated: string }?
```

Auto-managed timestamp columns (nil if disabled).

## update_or_create <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#update_or_create}

```lua
NormModel:update_or_create(attributes: table<string, any>, values?: table<string, any>)
  -> promise: NormRecordPromise
```

Find the first record matching `attributes` and UPDATE it with `values`; if
none exists, INSERT one from `attributes` merged with `values`. Resolves with
the record. (Application-level upsert; not atomic.)
```lua
    local p = Player:update_or_create({ account_id = id }, { last_seen = now, name = nick }):await()
```

## upsert <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#upsert}

```lua
NormModel:upsert(data: table<string, any>, opts?: { conflict: string[], update: string[] })
  -> promise: NormRecordOrNilPromise
```

**Atomic** upsert: a single `INSERT ... ON CONFLICT/ON DUPLICATE KEY UPDATE`
statement (race-safe, unlike `find_or_create`). `data` is inserted; if a row
with the same `opts.conflict` columns exists it is updated instead. The write
is one statement; the canonical row is then read back and resolved as a record.

The conflict columns MUST carry a UNIQUE (or PRIMARY KEY) constraint — that is
what the database matches on. `opts.conflict` defaults to the primary key;
`opts.update` defaults to every written column except the conflict columns (and
`created_at`, preserved on an existing row).
```lua
    -- create the player, or update name/last_seen if account_id already exists
    local p = Player:upsert(
        { account_id = id, name = nick, last_seen = ts },
        { conflict = { "account_id" } }
    ):await()
```

## where <Badge type="info" text="method" /> {#where}

```lua
NormModel:where(...any)
  -> NormQueryBuilder
```

Shortcut for `:query():where(...)`. Accepts `(col, value)`, `(col, op, value)`
or a `{ col = value }` table.
```lua
    local rich = User:where("coins", ">", 100):all():await()
    local john = User:where({ name = "John" }):first():await()
```

## where_between <Badge type="info" text="method" /> {#where_between}

```lua
NormModel:where_between(column: string, min: any, max: any)
  -> NormQueryBuilder
```

## where_doesnt_have <Badge type="info" text="method" /> {#where_doesnt_have}

```lua
NormModel:where_doesnt_have(name: string, configure?: fun(q: NormQueryBuilder))
  -> NormQueryBuilder
```

## where_has <Badge type="info" text="method" /> {#where_has}

```lua
NormModel:where_has(name: string, configure?: fun(q: NormQueryBuilder))
  -> NormQueryBuilder
```

## where_in <Badge type="info" text="method" /> {#where_in}

```lua
NormModel:where_in(column: string, list: any[])
  -> NormQueryBuilder
```

## where_like <Badge type="info" text="method" /> {#where_like}

```lua
NormModel:where_like(column: string, pattern: string)
  -> NormQueryBuilder
```

## where_not <Badge type="info" text="method" /> {#where_not}

```lua
NormModel:where_not(column: string, value: any)
  -> NormQueryBuilder
```

## where_not_in <Badge type="info" text="method" /> {#where_not_in}

```lua
NormModel:where_not_in(column: string, list: any[])
  -> NormQueryBuilder
```

## with_count <Badge type="info" text="method" /> {#with_count}

```lua
NormModel:with_count(...string)
  -> NormQueryBuilder
```

## with_trashed <Badge type="info" text="method" /> {#with_trashed}

```lua
NormModel:with_trashed()
  -> NormQueryBuilder
```

Start a query that INCLUDES soft-deleted rows (soft-delete models only).

## wrap <Badge type="info" text="method" /> {#wrap}

```lua
NormModel:wrap(row: table<string, any>)
  -> NormRecord
```

Wrap a DB row into a persisted record (fires `after_find`).
