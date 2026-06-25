# Getting started

Norm is a small, **dependency-free** Lua ORM with **pluggable database adapters** and **pluggable promise providers** — it runs anywhere (nanos world, FiveM, or plain Lua) by keeping framework specifics out of the core.

## What is Norm?

- **Zero dependencies, one file.** Ships as a single self-contained bundle; [light-class](https://github.com/JustGodWork/light-class) is embedded at build time.
- **No runtime `require`, no cross-package import.** An internal module resolver makes it work even on FiveM (which has no native `require`).
- **Promises your way.** Every async operation returns a promise of *your* framework (nanos, FiveM, or the bundled one) through a small provider seam, with a uniform `promise:await()`.
- **Fully typed.** LuaCATS annotations throughout; `:await()` is narrowed to the resolved type (`User:find(1):await()` → `NormRecord?`).

## Install

Norm is one self-contained file: `dist/norm.lua` (or minified `dist/norm.min.lua`). Loading it embeds light-class (global `class`), sets the global `Norm`, and returns it.

```lua
local Norm = dofile("dist/norm.lua")    -- plain Lua
local Norm = require "dist/norm.lua"    -- nanos (see the companion package `norm-nanos`)
```

```lua
server_script 'dist/norm.lua'           -- FiveM (fxmanifest.lua) — server only
```

::: warning
An ORM talks to a database, so load Norm **server-side only** (nanos `Server/`, FiveM `server_script`) — never as a shared/client script.
:::

## Quick start

```lua
local db = Norm.new({
    adapter = Norm.adapters.nanos.new({ engine = DatabaseEngine.SQLite, connection = "./game.db" }),
})

local User = db:define("users", {
    id    = Norm.types.id(),
    name  = Norm.types.string({ length = 64, nullable = false }),
    email = Norm.types.string({ length = 128, unique = true }),
    coins = Norm.types.integer({ default = 0 }),
}, { timestamps = true })

coroutine.wrap(function()
    db:sync():await()                                   -- create tables once at boot

    local user = User:create({ name = "John", email = "john@x.io" }):await()
    user:increment("coins", 250):await()

    local rich = User:where("coins", ">", 100):order("coins", "DESC"):all():await()
end)()
```

See [Models](./models) for the full schema and type reference, and [Migrations](./migrations) for evolving an existing schema.

## Two abstractions: adapter + promise provider

Frameworks ship different promise implementations and database APIs, so Norm splits two concerns. The ORM **never builds a promise itself** — it asks the provider and resolves it with the *already-transformed* value, so providers need no chaining.

| Concept | Answers | Built-ins |
|---|---|---|
| **Adapter** | *How do I talk to the database?* | `nanos`, `oxmysql`, or your own |
| **Promise provider** | *Which promise type does this framework use?* | `builtin`, `nanos`, `cfx`, or your own |

```lua
local db = Norm.new({
    adapter            = Norm.adapters.oxmysql.new(),   -- or .nanos.new{...}, or a custom adapter
    -- promise         = Norm.promise.cfx(),            -- optional; defaults to the adapter's, else builtin
    -- log             = true,                          -- log every executed statement
    -- foreignKeys     = "auto",                        -- "auto" | true | false
    -- json            = "auto",                        -- "auto" | a provider | false
    -- queue_until_ready = false,                       -- hold ops until the first sync()/migrate()
})
```

See [Adapters](./adapters) for the built-in adapters, how to write your own, and how to plug in a custom promise provider.
