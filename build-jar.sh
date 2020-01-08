#!/bin/sh

set -eu

cd `dirname $0`

if [ -z "${BUILD_TAG:-}" ]; then
  BUILD_TAG=`uuidgen`
fi

echo "BUILD_TAG=$BUILD_TAG"
export BUILD_TAG
docker build --build-arg BUILD_TAG=$BUILD_TAG -t thw-inventory .

image=`docker images --filter "label=BUILD_TAG=$BUILD_TAG" --format "{{.ID}}"`
name="cnt_$BUILD_TAG"
docker run --name $name $image /bin/true
rm -rf target
docker cp $name:/work/target target
docker rm $name
