import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { homedir } from 'os';
import { env } from 'process';
import * as core from '@actions/core';

import { ScalafmtError } from './ScalafmtError';
import { SingleBar } from 'cli-progress';
import fetch from 'node-fetch';

export default class Scalafmt {
  private readonly version: string;
  private binPath?: string;
  private readonly workdir: string;

  constructor(version: string) {
    this.version = version;
    this.workdir = env.GITHUB_WORKSPACE || process.cwd();
  }

  async run(
    srcPath: string,
    useGitignore: boolean,
    reformat: boolean,
    branch?: string,
  ): Promise<ScalafmtError[]> {
    if (!this.binPath) {
      core.info(`Fetching scalafmt ${this.version}`);

      this.binPath = await this.fetchScalafmt();
    }

    const args = [this.binPath, '--non-interactive', '--debug'];

    if (!reformat) {
      args.push('--test');
    }

    if (useGitignore) {
      args.push('--git', 'true');
    }

    if (branch) {
      args.push('--diff-branch', branch);
    }

    const opts = {
      cwd: path.join(this.workdir, srcPath),
    };

    return new Promise((resolve) => {
      core.debug(`Running scalafmt: ${args.join(' ')}`);

      exec(args.join(' '), opts, (error, stdout, stderr) => {
        if (!error) {
          // no format errors
          core.debug('Scalafmt passed');
          resolve([]);
        } else {
          // parse errors from stderr
          core.debug('Scalafmt errors detected');
          resolve(ScalafmtError.parseErrors(stderr, this.workdir));
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
        fs.unlink(filename, () => {
          core.warning('Failed to cleanup target file');
        });
        reject(error);
      });

      dest.on('finish', () => {
        fs.chmodSync(filename, 0x755);
        progress.stop();
        resolve(filename);
      });
    });
  }
}
