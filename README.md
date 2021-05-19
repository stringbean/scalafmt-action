# scalafmt GitHub Action

GitHub Action for checking Scala source files are correctly formatted using
[scalafmt](https://scalameta.org/scalafmt/).

## Usage

Add a job that calls the action:

```yaml
jobs:
  lint:
    steps:
      - uses: stringbean/scalafmt-action@v2
        with:
          compare-branch: main
```

Any scalafmt errors will then get annotated in the action results.

### Minimising git fetch

You can reduce the amount of git history that is fetched by manually fetching the head and base refs:

```yaml
jobs:
  lint:
    name: Scalafmt
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Checkout branches
        run: |
          git remote set-branches origin "${{github.base_ref}}" "${{github.head_ref}}"
          git fetch --depth 1
          git checkout "${{github.head_ref}}"

      - uses: stringbean/scalafmt-action@v2
        with:
          use-gitignore: true
          compare-branch: 'origin/${{github.base_ref}}'
```

## Options

| Name             | Description                                                                                    | Default             |
| ---------------- | ---------------------------------------------------------------------------------------------- | ------------------- |
| `version`        | Version of scalafmt to run with - if `auto` then the version in `.scalafmt.conf` will be used. | `auto`              |
| `format-files`   | If `true` then the code will be reformatted instead of checked.                                | `false`             |
| `compare-branch` | Name of a branch to compare differences to. If set then only changed files will be scanned.    | _none_              |
| `use-gitignore`  | Whether scalafmt should read the `.gitignore` file.                                            | `true`              |
| `path`           | Path to Scala sources to scan.                                                                 | `.` (repo root dir) |
| `github-token`   | GitHub access token to fetch changed files using.                                              | (autodetected)      |

:warning: **Note:** This action uses the native version of scalafmt which cannot switch versions at
runtime. The version specified in the action _must_ match the one in `.scalafmt.conf` or the action
will fail.
