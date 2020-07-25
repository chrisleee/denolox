import { RuntimeError } from './RuntimeError.ts';
import Token from './Token.ts';

export class Environment {
  private values: Record<string, any> = {};

  public enclosing: Environment | null;

  constructor();
  constructor(enclosing: Environment);
  constructor(enclosing?: Environment) {
    if (enclosing != (null || undefined)) {
      this.enclosing = enclosing;
    } else {
      this.enclosing = null;
    }
  }

  public get(name: Token): any {
    if (name.lexeme in this.values) {
      return this.values[name.lexeme];
    }

    if (this.enclosing != null) return this.enclosing.get(name);

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }

  public assign(name: Token, value: any): void {
    if (name.lexeme in this.values) {
      this.values[name.lexeme] = value;
      return;
    }

    if (this.enclosing != null) {
      this.enclosing.assign(name, value);
      return;
    }

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }

  public define(name: string, value: any): void {
    this.values[name] = value;
  }
}
