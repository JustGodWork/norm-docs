# JSON columns

A `json` column maps a Lua table to a JSON string and back automatically — assign a table, read a table.

## The `json` type

Declare a column with `Norm.types.json()`. Norm (de)serialises it for you: assign a Lua table and it's stored as JSON; read it back and it's decoded to a table.

```lua
local Char = db:define("characters", { id = Norm.types.id(), pos = Norm.types.json() })
local c = Char:create({ pos = { x = 1, y = 2 } }):await()   -- stored as '{"x":1,"y":2}'
print(Char:find(c.id):await().pos.x)                        -- 1 (decoded to a table)
```

See [Models](./models) for the full list of column types.

## Provider resolution order

The JSON provider is resolved in this order:

1. The `json` option passed to `Norm.new`.
2. The adapter's default provider.
3. Auto-detection — Nanos `JSON`, then a Lua/FiveM `json`.
4. Else a raw passthrough.

## Providers

Available under `Norm.json`:

- `Norm.json.nanos(JSON)` — the Nanos `JSON` global.
- `Norm.json.rapidjson(json)` — a `rapidjson`-style `json` library.
- `Norm.json.raw()` — raw passthrough; keeps the stored string as-is.
- `Norm.json.define({ encode, decode })` — supply your own `encode` / `decode` functions.

## The `json` option

Pass a provider as the `json` option on `Norm.new`, or `json = false` to keep raw strings (no automatic (de)serialisation).

```lua
local db = Norm.new({
    adapter = Norm.adapters.nanos.new({ engine = DatabaseEngine.SQLite, connection = "./game.db" }),
    json    = Norm.json.nanos(JSON),   -- "auto" (default), a provider, or false
})
```

::: tip
With `json = "auto"` (the default), Norm picks a provider for you using the resolution order above, so you usually don't need to set this at all.
:::
