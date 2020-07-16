export default class DenoLoxError {
  public hadError = false;

  public error(line: number, message: string): void {
    this.report(line, '', message);
  }

  private report(line: number, where: string, message: string): void {
    console.log(`[line ${line}] Error${where}: ${message}`);
    this.hadError = true;
  }
}
