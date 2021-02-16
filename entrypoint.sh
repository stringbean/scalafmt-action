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
SOURCE_PATH=""

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
        branch=$(echo $2 | /bin/sed -e 's/^ *//g' -e 's/ *$//g')
        if [ ! -z "$branch" ] ; then
            COMPARE_BRANCH="--diff-branch $branch"
        fi
        shift 2
        ;;
    -g)
        echo "git fu? $2"
        opt=$(echo $2 | /bin/sed -e 's/^ *//g' -e 's/ *$//g')

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

    PATH=/usr/bin wget "https://github.com/scalameta/scalafmt/releases/download/v${SCALAFMT_VERSION}/scalafmt-linux-musl" -O "$SCALAFMT"
    /bin/chmod +x "$SCALAFMT"
fi

echo "switching to $GITHUB_WORKSPACE"
/usr/bin/file "$GITHUB_WORKSPACE/src"
cd "$GITHUB_WORKSPACE"
# TODO debug
# pwd
# /bin/ls -a
echo '--- branches? ---'
git --no-pager branch 
echo '--- branches ---'

echo '--- remote branches3? ---'
git --no-pager branch -a
echo '--- remote branches ---'

echo '--- and again 2 ----'
# /usr/bin/git branch -u origin/$GITHUB_BASE_REF $GITHUB_BASE_REF
git branch --track $GITHUB_BASE_REF origin/$GITHUB_BASE_REF 
git --no-pager branch -a
echo '--- ----'

export

# /bin/cat $(/usr/bin/find $PATH -name '*.scala' | /usr/bin/head)

echo
echo "  ref:      $GITHUB_REF"
echo "  base ref: $GITHUB_BASE_REF"
echo "  head ref: $GITHUB_HEAD_REF"
echo "  source path: $SOURCE_PATH"
echo
echo "RUNNING $SCALAFMT --non-interactive --debug --no-stderr $ACTION $USE_GITIGNORE $COMPARE_BRANCH $SOURCE_PATH"
echo "-------"

# end debug

$SCALAFMT --non-interactive $ACTION $USE_GITIGNORE $COMPARE_BRANCH $SOURCE_PATH | tee failures.txt

RESULT=$?

if [ $RESULT -ne 0 ] ; then
    # dump errors
    echo "::error ::files failed"
fi

exit $RESULT
# echo "successful fmt? $?"

# echo "---- stdout ----"
# cat stdout.log

# echo "---- stderr ----"
# cat stderr.log