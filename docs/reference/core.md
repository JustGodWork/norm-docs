# Core API

The objects you use day to day: the `Norm` entry point, the ORM, models, records, and the query builder.

::: info Auto-generated
This page is generated from the source annotations (`scripts/gen-api.mjs`). Edit the doc comments in the Norm sources, not here.
:::

## Norm

Public API surface of Norm (the value returned by the bundle / global `Norm`).

### Adapter

```lua
NormAdapter
```

Base adapter class — extend (or duck-type) for custom adapters.

### Orm

```lua
NormOrm
```

The ORM root class.

### adapters

```lua
NormAdapters
```

Built-in adapters.

### class

```lua
LightClassFactory
```

The (separately loaded) class system.

### dialect

```lua
NormDialects
```

Built-in SQL dialects.

### json

```lua
NormJsonLib
```

JSON providers (`nanos`/`rapidjson`/`raw`/`detect`/`define`) for `json` columns.

### new

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

### promise

```lua
NormPromiseLib
```

Promise providers + builders.

### types

```lua
NormTypes
```

Column type factories.

## NormOrm

### adapter

```lua
NormAdapter
```

### define

```lua
NormOrm:define(table_name: string, schema: table<string, NormColumn>, options?: NormDefineOptions)
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

### execute

```lua
NormOrm:execute(query: string, params?: any[])
  -> promise: NormExecResultPromise
```

Run a raw parameterised write (INSERT/UPDATE/DELETE/DDL). Resolves with a
`{ affectedRows, insertId }` table.
```lua
    local res = db:execute("DELETE FROM `users` WHERE `id` = ?", { 1 }):await()
    print(res.affectedRows)
```

### foreign_keys

```lua
boolean|"auto"
```

Whether `sync()` emits SQL FOREIGN KEY constraints.

### is_ready

```lua
NormOrm:is_ready()
  -> boolean
```

Whether operations run immediately. With `queue_until_ready`, false until the
first successful `sync()`/`migrate()`; otherwise always true.

### json

```lua
NormJsonProvider
```

Provider used to (de)serialise `json` columns.

### log

```lua
boolean
```

### migrate

```lua
NormOrm:migrate(migrations: NormMigration[])
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

### model

```lua
NormOrm:model(table_name: string)
  -> NormModel|nil
```

Get a previously defined model.
```lua
    local User = db:model("users")
```

### models

```lua
table<string, NormModel>
```

### provider

```lua
NormPromiseProvider
```

A promise provider plugs a framework's promise type into Norm.
Built-in builders: `Norm.promise.builtin|nanos|cfx`. Validate a custom one
with `Norm.promise.define`.

### query

```lua
NormOrm:query(query: string, params?: any[])
  -> promise: NormRowsPromise
```

Run a raw parameterised SELECT (bypassing the query builder). Resolves with
the raw rows. Bind values with `?` placeholders, never interpolate.
```lua
    local rows = db:query("SELECT * FROM `users` WHERE `coins` > ?", { 100 }):await()
```

### supports_transactions

```lua
NormOrm:supports_transactions()
  -> boolean
```

Whether the configured adapter supports transactions.

### sync

```lua
NormOrm:sync()
  -> promise: NormBooleanPromise
```

Create the table of every registered model (CREATE TABLE IF NOT EXISTS),
in dependency order so foreign keys resolve. When foreign keys are enabled
(see the `foreignKeys` option), `belongsTo` relations emit `FOREIGN KEY`
constraints. Resolves true.
```lua
    db:sync():await() -- run once at startup, after defining your models
```

### transaction

```lua
NormOrm:transaction(fn: fun(orm: NormOrm):<T>)
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

## NormModel

### all

```lua
NormModel:all()
  -> promise: NormRecordListPromise
```

Resolves with every record in the table.
```lua
    local users = User:all():await()
    for _, u in ipairs(users) do print(u.name) end
```

### autoincrement_pk

```lua
boolean
```

### avg

```lua
NormModel:avg(column: string)
  -> promise: NormNumberPromise
```

AVG of a column across the whole table.

### build

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

### columns

```lua
NormColumn[]
```

### columns_by_name

```lua
table<string, NormColumn>
```

### count

```lua
NormModel:count()
  -> promise: NormNumberPromise
```

Resolves with the total row count of the table.
```lua
    local total = User:count():await()
```

### create

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

### find

```lua
NormModel:find(pk: any)
  -> promise: NormRecordOrNilPromise
```

Find a single record by its primary key. Resolves with the record or nil.
```lua
    local user = User:find(1):await()
    if (user) then print(user.name) end
```

### find_by

```lua
NormModel:find_by(filter: table<string, any>)
  -> promise: NormRecordOrNilPromise
```

Find the first record matching a `{ column = value }` filter (ANDed).
```lua
    local user = User:find_by({ email = "john@x.io" }):await()
```

### find_or_create

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

### find_or_new

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

### group_by

```lua
NormModel:group_by(...string)
  -> NormQueryBuilder
```

### having

```lua
NormModel:having(...any)
  -> NormQueryBuilder
```

### hook

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

### hooks

```lua
nil
```

event -> { fn, ... }, created on first registration

### hooks

```lua
table
```

### indexes

```lua
{ name: string, columns: string[], unique: boolean }[]?
```

Indexes emitted at sync().

### insert_many

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

### join

```lua
NormModel:join(...any)
  -> NormQueryBuilder
```

### left_join

```lua
NormModel:left_join(...any)
  -> NormQueryBuilder
```

### limit

```lua
NormModel:limit(...any)
  -> NormQueryBuilder
```

### max

```lua
NormModel:max(column: string)
  -> promise: NormNumberPromise
```

MAX of a column across the whole table.

### min

```lua
NormModel:min(column: string)
  -> promise: NormNumberPromise
```

MIN of a column across the whole table.

### omit

```lua
NormModel:omit(...string|string[])
  -> NormQueryBuilder
```

### only_trashed

```lua
NormModel:only_trashed()
  -> NormQueryBuilder
```

Start a query over ONLY soft-deleted rows (soft-delete models only).

### order

```lua
NormModel:order(...any)
  -> NormQueryBuilder
```

```lua
dir:
   | "ASC"
   | "DESC"
```

### orm

```lua
NormOrm
```

### paginate

```lua
NormModel:paginate(page?: number, per_page?: number)
  -> NormPromise
```

Paginate the whole table. See `NormQueryBuilder:paginate`.

### parse

```lua
NormModel:parse(column: NormColumn, value: any)
  -> any
```

Convert a raw driver value into a Lua value for the given column (decode).

### primary_key

```lua
string?
```

### query

```lua
NormModel:query()
  -> NormQueryBuilder
```

Start a chainable query against this model's table.
```lua
    local admins = User:query():where("admin", true):order("name"):all():await()
```

### record_class

```lua
NormRecord
```

A single row. Column values are plain fields (e.g. `record.name`).

### relations

```lua
table<string, NormRelation>
```

### scope

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

### scopes

```lua
nil
```

name -> fn(query, ...), reusable query fragments

### scopes

```lua
table
```

### select

```lua
NormModel:select(...string|string[])
  -> NormQueryBuilder
```

### select_raw

```lua
NormModel:select_raw(expr: string)
  -> NormQueryBuilder
```

### serialize

```lua
NormModel:serialize(column: NormColumn, value: any)
  -> any
```

Convert a Lua value into something storable for the given column (encode).
Only `json` tables are transformed; a value already a string is passed
through (so a pre-encoded string is never double-encoded).

### soft_deletes

```lua
string?
```

The soft-delete column name (nil if disabled).

### sum

```lua
NormModel:sum(column: string)
  -> promise: NormNumberPromise
```

SUM of a column across the whole table.
```lua
    local total = User:sum("coins"):await()
```

### sync

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

### table

```lua
string
```

### timestamps

```lua
{ created: string, updated: string }?
```

Auto-managed timestamp columns (nil if disabled).

### update_or_create

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

### upsert

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

### where

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

### where_between

```lua
NormModel:where_between(column: string, min: any, max: any)
  -> NormQueryBuilder
```

### where_doesnt_have

```lua
NormModel:where_doesnt_have(name: string, configure?: fun(q: NormQueryBuilder))
  -> NormQueryBuilder
```

### where_has

```lua
NormModel:where_has(name: string, configure?: fun(q: NormQueryBuilder))
  -> NormQueryBuilder
```

### where_in

```lua
NormModel:where_in(column: string, list: any[])
  -> NormQueryBuilder
```

### where_like

```lua
NormModel:where_like(column: string, pattern: string)
  -> NormQueryBuilder
```

### where_not

```lua
NormModel:where_not(column: string, value: any)
  -> NormQueryBuilder
```

### where_not_in

```lua
NormModel:where_not_in(column: string, list: any[])
  -> NormQueryBuilder
```

### with_count

```lua
NormModel:with_count(...string)
  -> NormQueryBuilder
```

### with_trashed

```lua
NormModel:with_trashed()
  -> NormQueryBuilder
```

Start a query that INCLUDES soft-deleted rows (soft-delete models only).

### wrap

```lua
NormModel:wrap(row: table<string, any>)
  -> NormRecord
```

Wrap a DB row into a persisted record (fires `after_find`).

## NormRecord

A single row. Column values are plain fields (e.g. `record.name`).

### [string]

```lua
any
```

Column values.

### attach

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

### decrement

```lua
NormRecord:decrement(column: string, amount?: number)
  -> promise: NormRecordPromise
```

Atomically subtract `amount` (default 1) from a column of this record.

### delete

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

### detach

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

### force_delete

```lua
NormRecord:force_delete()
  -> promise: NormRecordPromise
```

Physically DELETE this record by its primary key, even on a soft-delete model.
The record is flagged not-persisted (a later `:save()` re-inserts it). Resolves
with the record. Fires `before_delete` / `after_delete`.

### increment

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

### load

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

### reload

```lua
NormRecord:reload()
  -> promise: NormRecordPromise
```

Re-read this record's columns from the database (discarding local changes).
Resolves with the record.
```lua
    user:reload():await()
```

### restore

```lua
NormRecord:restore()
  -> promise: NormRecordPromise
```

Un-delete a soft-deleted record (clears `deleted_at`). Resolves with the record.
```lua
    local post = Post:only_trashed():where("id", 5):first():await()
    post:restore():await()
```

### save

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

### sync_pivot

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

### to_table

```lua
NormRecord:to_table()
  -> table<string, any>
```

Plain `{ column = value }` table for this record (e.g. to serialise it).
```lua
    local data = user:to_table() --> { id = 1, name = "John", ... }
```

### trashed

```lua
NormRecord:trashed()
  -> boolean
```

Whether this record is currently soft-deleted (its `deleted_at` is set).

## NormQueryBuilder

### all

```lua
NormQueryBuilder:all()
  -> promise: NormRecordListPromise
```

Execute the query and resolve with all matching records.
```lua
    local users = User:query():where("admin", true):all():await()
```

### avg

```lua
NormQueryBuilder:avg(column: string)
  -> promise: NormNumberPromise
```

AVG of a column over the current filter. Resolves with a number.

### count

```lua
NormQueryBuilder:count()
  -> promise: NormNumberPromise
```

Resolve with the COUNT(*) for the current conditions.
```lua
    local admins = User:query():where("admin", true):count():await()
```

### decrement

```lua
NormQueryBuilder:decrement(column: string, amount?: number)
  -> promise: NormNumberPromise
```

Atomically subtract `amount` (default 1) from a column on every matching row.

### delete

```lua
NormQueryBuilder:delete()
  -> promise: NormNumberPromise
```

Bulk-delete every matching row. On a soft-delete model this marks the rows
(sets `deleted_at`) rather than removing them; use `force_delete` to remove.
Resolves with the affected row count.
```lua
    local n = User:query():where("coins", 0):delete():await()
```

### first

```lua
NormQueryBuilder:first()
  -> promise: NormRecordOrNilPromise
```

Execute the query with LIMIT 1 and resolve with the first record (or nil).
```lua
    local newest = User:query():order("id", "DESC"):first():await()
```

### force_delete

```lua
NormQueryBuilder:force_delete()
  -> promise: NormNumberPromise
```

Bulk physical-DELETE every matching row, even on a soft-delete model.
Resolves with the affected row count.

### group_by

```lua
NormQueryBuilder:group_by(...string)
  -> self: NormQueryBuilder
```

Add GROUP BY columns (call again, or pass several, to group by more).
```lua
    Player:select_raw("faction, COUNT(*) AS n"):group_by("faction"):rows():await()
```

### having

```lua
NormQueryBuilder:having(expr: string, op?: string, value?: any)
  -> self: NormQueryBuilder
```

Add a HAVING condition (ANDed) on a RAW aggregate expression. Forms:
`having(expr, value)` or `having(expr, op, value)`. The expression is emitted
verbatim (so you can reference `COUNT(*)`, `SUM(\`coins\`)`, …); the value is bound.
```lua
    Player:select_raw("faction, COUNT(*) AS n"):group_by("faction")
          :having("COUNT(*)", ">", 10):rows():await()
```

### include

```lua
NormQueryBuilder:include(...string|fun(q: NormQueryBuilder))
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

### increment

```lua
NormQueryBuilder:increment(column: string, amount?: number)
  -> promise: NormNumberPromise
```

Atomically add `amount` (default 1) to a column on every matching row, in one
`SET col = col + ?` statement (no read-modify-write, race-free). Resolves with
the affected row count.
```lua
    Player:where("id", id):increment("coins", 50):await()
```

### join

```lua
NormQueryBuilder:join(table_name: string, first: string, op: string, second?: string)
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

### left_join

```lua
NormQueryBuilder:left_join(table_name: string, first: string, op: string, second?: string)
  -> self: NormQueryBuilder
```

LEFT JOIN another table (same argument forms as `:join`). Keeps main rows even
when there is no match on the joined side.

### limit

```lua
NormQueryBuilder:limit(n: number)
  -> self: NormQueryBuilder
```

Limit the number of rows (pair with `:offset()` for pagination).
```lua
    local page = User:query():order("id"):limit(10):offset(20):all():await()
```

### max

```lua
NormQueryBuilder:max(column: string)
  -> promise: NormNumberPromise
```

MAX of a column over the current filter. Resolves with the raw value.
```lua
    local top = Player:max("score"):await()
```

### min

```lua
NormQueryBuilder:min(column: string)
  -> promise: NormNumberPromise
```

MIN of a column over the current filter. Resolves with the raw value.

### model

```lua
NormModel
```

### offset

```lua
NormQueryBuilder:offset(n: number)
  -> self: NormQueryBuilder
```

Skip `n` rows (use with `:limit()`).

### omit

```lua
NormQueryBuilder:omit(...string|string[])
  -> self: NormQueryBuilder
```

Inverse of `select`: select every column of the model EXCEPT the given ones
(e.g. to drop a `password` / large blob without listing all the others). The
omitted columns are simply absent from the returned records.
```lua
    local u = User:omit("password"):find(1):await()
```

### only_trashed

```lua
NormQueryBuilder:only_trashed()
  -> self: NormQueryBuilder
```

Return ONLY soft-deleted rows.

### or_where

```lua
NormQueryBuilder:or_where(column: string|table<string, any>, op?: string, value?: any)
  -> self: NormQueryBuilder
```

OR variant of `where`.
```lua
    User:query():where("admin", true):or_where("coins", ">", 1000):all():await()
```

### or_where_between

```lua
NormQueryBuilder:or_where_between(column: string, min: any, max: any)
  -> self: NormQueryBuilder
```

### or_where_in

```lua
NormQueryBuilder:or_where_in(column: string, list: any[])
  -> self: NormQueryBuilder
```

### or_where_like

```lua
NormQueryBuilder:or_where_like(column: string, pattern: string)
  -> self: NormQueryBuilder
```

### or_where_not

```lua
NormQueryBuilder:or_where_not(column: string, value: any)
  -> self: NormQueryBuilder
```

### or_where_not_between

```lua
NormQueryBuilder:or_where_not_between(column: string, min: any, max: any)
  -> self: NormQueryBuilder
```

### or_where_not_in

```lua
NormQueryBuilder:or_where_not_in(column: string, list: any[])
  -> self: NormQueryBuilder
```

### or_where_not_like

```lua
NormQueryBuilder:or_where_not_like(column: string, pattern: string)
  -> self: NormQueryBuilder
```

### or_where_not_null

```lua
NormQueryBuilder:or_where_not_null(column: string)
  -> self: NormQueryBuilder
```

### or_where_null

```lua
NormQueryBuilder:or_where_null(column: string)
  -> self: NormQueryBuilder
```

### order

```lua
NormQueryBuilder:order(column: string, dir?: "ASC"|"DESC")
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

### paginate

```lua
NormQueryBuilder:paginate(page?: number, per_page?: number)
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

### rows

```lua
NormQueryBuilder:rows()
  -> promise: NormRowsPromise
```

Execute the query and resolve with the RAW rows (no record wrapping). Use this
for grouped aggregates built with `:select_raw` / `:group_by` / `:having`.
```lua
    local stats = Player:select_raw("faction, COUNT(*) AS n, SUM(`coins`) AS total")
        :group_by("faction"):having("COUNT(*)", ">", 10):rows():await()
```

### scope

```lua
NormQueryBuilder:scope(name: string, ...any)
  -> self: NormQueryBuilder
```

Apply a named scope (a reusable query fragment registered on the model with
`Model:scope(name, fn)`), passing it any extra args. Chainable.
```lua
    User:active():scope("older_than", 18):all():await()
```

### select

```lua
NormQueryBuilder:select(...string|string[])
  -> self: NormQueryBuilder
```

Restrict selected columns (the inverse is `:omit`).
```lua
    User:query():select("id", "name"):all():await()
```

### select_raw

```lua
NormQueryBuilder:select_raw(expr: string)
  -> self: NormQueryBuilder
```

Add a RAW (unquoted) select expression — for aggregates/computed columns that
the column-quoting `select` can't express. Pair with `:group_by` and `:rows()`.
```lua
    User:select_raw("faction, COUNT(*) AS n"):group_by("faction"):rows():await()
```

### sum

```lua
NormQueryBuilder:sum(column: string)
  -> promise: NormNumberPromise
```

SUM of a column over the current filter. Resolves with a number (0 if empty).
```lua
    local bank = User:where("admin", false):sum("coins"):await()
```

### update

```lua
NormQueryBuilder:update(data: table<string, any>)
  -> promise: NormNumberPromise
```

Bulk-update every matching row in one statement (no records loaded).
Resolves with the affected row count.
```lua
    local n = User:query():where("admin", true):update({ coins = 0 }):await()
```

### where

```lua
NormQueryBuilder:where(column: string|table<string, any>, op?: string, value?: any)
  -> self: NormQueryBuilder
```

Add an AND condition. Forms: `where(col, value)`, `where(col, op, value)` or
`where({ col = value, ... })`. Chainable with the other `where_*` helpers.
```lua
    User:query():where("coins", ">", 100):where("admin", true):all():await()
```

### where_between

```lua
NormQueryBuilder:where_between(column: string, min: any, max: any)
  -> self: NormQueryBuilder
```

`column [NOT] BETWEEN min AND max` (inclusive). With OR / negated variants.
```lua
    Player:query():where_between("level", 10, 20):all():await()
```

### where_doesnt_have

```lua
NormQueryBuilder:where_doesnt_have(name: string, configure?: fun(q: NormQueryBuilder))
  -> self: NormQueryBuilder
```

Inverse of `where_has`: keep only rows with NO matching related row
(`NOT EXISTS (...)`).

### where_has

```lua
NormQueryBuilder:where_has(name: string, configure?: fun(q: NormQueryBuilder))
  -> self: NormQueryBuilder
```

Keep only rows that HAVE at least one related row for `name` (optionally
matching the `configure` conditions). Compiles to `EXISTS (correlated subquery)`.
```lua
    User:where_has("posts"):all():await()                       -- users with any post
    User:where_has("posts", function(q) q:where("published", true) end):all():await()
```

### where_in

```lua
NormQueryBuilder:where_in(column: string, list: any[])
  -> self: NormQueryBuilder
```

`column IN (...)` (and its OR / negated variants).
```lua
    User:query():where_in("id", { 1, 2, 3 }):all():await()
```

### where_like

```lua
NormQueryBuilder:where_like(column: string, pattern: string)
  -> self: NormQueryBuilder
```

`column [NOT] LIKE pattern` (use `%` / `_` wildcards). With OR / negated variants.
```lua
    User:query():where_like("name", "John%"):all():await()
```

### where_not

```lua
NormQueryBuilder:where_not(column: string, value: any)
  -> self: NormQueryBuilder
```

`column != value` (and OR variant).

### where_not_between

```lua
NormQueryBuilder:where_not_between(column: string, min: any, max: any)
  -> self: NormQueryBuilder
```

### where_not_in

```lua
NormQueryBuilder:where_not_in(column: string, list: any[])
  -> self: NormQueryBuilder
```

### where_not_like

```lua
NormQueryBuilder:where_not_like(column: string, pattern: string)
  -> self: NormQueryBuilder
```

### where_not_null

```lua
NormQueryBuilder:where_not_null(column: string)
  -> self: NormQueryBuilder
```

### where_null

```lua
NormQueryBuilder:where_null(column: string)
  -> self: NormQueryBuilder
```

`column IS [NOT] NULL` (and OR variants).

### with_count

```lua
NormQueryBuilder:with_count(...string)
  -> self: NormQueryBuilder
```

Add a `<name>_count` field to each returned record: the number of related rows,
without loading them (a correlated `COUNT(*)` subquery). Soft-deleted related
rows aren't counted.
```lua
    local users = User:with_count("posts"):all():await()
    print(users[1].posts_count)
```

### with_trashed

```lua
NormQueryBuilder:with_trashed()
  -> self: NormQueryBuilder
```

Include soft-deleted rows in the result (disables the default exclusion).

## NormPromise

### await

```lua
NormPromise:await()
  -> value: any
```

Block the current coroutine until the promise settles, then return its value
(or raise its rejection reason). Must be called from inside a coroutine.
```lua
    coroutine.wrap(function()
        local user = User:find(1):await()
    end)()
```

### catch

```lua
NormPromise:catch(on_rejected: fun(reason: any):any)
  -> NormPromise
```

### next

```lua
NormPromise:next(on_fulfilled?: fun(value: any):any, on_rejected?: fun(reason: any):any)
  -> NormPromise
```

Register handlers; returns a new chained promise.
