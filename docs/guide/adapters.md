# Adapters & promise providers

Norm splits two concerns — an **adapter** answers *how do I talk to the database?* and a **promise provider** answers *which promise type does this framework use?* — so the ORM core stays framework-agnostic.

## Built-in adapters

Norm ships two adapters out of the box:

- **`Norm.adapters.nanos`** — for [nanos world](https://nanos.world), backed by its native `Database` API.
- **`Norm.adapters.oxmysql`** — for FiveM via the `oxmysql` resource.

Construct one and pass it as the `adapter` option:

```lua
local db = Norm.new({
    adapter = Norm.adapters.nanos.new({ engine = DatabaseEngine.SQLite, connection = "./game.db" }),
})

local db = Norm.new({
    adapter = Norm.adapters.oxmysql.new(),   -- FiveM
})
```

An adapter may declare a default promise provider, so on a matching framework you usually don't set `promise` at all — it defaults to the adapter's, else to `builtin`.

## Custom adapter

Extend `Norm.Adapter`, or pass any **duck-typed table** with the same methods:

```lua
local MyAdapter = Norm.class.extend("MyAdapter", Norm.Adapter)
function MyAdapter:__init(o) Norm.Adapter.__init(self, o); self.conn = o.connection end
function MyAdapter:get_dialect_name() return "mysql" end            -- or "sqlite"
function MyAdapter:default_provider() return Norm.promise.cfx() end -- or nil
function MyAdapter:raw_query(q, params, cb)   self.conn:select(q, params, function(rows) cb(nil, rows) end) end
function MyAdapter:raw_execute(q, params, cb) self.conn:exec(q, params, function(r) cb(nil, { affectedRows = r.n, insertId = r.id }) end) end
-- optional: supports_returning(), supports_transactions() + transaction(body, finish)
```

The required pieces are:

- **`get_dialect_name()`** — `"mysql"` or `"sqlite"`; this drives the SQL dialect Norm emits.
- **`default_provider()`** — the promise provider to use when none is set explicitly (return `nil` to fall back to `builtin`).
- **`raw_query(q, params, cb)`** — run a read; call `cb(err, rows)`.
- **`raw_execute(q, params, cb)`** — run a write; call `cb(err, { affectedRows, insertId })`.

::: tip
Values are passed as bound `params`, never interpolated into the SQL string — keep them bound in your adapter too.
:::

### Optional methods

- **`supports_returning()`** — return `true` if the database supports `RETURNING` (so bulk inserts can return records with ids).
- **`supports_transactions()`** — return `true` if the adapter can run transactions. `db:transaction(fn)` **throws** when this is false, so you can branch on `db:supports_transactions()`. See [Transactions](./transactions).
- **`transaction(body, finish)`** — run `body` atomically and call `finish` when done; only needed when `supports_transactions()` is true.

## Custom promise provider

Norm returns the provider's **native** promise, but every provider exposes a uniform `promise:await()` (call it inside a coroutine / async block).

| Provider | Chain | Await |
|---|---|---|
| `Norm.promise.builtin()` | `:next`, `:catch` | `p:await()` |
| `Norm.promise.nanos(Promise)` | `:Then`, `:Catch` | `p:await()` (or `:Await()`) |
| `Norm.promise.cfx(promise?)` | `:next` | `p:await()` (or `Citizen.Await(p)`) |

To wire up a framework that isn't covered, define a provider:

```lua
local provider = Norm.promise.define({
    name = "myframework",
    new = function(executor) ... end,  -- executor(resolve, reject) -> promise
    resolve = function(value) ... end,
    reject = function(reason) ... end,
})
```

Or, for any class whose constructor is `Class(executor)`:

```lua
local provider = Norm.promise.from_class(MyPromise)
```

Pass the result as the `promise` option to `Norm.new({ ... })`. If you omit it, Norm uses the adapter's `default_provider()`, and finally `builtin`.
