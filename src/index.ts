interface CommanderOptions {
  commandPrefix?: string;
}

interface SchemaOptions {
  label?: string;
  name?: string;
}

type SchemaSet = Record<string, Schema[]>;
type BindSet = Record<string, Function>;

abstract class Schema {
  public option: SchemaOptions | null;
  public nextSchema: Schema | null;

  constructor(option?: SchemaOptions, next?: Schema) {
    this.option = option || null;
    this.nextSchema = next || null;
  }

  // convert self and children to an array
  public toArray(): Schema[] {
    const schemas: Schema[] = [this];
    let schema: Schema | null = this;
    if (schema.nextSchema === null) return schemas;
    while (schema) {
      if (schema.nextSchema) {
        schemas.push(schema.nextSchema);
        schema = schema.nextSchema;
        if (!schema.nextSchema) break;
      }
    }
    return schemas;
  }

  public abstract check(value: string): boolean;
}

export class Subcommand extends Schema {
  constructor(label: string, next?: Schema) {
    super({ label }, next);
  }

  public check(value: string): boolean {
    return value === this.option!.label;
  }
}

export class IntegerSchema extends Schema {
  constructor(option?: SchemaOptions, next?: Schema) {
    super(option, next);
  }

  public check(value: string): boolean {
    return Number.isInteger(parseInt(value));
  }
}

export class StringSchema extends Schema {
  constructor(option?: SchemaOptions, next?: Schema) {
    super(option, next);
  }

  public check(): boolean {
    return true;
  }
}

export class BoolSchema extends Schema {
  constructor(option?: SchemaOptions, next?: Schema) {
    super(option, next);
  }

  public check(value: string): boolean {
    return ["true", "false"].findIndex((v: string) => v === value) > -1;
  }
}

export class Commander {
  public schemas: SchemaSet;
  public binds: BindSet;
  public commandPrefix?: string;

  constructor(option?: CommanderOptions) {
    this.schemas = {};
    this.binds = {};
    this.commandPrefix = option?.commandPrefix;
  }

  public add(label: string, schemas?: Schema[], bind?: Function) {
    this.schemas[label] = schemas || [];
    if (bind) {
      this.binds[label] = bind;
    }
  }

  public remove(label: string) {
    if (this.schemas[label]) {
      delete this.schemas[label];
    }
  }

  public clear() {
    this.schemas = {};
  }

  public execute(command: string): boolean {
    let cmd = command.trim();

    if (this.commandPrefix) {
      if (!cmd.startsWith(this.commandPrefix)) return false;

      cmd = cmd.slice(this.commandPrefix.length);
    }

    const cmdArguments = cmd.split(" ");
    // deep copy
    const cmdSchemas: Schema[] = this.schemas[cmdArguments[0]];

    if (!cmdSchemas) {
      // If the command does not exist.
      return false;
    }
    if (cmdSchemas.length === 0) {
      return cmdArguments.length > 1 ? false : true;
    }
    if (cmdSchemas.length > 0 && cmdArguments.length < 2) {
      // If the arguments is too few.
      return false;
    }

    // remove command's head
    cmdArguments.shift();

    let schemaIndex = 0,
      argumentIndex;
    for (; schemaIndex < cmdSchemas.length; schemaIndex++) {
      const schemas = cmdSchemas[schemaIndex].toArray();
      const argumentPass = [];

      for (
        argumentIndex = 0;
        argumentIndex < cmdArguments.length;
        argumentIndex++
      ) {
        if (!schemas[argumentIndex]) break;
        argumentPass.push(
          schemas[argumentIndex].check(cmdArguments[argumentIndex])
        );
      }

      if (
        argumentPass.length === cmdArguments.length &&
        argumentPass.length === schemas.length &&
        argumentPass.every((pass) => pass)
      ) {
        return true;
      }
    }

    return false;
  }
}
