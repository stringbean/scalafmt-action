# scalafmt GitHub Action

GitHub Action for checking Scala source files are correctly formatted using
[scalafmt](https://scalameta.org/scalafmt/).

## Usage

Add a job that calls the action:

```yaml
jobs:
  lint:
    steps:
      - uses: stringbean/scalafmt-action@v1
        with:
          compare-branch: main
```

Any scalafmt errors will then get annotated in the action results.

## Options

| Name             | Description                                                                                 | Default             |
| ---------------- | ------------------------------------------------------------------------------------------- | ------------------- |
| `version`        | Version of scalafmt to run with.                                                            | `latest`            |
| `format-files`   | If `true` then the code will be reformatted instead of checked.                             | `false`             |
| `compare-branch` | Name of a branch to compare differences to. If set then only changed files will be scanned. | _none_              |
| `use-gitignore`  | Whether scalafmt should read the `.gitignore` file.                                         | `true`              |
| `path`           | Path to Scala sources to scan.                                                              | `.` (repo root dir) |

:warning: **Note:** This action uses the native version of scalafmt which cannot switch versions at
runtime. The version specified in the action _must_ match the one in `.scalafmt.conf` or the action
will fail.
