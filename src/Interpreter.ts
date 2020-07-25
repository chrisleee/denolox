import DenoLoxError from './Error.ts';
import {
  Binary,
  Expr,
  Grouping,
  Literal,
  Unary,
  Visitor as ExprVisitor,
  Variable,
} from './Expr.ts';
import { RuntimeError } from './RuntimeError.ts';
import { Visitor as StmtVistor, Expression, Stmt, Var } from './Stmt.ts';
import Token from './Token.ts';
import { TokenType } from './TokenType.ts';
import { Environment } from './Environment.ts';

export class Interpreter implements ExprVisitor<any>, StmtVistor<void> {
  private encoder = new TextEncoder();
  private denoLoxError: DenoLoxError;

  private environment = new Environment();

  constructor(denoLoxError: DenoLoxError) {
    this.denoLoxError = denoLoxError;
  }

  public interpret(statements: Stmt[]): void {
    try {
      for (const statement of statements) {
        this.execute(statement);
      }
    } catch (error) {
      this.denoLoxError.runtimeError(error);
    }
  }

  public visitLiteralExpr(expr: Literal): any {
    return expr.value;
  }

  public visitGroupingExpr(expr: Grouping): any {
    return this.evaluate(expr.expression);
  }

  public visitUnaryExpr(expr: Unary): any {
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.BANG:
        return !this.isTruthy(right);
      case TokenType.MINUS:
        this.checkNumberOperand(expr.operator, right);
        return -right;
    }

    return null;
  }

  public visitVariableExpr(expr: Variable): any {
    return this.environment.get(expr.name);
  }

  public visitBinaryExpr(expr: Binary): any {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.GREATER:
        this.checkNumberOperands(expr.operator, left, right);
        return left > right;
      case TokenType.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return left >= right;
      case TokenType.LESS:
        this.checkNumberOperands(expr.operator, left, right);
        return left < right;
      case TokenType.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return left <= right;
      case TokenType.MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return left - right;
      case TokenType.PLUS:
        if (typeof left === 'number' && typeof right === 'number') {
          return left + right;
        }

        if (typeof left === 'string' && typeof right === 'string') {
          return left + right;
        }

        // Explicitly have cases for string and number
        // to allow for future changes
        if (typeof left === 'string' && typeof right === 'number') {
          return left + right.toString();
        }

        if (typeof left === 'number' && typeof right === 'string') {
          return left.toString() + right;
        }

        throw new RuntimeError(
          expr.operator,
          'Operands must be two numbers or two string.',
        );
      case TokenType.SLASH:
        if (right === 0) {
          throw new RuntimeError(expr.operator, 'Cannot divide by zero.');
        }
        this.checkNumberOperands(expr.operator, left, right);
        return left / right;
      case TokenType.STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return left * right;
      case TokenType.BANG_EQUAL:
        return !this.isEqual(left, right);
      case TokenType.EQUAL_EQUAL:
        return this.isEqual(left, right);
    }

    return null;
  }

  private checkNumberOperand(operator: Token, operand: any): void {
    if (typeof operand === 'number') return;
    throw new RuntimeError(operator, 'Operand must be a number.');
  }

  private checkNumberOperands(operator: Token, left: any, right: any): void {
    if (typeof left === 'number' && typeof right === 'number') return;

    throw new RuntimeError(operator, 'Operands must be numbers.');
  }

  private isTruthy(object: any): boolean {
    if (object == null) return false;
    if (typeof object === 'boolean') return object;
    return true;
  }

  private isEqual(a: any, b: any): boolean {
    if (a == null && b == null) return true;
    if (a == null) return false;

    return a == b;
  }

  private stringify(object: any): string {
    if (object == null) return 'nil';

    if (typeof object === 'number') {
      let text = object.toString();
      if (text.endsWith('.0')) {
        text = text.substring(0, text.length - 2);
      }
      return text;
    }

    return object.toString();
  }

  private evaluate(expr: Expr): any {
    return expr.accept(this);
  }

  private execute(stmt: Stmt): void {
    stmt.accept(this);
  }

  public visitExpressionStmt(stmt: Expression): void {
    this.evaluate(stmt.expression);
  }

  public visitPrintStmt(stmt: Expression): void {
    const value = this.evaluate(stmt.expression);
    Deno.stdout.writeSync(this.encoder.encode(this.stringify(value)));
  }

  public visitVarStmt(stmt: Var): void {
    let value = null;
    if (stmt.initializer != null) {
      value = this.evaluate(stmt.initializer);
    }

    this.environment.define(stmt.name.lexeme, value);
  }
}
