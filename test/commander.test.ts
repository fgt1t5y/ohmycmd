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
  expect(cmd.test("/stop")).toBe(false);
  expect(cmd.test("stop server")).toBe(false);

  expect(cmd.test("stop")).toBe(true);
});

test("add subcommand", () => {
  const cmd = new Commander();
  cmd.add("weather", [new Subcommand("clear")]);
  expect(cmd.test("weather")).toBe(false);

  expect(cmd.test("weather clear")).toBe(true);
});

test("integer schema", () => {
  const cmd = new Commander();
  cmd.add("time", [new Subcommand("set", new IntegerSchema)]);
  expect(cmd.test("time set")).toBe(false);
  expect(cmd.test("time set day")).toBe(false);

  expect(cmd.test("time set 1000")).toBe(true);
});

test("bool schema", () => {
  const cmd = new Commander();
  cmd.add("set", [new Subcommand("autoMode", new BoolSchema)]);
  expect(cmd.test("set autoMode")).toBe(false)
  expect(cmd.test("set autoMode anystring")).toBe(false)

  expect(cmd.test("set autoMode false")).toBe(true)
  expect(cmd.test("set autoMode true")).toBe(true)
})

test("nested subcommand", () => {
  const cmd = new Commander();
  cmd.add("config", [
    new Subcommand("set", new Subcommand("all")),
    new Subcommand("set", new Subcommand("serverip", new IntegerSchema)),
  ]);
  expect(cmd.test("config set")).toBe(false);
  expect(cmd.test("config set serverip")).toBe(false);
  expect(cmd.test("config set serverip string")).toBe(false);

  expect(cmd.test("config set all")).toBe(true);
  expect(cmd.test("config set serverip 1000")).toBe(true);
});
