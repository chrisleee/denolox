import { StringWriter } from 'https://deno.land/std@v0.61.0/io/mod.ts';
import { Binary, Expr, Grouping, Literal, Unary, Visitor } from './Expr.ts';
import Token from './Token.ts';
import { TokenType } from './TokenType.ts';

export class AstPrinter implements Visitor<String> {
  print(expr: Expr): string {
    return expr.accept(this);
  }

  public visitBinaryExpr(expr: Binary): string {
    return this.paranthesize(expr.operator.lexeme, expr.left, expr.right);
  }

  public visitGroupingExpr(expr: Grouping): string {
    return this.paranthesize('group', expr.expression);
  }

  public visitLiteralExpr(expr: Literal): string {
    if (!expr.value) return 'nil';
    return expr.value.toString();
  }

  public visitUnaryExpr(expr: Unary): string {
    return this.paranthesize(expr.operator.lexeme, expr.right);
  }

  private paranthesize(name: string, ...exprs: Expr[]): string {
    const encoder = new TextEncoder();
    const writer = new StringWriter('');

    writer.writeSync(encoder.encode(`(${name}`));
    for (const expr of exprs) {
      writer.writeSync(encoder.encode(` ${expr.accept(this)}`));
    }
    writer.writeSync(encoder.encode(')'));

    return writer.toString();
  }
}

// Temporary function to test out functionality
function main(): void {
  const expression = new Binary(
    new Unary(new Token(TokenType.MINUS, '-', null, 1), new Literal(123)),
    new Token(TokenType.STAR, '*', null, 1),
    new Grouping(new Literal(45.67)),
  );

  console.log(new AstPrinter().print(expression));
}

main();
