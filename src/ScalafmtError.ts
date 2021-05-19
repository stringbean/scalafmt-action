import * as os from 'os';
import path from 'path';

const FROM_FILE_PATTERN = /^--- (.*)$/;
const CHANGE_BLOCK_PATTERN = /^@@ -([0-9]+),([0-9]+) \+([0-9]+),([0-9]+) @@$/;
const CHANGE_DELETION_PATTERN = /^- .*$/;

export class ScalafmtError {
  readonly filename: string;
  readonly startLine: number;
  readonly startColumn: number;
  private lineCount = 0;

  constructor(filename: string, startLine: number, startColumn: number) {
    this.filename = filename;
    this.startLine = startLine;
    this.startColumn = startColumn;
  }

  incrementLineCount(): void {
    this.lineCount++;
  }

  get endLine(): number {
    return this.startLine + this.lineCount - 1;
  }

  static parseErrors(diff: string, workdir: string): ScalafmtError[] {
    const errors: ScalafmtError[] = [];

    let currentFilename: string | undefined;

    diff.split('\n').forEach((line) => {
      const filenameMatch = line.match(FROM_FILE_PATTERN);
      const changeMatch = line.match(CHANGE_BLOCK_PATTERN);
      const deletionMatch = line.match(CHANGE_DELETION_PATTERN);

      if (filenameMatch) {
        currentFilename = path.relative(workdir, filenameMatch[1]);
      } else if (changeMatch && currentFilename) {
        const [, startLine, startColumn] = changeMatch;

        errors.push(
          new ScalafmtError(
            currentFilename,
            Number.parseInt(startLine),
            Number.parseInt(startColumn),
          ),
        );
      } else if (deletionMatch && errors) {
        const error = errors[errors.length - 1];
        error.incrementLineCount();
      }
    });

    return errors;
  }

  toString(): string {
    const lineText = this.lineCount < 2 ? 'line' : 'lines';

    return `::error file=${this.filename},line=${this.startLine},col=${this.startColumn}::Incorrectly formatted ${lineText}${os.EOL}`;
  }
}
