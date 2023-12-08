#!/bin/bash

npm run build
aws --endpoint-url=https://storage.yandexcloud.net/ \
  s3 cp dist s3://sppr.soprachev.com/ \
  --recursive \
  --cache-control 'max-age=864000'