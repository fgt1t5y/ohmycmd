interface CommanderOptions {
    commandPrefix?: string;
}
interface SchemaOptions {
    label?: string;
    name?: string;
}
type SchemaSet = Record<string, Schema[]>;
type BindSet = Record<string, Function>;
declare abstract class Schema {
    option: SchemaOptions | null;
    nextSchema: Schema | null;
    constructor(option?: SchemaOptions, next?: Schema);
    toArray(): Schema[];
    abstract check(value: string): boolean;
}
export declare class Subcommand extends Schema {
    constructor(label: string, next?: Schema);
    check(value: string): boolean;
}
export declare class IntegerSchema extends Schema {
    constructor(option?: SchemaOptions, next?: Schema);
    check(value: string): boolean;
}
export declare class StringSchema extends Schema {
    constructor(option?: SchemaOptions, next?: Schema);
    check(): boolean;
}
export declare class BoolSchema extends Schema {
    constructor(option?: SchemaOptions, next?: Schema);
    check(value: string): boolean;
}
export declare class Commander {
    schemas: SchemaSet;
    binds: BindSet;
    commandPrefix?: string;
    constructor(option?: CommanderOptions);
    add(label: string, schemas?: Schema[], bind?: Function): void;
    remove(label: string): void;
    clear(): void;
    execute(command: string): boolean;
}
export {};
