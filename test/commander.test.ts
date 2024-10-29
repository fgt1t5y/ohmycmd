import { expect, test } from "vitest";
import { Commander, Subcommand, IntegerSchema, BoolSchema } from "../src/index";

test("option", () => {
  const cmd = new Commander({
    commandPrefix: "/",
  });

  expect(cmd.commandPrefix).toBe("/");
});

test("add command", () => {
  const cmd = new Commander();
  cmd.add("stop");
  expect(cmd.execute("/stop")).toBe(false);
  expect(cmd.execute("stop server")).toBe(false);

  expect(cmd.execute("stop")).toBe(true);
});

test("add subcommand", () => {
  const cmd = new Commander();
  cmd.add("weather", [new Subcommand("clear")]);
  expect(cmd.execute("weather")).toBe(false);

  expect(cmd.execute("weather clear")).toBe(true);
});

test("integer schema", () => {
  const cmd = new Commander();
  cmd.add("time", [new Subcommand("set", new IntegerSchema)]);
  expect(cmd.execute("time set")).toBe(false);
  expect(cmd.execute("time set day")).toBe(false);

  expect(cmd.execute("time set 1000")).toBe(true);
});

test("bool schema", () => {
  const cmd = new Commander();
  cmd.add("set", [new Subcommand("autoMode", new BoolSchema)]);
  expect(cmd.execute("set autoMode")).toBe(false)
  expect(cmd.execute("set autoMode anystring")).toBe(false)

  expect(cmd.execute("set autoMode false")).toBe(true)
  expect(cmd.execute("set autoMode true")).toBe(true)
})

test("nested subcommand", () => {
  const cmd = new Commander();
  cmd.add("config", [
    new Subcommand("set", new Subcommand("all")),
    new Subcommand("set", new Subcommand("serverip", new IntegerSchema)),
  ]);
  expect(cmd.execute("config set")).toBe(false);
  expect(cmd.execute("config set serverip")).toBe(false);
  expect(cmd.execute("config set serverip string")).toBe(false);

  expect(cmd.execute("config set all")).toBe(true);
  expect(cmd.execute("config set serverip 1000")).toBe(true);
});
