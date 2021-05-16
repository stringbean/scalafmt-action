import { context, getOctokit } from '@actions/github';
import * as core from '@actions/core';

export default class PrUtils {
  static async listChangedFiles(token: string): Promise<string[]> {
    const client = getOctokit(token);

    const owner = context.payload.repository?.owner?.login;
    const repo = context.payload.repository?.name;
    const pull_number = context.payload.pull_request?.number;

    core.debug(`Repo: ${owner}/${repo}`);
    core.debug(`PR: ${pull_number}`);

    if (owner && repo && pull_number) {
      const changedFiles = await client.paginate(client.pulls.listFiles, {
        owner,
        repo,
        pull_number,
      });

      return changedFiles
        .filter((f) => f.status !== 'deleted')
        .map((f) => f.filename);
    } else {
      throw new Error('cannot determine pull request');
    }
  }
}
