#!/bin/sh

if [ -z "$GITHUB_WORKSPACE" ] ; then
    echo "Missing GITHUB_WORKSPACE - ensure that source is checked out"
    exit 1
fi

SHORT_OPTS=v:f:b:g:p:` `
OPTS=$(getopt --options $SHORT_OPTS --name "$0" -- "$@")
eval set -- "$OPTS"

DEFAULT_VERSION=$(/bin/scalafmt --version | /usr/bin/cut -d' ' -f2)
SCALAFMT=/bin/scalafmt

SCALAFMT_VERSION="latest"
ACTION="--list"
USE_GITIGNORE=""
COMPARE_BRANCH=""
PATH=""

while true ; do
    case "$1" in
    -v)
        version=$(echo $2 | /bin/sed -e 's/^ *//g' -e 's/ *$//g')
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
        COMPARE_BRANCH="--diff-branch $2"
        shift 2
        ;;
    -g)
        echo "git fu? $2"
        opt=$(echo $2 | /bin/sed -e 's/^ *//g' -e 's/ *$//g')

        if [ "$opt" == 'true' ] ; then
        echo "gitter"
            USE_GITIGNORE="--git true"
        fi
        shift 2
        ;;
    -p)
        PATH="$2"
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

    PATH=/usr/bin wget "https://github.com/scalameta/scalafmt/releases/download/v${SCALAFMT_VERSION}/scalafmt-linux-musl" -O "$SCALAFMT"
    /bin/chmod +x "$SCALAFMT"
fi

echo "switching to $GITHUB_WORKSPACE"
/usr/bin/file "$GITHUB_WORKSPACE"
cd "$GITHUB_WORKSPACE"
# TODO debug
# pwd
# /bin/ls -a
# /usr/bin/git branch

# /bin/cat $(/usr/bin/find $PATH -name '*.scala' | /usr/bin/head)

echo
echo "  ref:      $GITHUB_REF"
echo "  base ref: $GITHUB_BASE_REF"
echo "  head ref: $GITHUB_HEAD_REF"
echo
echo "RUNNING $SCALAFMT --non-interactive --debug --no-stderr $ACTION $USE_GITIGNORE $COMPARE_BRANCH $PATH"
echo "-------"

# end debug

$SCALAFMT --non-interactive --debug --no-stderr $ACTION $USE_GITIGNORE $COMPARE_BRANCH $PATH

echo "successful fmt? $?"