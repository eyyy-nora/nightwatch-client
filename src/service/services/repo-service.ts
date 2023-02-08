import type { AsyncHttpResponse, Parser } from "@propero/easy-api";
import { Body, Delete, Get, intParser, Param, Post, Put, Query, Req, Service } from "@propero/easy-api";
import type { Constructor } from "@propero/easy-api";
import type { Filter, FilterOperator } from "@propero/easy-filter";
import { FilterParser } from "@propero/easy-filter";
import { plainToClass, plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";
import type { Request } from "express";
import { PagedResponse } from "src/types/paged-response";

import {
  And,
  Equal,
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  ObjectLiteral,
} from "typeorm";
import type { DataSource, FindOptionsOrder, FindOptionsSelect, FindOptionsWhere, ColumnType } from "typeorm";

interface RepoServiceOptions<T> {
  entity: Constructor<T>;
  dataSource: DataSource;
  filter?: (req: Request, type: "create" | "read" | "update" | "delete") => Partial<FindOptionsWhere<T>>;
  allowed?: (req: Request, type: "create" | "read" | "update" | "delete", data?: T) => boolean;
  exclude?: (keyof T)[];
  defaults?: {
    take?: number;
    skip?: number;
    select?: FindOptionsSelect<T>;
    where?: FindOptionsWhere<T>;
    order?: FindOptionsOrder<T>;
    relations?: string[];
  };
  filterParser?: FilterParser;
}

@Service({ routerOptions: {} })
export class RepoService<T extends ObjectLiteral> {
  protected options: RepoServiceOptions<T>;

  constructor(options: RepoServiceOptions<T>) {
    const defaults = options.defaults ? { ...options.defaults } : {};
    this.options = { ...options, defaults };
    defaults.skip ??= 0;
    defaults.take ??= 20;
    this.options.filterParser ??= new FilterParser();
  }

  protected get repo() {
    const { dataSource, entity } = this.options;
    return dataSource.getRepository<T>(entity);
  }

  protected get meta() {
    const { dataSource, entity } = this.options;
    return dataSource.getMetadata(entity);
  }

  protected get entity() {
    return this.options.entity;
  }

  protected get dataSource() {
    return this.options.dataSource;
  }

  protected assertAllowed(req: Request, operation: "create" | "read" | "update" | "delete", data?: T) {
    const allowed = this.options.allowed;
    if (!allowed || allowed(req, operation, data)) return;
    throw Object.assign(new Error("Unauthorized"), { status: 403 });
  }

  @Get("/")
  public async find(
    @Query("take", intParser()) take: number,
    @Query("skip", intParser()) skip: number,
    @Query("select", selectParser()) select: FindOptionsSelect<T>,
    @Query("filter", filterParser()) where: FindOptionsWhere<T>,
    @Query("sort", sortParser()) order: FindOptionsOrder<T>,
    @Req request: Request,
  ): Promise<PagedResponse<T>> {
    this.assertAllowed(request, "read");
    const { defaults, filter, exclude } = this.options;
    take ??= defaults!.take!;
    skip ??= defaults!.skip!;
    select ??= defaults!.select!;
    where ??= defaults!.where ?? {};
    order ??= defaults!.order!;
    const relations = defaults?.relations;
    if (filter) where = { ...where, ...filter.call(this, request, "read") };
    if (exclude) for (const field of exclude) (select as any)[field] = false;
    const [items, count] = await this.repo.findAndCount({ take, skip, select, where, order, relations });
    return { take, skip, items, count };
  }

  @Get("/:keys")
  public async findOne(
    @Param("keys", keysParser()) where: FindOptionsWhere<T>,
    @Query("select", selectParser()) select: FindOptionsSelect<T>,
    @Req request: Request,
  ) {
    this.assertAllowed(request, "read");
    const { filter, exclude, defaults } = this.options;
    if (filter) where = { ...where, ...filter.call(this, request, "read") };
    if (exclude) for (const field of exclude) (select as any)[field] = false;
    return await this.repo.findOne({ select, where, relations: defaults?.relations });
  }

  @Post("/")
  public async create(@Body() entity: Partial<T>, @Req request: Request) {
    const { filter } = this.options;
    if (filter) Object.assign(entity, filter.call(this, request, "create") ?? {});
    const casted = plainToInstance(this.entity, entity);
    await validateOrReject(casted as any, {
      forbidUnknownValues: true,
      skipMissingProperties: true,
      skipUndefinedProperties: true,
      skipNullProperties: true,
    });
    this.assertAllowed(request, "read", casted);
    return await this.repo.save(casted as any);
  }

  @Delete("/:keys")
  public async remove(@Param("keys", keysParser()) where: FindOptionsWhere<T>, @Req request: Request) {
    const { filter } = this.options;
    if (filter) Object.assign(where, filter.call(this, request, "delete") ?? {});
    const entity = await this.repo.findOne(where);
    this.assertAllowed(request, "delete", (entity as T) ?? undefined);
    await this.repo.delete(where);
  }

  @Put("/:keys")
  public async update(
    @Param("keys", keysParser()) where: FindOptionsWhere<T>,
    @Body() body: Partial<T>,
    @Req request: Request,
  ) {
    const { filter } = this.options;
    if (filter) Object.assign(where, filter.call(this, request, "update") ?? {});
    const casted = plainToInstance(this.entity, body);
    await validateOrReject(casted as any, {
      forbidUnknownValues: true,
      skipMissingProperties: true,
      skipUndefinedProperties: true,
      skipNullProperties: true,
    });
    const entity = await this.repo.findOne(where);
    this.assertAllowed(request, "delete", (entity as T) ?? undefined);
    await this.repo.update(where, casted as any);
    return casted;
  }
}

export interface RepoData<T> {
  entity: Constructor<T>;
  dataSource: DataSource;
}

function identity<T>(t: T): T {
  return t;
}

export function selectParser<T = any, E = unknown>(
  data: (cxt: T) => RepoData<E> = identity as any,
): Parser<FindOptionsSelect<E>> {
  return function (this: T, value) {
    let cacheAll: FindOptionsSelect<E>;
    let cacheNone: FindOptionsSelect<E>;
    const fields = value?.split(",") ?? [];
    const { dataSource, entity } = data(this);
    const meta = dataSource.getMetadata(entity);
    if (fields.length === 0)
      // all fields
      return (cacheAll ??= Object.fromEntries(Object.keys(meta.propertiesMap).map(key => [key, true])) as any);
    else {
      cacheNone ??= Object.fromEntries(Object.keys(meta.propertiesMap).map(key => [key, false])) as any;
      const select = { ...cacheNone };
      for (const field of fields)
        if (!(field in select)) throw new Error(`Can't include field: ${field}!`);
        else (select as any)[field] = true;
      return select;
    }
  };
}

const parser = new FilterParser();
export function filterParser<T = any, E = unknown>(
  data: (cxt: T) => RepoData<E> = identity as any,
): Parser<FindOptionsWhere<E>> {
  function notSupported(filter: Filter<E>) {
    throw new Error(`Operator not supported: ${filter.op}`);
  }

  const visitors: { [Key in FilterOperator]: (filter: Filter<E> & { op: Key }) => any } = {
    "eq": f => field(f, Equal(f.value)),
    "ne": f => field(f, Not(Equal(f.value))),
    "gt": f => field(f, MoreThan(f.value)),
    "ge": f => field(f, MoreThanOrEqual(f.value)),
    "lt": f => field(f, LessThan(f.value)),
    "le": f => field(f, LessThanOrEqual(f.value)),
    "or": f => f.filters.map(filter => (visitors as any)[filter.op](filter)),
    "and": f => And(...f.filters.map(filter => (visitors as any)[filter.op](filter))),
    "not": f => Not((visitors as any)[f.filter.op](f.filter)),
    "null": f => field(f, IsNull()),
    "not-null": f => field(f, Not(IsNull())),
    "in": f => field(f, In(f.items)),
    "not-in": f => field(f, Not(In(f.items))),
    "contains": f => maybeCi(f, `%${f.value}%`),
    "not-contains": f => maybeCi(f, `%${f.value}%`, true),
    "like": f => maybeCi(f, f.value),
    "not-like": f => maybeCi(f, f.value, true),
    "starts-with": f => maybeCi(f, `${f.value}%`),
    "not-starts-with": f => maybeCi(f, `${f.value}%`, true),
    "ends-with": f => maybeCi(f, `%${f.value}`),
    "not-ends-with": f => maybeCi(f, `%${f.value}`, true),
    "close-to": notSupported,
    "far-from": notSupported,
    "match": notSupported,
    "not-match": notSupported,
  };

  function field(filter: Filter<E> & { field: keyof E }, condition: any) {
    if (!lookup(filter.field)) throw new Error(`Cannot filter field: ${filter.field}`);
    return { [filter.field]: condition };
  }

  function maybeCi(filter: Filter<E> & { field: keyof E; ci: boolean }, pattern: string, invert?: boolean) {
    let f = filter.ci ? ILike(pattern) : Like(pattern);
    if (invert) f = Not(f);
    return field(filter, f);
  }

  let lookup: (field: string) => boolean;

  return function (this: T, value) {
    lookup = getFieldLookup(data)(this);
    if (!value) return {};
    const parsed = parser.parse(value);
    return (visitors as any)[parsed.op](parsed);
  };
}

function getFieldLookup<T, E>(data: (cxt: T) => RepoData<E>): (cxt: T) => (field: string) => boolean {
  return cxt => {
    const { dataSource, entity } = data(cxt);
    const fieldLookup = dataSource.getMetadata(entity).propertiesMap;
    return function lookup(field: string): boolean {
      return !!fieldLookup[field];
    };
  };
}

export function sortParser<T = any, E = unknown>(
  data: (cxt: T) => RepoData<E> = identity as any,
): Parser<FindOptionsOrder<E>> {
  const asc = { direction: "ASC" };
  const desc = { direction: "DESC" };
  const getLookup = getFieldLookup(data);
  return function (this: T, value) {
    const lookup = getLookup(this);
    const fields: [string, unknown][] = value
      ?.split(",")
      .map(it => (it.startsWith("-") ? [it.slice(1), desc] : it.startsWith("+") ? [it.slice(1), asc] : [it, asc]));
    if (!fields?.length) return undefined;
    for (const [field] of fields) if (!lookup(field)) throw new Error(`Cannot sort field: ${field}`);
    return Object.fromEntries(fields) as any;
  };
}

function typeParser(type: ColumnType): Parser<unknown, string> {
  switch (type) {
    case "bool":
    case "bit":
    case "boolean":
      return val => val === "true";
    case "varchar":
    case "text":
    case "tinytext":
    case "citext":
    case "longtext":
    case "ntext":
    case "shorttext":
    case "mediumtext":
    case "alphanum":
    case "string":
      return identity;
    case "number":
      return parseFloat;
    case "date":
      return val => new Date(val);
    default:
      return identity;
  }
}

export function keysParser<T = any, E = unknown>(
  data: (cxt: T) => RepoData<E> = identity as any,
): Parser<FindOptionsWhere<E>, string> {
  let primaryColumnMap: Record<
    string,
    {
      propertyName: string;
      parse: (value: string) => unknown;
      type: ColumnType;
    }
  >;

  return function (this: T, value) {
    if (!primaryColumnMap) {
      const { dataSource, entity } = data(this);
      const entries = dataSource.getMetadata(entity).primaryColumns.map(column => {
        const { propertyName, type } = column;
        return [propertyName, { propertyName, parse: typeParser(type), type }];
      });
      primaryColumnMap = Object.fromEntries(entries);
    }
    if (!value) return {};
    return Object.fromEntries(
      value
        .split(",")
        .map(pair => pair.split("=", 2))
        .map(([field, value]) => {
          if (!primaryColumnMap[field]) throw new Error(`invalid key field: ${field}!`);
          return [field, primaryColumnMap[field].parse(value)];
        }),
    ) as any;
  };
}

export function entityParser<T = any, E = unknown>(
  skipKeys: boolean = false,
  data: (cxt: T) => RepoData<E> = identity as any,
): Parser<E, Record<string, unknown>> {
  let validate: (data: unknown) => Promise<void>;
  let cast: (data: unknown) => E;

  return async function (this: T, value) {
    if (!cast || !validate) {
      const { entity } = data(this);
      cast = value => plainToClass(entity, value);
      validate = value =>
        validateOrReject(value as any, {
          forbidUnknownValues: true,
          skipMissingProperties: skipKeys,
        });
    }
    const parsed = cast(value);
    await validate(parser);
    return parsed;
  };
}
