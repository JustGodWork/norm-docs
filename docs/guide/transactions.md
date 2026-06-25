# Transactions

Run a group of operations atomically, committing together or rolling back as one.

## `db:transaction(fn)`

`db:transaction(fn)` runs `fn` atomically: it **commits** when `fn` returns and **rolls back** if `fn` raises. Operations performed inside `fn` are transactional automatically.

```lua
db:transaction(function()
    from:save():await()
    to:save():await()
end):await()
```

If `from:save()` succeeds but `to:save()` raises, neither change is committed.

## Adapter support

`db:transaction(fn)` **throws** if the adapter can't run transactions. Check `db:supports_transactions()` first to branch:

```lua
if db:supports_transactions() then
    db:transaction(function()
        from:save():await()
        to:save():await()
    end):await()
else
    from:save():await()
    to:save():await()
end
```

::: warning
The `oxmysql` adapter supports transactions; the `nanos` adapter does not. Guard with `db:supports_transactions()` if your code must run on either.
:::

See [Promises & await](./promises) for why each operation is awaited, and [CRUD & Records](./crud) for the operations used inside a transaction.
