import { parse } from 'https://deno.land/std@v0.61.0/flags/mod.ts';
import { exists, readFileStr } from 'https://deno.land/std@v0.61.0/fs/mod.ts';
import { readLines } from 'https://deno.land/std@v0.61.0/io/mod.ts';
import Scanner from './Scanner.ts';
import DenoLoxError from './Error.ts';
import { Parser } from './Parser.ts';
import { AstPrinter } from './AstPrinter.ts';
import { Interpreter } from './Interpreter.ts';

let denoLoxError = new DenoLoxError();
const encoder = new TextEncoder();

async function main(): Promise<void> {
  const args = parse(Deno.args, { string: 'f' });
  if (args._.length > 0) {
    await Deno.stdout.write(encoder.encode('Usage: denolox -f [script]'));
  } else if (args.f !== undefined) {
    await runFile(args.f);
  } else {
    await runPrompt();
  }
}

async function runFile(path: string): Promise<void> {
  if (!(await exists(path))) {
    await Deno.stdout.write(encoder.encode('Path does not exist'));
    return;
  }
  const result = await readFileStr(path);
  await run(result);

  if (denoLoxError.hadError) Deno.exit(65);
  if (denoLoxError.hadRuntimeError) Deno.exit(70);
}

async function runPrompt(): Promise<void> {
  const lines = readLines(Deno.stdin);
  while (true) {
    await Deno.stdout.write(encoder.encode('\n> '));
    const { value } = await lines.next();

    if (value == null || value === 'q') break;

    await run(value);
    denoLoxError.hadError = false;
  }
}

async function run(source: string): Promise<void> {
  const scanner = new Scanner(source, denoLoxError);
  const tokens = scanner.scanTokens();
  const parser = new Parser(tokens, denoLoxError);
  const expression = parser.parse();
  if (expression == null) return;
  const interpreter = new Interpreter(denoLoxError);

  if (denoLoxError.hadError) return;

  // await Deno.stdout.write(encoder.encode(new AstPrinter().print(expression)));
  interpreter.interpret(expression);
}

await main();
