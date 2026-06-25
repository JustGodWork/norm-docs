---
outline: [2, 3]
---

# Norm <Badge type="info" text="class" />

The value returned by the bundle (and the global `Norm`): factories, type constructors, and the entry point `Norm.new`.

::: info Auto-generated
This page is generated from the source annotations by `scripts/gen-api.mjs`. Edit the LuaCATS doc comments in the Norm sources, not here.
:::

Public API surface of Norm (the value returned by the bundle / global `Norm`).

<small>:link: [Source: `src/init.lua`](https://github.com/JustGodWork/norm/blob/master/src/init.lua#L9)</small>

| Member | Returns | Description |
|---|---|---|
| [`Adapter`](#adapter) | — | Base adapter class — extend (or duck-type) for custom adapters. |
| [`adapters`](#adapters) | — | Built-in adapters. |
| [`class`](#class) | — | The (separately loaded) class system. |
| [`dialect`](#dialect) | — | Built-in SQL dialects. |
| [`json`](#json) | — | JSON providers (`nanos`/`rapidjson`/`raw`/`detect`/`define`) for `json` columns. |
| [`new`](#new) | `NormOrm` | Create a new ORM instance from an adapter (and optionally a promise provider). |
| [`Orm`](#orm) | — | The ORM root class. |
| [`promise`](#promise) | — | Promise providers + builders. |
| [`types`](#types) | — | Column type factories. |

## Adapter <Badge type="info" text="field" /> {#adapter}

```lua
NormAdapter
```

Base adapter class — extend (or duck-type) for custom adapters.

## adapters <Badge type="info" text="field" /> {#adapters}

```lua
NormAdapters
```

Built-in adapters.

## class <Badge type="info" text="field" /> {#class}

```lua
LightClassFactory
```

The (separately loaded) class system.

## dialect <Badge type="info" text="field" /> {#dialect}

```lua
NormDialects
```

Built-in SQL dialects.

## json <Badge type="info" text="field" /> {#json}

```lua
NormJsonLib
```

JSON providers (`nanos`/`rapidjson`/`raw`/`detect`/`define`) for `json` columns.

## new <Badge type="info" text="function" /> {#new}

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

## Orm <Badge type="info" text="field" /> {#orm}

```lua
NormOrm
```

The ORM root class.

## promise <Badge type="info" text="field" /> {#promise}

```lua
NormPromiseLib
```

Promise providers + builders.

## types <Badge type="info" text="field" /> {#types}

```lua
NormTypes
```

Column type factories.
