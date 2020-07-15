import { parse } from 'https://deno.land/std@v0.61.0/flags/mod.ts';
import { readLines } from 'https://deno.land/std@v0.61.0/io/mod.ts';
import { exists, readFileStr } from 'https://deno.land/std@v0.61.0/fs/mod.ts';

import Scanner from './Scanner.ts';

async function main(): Promise<void> {
  const args = parse(Deno.args, { string: 'f' });
  console.log(args);
  if (args._.length > 0) {
    console.log('Usage: denolox -f [script]');
  } else if (args.f !== undefined) {
    await runFile(args.f);
  } else {
    await runPrompt();
  }
}

async function runFile(path: string): Promise<void> {
  if (!(await exists(path))) {
    console.log('Path does not exist');
    return;
  }
  const result = await readFileStr(path);
  console.log(result);
  run(result);
}

async function runPrompt(): Promise<void> {
  const lines = readLines(Deno.stdin);
  while (true) {
    await Deno.stdout.write(new TextEncoder().encode('> '));
    const { value } = await lines.next();
    if (value === undefined || value === 'q') break;
    run(value);
  }
}

function run(source: string): void {
  const scanner = new Scanner(source);
  const tokens = scanner.scanTokens();

  for (const token of tokens) {
    console.log(token);
  }
}

await main();
