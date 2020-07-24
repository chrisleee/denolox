import Token from './Token.ts';
import { TokenType } from './TokenType.ts';
import { RuntimeError } from './RuntimeError.ts';

export default class DenoLoxError {
  public hadError = false;
  public hadRuntimeError = false;

  private encoder = new TextEncoder();

  public error(line: number, message: string): void {
    this.report(line, '', message);
  }

  public runtimeError(error: RuntimeError): void {
    Deno.stdout.writeSync(
      this.encoder.encode(`${error.message}\n [line ${error.token.line}]`),
    );
    this.hadRuntimeError = true;
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
