interface CommanderOptions {
    commandPrefix?: string;
}
interface SchemaOptions {
    label?: string;
    name?: string;
    optional?: boolean;
}
interface IntegerSchemaOptions extends SchemaOptions {
    min?: number;
    max?: number;
}
type SchemaMap = Record<string, Schema[]>;
type ResolvedValueMap = Record<string, unknown>;
declare class ParseResult {
    pass: boolean;
    originCommand: string;
    arguments: string[];
    resolvedValue: ResolvedValueMap;
    constructor(command: string);
    setPassed(pass: boolean): this;
}
declare abstract class Schema {
    label?: string;
    name?: string;
    optional: boolean;
    next?: Schema;
    constructor(option?: SchemaOptions, next?: Schema);
    toArray(): Schema[];
    abstract check(value: string): boolean;
    abstract value(value: string): any;
}
export declare class Subcommand extends Schema {
    constructor(label: string, next?: Schema);
    check(value: string): boolean;
    value(value: string): string;
}
export declare class IntegerSchema extends Schema {
    min?: number;
    max?: number;
    constructor(option?: IntegerSchemaOptions, next?: Schema);
    check(value: string): boolean;
    value(value: string): number;
}
export declare class StringSchema extends Schema {
    constructor(option?: SchemaOptions, next?: Schema);
    check(): boolean;
    value(value: string): string;
}
export declare class BoolSchema extends Schema {
    constructor(option?: SchemaOptions, next?: Schema);
    check(value: string): boolean;
    value(value: string): boolean;
}
export declare class Commander {
    schemas: SchemaMap;
    commandPrefix?: string;
    constructor(option?: CommanderOptions);
    private _add;
    add(label: string, schemas?: Schema[]): void;
    remove(label: string): void;
    clear(): void;
    parse(command: string): ParseResult;
    test(command: string): boolean;
    execute(command: string, func: Function): void;
}
export {};
