import { TokenType } from './TokenType.ts';

export default class Token {
  private type: TokenType;
  private lexeme: string;
  private literal: any;
  private line: number;

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
