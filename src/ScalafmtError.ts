export default class ScalafmtError {
  readonly filename: string;
  readonly failures: number[];


  constructor(filename: string, failures: number[] = []) {
    this.filename = filename;
    this.failures = failures;
  }

  withLine(line: number): ScalafmtError {
    return new ScalafmtError(this.filename, [...this.failures, line])
  }
}
