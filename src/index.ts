const toStrictInteger = (value: string) => {
  if (/^(\-|\+)?([0-9]+)$/.test(value)) {
    return Number(value);
  } else {
    return NaN;
  }
};

interface CommanderOptions {
  commandPrefix?: string;
}

interface SchemaOptions {
  label?: string;
  // value slot name
  name?: string;
}

interface IntegerSchemaOptions extends SchemaOptions {
  min?: number;
  max?: number;
}

type SchemaMap = Record<string, Schema[]>;
type ResolvedValueMap = Record<string, unknown>;

class ParseResult {
  public pass: boolean = false;
  public originCommand: string = "";
  public arguments: string[] = [];
  public resolvedValue: ResolvedValueMap = {};

  public setPassed(pass: boolean) {
    this.pass = pass;
    return this;
  }
}

abstract class Schema {
  public label?: string;
  public name?: string;
  public next?: Schema;

  constructor(option?: SchemaOptions, next?: Schema) {
    this.label = option?.label;
    this.name = option?.name;
    this.next = next;
  }

  // convert self and children to an array
  public toArray(): Schema[] {
    const schemas: Schema[] = [this];
    let schema: Schema | undefined = this;
    if (!schema.next) return schemas;
    while (schema) {
      if (schema.next) {
        schemas.push(schema.next);
        schema = schema.next;
        if (!schema.next) break;
      }
    }
    return schemas;
  }

  public abstract check(value: string): boolean;

  public abstract value(value: string): any;
}

export class Subcommand extends Schema {
  constructor(label: string, next?: Schema) {
    super({ label }, next);
  }

  public check(value: string): boolean {
    return value === this.label;
  }

  public value(value: string): string {
    return value;
  }
}

export class IntegerSchema extends Schema {
  public min?: number;
  public max?: number;

  constructor(option?: IntegerSchemaOptions, next?: Schema) {
    super(option, next);
    this.min = option?.min;
    this.max = option?.max;
  }

  public check(value: string): boolean {
    const number = toStrictInteger(value);

    if (!Number.isInteger(number)) {
      return false;
    }

    if ((this.min && number < this.min) || (this.max && number > this.max)) {
      return false;
    }

    return true;
  }

  public value(value: string): number {
    return parseInt(value);
  }
}

export class StringSchema extends Schema {
  constructor(option?: SchemaOptions, next?: Schema) {
    super(option, next);
  }

  public check(): boolean {
    return true;
  }

  public value(value: string): string {
    return value;
  }
}

export class BoolSchema extends Schema {
  constructor(option?: SchemaOptions, next?: Schema) {
    super(option, next);
  }

  public check(value: string): boolean {
    return value === "true" || value === "false";
  }

  public value(value: string): boolean {
    return value === "true" ? true : false;
  }
}

export class Commander {
  public schemas: SchemaMap;
  public commandPrefix?: string;

  constructor(option?: CommanderOptions) {
    this.schemas = {};
    this.commandPrefix = option?.commandPrefix;
  }

  public add(label: string, schemas?: Schema[]) {
    if (!this.schemas[label]) {
      this.schemas[label] = [];
    }

    if (!schemas) {
      return;
    }

    schemas.forEach((schema) => {
      this.schemas[label].push(schema);
    });
  }

  public remove(label: string) {
    if (this.schemas[label]) {
      delete this.schemas[label];
    }
  }

  public clear() {
    this.schemas = {};
  }

  public parse(command: string): ParseResult {
    const result = new ParseResult();
    result.originCommand = command;

    let cmd = command.trim();

    if (this.commandPrefix) {
      if (!cmd.startsWith(this.commandPrefix)) {
        return result.setPassed(false);
      }

      cmd = cmd.slice(this.commandPrefix.length);
    }

    const cmdArguments = cmd.split(" ").filter((arg) => arg.length > 0);
    const cmdSchemas = this.schemas[cmdArguments[0]];

    if (!cmdSchemas) {
      // If the command does not exist.
      return result.setPassed(false);
    }

    if (cmdSchemas.length === 0) {
      if (cmdArguments.length > 1) {
        return result.setPassed(false);
      } else {
        return result.setPassed(true);
      }
    }

    if (cmdSchemas.length > 0 && cmdArguments.length < 2) {
      // If the arguments is too few.
      return result.setPassed(false);
    }

    // remove command's head
    cmdArguments.shift();

    let schemaIndex = 0;

    for (; schemaIndex < cmdSchemas.length; schemaIndex++) {
      const schemas = cmdSchemas[schemaIndex].toArray();
      const argumentPass = [];
      const resolvedValue: ResolvedValueMap = {};
      let argumentIndex = 0;

      for (; argumentIndex < cmdArguments.length; argumentIndex++) {
        const schema = schemas[argumentIndex];
        if (!schema) break;
        const pass = schema.check(cmdArguments[argumentIndex]);
        argumentPass.push(pass);
        if (pass && schema.name) {
          resolvedValue[schema.name] = schema.value(
            cmdArguments[argumentIndex]
          );
        }
      }

      if (
        argumentPass.length === cmdArguments.length &&
        argumentPass.length === schemas.length &&
        argumentPass.every((pass) => pass)
      ) {
        result.arguments = cmdArguments;
        result.resolvedValue = resolvedValue;
        return result.setPassed(true);
      }
    }

    return result.setPassed(false);
  }

  public test(command: string) {
    return this.parse(command).pass;
  }

  public execute(command: string, func: Function) {
    func.apply(null, Object.values(this.parse(command).resolvedValue));
  }
}
