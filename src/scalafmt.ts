import * as https from 'https';
import * as fs from 'fs';
import { exec } from 'child_process';
import ScalafmtError from './ScalafmtError';

const FROM_FILE_PATTERN = /^--- (.*)$/;
const CHANGE_BLOCK_PATTERN = /^@@ -([0-9]+),([0-9]+) \+([0-9]+),([0-9]+) @@$/;

export default class Scalafmt {
  private readonly version: string;
  private binPath?: string;

  constructor(version: string) {
    this.version = version;
  }

  async run(
    path: string,
    useGitignore: boolean,
    reformat: boolean,
    branch?: string,
  ): Promise<ScalafmtError[]> {
    if (!this.binPath) {
      console.log(`Fetching scalafmt ${this.version}`);

      this.binPath = await this.fetchScalafmt();
    }

    const args = [this.binPath, '--non-interactive'];

    if (!reformat) {
      args.push('--test');
    }

    if (useGitignore) {
      args.push('--git', 'true');
    }

    if (branch) {
      args.push('--diff-branch', branch);
    }

    args.push(path);

    return new Promise((resolve, reject) => {
      console.debug('Running scalafmt', args.join(' '));
      exec(args.join(' '), (error, stdout, stderr) => {
        if (!error) {
          // no format errors
          resolve([]);
        } else {
          // parse errors from stderr
          resolve(Scalafmt.parseErrors(stderr));
        }
      });
    });
  }

  fetchScalafmt(): Promise<string> {
    const filename = `/scalafmt-${this.version}`;

    return new Promise((resolve, reject) => {
      const dest = fs.createWriteStream(filename);

      // TODO musl?
      const request = https.get(
        `https://github.com/scalameta/scalafmt/releases/download/v${this.version}/scalafmt-linux-musl`,
      );

      request.on('response', (response) => {
        response.pipe(dest);
      });

      request.on('error', (error) => {
        dest.close();
        fs.unlink(filename, () => {});
        reject(error);
      });

      dest.on('finish', () => {
        fs.chmodSync(filename, 0x755);
        resolve(filename);
      });
    });
  }

  private static parseErrors(diff: string): ScalafmtError[] {
    const errors: ScalafmtError[] = [];

    diff.split('\n').forEach((line) => {
      const filenameMatch = line.match(FROM_FILE_PATTERN);
      const changeMatch = line.match(CHANGE_BLOCK_PATTERN);

      if (filenameMatch) {
        const filename = filenameMatch[1];

        errors.push(new ScalafmtError(filename));
      } else if (changeMatch) {
        const startLine = changeMatch[1];

        const currentFile = errors.pop();

        if (currentFile) {
          errors.push(currentFile.withLine(Number.parseInt(startLine)));
        }
      }
    });

    return errors;
  }
}
