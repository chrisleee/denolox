import Token from './Token.ts';
import { TokenType } from './TokenType.ts';

export default class DenoLoxError {
  public hadError = false;

  public error(line: number, message: string): void {
    this.report(line, '', message);
  }

  public tokenError(token: Token, message: string): void {
    if (token.type === TokenType.EOF) {
      this.report(token.line, ' at end', message);
    } else {
      this.report(token.line, ` at '${token.lexeme}'`, message);
    }
  }

  private report(line: number, where: string, message: string): void {
    console.error(`[line ${line}] Error${where}: ${message}`);
    this.hadError = true;
  }
}
