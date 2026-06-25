# Lifecycle Hooks

Per-model, synchronous callbacks that run around create, update, save, delete, and find.

## Registering hooks

Each event has a matching method on the model. Pass a function that receives the record.

```lua
User:before_save(function(u) assert(u.email, "email required") end)
User:after_create(function(u) print("welcome #" .. u.id) end)
```

You can also register through the generic `hook(event, fn)` form:

```lua
User:hook("before_save", function(u) assert(u.email, "email required") end)
```

Or declare them at define time via the `hooks` option:

```lua
local User = db:define("users", {
    id    = Norm.types.id(),
    email = Norm.types.string({ length = 128, unique = true }),
}, {
    hooks = {
        before_save  = function(u) assert(u.email, "email required") end,
        after_create = function(u) print("welcome #" .. u.id) end,
    },
})
```

See [Defining Models](./models) for the other define-time options.

## Events

```
before_create   after_create
before_update   after_update
before_save     after_save
before_delete   after_delete
                after_find
```

## Behaviour

Hooks are **synchronous** and run per-model.

::: warning
A `before_*` handler that raises **cancels the operation** — the promise rejects and nothing is written.
:::

```lua
User:before_save(function(u)
    assert(u.email, "email required")   -- raising here aborts the save
end)
```

::: tip
A `before_save` mutation is persisted — changes you make to the record inside `before_save` are written to the database.
:::

```lua
User:before_save(function(u)
    u.email = u.email:lower()           -- the lowercased value is saved
end)
```
