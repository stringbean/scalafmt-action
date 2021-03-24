import https from 'https';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { homedir } from 'os';

import ScalafmtError from './ScalafmtError';
import { SingleBar } from 'cli-progress';
import fetch from 'node-fetch';

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
        console.log('STDOUT', stdout);
        console.error('STDERR', stderr);

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

  async fetchScalafmt(): Promise<string> {
    const filename = path.join(homedir(), `scalafmt-${this.version}`);

    const response = await fetch(
      `https://github.com/scalameta/scalafmt/releases/download/v${this.version}/scalafmt-linux-musl`,
    );

    if (response.status != 200) {
      throw new Error('Failed to download scalafmt');
    }

    return new Promise((resolve, reject) => {
      const progress = new SingleBar({});

      progress.start(
        Number.parseInt(response.headers.get('content-length') || '-1'),
        0,
      );

      const dest = fs.createWriteStream(filename);

      response.body.on('data', (chunk) => {
        progress.increment(chunk.length);
      });

      response.body.pipe(dest);

      response.body.on('error', (error) => {
        dest.close();
        fs.unlink(filename, () => {});
        reject(error);
      });

      dest.on('finish', () => {
        fs.chmodSync(filename, 0x755);
        progress.stop();
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
