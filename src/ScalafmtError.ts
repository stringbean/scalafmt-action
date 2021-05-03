import { Writable } from 'stream';
import * as os from 'os';

export default class ScalafmtError {
  readonly filename: string;
  readonly failures: ScalafmtErrorBlock[];

  constructor(filename: string, failures: ScalafmtErrorBlock[] = []) {
    this.filename = filename;
    this.failures = failures;
  }

  withFailure(
    startLine: number,
    startColumn: number,
    endLine: number,
    endColumn: number,
  ): ScalafmtError {
    return new ScalafmtError(this.filename, [
      ...this.failures,
      new ScalafmtErrorBlock(startLine, startColumn, endLine, endColumn),
    ]);
  }

  write(stream: Writable): void {
    this.failures.forEach((failure) => {
      if (failure.startLine === failure.endLine) {
        stream.write(
          `::error file=${this.filename},line=${failure.startLine},col=${failure.startColumn}::Incorrectly formatted line${os.EOL}`,
        );
      } else {
        stream.write(
          `::error file=${this.filename},line=${failure.startLine},col=${failure.startColumn}::Incorrectly formatted lines${os.EOL}`,
        );
      }
    });
  }
}

export class ScalafmtErrorBlock {
  readonly startLine: number;
  readonly startColumn: number;
  readonly endLine: number;
  readonly endColumn: number;

  constructor(
    startLine: number,
    startColumn: number,
    endLine: number,
    endColumn: number,
  ) {
    this.startLine = startLine;
    this.startColumn = startColumn;
    this.endLine = endLine;
    this.endColumn = endColumn;
  }
}
