import * as core from '@actions/core';

import Scalafmt from './scalafmt';
import { ExitCode } from '@actions/core';

async function run() {
  const scalafmtVersion: string = core.getInput('version');
  const formatFiles: boolean = core.getInput('format-files') === 'true';
  const compareBranch: string = core.getInput('compare-branch');
  const useGitignore: boolean = core.getInput('use-gitignore') === 'true';
  const path: string = core.getInput('path');

  const scalafmt = new Scalafmt(scalafmtVersion);
  const results = await scalafmt.run(
    path,
    useGitignore,
    formatFiles,
    compareBranch,
  );

  results
    .sort((a, b) => a.filename.localeCompare(b.filename))
    .forEach((error) => process.stdout.write(error.toString()));

  if (results.length) {
    process.exitCode = ExitCode.Failure;
  }
}

run().catch((error) => {
  core.error('Unexpected error running Scalafmt');
  core.debug(error);
  core.setFailed(error);
});
