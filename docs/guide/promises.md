# Promises & `await`

Every Norm operation returns your framework's native promise, with a uniform `:await()` to read the result.

## Awaiting an operation

Norm returns the provider's **native** promise, but every provider exposes a uniform `promise:await()`. Call it inside a coroutine / async block.

```lua
coroutine.wrap(function()
    db:sync():await()

    local user = User:create({ name = "John", email = "john@x.io" }):await()
    user:increment("coins", 250):await()

    local rich = User:where("coins", ">", 100):order("coins", "DESC"):all():await()
end)()
```

::: warning
`:await()` must be called inside a coroutine (or async block) — wrap your boot code in `coroutine.wrap(function() ... end)()`.
:::

## Provider / chain / await

The promise type depends on the configured provider. Each one offers framework-native chaining plus the uniform `:await()`:

| Provider | Chain | Await |
|---|---|---|
| `Norm.promise.builtin()` | `:next`, `:catch` | `p:await()` |
| `Norm.promise.nanos(Promise)` | `:Then`, `:Catch` | `p:await()` (or `:Await()`) |
| `Norm.promise.cfx(promise?)` | `:next` | `p:await()` (or `Citizen.Await(p)`) |

The provider defaults to the adapter's, falling back to `builtin`. See [Defining Models](./models) and the setup guide for configuring it.

## Queueing until ready

With `queue_until_ready = true`, data operations are held until the first successful `sync()` (which creates your tables), then replayed.

```lua
local db = Norm.new({
    adapter           = Norm.adapters.oxmysql.new(),
    queue_until_ready = true,
})
```

`db:is_ready()` reports the state:

```lua
if not db:is_ready() then
    -- sync() hasn't completed yet; queued ops will replay once it does
end
```

::: tip
Handy when boot code may run queries before `sync()` (or before oxmysql has connected) — the operations queue up instead of failing, then run once the ORM is ready.
:::
