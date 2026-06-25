# Types & Options

Option tables and value shapes referenced by the API.

::: info Auto-generated
This page is generated from the source annotations (`scripts/gen-api.mjs`). Edit the doc comments in the Norm sources, not here.
:::

## NormOptions

### adapter

```lua
NormAdapter
```

Required. An adapter instance (or duck-typed table).

### foreignKeys

```lua
(boolean|"auto")?
```

Emit SQL FOREIGN KEY constraints from `belongsTo` relations. `"auto"` (default) emits on MySQL, skips on SQLite (with a one-time warning); `true` always emits; `false` never emits (no warning).

### json

```lua
("auto"|NormJsonProvider|false)?
```

JSON provider for `json` columns. `"auto"` (default) uses the adapter's, else auto-detects (Nanos `JSON` / Lua `json`), else raw passthrough; `false` disables (de)serialisation.

### log

```lua
boolean?
```

Log every executed statement.

### logger

```lua
fun(level: string, message: string)?
```

### promise

```lua
NormPromiseProvider?
```

Promise provider. Defaults to the adapter's, else built-in.

### queue_until_ready

```lua
boolean?
```

Hold data operations in a queue until the first successful `sync()`/`migrate()`, then flush them (default false: run immediately).

## NormDefineOptions

Options controlling how a model behaves (3rd arg of `define`).

### hooks

```lua
table<string, fun(record: NormRecord)|fun(record: NormRecord)[]>?
```

Lifecycle hooks per event (see `NormModel:hook`), as a single handler or a list.

### indexes

```lua
{ columns: string[], column: string, unique: boolean, name: string }[]?
```

Table indexes emitted at `sync()` (composite via `columns`, single via `column`).

### scopes

```lua
table<string, fun(query: NormQueryBuilder, ...any)>?
```

Named reusable query fragments (see `NormModel:scope`).

### soft_deletes

```lua
(boolean|{ column: string })?
```

Mark rows deleted (set a `deleted_at`) instead of removing them; queries then exclude them by default. `true` uses `deleted_at`; pass a table to rename.

### timestamps

```lua
(boolean|{ created: string, updated: string })?
```

Auto-manage created_at/updated_at (Norm-side, UTC; portable across SQLite/MySQL). `true` uses the default names; pass a table to rename.

## NormColumn

### autoincrement

```lua
boolean?
```

### default

```lua
any
```

Literal value, or `Norm.types.raw(...)` for raw SQL.

### index

```lua
boolean?
```

Emit a (non-unique) index on this column at `sync()`.

### kind

```lua
NormColumnKind
```

### length

```lua
number?
```

Length for VARCHAR columns.

### name

```lua
string?
```

Set by `define()` from the schema key.

### nullable

```lua
boolean?
```

Defaults to true (false for primary keys).

### primary

```lua
boolean?
```

### unique

```lua
boolean?
```

## NormColumnOptions

### autoincrement

```lua
boolean?
```

### default

```lua
any
```

Literal value, or `Norm.types.raw(...)` for raw SQL.

### index

```lua
boolean?
```

Emit a (non-unique) index on this column at `sync()`.

### length

```lua
number?
```

Length for VARCHAR columns.

### nullable

```lua
boolean?
```

Defaults to true (false for primary keys).

### primary

```lua
boolean?
```

### unique

```lua
boolean?
```

## NormRelationOptions

### key

```lua
string?
```

FK column name. See each relation for its default.

### localKey

```lua
string?
```

Local column for has_*/belongs_to_many (defaults to this model's primary key).

### onDelete

```lua
NormReferentialAction?
```

Emitted as `ON DELETE …` on the FK (belongs_to only).

### onUpdate

```lua
NormReferentialAction?
```

Emitted as `ON UPDATE …` on the FK (belongs_to only).

### otherKey

```lua
string?
```

Referenced column / target-side pivot FK (defaults to the relevant primary key).

### otherLocalKey

```lua
string?
```

Target's local column for belongs_to_many (defaults to the target's primary key).

### through

```lua
string?
```

Pivot (join) table for belongs_to_many (defaults to the two singulars joined alphabetically).

## NormMigration

### id

```lua
string
```

Unique, stable identifier (applied once). Order them by sorting-friendly ids.

### up

```lua
fun(m: table)
```

Receives the schema builder; record changes via m:add_column(...) etc.

## NormForeignKey

A foreign-key constraint to emit inside CREATE TABLE.

### column

```lua
string
```

FK column on this table.

### on_delete

```lua
string?
```

Referential action (e.g. "CASCADE").

### on_update

```lua
string?
```

Referential action (e.g. "CASCADE").

### ref_column

```lua
string
```

Referenced column.

### ref_table

```lua
string
```

Referenced table.

## NormExecResult

### affectedRows

```lua
number?
```

### insertId

```lua
any
```

## NormQueryState

### columns

```lua
string[]?
```

Selected columns (nil = "*").

### groups

```lua
string[]?
```

GROUP BY columns.

### havings

```lua
NormHaving[]?
```

HAVING conditions (ANDed).

### joins

```lua
NormJoin[]?
```

JOIN clauses.

### limit

```lua
number?
```

### offset

```lua
number?
```

### orders

```lua
NormOrder[]?
```

### raw_columns

```lua
string[]?
```

Raw (unquoted) select expressions, e.g. "COUNT(*) AS n".

### table

```lua
string
```

### wheres

```lua
NormWhere[]
```

## NormDialect

### autoincrement

```lua
string
```

### name

```lua
string
```

### placeholder

```lua
fun(index: number):string
```

### quote

```lua
fun(id: string):string
```

### table_suffix

```lua
string
```

### types

```lua
table<string, string>
```

## NormPromiseProvider

A promise provider plugs a framework's promise type into Norm.
Built-in builders: `Norm.promise.builtin|nanos|cfx`. Validate a custom one
with `Norm.promise.define`.

### is_promise

```lua
(fun(value: any):boolean)?
```

### name

```lua
string
```

### new

```lua
fun(executor: fun(resolve: fun(value: any), reject: fun(reason: any))):any
```

Returns a framework promise.

### reject

```lua
fun(reason: any):any
```

Already-rejected promise.

### resolve

```lua
fun(value: any):any
```

Already-resolved promise.

## NormJsonProvider

A JSON provider plugs a host's JSON library into Norm.

### decode

```lua
fun(text: string):any
```

### encode

```lua
fun(value: any):string
```

### name

```lua
string
```
