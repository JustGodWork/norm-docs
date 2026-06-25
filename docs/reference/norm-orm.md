---
outline: [2, 3]
---

# NormOrm <Badge type="info" text="class" />

The ORM instance returned by `Norm.new`. Defines models, runs migrations, and owns the adapter.

::: info Auto-generated
This page is generated from the source annotations by `scripts/gen-api.mjs`. Edit the LuaCATS doc comments in the Norm sources, not here.
:::

<small>:link: [Source: `src/orm.lua`](https://github.com/JustGodWork/norm/blob/master/src/orm.lua#L46)</small>

| Member | Returns | Description |
|---|---|---|
| [`adapter`](#adapter) | — |  |
| [`define`](#define) | `NormModel` | Define and register a model from a schema (a `{ column = Norm.types.* }` map). |
| [`execute`](#execute) | `NormExecResultPromise` _(async)_ | Run a raw parameterised write (INSERT/UPDATE/DELETE/DDL). |
| [`foreign_keys`](#foreign_keys) | — | Whether `sync()` emits SQL FOREIGN KEY constraints. |
| [`is_ready`](#is_ready) | `boolean` | Whether operations run immediately. |
| [`json`](#json) | — | Provider used to (de)serialise `json` columns. |
| [`log`](#log) | — |  |
| [`migrate`](#migrate) | `NormPromise` _(async)_ | Run pending schema migrations in order, recording applied ones in a |
| [`model`](#model) | `NormModel\|nil` | Get a previously defined model. |
| [`models`](#models) | — |  |
| [`provider`](#provider) | — | A promise provider plugs a framework's promise type into Norm. |
| [`query`](#query) | `NormRowsPromise` _(async)_ | Run a raw parameterised SELECT (bypassing the query builder). |
| [`supports_transactions`](#supports_transactions) | `boolean` | Whether the configured adapter supports transactions. |
| [`sync`](#sync) | `NormBooleanPromise` _(async)_ | Create the table of every registered model (CREATE TABLE IF NOT EXISTS), |
| [`transaction`](#transaction) | `NormPromise` _(async)_ | Run `fn` inside a database transaction: `BEGIN`, then every operation `fn` |

## adapter <Badge type="info" text="field" /> {#adapter}

```lua
NormAdapter
```

## define <Badge type="info" text="method" /> {#define}

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

## execute <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#execute}

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

## foreign_keys <Badge type="info" text="field" /> {#foreign_keys}

```lua
boolean|"auto"
```

Whether `sync()` emits SQL FOREIGN KEY constraints.

## is_ready <Badge type="info" text="method" /> {#is_ready}

```lua
NormOrm:is_ready()
  -> boolean
```

Whether operations run immediately. With `queue_until_ready`, false until the
first successful `sync()`/`migrate()`; otherwise always true.

## json <Badge type="info" text="field" /> {#json}

```lua
NormJsonProvider
```

Provider used to (de)serialise `json` columns.

## log <Badge type="info" text="field" /> {#log}

```lua
boolean
```

## migrate <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#migrate}

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

## model <Badge type="info" text="method" /> {#model}

```lua
NormOrm:model(table_name: string)
  -> NormModel|nil
```

Get a previously defined model.
```lua
    local User = db:model("users")
```

## models <Badge type="info" text="field" /> {#models}

```lua
table<string, NormModel>
```

## provider <Badge type="info" text="field" /> {#provider}

```lua
NormPromiseProvider
```

A promise provider plugs a framework's promise type into Norm.
Built-in builders: `Norm.promise.builtin|nanos|cfx`. Validate a custom one
with `Norm.promise.define`.

## query <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#query}

```lua
NormOrm:query(query: string, params?: any[])
  -> promise: NormRowsPromise
```

Run a raw parameterised SELECT (bypassing the query builder). Resolves with
the raw rows. Bind values with `?` placeholders, never interpolate.
```lua
    local rows = db:query("SELECT * FROM `users` WHERE `coins` > ?", { 100 }):await()
```

## supports_transactions <Badge type="info" text="method" /> {#supports_transactions}

```lua
NormOrm:supports_transactions()
  -> boolean
```

Whether the configured adapter supports transactions.

## sync <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#sync}

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

## transaction <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#transaction}

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
