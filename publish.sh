#!/bin/bash

npm run build
aws s3 sync ./dist s3://sppr.soprachev.com \
  --cache-control "max-age=864000, public" \
  --endpoint-url=https://storage.yandexcloud.net/ \
  --delete \
  --profile soprachev-com