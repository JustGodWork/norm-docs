---
outline: [2, 3]
---

# NormPromise <Badge type="info" text="class" />

The promise wrapper every async operation returns. Await it, or chain with your framework promise.

::: info Auto-generated
This page is generated from the source annotations by `scripts/gen-api.mjs`. Edit the LuaCATS doc comments in the Norm sources, not here.
:::

<small>:link: [Source: `src/promise.lua`](https://github.com/JustGodWork/norm/blob/master/src/promise.lua#L31)</small>

| Member | Returns | Description |
|---|---|---|
| [`await`](#await) | `value: any` | Block the current coroutine until the promise settles, then return its value |
| [`catch`](#catch) | `NormPromise` _(async)_ |  |
| [`next`](#next) | `NormPromise` _(async)_ | Register handlers; returns a new chained promise. |

## await <Badge type="info" text="method" /> {#await}

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

## catch <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#catch}

```lua
NormPromise:catch(on_rejected: fun(reason: any):any)
  -> NormPromise
```

## next <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#next}

```lua
NormPromise:next(on_fulfilled?: fun(value: any):any, on_rejected?: fun(reason: any):any)
  -> NormPromise
```

Register handlers; returns a new chained promise.
