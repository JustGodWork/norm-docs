# Relations

Describe how related rows load — relations are declared in the schema and create no SQL column of their own.

## Declaring relations

Relation types go right in the schema alongside your columns. They describe how to load related rows, not how to store data.

```lua
local User = db:define("users", {
    id      = Norm.types.id(),
    posts   = Norm.types.hasMany("posts", { key = "user_id" }),
    profile = Norm.types.hasOne("profiles", { key = "user_id" }),
    roles   = Norm.types.belongsToMany("roles"),          -- through pivot `role_user`
})
local Post = db:define("posts", {
    id      = Norm.types.id(),
    user_id = Norm.types.integer(),
    author  = Norm.types.belongsTo("users", { key = "user_id", onDelete = "CASCADE" }),
})
```

- `hasMany(table, opts)` — one-to-many.
- `hasOne(table, opts)` — one-to-one.
- `belongsTo(table, opts)` — inverse side; owns the foreign key.
- `belongsToMany(table, opts)` — many-to-many through a pivot table (e.g. `role_user`).

## Lazy loading

`record:load(name)` runs one query and caches the result on `record[name]`.

```lua
local user = User:find(1):await()
user:load("posts"):await()
print(#user.posts)
```

## Eager loading with `include`

`query:include(...)` runs one batched query per relation level — no N+1. Nest with a dotted path, and pass a per-relation configurator to filter, order, limit, or nest further.

```lua
User:query():include("posts.comments"):all():await()           -- nested
User:query():include("posts", function(q)                      -- with options
    q:where("published", true):order("created_at", "DESC"):limit(5)
     :include("comments", function(c) c:order("created_at") end)
end):all():await()
```

::: tip
Use `include` to **load** relations. To filter or sort by a related column instead, use a join — see [Query builder](./query-builder).
:::

## Filtering & counting by relation

These use correlated subqueries — no join is added.

```lua
User:where_has("posts", function(q) q:where("published", true) end):all():await()
User:where_doesnt_have("posts"):all():await()
User:with_count("posts"):all():await()                         -- users[i].posts_count
```

- `where_has(name, fn?)` — keep rows that have at least one matching related row.
- `where_doesnt_have(name, fn?)` — keep rows with no matching related row.
- `with_count(name)` — adds a `<name>_count` field to each record.

## Many-to-many mutation

```lua
record:attach(name, ids, pivot?)    -- add pivot rows (optional extra pivot columns)
record:detach(name, ids?)           -- remove pivot rows (all if ids omitted)
record:sync_pivot(name, ids)        -- make the pivot exactly match ids
```

## Foreign keys

`sync()` emits real `FOREIGN KEY` constraints from `belongsTo` relations (honoring `onDelete` / `onUpdate`), and creates tables in dependency order.

This is controlled by the `foreignKeys` option on `Norm.new`:

- `"auto"` (default) — emits on MySQL, skips on SQLite with a one-time warning.
- `true` — always emit.
- `false` — never emit.

::: warning
SQLite only enforces foreign keys with `PRAGMA foreign_keys = ON` (per-connection), which Norm can't guarantee across a connection pool. That's why `"auto"` skips them on SQLite.
:::

Cascading deletes come from the `onDelete = "CASCADE"` option on a `belongsTo` relation, as shown above on `Post.author`.
