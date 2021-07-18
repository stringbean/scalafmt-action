/* eslint  @typescript-eslint/ban-ts-comment: "off" */

import PrUtils from '../src/PrUtils';
import { context, getOctokit } from '@actions/github';
import { mocked } from 'ts-jest/utils';

jest.mock('@actions/github');

const getOctokitMocked = mocked(getOctokit);
const paginate = jest.fn();

beforeEach(() => {
  getOctokitMocked.mockReturnValue({
    // @ts-ignore
    paginate: paginate,
    rest: {
      pulls: {
        // @ts-ignore
        listFiles: 'list',
      },
    },
  });
});

describe('listChangedFiles', () => {
  test('resolves with a list of added and modified files', async () => {
    stubContext({ owner: 'org', name: 'project' }, 12);

    paginate.mockResolvedValue([
      { filename: 'added1.scala', status: 'added' },
      { filename: 'updated1.scala', status: 'changed' },
      { filename: 'deleted1.scala', status: 'deleted' },
      { filename: 'updated2.scala', status: 'updated' },
      { filename: 'added2.scala', status: 'added' },
    ]);

    const changedFiles = await PrUtils.listChangedFiles('token');

    expect(changedFiles).toEqual([
      'added1.scala',
      'updated1.scala',
      'updated2.scala',
      'added2.scala',
    ]);

    expect(paginate).toBeCalledWith('list', {
      owner: 'org',
      repo: 'project',
      pull_number: 12,
    });
  });

  test('rejects if repo is undefined', async () => {
    stubContext(undefined, 12);

    await expect(PrUtils.listChangedFiles('token')).rejects.toThrow(
      'cannot determine repository',
    );

    expect(paginate).not.toBeCalled();
  });

  test('rejects if pull request is undefined', async () => {
    stubContext({ owner: 'org', name: 'project' }, undefined);

    await expect(PrUtils.listChangedFiles('token')).rejects.toThrow(
      'cannot determine pull request',
    );

    expect(paginate).not.toBeCalled();
  });
});

function stubContext(
  repo: { owner: string; name: string } | undefined,
  pull: number | undefined,
): void {
  context.payload = {
    repository: repo
      ? {
          name: repo.name,
          owner: {
            login: repo.owner,
          },
        }
      : undefined,
    pull_request: pull
      ? {
          number: pull,
        }
      : undefined,
  };
}
