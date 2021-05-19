import { context, getOctokit } from '@actions/github';

export default class PrUtils {
  static async listChangedFiles(token: string): Promise<string[]> {
    const client = getOctokit(token);

    const repo = context.payload.repository;

    if (!repo) {
      throw new Error('cannot determine repository');
    }

    const pull_number = context.payload.pull_request?.number;

    if (!pull_number) {
      throw new Error('cannot determine pull request');
    }

    const changedFiles = await client.paginate(client.pulls.listFiles, {
      owner: repo.owner.login,
      repo: repo.name,
      pull_number,
    });

    return changedFiles
      .filter((f) => f.status !== 'deleted')
      .map((f) => f.filename);
  }
}
