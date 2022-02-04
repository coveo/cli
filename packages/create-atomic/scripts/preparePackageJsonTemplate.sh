#!/bin/bash

# Copy ./templates/package.json to ./templates/package.json.hbs, and:
#   * Replace name by "{{project}}"
#   * Add "postinstall": "npm run setup-lambda && npm run setup-cleanup" to the scripts
jq '.name="{{project}}" | .scripts.postinstall= "npm run setup-lambda && npm run setup-cleanup"' ./templates/package.json > ./templates/package.json.hbs