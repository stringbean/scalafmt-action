#!/bin/bash -x

set -o pipefail

if [ -z "$GITHUB_WORKSPACE" ] ; then
    echo "Missing GITHUB_WORKSPACE - ensure that source is checked out"
    exit 1
fi

SCALAFMT_VERSION="latest"
SCALAFMT_REPORT_VERSION="1.0.0"

SHORT_OPTS=v:f:b:g:p:` `
OPTS=$(getopt --options $SHORT_OPTS --name "$0" -- "$@")
eval set -- "$OPTS"

DEFAULT_VERSION=$(scalafmt --version | cut -d' ' -f2)
SCALAFMT=scalafmt

ACTION="--test"
USE_GITIGNORE=""
COMPARE_BRANCH=""
SOURCE_PATH=""

while true ; do
    case "$1" in
    -v)
        version=$(echo $2 | sed -e 's/^ *//g' -e 's/ *$//g')
        if [ "$version" != "$DEFAULT_VERSION" ] && [ "$version" != 'latest' ] ; then
            SCALAFMT_VERSION="$version"
        fi
        shift 2
        ;;
    -f)
        if [ "$2" == 'true' ] ; then
            ACTION=""
        fi
        shift 2
        ;;
    -b)
        branch=$(echo $2 | sed -e 's/^ *//g' -e 's/ *$//g')
        if [ ! -z "$branch" ] ; then
            COMPARE_BRANCH="--diff-branch $branch"
            git branch --track $branch origin/$branch
        fi
        shift 2
        ;;
    -g)
        opt=$(echo $2 | sed -e 's/^ *//g' -e 's/ *$//g')

        if [ "$opt" == 'true' ] ; then
            USE_GITIGNORE="--git true"
        fi
        shift 2
        ;;
    -p)
        SOURCE_PATH="$2"
        shift 2
        ;;
    --)
        shift
        break
        ;;
    *)
        echo "Fail! $1"
        shift
        ;;
    esac
done

echo "Will run using scalafmt: $SCALAFMT_VERSION"

if [ "$SCALAFMT_VERSION" != 'latest' ] ; then
    echo "Fetching scalafmt $SCALAFMT_VERSION..."
    SCALAFMT="/scalafmt-$SCALAFMT_VERSION"

    wget "https://github.com/scalameta/scalafmt/releases/download/v${SCALAFMT_VERSION}/scalafmt-linux-musl" -O "$SCALAFMT"
    chmod +x "$SCALAFMT"
fi

wget "https://github.com/stringbean/scalafmt-report/releases/download/v${SCALAFMT_REPORT_VERSION}/scalafmt-report-linux-musl" -O /scalafmt-report
chmod +x /scalafmt-report

cd "$GITHUB_WORKSPACE"

$SCALAFMT --non-interactive $ACTION $USE_GITIGNORE $COMPARE_BRANCH $SOURCE_PATH 2> failures.txt

RESULT=$?

if [ $RESULT -ne 0 ] ; then
    # dump errors
    /scalafmt-report failures.txt "$GITHUB_WORKSPACE"
fi

exit $RESULT