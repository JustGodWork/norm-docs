# Query builder

Compose filtered, sorted, and aggregated queries fluently — chain methods on a query and finish with a terminal that returns a promise.

## Starting a query

Start with `User:query()`, or a shortcut like `User:where(...)` that opens a query for you. Terminals return a promise you resolve with `:await()`.

```lua
local users = User:query()
    :where("coins", ">", 100):or_where("admin", true)
    :where_between("level", 10, 20)         -- + where_not_between
    :where_like("name", "John%")            -- + where_not_like, or_where_like
    :where_in("faction", { "red", "blue" }) -- + where_not_in, or_where_in
    :where_not("banned", true)
    :where_not_null("email")                -- + where_null, or_where_*
    :order("coins", "DESC"):limit(10):offset(20)
    :select("id", "name")                   -- or :omit("password"), or :select_raw("...")
    :all():await()
```

## The `where_*` family

- `where(col, op, value)` / `where(col, value)` — basic condition; `or_where(...)` ORs it in.
- `where_in(col, list)` — value in a set; `where_not_in`, `or_where_in`.
- `where_null(col)` / `where_not_null(col)` — NULL checks; `or_where_*` variants.
- `where_not(col, value)` — negated equality.
- `where_like(col, pattern)` — pattern match; `where_not_like`, `or_where_like`.
- `where_between(col, a, b)` — range; `where_not_between`.

Each `where_*` has matching `or_` variants to combine conditions with OR.

## Order, limit & offset

```lua
User:query():order("coins", "DESC"):limit(10):offset(20):all():await()
```

## Selecting columns

```lua
User:query():select("id", "name"):all():await()   -- only these columns
User:query():omit("password"):all():await()        -- everything except these
User:query():select_raw("`posts`.*"):all():await() -- raw select expression
```

## Aggregations

Aggregate as a scalar, or grouped:

```lua
local total = User:query():sum("coins"):await()    -- scalar

local byFaction = User:query()
    :select_raw("`faction`, COUNT(*) AS n")
    :group_by("faction")
    :having("n", ">", 10)
    :rows():await()                                 -- raw rows, not records
```

- Scalar terminals: `sum(col)`, `avg(col)`, `min(col)`, `max(col)`.
- Grouped: `select_raw(...)` + `group_by(...)` + `having(expr, op, value)` + `rows()`.
- `rows()` returns raw rows rather than hydrated records.

## Joins

Use joins to **filter or sort by a related column**. To *load* relations instead, use `include` (see [Relations](./relations)).

```lua
Post:join("users", "users.id", "posts.user_id")
    :where("users.admin", true):select_raw("`posts`.*"):all():await()
```

## Increment / decrement

```lua
User:where("id", id):increment("coins", 50):await()
User:where("level", "<", 5):decrement("lives"):await()
```

## Named scopes

Scopes are reusable, named query fragments. They work as a starter (`User:active()`) and chainable (`query:scope("active")`).

```lua
User:scope("active", function(q) q:where("active", true) end)
User:scope("older_than", function(q, age) q:where("age", ">", age) end)
User:active():scope("older_than", 18):all():await()
-- or declare them at define time: define(name, schema, { scopes = { active = fn } })
```

See [Models](./models) for declaring scopes at define time.

## Pagination

```lua
User:where(...):paginate(2, 20):await()
```

`paginate(page, per_page)` resolves a result table:

```lua
{ data, total, page, per_page, last_page, from, to }
```

## Terminals

A terminal ends the chain and returns a promise:

- `all()` — list of records.
- `first()` — first record or nil.
- `count()` — number of matching rows.
- `sum(col)`, `avg(col)`, `min(col)`, `max(col)` — scalar aggregates.
- `rows()` — raw rows.
- `update(data)` — bulk update.
- `delete()` / `force_delete()` — bulk (soft) delete / real delete.
- `increment(col, n?)` / `decrement(col, n?)` — atomic counters.
- `paginate(page, per_page)` — paginated result.
