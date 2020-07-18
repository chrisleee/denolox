import Token from './Token.ts';
import { TokenType } from './TokenType.ts';
import DenoLoxError from './Error.ts';
import { Expr, Binary, Unary, Literal, Grouping } from './Expr.ts';

export class Parser {
  private tokens: Token[];

  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  public parse(): Expr | null {
    try {
      return this.comma();
    } catch (error) {
      return null;
    }
  }

  // TODO: Refactor all the Binary operations

  private comma(): Expr {
    let expr = this.expression();

    if (this.match(TokenType.COMMA)) {
      const operator = this.previous();
      const right = this.comma();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private expression(): Expr {
    return this.equality();
  }

  private equality(): Expr {
    let expr = this.comparison();

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator = this.previous();
      const right = this.comparison();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private comparison(): Expr {
    let expr = this.addition();

    while (
      this.match(
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.LESS,
        TokenType.LESS_EQUAL,
      )
    ) {
      const operator = this.previous();
      const right = this.addition();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private addition(): Expr {
    let expr = this.multiplication();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous();
      const right = this.multiplication();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private multiplication(): Expr {
    let expr = this.unary();

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator = this.previous();
      const right = this.unary();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private unary(): Expr {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous();
      const right = this.unary();
      return new Unary(operator, right);
    }

    return this.primary();
  }

  private primary(): Expr {
    if (this.match(TokenType.FALSE)) return new Literal(false);
    if (this.match(TokenType.TRUE)) return new Literal(true);
    if (this.match(TokenType.NIL)) return new Literal(null);

    if (this.match(TokenType.NUMBER, TokenType.STRING))
      return new Literal(this.previous().literal);

    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
      return new Grouping(expr);
    }

    const denoLoxError = new DenoLoxError();
    denoLoxError.tokenError(this.peek(), 'Expect expression.');
    throw new Error();
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();

    const denoLoxError = new DenoLoxError();
    denoLoxError.tokenError(this.peek(), message);
    throw new Error();
  }

  private synchronize(): void {
    this.advance();

    while (this.isAtEnd()) {
      if (this.previous().type === TokenType.SEMICOLON) return;

      switch (this.peek().type) {
        case TokenType.CLASS:
        case TokenType.FUN:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return;
      }

      this.advance();
    }
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }
}
