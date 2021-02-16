#!/bin/sh -e

SHORT_OPTS=v:f:b:g:p:

DEFAULT_VERSION=$(/bin/scalafmt --version | /usr/bin/cut -d' ' -f2)

OPTS=$(getopt --options $SHORT_OPTS --name "$0" -- "$@")

eval set -- "$OPTS"

SCALAFMT=/bin/scalafmt

SCALAFMT_VERSION="latest"
ACTION="--list"
USE_GITIGNORE=""
COMPARE_BRANCH=""
PATH=""

while true ; do
    case "$1" in
    -v)
        if [ "$2" != "$DEFAULT_VERSION" ] && [ "$2" != 'latest' ] ; then
            SCALAFMT_VERSION="$2"
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
        if [ "$2" == 'true' ] ; then
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
    SCALAFMT="scalafmt-$SCALAFMT_VERSION"

    PATH=/usr/bin wget "https://github.com/scalameta/scalafmt/releases/download/v${SCALAFMT_VERSION}/scalafmt-linux-musl" -O "$SCALAFMT"
    /bin/chmod +x "$SCALAFMT"
fi

$SCALAFMT --non-interactive $ACTION $USE_GITIGNORE $COMPARE_BRANCH $PATH
