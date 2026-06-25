# Adapters & Providers

The seams that make Norm portable: database adapters, promise providers, and JSON providers.

::: info Auto-generated
This page is generated from the source annotations (`scripts/gen-api.mjs`). Edit the doc comments in the Norm sources, not here.
:::

## NormAdapter

### default_json_provider

```lua
NormAdapter:default_json_provider()
  -> NormJsonProvider|nil
```

Optional: the JSON provider native to this adapter's framework, used to
(de)serialise `json` columns. Returning nil lets the ORM auto-detect one.

### default_provider

```lua
NormAdapter:default_provider()
  -> NormPromiseProvider|nil
```

Optional: the promise provider native to this adapter's framework.

### get_dialect

```lua
NormAdapter:get_dialect()
  -> NormDialect
```

Resolved dialect object.

### get_dialect_name

```lua
NormAdapter:get_dialect_name()
  -> "mysql"|"sqlite"
```

The dialect name this adapter speaks. Override per engine.

```lua
return #1:
   | "mysql"
   | "sqlite"
```

### options

```lua
NormAdapterOptions
```

### raw_execute

```lua
NormAdapter:raw_execute(query: string, params: any[], callback: NormExecuteCallback)
```

Run a write statement. Must be overridden.

### raw_query

```lua
NormAdapter:raw_query(query: string, params: any[], callback: NormQueryCallback)
```

Run a SELECT. Must be overridden.

### supports_returning

```lua
NormAdapter:supports_returning()
  -> boolean
```

Optional: whether this adapter's engine supports `INSERT ... RETURNING <col>`
(SQLite >= 3.35, PostgreSQL). When true, the ORM reads a new row's
auto-increment id atomically from the INSERT itself, instead of a separate
`LAST_INSERT_ID()` / `last_insert_rowid()` query — which is connection-scoped
and therefore unreliable across a connection pool. Defaults to false.

### supports_transactions

```lua
NormAdapter:supports_transactions()
  -> boolean
```

Optional: whether this adapter can run an interactive transaction on a pinned
connection. Defaults to false → `db:transaction(...)` throws on this adapter.
An adapter that returns true MUST implement `transaction(body, finish)`:
  * the adapter opens the transaction, then calls `body(tx_query, tx_execute)`
    where `tx_query(q, p, cb)` / `tx_execute(q, p, cb)` run on the transaction;
  * `body` returns `true` to COMMIT, `false` to ROLL BACK;
  * the adapter commits/rolls back, then calls `finish(err)` (err nil on commit).

## NormNanosAdapter

### database

```lua
table
```

The underlying nanos `Database`.

### default_json_provider

```lua
NormNanosAdapter:default_json_provider()
  -> NormJsonProvider|nil
```

Nanos exposes a global `JSON` class (`stringify`/`parse`); use it to
(de)serialise `json` columns automatically.

### default_provider

```lua
NormNanosAdapter:default_provider()
  -> NormPromiseProvider|nil
```

If nanos-promise is loaded in this package (global `Promise`), use it.
No cross-package import: the nanos package is expected to bundle nanos-promise.

### get_dialect

```lua
NormAdapter:get_dialect()
  -> NormDialect
```

Resolved dialect object.

### get_dialect_name

```lua
NormNanosAdapter:get_dialect_name()
  -> "mysql"|"sqlite"
```

```lua
return #1:
   | "mysql"
   | "sqlite"
```

### options

```lua
NormAdapterOptions
```

### raw_execute

```lua
NormNanosAdapter:raw_execute(query: string, params: any[], callback: NormExecuteCallback)
```

Run a write. For models on SQLite/PostgreSQL the id is fetched via `INSERT ...
RETURNING` (see the model layer), so this path is only used for those engines
by raw `execute()` calls. On MySQL (no RETURNING) inserts fall back to a
separate `LAST_INSERT_ID()` query: this is best-effort, because that function
is connection-scoped and the pool may run it on another connection. Prefer a
client-generated id (or `pool_size = 1`) if a correct insertId is critical on
MySQL + nanos.

### raw_query

```lua
NormNanosAdapter:raw_query(query: string, params: any[], callback: NormQueryCallback)
```

### supports_returning

```lua
NormNanosAdapter:supports_returning()
  -> boolean
```

SQLite, PostgreSQL and MariaDB (>= 10.5, auto-detected at init) support
`INSERT ... RETURNING`, letting the ORM fetch a new id atomically (pool-safe).
Real MySQL does not, and falls back to a best-effort `LAST_INSERT_ID()` query
(see `raw_execute`).

### supports_transactions

```lua
NormNanosAdapter:supports_transactions()
  -> boolean
```

Nanos' `Database` exposes no transaction API (no Begin/Commit, no connection
pinning across the pool), so transactions are unavailable: `db:transaction(...)`
throws rather than silently running non-atomically.

## NormOxMySQLAdapter

### default_json_provider

```lua
NormOxMySQLAdapter:default_json_provider()
  -> NormJsonProvider|nil
```

FiveM exposes a global `json` (`encode`/`decode`); use it to (de)serialise
`json` columns automatically.

### default_provider

```lua
NormOxMySQLAdapter:default_provider()
  -> NormPromiseProvider|nil
```

FiveM resources have a native `promise` library; use it by default.

### get_dialect

```lua
NormAdapter:get_dialect()
  -> NormDialect
```

Resolved dialect object.

### get_dialect_name

```lua
NormOxMySQLAdapter:get_dialect_name()
  -> "mysql"
```

```lua
return #1:
   | "mysql"
```

### onReady

```lua
NormOxMySQLAdapter:onReady(cb?: fun():any)
```

Wait until oxmysql has started and its connection is up, then run `cb`.
Runs in a background thread (Wait yields), so it never blocks construction.

### options

```lua
NormAdapterOptions
```

### ox

```lua
table
```

The oxmysql export.

### raw_execute

```lua
NormOxMySQLAdapter:raw_execute(query: string, params: any[], callback: NormExecuteCallback)
```

### raw_query

```lua
NormOxMySQLAdapter:raw_query(query: string, params: any[], callback: NormQueryCallback)
```

### supports_returning

```lua
NormAdapter:supports_returning()
  -> boolean
```

Optional: whether this adapter's engine supports `INSERT ... RETURNING <col>`
(SQLite >= 3.35, PostgreSQL). When true, the ORM reads a new row's
auto-increment id atomically from the INSERT itself, instead of a separate
`LAST_INSERT_ID()` / `last_insert_rowid()` query — which is connection-scoped
and therefore unreliable across a connection pool. Defaults to false.

### supports_transactions

```lua
NormOxMySQLAdapter:supports_transactions()
  -> boolean
```

oxmysql supports interactive transactions via the `startTransaction` export.

### transaction

```lua
NormOxMySQLAdapter:transaction(body: fun(tx_query: fun(q: string, p: any[], cb: function), tx_execute: fun(q: string, p: any[], cb: function)):boolean, finish: fun(err: any))
```

Run an interactive transaction through the `startTransaction` export (the same
one `MySQL.startTransaction` forwards to: `oxmysql:startTransaction(handler)`). The handler's `query(sql, params)` is SYNCHRONOUS (oxmysql awaits
internally), so the ORM's callbacks resolve immediately; the handler returning
`false` (or erroring) rolls back, anything else commits. The export returns the
commit boolean. `body` already returns true=commit / false=rollback.

## NormPromiseLib

### NormPromise

```lua
NormPromise
```

### builtin

```lua
function NormPromiseLib.builtin()
  -> NormPromiseProvider
```

The bundled zero-dependency provider (real then-able with :next/:catch/:await).
The default when no provider is configured and the adapter has none.
```lua
    local db = Norm.new({ adapter = a, promise = Norm.promise.builtin() })
```

### cfx

```lua
function NormPromiseLib.cfx(lib?: table)
  -> NormPromiseProvider
```

Wrap FiveM's native `promise` library. The oxmysql adapter uses this by
default, so you rarely pass it explicitly.
```lua
    local db = Norm.new({ adapter = a, promise = Norm.promise.cfx() })
```

### define

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

### from_class

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

### nanos

```lua
function NormPromiseLib.nanos(Promise: table)
  -> NormPromiseProvider
```

Wrap the nanos-promise `Promise` class so the ORM returns nanos promises.
On nanos this is auto-detected, so you rarely pass it explicitly.
```lua
    local db = Norm.new({ adapter = a, promise = Norm.promise.nanos(Promise) })
```

## NormJsonLib

### define

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

### detect

```lua
function NormJsonLib.detect()
  -> NormJsonProvider
```

Auto-detect the host's JSON library: Nanos `JSON`, then a Lua/FiveM `json`,
else the no-op `raw` provider. Used when no `json` option is configured and
the adapter offers no default.

### nanos

```lua
function NormJsonLib.nanos(JSON?: table)
  -> NormJsonProvider
```

Wrap the Nanos World `JSON` class (`stringify` / `parse`). Defaults to the
global `JSON`. On nanos this is auto-detected, so you rarely pass it.
```lua
    local db = Norm.new({ adapter = a, json = Norm.json.nanos(JSON) })
```

### rapidjson

```lua
function NormJsonLib.rapidjson(lib?: table)
  -> NormJsonProvider
```

Wrap a Lua/FiveM-style library exposing `encode` / `decode` (e.g. FiveM's
global `json` / rapidjson, or a dkjson-like table). Defaults to the global `json`.
```lua
    local db = Norm.new({ adapter = a, json = Norm.json.rapidjson() }) -- uses _ENV.json
```

### raw

```lua
function NormJsonLib.raw()
  -> NormJsonProvider
```

No-op provider: `json` columns are stored and returned as raw strings (Norm's
behaviour before JSON providers existed). Use it to opt out of automatic
(de)serialisation: `Norm.new({ ..., json = false })` resolves to this.
