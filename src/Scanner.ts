import Token from './Token.ts';

export default class Scanner {
  private source: string;

  constructor(source: string) {
    this.source = source;
  }

  public scanTokens(): Token[] {
    return [new Token(), new Token()];
  }
}
