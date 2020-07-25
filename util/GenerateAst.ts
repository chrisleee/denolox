import { parse } from 'https://deno.land/std@v0.61.0/flags/mod.ts';
import { writeFileStr } from 'https://deno.land/std@v0.61.0/fs/mod.ts';
import { StringWriter } from 'https://deno.land/std@v0.61.0/io/mod.ts';

async function main(): Promise<void> {
  const args = parse(Deno.args);
  const encoder = new TextEncoder();
  if (args._.length > 1 || args._.length === 0) {
    await Deno.stdout.write(
      encoder.encode('Usage: generate_ast <output directory>'),
    );
    Deno.exit(64);
  }

  const outputDir = args._[0].toString();

  await defineAst(encoder, outputDir, 'Expr', [
    'Assign   - name: Token, value: Expr',
    'Binary   - left: Expr, operator: Token, right: Expr',
    'Grouping - expression: Expr',
    'Literal  - value: any',
    'Unary    - operator: Token, right: Expr',
    'Variable - name: Token',
  ]);

  await defineAst(encoder, outputDir, 'Stmt', [
    'Block      - statements: Stmt[]',
    'Expression - expression: Expr',
    'Print      - expression: Expr',
    'Var        - name: Token, initializer: Expr | null',
  ]);
}

async function defineAst(
  encoder: TextEncoder,
  outputDir: string,
  baseName: string,
  types: string[],
): Promise<void> {
  const path = `${outputDir}/${baseName}.ts`;
  const writer = new StringWriter('');

  await writer.write(
    encoder.encode(
      '// This file is auto-generated from the GenerateAst util in the util folder.\n',
    ),
  );

  // Imports
  await writer.write(encoder.encode("import Token from './Token.ts';\n"));
  if (baseName !== 'Expr') {
    await writer.write(encoder.encode("import { Expr } from './Expr.ts';\n"));
  }

  // Abstract class
  await writer.write(encoder.encode('\n'));
  await writer.write(encoder.encode(`export abstract class ${baseName} {\n`));
  await writer.write(
    encoder.encode(`  abstract accept<R>(visitor: Visitor<R>): R;\n`),
  );
  await writer.write(encoder.encode('}\n'));
  await writer.write(encoder.encode('\n'));

  // Visitor interface
  await defineVisitor(encoder, writer, baseName, types);

  // Children classes
  for (const type of types) {
    const className = type.split('-')[0].trim();
    const fields = type.split('-')[1].trim();
    await defineType(writer, encoder, baseName, className, fields);
    if (type !== types[types.length - 1])
      await writer.write(encoder.encode('\n'));
  }

  await writeFileStr(path, writer.toString());
}

async function defineVisitor(
  encoder: TextEncoder,
  writer: StringWriter,
  baseName: string,
  types: string[],
): Promise<void> {
  await writer.write(encoder.encode('export interface Visitor<R> {\n'));

  for (const type of types) {
    const typeName = type.split('-')[0].trim();
    await writer.write(
      encoder.encode(
        `  visit${typeName}${baseName}(${baseName.toLowerCase()}: ${typeName}): R;\n`,
      ),
    );
  }

  await writer.write(encoder.encode('}\n'));
  await writer.write(encoder.encode('\n'));
}

async function defineType(
  writer: StringWriter,
  encoder: TextEncoder,
  baseName: string,
  className: string,
  fieldList: string,
): Promise<void> {
  await writer.write(
    encoder.encode(`export class ${className} extends ${baseName} {\n`),
  );

  // Fields
  const fields = fieldList.split(', ');
  for (const field of fields) {
    await writer.write(encoder.encode(`  public ${field};\n`));
  }
  await writer.write(encoder.encode('\n'));

  // Constructor
  await writer.write(encoder.encode(`  constructor(${fieldList}) {\n`));
  await writer.write(encoder.encode('    super();\n'));

  // Constructor fields
  for (const field of fields) {
    const name = field.split(':')[0];
    await writer.write(encoder.encode(`    this.${name} = ${name};\n`));
  }
  await writer.write(encoder.encode('  }\n'));
  await writer.write(encoder.encode('\n'));

  await writer.write(encoder.encode('  accept<R>(visitor: Visitor<R>): R {\n'));
  await writer.write(
    encoder.encode(`    return visitor.visit${className}${baseName}(this);\n`),
  );
  await writer.write(encoder.encode('  }\n'));

  await writer.write(encoder.encode('}\n'));
}

await main();
