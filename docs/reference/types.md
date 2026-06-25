---
outline: [2, 3]
---

# Types & Options

Option tables and value shapes referenced throughout the API.

::: info Auto-generated
This page is generated from the source annotations by `scripts/gen-api.mjs`. Edit the LuaCATS doc comments in the Norm sources, not here.
:::

## NormOptions

<small>:link: [Source: `src/orm.lua`](https://github.com/JustGodWork/norm/blob/master/src/orm.lua#L58)</small>

| Member | Returns | Description |
|---|---|---|
| [`adapter`](#normoptions-adapter) | — | Required. |
| [`foreignKeys`](#normoptions-foreignkeys) | — | Emit SQL FOREIGN KEY constraints from `belongsTo` relations. |
| [`json`](#normoptions-json) | — | JSON provider for `json` columns. |
| [`log`](#normoptions-log) | — | Log every executed statement. |
| [`logger`](#normoptions-logger) | — |  |
| [`promise`](#normoptions-promise) | — | Promise provider. |
| [`queue_until_ready`](#normoptions-queue_until_ready) | — | Hold data operations in a queue until the first successful `sync()`/`migrate()`, then flush them (default false: run immediately). |

### adapter <Badge type="info" text="field" /> {#normoptions-adapter}

```lua
NormAdapter
```

Required. An adapter instance (or duck-typed table).

### foreignKeys <Badge type="info" text="field" /> {#normoptions-foreignkeys}

```lua
(boolean|"auto")?
```

Emit SQL FOREIGN KEY constraints from `belongsTo` relations. `"auto"` (default) emits on MySQL, skips on SQLite (with a one-time warning); `true` always emits; `false` never emits (no warning).

### json <Badge type="info" text="field" /> {#normoptions-json}

```lua
("auto"|NormJsonProvider|false)?
```

JSON provider for `json` columns. `"auto"` (default) uses the adapter's, else auto-detects (Nanos `JSON` / Lua `json`), else raw passthrough; `false` disables (de)serialisation.

### log <Badge type="info" text="field" /> {#normoptions-log}

```lua
boolean?
```

Log every executed statement.

### logger <Badge type="info" text="field" /> {#normoptions-logger}

```lua
fun(level: string, message: string)?
```

### promise <Badge type="info" text="field" /> {#normoptions-promise}

```lua
NormPromiseProvider?
```

Promise provider. Defaults to the adapter's, else built-in.

### queue_until_ready <Badge type="info" text="field" /> {#normoptions-queue_until_ready}

```lua
boolean?
```

Hold data operations in a queue until the first successful `sync()`/`migrate()`, then flush them (default false: run immediately).

## NormDefineOptions

Options controlling how a model behaves (3rd arg of `define`).

<small>:link: [Source: `src/model.lua`](https://github.com/JustGodWork/norm/blob/master/src/model.lua#L1351)</small>

| Member | Returns | Description |
|---|---|---|
| [`hooks`](#normdefineoptions-hooks) | — | Lifecycle hooks per event (see `NormModel:hook`), as a single handler or a list. |
| [`indexes`](#normdefineoptions-indexes) | — | Table indexes emitted at `sync()` (composite via `columns`, single via `column`). |
| [`scopes`](#normdefineoptions-scopes) | — | Named reusable query fragments (see `NormModel:scope`). |
| [`soft_deletes`](#normdefineoptions-soft_deletes) | — | Mark rows deleted (set a `deleted_at`) instead of removing them; queries then exclude them by default. |
| [`timestamps`](#normdefineoptions-timestamps) | — | Auto-manage created_at/updated_at (Norm-side, UTC; portable across SQLite/MySQL). |

### hooks <Badge type="info" text="field" /> {#normdefineoptions-hooks}

```lua
table<string, fun(record: NormRecord)|fun(record: NormRecord)[]>?
```

Lifecycle hooks per event (see `NormModel:hook`), as a single handler or a list.

### indexes <Badge type="info" text="field" /> {#normdefineoptions-indexes}

```lua
{ columns: string[], column: string, unique: boolean, name: string }[]?
```

Table indexes emitted at `sync()` (composite via `columns`, single via `column`).

### scopes <Badge type="info" text="field" /> {#normdefineoptions-scopes}

```lua
table<string, fun(query: NormQueryBuilder, ...any)>?
```

Named reusable query fragments (see `NormModel:scope`).

### soft_deletes <Badge type="info" text="field" /> {#normdefineoptions-soft_deletes}

```lua
(boolean|{ column: string })?
```

Mark rows deleted (set a `deleted_at`) instead of removing them; queries then exclude them by default. `true` uses `deleted_at`; pass a table to rename.

### timestamps <Badge type="info" text="field" /> {#normdefineoptions-timestamps}

```lua
(boolean|{ created: string, updated: string })?
```

Auto-manage created_at/updated_at (Norm-side, UTC; portable across SQLite/MySQL). `true` uses the default names; pass a table to rename.

## NormColumn

<small>:link: [Source: `src/types.lua`](https://github.com/JustGodWork/norm/blob/master/src/types.lua#L30)</small>

| Member | Returns | Description |
|---|---|---|
| [`autoincrement`](#normcolumn-autoincrement) | — |  |
| [`default`](#normcolumn-default) | — | Literal value, or `Norm.types.raw(...)` for raw SQL. |
| [`index`](#normcolumn-index) | — | Emit a (non-unique) index on this column at `sync()`. |
| [`kind`](#normcolumn-kind) | — |  |
| [`length`](#normcolumn-length) | — | Length for VARCHAR columns. |
| [`name`](#normcolumn-name) | — | Set by `define()` from the schema key. |
| [`nullable`](#normcolumn-nullable) | — | Defaults to true (false for primary keys). |
| [`primary`](#normcolumn-primary) | — |  |
| [`unique`](#normcolumn-unique) | — |  |

### autoincrement <Badge type="info" text="field" /> {#normcolumn-autoincrement}

```lua
boolean?
```

### default <Badge type="info" text="field" /> {#normcolumn-default}

```lua
any
```

Literal value, or `Norm.types.raw(...)` for raw SQL.

### index <Badge type="info" text="field" /> {#normcolumn-index}

```lua
boolean?
```

Emit a (non-unique) index on this column at `sync()`.

### kind <Badge type="info" text="field" /> {#normcolumn-kind}

```lua
NormColumnKind
```

### length <Badge type="info" text="field" /> {#normcolumn-length}

```lua
number?
```

Length for VARCHAR columns.

### name <Badge type="info" text="field" /> {#normcolumn-name}

```lua
string?
```

Set by `define()` from the schema key.

### nullable <Badge type="info" text="field" /> {#normcolumn-nullable}

```lua
boolean?
```

Defaults to true (false for primary keys).

### primary <Badge type="info" text="field" /> {#normcolumn-primary}

```lua
boolean?
```

### unique <Badge type="info" text="field" /> {#normcolumn-unique}

```lua
boolean?
```

## NormColumnOptions

<small>:link: [Source: `src/types.lua`](https://github.com/JustGodWork/norm/blob/master/src/types.lua#L21)</small>

| Member | Returns | Description |
|---|---|---|
| [`autoincrement`](#normcolumnoptions-autoincrement) | — |  |
| [`default`](#normcolumnoptions-default) | — | Literal value, or `Norm.types.raw(...)` for raw SQL. |
| [`index`](#normcolumnoptions-index) | — | Emit a (non-unique) index on this column at `sync()`. |
| [`length`](#normcolumnoptions-length) | — | Length for VARCHAR columns. |
| [`nullable`](#normcolumnoptions-nullable) | — | Defaults to true (false for primary keys). |
| [`primary`](#normcolumnoptions-primary) | — |  |
| [`unique`](#normcolumnoptions-unique) | — |  |

### autoincrement <Badge type="info" text="field" /> {#normcolumnoptions-autoincrement}

```lua
boolean?
```

### default <Badge type="info" text="field" /> {#normcolumnoptions-default}

```lua
any
```

Literal value, or `Norm.types.raw(...)` for raw SQL.

### index <Badge type="info" text="field" /> {#normcolumnoptions-index}

```lua
boolean?
```

Emit a (non-unique) index on this column at `sync()`.

### length <Badge type="info" text="field" /> {#normcolumnoptions-length}

```lua
number?
```

Length for VARCHAR columns.

### nullable <Badge type="info" text="field" /> {#normcolumnoptions-nullable}

```lua
boolean?
```

Defaults to true (false for primary keys).

### primary <Badge type="info" text="field" /> {#normcolumnoptions-primary}

```lua
boolean?
```

### unique <Badge type="info" text="field" /> {#normcolumnoptions-unique}

```lua
boolean?
```

## NormRelationOptions

<small>:link: [Source: `src/types.lua`](https://github.com/JustGodWork/norm/blob/master/src/types.lua#L187)</small>

| Member | Returns | Description |
|---|---|---|
| [`key`](#normrelationoptions-key) | — | FK column name. |
| [`localKey`](#normrelationoptions-localkey) | — | Local column for has_*/belongs_to_many (defaults to this model's primary key). |
| [`onDelete`](#normrelationoptions-ondelete) | — | Emitted as `ON DELETE …` on the FK (belongs_to only). |
| [`onUpdate`](#normrelationoptions-onupdate) | — | Emitted as `ON UPDATE …` on the FK (belongs_to only). |
| [`otherKey`](#normrelationoptions-otherkey) | — | Referenced column / target-side pivot FK (defaults to the relevant primary key). |
| [`otherLocalKey`](#normrelationoptions-otherlocalkey) | — | Target's local column for belongs_to_many (defaults to the target's primary key). |
| [`through`](#normrelationoptions-through) | — | Pivot (join) table for belongs_to_many (defaults to the two singulars joined alphabetically). |

### key <Badge type="info" text="field" /> {#normrelationoptions-key}

```lua
string?
```

FK column name. See each relation for its default.

### localKey <Badge type="info" text="field" /> {#normrelationoptions-localkey}

```lua
string?
```

Local column for has_*/belongs_to_many (defaults to this model's primary key).

### onDelete <Badge type="info" text="field" /> {#normrelationoptions-ondelete}

```lua
NormReferentialAction?
```

Emitted as `ON DELETE …` on the FK (belongs_to only).

### onUpdate <Badge type="info" text="field" /> {#normrelationoptions-onupdate}

```lua
NormReferentialAction?
```

Emitted as `ON UPDATE …` on the FK (belongs_to only).

### otherKey <Badge type="info" text="field" /> {#normrelationoptions-otherkey}

```lua
string?
```

Referenced column / target-side pivot FK (defaults to the relevant primary key).

### otherLocalKey <Badge type="info" text="field" /> {#normrelationoptions-otherlocalkey}

```lua
string?
```

Target's local column for belongs_to_many (defaults to the target's primary key).

### through <Badge type="info" text="field" /> {#normrelationoptions-through}

```lua
string?
```

Pivot (join) table for belongs_to_many (defaults to the two singulars joined alphabetically).

## NormMigration

<small>:link: [Source: `src/orm.lua`](https://github.com/JustGodWork/norm/blob/master/src/orm.lua#L752)</small>

| Member | Returns | Description |
|---|---|---|
| [`id`](#normmigration-id) | — | Unique, stable identifier (applied once). |
| [`up`](#normmigration-up) | — | Receives the schema builder; record changes via m:add_column(...) etc. |

### id <Badge type="info" text="field" /> {#normmigration-id}

```lua
string
```

Unique, stable identifier (applied once). Order them by sorting-friendly ids.

### up <Badge type="info" text="field" /> {#normmigration-up}

```lua
fun(m: table)
```

Receives the schema builder; record changes via m:add_column(...) etc.

## NormForeignKey

A foreign-key constraint to emit inside CREATE TABLE.

<small>:link: [Source: `src/sql.lua`](https://github.com/JustGodWork/norm/blob/master/src/sql.lua#L109)</small>

| Member | Returns | Description |
|---|---|---|
| [`column`](#normforeignkey-column) | — | FK column on this table. |
| [`on_delete`](#normforeignkey-on_delete) | — | Referential action (e.g. |
| [`on_update`](#normforeignkey-on_update) | — | Referential action (e.g. |
| [`ref_column`](#normforeignkey-ref_column) | — | Referenced column. |
| [`ref_table`](#normforeignkey-ref_table) | — | Referenced table. |

### column <Badge type="info" text="field" /> {#normforeignkey-column}

```lua
string
```

FK column on this table.

### on_delete <Badge type="info" text="field" /> {#normforeignkey-on_delete}

```lua
string?
```

Referential action (e.g. "CASCADE").

### on_update <Badge type="info" text="field" /> {#normforeignkey-on_update}

```lua
string?
```

Referential action (e.g. "CASCADE").

### ref_column <Badge type="info" text="field" /> {#normforeignkey-ref_column}

```lua
string
```

Referenced column.

### ref_table <Badge type="info" text="field" /> {#normforeignkey-ref_table}

```lua
string
```

Referenced table.

## NormExecResult

<small>:link: [Source: `src/adapter.lua`](https://github.com/JustGodWork/norm/blob/master/src/adapter.lua#L11)</small>

| Member | Returns | Description |
|---|---|---|
| [`affectedRows`](#normexecresult-affectedrows) | — |  |
| [`insertId`](#normexecresult-insertid) | — |  |

### affectedRows <Badge type="info" text="field" /> {#normexecresult-affectedrows}

```lua
number?
```

### insertId <Badge type="info" text="field" /> {#normexecresult-insertid}

```lua
any
```

## NormQueryState

<small>:link: [Source: `src/sql.lua`](https://github.com/JustGodWork/norm/blob/master/src/sql.lua#L26)</small>

| Member | Returns | Description |
|---|---|---|
| [`columns`](#normquerystate-columns) | — | Selected columns (nil = "*"). |
| [`groups`](#normquerystate-groups) | — | GROUP BY columns. |
| [`havings`](#normquerystate-havings) | — | HAVING conditions (ANDed). |
| [`joins`](#normquerystate-joins) | — | JOIN clauses. |
| [`limit`](#normquerystate-limit) | — |  |
| [`offset`](#normquerystate-offset) | — |  |
| [`orders`](#normquerystate-orders) | — |  |
| [`raw_columns`](#normquerystate-raw_columns) | — | Raw (unquoted) select expressions, e.g. |
| [`table`](#normquerystate-table) | — |  |
| [`wheres`](#normquerystate-wheres) | — |  |

### columns <Badge type="info" text="field" /> {#normquerystate-columns}

```lua
string[]?
```

Selected columns (nil = "*").

### groups <Badge type="info" text="field" /> {#normquerystate-groups}

```lua
string[]?
```

GROUP BY columns.

### havings <Badge type="info" text="field" /> {#normquerystate-havings}

```lua
NormHaving[]?
```

HAVING conditions (ANDed).

### joins <Badge type="info" text="field" /> {#normquerystate-joins}

```lua
NormJoin[]?
```

JOIN clauses.

### limit <Badge type="info" text="field" /> {#normquerystate-limit}

```lua
number?
```

### offset <Badge type="info" text="field" /> {#normquerystate-offset}

```lua
number?
```

### orders <Badge type="info" text="field" /> {#normquerystate-orders}

```lua
NormOrder[]?
```

### raw_columns <Badge type="info" text="field" /> {#normquerystate-raw_columns}

```lua
string[]?
```

Raw (unquoted) select expressions, e.g. "COUNT(*) AS n".

### table <Badge type="info" text="field" /> {#normquerystate-table}

```lua
string
```

### wheres <Badge type="info" text="field" /> {#normquerystate-wheres}

```lua
NormWhere[]
```

## NormDialect

<small>:link: [Source: `src/dialect.lua`](https://github.com/JustGodWork/norm/blob/master/src/dialect.lua#L13)</small>

| Member | Returns | Description |
|---|---|---|
| [`autoincrement`](#normdialect-autoincrement) | — |  |
| [`name`](#normdialect-name) | — |  |
| [`placeholder`](#normdialect-placeholder) | — |  |
| [`quote`](#normdialect-quote) | — |  |
| [`table_suffix`](#normdialect-table_suffix) | — |  |
| [`types`](#normdialect-types) | — |  |

### autoincrement <Badge type="info" text="field" /> {#normdialect-autoincrement}

```lua
string
```

### name <Badge type="info" text="field" /> {#normdialect-name}

```lua
string
```

### placeholder <Badge type="info" text="field" /> {#normdialect-placeholder}

```lua
fun(index: number):string
```

### quote <Badge type="info" text="field" /> {#normdialect-quote}

```lua
fun(id: string):string
```

### table_suffix <Badge type="info" text="field" /> {#normdialect-table_suffix}

```lua
string
```

### types <Badge type="info" text="field" /> {#normdialect-types}

```lua
table<string, string>
```

## NormPromiseProvider

A promise provider plugs a framework's promise type into Norm.
Built-in builders: `Norm.promise.builtin|nanos|cfx`. Validate a custom one
with `Norm.promise.define`.

<small>:link: [Source: `src/promise.lua`](https://github.com/JustGodWork/norm/blob/master/src/promise.lua#L17)</small>

| Member | Returns | Description |
|---|---|---|
| [`is_promise`](#normpromiseprovider-is_promise) | — |  |
| [`name`](#normpromiseprovider-name) | — |  |
| [`new`](#normpromiseprovider-new) | — | Returns a framework promise. |
| [`reject`](#normpromiseprovider-reject) | — | Already-rejected promise. |
| [`resolve`](#normpromiseprovider-resolve) | — | Already-resolved promise. |

### is_promise <Badge type="info" text="field" /> {#normpromiseprovider-is_promise}

```lua
(fun(value: any):boolean)?
```

### name <Badge type="info" text="field" /> {#normpromiseprovider-name}

```lua
string
```

### new <Badge type="info" text="field" /> {#normpromiseprovider-new}

```lua
fun(executor: fun(resolve: fun(value: any), reject: fun(reason: any))):any
```

Returns a framework promise.

### reject <Badge type="info" text="field" /> {#normpromiseprovider-reject}

```lua
fun(reason: any):any
```

Already-rejected promise.

### resolve <Badge type="info" text="field" /> {#normpromiseprovider-resolve}

```lua
fun(value: any):any
```

Already-resolved promise.

## NormJsonProvider

A JSON provider plugs a host's JSON library into Norm.

<small>:link: [Source: `src/json.lua`](https://github.com/JustGodWork/norm/blob/master/src/json.lua#L11)</small>

| Member | Returns | Description |
|---|---|---|
| [`decode`](#normjsonprovider-decode) | — |  |
| [`encode`](#normjsonprovider-encode) | — |  |
| [`name`](#normjsonprovider-name) | — |  |

### decode <Badge type="info" text="field" /> {#normjsonprovider-decode}

```lua
fun(text: string):any
```

### encode <Badge type="info" text="field" /> {#normjsonprovider-encode}

```lua
fun(value: any):string
```

### name <Badge type="info" text="field" /> {#normjsonprovider-name}

```lua
string
```
