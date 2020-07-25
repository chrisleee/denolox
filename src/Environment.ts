import { RuntimeError } from './RuntimeError.ts';
import Token from './Token.ts';

export class Environment {
  private static values: Record<string, any> = {};

  public get(name: Token): any {
    if (name.lexeme in Environment.values) {
      return Environment.values[name.lexeme];
    }

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }

  public define(name: string, value: any): void {
    Environment.values[name] = value;
  }
}
