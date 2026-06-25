---
outline: [2, 3]
---

# NormQueryBuilder <Badge type="info" text="class" />

The fluent builder behind every query: `where_*`, joins, aggregations, scopes, pagination, and bulk writes.

::: info Auto-generated
This page is generated from the source annotations by `scripts/gen-api.mjs`. Edit the LuaCATS doc comments in the Norm sources, not here.
:::

<small>:link: [Source: `src/query.lua`](https://github.com/JustGodWork/norm/blob/master/src/query.lua#L11)</small>

| Member | Returns | Description |
|---|---|---|
| [`all`](#all) | `NormRecordListPromise` _(async)_ | Execute the query and resolve with all matching records. |
| [`avg`](#avg) | `NormNumberPromise` _(async)_ | AVG of a column over the current filter. |
| [`count`](#count) | `NormNumberPromise` _(async)_ | Resolve with the COUNT(*) for the current conditions. |
| [`decrement`](#decrement) | `NormNumberPromise` _(async)_ | Atomically subtract `amount` (default 1) from a column on every matching row. |
| [`delete`](#delete) | `NormNumberPromise` _(async)_ | Bulk-delete every matching row. |
| [`first`](#first) | `NormRecordOrNilPromise` _(async)_ | Execute the query with LIMIT 1 and resolve with the first record (or nil). |
| [`force_delete`](#force_delete) | `NormNumberPromise` _(async)_ | Bulk physical-DELETE every matching row, even on a soft-delete model. |
| [`group_by`](#group_by) | `self: NormQueryBuilder` | Add GROUP BY columns (call again, or pass several, to group by more). |
| [`having`](#having) | `self: NormQueryBuilder` | Add a HAVING condition (ANDed) on a RAW aggregate expression. |
| [`include`](#include) | `self: NormQueryBuilder` | Eager-load relations with the result (one batched query per relation level — |
| [`increment`](#increment) | `NormNumberPromise` _(async)_ | Atomically add `amount` (default 1) to a column on every matching row, in one |
| [`join`](#join) | `self: NormQueryBuilder` | INNER JOIN another table. |
| [`left_join`](#left_join) | `self: NormQueryBuilder` | LEFT JOIN another table (same argument forms as `:join`). |
| [`limit`](#limit) | `self: NormQueryBuilder` | Limit the number of rows (pair with `:offset()` for pagination). |
| [`max`](#max) | `NormNumberPromise` _(async)_ | MAX of a column over the current filter. |
| [`min`](#min) | `NormNumberPromise` _(async)_ | MIN of a column over the current filter. |
| [`model`](#model) | — |  |
| [`offset`](#offset) | `self: NormQueryBuilder` | Skip `n` rows (use with `:limit()`). |
| [`omit`](#omit) | `self: NormQueryBuilder` | Inverse of `select`: select every column of the model EXCEPT the given ones |
| [`only_trashed`](#only_trashed) | `self: NormQueryBuilder` | Return ONLY soft-deleted rows. |
| [`or_where`](#or_where) | `self: NormQueryBuilder` | OR variant of `where`. |
| [`or_where_between`](#or_where_between) | `self: NormQueryBuilder` |  |
| [`or_where_in`](#or_where_in) | `self: NormQueryBuilder` |  |
| [`or_where_like`](#or_where_like) | `self: NormQueryBuilder` |  |
| [`or_where_not`](#or_where_not) | `self: NormQueryBuilder` |  |
| [`or_where_not_between`](#or_where_not_between) | `self: NormQueryBuilder` |  |
| [`or_where_not_in`](#or_where_not_in) | `self: NormQueryBuilder` |  |
| [`or_where_not_like`](#or_where_not_like) | `self: NormQueryBuilder` |  |
| [`or_where_not_null`](#or_where_not_null) | `self: NormQueryBuilder` |  |
| [`or_where_null`](#or_where_null) | `self: NormQueryBuilder` |  |
| [`order`](#order) | `self: NormQueryBuilder` | Add an ORDER BY clause (call again for secondary orderings). |
| [`paginate`](#paginate) | `NormPromise` _(async)_ | Paginate the current query. |
| [`rows`](#rows) | `NormRowsPromise` _(async)_ | Execute the query and resolve with the RAW rows (no record wrapping). |
| [`scope`](#scope) | `self: NormQueryBuilder` | Apply a named scope (a reusable query fragment registered on the model with |
| [`select`](#select) | `self: NormQueryBuilder` | Restrict selected columns (the inverse is `:omit`). |
| [`select_raw`](#select_raw) | `self: NormQueryBuilder` | Add a RAW (unquoted) select expression — for aggregates/computed columns that |
| [`sum`](#sum) | `NormNumberPromise` _(async)_ | SUM of a column over the current filter. |
| [`update`](#update) | `NormNumberPromise` _(async)_ | Bulk-update every matching row in one statement (no records loaded). |
| [`where`](#where) | `self: NormQueryBuilder` | Add an AND condition. |
| [`where_between`](#where_between) | `self: NormQueryBuilder` | `column [NOT] BETWEEN min AND max` (inclusive). |
| [`where_doesnt_have`](#where_doesnt_have) | `self: NormQueryBuilder` | Inverse of `where_has`: keep only rows with NO matching related row |
| [`where_has`](#where_has) | `self: NormQueryBuilder` | Keep only rows that HAVE at least one related row for `name` (optionally |
| [`where_in`](#where_in) | `self: NormQueryBuilder` | `column IN (...)` (and its OR / negated variants). |
| [`where_like`](#where_like) | `self: NormQueryBuilder` | `column [NOT] LIKE pattern` (use `%` / `_` wildcards). |
| [`where_not`](#where_not) | `self: NormQueryBuilder` | `column != value` (and OR variant). |
| [`where_not_between`](#where_not_between) | `self: NormQueryBuilder` |  |
| [`where_not_in`](#where_not_in) | `self: NormQueryBuilder` |  |
| [`where_not_like`](#where_not_like) | `self: NormQueryBuilder` |  |
| [`where_not_null`](#where_not_null) | `self: NormQueryBuilder` |  |
| [`where_null`](#where_null) | `self: NormQueryBuilder` | `column IS [NOT] NULL` (and OR variants). |
| [`with_count`](#with_count) | `self: NormQueryBuilder` | Add a `<name>_count` field to each returned record: the number of related rows, |
| [`with_trashed`](#with_trashed) | `self: NormQueryBuilder` | Include soft-deleted rows in the result (disables the default exclusion). |

## all <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#all}

```lua
NormQueryBuilder:all()
  -> promise: NormRecordListPromise
```

Execute the query and resolve with all matching records.
```lua
    local users = User:query():where("admin", true):all():await()
```

## avg <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#avg}

```lua
NormQueryBuilder:avg(column: string)
  -> promise: NormNumberPromise
```

AVG of a column over the current filter. Resolves with a number.

## count <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#count}

```lua
NormQueryBuilder:count()
  -> promise: NormNumberPromise
```

Resolve with the COUNT(*) for the current conditions.
```lua
    local admins = User:query():where("admin", true):count():await()
```

## decrement <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#decrement}

```lua
NormQueryBuilder:decrement(column: string, amount?: number)
  -> promise: NormNumberPromise
```

Atomically subtract `amount` (default 1) from a column on every matching row.

## delete <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#delete}

```lua
NormQueryBuilder:delete()
  -> promise: NormNumberPromise
```

Bulk-delete every matching row. On a soft-delete model this marks the rows
(sets `deleted_at`) rather than removing them; use `force_delete` to remove.
Resolves with the affected row count.
```lua
    local n = User:query():where("coins", 0):delete():await()
```

## first <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#first}

```lua
NormQueryBuilder:first()
  -> promise: NormRecordOrNilPromise
```

Execute the query with LIMIT 1 and resolve with the first record (or nil).
```lua
    local newest = User:query():order("id", "DESC"):first():await()
```

## force_delete <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#force_delete}

```lua
NormQueryBuilder:force_delete()
  -> promise: NormNumberPromise
```

Bulk physical-DELETE every matching row, even on a soft-delete model.
Resolves with the affected row count.

## group_by <Badge type="info" text="method" /> {#group_by}

```lua
NormQueryBuilder:group_by(...string)
  -> self: NormQueryBuilder
```

Add GROUP BY columns (call again, or pass several, to group by more).
```lua
    Player:select_raw("faction, COUNT(*) AS n"):group_by("faction"):rows():await()
```

## having <Badge type="info" text="method" /> {#having}

```lua
NormQueryBuilder:having(expr: string, op?: string, value?: any)
  -> self: NormQueryBuilder
```

Add a HAVING condition (ANDed) on a RAW aggregate expression. Forms:
`having(expr, value)` or `having(expr, op, value)`. The expression is emitted
verbatim (so you can reference `COUNT(*)`, `SUM(\`coins\`)`, …); the value is bound.
```lua
    Player:select_raw("faction, COUNT(*) AS n"):group_by("faction")
          :having("COUNT(*)", ">", 10):rows():await()
```

## include <Badge type="info" text="method" /> {#include}

```lua
NormQueryBuilder:include(...string|fun(q: NormQueryBuilder))
  -> self: NormQueryBuilder
```

Eager-load relations with the result (one batched query per relation level —
no N+1), attaching them to each returned record. Three forms:
  * `include("posts", "profile")` — simple relation names.
  * `include("posts.comments")` — nested via a dotted path (shared prefixes load once).
  * `include("posts", function(q) ... end)` — with per-relation options: call
    `where` / `order` / `limit` / `offset` (and nested `include`) on `q`. The
    `limit` is applied PER PARENT (e.g. 5 latest posts for each user).
```lua
    local users = User:query():include("posts.comments"):all():await()
    print(#users[1].posts[1].comments)

    local u = User:query():include("posts", function(q)
        q:where("published", true):order("created_at", "DESC"):limit(5)
         :include("comments", function(c) c:order("created_at", "ASC") end)
    end):all():await()
```

## increment <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#increment}

```lua
NormQueryBuilder:increment(column: string, amount?: number)
  -> promise: NormNumberPromise
```

Atomically add `amount` (default 1) to a column on every matching row, in one
`SET col = col + ?` statement (no read-modify-write, race-free). Resolves with
the affected row count.
```lua
    Player:where("id", id):increment("coins", 50):await()
```

## join <Badge type="info" text="method" /> {#join}

```lua
NormQueryBuilder:join(table_name: string, first: string, op: string, second?: string)
  -> self: NormQueryBuilder
```

INNER JOIN another table. Use qualified `table.column` refs. Forms:
`join(table, first, second)` (defaults `=`) or `join(table, first, op, second)`.
Joins are for FILTERING/SORTING by a related table — combine with qualified
`where`/`order`. Since joined rows mix columns from both tables, restrict the
projection with `:select_raw("main.*")` if you still want `:all()` to wrap the
main model, or read the flattened rows with `:rows()`.
```lua
    Post:join("users", "users.id", "posts.user_id")
        :where("users.admin", true):select_raw("`posts`.*"):all():await()
```

## left_join <Badge type="info" text="method" /> {#left_join}

```lua
NormQueryBuilder:left_join(table_name: string, first: string, op: string, second?: string)
  -> self: NormQueryBuilder
```

LEFT JOIN another table (same argument forms as `:join`). Keeps main rows even
when there is no match on the joined side.

## limit <Badge type="info" text="method" /> {#limit}

```lua
NormQueryBuilder:limit(n: number)
  -> self: NormQueryBuilder
```

Limit the number of rows (pair with `:offset()` for pagination).
```lua
    local page = User:query():order("id"):limit(10):offset(20):all():await()
```

## max <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#max}

```lua
NormQueryBuilder:max(column: string)
  -> promise: NormNumberPromise
```

MAX of a column over the current filter. Resolves with the raw value.
```lua
    local top = Player:max("score"):await()
```

## min <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#min}

```lua
NormQueryBuilder:min(column: string)
  -> promise: NormNumberPromise
```

MIN of a column over the current filter. Resolves with the raw value.

## model <Badge type="info" text="field" /> {#model}

```lua
NormModel
```

## offset <Badge type="info" text="method" /> {#offset}

```lua
NormQueryBuilder:offset(n: number)
  -> self: NormQueryBuilder
```

Skip `n` rows (use with `:limit()`).

## omit <Badge type="info" text="method" /> {#omit}

```lua
NormQueryBuilder:omit(...string|string[])
  -> self: NormQueryBuilder
```

Inverse of `select`: select every column of the model EXCEPT the given ones
(e.g. to drop a `password` / large blob without listing all the others). The
omitted columns are simply absent from the returned records.
```lua
    local u = User:omit("password"):find(1):await()
```

## only_trashed <Badge type="info" text="method" /> {#only_trashed}

```lua
NormQueryBuilder:only_trashed()
  -> self: NormQueryBuilder
```

Return ONLY soft-deleted rows.

## or_where <Badge type="info" text="method" /> {#or_where}

```lua
NormQueryBuilder:or_where(column: string|table<string, any>, op?: string, value?: any)
  -> self: NormQueryBuilder
```

OR variant of `where`.
```lua
    User:query():where("admin", true):or_where("coins", ">", 1000):all():await()
```

## or_where_between <Badge type="info" text="method" /> {#or_where_between}

```lua
NormQueryBuilder:or_where_between(column: string, min: any, max: any)
  -> self: NormQueryBuilder
```

## or_where_in <Badge type="info" text="method" /> {#or_where_in}

```lua
NormQueryBuilder:or_where_in(column: string, list: any[])
  -> self: NormQueryBuilder
```

## or_where_like <Badge type="info" text="method" /> {#or_where_like}

```lua
NormQueryBuilder:or_where_like(column: string, pattern: string)
  -> self: NormQueryBuilder
```

## or_where_not <Badge type="info" text="method" /> {#or_where_not}

```lua
NormQueryBuilder:or_where_not(column: string, value: any)
  -> self: NormQueryBuilder
```

## or_where_not_between <Badge type="info" text="method" /> {#or_where_not_between}

```lua
NormQueryBuilder:or_where_not_between(column: string, min: any, max: any)
  -> self: NormQueryBuilder
```

## or_where_not_in <Badge type="info" text="method" /> {#or_where_not_in}

```lua
NormQueryBuilder:or_where_not_in(column: string, list: any[])
  -> self: NormQueryBuilder
```

## or_where_not_like <Badge type="info" text="method" /> {#or_where_not_like}

```lua
NormQueryBuilder:or_where_not_like(column: string, pattern: string)
  -> self: NormQueryBuilder
```

## or_where_not_null <Badge type="info" text="method" /> {#or_where_not_null}

```lua
NormQueryBuilder:or_where_not_null(column: string)
  -> self: NormQueryBuilder
```

## or_where_null <Badge type="info" text="method" /> {#or_where_null}

```lua
NormQueryBuilder:or_where_null(column: string)
  -> self: NormQueryBuilder
```

## order <Badge type="info" text="method" /> {#order}

```lua
NormQueryBuilder:order(column: string, dir?: "ASC"|"DESC")
  -> self: NormQueryBuilder
```

Add an ORDER BY clause (call again for secondary orderings).
```lua
    User:query():order("coins", "DESC"):order("name"):all():await()
```

```lua
dir:
   | "ASC"
   | "DESC"
```

## paginate <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#paginate}

```lua
NormQueryBuilder:paginate(page?: number, per_page?: number)
  -> promise: NormPromise
```

Paginate the current query. Runs a `COUNT(*)` over the filter plus a
`LIMIT/OFFSET` page query, resolving with
`{ data, total, page, per_page, last_page, from, to }`. Honours `where`,
`order`, soft-delete scope, and `with_count`.
```lua
    local p = User:where("admin", true):order("name"):paginate(2, 20):await()
    print(p.page, p.last_page, #p.data, p.total)
```

## rows <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#rows}

```lua
NormQueryBuilder:rows()
  -> promise: NormRowsPromise
```

Execute the query and resolve with the RAW rows (no record wrapping). Use this
for grouped aggregates built with `:select_raw` / `:group_by` / `:having`.
```lua
    local stats = Player:select_raw("faction, COUNT(*) AS n, SUM(`coins`) AS total")
        :group_by("faction"):having("COUNT(*)", ">", 10):rows():await()
```

## scope <Badge type="info" text="method" /> {#scope}

```lua
NormQueryBuilder:scope(name: string, ...any)
  -> self: NormQueryBuilder
```

Apply a named scope (a reusable query fragment registered on the model with
`Model:scope(name, fn)`), passing it any extra args. Chainable.
```lua
    User:active():scope("older_than", 18):all():await()
```

## select <Badge type="info" text="method" /> {#select}

```lua
NormQueryBuilder:select(...string|string[])
  -> self: NormQueryBuilder
```

Restrict selected columns (the inverse is `:omit`).
```lua
    User:query():select("id", "name"):all():await()
```

## select_raw <Badge type="info" text="method" /> {#select_raw}

```lua
NormQueryBuilder:select_raw(expr: string)
  -> self: NormQueryBuilder
```

Add a RAW (unquoted) select expression — for aggregates/computed columns that
the column-quoting `select` can't express. Pair with `:group_by` and `:rows()`.
```lua
    User:select_raw("faction, COUNT(*) AS n"):group_by("faction"):rows():await()
```

## sum <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#sum}

```lua
NormQueryBuilder:sum(column: string)
  -> promise: NormNumberPromise
```

SUM of a column over the current filter. Resolves with a number (0 if empty).
```lua
    local bank = User:where("admin", false):sum("coins"):await()
```

## update <Badge type="tip" text="async" /> <Badge type="info" text="method" /> {#update}

```lua
NormQueryBuilder:update(data: table<string, any>)
  -> promise: NormNumberPromise
```

Bulk-update every matching row in one statement (no records loaded).
Resolves with the affected row count.
```lua
    local n = User:query():where("admin", true):update({ coins = 0 }):await()
```

## where <Badge type="info" text="method" /> {#where}

```lua
NormQueryBuilder:where(column: string|table<string, any>, op?: string, value?: any)
  -> self: NormQueryBuilder
```

Add an AND condition. Forms: `where(col, value)`, `where(col, op, value)` or
`where({ col = value, ... })`. Chainable with the other `where_*` helpers.
```lua
    User:query():where("coins", ">", 100):where("admin", true):all():await()
```

## where_between <Badge type="info" text="method" /> {#where_between}

```lua
NormQueryBuilder:where_between(column: string, min: any, max: any)
  -> self: NormQueryBuilder
```

`column [NOT] BETWEEN min AND max` (inclusive). With OR / negated variants.
```lua
    Player:query():where_between("level", 10, 20):all():await()
```

## where_doesnt_have <Badge type="info" text="method" /> {#where_doesnt_have}

```lua
NormQueryBuilder:where_doesnt_have(name: string, configure?: fun(q: NormQueryBuilder))
  -> self: NormQueryBuilder
```

Inverse of `where_has`: keep only rows with NO matching related row
(`NOT EXISTS (...)`).

## where_has <Badge type="info" text="method" /> {#where_has}

```lua
NormQueryBuilder:where_has(name: string, configure?: fun(q: NormQueryBuilder))
  -> self: NormQueryBuilder
```

Keep only rows that HAVE at least one related row for `name` (optionally
matching the `configure` conditions). Compiles to `EXISTS (correlated subquery)`.
```lua
    User:where_has("posts"):all():await()                       -- users with any post
    User:where_has("posts", function(q) q:where("published", true) end):all():await()
```

## where_in <Badge type="info" text="method" /> {#where_in}

```lua
NormQueryBuilder:where_in(column: string, list: any[])
  -> self: NormQueryBuilder
```

`column IN (...)` (and its OR / negated variants).
```lua
    User:query():where_in("id", { 1, 2, 3 }):all():await()
```

## where_like <Badge type="info" text="method" /> {#where_like}

```lua
NormQueryBuilder:where_like(column: string, pattern: string)
  -> self: NormQueryBuilder
```

`column [NOT] LIKE pattern` (use `%` / `_` wildcards). With OR / negated variants.
```lua
    User:query():where_like("name", "John%"):all():await()
```

## where_not <Badge type="info" text="method" /> {#where_not}

```lua
NormQueryBuilder:where_not(column: string, value: any)
  -> self: NormQueryBuilder
```

`column != value` (and OR variant).

## where_not_between <Badge type="info" text="method" /> {#where_not_between}

```lua
NormQueryBuilder:where_not_between(column: string, min: any, max: any)
  -> self: NormQueryBuilder
```

## where_not_in <Badge type="info" text="method" /> {#where_not_in}

```lua
NormQueryBuilder:where_not_in(column: string, list: any[])
  -> self: NormQueryBuilder
```

## where_not_like <Badge type="info" text="method" /> {#where_not_like}

```lua
NormQueryBuilder:where_not_like(column: string, pattern: string)
  -> self: NormQueryBuilder
```

## where_not_null <Badge type="info" text="method" /> {#where_not_null}

```lua
NormQueryBuilder:where_not_null(column: string)
  -> self: NormQueryBuilder
```

## where_null <Badge type="info" text="method" /> {#where_null}

```lua
NormQueryBuilder:where_null(column: string)
  -> self: NormQueryBuilder
```

`column IS [NOT] NULL` (and OR variants).

## with_count <Badge type="info" text="method" /> {#with_count}

```lua
NormQueryBuilder:with_count(...string)
  -> self: NormQueryBuilder
```

Add a `<name>_count` field to each returned record: the number of related rows,
without loading them (a correlated `COUNT(*)` subquery). Soft-deleted related
rows aren't counted.
```lua
    local users = User:with_count("posts"):all():await()
    print(users[1].posts_count)
```

## with_trashed <Badge type="info" text="method" /> {#with_trashed}

```lua
NormQueryBuilder:with_trashed()
  -> self: NormQueryBuilder
```

Include soft-deleted rows in the result (disables the default exclusion).
