# LuaLS


---

# Norm

 Public API surface of Norm (the value returned by the bundle / global `Norm`).

## Adapter


```lua
NormAdapter
```

Base adapter class — extend (or duck-type) for custom adapters.

## Orm


```lua
NormOrm
```

The ORM root class.

## adapters


```lua
NormAdapters
```

Built-in adapters.

## class


```lua
LightClassFactory
```

The (separately loaded) class system.

## dialect


```lua
NormDialects
```

Built-in SQL dialects.

## json


```lua
NormJsonLib
```

JSON providers (`nanos`/`rapidjson`/`raw`/`detect`/`define`) for `json` columns.

## new


```lua
function Norm.new(options: NormOptions)
  -> NormOrm
```

 Create a new ORM instance from an adapter (and optionally a promise provider).
 This is the entry point: build it once, then `:define` your models.
 ```lua
     local db = Norm.new({
         adapter = Norm.adapters.nanos.new({ engine = DatabaseEngine.SQLite, connection = "./game.db" }),
         -- promise = Norm.promise.nanos(Promise), -- optional; auto-detected on nanos
         log = true,
     })

     local User = db:define("users", { id = Norm.types.id(), name = Norm.types.string() })
     db:sync():await()
 ```

## promise


```lua
NormPromiseLib
```

Promise providers + builders.

## types


```lua
NormTypes
```

Column type factories.


---

# NormAdapter

## __init


```lua
(method) NormAdapter:__init(options?: NormAdapterOptions)
```

## _dialect_name


```lua
string
```

## default_json_provider


```lua
(method) NormAdapter:default_json_provider()
  -> NormJsonProvider|nil
```

 Optional: the JSON provider native to this adapter's framework, used to
 (de)serialise `json` columns. Returning nil lets the ORM auto-detect one.

## default_provider


```lua
(method) NormAdapter:default_provider()
  -> NormPromiseProvider|nil
```

 Optional: the promise provider native to this adapter's framework.

## get_dialect


```lua
(method) NormAdapter:get_dialect()
  -> NormDialect
```

 Resolved dialect object.

## get_dialect_name


```lua
(method) NormAdapter:get_dialect_name()
  -> "mysql"|"sqlite"
```

 The dialect name this adapter speaks. Override per engine.

```lua
return #1:
    | "mysql"
    | "sqlite"
```

## options


```lua
NormAdapterOptions
```

## raw_execute


```lua
(method) NormAdapter:raw_execute(query: string, params: any[], callback: NormExecuteCallback)
```

 Run a write statement. Must be overridden.

## raw_query


```lua
(method) NormAdapter:raw_query(query: string, params: any[], callback: NormQueryCallback)
```

 Run a SELECT. Must be overridden.

## supports_returning


```lua
(method) NormAdapter:supports_returning()
  -> boolean
```

 Optional: whether this adapter's engine supports `INSERT ... RETURNING <col>`
 (SQLite >= 3.35, PostgreSQL). When true, the ORM reads a new row's
 auto-increment id atomically from the INSERT itself, instead of a separate
 `LAST_INSERT_ID()` / `last_insert_rowid()` query — which is connection-scoped
 and therefore unreliable across a connection pool. Defaults to false.

## supports_transactions


```lua
(method) NormAdapter:supports_transactions()
  -> boolean
```

 Optional: whether this adapter can run an interactive transaction on a pinned
 connection. Defaults to false → `db:transaction(...)` throws on this adapter.
 An adapter that returns true MUST implement `transaction(body, finish)`:
   * the adapter opens the transaction, then calls `body(tx_query, tx_execute)`
     where `tx_query(q, p, cb)` / `tx_execute(q, p, cb)` run on the transaction;
   * `body` returns `true` to COMMIT, `false` to ROLL BACK;
   * the adapter commits/rolls back, then calls `finish(err)` (err nil on commit).


---

# NormAdapterOptions

## [string]


```lua
any
```

Adapter-specific options.

## dialect


```lua
("mysql"|"sqlite")?
```

Overrides the adapter's default dialect.


---

# NormAdapters

## nanos


```lua
NormNanosAdapterModule
```

## oxmysql


```lua
NormOxMySQLAdapterModule
```


---

# NormBooleanPromise

## __init


```lua
(method) NormPromise:__init(executor?: fun(resolve: fun(value: any), reject: fun(reason: any)))
```

## _await_co


```lua
thread?
```

## _queue


```lua
fun(state: string, value: any)[]
```

## _settle


```lua
(method) NormPromise:_settle(state: any, value: any)
```

## _state


```lua
"fulfilled"|"pending"|"rejected"
```

## _value


```lua
any
```

## await


```lua
fun(self: NormBooleanPromise):boolean
```

## catch


```lua
(method) NormPromise:catch(on_rejected: fun(reason: any):any)
  -> NormPromise
```

## next


```lua
fun(self: NormBooleanPromise, on_fulfilled?: fun(value: boolean):any, on_rejected?):fun(reason: any):any
```

): NormPromise


---

# NormColumn

## autoincrement


```lua
boolean?
```

## default


```lua
any
```

Literal value, or `Norm.types.raw(...)` for raw SQL.

## index


```lua
boolean?
```

Emit a (non-unique) index on this column at `sync()`.

## kind


```lua
NormColumnKind
```

## length


```lua
number?
```

Length for VARCHAR columns.

## name


```lua
string?
```

Set by `define()` from the schema key.

## nullable


```lua
boolean?
```

Defaults to true (false for primary keys).

## primary


```lua
boolean?
```

## unique


```lua
boolean?
```


---

# NormColumnKind


---

# NormColumnOptions

## autoincrement


```lua
boolean?
```

## default


```lua
any
```

Literal value, or `Norm.types.raw(...)` for raw SQL.

## index


```lua
boolean?
```

Emit a (non-unique) index on this column at `sync()`.

## length


```lua
number?
```

Length for VARCHAR columns.

## nullable


```lua
boolean?
```

Defaults to true (false for primary keys).

## primary


```lua
boolean?
```

## unique


```lua
boolean?
```


---

# NormDefineOptions

 Options controlling how a model behaves (3rd arg of `define`).

## hooks


```lua
table<string, fun(record: NormRecord)|fun(record: NormRecord)[]>?
```

Lifecycle hooks per event (see `NormModel:hook`), as a single handler or a list.

## indexes


```lua
{ columns: string[], column: string, unique: boolean, name: string }[]?
```

Table indexes emitted at `sync()` (composite via `columns`, single via `column`).

## scopes


```lua
table<string, fun(query: NormQueryBuilder, ...any)>?
```

Named reusable query fragments (see `NormModel:scope`).

## soft_deletes


```lua
(boolean|{ column: string })?
```

Mark rows deleted (set a `deleted_at`) instead of removing them; queries then exclude them by default. `true` uses `deleted_at`; pass a table to rename.

## timestamps


```lua
(boolean|{ created: string, updated: string })?
```

Auto-manage created_at/updated_at (Norm-side, UTC; portable across SQLite/MySQL). `true` uses the default names; pass a table to rename.


---

# NormDialect

## autoincrement


```lua
string
```

## name


```lua
string
```

## placeholder


```lua
fun(index: number):string
```

## quote


```lua
fun(id: string):string
```

## table_suffix


```lua
string
```

## types


```lua
table<string, string>
```


---

# NormDialects

 SQL dialects: the small syntactic differences between database engines.
 Adapters expose a dialect so the SQL builder stays engine agnostic.

## get


```lua
function NormDialects.get(name: string)
  -> NormDialect
```

## mysql


```lua
NormDialect
```

## sqlite


```lua
NormDialect
```


---

# NormExecResult

## affectedRows


```lua
number?
```

## insertId


```lua
any
```


---

# NormExecResultPromise

## __init


```lua
(method) NormPromise:__init(executor?: fun(resolve: fun(value: any), reject: fun(reason: any)))
```

## _await_co


```lua
thread?
```

## _queue


```lua
fun(state: string, value: any)[]
```

## _settle


```lua
(method) NormPromise:_settle(state: any, value: any)
```

## _state


```lua
"fulfilled"|"pending"|"rejected"
```

## _value


```lua
any
```

## await


```lua
fun(self: NormExecResultPromise):NormExecResult
```

## catch


```lua
(method) NormPromise:catch(on_rejected: fun(reason: any):any)
  -> NormPromise
```

## next


```lua
fun(self: NormExecResultPromise, on_fulfilled?: fun(value: NormExecResult):any, on_rejected?):fun(reason: any):any
```

): NormPromise


---

# NormExecuteCallback


---

# NormForeignKey

 A foreign-key constraint to emit inside CREATE TABLE.

## column


```lua
string
```

FK column on this table.

## on_delete


```lua
string?
```

Referential action (e.g. "CASCADE").

## on_update


```lua
string?
```

Referential action (e.g. "CASCADE").

## ref_column


```lua
string
```

Referenced column.

## ref_table


```lua
string
```

Referenced table.


---

# NormHaving

## expr


```lua
string
```

Raw SQL expression (NOT quoted), e.g. "COUNT(*)".

## op


```lua
string
```

Operator.

## value


```lua
any
```

Bound parameter.


---

# NormJoin

## first


```lua
string
```

Left column ref of the ON condition (e.g. "users.id").

## op


```lua
string
```

ON operator.

## second


```lua
string
```

Right column ref of the ON condition (e.g. "posts.user_id").

## table


```lua
string
```

Joined table.

## type


```lua
"INNER"|"LEFT"
```

Join type.


---

# NormJsonLib

## define


```lua
function NormJsonLib.define(spec: NormJsonProvider)
  -> NormJsonProvider
```

 Validate a custom provider (a table with `encode`/`decode`) and return it.
 ```lua
     local provider = Norm.json.define({
         name = "dkjson",
         encode = function(v) return dkjson.encode(v) end,
         decode = function(s) return dkjson.decode(s) end,
     })
 ```

## detect


```lua
function NormJsonLib.detect()
  -> NormJsonProvider
```

 Auto-detect the host's JSON library: Nanos `JSON`, then a Lua/FiveM `json`,
 else the no-op `raw` provider. Used when no `json` option is configured and
 the adapter offers no default.

## nanos


```lua
function NormJsonLib.nanos(JSON?: table)
  -> NormJsonProvider
```

 Wrap the Nanos World `JSON` class (`stringify` / `parse`). Defaults to the
 global `JSON`. On nanos this is auto-detected, so you rarely pass it.
 ```lua
     local db = Norm.new({ adapter = a, json = Norm.json.nanos(JSON) })
 ```

@*param* `JSON` — The Nanos `JSON` class (defaults to `_ENV.JSON`).

## rapidjson


```lua
function NormJsonLib.rapidjson(lib?: table)
  -> NormJsonProvider
```

 Wrap a Lua/FiveM-style library exposing `encode` / `decode` (e.g. FiveM's
 global `json` / rapidjson, or a dkjson-like table). Defaults to the global `json`.
 ```lua
     local db = Norm.new({ adapter = a, json = Norm.json.rapidjson() }) -- uses _ENV.json
 ```

@*param* `lib` — The JSON library (defaults to `_ENV.json`).

## raw


```lua
function NormJsonLib.raw()
  -> NormJsonProvider
```

 No-op provider: `json` columns are stored and returned as raw strings (Norm's
 behaviour before JSON providers existed). Use it to opt out of automatic
 (de)serialisation: `Norm.new({ ..., json = false })` resolves to this.


---

# NormJsonProvider

 A JSON provider plugs a host's JSON library into Norm.

## decode


```lua
fun(text: string):any
```

## encode


```lua
fun(value: any):string
```

## name


```lua
string
```


---

# NormMigration

## id


```lua
string
```

Unique, stable identifier (applied once). Order them by sorting-friendly ids.

## up


```lua
fun(m: table)
```

Receives the schema builder; record changes via m:add_column(...) etc.


---

# NormModel

## __init


```lua
(method) NormModel:__init(orm: NormOrm, table_name: string, columns: NormColumn[], record_class: NormRecord)
```

## _encode_write


```lua
(method) NormModel:_encode_write(data: table<string, any>)
  -> table<string, any>
```

 Encode a `{ column = value }` write payload (INSERT/UPDATE) column by column.

## _find_by_attrs


```lua
(method) NormModel:_find_by_attrs(attributes: table<string, any>, cb: fun(err: any, record?: NormRecord))
```

 Callback-based "first row matching an ANDed `{ col = value }` filter". Used by
 the `*OrCreate` helpers (which must compose without promise chaining).

## _fire


```lua
(method) NormModel:_fire(event: string, record: NormRecord)
```

 Run every handler registered for `event`, in registration order.

## _has_hooks


```lua
boolean
```

 fast-path flag so hook-less models pay nothing

## all


```lua
(method) NormModel:all()
  -> promise: NormRecordListPromise
```

 Resolves with every record in the table.
 ```lua
     local users = User:all():await()
     for _, u in ipairs(users) do print(u.name) end
 ```

@*return* `promise` — resolving to NormRecord[]

## autoincrement_pk


```lua
boolean
```

## avg


```lua
(method) NormModel:avg(column: string)
  -> promise: NormNumberPromise
```

 AVG of a column across the whole table.

@*return* `promise` — resolving to number

## build


```lua
(method) NormModel:build(data: table<string, any>)
  -> NormRecord
```

 Build an *unsaved* record from a data table (nothing hits the database until
 you call `:save()`). Useful to prepare a record then persist it later.
 ```lua
     local user = User:build({ name = "John" })
     user.email = "john@x.io"
     user:save():await()
 ```

## columns


```lua
NormColumn[]
```

## columns_by_name


```lua
table<string, NormColumn>
```

## count


```lua
(method) NormModel:count()
  -> promise: NormNumberPromise
```

 Resolves with the total row count of the table.
 ```lua
     local total = User:count():await()
 ```

@*return* `promise` — resolving to number

## create


```lua
(method) NormModel:create(data: table<string, any>)
  -> promise: NormRecordPromise
```

 Build and immediately INSERT a record. Resolves with the saved record, whose
 auto-increment primary key is populated.
 ```lua
     local user = User:create({ name = "John", email = "john@x.io" }):await()
     print(user.id) --> 1
 ```

@*return* `promise` — resolving to NormRecord

## find


```lua
(method) NormModel:find(pk: any)
  -> promise: NormRecordOrNilPromise
```

 Find a single record by its primary key. Resolves with the record or nil.
 ```lua
     local user = User:find(1):await()
     if (user) then print(user.name) end
 ```

@*return* `promise` — resolving to NormRecord|nil

## find_by


```lua
(method) NormModel:find_by(filter: table<string, any>)
  -> promise: NormRecordOrNilPromise
```

 Find the first record matching a `{ column = value }` filter (ANDed).
 ```lua
     local user = User:find_by({ email = "john@x.io" }):await()
 ```

@*return* `promise` — resolving to NormRecord|nil

## find_or_create


```lua
(method) NormModel:find_or_create(attributes: table<string, any>, values?: table<string, any>)
  -> promise: NormRecordPromise
```

 Find the first record matching `attributes`; if none exists, INSERT one built
 from `attributes` merged with `values`. Resolves with the (existing or newly
 created) record. Not atomic: a unique constraint is the only true guard
 against a concurrent double-insert.
 ```lua
     local player = Player:find_or_create({ account_id = id }, { name = "Guest" }):await()
 ```

@*param* `attributes` — Columns to match on (and seed a new record).

@*param* `values` — Extra columns applied only when creating.

@*return* `promise` — resolving to NormRecord

## find_or_new


```lua
(method) NormModel:find_or_new(attributes: table<string, any>, values?: table<string, any>)
  -> promise: NormRecordOrNilPromise
```

 Find the first record matching `attributes`; if none exists, return an
 **unsaved** record built from `attributes` merged with `values` (nothing is
 written until you `:save()` it). Resolves with the record.
 ```lua
     local u = User:find_or_new({ email = "a@b.c" }, { name = "Anon" }):await()
     if (not u.__persisted) then u:save():await() end
 ```

@*param* `attributes` — Columns to match on.

@*param* `values` — Extra columns for a freshly built record.

@*return* `promise` — resolving to NormRecord

## group_by


```lua
(method) NormModel:group_by(...string)
  -> NormQueryBuilder
```

## having


```lua
(method) NormModel:having(...any)
  -> NormQueryBuilder
```

## hook


```lua
(method) NormModel:hook(event: string, fn: fun(record: NormRecord))
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

## hooks


```lua
nil
```

 event -> { fn, ... }, created on first registration

## indexes


```lua
{ name: string, columns: string[], unique: boolean }[]?
```

Indexes emitted at sync().

## insert_many


```lua
(method) NormModel:insert_many(rows: table<string, any>[], opts?: { records: boolean })
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

@*return* `promise` — resolving to a count, or records

## join


```lua
(method) NormModel:join(...any)
  -> NormQueryBuilder
```

## left_join


```lua
(method) NormModel:left_join(...any)
  -> NormQueryBuilder
```

## limit


```lua
(method) NormModel:limit(...any)
  -> NormQueryBuilder
```

## max


```lua
(method) NormModel:max(column: string)
  -> promise: NormNumberPromise
```

 MAX of a column across the whole table.

@*return* `promise` — resolving to the column's value type

## min


```lua
(method) NormModel:min(column: string)
  -> promise: NormNumberPromise
```

 MIN of a column across the whole table.

@*return* `promise` — resolving to the column's value type

## omit


```lua
(method) NormModel:omit(...string|string[])
  -> NormQueryBuilder
```

## only_trashed


```lua
(method) NormModel:only_trashed()
  -> NormQueryBuilder
```

 Start a query over ONLY soft-deleted rows (soft-delete models only).

## order


```lua
(method) NormModel:order(...any)
  -> NormQueryBuilder
```

```lua
dir:
    | "ASC"
    | "DESC"
```

## orm


```lua
NormOrm
```

## paginate


```lua
(method) NormModel:paginate(page?: number, per_page?: number)
  -> NormPromise
```

 Paginate the whole table. See `NormQueryBuilder:paginate`.

## parse


```lua
(method) NormModel:parse(column: NormColumn, value: any)
  -> any
```

 Convert a raw driver value into a Lua value for the given column (decode).

## primary_key


```lua
string?
```

## query


```lua
(method) NormModel:query()
  -> NormQueryBuilder
```

 Start a chainable query against this model's table.
 ```lua
     local admins = User:query():where("admin", true):order("name"):all():await()
 ```

## record_class


```lua
NormRecord
```

 A single row. Column values are plain fields (e.g. `record.name`).

## relations


```lua
table<string, NormRelation>
```

## scope


```lua
(method) NormModel:scope(name: string, fn: fun(query: NormQueryBuilder, ...any))
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

## scopes


```lua
nil
```

 name -> fn(query, ...), reusable query fragments

## select


```lua
(method) NormModel:select(...string|string[])
  -> NormQueryBuilder
```

## select_raw


```lua
(method) NormModel:select_raw(expr: string)
  -> NormQueryBuilder
```

## serialize


```lua
(method) NormModel:serialize(column: NormColumn, value: any)
  -> any
```

 Convert a Lua value into something storable for the given column (encode).
 Only `json` tables are transformed; a value already a string is passed
 through (so a pre-encoded string is never double-encoded).

## soft_deletes


```lua
string?
```

The soft-delete column name (nil if disabled).

## sum


```lua
(method) NormModel:sum(column: string)
  -> promise: NormNumberPromise
```

 SUM of a column across the whole table.
 ```lua
     local total = User:sum("coins"):await()
 ```

@*return* `promise` — resolving to number

## sync


```lua
(method) NormModel:sync()
  -> promise: NormBooleanPromise
```

 Create this model's table (CREATE TABLE IF NOT EXISTS). Prefer `orm:sync()`
 to create every model at once (it also orders tables by their foreign-key
 dependencies). Emits this model's `belongsTo` foreign keys when enabled.
 Resolves with true.
 ```lua
     User:sync():await()
 ```

@*return* `promise` — resolving to true

## table


```lua
string
```

## timestamps


```lua
{ created: string, updated: string }?
```

Auto-managed timestamp columns (nil if disabled).

## update_or_create


```lua
(method) NormModel:update_or_create(attributes: table<string, any>, values?: table<string, any>)
  -> promise: NormRecordPromise
```

 Find the first record matching `attributes` and UPDATE it with `values`; if
 none exists, INSERT one from `attributes` merged with `values`. Resolves with
 the record. (Application-level upsert; not atomic.)
 ```lua
     local p = Player:update_or_create({ account_id = id }, { last_seen = now, name = nick }):await()
 ```

@*param* `attributes` — Columns to match on (and seed a new record).

@*param* `values` — Columns to write (on both update and create).

@*return* `promise` — resolving to NormRecord

## upsert


```lua
(method) NormModel:upsert(data: table<string, any>, opts?: { conflict: string[], update: string[] })
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

@*param* `data` — Columns to insert (and update on conflict).

@*return* `promise` — resolving to NormRecord

## where


```lua
(method) NormModel:where(...any)
  -> NormQueryBuilder
```

 Shortcut for `:query():where(...)`. Accepts `(col, value)`, `(col, op, value)`
 or a `{ col = value }` table.
 ```lua
     local rich = User:where("coins", ">", 100):all():await()
     local john = User:where({ name = "John" }):first():await()
 ```

## where_between


```lua
(method) NormModel:where_between(column: string, min: any, max: any)
  -> NormQueryBuilder
```

## where_doesnt_have


```lua
(method) NormModel:where_doesnt_have(name: string, configure?: fun(q: NormQueryBuilder))
  -> NormQueryBuilder
```

## where_has


```lua
(method) NormModel:where_has(name: string, configure?: fun(q: NormQueryBuilder))
  -> NormQueryBuilder
```

## where_in


```lua
(method) NormModel:where_in(column: string, list: any[])
  -> NormQueryBuilder
```

## where_like


```lua
(method) NormModel:where_like(column: string, pattern: string)
  -> NormQueryBuilder
```

## where_not


```lua
(method) NormModel:where_not(column: string, value: any)
  -> NormQueryBuilder
```

## where_not_in


```lua
(method) NormModel:where_not_in(column: string, list: any[])
  -> NormQueryBuilder
```

## with_count


```lua
(method) NormModel:with_count(...string)
  -> NormQueryBuilder
```

## with_trashed


```lua
(method) NormModel:with_trashed()
  -> NormQueryBuilder
```

 Start a query that INCLUDES soft-deleted rows (soft-delete models only).

## wrap


```lua
(method) NormModel:wrap(row: table<string, any>)
  -> NormRecord
```

 Wrap a DB row into a persisted record (fires `after_find`).


---

# NormModelModule

## Model


```lua
NormModel
```

## Record


```lua
NormRecord
```

 A single row. Column values are plain fields (e.g. `record.name`).

## define


```lua
fun(orm: NormOrm, table_name: string, schema: table<string, NormColumn>):NormModel
```


---

# NormNanosAdapter

## __init


```lua
(method) NormNanosAdapter:__init(options?: NormNanosAdapterOptions)
```

## _dialect_name


```lua
string
```

## _resolved_dialect


```lua
"mysql"|"sqlite"
```

## _supports_returning


```lua
boolean
```

## database


```lua
table
```

The underlying nanos `Database`.

## default_json_provider


```lua
(method) NormNanosAdapter:default_json_provider()
  -> NormJsonProvider|nil
```

 Nanos exposes a global `JSON` class (`stringify`/`parse`); use it to
 (de)serialise `json` columns automatically.

## default_provider


```lua
(method) NormNanosAdapter:default_provider()
  -> NormPromiseProvider|nil
```

 If nanos-promise is loaded in this package (global `Promise`), use it.
 No cross-package import: the nanos package is expected to bundle nanos-promise.

## get_dialect


```lua
(method) NormAdapter:get_dialect()
  -> NormDialect
```

 Resolved dialect object.

## get_dialect_name


```lua
(method) NormNanosAdapter:get_dialect_name()
  -> "mysql"|"sqlite"
```

```lua
return #1:
    | "mysql"
    | "sqlite"
```

## options


```lua
NormAdapterOptions
```

## raw_execute


```lua
(method) NormNanosAdapter:raw_execute(query: string, params: any[], callback: NormExecuteCallback)
```

 Run a write. For models on SQLite/PostgreSQL the id is fetched via `INSERT ...
 RETURNING` (see the model layer), so this path is only used for those engines
 by raw `execute()` calls. On MySQL (no RETURNING) inserts fall back to a
 separate `LAST_INSERT_ID()` query: this is best-effort, because that function
 is connection-scoped and the pool may run it on another connection. Prefer a
 client-generated id (or `pool_size = 1`) if a correct insertId is critical on
 MySQL + nanos.

## raw_query


```lua
(method) NormNanosAdapter:raw_query(query: string, params: any[], callback: NormQueryCallback)
```

## supports_returning


```lua
(method) NormNanosAdapter:supports_returning()
  -> boolean
```

 SQLite, PostgreSQL and MariaDB (>= 10.5, auto-detected at init) support
 `INSERT ... RETURNING`, letting the ORM fetch a new id atomically (pool-safe).
 Real MySQL does not, and falls back to a best-effort `LAST_INSERT_ID()` query
 (see `raw_execute`).

## supports_transactions


```lua
(method) NormNanosAdapter:supports_transactions()
  -> boolean
```

 Nanos' `Database` exposes no transaction API (no Begin/Commit, no connection
 pinning across the pool), so transactions are unavailable: `db:transaction(...)`
 throws rather than silently running non-atomically.


---

# NormNanosAdapterModule

## class


```lua
NormNanosAdapter
```

## new


```lua
function NormNanosAdapterModule.new(options?: NormNanosAdapterOptions)
  -> NormNanosAdapter
```

 Create a Nanos adapter instance (opens/pools a `Database` and logs the
 connection). Pass it to `Norm.new`.
 ```lua
     local adapter = Norm.adapters.nanos.new({
         engine = DatabaseEngine.SQLite,
         connection = "./game.db",
         pool_size = 4, -- optional
     })
     local db = Norm.new({ adapter = adapter })
 ```


---

# NormNanosAdapterOptions

## [string]


```lua
any
```

Adapter-specific options.

## connection


```lua
string?
```

Connection string / file path.

## database


```lua
table?
```

An already-built nanos `Database` instance to reuse.

## dialect


```lua
("mysql"|"sqlite")?
```

Overrides the adapter's default dialect.

## engine


```lua
integer?
```

A `DatabaseEngine` enum value (required unless `database` is given).

## pool_size


```lua
integer?
```

Number of pooled connections (nanos default if omitted).

## returning


```lua
boolean?
```

Force `INSERT ... RETURNING` on/off. Default: auto — on for SQLite/PostgreSQL, auto-detected for MariaDB >= 10.5 (off for real MySQL).


---

# NormNumberPromise

## __init


```lua
(method) NormPromise:__init(executor?: fun(resolve: fun(value: any), reject: fun(reason: any)))
```

## _await_co


```lua
thread?
```

## _queue


```lua
fun(state: string, value: any)[]
```

## _settle


```lua
(method) NormPromise:_settle(state: any, value: any)
```

## _state


```lua
"fulfilled"|"pending"|"rejected"
```

## _value


```lua
any
```

## await


```lua
fun(self: NormNumberPromise):number
```

## catch


```lua
(method) NormPromise:catch(on_rejected: fun(reason: any):any)
  -> NormPromise
```

## next


```lua
fun(self: NormNumberPromise, on_fulfilled?: fun(value: number):any, on_rejected?):fun(reason: any):any
```

): NormPromise


---

# NormOptions

## adapter


```lua
NormAdapter
```

Required. An adapter instance (or duck-typed table).

## foreignKeys


```lua
(boolean|"auto")?
```

Emit SQL FOREIGN KEY constraints from `belongsTo` relations. `"auto"` (default) emits on MySQL, skips on SQLite (with a one-time warning); `true` always emits; `false` never emits (no warning).

## json


```lua
("auto"|NormJsonProvider|false)?
```

JSON provider for `json` columns. `"auto"` (default) uses the adapter's, else auto-detects (Nanos `JSON` / Lua `json`), else raw passthrough; `false` disables (de)serialisation.

## log


```lua
boolean?
```

Log every executed statement.

## logger


```lua
fun(level: string, message: string)?
```

## promise


```lua
NormPromiseProvider?
```

Promise provider. Defaults to the adapter's, else built-in.

## queue_until_ready


```lua
boolean?
```

Hold data operations in a queue until the first successful `sync()`/`migrate()`, then flush them (default false: run immediately).


---

# NormOrder

## column


```lua
string
```

## dir


```lua
"ASC"|"DESC"
```


---

# NormOrm

## __init


```lua
(method) NormOrm:__init(options: NormOptions)
```

## _collect_foreign_keys


```lua
(method) NormOrm:_collect_foreign_keys(model: NormModel)
  -> NormForeignKey[]
```

 Internal: the FOREIGN KEY constraints to emit for a model, derived from its
 `belongs_to` relations (the side that physically holds the FK column). The
 referenced column defaults to the target's primary key, resolved here because
 the target may have been defined after this model.

## _execute_map


```lua
(method) NormOrm:_execute_map(query: string, params?: any[], transform: fun(result: NormExecResult):any)
  -> promise: NormPromise
```

 Run a write statement and transform the result inside the promise.

@*return* `promise` — resolving to the transform result

## _flush_ready


```lua
(method) NormOrm:_flush_ready()
```

 Mark the ORM ready and replay any queued operations in FIFO order. No-op if
 already ready. Called by `sync()`/`migrate()` on success.

## _has_any_foreign_key


```lua
(method) NormOrm:_has_any_foreign_key()
  -> boolean
```

## _load_include_batch


```lua
(method) NormOrm:_load_include_batch(model: NormModel, mains: NormRecord[], name: string, spec?: table, cb: fun(err: any))
```

 Internal: batched eager-load of one relation onto a set of parent records.
 Runs a single `... IN (...)` query and attaches results. Calls `cb(err?)`.

@*param* `spec` — Include spec (`wheres`/`orders`/`limit`/`offset`).

## _load_includes


```lua
(method) NormOrm:_load_includes(model: NormModel, records: NormRecord[], includes: table<string, table>, cb: fun(err: any))
```

 Internal: eager-load a map of include specs onto a set of records. Each
 relation is loaded once via `_load_include_batch` (batched, no N+1) with its
 spec (per-relation `wheres`/`orders`/`limit`); a spec with `children` then
 recurses onto the flattened loaded records. Siblings load sequentially.

@*param* `includes` — name -> spec { wheres, orders, limit, offset, children }

## _logger


```lua
fun(level: string, message: string)
```

## _m2m_fetch


```lua
(method) NormOrm:_m2m_fetch(model: NormModel, rel: NormRelation, keys: any[], spec?: table, cb: fun(err: any, by_main?: table<any, NormRecord[]>))
```

 Internal: fetch many-to-many target records for a set of parent keys, in two
 batched queries (pivot then targets) — no N+1 regardless of cardinality. The
 target-dependent defaults (`through`, `otherKey`, `otherLocalKey`) are resolved
 here, since the target model may have been defined after this one.

@*param* `keys` — Unique parent local-key values.

@*param* `spec` — Include spec (`wheres`/`orders`/`limit`/`offset`) applied to the target.

@*param* `cb` — `by_main[parentKey]` = linked target records.

## _query_map


```lua
(method) NormOrm:_query_map(query: string, params?: any[], transform: fun(rows: table[]):any)
  -> promise: NormPromise
```

 Run a SELECT and transform the rows inside the promise.

@*return* `promise` — resolving to the transform result

## _query_with_includes


```lua
(method) NormOrm:_query_with_includes(model: NormModel, state: NormQueryState, includes: table<string, table>, single: boolean)
  -> NormPromise
```

 Internal: run a SELECT then eager-load `includes` (sequentially) before
 resolving. Returns a single record when `single` is true, else an array.

@*param* `includes` — include spec map (name -> { wheres, orders, limit, offset, children })

## _queue


```lua
table
```

## _raw_execute


```lua
(method) NormOrm:_raw_execute(query: any, params: any, callback: any)
```

## _raw_query


```lua
(method) NormOrm:_raw_query(query: any, params: any, callback: any)
```

 The single gate every data operation goes through. Runs against the adapter
 when ready; otherwise holds the call until `sync()`/`migrate()` flushes it.
 (sync/migrate themselves bypass this — they're what makes the ORM ready.)

## _ready


```lua
boolean
```

 Readiness gate. When queueing is requested, data ops are held until the
 first sync()/migrate() flips this ready and flushes them.

## _should_emit_fk


```lua
(method) NormOrm:_should_emit_fk(d: NormDialect)
  -> boolean
```

 Internal: decide whether `sync()` should emit FOREIGN KEY constraints for the
 given dialect, honouring the `foreignKeys` option and warning once on SQLite.

## _sync_order


```lua
(method) NormOrm:_sync_order()
  -> order: string[]
  2. has_cycle: boolean
```

 Internal: order models so a table is created after the tables it references
 via `belongs_to` (required for inline FKs on MySQL/InnoDB). Returns the table
 names in creation order plus whether a dependency cycle was detected.

## _trace


```lua
(method) NormOrm:_trace(query: string, params?: any[])
```

## _tx


```lua
nil
```

 Active transaction handle (set for the duration of db:transaction); when set,
 data ops route through the adapter's transaction connection.

## _warned_sqlite_fk


```lua
boolean
```

## adapter


```lua
NormAdapter
```

## define


```lua
(method) NormOrm:define(table_name: string, schema: table<string, NormColumn>, options?: NormDefineOptions)
  -> NormModel
```

 Define and register a model from a schema (a `{ column = Norm.types.* }` map).
 The returned model is your handle for all CRUD/query operations.
 ```lua
     local User = db:define("users", {
         id    = Norm.types.id(),
         name  = Norm.types.string({ length = 64, nullable = false }),
         email = Norm.types.string({ length = 128, unique = true }),
         coins = Norm.types.integer({ default = 0 }),
     })
 ```

## execute


```lua
(method) NormOrm:execute(query: string, params?: any[])
  -> promise: NormExecResultPromise
```

 Run a raw parameterised write (INSERT/UPDATE/DELETE/DDL). Resolves with a
 `{ affectedRows, insertId }` table.
 ```lua
     local res = db:execute("DELETE FROM `users` WHERE `id` = ?", { 1 }):await()
     print(res.affectedRows)
 ```

@*return* `promise` — resolving to NormExecResult

## foreign_keys


```lua
boolean|"auto"
```

Whether `sync()` emits SQL FOREIGN KEY constraints.

## is_ready


```lua
(method) NormOrm:is_ready()
  -> boolean
```

 Whether operations run immediately. With `queue_until_ready`, false until the
 first successful `sync()`/`migrate()`; otherwise always true.

## json


```lua
NormJsonProvider
```

Provider used to (de)serialise `json` columns.

## log


```lua
boolean
```

## migrate


```lua
(method) NormOrm:migrate(migrations: NormMigration[])
  -> promise: NormPromise
```

 Run pending schema migrations in order, recording applied ones in a
 `norm_migrations` table so each runs exactly once. Idempotent: re-running
 applies only what's new. Resolves with the list of ids applied this run.
 ```lua
     db:migrate({
         { id = "2026_06_25_add_last_seen", up = function(m)
             m:add_column("players", "last_seen", Norm.types.datetime())
             m:add_index("players", "idx_players_account", { "account_id" }, { unique = true })
         end },
     }):await()
 ```

@*return* `promise` — resolving to string[] (applied ids)

## model


```lua
(method) NormOrm:model(table_name: string)
  -> NormModel|nil
```

 Get a previously defined model.
 ```lua
     local User = db:model("users")
 ```

## models


```lua
table<string, NormModel>
```

## provider


```lua
NormPromiseProvider
```

 A promise provider plugs a framework's promise type into Norm.
 Built-in builders: `Norm.promise.builtin|nanos|cfx`. Validate a custom one
 with `Norm.promise.define`.

## query


```lua
(method) NormOrm:query(query: string, params?: any[])
  -> promise: NormRowsPromise
```

 Run a raw parameterised SELECT (bypassing the query builder). Resolves with
 the raw rows. Bind values with `?` placeholders, never interpolate.
 ```lua
     local rows = db:query("SELECT * FROM `users` WHERE `coins` > ?", { 100 }):await()
 ```

@*return* `promise` — resolving to table[]

## supports_transactions


```lua
(method) NormOrm:supports_transactions()
  -> boolean
```

 Whether the configured adapter supports transactions.

## sync


```lua
(method) NormOrm:sync()
  -> promise: NormBooleanPromise
```

 Create the table of every registered model (CREATE TABLE IF NOT EXISTS),
 in dependency order so foreign keys resolve. When foreign keys are enabled
 (see the `foreignKeys` option), `belongsTo` relations emit `FOREIGN KEY`
 constraints. Resolves true.
 ```lua
     db:sync():await() -- run once at startup, after defining your models
 ```

@*return* `promise` — resolving to true

## transaction


```lua
(method) NormOrm:transaction(fn: fun(orm: NormOrm):<T>)
  -> promise: NormPromise
```

 Run `fn` inside a database transaction: `BEGIN`, then every operation `fn`
 performs (await them) runs on that transaction; `COMMIT` if `fn` returns,
 `ROLLBACK` if it raises. Resolves with `fn`'s return value (rejects with its
 error after rolling back). Use `:await()` on operations inside `fn` as usual.

 **Throws immediately** if the adapter does not support transactions — check
 `db:supports_transactions()` first if you need to branch (nanos has no
 transaction API, so it always throws there; oxmysql supports them). Do not
 overlap transactions on the same Norm instance (the state is per-instance).
 ```lua
     db:transaction(function()
         from.coins = from.coins - 100; from:save():await()
         to.coins   = to.coins + 100;   to:save():await()
     end):await()
 ```

@*return* `promise` — resolving to T


---

# NormOxMySQLAdapter

## __init


```lua
(method) NormOxMySQLAdapter:__init(options?: NormOxMySQLAdapterOptions)
```

## _dialect_name


```lua
string
```

## default_json_provider


```lua
(method) NormOxMySQLAdapter:default_json_provider()
  -> NormJsonProvider|nil
```

 FiveM exposes a global `json` (`encode`/`decode`); use it to (de)serialise
 `json` columns automatically.

## default_provider


```lua
(method) NormOxMySQLAdapter:default_provider()
  -> NormPromiseProvider|nil
```

 FiveM resources have a native `promise` library; use it by default.

## get_dialect


```lua
(method) NormAdapter:get_dialect()
  -> NormDialect
```

 Resolved dialect object.

## get_dialect_name


```lua
(method) NormOxMySQLAdapter:get_dialect_name()
  -> "mysql"
```

```lua
return #1:
    | "mysql"
```

## onReady


```lua
(method) NormOxMySQLAdapter:onReady(cb?: fun():any)
```

 Wait until oxmysql has started and its connection is up, then run `cb`.
 Runs in a background thread (Wait yields), so it never blocks construction.

## options


```lua
NormAdapterOptions
```

## ox


```lua
table
```

The oxmysql export.

## raw_execute


```lua
(method) NormOxMySQLAdapter:raw_execute(query: string, params: any[], callback: NormExecuteCallback)
```

## raw_query


```lua
(method) NormOxMySQLAdapter:raw_query(query: string, params: any[], callback: NormQueryCallback)
```

## supports_returning


```lua
(method) NormAdapter:supports_returning()
  -> boolean
```

 Optional: whether this adapter's engine supports `INSERT ... RETURNING <col>`
 (SQLite >= 3.35, PostgreSQL). When true, the ORM reads a new row's
 auto-increment id atomically from the INSERT itself, instead of a separate
 `LAST_INSERT_ID()` / `last_insert_rowid()` query — which is connection-scoped
 and therefore unreliable across a connection pool. Defaults to false.

## supports_transactions


```lua
(method) NormOxMySQLAdapter:supports_transactions()
  -> boolean
```

 oxmysql supports interactive transactions via the `startTransaction` export.

## transaction


```lua
(method) NormOxMySQLAdapter:transaction(body: fun(tx_query: fun(q: string, p: any[], cb: function), tx_execute: fun(q: string, p: any[], cb: function)):boolean, finish: fun(err: any))
```

 Run an interactive transaction through the `startTransaction` export (the same
 one `MySQL.startTransaction` forwards to: `oxmysql:startTransaction(handler)`). The handler's `query(sql, params)` is SYNCHRONOUS (oxmysql awaits
 internally), so the ORM's callbacks resolve immediately; the handler returning
 `false` (or erroring) rolls back, anything else commits. The export returns the
 commit boolean. `body` already returns true=commit / false=rollback.


---

# NormOxMySQLAdapterModule

## class


```lua
NormOxMySQLAdapter
```

## new


```lua
function NormOxMySQLAdapterModule.new(options?: NormOxMySQLAdapterOptions)
  -> NormOxMySQLAdapter
```

 Create an oxmysql adapter instance (waits for oxmysql to be ready and logs
 the connection). Pass it to `Norm.new`.
 ```lua
     local db = Norm.new({ adapter = Norm.adapters.oxmysql.new() })
     -- defaults to the CFX `promise` provider (use :next / Citizen.Await / :await)
 ```


---

# NormOxMySQLAdapterOptions

## [string]


```lua
any
```

Adapter-specific options.

## dialect


```lua
("mysql"|"sqlite")?
```

Overrides the adapter's default dialect.

## oxmysql


```lua
table?
```

Inject the oxmysql export (defaults to `exports.oxmysql`).


---

# NormPromise

## __init


```lua
(method) NormPromise:__init(executor?: fun(resolve: fun(value: any), reject: fun(reason: any)))
```

## _await_co


```lua
thread?
```

## _queue


```lua
fun(state: string, value: any)[]
```

## _settle


```lua
(method) NormPromise:_settle(state: any, value: any)
```

## _state


```lua
"fulfilled"|"pending"|"rejected"
```

## _value


```lua
any
```

## await


```lua
(method) NormPromise:await()
  -> value: any
```

 Block the current coroutine until the promise settles, then return its value
 (or raise its rejection reason). Must be called from inside a coroutine.
 ```lua
     coroutine.wrap(function()
         local user = User:find(1):await()
     end)()
 ```

## catch


```lua
(method) NormPromise:catch(on_rejected: fun(reason: any):any)
  -> NormPromise
```

## next


```lua
(method) NormPromise:next(on_fulfilled?: fun(value: any):any, on_rejected?: fun(reason: any):any)
  -> NormPromise
```

 Register handlers; returns a new chained promise.


---

# NormPromiseLib

## NormPromise


```lua
NormPromise
```

## builtin


```lua
function NormPromiseLib.builtin()
  -> NormPromiseProvider
```

 The bundled zero-dependency provider (real then-able with :next/:catch/:await).
 The default when no provider is configured and the adapter has none.
 ```lua
     local db = Norm.new({ adapter = a, promise = Norm.promise.builtin() })
 ```

## cfx


```lua
function NormPromiseLib.cfx(lib?: table)
  -> NormPromiseProvider
```

 Wrap FiveM's native `promise` library. The oxmysql adapter uses this by
 default, so you rarely pass it explicitly.
 ```lua
     local db = Norm.new({ adapter = a, promise = Norm.promise.cfx() })
 ```

@*param* `lib` — The CFX `promise` library (defaults to the global `promise`).

## define


```lua
function NormPromiseLib.define(spec: NormPromiseProvider)
  -> NormPromiseProvider
```

 Validate a custom provider (a table with `new`/`resolve`/`reject`) and return
 it. Use this to plug any promise system that isn't builtin/nanos/cfx.
 ```lua
     local provider = Norm.promise.define({
         name    = "myfw",
         new     = function(executor) ... end,
         resolve = function(value) ... end,
         reject  = function(reason) ... end,
     })
 ```

## from_class


```lua
function NormPromiseLib.from_class(PromiseClass: fun(executor: fun(resolve: fun(value: any), reject: fun(reason: any))):any)
  -> NormPromiseProvider
```

 Build a provider from any promise CLASS whose constructor is
 `Class(executor)` (executor receives resolve, reject) — e.g. a custom or
 framework promise. The class is expected to provide its own await/chaining
 methods (no `:await()` alias is attached). Use this when your framework's
 promise differs from nanos-promise / CFX.
 ```lua
     local db = Norm.new({ adapter = a, promise = Norm.promise.from_class(Promise) })
 ```

## nanos


```lua
function NormPromiseLib.nanos(Promise: table)
  -> NormPromiseProvider
```

 Wrap the nanos-promise `Promise` class so the ORM returns nanos promises.
 On nanos this is auto-detected, so you rarely pass it explicitly.
 ```lua
     local db = Norm.new({ adapter = a, promise = Norm.promise.nanos(Promise) })
 ```

@*param* `Promise` — The nanos `Promise` class.


---

# NormPromiseProvider

 A promise provider plugs a framework's promise type into Norm.
 Built-in builders: `Norm.promise.builtin|nanos|cfx`. Validate a custom one
 with `Norm.promise.define`.

## is_promise


```lua
(fun(value: any):boolean)?
```

## name


```lua
string
```

## new


```lua
fun(executor: fun(resolve: fun(value: any), reject: fun(reason: any))):any
```

Returns a framework promise.

## reject


```lua
fun(reason: any):any
```

Already-rejected promise.

## resolve


```lua
fun(value: any):any
```

Already-resolved promise.


---

# NormQueryBuilder

## __init


```lua
(method) NormQueryBuilder:__init(model: NormModel)
```

## _effective_state


```lua
(method) NormQueryBuilder:_effective_state()
  -> NormQueryState
```

 Build the query state actually sent to SQL, applying the soft-delete scope for
 soft-delete models (excluded by default; honours `with_trashed`/`only_trashed`).

## _prepare_counts


```lua
(method) NormQueryBuilder:_prepare_counts(state: NormQueryState)
  -> state: NormQueryState
  2. counts: string[]|nil
```

 Internal: fold `with_count` relations into a select state (adds `*` + the count
 subqueries to `raw_columns`). Returns (state, counts) — counts is nil if none.

## _state


```lua
NormQueryState
```

## all


```lua
(method) NormQueryBuilder:all()
  -> promise: NormRecordListPromise
```

 Execute the query and resolve with all matching records.
 ```lua
     local users = User:query():where("admin", true):all():await()
 ```

@*return* `promise` — resolving to NormRecord[]

## avg


```lua
(method) NormQueryBuilder:avg(column: string)
  -> promise: NormNumberPromise
```

 AVG of a column over the current filter. Resolves with a number.

@*return* `promise` — resolving to number

## count


```lua
(method) NormQueryBuilder:count()
  -> promise: NormNumberPromise
```

 Resolve with the COUNT(*) for the current conditions.
 ```lua
     local admins = User:query():where("admin", true):count():await()
 ```

@*return* `promise` — resolving to number

## decrement


```lua
(method) NormQueryBuilder:decrement(column: string, amount?: number)
  -> promise: NormNumberPromise
```

 Atomically subtract `amount` (default 1) from a column on every matching row.

@*param* `amount` — Defaults to 1.

@*return* `promise` — resolving to number

## delete


```lua
(method) NormQueryBuilder:delete()
  -> promise: NormNumberPromise
```

 Bulk-delete every matching row. On a soft-delete model this marks the rows
 (sets `deleted_at`) rather than removing them; use `force_delete` to remove.
 Resolves with the affected row count.
 ```lua
     local n = User:query():where("coins", 0):delete():await()
 ```

@*return* `promise` — resolving to number

## first


```lua
(method) NormQueryBuilder:first()
  -> promise: NormRecordOrNilPromise
```

 Execute the query with LIMIT 1 and resolve with the first record (or nil).
 ```lua
     local newest = User:query():order("id", "DESC"):first():await()
 ```

@*return* `promise` — resolving to NormRecord|nil

## force_delete


```lua
(method) NormQueryBuilder:force_delete()
  -> promise: NormNumberPromise
```

 Bulk physical-DELETE every matching row, even on a soft-delete model.
 Resolves with the affected row count.

@*return* `promise` — resolving to number

## group_by


```lua
(method) NormQueryBuilder:group_by(...string)
  -> self: NormQueryBuilder
```

 Add GROUP BY columns (call again, or pass several, to group by more).
 ```lua
     Player:select_raw("faction, COUNT(*) AS n"):group_by("faction"):rows():await()
 ```

## having


```lua
(method) NormQueryBuilder:having(expr: string, op?: string, value?: any)
  -> self: NormQueryBuilder
```

 Add a HAVING condition (ANDed) on a RAW aggregate expression. Forms:
 `having(expr, value)` or `having(expr, op, value)`. The expression is emitted
 verbatim (so you can reference `COUNT(*)`, `SUM(\`coins\`)`, …); the value is bound.
 ```lua
     Player:select_raw("faction, COUNT(*) AS n"):group_by("faction")
           :having("COUNT(*)", ">", 10):rows():await()
 ```

@*param* `expr` — Raw SQL expression (not quoted).

@*param* `op` — Operator, or the value when called with 2 args.

## include


```lua
(method) NormQueryBuilder:include(...string|fun(q: NormQueryBuilder))
  -> self: NormQueryBuilder
```

 Eager-load relations with the result (one batched query per relation level —
 no N+1), attaching them to each returned record. Three forms:
   * `include("posts", "profile")` — simple relation names.
   * `include("posts.comments")` — nested via a dotted path (shared prefixes load once).
   * `include("posts", function(q) ... end)` — with per-relation options: call
     `where` / `order` / `limit` / `offset` (and nested `include`) on `q`. The
     `limit` is applied PER PARENT (e.g. 5 latest posts for each user).
 ```lua
     local users = User:query():include("posts.comments"):all():await()
     print(#users[1].posts[1].comments)

     local u = User:query():include("posts", function(q)
         q:where("published", true):order("created_at", "DESC"):limit(5)
          :include("comments", function(c) c:order("created_at", "ASC") end)
     end):all():await()
 ```

@*param* `...` — relation names/paths, or a single name + configurator

## increment


```lua
(method) NormQueryBuilder:increment(column: string, amount?: number)
  -> promise: NormNumberPromise
```

 Atomically add `amount` (default 1) to a column on every matching row, in one
 `SET col = col + ?` statement (no read-modify-write, race-free). Resolves with
 the affected row count.
 ```lua
     Player:where("id", id):increment("coins", 50):await()
 ```

@*param* `amount` — Defaults to 1.

@*return* `promise` — resolving to number

## join


```lua
(method) NormQueryBuilder:join(table_name: string, first: string, op: string, second?: string)
  -> self: NormQueryBuilder
```

 INNER JOIN another table. Use qualified `table.column` refs. Forms:
 `join(table, first, second)` (defaults `=`) or `join(table, first, op, second)`.
 Joins are for FILTERING/SORTING by a related table — combine with qualified
 `where`/`order`. Since joined rows mix columns from both tables, restrict the
 projection with `:select_raw("main.*")` if you still want `:all()` to wrap the
 main model, or read the flattened rows with `:rows()`.
 ```lua
     Post:join("users", "users.id", "posts.user_id")
         :where("users.admin", true):select_raw("`posts`.*"):all():await()
 ```

@*param* `op` — Operator, or the right column when called with 3 args.

## left_join


```lua
(method) NormQueryBuilder:left_join(table_name: string, first: string, op: string, second?: string)
  -> self: NormQueryBuilder
```

 LEFT JOIN another table (same argument forms as `:join`). Keeps main rows even
 when there is no match on the joined side.

## limit


```lua
(method) NormQueryBuilder:limit(n: number)
  -> self: NormQueryBuilder
```

 Limit the number of rows (pair with `:offset()` for pagination).
 ```lua
     local page = User:query():order("id"):limit(10):offset(20):all():await()
 ```

## max


```lua
(method) NormQueryBuilder:max(column: string)
  -> promise: NormNumberPromise
```

 MAX of a column over the current filter. Resolves with the raw value.
 ```lua
     local top = Player:max("score"):await()
 ```

@*return* `promise` — resolving to the column's value type

## min


```lua
(method) NormQueryBuilder:min(column: string)
  -> promise: NormNumberPromise
```

 MIN of a column over the current filter. Resolves with the raw value.

@*return* `promise` — resolving to the column's value type

## model


```lua
NormModel
```

## offset


```lua
(method) NormQueryBuilder:offset(n: number)
  -> self: NormQueryBuilder
```

 Skip `n` rows (use with `:limit()`).

## omit


```lua
(method) NormQueryBuilder:omit(...string|string[])
  -> self: NormQueryBuilder
```

 Inverse of `select`: select every column of the model EXCEPT the given ones
 (e.g. to drop a `password` / large blob without listing all the others). The
 omitted columns are simply absent from the returned records.
 ```lua
     local u = User:omit("password"):find(1):await()
 ```

## only_trashed


```lua
(method) NormQueryBuilder:only_trashed()
  -> self: NormQueryBuilder
```

 Return ONLY soft-deleted rows.

## or_where


```lua
(method) NormQueryBuilder:or_where(column: string|table<string, any>, op?: string, value?: any)
  -> self: NormQueryBuilder
```

 OR variant of `where`.
 ```lua
     User:query():where("admin", true):or_where("coins", ">", 1000):all():await()
 ```

## or_where_between


```lua
(method) NormQueryBuilder:or_where_between(column: string, min: any, max: any)
  -> self: NormQueryBuilder
```

## or_where_in


```lua
(method) NormQueryBuilder:or_where_in(column: string, list: any[])
  -> self: NormQueryBuilder
```

## or_where_like


```lua
(method) NormQueryBuilder:or_where_like(column: string, pattern: string)
  -> self: NormQueryBuilder
```

## or_where_not


```lua
(method) NormQueryBuilder:or_where_not(column: string, value: any)
  -> self: NormQueryBuilder
```

## or_where_not_between


```lua
(method) NormQueryBuilder:or_where_not_between(column: string, min: any, max: any)
  -> self: NormQueryBuilder
```

## or_where_not_in


```lua
(method) NormQueryBuilder:or_where_not_in(column: string, list: any[])
  -> self: NormQueryBuilder
```

## or_where_not_like


```lua
(method) NormQueryBuilder:or_where_not_like(column: string, pattern: string)
  -> self: NormQueryBuilder
```

## or_where_not_null


```lua
(method) NormQueryBuilder:or_where_not_null(column: string)
  -> self: NormQueryBuilder
```

## or_where_null


```lua
(method) NormQueryBuilder:or_where_null(column: string)
  -> self: NormQueryBuilder
```

## order


```lua
(method) NormQueryBuilder:order(column: string, dir?: "ASC"|"DESC")
  -> self: NormQueryBuilder
```

 Add an ORDER BY clause (call again for secondary orderings).
 ```lua
     User:query():order("coins", "DESC"):order("name"):all():await()
 ```

```lua
dir:
    | "ASC"
    | "DESC"
```

## paginate


```lua
(method) NormQueryBuilder:paginate(page?: number, per_page?: number)
  -> promise: NormPromise
```

 Paginate the current query. Runs a `COUNT(*)` over the filter plus a
 `LIMIT/OFFSET` page query, resolving with
 `{ data, total, page, per_page, last_page, from, to }`. Honours `where`,
 `order`, soft-delete scope, and `with_count`.
 ```lua
     local p = User:where("admin", true):order("name"):paginate(2, 20):await()
     print(p.page, p.last_page, #p.data, p.total)
 ```

@*param* `page` — 1-based page (default 1).

@*param* `per_page` — rows per page (default 15).

@*return* `promise` — resolving to a pagination table

## rows


```lua
(method) NormQueryBuilder:rows()
  -> promise: NormRowsPromise
```

 Execute the query and resolve with the RAW rows (no record wrapping). Use this
 for grouped aggregates built with `:select_raw` / `:group_by` / `:having`.
 ```lua
     local stats = Player:select_raw("faction, COUNT(*) AS n, SUM(`coins`) AS total")
         :group_by("faction"):having("COUNT(*)", ">", 10):rows():await()
 ```

@*return* `promise` — resolving to table[]

## scope


```lua
(method) NormQueryBuilder:scope(name: string, ...any)
  -> self: NormQueryBuilder
```

 Apply a named scope (a reusable query fragment registered on the model with
 `Model:scope(name, fn)`), passing it any extra args. Chainable.
 ```lua
     User:active():scope("older_than", 18):all():await()
 ```

@*param* `...` — args forwarded to the scope function

## select


```lua
(method) NormQueryBuilder:select(...string|string[])
  -> self: NormQueryBuilder
```

 Restrict selected columns (the inverse is `:omit`).
 ```lua
     User:query():select("id", "name"):all():await()
 ```

## select_raw


```lua
(method) NormQueryBuilder:select_raw(expr: string)
  -> self: NormQueryBuilder
```

 Add a RAW (unquoted) select expression — for aggregates/computed columns that
 the column-quoting `select` can't express. Pair with `:group_by` and `:rows()`.
 ```lua
     User:select_raw("faction, COUNT(*) AS n"):group_by("faction"):rows():await()
 ```

## sum


```lua
(method) NormQueryBuilder:sum(column: string)
  -> promise: NormNumberPromise
```

 SUM of a column over the current filter. Resolves with a number (0 if empty).
 ```lua
     local bank = User:where("admin", false):sum("coins"):await()
 ```

@*return* `promise` — resolving to number

## update


```lua
(method) NormQueryBuilder:update(data: table<string, any>)
  -> promise: NormNumberPromise
```

 Bulk-update every matching row in one statement (no records loaded).
 Resolves with the affected row count.
 ```lua
     local n = User:query():where("admin", true):update({ coins = 0 }):await()
 ```

@*return* `promise` — resolving to number

## where


```lua
(method) NormQueryBuilder:where(column: string|table<string, any>, op?: string, value?: any)
  -> self: NormQueryBuilder
```

 Add an AND condition. Forms: `where(col, value)`, `where(col, op, value)` or
 `where({ col = value, ... })`. Chainable with the other `where_*` helpers.
 ```lua
     User:query():where("coins", ">", 100):where("admin", true):all():await()
 ```

@*param* `op` — Operator, or the value when called with 2 args.

## where_between


```lua
(method) NormQueryBuilder:where_between(column: string, min: any, max: any)
  -> self: NormQueryBuilder
```

 `column [NOT] BETWEEN min AND max` (inclusive). With OR / negated variants.
 ```lua
     Player:query():where_between("level", 10, 20):all():await()
 ```

## where_doesnt_have


```lua
(method) NormQueryBuilder:where_doesnt_have(name: string, configure?: fun(q: NormQueryBuilder))
  -> self: NormQueryBuilder
```

 Inverse of `where_has`: keep only rows with NO matching related row
 (`NOT EXISTS (...)`).

@*param* `name` — Relation name.

## where_has


```lua
(method) NormQueryBuilder:where_has(name: string, configure?: fun(q: NormQueryBuilder))
  -> self: NormQueryBuilder
```

 Keep only rows that HAVE at least one related row for `name` (optionally
 matching the `configure` conditions). Compiles to `EXISTS (correlated subquery)`.
 ```lua
     User:where_has("posts"):all():await()                       -- users with any post
     User:where_has("posts", function(q) q:where("published", true) end):all():await()
 ```

@*param* `name` — Relation name.

@*param* `configure` — Conditions on the related rows.

## where_in


```lua
(method) NormQueryBuilder:where_in(column: string, list: any[])
  -> self: NormQueryBuilder
```

 `column IN (...)` (and its OR / negated variants).
 ```lua
     User:query():where_in("id", { 1, 2, 3 }):all():await()
 ```

## where_like


```lua
(method) NormQueryBuilder:where_like(column: string, pattern: string)
  -> self: NormQueryBuilder
```

 `column [NOT] LIKE pattern` (use `%` / `_` wildcards). With OR / negated variants.
 ```lua
     User:query():where_like("name", "John%"):all():await()
 ```

## where_not


```lua
(method) NormQueryBuilder:where_not(column: string, value: any)
  -> self: NormQueryBuilder
```

 `column != value` (and OR variant).

## where_not_between


```lua
(method) NormQueryBuilder:where_not_between(column: string, min: any, max: any)
  -> self: NormQueryBuilder
```

## where_not_in


```lua
(method) NormQueryBuilder:where_not_in(column: string, list: any[])
  -> self: NormQueryBuilder
```

## where_not_like


```lua
(method) NormQueryBuilder:where_not_like(column: string, pattern: string)
  -> self: NormQueryBuilder
```

## where_not_null


```lua
(method) NormQueryBuilder:where_not_null(column: string)
  -> self: NormQueryBuilder
```

## where_null


```lua
(method) NormQueryBuilder:where_null(column: string)
  -> self: NormQueryBuilder
```

 `column IS [NOT] NULL` (and OR variants).

## with_count


```lua
(method) NormQueryBuilder:with_count(...string)
  -> self: NormQueryBuilder
```

 Add a `<name>_count` field to each returned record: the number of related rows,
 without loading them (a correlated `COUNT(*)` subquery). Soft-deleted related
 rows aren't counted.
 ```lua
     local users = User:with_count("posts"):all():await()
     print(users[1].posts_count)
 ```

@*param* `...` — relation names

## with_trashed


```lua
(method) NormQueryBuilder:with_trashed()
  -> self: NormQueryBuilder
```

 Include soft-deleted rows in the result (disables the default exclusion).


---

# NormQueryCallback


---

# NormQueryState

## columns


```lua
string[]?
```

Selected columns (nil = "*").

## groups


```lua
string[]?
```

GROUP BY columns.

## havings


```lua
NormHaving[]?
```

HAVING conditions (ANDed).

## joins


```lua
NormJoin[]?
```

JOIN clauses.

## limit


```lua
number?
```

## offset


```lua
number?
```

## orders


```lua
NormOrder[]?
```

## raw_columns


```lua
string[]?
```

Raw (unquoted) select expressions, e.g. "COUNT(*) AS n".

## table


```lua
string
```

## wheres


```lua
NormWhere[]
```


---

# NormRawDefault

## __raw


```lua
string
```


---

# NormRecord

 A single row. Column values are plain fields (e.g. `record.name`).

## [string]


```lua
any
```

Column values.

## __init


```lua
(method) NormRecord:__init(model: NormModel, row?: table<string, any>, persisted?: boolean)
```

## __model


```lua
NormModel
```

## __original


```lua
table
```

## __persisted


```lua
boolean
```

## _changed_columns


```lua
(method) NormRecord:_changed_columns()
  -> table<string, any>
```

 Columns whose value differs from the snapshot (the write-set for an UPDATE).
 Only non-nil values are returned (clearing to NULL via save() is unsupported,
 as before). `json` columns holding a table are always considered changed —
 their contents may have been mutated in place, which a reference check misses.

## _do_insert


```lua
(method) NormRecord:_do_insert(cb: fun(err: any))
```

 Callback-based INSERT primitive (stamps timestamps, encodes, reads the new id
 via RETURNING when supported, snapshots). Shared by `:save()` and the
 `*OrCreate` helpers so they compose without relying on promise chaining.

## _do_update


```lua
(method) NormRecord:_do_update(cb: fun(err: any))
```

 Callback-based UPDATE primitive (dirty tracking + updated_at bump). Calls
 `cb(nil)` with NO query when nothing changed. Shared by `:save()` /
 `updateOrCreate`.

## _persistable


```lua
(method) NormRecord:_persistable()
  -> table<string, any>
```

## _pivot_info


```lua
(method) NormRecord:_pivot_info(name: string)
  -> info: table
```

 Resolve a `belongs_to_many` relation into its pivot coordinates (asserts the
 relation exists and is many-to-many).

## _snapshot


```lua
(method) NormRecord:_snapshot()
```

 Capture the current column values as the "clean" baseline for dirty tracking.

## attach


```lua
(method) NormRecord:attach(name: string, ids: any, pivot?: table<string, any>)
  -> promise: NormNumberPromise
```

 Link this record to one or more `target` rows of a `belongs_to_many` relation
 by inserting pivot rows. `ids` is a key value, an array of them, or record(s).
 `pivot` adds extra columns to each pivot row. Resolves with the number attached.
 ```lua
     user:attach("roles", { 1, 2 }):await()
     user:attach("roles", role, { granted_by = adminId }):await()
 ```

@*param* `name` — Relation name.

@*param* `ids` — Key value(s) or record(s) on the target side.

@*param* `pivot` — Extra pivot-row columns.

@*return* `promise` — resolving to the number of rows inserted

## decrement


```lua
(method) NormRecord:decrement(column: string, amount?: number)
  -> promise: NormRecordPromise
```

 Atomically subtract `amount` (default 1) from a column of this record.

@*param* `amount` — Defaults to 1.

@*return* `promise` — resolving to NormRecord (self)

## delete


```lua
(method) NormRecord:delete()
  -> promise: NormRecordPromise
```

 Delete this record. For a soft-delete model this sets the `deleted_at` column
 (the row stays, but queries exclude it by default); otherwise it physically
 removes the row. Resolves with the record.
 ```lua
     local user = User:find(1):await()
     user:delete():await()
 ```

@*return* `promise` — resolving to NormRecord (self)

## detach


```lua
(method) NormRecord:detach(name: string, ids?: any)
  -> promise: NormNumberPromise
```

 Unlink this record from `target` rows of a `belongs_to_many` relation by
 deleting pivot rows. With `ids` -> only those; without -> ALL links. Resolves
 with the affected row count.
 ```lua
     user:detach("roles", { 1 }):await()  -- remove one link
     user:detach("roles"):await()          -- remove every link
 ```

@*param* `name` — Relation name.

@*param* `ids` — Key value(s) or record(s); omit to detach everything.

@*return* `promise` — resolving to the number of rows deleted

## force_delete


```lua
(method) NormRecord:force_delete()
  -> promise: NormRecordPromise
```

 Physically DELETE this record by its primary key, even on a soft-delete model.
 The record is flagged not-persisted (a later `:save()` re-inserts it). Resolves
 with the record. Fires `before_delete` / `after_delete`.

@*return* `promise` — resolving to NormRecord (self)

## increment


```lua
(method) NormRecord:increment(column: string, amount?: number)
  -> promise: NormRecordPromise
```

 Atomically add `amount` (default 1) to a column of THIS record
 (`SET col = col + ?` by primary key — no read-modify-write). Also updates the
 in-memory value when it is a number, and resnapshots. Resolves with the record.
 ```lua
     player:increment("coins", 50):await()  -- player.coins is updated locally too
 ```

@*param* `amount` — Defaults to 1.

@*return* `promise` — resolving to NormRecord (self)

## load


```lua
(method) NormRecord:load(name: string)
  -> promise: NormPromise
```

 Lazily load a declared relation, cache it on `self[name]`, and resolve with
 it. Returns a single record (belongs_to / has_one), nil, or an array (has_many).
 ```lua
     local author = post:load("author"):await()  -- also sets post.author
     local posts  = user:load("posts"):await()   -- also sets user.posts (array)
 ```

@*return* `promise` — resolving to NormRecord | NormRecord[] | nil

## reload


```lua
(method) NormRecord:reload()
  -> promise: NormRecordPromise
```

 Re-read this record's columns from the database (discarding local changes).
 Resolves with the record.
 ```lua
     user:reload():await()
 ```

@*return* `promise` — resolving to NormRecord (self)

## restore


```lua
(method) NormRecord:restore()
  -> promise: NormRecordPromise
```

 Un-delete a soft-deleted record (clears `deleted_at`). Resolves with the record.
 ```lua
     local post = Post:only_trashed():where("id", 5):first():await()
     post:restore():await()
 ```

@*return* `promise` — resolving to NormRecord (self)

## save


```lua
(method) NormRecord:save()
  -> promise: NormRecordPromise
```

 Persist the record: INSERT if new, UPDATE (only changed columns) if it was
 loaded from the database. Resolves with the record itself.
 ```lua
     local user = User:find(1):await()
     user.coins = user.coins + 50
     user:save():await()
 ```

@*return* `promise` — resolving to NormRecord (self)

## sync_pivot


```lua
(method) NormRecord:sync_pivot(name: string, ids: any)
  -> promise: NormPromise
```

 Make this record's pivot links for a `belongs_to_many` relation exactly match
 `ids`: attach the missing, detach the extra, leave the rest. Resolves with
 `{ attached = n, detached = m }`.
 ```lua
     user:sync_pivot("roles", { 1, 2, 3 }):await()
 ```

@*param* `name` — Relation name.

@*param* `ids` — Key value(s) or record(s) that should remain linked.

@*return* `promise` — resolving to { attached: number, detached: number }

## to_table


```lua
(method) NormRecord:to_table()
  -> table<string, any>
```

 Plain `{ column = value }` table for this record (e.g. to serialise it).
 ```lua
     local data = user:to_table() --> { id = 1, name = "John", ... }
 ```

## trashed


```lua
(method) NormRecord:trashed()
  -> boolean
```

 Whether this record is currently soft-deleted (its `deleted_at` is set).


---

# NormRecordListPromise

## __init


```lua
(method) NormPromise:__init(executor?: fun(resolve: fun(value: any), reject: fun(reason: any)))
```

## _await_co


```lua
thread?
```

## _queue


```lua
fun(state: string, value: any)[]
```

## _settle


```lua
(method) NormPromise:_settle(state: any, value: any)
```

## _state


```lua
"fulfilled"|"pending"|"rejected"
```

## _value


```lua
any
```

## await


```lua
fun(self: NormRecordListPromise):NormRecord[]
```

## catch


```lua
(method) NormPromise:catch(on_rejected: fun(reason: any):any)
  -> NormPromise
```

## next


```lua
fun(self: NormRecordListPromise, on_fulfilled?: fun(value: NormRecord[]):any, on_rejected?):fun(reason: any):any
```

): NormPromise


---

# NormRecordOrNilPromise

## __init


```lua
(method) NormPromise:__init(executor?: fun(resolve: fun(value: any), reject: fun(reason: any)))
```

## _await_co


```lua
thread?
```

## _queue


```lua
fun(state: string, value: any)[]
```

## _settle


```lua
(method) NormPromise:_settle(state: any, value: any)
```

## _state


```lua
"fulfilled"|"pending"|"rejected"
```

## _value


```lua
any
```

## await


```lua
fun(self: NormRecordOrNilPromise):NormRecord?
```

## catch


```lua
(method) NormPromise:catch(on_rejected: fun(reason: any):any)
  -> NormPromise
```

## next


```lua
fun(self: NormRecordOrNilPromise, on_fulfilled?: fun(value?: NormRecord):any, on_rejected?):fun(reason: any):any
```

): NormPromise


---

# NormRecordPromise

## __init


```lua
(method) NormPromise:__init(executor?: fun(resolve: fun(value: any), reject: fun(reason: any)))
```

## _await_co


```lua
thread?
```

## _queue


```lua
fun(state: string, value: any)[]
```

## _settle


```lua
(method) NormPromise:_settle(state: any, value: any)
```

## _state


```lua
"fulfilled"|"pending"|"rejected"
```

## _value


```lua
any
```

## await


```lua
fun(self: NormRecordPromise):NormRecord
```

## catch


```lua
(method) NormPromise:catch(on_rejected: fun(reason: any):any)
  -> NormPromise
```

## next


```lua
fun(self: NormRecordPromise, on_fulfilled?: fun(value: NormRecord):any, on_rejected?):fun(reason: any):any
```

): NormPromise


---

# NormReferentialAction

 A referential action for a foreign key: "CASCADE", "SET NULL", "RESTRICT",
 "NO ACTION" or "SET DEFAULT" (case-insensitive).


---

# NormRelation

## __relation


```lua
true
```

## key


```lua
string?
```

FK column (on this model for belongs_to; on the target / pivot otherwise).

## kind


```lua
"belongs_to"|"belongs_to_many"|"has_many"|"has_one"
```

## localKey


```lua
string?
```

Local column for has_*/belongs_to_many (defaults to this model's primary key).

## name


```lua
string?
```

Set by define() from the schema key.

## onDelete


```lua
string?
```

Referential action emitted on the FK (belongs_to only).

## onUpdate


```lua
string?
```

Referential action emitted on the FK (belongs_to only).

## otherKey


```lua
string?
```

Referenced column / target-side pivot FK (defaults to the relevant primary key).

## otherLocalKey


```lua
string?
```

Target's local column for belongs_to_many (defaults to the target's primary key).

## target


```lua
string
```

The related table name.

## through


```lua
string?
```

Pivot (join) table for belongs_to_many.


---

# NormRelationOptions

## key


```lua
string?
```

FK column name. See each relation for its default.

## localKey


```lua
string?
```

Local column for has_*/belongs_to_many (defaults to this model's primary key).

## onDelete


```lua
NormReferentialAction?
```

Emitted as `ON DELETE …` on the FK (belongs_to only).

## onUpdate


```lua
NormReferentialAction?
```

Emitted as `ON UPDATE …` on the FK (belongs_to only).

## otherKey


```lua
string?
```

Referenced column / target-side pivot FK (defaults to the relevant primary key).

## otherLocalKey


```lua
string?
```

Target's local column for belongs_to_many (defaults to the target's primary key).

## through


```lua
string?
```

Pivot (join) table for belongs_to_many (defaults to the two singulars joined alphabetically).


---

# NormRowsPromise

## __init


```lua
(method) NormPromise:__init(executor?: fun(resolve: fun(value: any), reject: fun(reason: any)))
```

## _await_co


```lua
thread?
```

## _queue


```lua
fun(state: string, value: any)[]
```

## _settle


```lua
(method) NormPromise:_settle(state: any, value: any)
```

## _state


```lua
"fulfilled"|"pending"|"rejected"
```

## _value


```lua
any
```

## await


```lua
fun(self: NormRowsPromise):table[]
```

## catch


```lua
(method) NormPromise:catch(on_rejected: fun(reason: any):any)
  -> NormPromise
```

## next


```lua
fun(self: NormRowsPromise, on_fulfilled?: fun(value: table[]):any, on_rejected?):fun(reason: any):any
```

): NormPromise


---

# NormSql

## add_column


```lua
function NormSql.add_column(table_name: string, column: NormColumn, d: NormDialect)
  -> string
```

 `ALTER TABLE t ADD COLUMN <def>`. `column` is a Norm column descriptor (`.name` set).

## add_index


```lua
function NormSql.add_index(table_name: string, index_name: string, columns: string[], unique: boolean, d: NormDialect, if_not_exists?: boolean)
  -> string
```

 `CREATE [UNIQUE] INDEX [IF NOT EXISTS] name ON table (cols...)`. `if_not_exists`
 (used by `sync()` for idempotency) is supported by SQLite/MariaDB/Postgres but
 NOT by stock MySQL 8 — manage those indexes via migrations instead.

## aggregate


```lua
function NormSql.aggregate(state: NormQueryState, func: string, column?: string, d: NormDialect)
  -> statement: string
  2. params: any[]
```

 Scalar aggregate (`SUM`/`AVG`/`MIN`/`MAX`/`COUNT`) over the WHERE-filtered set.
 The result is aliased `aggregate`. `column` is quoted; pass nil for `*`.

@*param* `func` — Aggregate function name (already upper-case).

@*param* `column` — Column to aggregate (nil -> "*").

## compile_where


```lua
function
```

## count


```lua
function NormSql.count(state: NormQueryState, d: NormDialect)
  -> statement: string
  2. params: any[]
```

 SELECT COUNT(*).

## create_table


```lua
function NormSql.create_table(table_name: string, columns: NormColumn[], d: NormDialect, foreign_keys?: NormForeignKey[])
  -> statement: string
```

 CREATE TABLE IF NOT EXISTS. Pass `foreign_keys` to append `FOREIGN KEY`
 constraints (the caller decides whether to emit them per dialect/options).

@*param* `columns` — Ordered list (each has a `.name`).

@*param* `foreign_keys` — Optional FK constraints to append.

## delete


```lua
function NormSql.delete(state: NormQueryState, d: NormDialect)
  -> statement: string
  2. params: any[]
```

 DELETE from state.

## drop_column


```lua
function NormSql.drop_column(table_name: string, name: string, d: NormDialect)
  -> string
```

 `ALTER TABLE t DROP COLUMN c` (MySQL, MariaDB, SQLite >= 3.35, Postgres).

## drop_index


```lua
function NormSql.drop_index(index_name: string, table_name: string, d: NormDialect)
  -> string
```

 `DROP INDEX`. MySQL needs the table (`DROP INDEX i ON t`); SQLite/Postgres don't.

## drop_table


```lua
function NormSql.drop_table(table_name: string, d: NormDialect)
  -> string
```

 `DROP TABLE IF EXISTS t`.

## foreign_key_def


```lua
function
```

## increment


```lua
function NormSql.increment(state: NormQueryState, columns: { column: string, amount: number }[], d: NormDialect)
  -> statement: string
  2. params: any[]
```

 Atomic in-place column arithmetic: `UPDATE t SET col = col + ?[, ...] WHERE ...`.
 Each entry is `{ column = ..., amount = ... }` (a negative amount decrements).

## insert


```lua
function NormSql.insert(table_name: string, data: table<string, any>, d: NormDialect, returning?: string)
  -> statement: string
  2. params: any[]
```

 INSERT. Pass `returning` (a column name) to append a `RETURNING <col>` clause
 (SQLite >= 3.35 / PostgreSQL) so the new row's value comes back atomically.

@*param* `returning` — Column to append in a `RETURNING` clause.

## insert_many


```lua
function NormSql.insert_many(table_name: string, columns: string[], data_rows: table<string, any>[], d: NormDialect, returning?: string)
  -> statement: string
  2. params: any[]
```

 Multi-row INSERT: `INSERT INTO t (cols) VALUES (…), (…)`. `columns` is the
 ordered column union; each `data_rows[i]` is an (already-encoded) `{col=value}`
 map — a column absent from a row is written as `NULL`. Pass `returning` (a raw
 list like "*", on RETURNING-capable engines) to get the inserted rows back.

@*param* `returning` — Raw RETURNING list (e.g. "*").

## normalize


```lua
function
```

## quote_ref


```lua
function
```

## rename_column


```lua
function NormSql.rename_column(table_name: string, from: string, to: string, d: NormDialect)
  -> string
```

 `ALTER TABLE t RENAME COLUMN a TO b` (MySQL 8 / MariaDB 10.5.2+ / SQLite 3.25+ / Postgres).

## select


```lua
function NormSql.select(state: NormQueryState, d: NormDialect)
  -> statement: string
  2. params: any[]
```

 SELECT from a query-builder state.

## update


```lua
function NormSql.update(state: NormQueryState, data: table<string, any>, d: NormDialect)
  -> statement: string
  2. params: any[]
```

 UPDATE from state + data.

## upsert


```lua
function NormSql.upsert(table_name: string, data: table<string, any>, conflict_cols: string[], update_cols: string[], d: NormDialect)
  -> statement: string
  2. params: any[]
```

 INSERT with an atomic "on conflict, update" clause (upsert). Dialect-aware:
 MySQL/MariaDB emit `ON DUPLICATE KEY UPDATE col = VALUES(col)`; SQLite/Postgres
 emit `ON CONFLICT (target) DO UPDATE SET col = excluded.col`. `conflict_cols`
 (the unique/PK columns) define the SQLite/Postgres target. With no `update_cols`
 the conflict is a no-op (`DO NOTHING`).

@*param* `conflict_cols` — Unique/PK columns identifying a conflict.

@*param* `update_cols` — Columns to overwrite on conflict (may be empty).


---

# NormTypes

 Column type factories, exposed as `Norm.types`. Each returns a column
 descriptor consumed by `orm:define`. Available: `id, integer, bigint, string,
 text, float, double, boolean, datetime, date, json` plus `raw` for raw SQL
 defaults. Common options: `{ length, nullable, unique, primary, autoincrement, default }`.
 ```lua
     db:define("users", {
         id         = Norm.types.id(),                              -- INT PK AUTO_INCREMENT
         name       = Norm.types.string({ length = 64, nullable = false }),
         email      = Norm.types.string({ length = 128, unique = true }),
         coins      = Norm.types.integer({ default = 0 }),
         admin      = Norm.types.boolean({ default = false }),
         created_at = Norm.types.datetime({ default = Norm.types.raw("CURRENT_TIMESTAMP") }),
     })
 ```

## belongsTo


```lua
function NormTypes.belongsTo(target: string, options?: NormRelationOptions)
  -> NormRelation
```

 This record holds a foreign key pointing to one `target` row (the "many" side
 of a one-to-many, or either side of a one-to-one). `key` defaults to
 `<relationName>_id`, `otherKey` to the target's primary key.

 This is the ONLY relation that can emit a real SQL `FOREIGN KEY` constraint
 (its `key` lives on this table). Add `onDelete`/`onUpdate` to control the
 referential action — emitted by `sync()` when foreign keys are enabled.
 ```lua
     db:define("posts", {
         id      = Norm.types.id(),
         user_id = Norm.types.integer({ nullable = false }), -- the FK column
         author  = Norm.types.belongsTo("users", { key = "user_id", onDelete = "CASCADE" }),
     })
     -- post:load("author"):await()  /  Post:query():include("author"):all():await()
 ```

## belongsToMany


```lua
function NormTypes.belongsToMany(target: string, options?: NormRelationOptions)
  -> NormRelation
```

 Many-to-many: this model and `target` are linked through a **pivot** (join)
 table that holds a foreign key to each side. `record:load(name)` and
 `query:include(name)` resolve to an **array** of target records (batched in two
 queries — pivot then targets — so no N+1). Defaults, all overridable:
 `through` = the two table singulars joined alphabetically (`users`+`roles` ->
 `role_user`); `key` = `<thisSingular>_id` (pivot FK to this model); `otherKey`
 = `<targetSingular>_id` (pivot FK to the target); `localKey`/`otherLocalKey` =
 the respective primary keys. The pivot table is yours to manage — define it as
 a normal model if you want `sync()` to create it.
 ```lua
     db:define("users", {
         id    = Norm.types.id(),
         roles = Norm.types.belongsToMany("roles"), -- through `role_user`
     })
     -- user:load("roles"):await()  /  User:query():include("roles"):all():await()
 ```

## bigint


```lua
function NormTypes.bigint(options?: NormColumnOptions)
  -> NormColumn
```

 64-bit integer (`BIGINT` / SQLite `INTEGER`). For values beyond 32 bits, e.g.
 Discord/Steam IDs or epoch milliseconds.
 ```lua
     steam_id = Norm.types.bigint({ unique = true }),
 ```

## boolean


```lua
function NormTypes.boolean(options?: NormColumnOptions)
  -> NormColumn
```

 Boolean, stored as `TINYINT(1)` on MySQL / `INTEGER` on SQLite. Norm converts
 to/from a real Lua boolean automatically (true/false in, true/false out).
 ```lua
     admin = Norm.types.boolean({ default = false }),
 ```

## date


```lua
function NormTypes.date(options?: NormColumnOptions)
  -> NormColumn
```

 Date only (`DATE` / SQLite `TEXT`).
 ```lua
     birthday = Norm.types.date(),
 ```

## datetime


```lua
function NormTypes.datetime(options?: NormColumnOptions)
  -> NormColumn
```

 Date + time (`DATETIME` / SQLite `TEXT`). Pair with `Norm.types.raw` to get a
 DB-side default timestamp.
 ```lua
     created_at = Norm.types.datetime({ default = Norm.types.raw("CURRENT_TIMESTAMP") }),
 ```

## double


```lua
function NormTypes.double(options?: NormColumnOptions)
  -> NormColumn
```

 Double-precision floating point (`DOUBLE` / SQLite `REAL`). Prefer over
 `float` when you need more precision (coordinates, money-as-float, etc.).
 ```lua
     pos_x = Norm.types.double({ default = 0 }),
 ```

## float


```lua
function NormTypes.float(options?: NormColumnOptions)
  -> NormColumn
```

 Single-precision floating point (`FLOAT` / SQLite `REAL`).
 ```lua
     ratio = Norm.types.float({ default = 1.0 }),
 ```

## hasMany


```lua
function NormTypes.hasMany(target: string, options?: NormRelationOptions)
  -> NormRelation
```

 One-to-many inverse: the `target` table holds a foreign key pointing back to
 this model's rows. `key` defaults to `<thisTableSingular>_id`, `otherKey` to
 this primary key. As with `hasOne`, the FK column lives on the target, so put
 the `belongsTo` (and any `onDelete`) there.
 ```lua
     db:define("users", {
         id    = Norm.types.id(),
         posts = Norm.types.hasMany("posts", { key = "user_id" }),
     })
     -- user:load("posts"):await()  /  User:query():include("posts"):all():await()
 ```

## hasOne


```lua
function NormTypes.hasOne(target: string, options?: NormRelationOptions)
  -> NormRelation
```

 One-to-one inverse: the `target` table holds a foreign key pointing back to a
 single row of this model. `key` defaults to `<thisTableSingular>_id`,
 `otherKey` to this primary key. Declare the matching `belongsTo` on the target
 if you want the FK constraint (the FK column lives there, not here).
 ```lua
     db:define("users", {
         id      = Norm.types.id(),
         profile = Norm.types.hasOne("profiles", { key = "user_id" }),
     })
     -- user:load("profile"):await()  /  User:query():include("profile"):all():await()
 ```

## id


```lua
function NormTypes.id(options?: NormColumnOptions)
  -> NormColumn
```

 Auto-increment integer primary key.

## integer


```lua
function NormTypes.integer(options?: NormColumnOptions)
  -> NormColumn
```

 Integer column (`INT` / SQLite `INTEGER`). Often a foreign-key column.
 ```lua
     coins   = Norm.types.integer({ default = 0 }),
     user_id = Norm.types.integer({ nullable = false }), -- FK column
 ```

## json


```lua
function NormTypes.json(options?: NormColumnOptions)
  -> NormColumn
```

 JSON column (`JSON` on MySQL / `TEXT` on SQLite). When a JSON provider is
 active (auto-detected, or set via the `json` option), Norm (de)serialises it
 automatically: assign a Lua table and read a Lua table back. With `json =
 false` it stays a raw string. A `default` must be a valid JSON literal string.
 ```lua
     coordinates = Norm.types.json({ default = '{"x":0,"y":0,"z":0}' }),
     -- char.coordinates = { x = 1, y = 2, z = 3 }; char:save():await()
 ```

## raw


```lua
function NormTypes.raw(sql: string)
  -> NormRawDefault
```

 Mark a default value as raw SQL (not quoted), e.g. CURRENT_TIMESTAMP.

## string


```lua
function NormTypes.string(options?: NormColumnOptions)
  -> NormColumn
```

 Variable-length string (`VARCHAR(length)` / SQLite `TEXT`). Pass `length` for
 the VARCHAR size on MySQL (ignored by SQLite, which is typeless).
 ```lua
     name  = Norm.types.string({ length = 64, nullable = false }),
     email = Norm.types.string({ length = 128, unique = true }),
 ```

## text


```lua
function NormTypes.text(options?: NormColumnOptions)
  -> NormColumn
```

 Unbounded text (`TEXT`). Use for large free-form content where `string`'s
 length cap is impractical.
 ```lua
     bio = Norm.types.text(),
 ```


---

# NormUtils

 Small helpers used across Norm. No dependencies.

## assert


```lua
function NormUtils.assert(condition: <T>, message: string)
  -> <T>
```

 Assert with the Norm tag. Returns the (truthy) condition on success.

## copy


```lua
function NormUtils.copy(t: <T:table>)
  -> <T:table>
```

 Shallow copy of a table.

## default_pivot


```lua
function NormUtils.default_pivot(a: string, b: string)
  -> string
```

 Default pivot table name for a many-to-many: the two table singulars joined by
 "_" in alphabetical order (e.g. `users` + `roles` -> `role_user`).

## escape


```lua
function NormUtils.escape(value: boolean|string|number|nil)
  -> string
```

 Naive fallback value escaper (adapters should prefer parameter binding).

## log


```lua
function NormUtils.log(level: string, fmt: string, ...any)
  -> nil
```

 Format and emit a log line through the active logger.

## logger


```lua
fun(level: string, message: string)
```

## now_utc


```lua
function NormUtils.now_utc()
  -> string|nil
```

 Current UTC timestamp as `YYYY-MM-DD HH:MM:SS` (portable across MySQL DATETIME
 and SQLite TEXT). Returns nil if `os.date` is unavailable.

## singularize


```lua
function NormUtils.singularize(name: string)
  -> string
```

 Naive singulariser (drops a trailing "s"), for relation key/table defaults.

## soft_scope


```lua
function NormUtils.soft_scope(state: NormQueryState, model: NormModel)
```

 Append a "not soft-deleted" condition (`<col> IS NULL`) to a query state's
 where list when the model uses soft deletes. No-op otherwise.

## sorted_keys


```lua
function NormUtils.sorted_keys(dict: table<string, any>)
  -> string[]
```

 Sorted array of a dictionary's keys (stable SQL output).


---

# NormWhere

## bool


```lua
("AND"|"OR")?
```

Conjunction with the previous condition.

## column


```lua
string
```

## op


```lua
string
```

Operator: "=", "!=", "<", ">", "<=", ">=", "LIKE", "IN", "NOT IN".

## value


```lua
any
```

`nil` -> IS [NOT] NULL. For IN/NOT IN an array.


---

# _G


```lua
_G
```


---

# _G


A global variable (not a function) that holds the global environment (see [§2.2](command:extension.lua.doc?["en-us/54/manual.html/2.2"])). Lua itself does not use this variable; changing its value does not affect any environment, nor vice versa.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-_G"])



---

# _VERSION


```lua
string
```


---

# any


---

# arg


```lua
string[]
```


---

# assert


```lua
function assert(v?: <T>, message?: any, ...any)
  -> <T>
  2. ...any
```


---

# boolean


---

# collectgarbage


```lua
function collectgarbage(...any)
```


---

# coroutine


```lua
coroutinelib
```


---

# coroutine.close


```lua
function coroutine.close(co: thread)
  -> noerror: boolean
  2. errorobject: any
```


---

# coroutine.create


```lua
function coroutine.create(f: fun(...any):...unknown)
  -> thread
```


---

# coroutine.isyieldable


```lua
function coroutine.isyieldable(co?: thread)
  -> boolean
```


---

# coroutine.resume


```lua
function coroutine.resume(co: thread, val1?: any, ...any)
  -> success: boolean
  2. ...any
```


---

# coroutine.running


```lua
function coroutine.running()
  -> running: thread
  2. ismain: boolean
```


---

# coroutine.status


```lua
function coroutine.status(co: thread)
  -> "dead"|"normal"|"running"|"suspended"
```


---

# coroutine.wrap


```lua
function coroutine.wrap(f: fun(...any):...unknown)
  -> fun(...any):...unknown
```


---

# coroutine.yield


```lua
(async) function coroutine.yield(...any)
  -> ...any
```


---

# coroutinelib




[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-coroutine"])


## close


```lua
function coroutine.close(co: thread)
  -> noerror: boolean
  2. errorobject: any
```


Closes coroutine `co` , closing all its pending to-be-closed variables and putting the coroutine in a dead state.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-coroutine.close"])

## create


```lua
function coroutine.create(f: fun(...any):...unknown)
  -> thread
```


Creates a new coroutine, with body `f`. `f` must be a function. Returns this new coroutine, an object with type `"thread"`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-coroutine.create"])

## isyieldable


```lua
function coroutine.isyieldable(co?: thread)
  -> boolean
```


Returns true when the coroutine `co` can yield. The default for `co` is the running coroutine.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-coroutine.isyieldable"])

## resume


```lua
function coroutine.resume(co: thread, val1?: any, ...any)
  -> success: boolean
  2. ...any
```


Starts or continues the execution of coroutine `co`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-coroutine.resume"])

## running


```lua
function coroutine.running()
  -> running: thread
  2. ismain: boolean
```


Returns the running coroutine plus a boolean, true when the running coroutine is the main one.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-coroutine.running"])

## status


```lua
function coroutine.status(co: thread)
  -> "dead"|"normal"|"running"|"suspended"
```


Returns the status of coroutine `co`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-coroutine.status"])


```lua
return #1:
    | "running" -- Is running.
    | "suspended" -- Is suspended or not started.
    | "normal" -- Is active but not running.
    | "dead" -- Has finished or stopped with an error.
```

## wrap


```lua
function coroutine.wrap(f: fun(...any):...unknown)
  -> fun(...any):...unknown
```


Creates a new coroutine, with body `f`; `f` must be a function. Returns a function that resumes the coroutine each time it is called.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-coroutine.wrap"])

## yield


```lua
(async) function coroutine.yield(...any)
  -> ...any
```


Suspends the execution of the calling coroutine.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-coroutine.yield"])


---

# debug


```lua
debuglib
```


---

# debug.debug


```lua
function debug.debug()
```


---

# debug.getfenv


```lua
function debug.getfenv(o: any)
  -> table
```


---

# debug.gethook


```lua
function debug.gethook(co?: thread)
  -> hook: function
  2. mask: string
  3. count: integer
```


---

# debug.getinfo


```lua
function debug.getinfo(thread: thread, f: integer|fun(...any):...unknown, what?: infowhat)
  -> debuginfo
```


---

# debug.getlocal


```lua
function debug.getlocal(thread: thread, f: integer|fun(...any):...unknown, index: integer)
  -> name: string
  2. value: any
```


---

# debug.getmetatable


```lua
function debug.getmetatable(object: any)
  -> metatable: table
```


---

# debug.getregistry


```lua
function debug.getregistry()
  -> table
```


---

# debug.getupvalue


```lua
function debug.getupvalue(f: fun(...any):...unknown, up: integer)
  -> name: string
  2. value: any
```


---

# debug.getuservalue


```lua
function debug.getuservalue(u: userdata, n?: integer)
  -> any
  2. boolean
```


---

# debug.setcstacklimit


```lua
function debug.setcstacklimit(limit: integer)
  -> boolean|integer
```


---

# debug.setfenv


```lua
function debug.setfenv(object: <T>, env: table)
  -> object: <T>
```


---

# debug.sethook


```lua
function debug.sethook(thread: thread, hook: fun(...any):...unknown, mask: hookmask, count?: integer)
```


---

# debug.setlocal


```lua
function debug.setlocal(thread: thread, level: integer, index: integer, value: any)
  -> name: string
```


---

# debug.setmetatable


```lua
function debug.setmetatable(value: <T>, meta?: table)
  -> value: <T>
```


---

# debug.setupvalue


```lua
function debug.setupvalue(f: fun(...any):...unknown, up: integer, value: any)
  -> name: string
```


---

# debug.setuservalue


```lua
function debug.setuservalue(udata: userdata, value: any, n?: integer)
  -> udata: userdata
```


---

# debug.traceback


```lua
function debug.traceback(thread: thread, message?: any, level?: integer)
  -> message: string
```


---

# debug.upvalueid


```lua
function debug.upvalueid(f: fun(...any):...unknown, n: integer)
  -> id: lightuserdata
```


---

# debug.upvaluejoin


```lua
function debug.upvaluejoin(f1: fun(...any):...unknown, n1: integer, f2: fun(...any):...unknown, n2: integer)
```


---

# debuginfo

## activelines


```lua
table
```

## currentline


```lua
integer
```

## ftransfer


```lua
integer
```

## func


```lua
function
```

## istailcall


```lua
boolean
```

## isvararg


```lua
boolean
```

## lastlinedefined


```lua
integer
```

## linedefined


```lua
integer
```

## name


```lua
string
```

## namewhat


```lua
string
```

## nparams


```lua
integer
```

## ntransfer


```lua
integer
```

## nups


```lua
integer
```

## short_src


```lua
string
```

## source


```lua
string
```

## what


```lua
string
```


---

# debuglib




[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-debug"])


## debug


```lua
function debug.debug()
```


Enters an interactive mode with the user, running each string that the user enters.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-debug.debug"])

## getfenv


```lua
function debug.getfenv(o: any)
  -> table
```


Returns the environment of object `o` .

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-debug.getfenv"])

## gethook


```lua
function debug.gethook(co?: thread)
  -> hook: function
  2. mask: string
  3. count: integer
```


Returns the current hook settings of the thread.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-debug.gethook"])

## getinfo


```lua
function debug.getinfo(thread: thread, f: integer|fun(...any):...unknown, what?: infowhat)
  -> debuginfo
```


Returns a table with information about a function.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-debug.getinfo"])


---

```lua
what:
   +> "n" -- `name` and `namewhat`
   +> "S" -- `source`, `short_src`, `linedefined`, `lastlinedefined`, and `what`
   +> "l" -- `currentline`
   +> "t" -- `istailcall`
   +> "u" -- `nups`, `nparams`, and `isvararg`
   +> "f" -- `func`
   +> "r" -- `ftransfer` and `ntransfer`
   +> "L" -- `activelines`
```

## getlocal


```lua
function debug.getlocal(thread: thread, f: integer|fun(...any):...unknown, index: integer)
  -> name: string
  2. value: any
```


Returns the name and the value of the local variable with index `local` of the function at level `f` of the stack.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-debug.getlocal"])

## getmetatable


```lua
function debug.getmetatable(object: any)
  -> metatable: table
```


Returns the metatable of the given value.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-debug.getmetatable"])

## getregistry


```lua
function debug.getregistry()
  -> table
```


Returns the registry table.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-debug.getregistry"])

## getupvalue


```lua
function debug.getupvalue(f: fun(...any):...unknown, up: integer)
  -> name: string
  2. value: any
```


Returns the name and the value of the upvalue with index `up` of the function.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-debug.getupvalue"])

## getuservalue


```lua
function debug.getuservalue(u: userdata, n?: integer)
  -> any
  2. boolean
```


Returns the `n`-th user value associated
to the userdata `u` plus a boolean,
`false` if the userdata does not have that value.


[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-debug.getuservalue"])

## setcstacklimit


```lua
function debug.setcstacklimit(limit: integer)
  -> boolean|integer
```


### **Deprecated in `Lua 5.4.2`**

Sets a new limit for the C stack. This limit controls how deeply nested calls can go in Lua, with the intent of avoiding a stack overflow.

In case of success, this function returns the old limit. In case of error, it returns `false`.


[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-debug.setcstacklimit"])

## setfenv


```lua
function debug.setfenv(object: <T>, env: table)
  -> object: <T>
```


Sets the environment of the given `object` to the given `table` .

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-debug.setfenv"])

## sethook


```lua
function debug.sethook(thread: thread, hook: fun(...any):...unknown, mask: hookmask, count?: integer)
```


Sets the given function as a hook.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-debug.sethook"])


---

```lua
mask:
   +> "c" -- Calls hook when Lua calls a function.
   +> "r" -- Calls hook when Lua returns from a function.
   +> "l" -- Calls hook when Lua enters a new line of code.
```

## setlocal


```lua
function debug.setlocal(thread: thread, level: integer, index: integer, value: any)
  -> name: string
```


Assigns the `value` to the local variable with index `local` of the function at `level` of the stack.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-debug.setlocal"])

## setmetatable


```lua
function debug.setmetatable(value: <T>, meta?: table)
  -> value: <T>
```


Sets the metatable for the given value to the given table (which can be `nil`).

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-debug.setmetatable"])

## setupvalue


```lua
function debug.setupvalue(f: fun(...any):...unknown, up: integer, value: any)
  -> name: string
```


Assigns the `value` to the upvalue with index `up` of the function.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-debug.setupvalue"])

## setuservalue


```lua
function debug.setuservalue(udata: userdata, value: any, n?: integer)
  -> udata: userdata
```


Sets the given `value` as
the `n`-th user value associated to the given `udata`.
`udata` must be a full userdata.


[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-debug.setuservalue"])

## traceback


```lua
function debug.traceback(thread: thread, message?: any, level?: integer)
  -> message: string
```


Returns a string with a traceback of the call stack. The optional message string is appended at the beginning of the traceback.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-debug.traceback"])

## upvalueid


```lua
function debug.upvalueid(f: fun(...any):...unknown, n: integer)
  -> id: lightuserdata
```


Returns a unique identifier (as a light userdata) for the upvalue numbered `n` from the given function.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-debug.upvalueid"])

## upvaluejoin


```lua
function debug.upvaluejoin(f1: fun(...any):...unknown, n1: integer, f2: fun(...any):...unknown, n2: integer)
```


Make the `n1`-th upvalue of the Lua closure `f1` refer to the `n2`-th upvalue of the Lua closure `f2`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-debug.upvaluejoin"])


---

# dofile


```lua
function dofile(filename?: string)
  -> ...any
```


---

# error


```lua
function error(message: any, level?: integer)
```


---

# exitcode


---

# false


---

# file*




[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-file"])


## close


```lua
(method) file*:close()
  -> suc: true?
  2. exitcode: exitcode?
  3. code: integer?
```


Close `file`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-file:close"])


```lua
suc:
    | true

exitcode:
    | "exit"
    | "signal"
```

## flush


```lua
(method) file*:flush()
```


Saves any written data to `file`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-file:flush"])

## lines


```lua
(method) file*:lines(...readmode)
  -> fun():any, ...unknown
```


------
```lua
for c in file:lines(...) do
    body
end
```


[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-file:lines"])


```lua
...(param):
    | "n" -- Reads a numeral and returns it as number.
    | "a" -- Reads the whole file.
   -> "l" -- Reads the next line skipping the end of line.
    | "L" -- Reads the next line keeping the end of line.
```

## read


```lua
(method) file*:read(...readmode)
  -> any
  2. ...any
```


Reads the `file`, according to the given formats, which specify what to read.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-file:read"])


```lua
...(param):
    | "n" -- Reads a numeral and returns it as number.
    | "a" -- Reads the whole file.
   -> "l" -- Reads the next line skipping the end of line.
    | "L" -- Reads the next line keeping the end of line.
```

## seek


```lua
(method) file*:seek(whence?: seekwhence, offset?: integer)
  -> offset: integer
  2. errmsg: string?
```


Sets and gets the file position, measured from the beginning of the file.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-file:seek"])


```lua
whence:
    | "set" -- Base is beginning of the file.
   -> "cur" -- Base is current position.
    | "end" -- Base is end of file.
```

## setvbuf


```lua
(method) file*:setvbuf(mode: vbuf, size?: integer)
```


Sets the buffering mode for an output file.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-file:setvbuf"])


```lua
mode:
    | "no" -- Output operation appears immediately.
    | "full" -- Performed only when the buffer is full.
    | "line" -- Buffered until a newline is output.
```

## write


```lua
(method) file*:write(...string|number)
  -> file*?
  2. errmsg: string?
```


Writes the value of each of its arguments to `file`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-file:write"])


---

# filetype


---

# function


---

# getfenv


```lua
function getfenv(f?: integer|fun(...any):...unknown)
  -> table
```


---

# getmetatable


```lua
function getmetatable(object: any)
  -> metatable: table
```


---

# hookmask


---

# infowhat


---

# integer


---

# io


```lua
iolib
```


---

# io.close


```lua
function io.close(file?: file*)
  -> suc: true?
  2. exitcode: exitcode?
  3. code: integer?
```


---

# io.flush


```lua
function io.flush()
```


---

# io.input


```lua
function io.input(file: string|file*)
```


---

# io.lines


```lua
function io.lines(filename?: string, ...readmode)
  -> fun():any, ...unknown
```


---

# io.open


```lua
function io.open(filename: string, mode?: openmode)
  -> file*?
  2. errmsg: string?
```


---

# io.output


```lua
function io.output(file: string|file*)
```


---

# io.popen


```lua
function io.popen(prog: string, mode?: popenmode)
  -> file*?
  2. errmsg: string?
```


---

# io.read


```lua
function io.read(...readmode)
  -> any
  2. ...any
```


---

# io.tmpfile


```lua
function io.tmpfile()
  -> file*
```


---

# io.type


```lua
function io.type(file: file*)
  -> filetype
```


---

# io.write


```lua
function io.write(...any)
  -> file*
  2. errmsg: string?
```


---

# iolib




[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-io"])


## close


```lua
function io.close(file?: file*)
  -> suc: true?
  2. exitcode: exitcode?
  3. code: integer?
```


Close `file` or default output file.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-io.close"])


```lua
suc:
    | true

exitcode:
    | "exit"
    | "signal"
```

## flush


```lua
function io.flush()
```


Saves any written data to default output file.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-io.flush"])

## input


```lua
function io.input(file: string|file*)
```


Sets `file` as the default input file.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-io.input"])

## lines


```lua
function io.lines(filename?: string, ...readmode)
  -> fun():any, ...unknown
```


------
```lua
for c in io.lines(filename, ...) do
    body
end
```


[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-io.lines"])


```lua
...(param):
    | "n" -- Reads a numeral and returns it as number.
    | "a" -- Reads the whole file.
   -> "l" -- Reads the next line skipping the end of line.
    | "L" -- Reads the next line keeping the end of line.
```

## open


```lua
function io.open(filename: string, mode?: openmode)
  -> file*?
  2. errmsg: string?
```


Opens a file, in the mode specified in the string `mode`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-io.open"])


```lua
mode:
   -> "r" -- Read mode.
    | "w" -- Write mode.
    | "a" -- Append mode.
    | "r+" -- Update mode, all previous data is preserved.
    | "w+" -- Update mode, all previous data is erased.
    | "a+" -- Append update mode, previous data is preserved, writing is only allowed at the end of file.
    | "rb" -- Read mode. (in binary mode.)
    | "wb" -- Write mode. (in binary mode.)
    | "ab" -- Append mode. (in binary mode.)
    | "r+b" -- Update mode, all previous data is preserved. (in binary mode.)
    | "w+b" -- Update mode, all previous data is erased. (in binary mode.)
    | "a+b" -- Append update mode, previous data is preserved, writing is only allowed at the end of file. (in binary mode.)
```

## output


```lua
function io.output(file: string|file*)
```


Sets `file` as the default output file.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-io.output"])

## popen


```lua
function io.popen(prog: string, mode?: popenmode)
  -> file*?
  2. errmsg: string?
```


Starts program prog in a separated process.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-io.popen"])


```lua
mode:
    | "r" -- Read data from this program by `file`.
    | "w" -- Write data to this program by `file`.
```

## read


```lua
function io.read(...readmode)
  -> any
  2. ...any
```


Reads the `file`, according to the given formats, which specify what to read.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-io.read"])


```lua
...(param):
    | "n" -- Reads a numeral and returns it as number.
    | "a" -- Reads the whole file.
   -> "l" -- Reads the next line skipping the end of line.
    | "L" -- Reads the next line keeping the end of line.
```

## stderr


```lua
file*
```


standard error.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-io.stderr"])


## stdin


```lua
file*
```


standard input.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-io.stdin"])


## stdout


```lua
file*
```


standard output.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-io.stdout"])


## tmpfile


```lua
function io.tmpfile()
  -> file*
```


In case of success, returns a handle for a temporary file.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-io.tmpfile"])

## type


```lua
function io.type(file: file*)
  -> filetype
```


Checks whether `obj` is a valid file handle.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-io.type"])


```lua
return #1:
    | "file" -- Is an open file handle.
    | "closed file" -- Is a closed file handle.
    | `nil` -- Is not a file handle.
```

## write


```lua
function io.write(...any)
  -> file*
  2. errmsg: string?
```


Writes the value of each of its arguments to default output file.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-io.write"])


---

# ipairs


```lua
function ipairs(t: <T:table>)
  -> fun(table: <V>[], i?: integer):integer, <V>
  2. <T:table>
  3. i: integer
```


---

# lightuserdata


---

# load


```lua
function load(chunk: string|function, chunkname?: string, mode?: loadmode, env?: table)
  -> function?
  2. error_message: string?
```


---

# loadfile


```lua
function loadfile(filename?: string, mode?: loadmode, env?: table)
  -> function?
  2. error_message: string?
```


---

# loadmode


---

# loadstring


```lua
function loadstring(text: string, chunkname?: string)
  -> function?
  2. error_message: string?
```


---

# localecategory


---

# math


```lua
mathlib
```


---

# math.abs


```lua
function math.abs(x: <Number:number>)
  -> <Number:number>
```


---

# math.acos


```lua
function math.acos(x: number)
  -> number
```


---

# math.asin


```lua
function math.asin(x: number)
  -> number
```


---

# math.atan


```lua
function math.atan(y: number, x?: number)
  -> number
```


---

# math.atan2


```lua
function math.atan2(y: number, x: number)
  -> number
```


---

# math.ceil


```lua
function math.ceil(x: number)
  -> integer
```


---

# math.cos


```lua
function math.cos(x: number)
  -> number
```


---

# math.cosh


```lua
function math.cosh(x: number)
  -> number
```


---

# math.deg


```lua
function math.deg(x: number)
  -> number
```


---

# math.exp


```lua
function math.exp(x: number)
  -> number
```


---

# math.floor


```lua
function math.floor(x: number)
  -> integer
```


---

# math.fmod


```lua
function math.fmod(x: number, y: number)
  -> number
```


---

# math.frexp


```lua
function math.frexp(x: number)
  -> m: number
  2. e: number
```


---

# math.ldexp


```lua
function math.ldexp(m: number, e: number)
  -> number
```


---

# math.log


```lua
function math.log(x: number, base?: integer)
  -> number
```


---

# math.log10


```lua
function math.log10(x: number)
  -> number
```


---

# math.max


```lua
function math.max(x: <Number:number>, ...<Number:number>)
  -> <Number:number>
```


---

# math.min


```lua
function math.min(x: <Number:number>, ...<Number:number>)
  -> <Number:number>
```


---

# math.modf


```lua
function math.modf(x: number)
  -> integer
  2. number
```


---

# math.pow


```lua
function math.pow(x: number, y: number)
  -> number
```


---

# math.rad


```lua
function math.rad(x: number)
  -> number
```


---

# math.random


```lua
function math.random(m: integer, n: integer)
  -> integer
```


---

# math.randomseed


```lua
function math.randomseed(x?: integer, y?: integer)
```


---

# math.sin


```lua
function math.sin(x: number)
  -> number
```


---

# math.sinh


```lua
function math.sinh(x: number)
  -> number
```


---

# math.sqrt


```lua
function math.sqrt(x: number)
  -> number
```


---

# math.tan


```lua
function math.tan(x: number)
  -> number
```


---

# math.tanh


```lua
function math.tanh(x: number)
  -> number
```


---

# math.tointeger


```lua
function math.tointeger(x: any)
  -> integer?
```


---

# math.type


```lua
function math.type(x: any)
  -> "float"|"integer"|'nil'
```


---

# math.ult


```lua
function math.ult(m: integer, n: integer)
  -> boolean
```


---

# mathlib




[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math"])


## abs


```lua
function math.abs(x: <Number:number>)
  -> <Number:number>
```


Returns the absolute value of `x`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.abs"])

## acos


```lua
function math.acos(x: number)
  -> number
```


Returns the arc cosine of `x` (in radians).

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.acos"])

## asin


```lua
function math.asin(x: number)
  -> number
```


Returns the arc sine of `x` (in radians).

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.asin"])

## atan


```lua
function math.atan(y: number, x?: number)
  -> number
```


Returns the arc tangent of `y/x` (in radians).

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.atan"])

## atan2


```lua
function math.atan2(y: number, x: number)
  -> number
```


Returns the arc tangent of `y/x` (in radians).

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.atan2"])

## ceil


```lua
function math.ceil(x: number)
  -> integer
```


Returns the smallest integral value larger than or equal to `x`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.ceil"])

## cos


```lua
function math.cos(x: number)
  -> number
```


Returns the cosine of `x` (assumed to be in radians).

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.cos"])

## cosh


```lua
function math.cosh(x: number)
  -> number
```


Returns the hyperbolic cosine of `x` (assumed to be in radians).

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.cosh"])

## deg


```lua
function math.deg(x: number)
  -> number
```


Converts the angle `x` from radians to degrees.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.deg"])

## exp


```lua
function math.exp(x: number)
  -> number
```


Returns the value `e^x` (where `e` is the base of natural logarithms).

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.exp"])

## floor


```lua
function math.floor(x: number)
  -> integer
```


Returns the largest integral value smaller than or equal to `x`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.floor"])

## fmod


```lua
function math.fmod(x: number, y: number)
  -> number
```


Returns the remainder of the division of `x` by `y` that rounds the quotient towards zero.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.fmod"])

## frexp


```lua
function math.frexp(x: number)
  -> m: number
  2. e: number
```


Returns two numbers `m` and `e` such that `x = m * (2 ^ e)`, where `e` is an integer. When `x` is zero, NaN, +inf, or -inf, `m` is equal to `x`; otherwise, the absolute value of `m` is in the range [0.5, 1).

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.frexp"])

## huge


```lua
number
```


A value larger than any other numeric value.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.huge"])


## ldexp


```lua
function math.ldexp(m: number, e: number)
  -> number
```


Returns `m * (2 ^ e)`, where `e` is an integer.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.ldexp"])

## log


```lua
function math.log(x: number, base?: integer)
  -> number
```


Returns the logarithm of `x` in the given base.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.log"])

## log10


```lua
function math.log10(x: number)
  -> number
```


Returns the base-10 logarithm of x.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.log10"])

## max


```lua
function math.max(x: <Number:number>, ...<Number:number>)
  -> <Number:number>
```


Returns the argument with the maximum value, according to the Lua operator `<`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.max"])

## maxinteger


```lua
integer
```


Miss locale <math.maxinteger>

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.maxinteger"])


## min


```lua
function math.min(x: <Number:number>, ...<Number:number>)
  -> <Number:number>
```


Returns the argument with the minimum value, according to the Lua operator `<`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.min"])

## mininteger


```lua
integer
```


Miss locale <math.mininteger>

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.mininteger"])


## modf


```lua
function math.modf(x: number)
  -> integer
  2. number
```


Returns the integral part of `x` and the fractional part of `x`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.modf"])

## pi


```lua
number
```


The value of *π*.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.pi"])


## pow


```lua
function math.pow(x: number, y: number)
  -> number
```


Returns `x ^ y` .

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.pow"])

## rad


```lua
function math.rad(x: number)
  -> number
```


Converts the angle `x` from degrees to radians.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.rad"])

## random


```lua
function math.random(m: integer, n: integer)
  -> integer
```


* `math.random()`: Returns a float in the range [0,1).
* `math.random(n)`: Returns a integer in the range [1, n].
* `math.random(m, n)`: Returns a integer in the range [m, n].


[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.random"])

## randomseed


```lua
function math.randomseed(x?: integer, y?: integer)
```


* `math.randomseed(x, y)`: Concatenate `x` and `y` into a 128-bit `seed` to reinitialize the pseudo-random generator.
* `math.randomseed(x)`: Equate to `math.randomseed(x, 0)` .
* `math.randomseed()`: Generates a seed with a weak attempt for randomness.


[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.randomseed"])

## sin


```lua
function math.sin(x: number)
  -> number
```


Returns the sine of `x` (assumed to be in radians).

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.sin"])

## sinh


```lua
function math.sinh(x: number)
  -> number
```


Returns the hyperbolic sine of `x` (assumed to be in radians).

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.sinh"])

## sqrt


```lua
function math.sqrt(x: number)
  -> number
```


Returns the square root of `x`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.sqrt"])

## tan


```lua
function math.tan(x: number)
  -> number
```


Returns the tangent of `x` (assumed to be in radians).

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.tan"])

## tanh


```lua
function math.tanh(x: number)
  -> number
```


Returns the hyperbolic tangent of `x` (assumed to be in radians).

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.tanh"])

## tointeger


```lua
function math.tointeger(x: any)
  -> integer?
```


Miss locale <math.tointeger>

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.tointeger"])

## type


```lua
function math.type(x: any)
  -> "float"|"integer"|'nil'
```


Miss locale <math.type>

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.type"])


```lua
return #1:
    | "integer"
    | "float"
    | 'nil'
```

## ult


```lua
function math.ult(m: integer, n: integer)
  -> boolean
```


Miss locale <math.ult>

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-math.ult"])


---

# metatable

## __add


```lua
fun(t1: any, t2: any):any|nil
```

## __band


```lua
fun(t1: any, t2: any):any|nil
```

## __bnot


```lua
fun(t: any):any|nil
```

## __bor


```lua
fun(t1: any, t2: any):any|nil
```

## __bxor


```lua
fun(t1: any, t2: any):any|nil
```

## __call


```lua
fun(t: any, ...any):...unknown|nil
```

## __close


```lua
fun(t: any, errobj: any):any|nil
```

## __concat


```lua
fun(t1: any, t2: any):any|nil
```

## __div


```lua
fun(t1: any, t2: any):any|nil
```

## __eq


```lua
fun(t1: any, t2: any):boolean|nil
```

## __gc


```lua
fun(t: any)|nil
```

## __idiv


```lua
fun(t1: any, t2: any):any|nil
```

## __index


```lua
table|fun(t: any, k: any):any|nil
```

## __le


```lua
fun(t1: any, t2: any):boolean|nil
```

## __len


```lua
fun(t: any):integer|nil
```

## __lt


```lua
fun(t1: any, t2: any):boolean|nil
```

## __metatable


```lua
any
```

## __mod


```lua
fun(t1: any, t2: any):any|nil
```

## __mode


```lua
'k'|'kv'|'v'|nil
```

## __mul


```lua
fun(t1: any, t2: any):any|nil
```

## __newindex


```lua
table|fun(t: any, k: any, v: any)|nil
```

## __pairs


```lua
fun(t: any):fun(t: any, k: any, v: any):any, any, any, any|nil
```

## __pow


```lua
fun(t1: any, t2: any):any|nil
```

## __shl


```lua
fun(t1: any, t2: any):any|nil
```

## __shr


```lua
fun(t1: any, t2: any):any|nil
```

## __sub


```lua
fun(t1: any, t2: any):any|nil
```

## __tostring


```lua
fun(t: any):string|nil
```

## __unm


```lua
fun(t: any):any|nil
```


---

# module


```lua
function module(name: string, ...any)
```


---

# newproxy


```lua
function newproxy(proxy: boolean|table|userdata)
  -> userdata
```


---

# next


```lua
function next(table: table<K, V>, index?: <K>)
  -> <K>?
  2. <V>?
```


---

# nil


---

# number


---

# openmode


---

# os


```lua
oslib
```


---

# os.clock


```lua
function os.clock()
  -> number
```


---

# os.date


```lua
function os.date(format?: string, time?: integer)
  -> string|osdate
```


---

# os.difftime


```lua
function os.difftime(t2: integer, t1: integer)
  -> integer
```


---

# os.execute


```lua
function os.execute(command?: string)
  -> suc: true?
  2. exitcode: exitcode?
  3. code: integer?
```


---

# os.exit


```lua
function os.exit(code?: boolean|integer, close?: boolean)
```


---

# os.getenv


```lua
function os.getenv(varname: string)
  -> string?
```


---

# os.remove


```lua
function os.remove(filename: string)
  -> suc: true?
  2. errmsg: string?
  3. errcode: integer?
```


---

# os.rename


```lua
function os.rename(oldname: string, newname: string)
  -> suc: true?
  2. errmsg: string?
  3. errcode: integer?
```


---

# os.setlocale


```lua
function os.setlocale(locale: string|nil, category?: localecategory)
  -> localecategory: string
```


---

# os.time


```lua
function os.time(date?: osdateparam)
  -> integer
```


---

# os.tmpname


```lua
function os.tmpname()
  -> string
```


---

# osdate

## day


```lua
string|integer
```


1-31

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-osdate.day"])


## hour


```lua
string|integer
```


0-23

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-osdate.hour"])


## isdst


```lua
boolean
```


daylight saving flag, a boolean

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-osdate.isdst"])


## min


```lua
string|integer
```


0-59

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-osdate.min"])


## month


```lua
string|integer
```


1-12

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-osdate.month"])


## sec


```lua
string|integer
```


0-61

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-osdate.sec"])


## wday


```lua
string|integer
```


weekday, 1–7, Sunday is 1

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-osdate.wday"])


## yday


```lua
string|integer
```


day of the year, 1–366

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-osdate.yday"])


## year


```lua
string|integer
```


four digits

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-osdate.year"])



---

# osdateparam

## day


```lua
string|integer
```


1-31

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-osdate.day"])


## hour


```lua
(string|integer)?
```


0-23

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-osdate.hour"])


## isdst


```lua
boolean?
```


daylight saving flag, a boolean

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-osdate.isdst"])


## min


```lua
(string|integer)?
```


0-59

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-osdate.min"])


## month


```lua
string|integer
```


1-12

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-osdate.month"])


## sec


```lua
(string|integer)?
```


0-61

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-osdate.sec"])


## wday


```lua
(string|integer)?
```


weekday, 1–7, Sunday is 1

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-osdate.wday"])


## yday


```lua
(string|integer)?
```


day of the year, 1–366

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-osdate.yday"])


## year


```lua
string|integer
```


four digits

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-osdate.year"])



---

# oslib




[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-os"])


## clock


```lua
function os.clock()
  -> number
```


Returns an approximation of the amount in seconds of CPU time used by the program.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-os.clock"])

## date


```lua
function os.date(format?: string, time?: integer)
  -> string|osdate
```


Returns a string or a table containing date and time, formatted according to the given string `format`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-os.date"])

## difftime


```lua
function os.difftime(t2: integer, t1: integer)
  -> integer
```


Returns the difference, in seconds, from time `t1` to time `t2`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-os.difftime"])

## execute


```lua
function os.execute(command?: string)
  -> suc: true?
  2. exitcode: exitcode?
  3. code: integer?
```


Passes `command` to be executed by an operating system shell.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-os.execute"])


```lua
suc:
    | true

exitcode:
    | "exit"
    | "signal"
```

## exit


```lua
function os.exit(code?: boolean|integer, close?: boolean)
```


Calls the ISO C function `exit` to terminate the host program.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-os.exit"])

## getenv


```lua
function os.getenv(varname: string)
  -> string?
```


Returns the value of the process environment variable `varname`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-os.getenv"])

## remove


```lua
function os.remove(filename: string)
  -> suc: true?
  2. errmsg: string?
  3. errcode: integer?
```


Deletes the file with the given name.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-os.remove"])


```lua
suc:
    | true
```

## rename


```lua
function os.rename(oldname: string, newname: string)
  -> suc: true?
  2. errmsg: string?
  3. errcode: integer?
```


Renames the file or directory named `oldname` to `newname`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-os.rename"])


```lua
suc:
    | true
```

## setlocale


```lua
function os.setlocale(locale: string|nil, category?: localecategory)
  -> localecategory: string
```


Sets the current locale of the program.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-os.setlocale"])


```lua
category:
   -> "all"
    | "collate"
    | "ctype"
    | "monetary"
    | "numeric"
    | "time"
```

## time


```lua
function os.time(date?: osdateparam)
  -> integer
```


Returns the current time when called without arguments, or a time representing the local date and time specified by the given table.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-os.time"])

## tmpname


```lua
function os.tmpname()
  -> string
```


Returns a string with a file name that can be used for a temporary file.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-os.tmpname"])


---

# package


```lua
packagelib
```


---

# package.config


```lua
string
```


---

# package.loaders


```lua
table
```


---

# package.loadlib


```lua
function package.loadlib(libname: string, funcname: string)
  -> any
```


---

# package.searchers


```lua
table
```


---

# package.searchpath


```lua
function package.searchpath(name: string, path: string, sep?: string, rep?: string)
  -> filename: string?
  2. errmsg: string?
```


---

# package.seeall


```lua
function package.seeall(module: table)
```


---

# packagelib




[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-package"])


## config


```lua
string
```


A string describing some compile-time configurations for packages.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-package.config"])


## cpath


```lua
string
```


The path used by `require` to search for a C loader.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-package.cpath"])


## loaded


```lua
table
```


A table used by `require` to control which modules are already loaded.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-package.loaded"])


## loaders


```lua
table
```


A table used by `require` to control how to load modules.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-package.loaders"])


## loadlib


```lua
function package.loadlib(libname: string, funcname: string)
  -> any
```


Dynamically links the host program with the C library `libname`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-package.loadlib"])

## path


```lua
string
```


The path used by `require` to search for a Lua loader.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-package.path"])


## preload


```lua
table
```


A table to store loaders for specific modules.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-package.preload"])


## searchers


```lua
table
```


A table used by `require` to control how to load modules.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-package.searchers"])


## searchpath


```lua
function package.searchpath(name: string, path: string, sep?: string, rep?: string)
  -> filename: string?
  2. errmsg: string?
```


Searches for the given `name` in the given `path`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-package.searchpath"])

## seeall


```lua
function package.seeall(module: table)
```


Sets a metatable for `module` with its `__index` field referring to the global environment, so that this module inherits values from the global environment. To be used as an option to function `module` .

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-package.seeall"])


---

# pairs


```lua
function pairs(t: <T:table>)
  -> fun(table: table<K, V>, index?: <K>):<K>, <V>
  2. <T:table>
```


---

# pcall


```lua
function pcall(f: fun(...any):...unknown, arg1?: any, ...any)
  -> success: boolean
  2. result: any
  3. ...any
```


---

# popenmode


---

# print


```lua
function print(...any)
```


---

# rawequal


```lua
function rawequal(v1: any, v2: any)
  -> boolean
```


---

# rawget


```lua
function rawget(table: table, index: any)
  -> any
```


---

# rawlen


```lua
function rawlen(v: string|table)
  -> len: integer
```


---

# rawset


```lua
function rawset(table: table, index: any, value: any)
  -> table
```


---

# readmode


---

# require


```lua
function require(modname: string)
  -> unknown
  2. loaderdata: unknown
```


---

# seekwhence


---

# select


```lua
function select(index: integer|"#", ...any)
  -> any
```


---

# setfenv


```lua
function setfenv(f: integer|fun(...any):...unknown, table: table)
  -> function
```


---

# setmetatable


```lua
function setmetatable(table: table, metatable?: table|metatable)
  -> table
```


---

# string


```lua
stringlib
```


---

# string

## byte


```lua
function string.byte(s: string|number, i?: integer, j?: integer)
  -> ...integer
```


Returns the internal numeric codes of the characters `s[i], s[i+1], ..., s[j]`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.byte"])

## char


```lua
function string.char(byte: integer, ...integer)
  -> string
```


Returns a string with length equal to the number of arguments, in which each character has the internal numeric code equal to its corresponding argument.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.char"])

## dump


```lua
function string.dump(f: fun(...any):...unknown, strip?: boolean)
  -> string
```


Returns a string containing a binary representation (a *binary chunk*) of the given function.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.dump"])

## find


```lua
function string.find(s: string|number, pattern: string|number, init?: integer, plain?: boolean)
  -> start: integer|nil
  2. end: integer|nil
  3. ...any
```


Looks for the first match of `pattern` (see [§6.4.1](command:extension.lua.doc?["en-us/54/manual.html/6.4.1"])) in the string.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.find"])

@*return* `start`

@*return* `end`

@*return* `...` — captured

## format


```lua
function string.format(s: string|number, ...any)
  -> string
```


Returns a formatted version of its variable number of arguments following the description given in its first argument.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.format"])

## gmatch


```lua
function string.gmatch(s: string|number, pattern: string|number, init?: integer)
  -> fun():string, ...unknown
```


Returns an iterator function. Each call to that iterator continues matching `pattern` (see [§6.4.1](command:extension.lua.doc?["en-us/54/manual.html/6.4.1"])) over s and returns all captures.

The following example iterates over all words in string s, printing one per line:
```lua
    s =
"hello world from Lua"
    for w in string.gmatch(s, "%a+") do
        print(w)
    end
```


[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.gmatch"])

## gsub


```lua
function string.gsub(s: string|number, pattern: string|number, repl: string|number|function|table, n?: integer)
  -> string
  2. count: integer
```


Returns a copy of s where all occurrences of `pattern` (or the first n occurrences if n is given) are replaced by repl (see [§6.4.1](command:extension.lua.doc?["en-us/54/manual.html/6.4.1"])).

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.gsub"])

## len


```lua
function string.len(s: string|number)
  -> integer
```


Returns its length.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.len"])

## lower


```lua
function string.lower(s: string|number)
  -> string
```


Returns a copy of this string with all uppercase letters changed to lowercase.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.lower"])

## match


```lua
function string.match(s: string|number, pattern: string|number, init?: integer)
  -> ...any
```


Looks for the first match of `pattern` (see [§6.4.1](command:extension.lua.doc?["en-us/54/manual.html/6.4.1"])) in the string. If it finds one, `match` returns the captures; otherwise it returns nil.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.match"])

## pack


```lua
function string.pack(fmt: string, v1: string|number, v2?: string|number, ...string|number)
  -> binary: string
```


Returns a binary string containing the values `v1`, `v2`, etc. packed (that is, serialized in binary form) according to the format string `fmt` (see [§6.4.2](command:extension.lua.doc?["en-us/54/manual.html/6.4.2"])).

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.pack"])

## packsize


```lua
function string.packsize(fmt: string)
  -> integer
```


Returns the length of a string resulting from `string.pack` with the given format string `fmt`. The format string cannot contain the variable-length options `s` or `z` (see [§6.4.2](command:extension.lua.doc?["en-us/54/manual.html/6.4.2"])).

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.packsize"])

## rep


```lua
function string.rep(s: string|number, n: integer, sep?: string|number)
  -> string
```


Returns a string that is the concatenation of `n` copies of the string `s` separated by the string `sep`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.rep"])

## reverse


```lua
function string.reverse(s: string|number)
  -> string
```


Returns a string that is the string `s` reversed.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.reverse"])

## sub


```lua
function string.sub(s: string|number, i: integer, j?: integer)
  -> string
```


Returns the substring of the string that starts at `i` and continues until `j`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.sub"])

## unpack


```lua
function string.unpack(fmt: string, s: string, pos?: integer)
  -> ...any
```


Returns the values packed in string according to the format string `fmt` (see [§6.4.2](command:extension.lua.doc?["en-us/54/manual.html/6.4.2"])) .

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.unpack"])

## upper


```lua
function string.upper(s: string|number)
  -> string
```


Returns a copy of this string with all lowercase letters changed to uppercase.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.upper"])


---

# string.byte


```lua
function string.byte(s: string|number, i?: integer, j?: integer)
  -> ...integer
```


---

# string.char


```lua
function string.char(byte: integer, ...integer)
  -> string
```


---

# string.dump


```lua
function string.dump(f: fun(...any):...unknown, strip?: boolean)
  -> string
```


---

# string.find


```lua
function string.find(s: string|number, pattern: string|number, init?: integer, plain?: boolean)
  -> start: integer|nil
  2. end: integer|nil
  3. ...any
```


---

# string.format


```lua
function string.format(s: string|number, ...any)
  -> string
```


---

# string.gmatch


```lua
function string.gmatch(s: string|number, pattern: string|number, init?: integer)
  -> fun():string, ...unknown
```


---

# string.gsub


```lua
function string.gsub(s: string|number, pattern: string|number, repl: string|number|function|table, n?: integer)
  -> string
  2. count: integer
```


---

# string.len


```lua
function string.len(s: string|number)
  -> integer
```


---

# string.lower


```lua
function string.lower(s: string|number)
  -> string
```


---

# string.match


```lua
function string.match(s: string|number, pattern: string|number, init?: integer)
  -> ...any
```


---

# string.pack


```lua
function string.pack(fmt: string, v1: string|number, v2?: string|number, ...string|number)
  -> binary: string
```


---

# string.packsize


```lua
function string.packsize(fmt: string)
  -> integer
```


---

# string.rep


```lua
function string.rep(s: string|number, n: integer, sep?: string|number)
  -> string
```


---

# string.reverse


```lua
function string.reverse(s: string|number)
  -> string
```


---

# string.sub


```lua
function string.sub(s: string|number, i: integer, j?: integer)
  -> string
```


---

# string.unpack


```lua
function string.unpack(fmt: string, s: string, pos?: integer)
  -> ...any
```


---

# string.upper


```lua
function string.upper(s: string|number)
  -> string
```


---

# stringlib




[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string"])


## byte


```lua
function string.byte(s: string|number, i?: integer, j?: integer)
  -> ...integer
```


Returns the internal numeric codes of the characters `s[i], s[i+1], ..., s[j]`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.byte"])

## char


```lua
function string.char(byte: integer, ...integer)
  -> string
```


Returns a string with length equal to the number of arguments, in which each character has the internal numeric code equal to its corresponding argument.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.char"])

## dump


```lua
function string.dump(f: fun(...any):...unknown, strip?: boolean)
  -> string
```


Returns a string containing a binary representation (a *binary chunk*) of the given function.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.dump"])

## find


```lua
function string.find(s: string|number, pattern: string|number, init?: integer, plain?: boolean)
  -> start: integer|nil
  2. end: integer|nil
  3. ...any
```


Looks for the first match of `pattern` (see [§6.4.1](command:extension.lua.doc?["en-us/54/manual.html/6.4.1"])) in the string.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.find"])

@*return* `start`

@*return* `end`

@*return* `...` — captured

## format


```lua
function string.format(s: string|number, ...any)
  -> string
```


Returns a formatted version of its variable number of arguments following the description given in its first argument.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.format"])

## gmatch


```lua
function string.gmatch(s: string|number, pattern: string|number, init?: integer)
  -> fun():string, ...unknown
```


Returns an iterator function. Each call to that iterator continues matching `pattern` (see [§6.4.1](command:extension.lua.doc?["en-us/54/manual.html/6.4.1"])) over s and returns all captures.

The following example iterates over all words in string s, printing one per line:
```lua
    s =
"hello world from Lua"
    for w in string.gmatch(s, "%a+") do
        print(w)
    end
```


[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.gmatch"])

## gsub


```lua
function string.gsub(s: string|number, pattern: string|number, repl: string|number|function|table, n?: integer)
  -> string
  2. count: integer
```


Returns a copy of s where all occurrences of `pattern` (or the first n occurrences if n is given) are replaced by repl (see [§6.4.1](command:extension.lua.doc?["en-us/54/manual.html/6.4.1"])).

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.gsub"])

## len


```lua
function string.len(s: string|number)
  -> integer
```


Returns its length.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.len"])

## lower


```lua
function string.lower(s: string|number)
  -> string
```


Returns a copy of this string with all uppercase letters changed to lowercase.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.lower"])

## match


```lua
function string.match(s: string|number, pattern: string|number, init?: integer)
  -> ...any
```


Looks for the first match of `pattern` (see [§6.4.1](command:extension.lua.doc?["en-us/54/manual.html/6.4.1"])) in the string. If it finds one, `match` returns the captures; otherwise it returns nil.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.match"])

## pack


```lua
function string.pack(fmt: string, v1: string|number, v2?: string|number, ...string|number)
  -> binary: string
```


Returns a binary string containing the values `v1`, `v2`, etc. packed (that is, serialized in binary form) according to the format string `fmt` (see [§6.4.2](command:extension.lua.doc?["en-us/54/manual.html/6.4.2"])).

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.pack"])

## packsize


```lua
function string.packsize(fmt: string)
  -> integer
```


Returns the length of a string resulting from `string.pack` with the given format string `fmt`. The format string cannot contain the variable-length options `s` or `z` (see [§6.4.2](command:extension.lua.doc?["en-us/54/manual.html/6.4.2"])).

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.packsize"])

## rep


```lua
function string.rep(s: string|number, n: integer, sep?: string|number)
  -> string
```


Returns a string that is the concatenation of `n` copies of the string `s` separated by the string `sep`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.rep"])

## reverse


```lua
function string.reverse(s: string|number)
  -> string
```


Returns a string that is the string `s` reversed.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.reverse"])

## sub


```lua
function string.sub(s: string|number, i: integer, j?: integer)
  -> string
```


Returns the substring of the string that starts at `i` and continues until `j`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.sub"])

## unpack


```lua
function string.unpack(fmt: string, s: string, pos?: integer)
  -> ...any
```


Returns the values packed in string according to the format string `fmt` (see [§6.4.2](command:extension.lua.doc?["en-us/54/manual.html/6.4.2"])) .

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.unpack"])

## upper


```lua
function string.upper(s: string|number)
  -> string
```


Returns a copy of this string with all lowercase letters changed to uppercase.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-string.upper"])


---

# table


---

# table


```lua
tablelib
```


---

# table.concat


```lua
function table.concat(list: table, sep?: string, i?: integer, j?: integer)
  -> string
```


---

# table.create


```lua
function table.create(nseq: integer, nrec?: integer)
  -> table
```


---

# table.foreach


```lua
function table.foreach(list: any, callback: fun(key: string, value: any):<T>|nil)
  -> <T>|nil
```


---

# table.foreachi


```lua
function table.foreachi(list: any, callback: fun(key: string, value: any):<T>|nil)
  -> <T>|nil
```


---

# table.getn


```lua
function table.getn(list: <T>[])
  -> integer
```


---

# table.insert


```lua
function table.insert(list: table, pos: integer, value: any)
```


---

# table.maxn


```lua
function table.maxn(table: table)
  -> integer
```


---

# table.move


```lua
function table.move(a1: table, f: integer, e: integer, t: integer, a2?: table)
  -> a2: table
```


---

# table.pack


```lua
function table.pack(...any)
  -> table
```


---

# table.remove


```lua
function table.remove(list: table, pos?: integer)
  -> any
```


---

# table.sort


```lua
function table.sort(list: <T>[], comp?: fun(a: <T>, b: <T>):boolean)
```


---

# table.unpack


```lua
function table.unpack(list: { [1]: <T1>, [2]: <T2>, [3]: <T3>, [4]: <T4>, [5]: <T5>, [6]: <T6>, [7]: <T7>, [8]: <T8>, [9]: <T9>, [10]: <T10> }, i?: integer, j?: integer)
  -> <T1>
  2. <T2>
  3. <T3>
  4. <T4>
  5. <T5>
  6. <T6>
  7. <T7>
  8. <T8>
  9. <T9>
 10. <T10>
```


---

# tablelib




[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-table"])


## concat


```lua
function table.concat(list: table, sep?: string, i?: integer, j?: integer)
  -> string
```


Given a list where all elements are strings or numbers, returns the string `list[i]..sep..list[i+1] ··· sep..list[j]`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-table.concat"])

## create


```lua
function table.create(nseq: integer, nrec?: integer)
  -> table
```


Creates a new empty table, preallocating memory. This preallocation may help performance and save memory when you know in advance how many elements the table will have. Parameter `nseq` is a hint for how many elements the table will have as a sequence. Optional parameter `nrec` is a hint for how many other elements the table will have; its default is zero.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-table.create"])

## foreach


```lua
function table.foreach(list: any, callback: fun(key: string, value: any):<T>|nil)
  -> <T>|nil
```


Executes the given f over all elements of table. For each element, f is called with the index and respective value as arguments. If f returns a non-nil value, then the loop is broken, and this value is returned as the final value of foreach.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-table.foreach"])

## foreachi


```lua
function table.foreachi(list: any, callback: fun(key: string, value: any):<T>|nil)
  -> <T>|nil
```


Executes the given f over the numerical indices of table. For each index, f is called with the index and respective value as arguments. Indices are visited in sequential order, from 1 to n, where n is the size of the table. If f returns a non-nil value, then the loop is broken and this value is returned as the result of foreachi.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-table.foreachi"])

## getn


```lua
function table.getn(list: <T>[])
  -> integer
```


Returns the number of elements in the table. This function is equivalent to `#list`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-table.getn"])

## insert


```lua
function table.insert(list: table, pos: integer, value: any)
```


Inserts element `value` at position `pos` in `list`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-table.insert"])

## maxn


```lua
function table.maxn(table: table)
  -> integer
```


Returns the largest positive numerical index of the given table, or zero if the table has no positive numerical indices.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-table.maxn"])

## move


```lua
function table.move(a1: table, f: integer, e: integer, t: integer, a2?: table)
  -> a2: table
```


Moves elements from table `a1` to table `a2`.
```lua
a2[t],··· =
a1[f],···,a1[e]
return a2
```


[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-table.move"])

## pack


```lua
function table.pack(...any)
  -> table
```


Returns a new table with all arguments stored into keys `1`, `2`, etc. and with a field `"n"` with the total number of arguments.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-table.pack"])

## remove


```lua
function table.remove(list: table, pos?: integer)
  -> any
```


Removes from `list` the element at position `pos`, returning the value of the removed element.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-table.remove"])

## sort


```lua
function table.sort(list: <T>[], comp?: fun(a: <T>, b: <T>):boolean)
```


Sorts list elements in a given order, *in-place*, from `list[1]` to `list[#list]`.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-table.sort"])

## unpack


```lua
function table.unpack(list: { [1]: <T1>, [2]: <T2>, [3]: <T3>, [4]: <T4>, [5]: <T5>, [6]: <T6>, [7]: <T7>, [8]: <T8>, [9]: <T9>, [10]: <T10> }, i?: integer, j?: integer)
  -> <T1>
  2. <T2>
  3. <T3>
  4. <T4>
  5. <T5>
  6. <T6>
  7. <T7>
  8. <T8>
  9. <T9>
 10. <T10>
```


Returns the elements from the given list. This function is equivalent to
```lua
    return list[i], list[i+1], ···, list[j]
```
By default, `i` is `1` and `j` is `#list`.


[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-table.unpack"])


---

# thread


---

# tonumber


```lua
function tonumber(e: any)
  -> number?
```


---

# tostring


```lua
function tostring(v: any)
  -> string
```


---

# true


---

# type


```lua
function type(v: any)
  -> type: type
```


---

# type


---

# unknown


---

# unpack


```lua
function unpack(list: { [1]: <T1>, [2]: <T2>, [3]: <T3>, [4]: <T4>, [5]: <T5>, [6]: <T6>, [7]: <T7>, [8]: <T8>, [9]: <T9>, [10]: <T10> }, i?: integer, j?: integer)
  -> <T1>
  2. <T2>
  3. <T3>
  4. <T4>
  5. <T5>
  6. <T6>
  7. <T7>
  8. <T8>
  9. <T9>
 10. <T10>
```


```lua
function unpack(list: { [1]: <T1>, [2]: <T2>, [3]: <T3>, [4]: <T4>, [5]: <T5>, [6]: <T6>, [7]: <T7>, [8]: <T8>, [9]: <T9> })
  -> <T1>
  2. <T2>
  3. <T3>
  4. <T4>
  5. <T5>
  6. <T6>
  7. <T7>
  8. <T8>
  9. <T9>
```


---

# userdata


---

# utf8


```lua
utf8lib
```


---

# utf8.char


```lua
function utf8.char(code: integer, ...integer)
  -> string
```


---

# utf8.codepoint


```lua
function utf8.codepoint(s: string, i?: integer, j?: integer, lax?: boolean)
  -> code: integer
  2. ...integer
```


---

# utf8.codes


```lua
function utf8.codes(s: string, lax?: boolean)
  -> fun(s: string, p: integer):integer, integer
```


---

# utf8.len


```lua
function utf8.len(s: string, i?: integer, j?: integer, lax?: boolean)
  -> integer?
  2. errpos: integer?
```


---

# utf8.offset


```lua
function utf8.offset(s: string, n: integer, i?: integer)
  -> p: integer
```


---

# utf8lib




[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-utf8"])


## char


```lua
function utf8.char(code: integer, ...integer)
  -> string
```


Receives zero or more integers, converts each one to its corresponding UTF-8 byte sequence and returns a string with the concatenation of all these sequences.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-utf8.char"])

## charpattern


```lua
string
```


The pattern which matches exactly one UTF-8 byte sequence, assuming that the subject is a valid UTF-8 string.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-utf8.charpattern"])


## codepoint


```lua
function utf8.codepoint(s: string, i?: integer, j?: integer, lax?: boolean)
  -> code: integer
  2. ...integer
```


Returns the codepoints (as integers) from all characters in `s` that start between byte position `i` and `j` (both included).

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-utf8.codepoint"])

## codes


```lua
function utf8.codes(s: string, lax?: boolean)
  -> fun(s: string, p: integer):integer, integer
```


Returns values so that the construction
```lua
for p, c in utf8.codes(s) do
    body
end
```
will iterate over all UTF-8 characters in string s, with p being the position (in bytes) and c the code point of each character. It raises an error if it meets any invalid byte sequence.


[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-utf8.codes"])

## len


```lua
function utf8.len(s: string, i?: integer, j?: integer, lax?: boolean)
  -> integer?
  2. errpos: integer?
```


Returns the number of UTF-8 characters in string `s` that start between positions `i` and `j` (both inclusive).

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-utf8.len"])

## offset


```lua
function utf8.offset(s: string, n: integer, i?: integer)
  -> p: integer
```


Returns the position (in bytes) where the encoding of the `n`-th character of `s` (counting from position `i`) starts.

[View documents](command:extension.lua.doc?["en-us/54/manual.html/pdf-utf8.offset"])


---

# vbuf


---

# warn


```lua
function warn(message: string, ...any)
```


---

# xpcall


```lua
function xpcall(f: fun(...any):...unknown, msgh: function, arg1?: any, ...any)
  -> success: boolean
  2. result: any
  3. ...any
```