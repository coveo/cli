module.exports= {
  "extends": "../../../base.eslintrc.cjs",
  "overrides": [
    {
      "files": "stencil.config.ts",
      "rules": {
        "node/no-unpublished-import": "off"
      }
    }
  ]
}
