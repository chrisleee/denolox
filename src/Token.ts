import { TokenType } from './TokenType.ts';

export default class Token {
  public type: TokenType;
  public lexeme: string;
  public literal: any;
  public line: number;

  constructor(type: TokenType, lexeme: string, literal: any, line: number) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }

  public toString(): string {
    return `${this.type} ${this.lexeme} ${this.literal}`;
  }
}
