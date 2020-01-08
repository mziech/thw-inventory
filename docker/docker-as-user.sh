#!/bin/sh


dir=/work
uid=`stat -c '%u' $dir`
gid=`stat -c '%g' $dir`

echo "Using UID $uid, GID $gid"

groupadd --gid $gid group
useradd --uid $uid --gid $gid user
mkdir -p /home/user
chown user:group /home/user

ls -ld $dir

if [ $# -gt 0 ]; then
    exec su -c "$@" user
else
    exec su user
fi
