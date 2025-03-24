# release-29 (2025-03-24)

# release-28 (2025-03-24)

# release-27 (2024-07-02)

# release-26 (2024-05-13)

# release-25 (2024-03-18)

### Bug Fixes

- resource type predicate ([#1454](https://github.com/coveo/cli/issues/1454)) ([caef795](https://github.com/coveo/cli/commits/caef795896402696b7eca6295c5cfccd1a504d82)), closes [#1453](https://github.com/coveo/cli/issues/1453)

# release-24 (2024-03-14)

### Bug Fixes

- **snapshot:** define resourceToPreview from resources changed. ([#1453](https://github.com/coveo/cli/issues/1453)) ([c4095f8](https://github.com/coveo/cli/commits/c4095f88c917dc79cf6600c0cd897fb30713c647))

# release-23 (2024-02-21)

# release-22 (2024-02-21)

# release-21 (2024-02-20)

### Bug Fixes

- sanitize access token when reading from stdin ([#1404](https://github.com/coveo/cli/issues/1404)) ([4db2b8c](https://github.com/coveo/cli/commits/4db2b8c40aef30aab7c38687a7df844082b68a61))

### Features

- **atomic:** add support for ngsp ([#1409](https://github.com/coveo/cli/issues/1409)) ([0602475](https://github.com/coveo/cli/commits/0602475c075348d7cc51ef55e1969012d1a1b485))
- **cli:** add support to associate a search hub when creating a search page ([#1417](https://github.com/coveo/cli/issues/1417)) ([278de45](https://github.com/coveo/cli/commits/278de45dfaa796bc4578ce931e45916d50036ba6))

# release-20 (2024-01-15)

### Bug Fixes

- **deps:** update dependency zod to v3.22.3 [security] j:cdx-227 ([#1330](https://github.com/coveo/cli/issues/1330)) ([0129dd4](https://github.com/coveo/cli/commits/0129dd4aa0be3b76bdeca683a1e15f142f4a516a))
- **snapshot:** ensure git author is known when committing ([#1405](https://github.com/coveo/cli/issues/1405)) ([1b653d8](https://github.com/coveo/cli/commits/1b653d8d290702c57c3738d858f1c429d09826dd))

# release-19 (2023-10-27)

### Bug Fixes

- only diff json files ([#1323](https://github.com/coveo/cli/issues/1323)) ([ae1361a](https://github.com/coveo/cli/commits/ae1361a4ca0f553103349ca436a309c61aa56732))

### Features

- add organization to event props ([#1325](https://github.com/coveo/cli/issues/1325)) ([3afcd0f](https://github.com/coveo/cli/commits/3afcd0f78112de9eae8f91218be3df01757f8d3e))
- **cli:** change node support to 18.18.1 ([#1332](https://github.com/coveo/cli/issues/1332)) ([54c6937](https://github.com/coveo/cli/commits/54c6937829685e1af20949f082b2de484fa1f6c6))
- **cli:** change node support to only 18-20 ([#1335](https://github.com/coveo/cli/issues/1335)) ([3e65207](https://github.com/coveo/cli/commits/3e6520737650901d2b176fadc8e2e56441a8d4da))
- **cli:** deprecate config:set region and environment ([#1331](https://github.com/coveo/cli/issues/1331)) ([341d5a7](https://github.com/coveo/cli/commits/341d5a70ab92c492ff653242dabf50f154192710))
- **cli:** node 20.9.0 lts ([#1337](https://github.com/coveo/cli/issues/1337)) ([af1c3ac](https://github.com/coveo/cli/commits/af1c3ac1796bdfd534b5d037f3a42e23aa3ab225))
- **cli:** use hidden prompt or stdin for auth:token command ([#1334](https://github.com/coveo/cli/issues/1334)) ([012b6a4](https://github.com/coveo/cli/commits/012b6a45adc474f1d10a8adf5a881eb9faf5e6e8))
- support imports from `/headless` ([#1326](https://github.com/coveo/cli/issues/1326)) ([d24bec4](https://github.com/coveo/cli/commits/d24bec48e5050ffdbba406fe130a7f7a83ca9b95))

### BREAKING CHANGES

- **cli:** those flags are no longer supported by the cli and the
  alternative is to re-execute a login flow with auth:login

This change is part of the effort for the next major release of the CLI
(v3)

# release-18 (2023-08-24)

### Bug Fixes

- **cli:** remove deploy.example ([#1321](https://github.com/coveo/cli/issues/1321)) ([a79e335](https://github.com/coveo/cli/commits/a79e335a4b476c011945b56f417e13cbd295cf0d))

# release-17 (2023-07-26)

### Bug Fixes

- **cli:** use ci-friendly confirm ([1a3aab5](https://github.com/coveo/cli/commits/1a3aab557b93039e59966b2c7595873b7adf754b))
- **deps:** update dependency semver to v7.5.2 [security] j:cdx-227 ([#1319](https://github.com/coveo/cli/issues/1319)) ([e4b92d7](https://github.com/coveo/cli/commits/e4b92d72be92057a7d2ef6708c1dea75814ae259))

### Features

- **cli-commons:** add ci-friendly confirm ([30db525](https://github.com/coveo/cli/commits/30db525a680d0f15ce9e0e9a8c71aabb701bde02))

# release-16 (2023-06-13)

### Bug Fixes

- **accd:** updates deps ([#1302](https://github.com/coveo/cli/issues/1302)) ([bebb09d](https://github.com/coveo/cli/commits/bebb09dca354cb33efaceffe844706d191a400c5))
- **cli:** use getPackageVersion for create-atomic-component-project ([#1293](https://github.com/coveo/cli/issues/1293)) ([b045bfe](https://github.com/coveo/cli/commits/b045bfe713e1d7de9cc921703019c339778bdf2b)), closes [#1292](https://github.com/coveo/cli/issues/1292) [#1292](https://github.com/coveo/cli/issues/1292)
- remove unnecessary `cd` instruction from success message ([#1303](https://github.com/coveo/cli/issues/1303)) ([f23c4eb](https://github.com/coveo/cli/commits/f23c4eb2d2b3fdf0c77e22f078396b76eadd32d1))
- remove unnecessary privilege ([#1301](https://github.com/coveo/cli/issues/1301)) ([db73b3b](https://github.com/coveo/cli/commits/db73b3bf0e569d7bd7d6063f1339f7214c64c90d))

### Features

- **accd:** handle errors from initializers in the CLI ([#1316](https://github.com/coveo/cli/issues/1316)) ([aee4429](https://github.com/coveo/cli/commits/aee4429bb83362a426ddb3f1f1f7b81c6b3be367))
- **commons:** add npf (Node Package Fork) ([#1312](https://github.com/coveo/cli/issues/1312)) ([9955ddd](https://github.com/coveo/cli/commits/9955ddde00b4c65db92ff9a0729e8039f7d9a902))
- **oauth:** swap default and fallback port ([#1305](https://github.com/coveo/cli/issues/1305)) ([3bf1e7a](https://github.com/coveo/cli/commits/3bf1e7a08872e3953d75450ba6e6edca7e713ad3))
- **organizationendpoints:** add support for organization endpoints for UI commands and projects ([#1289](https://github.com/coveo/cli/issues/1289)) ([3b7653d](https://github.com/coveo/cli/commits/3b7653dbf1b59015afb4575bd265ec0a91b2bcef))

# release-15 (2023-04-21)

### Bug Fixes

- **atomic:** don't need peerDeps ([#1294](https://github.com/coveo/cli/issues/1294)) ([8a7e7a9](https://github.com/coveo/cli/commits/8a7e7a9ae60b3837d2e3820d1af824756e4db549))

# release-14 (2023-04-21)

### Bug Fixes

- **atomic:** remove create- prefix when using npm init ([#1290](https://github.com/coveo/cli/issues/1290)) ([f32c9fa](https://github.com/coveo/cli/commits/f32c9fa2d359fb206105a8d4ea144e772a68d763))
- **atomic:** remove spinner in `atomic:cmp` ([#1291](https://github.com/coveo/cli/issues/1291)) ([68b4e06](https://github.com/coveo/cli/commits/68b4e0666924730e66986a8ddab4497dc27be3fb))
- **atomic:** use the initializer version from CLI ([#1292](https://github.com/coveo/cli/issues/1292)) ([339925b](https://github.com/coveo/cli/commits/339925b5f187a7673e4eab649c50f952497c0c71))
- **atomic:** wait for atomic to load/init on page component ([#1284](https://github.com/coveo/cli/issues/1284)) ([0113bf6](https://github.com/coveo/cli/commits/0113bf6e0b11cd47e6af988afc1434ea9f95cfbc))
- **cli-core,cli-source,ui-react:** enforce LTS ([#1275](https://github.com/coveo/cli/issues/1275)) ([46cfeb2](https://github.com/coveo/cli/commits/46cfeb24c70ea96467e1d705537790dfaa929957))
- **cli:** do not reassign fetch after polyfill ([#1271](https://github.com/coveo/cli/issues/1271)) ([85725f8](https://github.com/coveo/cli/commits/85725f8310e3395450b77c1a55939d7d9abfa3fe))
- **cli:** use proper package ([#1280](https://github.com/coveo/cli/issues/1280)) ([9324725](https://github.com/coveo/cli/commits/93247255d6d7d38265c7e62b7e3156f266fa7552))
- **hostedpages:** add explanation about changes done in the header of the local html pages ([#1263](https://github.com/coveo/cli/issues/1263)) ([5f2bfa4](https://github.com/coveo/cli/commits/5f2bfa49643f70461723c5dbd6d9c7f01fe68032))

### Features

- add confirmation message upon component creation ([#1270](https://github.com/coveo/cli/issues/1270)) ([e7294ce](https://github.com/coveo/cli/commits/e7294ce591b4c5b62ae63c3037b4ceb8c69f2d87))
- **atomic:** release of ACCD ([#1287](https://github.com/coveo/cli/issues/1287)) ([5ce3cda](https://github.com/coveo/cli/commits/5ce3cda28a7a68ec1cef34e49f60b8f1e82da4b0))
- **atomic:** remove beta tags ([#1283](https://github.com/coveo/cli/issues/1283)) ([4df0d2f](https://github.com/coveo/cli/commits/4df0d2fba2a182df78181e7611b880cf772358a9))
- sanitize custom component name on creation ([#1272](https://github.com/coveo/cli/issues/1272)) ([1c434b6](https://github.com/coveo/cli/commits/1c434b6c83fe688f37ff843c90aa01e84a5a1129))

### BREAKING CHANGES

- **atomic:** ACCD is now stable.

# release-13 (2023-04-05)

### Bug Fixes

- **atomic:** ensure error is properly printed ([#1233](https://github.com/coveo/cli/issues/1233)) ([8a58643](https://github.com/coveo/cli/commits/8a586432a5e08bdce82e4c36200cd49d8d14539e))
- **atomic:** simplify spinner+OK message ([#1235](https://github.com/coveo/cli/issues/1235)) ([8b9f537](https://github.com/coveo/cli/commits/8b9f537aef585c696d7f4934480238376645edef))
- missing secrets mapping ([#1247](https://github.com/coveo/cli/issues/1247)) ([9ab352d](https://github.com/coveo/cli/commits/9ab352de5e0dc640d68c166a8e189f1f7364ca2a))
- move readme one level higher ([#1230](https://github.com/coveo/cli/issues/1230)) ([25e56f5](https://github.com/coveo/cli/commits/25e56f554ba0307c643e30873328b7ab6d88f037))

### Features

- find pageId from name for update ([#1234](https://github.com/coveo/cli/issues/1234)) ([e79c766](https://github.com/coveo/cli/commits/e79c7661c39c114142dc0c56567fc1c75051f302))
- validate component element name ([#1203](https://github.com/coveo/cli/issues/1203)) ([ca54009](https://github.com/coveo/cli/commits/ca54009607fcf44fdb4087be1f8bb72e81230c40)), closes [#1205](https://github.com/coveo/cli/issues/1205) [#1207](https://github.com/coveo/cli/issues/1207)

# release-12 (2023-03-27)

### Bug Fixes

- **atomic:** add schemaVersion for deploy.json ([#1213](https://github.com/coveo/cli/issues/1213)) ([e7a6b2a](https://github.com/coveo/cli/commits/e7a6b2a02095522abdc25dc45544971956914e6d))
- **atomic:** generate search/analytics API key instead of impersonate API key ([#1135](https://github.com/coveo/cli/issues/1135)) ([02d4ceb](https://github.com/coveo/cli/commits/02d4ceb400bc150882b1a3869a9a15603aa2efdc))
- **cli-commons:** color orgId magenta only when on unix or WT ([#1143](https://github.com/coveo/cli/issues/1143)) ([82fd809](https://github.com/coveo/cli/commits/82fd809e43b36b9c160384b314abfe8b1ea76a75))
- **deps:** update all dependencies and jest snaps j:cdx-227 ([#1137](https://github.com/coveo/cli/issues/1137)) ([b72dc31](https://github.com/coveo/cli/commits/b72dc314043174ef9afaadb03e066c8830d7acc1)), closes [#1103](https://github.com/coveo/cli/issues/1103)
- **deps:** update all dependencies and jest snaps j:cdx-227 ([#1149](https://github.com/coveo/cli/issues/1149)) ([2f2273c](https://github.com/coveo/cli/commits/2f2273c7d86f2a2a8414ebbdf8cddb800c888e96)), closes [#1144](https://github.com/coveo/cli/issues/1144)

- chore!: forced major bump (#1190) ([ef0b861](https://github.com/coveo/cli/commits/ef0b86154beea6602746e8f7c5a70e017a2ef7c4)), closes [#1190](https://github.com/coveo/cli/issues/1190)

### Features

- add health-check as prepublish script ([#1169](https://github.com/coveo/cli/issues/1169)) ([bfcaf69](https://github.com/coveo/cli/commits/bfcaf69497a42c10a43c2dd0435a82313d04bcbc)), closes [#1190](https://github.com/coveo/cli/issues/1190)
- **cli-commons:** add beta decorators ([#1150](https://github.com/coveo/cli/issues/1150)) ([7b4c01f](https://github.com/coveo/cli/commits/7b4c01f8ec5e4dee7eecdeeb009c238c8f5c3e84))
- **cli:** implement atomic topic ([#1141](https://github.com/coveo/cli/issues/1141)) ([8e3ddd6](https://github.com/coveo/cli/commits/8e3ddd63f4bfdce745c86e42a6ee213802f915b2))
- **create-atomic:** adapt project to use ui:deploy instead of netlify ([#1131](https://github.com/coveo/cli/issues/1131)) ([97498ed](https://github.com/coveo/cli/commits/97498ed1ec2dcd4abfdbe992134cf5fcf18fd26b))
- implement health-check pre-publish script ([#1155](https://github.com/coveo/cli/issues/1155)) ([5efc79a](https://github.com/coveo/cli/commits/5efc79a6d17c8754c05da65db2c2c5dea0f857b8))
- improve custom component search page ([#1112](https://github.com/coveo/cli/issues/1112)) ([db1d2cb](https://github.com/coveo/cli/commits/db1d2cbf6bad6ecd3413e73d33d6ee400e5b8ade))

### BREAKING CHANGES

- bump to v1

# release-11 (2023-03-02)

# release-10 (2023-03-01)

### Bug Fixes

- **atomic:** do not track lambda symlink ([#1098](https://github.com/coveo/cli/issues/1098)) ([11f8c08](https://github.com/coveo/cli/commits/11f8c089025647663c8688d53a7cf970d076b9ac))
- **atomic:** support non-us regions ([#1097](https://github.com/coveo/cli/issues/1097)) ([f551210](https://github.com/coveo/cli/commits/f551210b86ad6108461a8f8be591956812da921a))
- **deps:** update all dependencies j:cdx-227 ([#1090](https://github.com/coveo/cli/issues/1090)) ([ae24142](https://github.com/coveo/cli/commits/ae24142d3ae4b68e04951301eb157f9e7ddb1095))
- **deps:** update all dependencies j:cdx-227 (major) ([#1054](https://github.com/coveo/cli/issues/1054)) ([03d4b34](https://github.com/coveo/cli/commits/03d4b3411164933fc0a25ca7aa3b3f644e8cdc08))
- **deps:** update oclif packages j:cdx-227 ([#1086](https://github.com/coveo/cli/issues/1086)) ([0a739f6](https://github.com/coveo/cli/commits/0a739f61b7f923e049c527c6e3f9749b81f9fb87))
- remove description field ([#1104](https://github.com/coveo/cli/issues/1104)) ([584f47d](https://github.com/coveo/cli/commits/584f47d8d9f341f23e13322802b2317c6b150448))
- **vue:** bad key in generated readme ([#1089](https://github.com/coveo/cli/issues/1089)) ([7d9bfe1](https://github.com/coveo/cli/commits/7d9bfe1903015794b80fd7dbbb6c9f9d909e5c77))

### Features

- **accd:** add custom-component generators ([#1101](https://github.com/coveo/cli/issues/1101)) ([01442cc](https://github.com/coveo/cli/commits/01442ccdb7065c1e9ca5852084f846f2814501d0))
- **deploy:** add new (but hidden) deploy command ([#1099](https://github.com/coveo/cli/issues/1099)) ([2080adb](https://github.com/coveo/cli/commits/2080adb5d8d59ae6d562475eaf42d3d572343324))
- **deploy:** release & document deploy command ([#1118](https://github.com/coveo/cli/issues/1118)) ([127dda4](https://github.com/coveo/cli/commits/127dda490c9ab4fe8ad3239e15063885d9be729f))
- **vue:** update to vite 4 and remove express ([#1088](https://github.com/coveo/cli/issues/1088)) ([6d17a33](https://github.com/coveo/cli/commits/6d17a33a143e7044467f48232e230e6aea9a1c0a))

# release-9 (2023-01-12)

### Bug Fixes

- **deps:** update dependency @oclif/core to v1.24.0 j:cdx-227 ([#1082](https://github.com/coveo/cli/issues/1082)) ([41f4867](https://github.com/coveo/cli/commits/41f4867afc0ac2c49b6d87c0d698377f47575912))
- **deps:** update oclif packages j:cdx-227 ([#1075](https://github.com/coveo/cli/issues/1075)) ([f36d1e8](https://github.com/coveo/cli/commits/f36d1e8213748252a12881c473f576ce8146f236))
- update organization flag ([#1076](https://github.com/coveo/cli/issues/1076)) ([85552b8](https://github.com/coveo/cli/commits/85552b864a08227d90c36bac4e1cf111913d24b0)), closes [#773](https://github.com/coveo/cli/issues/773)

### Features

- migrate to Atomic V2 ([#1074](https://github.com/coveo/cli/issues/1074)) ([50c2f3a](https://github.com/coveo/cli/commits/50c2f3acdeaaf605dde3a8bb3a0c400b35de26d8))

# release-8 (2022-12-14)

### Bug Fixes

- **deps:** update all dependencies j:cdx-227 ([#1053](https://github.com/coveo/cli/issues/1053)) ([f218b3f](https://github.com/coveo/cli/commits/f218b3f2d8070890da1501622f34b757cd2ad3d9))
- **deps:** update all dependencies j:cdx-227 ([#1066](https://github.com/coveo/cli/issues/1066)) ([12533ea](https://github.com/coveo/cli/commits/12533ea7c8182d183a7158945de742202eac0b69))
- **deps:** update oclif packages j:cdx-227 ([#1065](https://github.com/coveo/cli/issues/1065)) ([04d1a51](https://github.com/coveo/cli/commits/04d1a517a19642a29db93d3f5b869bba91558e98))

# release-7 (2022-12-06)

### Bug Fixes

- **angular:** project generation ([#1062](https://github.com/coveo/cli/issues/1062)) ([ecb15df](https://github.com/coveo/cli/commits/ecb15dfe96ed4fc79ddebe1a02d77b4f97e13e1f))

### Features

- **cli:** add fallback port for oauth ([#1063](https://github.com/coveo/cli/issues/1063)) ([f33c084](https://github.com/coveo/cli/commits/f33c0840d0ca8a8e4815ca21ed6ae5c0047a07aa)), closes [#1061](https://github.com/coveo/cli/issues/1061) [#1061](https://github.com/coveo/cli/issues/1061)

# release-6 (2022-11-29)

### Bug Fixes

- abort pending requests ([#1034](https://github.com/coveo/cli/issues/1034)) ([dba4502](https://github.com/coveo/cli/commits/dba450201295ec240dd9dfeae7f70a94fa9f959d))
- **cli:** ensure to stop action before calling more prints ([#1030](https://github.com/coveo/cli/issues/1030)) ([7efb42d](https://github.com/coveo/cli/commits/7efb42dd9fcaee793bb977c99b49d0759f9be7bb))
- **cli:** fix readme generation ([#1033](https://github.com/coveo/cli/issues/1033)) ([3fedfbc](https://github.com/coveo/cli/commits/3fedfbc5a0079f0d015add9fd96a8e844380158c))
- **cli:** fix sha acquisiton for windows signing ([#1031](https://github.com/coveo/cli/issues/1031)) ([dcc3131](https://github.com/coveo/cli/commits/dcc31317d4d8f2ad94d8744b0453262f6f93b0d3)), closes [#988](https://github.com/coveo/cli/issues/988)
- **cli:** print properly the command name. ([d4ec642](https://github.com/coveo/cli/commits/d4ec642c698484f9ea5f7f44dd84d638a143cdde))
- **deps:** update all dependencies j:cdx-227 ([#1032](https://github.com/coveo/cli/issues/1032)) ([e1ccdeb](https://github.com/coveo/cli/commits/e1ccdebcd1908b750df365961187013bc025ebdf))
- **deps:** update all dependencies j:cdx-227 ([#1036](https://github.com/coveo/cli/issues/1036)) ([1439a40](https://github.com/coveo/cli/commits/1439a406166f7342e1d91481e81de6c63a7b15f1))
- **deps:** update all dependencies to v15 j:cdx-227 (major) ([#1035](https://github.com/coveo/cli/issues/1035)) ([a99acd9](https://github.com/coveo/cli/commits/a99acd91579280f44decff15d817fbe377abae50))
- load region and environment from config ([#1050](https://github.com/coveo/cli/issues/1050)) ([f338ca8](https://github.com/coveo/cli/commits/f338ca81c27c07754afc168da97c9de8f507b676))

- chore(commons-dev)!: remove getFakeCommand ([74b8e29](https://github.com/coveo/cli/commits/74b8e29f79f6fd83bdacbc9c4e01afe2ea7a1c0c))

### Features

- **atomic:** reduce disk footprint of projects ([#1044](https://github.com/coveo/cli/issues/1044)) ([985ba50](https://github.com/coveo/cli/commits/985ba50692cde3523d370051b699624639ebd928))
- **commons:** add `identifier` to `CLICommand` ([85fc0df](https://github.com/coveo/cli/commits/85fc0df5b1e22083d485e9e3b4dc24c2f383986c))
- **commons:** add getFakeCommand ([aea76b9](https://github.com/coveo/cli/commits/aea76b9e0cd4317f0f6d28f17dc0f65f10564e64))

### BREAKING CHANGES

- `getFakeCommand` is now part of @coveo/cli-commons
  https://coveord.atlassian.net/browse/CDX-779

# release-5 (2022-11-15)

### Bug Fixes

- **cli:** support prerelease for ui package version resolution ([#1029](https://github.com/coveo/cli/issues/1029)) ([06d4846](https://github.com/coveo/cli/commits/06d4846b3a13240b46c72adee67a340ce9275dd9))
- **deps:** update all dependencies j:cdx-227 ([#1015](https://github.com/coveo/cli/issues/1015)) ([0b6a70b](https://github.com/coveo/cli/commits/0b6a70b0c1539648ea3a24eefc8fb01b5b7173db))
- **deps:** update all dependencies j:cdx-227 ([#1022](https://github.com/coveo/cli/issues/1022)) ([e181d70](https://github.com/coveo/cli/commits/e181d700e19445bf912b3ecd370f7eabdb777d71))
- **deps:** update all dependencies j:cdx-227 ([#1026](https://github.com/coveo/cli/issues/1026)) ([c6ca8dd](https://github.com/coveo/cli/commits/c6ca8ddf8dde39eb69cd99da3e9d897db873e4c6))
- **deps:** update dependency npm to v9 j:cdx-227 ([#1023](https://github.com/coveo/cli/issues/1023)) ([24075d7](https://github.com/coveo/cli/commits/24075d7e30725d1c8789873059b5d902efbd6f3f))
- **gha:** replace set-output ([#1013](https://github.com/coveo/cli/issues/1013)) ([6916f10](https://github.com/coveo/cli/commits/6916f10359b6d7d77631d041f1fdd1702109bf72))

- feat(cli)!: migrate to vue3 ([eacd667](https://github.com/coveo/cli/commits/eacd6677e319d67074b15e8f02bcdb41975e8635))
- feat(vue)!: migrate to vue3 ([e19d35e](https://github.com/coveo/cli/commits/e19d35eb60ebaaa3ff99956b1ef5e4233a1be63c))

### Features

- add examples on `org:resources:*` commands ([#997](https://github.com/coveo/cli/issues/997)) ([67d72b9](https://github.com/coveo/cli/commits/67d72b909cd6d76b86344a0cf1299622c4743727))
- add summary after document push ([#999](https://github.com/coveo/cli/issues/999)) ([edde75c](https://github.com/coveo/cli/commits/edde75c0fee667a86c21be8440b24118a95d3831))
- update to node 18 ([#993](https://github.com/coveo/cli/issues/993)) ([335a026](https://github.com/coveo/cli/commits/335a026e0cc0af9bdef13390e512540ebc337d22))

### BREAKING CHANGES

- `ui:create:vue` command now scaffold a vue3+vite project

https://coveord.atlassian.net/browse/CDX-813

- Deprecate vue2 plugin
- v1 release of vue3 npm initializer package

https://coveord.atlassian.net/browse/CDX-813

# release-4 (2022-10-18)

# release-3 (2022-10-14)

# release-2 (2022-10-13)

### Bug Fixes

- adjust crafted Admin UI url ([#975](https://github.com/coveo/cli/issues/975)) ([70fb7a4](https://github.com/coveo/cli/commits/70fb7a46f56e383c7121f080a5639b058fda5334))
- clean API error message ([#967](https://github.com/coveo/cli/issues/967)) ([38e4faa](https://github.com/coveo/cli/commits/38e4faa4fbc6b8a7472b578ca656db4967137ba4))
- ensure flags are applied to `org:resources:list` command ([#977](https://github.com/coveo/cli/issues/977)) ([7c011b0](https://github.com/coveo/cli/commits/7c011b0bc645023bf1c18c077c3e1a30b2f328a4))

- feat(cli-commons)!: remove message opt from stopSpinner ([2ab3536](https://github.com/coveo/cli/commits/2ab3536bf7b2f0d9615c335e8120f880aefb3ef9))

### Features

- **cli-commons/cli-plugin-source/cli:** standardize orgId printing ([#951](https://github.com/coveo/cli/issues/951)) ([f26bfda](https://github.com/coveo/cli/commits/f26bfda01c7d4dd5d300264a5710da33e02856ff))
- **cli:** ensure user is webauth-ed for ui cmds ([#963](https://github.com/coveo/cli/issues/963)) ([2a0840c](https://github.com/coveo/cli/commits/2a0840c912a3c965a40ebe37362624af8222c2e7))
- **cli:** improve auth:login final feedback ([#961](https://github.com/coveo/cli/issues/961)) ([ae0c36e](https://github.com/coveo/cli/commits/ae0c36e55ef95c0ee5f64b75eb090e3a71a7808e))
- **cli:** use only b when pull is completed ([be54937](https://github.com/coveo/cli/commits/be54937cd412b62332dedced7ff838722b0062d1))
- handle missing domain privileges ([#953](https://github.com/coveo/cli/issues/953)) ([2ca1a80](https://github.com/coveo/cli/commits/2ca1a8014672e96e369b34a19be630f9d525b29b))
- return resource types within project ([#952](https://github.com/coveo/cli/issues/952)) ([7b2facf](https://github.com/coveo/cli/commits/7b2facfff9df52de508a5791c080301937a79c40))

### BREAKING CHANGES

- Removed message from the options of stopSpinner

# release-1 (2022-09-21)

### Bug Fixes

- **deps:** update all dependencies j:cdx-227 ([#897](https://github.com/coveo/cli/issues/897)) ([c7c026e](https://github.com/coveo/cli/commits/c7c026e4ebf8ff8c4ad36352ad69d086ceabc394))
- **deps:** update all dependencies j:cdx-227 ([#933](https://github.com/coveo/cli/issues/933)) ([31e5658](https://github.com/coveo/cli/commits/31e5658f05c8aa2f45b9c6f0da716d624eb2b9da))
- **deps:** update all dependencies j:cdx-227 ([#940](https://github.com/coveo/cli/issues/940)) ([dbc402e](https://github.com/coveo/cli/commits/dbc402e2952cbeb55457c49a7f01b44e646b373c))
- update ux symbol ([#931](https://github.com/coveo/cli/issues/931)) ([ff38431](https://github.com/coveo/cli/commits/ff384317bc1acbb30bf916e5d55ada2e68fa32ee))

### Features

- standardize CLI commands and errors ([#930](https://github.com/coveo/cli/issues/930)) ([d247ab1](https://github.com/coveo/cli/commits/d247ab1dbe541d65821971924e9161578483fedc))

## v1.35.12 (2022-09-09)

## v1.35.11 (2022-09-08)

## v1.35.10 (2022-09-07)

### Bug Fixes

- **cli:** parse region flag ([#919](https://github.com/coveo/cli/issues/919)) ([1321ed5](https://github.com/coveo/cli/commits/1321ed5c1db20f9e735097caedeb5e33c31eaf70))

## v1.35.9 (2022-08-30)

### Bug Fixes

- **cli:** fix source plugin import ([#907](https://github.com/coveo/cli/issues/907)) ([d5b93a3](https://github.com/coveo/cli/commits/d5b93a3ce24910118da9f5d12eaa1e6c77e9d75e))

## v1.35.8 (2022-08-29)

### Bug Fixes

- deploy in hipaa ([#900](https://github.com/coveo/cli/issues/900)) ([8d93952](https://github.com/coveo/cli/commits/8d93952c2f10f4b589aea100c6f20350375a14bf))

### Features

- add plugin support ([#892](https://github.com/coveo/cli/issues/892)) ([05ac35e](https://github.com/coveo/cli/commits/05ac35e345a722c6d1102891508ebeacdbe6f9bd))
- **cli:** extract source into a plugin ([#899](https://github.com/coveo/cli/issues/899)) ([1797049](https://github.com/coveo/cli/commits/17970490e7844315373827f44ef8dd80f4c0181a))

## v1.34.3 (2022-08-19)

### Bug Fixes

- **dump:** remove recursion ([#893](https://github.com/coveo/cli/issues/893)) ([2038be8](https://github.com/coveo/cli/commits/2038be81b4d47d6b1d0fab954e9511f1a6e98329))

## v1.34.2 (2022-08-17)

## v1.34.1 (2022-08-12)

# v1.34.0 (2022-08-10)

### Features

- **create-atomic:** replace variables for continious deployment ([#879](https://github.com/coveo/cli/issues/879)) ([df7c7bf](https://github.com/coveo/cli/commits/df7c7bfb8d9953d3479afeb62d4d8073057a5cab))

## v1.33.1 (2022-08-04)

# v1.33.0 (2022-07-26)

### Bug Fixes

- correctly support `--snapshotId` flag ([#866](https://github.com/coveo/cli/issues/866)) ([ec9344f](https://github.com/coveo/cli/commits/ec9344f7e9949eac9939518823baf5fa9e537e96))
- remove synchronization logic from CLI ([#867](https://github.com/coveo/cli/issues/867)) ([eae032a](https://github.com/coveo/cli/commits/eae032a68a8be5a75147b0c962228b048ea0b158))

### Features

- **analytics:** add org identifiers + unhash employee emails ([#871](https://github.com/coveo/cli/issues/871)) ([bbb6310](https://github.com/coveo/cli/commits/bbb6310b124005aefd2d6aabdd5d841974dfd452))
- **analytics:** always track ([#870](https://github.com/coveo/cli/issues/870)) ([da4bd10](https://github.com/coveo/cli/commits/da4bd102c7875222300c3fa01565bacac91dd392))
- **analytics:** remove persistent analytics identifers ([#869](https://github.com/coveo/cli/issues/869)) ([236cf0f](https://github.com/coveo/cli/commits/236cf0f9052c466b16dd80f263d5761dc9b7d9ec))
- **cli:** remove beta tag for snapshot ([#873](https://github.com/coveo/cli/issues/873)) ([ffcf833](https://github.com/coveo/cli/commits/ffcf833d5ba363ba5def98f06c67d1cf34cb1810))

## v1.32.1 (2022-07-13)

# v1.32.0 (2022-07-13)

### Bug Fixes

- **deps:** update all dependencies j:cdx-227 ([#854](https://github.com/coveo/cli/issues/854)) ([cd042cc](https://github.com/coveo/cli/commits/cd042cc9d08898a9cad39c644a99fa0dd64ba77a))

### Features

- remove skipPreview flag ([#860](https://github.com/coveo/cli/issues/860)) ([579fcba](https://github.com/coveo/cli/commits/579fcba4a2127cfdc8213fcc976453f4642e7940))
- remove sync flag ([#859](https://github.com/coveo/cli/issues/859)) ([352306d](https://github.com/coveo/cli/commits/352306dae8417ae5ffb56f73f0cea3f0a7a8e650))

# v1.31.0 (2022-06-29)

### Bug Fixes

- **e2e:** dummyServer waitOn port to be free ([#844](https://github.com/coveo/cli/issues/844)) ([0db4282](https://github.com/coveo/cli/commits/0db428262ad3377aab78b7f95f72a1b23a206c4d))
- **snapshot:** do not delete snapshot when provided with the flag ([#840](https://github.com/coveo/cli/issues/840)) ([4ca2807](https://github.com/coveo/cli/commits/4ca28071e2e1b0c9afc813e7d246b92e55f3384e))
- **snapshot:** ignore error if file is already unexisting ([#833](https://github.com/coveo/cli/issues/833)) ([e2711f3](https://github.com/coveo/cli/commits/e2711f39f952127863071e169fe70287616dbc9e))
- **snapshot:** use `/apply` URL for error ([#832](https://github.com/coveo/cli/issues/832)) ([28394c2](https://github.com/coveo/cli/commits/28394c2bd96a64296efb66097263f7308566f5cd))
- verify org with appropriate region and env ([#848](https://github.com/coveo/cli/issues/848)) ([8cbfded](https://github.com/coveo/cli/commits/8cbfded119d34486068525658f2242e4dd613589))

### Features

- **angular:** update to angular 14 ([#830](https://github.com/coveo/cli/issues/830)) ([9866d07](https://github.com/coveo/cli/commits/9866d075238b45dee9ac8cfd58df21abdbc93e7b))
- **cli:** restrict Node versions ([#837](https://github.com/coveo/cli/issues/837)) ([0cae6ec](https://github.com/coveo/cli/commits/0cae6ece32eadf2ae1c56324c68033b7f973d401))
- handle invalid field names ([#786](https://github.com/coveo/cli/issues/786)) ([0516e16](https://github.com/coveo/cli/commits/0516e164466549b78cc70c3cb3fb32530b7e3437))
- **snapshot:** add `deletionScope` on `/apply` ([#849](https://github.com/coveo/cli/issues/849)) ([7b7fcb2](https://github.com/coveo/cli/commits/7b7fcb2ed1d0fc73d0ee7500c91aed85fbfd0dc6))
- **snapshot:** remove -d from push ([#843](https://github.com/coveo/cli/issues/843)) ([5fd6209](https://github.com/coveo/cli/commits/5fd62091933c610cc55f1d810ee22827e3a16fc5))
- **snapshot:** remove ml resources ([#847](https://github.com/coveo/cli/issues/847)) ([7584ac4](https://github.com/coveo/cli/commits/7584ac406399d37d1bc739e86142a6d9223d55e9))
- **snapshot:** remove sync from CLI ([#842](https://github.com/coveo/cli/issues/842)) ([45b3c32](https://github.com/coveo/cli/commits/45b3c32c8e4118963f25f43f6e3a1a6aca3aff01))
- **snapshot:** support new snapshot report contract ([#834](https://github.com/coveo/cli/issues/834)) ([9e38506](https://github.com/coveo/cli/commits/9e385068de50ef893ae0a79c4039ff660367bf35))

# v1.30.0 (2022-06-09)

### Bug Fixes

- **dump:** csv header should have all fields associated with the source ([#828](https://github.com/coveo/cli/issues/828)) ([8f6449f](https://github.com/coveo/cli/commits/8f6449f0c8ffa830e542f3a5b33e3ba67684175e))

### Features

- **atomic:** create impersonate key inside create-atomic instead ([#827](https://github.com/coveo/cli/issues/827)) ([9178ab1](https://github.com/coveo/cli/commits/9178ab136ed7886bdf711312e8415bef30a2fa2d))
- **create-atomic:** display npm install error details to user ([#821](https://github.com/coveo/cli/issues/821)) ([0870918](https://github.com/coveo/cli/commits/0870918aa32c080bb66f19b84a20c74660b3406e))
- **dump:** add automatic request size backoff ([#829](https://github.com/coveo/cli/issues/829)) ([334f277](https://github.com/coveo/cli/commits/334f277535c5f314bd8b3d3f50c7cd99ce4250ae))

## v1.29.4 (2022-06-07)

## v1.29.3 (2022-06-06)

## v1.29.2 (2022-06-03)

## v1.29.1 (2022-06-03)

### Bug Fixes

- **atomic:** remove create-atomic-template from the dependencies ([#809](https://github.com/coveo/cli/issues/809)) ([dccc5b1](https://github.com/coveo/cli/commits/dccc5b1e6a6463de35b537b7549218bb6095337c))
- **cli:** replace qa by stg ([#811](https://github.com/coveo/cli/issues/811)) ([7a47f9b](https://github.com/coveo/cli/commits/7a47f9b035b4902b5e8fc4234b8eb223bc6cecd4))
- **create-atomic:** download prompt selected hosted page ([#810](https://github.com/coveo/cli/issues/810)) ([f525ffb](https://github.com/coveo/cli/commits/f525ffb3d502a7a1080481f64b403d60ae4c1933))

# v1.29.0 (2022-05-31)

### Bug Fixes

- **dump:** handle rowid fields in org:search:dump ([#806](https://github.com/coveo/cli/issues/806)) ([927333d](https://github.com/coveo/cli/commits/927333de5a1998f02f9ebd62df0a8f78e56de81f))

### Features

- **create-atomic:** allow Coveo atomic to start from an existing Platform Search page ([#728](https://github.com/coveo/cli/issues/728)) ([340fe4a](https://github.com/coveo/cli/commits/340fe4af779ff87730f3a9964272f7a50561ee39))

## v1.28.1 (2022-05-24)

# v1.28.0 (2022-05-24)

### Bug Fixes

- add precondition check on source creation ([#762](https://github.com/coveo/cli/issues/762)) ([a782aa6](https://github.com/coveo/cli/commits/a782aa695fd810d869752515ed4551555fc7a90f))
- **deps:** update all dependencies j:cdx-227 ([#765](https://github.com/coveo/cli/issues/765)) ([e5524a4](https://github.com/coveo/cli/commits/e5524a4d1dab8b0c71fb94a2b654c79e2c961419))
- **deps:** update all dependencies j:cdx-227 ([#790](https://github.com/coveo/cli/issues/790)) ([2843a12](https://github.com/coveo/cli/commits/2843a125bd27f19eaac4dba7171d55a1e2d250cd))
- **precond:** use new flag name ([#780](https://github.com/coveo/cli/issues/780)) ([8e63899](https://github.com/coveo/cli/commits/8e63899ac48803b588a4ba37643cfaf64b697c31))
- **react:** add null check on `root` ([#782](https://github.com/coveo/cli/issues/782)) ([cf8a3d9](https://github.com/coveo/cli/commits/cf8a3d98d4926f9c88d40255112f06193366cd97))
- **snapshot:** reporter considers fixable reports for onSuccess callback ([#779](https://github.com/coveo/cli/issues/779)) ([b8f1784](https://github.com/coveo/cli/commits/b8f178428705887dd9398da367449176d79816ba))
- **vault:** ensure prompt is readable ([#792](https://github.com/coveo/cli/issues/792)) ([894dba0](https://github.com/coveo/cli/commits/894dba09caf58643452e9969806639395568f2d2))

### Features

- allow user to fill in their missing vault entries ([#778](https://github.com/coveo/cli/issues/778)) ([ac27867](https://github.com/coveo/cli/commits/ac27867f4e441485bbb5c1888435dd75da29e1d4))
- introduce the files flag ([#783](https://github.com/coveo/cli/issues/783)) ([c2e472c](https://github.com/coveo/cli/commits/c2e472ce4992ee9b81e1a609b13abbbb225bbd1e))
- list catalog and sources ([#750](https://github.com/coveo/cli/issues/750)) ([3903a5c](https://github.com/coveo/cli/commits/3903a5c48e6c8c95b3bc0892566a969b55208b8a))
- **snapshot:** add manifest file on pull ([#777](https://github.com/coveo/cli/issues/777)) ([af3c783](https://github.com/coveo/cli/commits/af3c783243d78a60521b357bd7a76336bf8527fa))
- **snapshot:** add snapshot type labels ([#793](https://github.com/coveo/cli/issues/793)) ([485fab9](https://github.com/coveo/cli/commits/485fab9f2f69f88d3e92c799341cac9a7f188708))
- **snapshot:** add vault error handling ([#766](https://github.com/coveo/cli/issues/766)) ([9de943e](https://github.com/coveo/cli/commits/9de943e37b2c0491acb00a0620a77eb80231d68f))
- support stream API ([#749](https://github.com/coveo/cli/issues/749)) ([0539af7](https://github.com/coveo/cli/commits/0539af78205445bc9e0060bfe4123697bafa192c))
- **vault:** offer transfer from origin org to dest org ([#785](https://github.com/coveo/cli/issues/785)) ([cdde892](https://github.com/coveo/cli/commits/cdde892c39f099fa99ad113ccae4f37988165252))

## v1.27.1 (2022-04-20)

### Bug Fixes

- **deps:** update all dependencies j:cdx-227 ([#757](https://github.com/coveo/cli/issues/757)) ([0277354](https://github.com/coveo/cli/commits/027735409555eafa1c208bcd8aef02a36cd22847))
- **deps:** update all dependencies j:cdx-227 ([#758](https://github.com/coveo/cli/issues/758)) ([e381804](https://github.com/coveo/cli/commits/e381804d509cef83a3ec6ef7a39995a4d5c38bd4))

# v1.27.0 (2022-04-14)

### Bug Fixes

- **create-atomic:** prevent Atomic/Headless version mismatch & use installed Atomic version ([#753](https://github.com/coveo/cli/issues/753)) ([916240a](https://github.com/coveo/cli/commits/916240afc50d0265987e0f3f38cf887dcb2a4c70))

### Features

- add privileges preconditions on push command ([#702](https://github.com/coveo/cli/issues/702)) ([f50510a](https://github.com/coveo/cli/commits/f50510a83dd5685caca72368dcf6deb7abc93f46))
- add source status update ([#658](https://github.com/coveo/cli/issues/658)) ([a590e9c](https://github.com/coveo/cli/commits/a590e9c1fb747b73bb0a4c0a0c347ce9557cbe87))
- create missing fields for `source:push:add` command ([#699](https://github.com/coveo/cli/issues/699)) ([12cb24b](https://github.com/coveo/cli/commits/12cb24b1151cc15fae8abd84d221d1e731d1a2a7))
- support different regions and environments for push ([#703](https://github.com/coveo/cli/issues/703)) ([41c2579](https://github.com/coveo/cli/commits/41c2579ad9f960754ded74b4a4ec39cb291dab8b))

## v1.26.1 (2022-04-01)

# v1.26.0 (2022-03-31)

### Bug Fixes

- add `allowNo` option on `source:push:delete` command ([#646](https://github.com/coveo/cli/issues/646)) ([3555920](https://github.com/coveo/cli/commits/35559202222486e1780ee6f152376c9208509833))
- **angular:** unpin dependencies ([#688](https://github.com/coveo/cli/issues/688)) ([ceab0bc](https://github.com/coveo/cli/commits/ceab0bc3502d5a20deb3fd22953783dda2dd277e))
- **atomic:** make sure Stencil start on the good port ([#697](https://github.com/coveo/cli/issues/697)) ([662746c](https://github.com/coveo/cli/commits/662746cc87e877847ea596d50096fe84e1448a44))
- **atomic:** use .mjs ([#707](https://github.com/coveo/cli/issues/707)) ([ba3a9df](https://github.com/coveo/cli/commits/ba3a9df0c9ad467e60c7d55b59470c631cd8c50c))
- **deps:** update all dependencies j:cdx-227 ([#666](https://github.com/coveo/cli/issues/666)) ([09ea2e7](https://github.com/coveo/cli/commits/09ea2e7fd0bac33f2c2c1e91fa5d77adca159aa0))
- **deps:** update all dependencies j:cdx-227 ([#723](https://github.com/coveo/cli/issues/723)) ([88a18fd](https://github.com/coveo/cli/commits/88a18fdc3f035959a3ad13bb1aa30289a53bff72))
- **deps:** update all dependencies j:cdx-227 ([#731](https://github.com/coveo/cli/issues/731)) ([dbd0e96](https://github.com/coveo/cli/commits/dbd0e96dae656ffb156f62dabaa363be1997e145))
- do not prompt on CI ([#721](https://github.com/coveo/cli/issues/721)) ([40c02a3](https://github.com/coveo/cli/commits/40c02a3288a1cf839f226e8eff0e4db611ace5c3))
- **pull:** use SPM orgId for privilege preconditions ([#708](https://github.com/coveo/cli/issues/708)) ([4caa0e2](https://github.com/coveo/cli/commits/4caa0e243847d2751bf7dc18e44849e1f67f2b2a))
- **react:** major dep updates + react 17 lock ([#730](https://github.com/coveo/cli/issues/730)) ([b7de6b2](https://github.com/coveo/cli/commits/b7de6b2ffc77a18e79cf618d0906d4b2b1707288))
- **templates:** update ui project templates to use interactive result headless controller ([#724](https://github.com/coveo/cli/issues/724)) ([cfe5c9d](https://github.com/coveo/cli/commits/cfe5c9d8f6b74bccbe8b95e38f00ef30900e0bd5))
- **ui:** generate username for API key authenticated user ([#706](https://github.com/coveo/cli/issues/706)) ([2765817](https://github.com/coveo/cli/commits/276581760d4ace7e3e97d128f35bc611af8b8d4b))

### Features

- add Stencil + Netlify port management ([#689](https://github.com/coveo/cli/issues/689)) ([1a66474](https://github.com/coveo/cli/commits/1a664741075ac633da465005bca2cfd7ca144c1d))

## v1.25.3 (2022-02-18)

## v1.25.2 (2022-02-18)

## v1.25.1 (2022-02-17)

### Bug Fixes

- **oclif:** patch oclif to work with npm workspaces ([#677](https://github.com/coveo/cli/issues/677)) ([cd8bdc2](https://github.com/coveo/cli/commits/cd8bdc25ee3a3a02f9a7a502e477f188da968ba8))

# v1.25.0 (2022-02-16)

### Bug Fixes

- **angular:** rework template to reduce InputChanges ([#641](https://github.com/coveo/cli/issues/641)) ([87a9446](https://github.com/coveo/cli/commits/87a944652b8be45589979d2a87c3cd85d90a5763))
- **build:** npm setup->npm i([#642](https://github.com/coveo/cli/issues/642)) ([6bc58d8](https://github.com/coveo/cli/commits/6bc58d863861f7d2ee4e78b1899a288bdd6fff4b))
- **cli:** no more patches bundled ([#630](https://github.com/coveo/cli/issues/630)) ([7f0c272](https://github.com/coveo/cli/commits/7f0c272d66ef58ee90b45603e9e1108ac4a34c56))
- **deps:** update all dependencies j:cdx-227 ([#623](https://github.com/coveo/cli/issues/623)) ([72d6fde](https://github.com/coveo/cli/commits/72d6fde0affc22b0c6263edbd6dcb8642e60f894))
- **search token server:** add express security plugins ([#624](https://github.com/coveo/cli/issues/624)) ([7b88321](https://github.com/coveo/cli/commits/7b88321a60d8f31aff287e6054e1944158c08627))

### Features

- bump `push-api-client` package ([#618](https://github.com/coveo/cli/issues/618)) ([8770129](https://github.com/coveo/cli/commits/87701295ac92fe06ba71d5d82fdd62583fd6851c))
- turn create-atomic into a Stencil project ([#620](https://github.com/coveo/cli/issues/620)) ([10d8f80](https://github.com/coveo/cli/commits/10d8f80969c051dd7520ea9b8a48dc014e238195))

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.24.1](https://coveo-cli/coveo/cli/compare/v1.24.0...v1.24.1) (2022-01-18)

**Note:** Version bump only for package cli-tools

# [1.24.0](https://coveo-cli/coveo/cli/compare/v1.23.3...v1.24.0) (2022-01-18)

### Bug Fixes

- **cli:** add org:resources: topic ([#615](https://coveo-cli/coveo/cli/issues/615)) ([394aebd](https://coveo-cli/coveo/cli/commits/394aebdabbd665c3fa955a842ecf8c8808bcf518))
- **cli:** unhid org:resources:create command ([#616](https://coveo-cli/coveo/cli/issues/616)) ([91f6f0c](https://coveo-cli/coveo/cli/commits/91f6f0c61b0ddda141e7d8f349c1e40653b7175b))
- **deps:** update all dependencies j:cdx-227 ([#619](https://coveo-cli/coveo/cli/issues/619)) ([8c739f8](https://coveo-cli/coveo/cli/commits/8c739f870b94a6ba3d1adc847b4dea8f1bb4b05f))

### Features

- **cli:** fill up organization of .coveo/settings.json automatically ([#617](https://coveo-cli/coveo/cli/issues/617)) ([0c02d7b](https://coveo-cli/coveo/cli/commits/0c02d7b7c93e4b3dd6b22903bffea593a290a7e1))

## [1.23.3](https://coveo-cli/coveo/cli/compare/v1.23.2...v1.23.3) (2022-01-14)

**Note:** Version bump only for package cli-tools

## [1.23.2](https://coveo-cli/coveo/cli/compare/v1.23.1...v1.23.2) (2022-01-13)

### Bug Fixes

- **deps:** update all dependencies j:cdx-227 ([#609](https://coveo-cli/coveo/cli/issues/609)) ([f7d0f95](https://coveo-cli/coveo/cli/commits/f7d0f95c7578b12f462b120b6f56d10d252a072d))

## [1.23.1](https://coveo-cli/coveo/cli/compare/v1.23.0...v1.23.1) (2022-01-12)

**Note:** Version bump only for package cli-tools

# [1.23.0](https://coveo-cli/coveo/cli/compare/v1.22.2...v1.23.0) (2022-01-12)

### Bug Fixes

- **deps:** update all dependencies j:cdx-227 ([#605](https://coveo-cli/coveo/cli/issues/605)) ([c7ffa16](https://coveo-cli/coveo/cli/commits/c7ffa162b862dd2790506976b6a0c49bc9b7b5f6))
- limit concurrent promises on `source:push` ([#559](https://coveo-cli/coveo/cli/issues/559)) ([f617ba6](https://coveo-cli/coveo/cli/commits/f617ba6f3715c1babf1005bd577888eec5acc0b6))
- remove org info from user properties ([#591](https://coveo-cli/coveo/cli/issues/591)) ([a999f91](https://coveo-cli/coveo/cli/commits/a999f91cf6c1d089240137646d107c09ecd6ac34))
- set anonymous to false on `auth:login` ([#600](https://coveo-cli/coveo/cli/issues/600)) ([f0b5427](https://coveo-cli/coveo/cli/commits/f0b5427ee55d0d1af6a38ae03bc18d0d807783e8))
- track cli version from global config ([#592](https://coveo-cli/coveo/cli/issues/592)) ([483254c](https://coveo-cli/coveo/cli/commits/483254cbc7f49313b4452614cc8efb53e0130240))
- update `deleteOlderThan` helpValue ([#575](https://coveo-cli/coveo/cli/issues/575)) ([7708ee7](https://coveo-cli/coveo/cli/commits/7708ee73bd05f60d47500ef77cc450836f91cccc))
- use latest version of `create react-app` ([#594](https://coveo-cli/coveo/cli/issues/594)) ([f3e2ecc](https://coveo-cli/coveo/cli/commits/f3e2ecc85002eb575c91e50e23fd88fe75e2bd37))

### Features

- add command to create Snapshot Pull Model ([#596](https://coveo-cli/coveo/cli/issues/596)) ([57a09d8](https://coveo-cli/coveo/cli/commits/57a09d899fbc58ee9eae43d926075a61d3ab0c94))
- **cli:** add support for SPM on `org:config:pull` ([#595](https://coveo-cli/coveo/cli/issues/595)) ([ba05979](https://coveo-cli/coveo/cli/commits/ba05979e2bd830d1f6a748917d75c9b68eb9e8f2))
- **snapshot:** release snapshot commands into beta ([#602](https://coveo-cli/coveo/cli/issues/602)) ([98fa935](https://coveo-cli/coveo/cli/commits/98fa9357df49e60a7e9408fd2c07c9e8cded895d))
- track confirm actions ([#599](https://coveo-cli/coveo/cli/issues/599)) ([1c06bd9](https://coveo-cli/coveo/cli/commits/1c06bd9cf8925ed4d9cdf68bbf747f6309b0d26c))
- track os and shell data ([#593](https://coveo-cli/coveo/cli/issues/593)) ([a898e13](https://coveo-cli/coveo/cli/commits/a898e135f6ad85e055d0df5284f088b83aae5d6a))
- track other license types ([#603](https://coveo-cli/coveo/cli/issues/603)) ([c5156a4](https://coveo-cli/coveo/cli/commits/c5156a48368f63db3bd6b3fa467d78a2105f9808))

## [1.22.2](https://coveo-cli/coveo/cli/compare/v1.22.1...v1.22.2) (2021-12-09)

**Note:** Version bump only for package cli-tools

## [1.22.1](https://coveo-cli/coveo/cli/compare/v1.22.0...v1.22.1) (2021-12-09)

**Note:** Version bump only for package cli-tools

# [1.22.0](https://coveo-cli/coveo/cli/compare/v1.21.3...v1.22.0) (2021-12-08)

### Bug Fixes

- **atomic:** always use npm ([#584](https://coveo-cli/coveo/cli/issues/584)) ([7dba5bb](https://coveo-cli/coveo/cli/commits/7dba5bba957a6d40a62cdea1757eb53226df183e))
- **deps:** update all dependencies j:cdx-227 ([#580](https://coveo-cli/coveo/cli/issues/580)) ([283bce0](https://coveo-cli/coveo/cli/commits/283bce041f26184949a9f4e8939faa612bf30994))
- remove noise & warning when creating Atomic project ([#583](https://coveo-cli/coveo/cli/issues/583)) ([f35b80f](https://coveo-cli/coveo/cli/commits/f35b80f2b2257664a1382ef8e429c1c51934f48a))
- specify templates/.gitignore in files ([#579](https://coveo-cli/coveo/cli/issues/579)) ([c7a7396](https://coveo-cli/coveo/cli/commits/c7a73969c2aef7f08d119e2123e79fbc7973b46a))

### Features

- **atomic:** add snyk coverage for atomic ([#581](https://coveo-cli/coveo/cli/issues/581)) ([604a044](https://coveo-cli/coveo/cli/commits/604a044a9e4a42ee44fc7c6442fc8956f1c59e27))

## [1.21.3](https://coveo-cli/coveo/cli/compare/v1.21.2...v1.21.3) (2021-12-03)

**Note:** Version bump only for package cli-tools

## [1.21.2](https://coveo-cli/coveo/cli/compare/v1.21.1...v1.21.2) (2021-12-02)

### Bug Fixes

- **deps:** update dependency puppeteer to v12 j:cdx-227 ([#569](https://coveo-cli/coveo/cli/issues/569)) ([e57137c](https://coveo-cli/coveo/cli/commits/e57137c5d3abf6dcf4697b4ec24feee43b7ba748))
- **source:push:** handle `ErrorFromAPI` as well as other error types ([#556](https://coveo-cli/coveo/cli/issues/556)) ([ea13e75](https://coveo-cli/coveo/cli/commits/ea13e754da7431939b363a8f5821d54dd8809f1d))
- **source:push:** only parse valid JSON files ([#555](https://coveo-cli/coveo/cli/issues/555)) ([d7eff46](https://coveo-cli/coveo/cli/commits/d7eff466e84d7b08dfaafe56a880b053ca79dadc))
- **source:push:** support pushing large documents ([#557](https://coveo-cli/coveo/cli/issues/557)) ([d3810b1](https://coveo-cli/coveo/cli/commits/d3810b1b4f1e13d392301c850dfc3cc14b35901d))

## [1.21.1](https://coveo-cli/coveo/cli/compare/v1.21.0...v1.21.1) (2021-11-29)

### Bug Fixes

- **deps:** update all dependencies j:cdx-227 (major) ([#560](https://coveo-cli/coveo/cli/issues/560)) ([335fd49](https://coveo-cli/coveo/cli/commits/335fd49b96b285ad92c6b90cfd0c0a608151c70b))

# [1.21.0](https://coveo-cli/coveo/cli/compare/v1.20.0...v1.21.0) (2021-11-29)

### Features

- use search-token-lambda with generated Atomic project & add deploy command ([#562](https://coveo-cli/coveo/cli/issues/562)) ([e7d3df3](https://coveo-cli/coveo/cli/commits/e7d3df392474837c723b93208f22e182970a31f6))

# [1.20.0](https://coveo-cli/coveo/cli/compare/v1.19.0...v1.20.0) (2021-11-25)

### Bug Fixes

- **deps:** update all dependencies j:cdx-227 ([#529](https://coveo-cli/coveo/cli/issues/529)) ([74a0d36](https://coveo-cli/coveo/cli/commits/74a0d36ce09e3f12b9def51a7bc08b1e05f91be3))
- erase resources folder content before pulling resources ([#554](https://coveo-cli/coveo/cli/issues/554)) ([22b30a2](https://coveo-cli/coveo/cli/commits/22b30a2f0ca2aabf44942021f3f791bcfd4a7074))
- flush analytic events before terminating the process ([#549](https://coveo-cli/coveo/cli/issues/549)) ([b25473c](https://coveo-cli/coveo/cli/commits/b25473c204687edc9a92d33de6823fe1e2796e78))
- require at least one flag on the `config:set` command ([#545](https://coveo-cli/coveo/cli/issues/545)) ([4d41930](https://coveo-cli/coveo/cli/commits/4d41930b6d4888e3fe8c29cff5e26eb1d84efbc8))
- resolve ts/js files for generated atomic project (webpack) ([#553](https://coveo-cli/coveo/cli/issues/553)) ([8b705fe](https://coveo-cli/coveo/cli/commits/8b705fe4c643c428bc264ce093439ab7f63209c0))

### Features

- add "create-atomic" package ([#536](https://coveo-cli/coveo/cli/issues/536)) ([1acd626](https://coveo-cli/coveo/cli/commits/1acd6269c1f01febe76d755ab7396fef05b578df))
- create new @coveo/lambda-functions package ([#558](https://coveo-cli/coveo/cli/issues/558)) ([667749c](https://coveo-cli/coveo/cli/commits/667749c10fe0de41a42523e4338fda9391f5d9f1))
- display config after `config:set` ([#544](https://coveo-cli/coveo/cli/issues/544)) ([11bad62](https://coveo-cli/coveo/cli/commits/11bad62e663a10286d81019a8cb17918afb4ec10))
- improve generated @coveo/atomic project ([#548](https://coveo-cli/coveo/cli/issues/548)) ([67e604d](https://coveo-cli/coveo/cli/commits/67e604d3b1706ff8b0083bf69476054ab06d2841))
- make atomic command pass arguments to @coveo/create-atomic ([#546](https://coveo-cli/coveo/cli/issues/546)) ([c03c3f7](https://coveo-cli/coveo/cli/commits/c03c3f76b1516f2e7b9cc37ac34c6330059295f5))

# [1.19.0](https://coveo-cli/coveo/cli/compare/v1.18.0...v1.19.0) (2021-11-11)

### Bug Fixes

- accept non-url documentIDs ([#527](https://coveo-cli/coveo/cli/issues/527)) ([e2f55ab](https://coveo-cli/coveo/cli/commits/e2f55ab0e68e7bd4bd8c8ad0a9c5cf52f2880751))
- **angular:** update schematic and cli to angular 13 ([#530](https://coveo-cli/coveo/cli/issues/530)) ([7bca4f2](https://coveo-cli/coveo/cli/commits/7bca4f2c9add7c8a081c6d18830bb18846dc018c))
- **deps:** update all dependencies j:cdx-227 ([#519](https://coveo-cli/coveo/cli/issues/519)) ([b965188](https://coveo-cli/coveo/cli/commits/b9651886461f82f00e3a1998a3c1227294ad57dc))
- lock angular cli to 12.x in test environments ([#532](https://coveo-cli/coveo/cli/issues/532)) ([057710a](https://coveo-cli/coveo/cli/commits/057710a1ebc30999fad39934570f158566508685))
- **proxy:** pass proxy along to platform-client ([#512](https://coveo-cli/coveo/cli/issues/512)) ([d88e9c9](https://coveo-cli/coveo/cli/commits/d88e9c92d4fe22da62952b8134d39544ccd370b8))
- remove eslint ignore, add missing dep ([#524](https://coveo-cli/coveo/cli/issues/524)) ([a54420b](https://coveo-cli/coveo/cli/commits/a54420b3df9a1dcd4e4cfd0bc9f2bb2efd440ac1))

### Features

- add "coveo ui:create:atomic" command ([#534](https://coveo-cli/coveo/cli/issues/534)) ([61b08f1](https://coveo-cli/coveo/cli/commits/61b08f17e925877d34c5a10ffe1d6676f916023c))
- add ng range check ([#533](https://coveo-cli/coveo/cli/issues/533)) ([cafaa17](https://coveo-cli/coveo/cli/commits/cafaa1777a9d9367886463749e3697143f8e31d2))
- add preconditions on `org:resources:*` commands ([#507](https://coveo-cli/coveo/cli/issues/507)) ([7d9e6c6](https://coveo-cli/coveo/cli/commits/7d9e6c68397bb66d6ae4acff438ce5d10f5d2ef9))
- catch precondition errors ([#514](https://coveo-cli/coveo/cli/issues/514)) ([ca558d4](https://coveo-cli/coveo/cli/commits/ca558d4c29369a2c445a89463710bbf5ae386c00))
- improve compatibility with WSL ([#535](https://coveo-cli/coveo/cli/issues/535)) ([f268a89](https://coveo-cli/coveo/cli/commits/f268a8940f6ea818cc5a3b1595317def7f82f907))

# [1.18.0](https://coveo-cli/coveo/cli/compare/v1.17.0...v1.18.0) (2021-10-29)

### Bug Fixes

- **angular:** support NPM 8 ([#501](https://coveo-cli/coveo/cli/issues/501)) ([5cc2b58](https://coveo-cli/coveo/cli/commits/5cc2b589b74737fc06aca4b3ccfe24e354fabf72))
- delete successful snapshots from the org ([#493](https://coveo-cli/coveo/cli/issues/493)) ([c6d2bfa](https://coveo-cli/coveo/cli/commits/c6d2bfad6a72adb7554db24537097ab305c9694f))
- **deps:** update dependency devtools-protocol to v0.0.936174 j:cdx-227 ([#516](https://coveo-cli/coveo/cli/issues/516)) ([04970b6](https://coveo-cli/coveo/cli/commits/04970b67048b425fe801bf28defc07fbeeafd386))

### Features

- add `coveo:org:create` command ([#509](https://coveo-cli/coveo/cli/issues/509)) ([50aee3c](https://coveo-cli/coveo/cli/commits/50aee3c928e2501878113d5aa33eedaeb28e7261))
- add SourcePullModel Validation ([#497](https://coveo-cli/coveo/cli/issues/497)) ([cd085ba](https://coveo-cli/coveo/cli/commits/cd085ba69e6b28d6afae8aa9c1a356650b4fb042))
- sketch out the spm:new command ([#495](https://coveo-cli/coveo/cli/issues/495)) ([6c21f99](https://coveo-cli/coveo/cli/commits/6c21f99ebc7aff8ddf035e1ff762766673e7bb13))
- **spm:** add resourceType selection ([#502](https://coveo-cli/coveo/cli/issues/502)) ([7af835e](https://coveo-cli/coveo/cli/commits/7af835eda6064c063d24bafaa68ec5ce31f0a17c))

# [1.17.0](https://coveo-cli/coveo/cli/compare/v1.16.0...v1.17.0) (2021-10-07)

### Features

- support proxies ([#490](https://coveo-cli/coveo/cli/issues/490)) ([a8d5060](https://coveo-cli/coveo/cli/commits/a8d506054f79d3ccc2ac9a7ecc1e5353bf415d7a))

# [1.16.0](https://coveo-cli/coveo/cli/compare/v1.15.1...v1.16.0) (2021-10-04)

### Bug Fixes

- **cli:** remove decompress ([#492](https://coveo-cli/coveo/cli/issues/492)) ([0c88e4e](https://coveo-cli/coveo/cli/commits/0c88e4e0269439d039a8ba3bbe1e2951da34a3c5))
- **node:** use node 16, npm 7 and lockfileVersion 2 exclusively ([#486](https://coveo-cli/coveo/cli/issues/486)) ([1c4e0f8](https://coveo-cli/coveo/cli/commits/1c4e0f898450b06b8c101230a902b97e7783adb2))
- remove line break from url ([#479](https://coveo-cli/coveo/cli/issues/479)) ([1e55084](https://coveo-cli/coveo/cli/commits/1e55084c986e6ae65e05d428cfb7015a3ac41c3e))
- **snapshot:** wait flag should support the value `0` ([#474](https://coveo-cli/coveo/cli/issues/474)) ([4b6e567](https://coveo-cli/coveo/cli/commits/4b6e567c01a3b9589d5ac13031003cf1a1fb170c))

### Features

- control the granularity of the preview with a `--previewLevel` ([#477](https://coveo-cli/coveo/cli/issues/477)) ([8637c88](https://coveo-cli/coveo/cli/commits/8637c88918437338e94cc896fcb258cfff8fbb97))
- **snapshot:** add `--sync` flag to automatically apply sync plan (if 100% confidence) ([#460](https://coveo-cli/coveo/cli/issues/460)) ([152318b](https://coveo-cli/coveo/cli/commits/152318b467beb6763336a8c2ff289532b4b80117))
- **snapshot:** add analytic hook to pull command ([#465](https://coveo-cli/coveo/cli/issues/465)) ([b35874d](https://coveo-cli/coveo/cli/commits/b35874df3a64382107144a717198b852ad72f1ff))

## [1.15.1](https://github.com/coveo/cli/compare/v1.15.0...v1.15.1) (2021-09-13)

**Note:** Version bump only for package cli-tools

# [1.15.0](https://github.com/coveo/cli/compare/v1.14.0...v1.15.0) (2021-09-13)

### Bug Fixes

- **cli:** typescript issues ([#459](https://github.com/coveo/cli/issues/459)) ([c568967](https://github.com/coveo/cli/commit/c568967be59f2d610937dc4668f4e83a2b014324))

### Features

- **react:** use transform instead of pty ([#461](https://github.com/coveo/cli/issues/461)) ([6a96572](https://github.com/coveo/cli/commit/6a965724e660c373a03e3dcb9ff5a9da4b711fa4))
- **snapshot:** handle snapshot synchronization ([#455](https://github.com/coveo/cli/issues/455)) ([b1deed7](https://github.com/coveo/cli/commit/b1deed72e6ad0a6f9456cc1dc4774c6b5b6c2f70))

# [1.14.0](https://github.com/coveo/cli/compare/v1.13.0...v1.14.0) (2021-08-27)

### Bug Fixes

- add repository key on search-token-server ([#445](https://github.com/coveo/cli/issues/445)) ([f1f0034](https://github.com/coveo/cli/commit/f1f00340d78cb97955d0ecb20084c3e852040754))
- **cli:** use proper region suffix ([4af6fb1](https://github.com/coveo/cli/commit/4af6fb14338da1fcf341cfcd908b81a3790e224a))
- **deps:** update all dependencies j:cdx-227 ([#439](https://github.com/coveo/cli/issues/439)) ([05dc662](https://github.com/coveo/cli/commit/05dc6624f661040b7c3376e899f91f00b7f95fa5))
- **deps:** update dependency @coveord/platform-client to v25 j:cdx-227 ([#440](https://github.com/coveo/cli/issues/440)) ([3943634](https://github.com/coveo/cli/commit/394363414acf30d440055c22a2d254b8fbfe3706))

### Features

- add better message when user doesn't have permissions to create an API key ([#447](https://github.com/coveo/cli/issues/447)) ([9db1dde](https://github.com/coveo/cli/commit/9db1dde448a5703cd16c9302bd7c211497c5c83c))
- add feedback during and after computing the expanded preview ([#448](https://github.com/coveo/cli/issues/448)) ([34d3658](https://github.com/coveo/cli/commit/34d3658bc568e1c4f1b95a472fcda2578849766c))
- **cli:** add version on config.json ([#442](https://github.com/coveo/cli/issues/442)) ([66e903b](https://github.com/coveo/cli/commit/66e903b0004685d03b05d364d3d1dde17683df10))
- **cli:** unbundle 3rd-party CLIs ([#434](https://github.com/coveo/cli/issues/434)) ([377c6f5](https://github.com/coveo/cli/commit/377c6f514e388461de62b166617ff22f47c125fc))
- **react:** commit /server directory on project creation ([#444](https://github.com/coveo/cli/issues/444)) ([e1d0694](https://github.com/coveo/cli/commit/e1d06940445b07b6e9c37e551977d2063b20bd79))
- **snapshot:** enhance snapshot error messages ([#431](https://github.com/coveo/cli/issues/431)) ([46947b3](https://github.com/coveo/cli/commit/46947b361c78f56664217495541cd21c5c1c71c0))
- **ui:** add better message when user doesn't have permissions to create an API key ([#429](https://github.com/coveo/cli/issues/429)) ([2f2f986](https://github.com/coveo/cli/commit/2f2f986fe11554c554e45bb44d8b5745d9d9fc79))

### Reverts

- **ui:** add better message when user doesn't have permission ([#436](https://github.com/coveo/cli/issues/436)) ([3eb2d06](https://github.com/coveo/cli/commit/3eb2d06074ea1901521c7b7dcb557fa9b3899dec))

# [1.13.0](https://github.com/coveo/cli/compare/v1.12.0...v1.13.0) (2021-08-12)

### Bug Fixes

- **cli:** add description fields in package.json ([#396](https://github.com/coveo/cli/issues/396)) ([4dfc8d3](https://github.com/coveo/cli/commit/4dfc8d3fe35771fbe66f15a95c8c0a02a8eaff3a))
- **cli:** handle npx 7 ([#409](https://github.com/coveo/cli/issues/409)) ([fb2a849](https://github.com/coveo/cli/commit/fb2a849bb524f8b914f7ad9e470c0977594dad35))
- **deps:** update all dependencies j:cdx-227 ([#411](https://github.com/coveo/cli/issues/411)) ([c2363ff](https://github.com/coveo/cli/commit/c2363ffbb7e68b819f84b5fcc528893e574bdbb8))
- **deps:** update all dependencies j:cdx-227 ([#415](https://github.com/coveo/cli/issues/415)) ([b287d72](https://github.com/coveo/cli/commit/b287d721502fde507826080ec5414662338ce38c))
- **snapshot:** add check before generating expanded preview ([#427](https://github.com/coveo/cli/issues/427)) ([4207eab](https://github.com/coveo/cli/commit/4207eab8647372f4ac9a92e2e94961323317602c))
- **snapshot:** do not delete snapshot if cannot apply ([#422](https://github.com/coveo/cli/issues/422)) ([b499bca](https://github.com/coveo/cli/commit/b499bca1d534d5a597f207c6753d890ca4aaed91))
- **vue:** fix broken pager buttons ([#421](https://github.com/coveo/cli/issues/421)) ([0fa9686](https://github.com/coveo/cli/commit/0fa96865a035f9998ae2707558efe54617d94666))

### Features

- **cli:** expanded preview ([#267](https://github.com/coveo/cli/issues/267)) ([69262c1](https://github.com/coveo/cli/commit/69262c1c62d2df43cdc9aedc4f6e9d3ae4191a0c)), closes [#365](https://github.com/coveo/cli/issues/365)
- **snapshot:** add a `--wait` flag on all `org:config:*` commands ([#397](https://github.com/coveo/cli/issues/397)) ([a74c1de](https://github.com/coveo/cli/commit/a74c1de0a2685e4748078b2490194061cc06b4ce)), closes [#398](https://github.com/coveo/cli/issues/398) [#404](https://github.com/coveo/cli/issues/404)
- **snapshot:** add better logs to monitor command ([#412](https://github.com/coveo/cli/issues/412)) ([792f716](https://github.com/coveo/cli/commit/792f716d9a9474e552a3c34ba6fda01a5bc596b5))
- **snapshot:** change `--wait` flag character ([#414](https://github.com/coveo/cli/issues/414)) ([00cd92c](https://github.com/coveo/cli/commit/00cd92c812b95d25f8891fcd0ef1ff5815063650))
- **snapshot:** enforce json format. ([#405](https://github.com/coveo/cli/issues/405)) ([d0146d5](https://github.com/coveo/cli/commit/d0146d5b9338862e6ee75a7e853cb5263c124007)), closes [#365](https://github.com/coveo/cli/issues/365)

# [1.12.0](https://github.com/coveo/cli/compare/v1.11.0...v1.12.0) (2021-08-03)

### Features

- **cli:** add token authentication ([#401](https://github.com/coveo/cli/issues/401)) ([967877c](https://github.com/coveo/cli/commit/967877c3e16df687a6bbd48cbc4c10cd1920d942))
- **snapshot:** add `--snapshotId` flag to `push` and `preview` commands ([#387](https://github.com/coveo/cli/issues/387)) ([57de692](https://github.com/coveo/cli/commit/57de6923685ade5d3a20285528e02bc0c981a78f))

# [1.11.0](https://github.com/coveo/cli/compare/v1.10.0...v1.11.0) (2021-08-02)

### Bug Fixes

- **cli:** command timing out without showing info ([#377](https://github.com/coveo/cli/issues/377)) ([d898858](https://github.com/coveo/cli/commit/d89885835128f86220745cb44b2b3c587f99241c))
- **cli:** wait for snapshot to be done ([#378](https://github.com/coveo/cli/issues/378)) ([9eb81a2](https://github.com/coveo/cli/commit/9eb81a2b5b271821b84cc9ae880db0afa44bc500))
- **config:** fix race condition in config file ([#381](https://github.com/coveo/cli/issues/381)) ([a65395d](https://github.com/coveo/cli/commit/a65395da82b1727b5a0f1fa806cf4ff0c6c0c31a)), closes [#386](https://github.com/coveo/cli/issues/386)
- **deps:** pin dependencies j:cdx-227 ([#376](https://github.com/coveo/cli/issues/376)) ([ce25520](https://github.com/coveo/cli/commit/ce25520b9b05d0dc4d857d83eab9b29b4f7d6d60))
- **deps:** update all dependencies j:cdx-227 ([#393](https://github.com/coveo/cli/issues/393)) ([ce7f98b](https://github.com/coveo/cli/commit/ce7f98b8e80c4f2759d0be140fb03aae9a9d2f7e))
- **e2e:** waitForNavigation on login ([#392](https://github.com/coveo/cli/issues/392)) ([3ccacf9](https://github.com/coveo/cli/commit/3ccacf9648b8b57439266154c585edc697831498))
- **snapshot:** fix invalid timeout message ([#380](https://github.com/coveo/cli/issues/380)) ([20ad3d0](https://github.com/coveo/cli/commit/20ad3d03556df87887ccbbfab76cc4d78679aa40))
- **vue:** support project creation with Node 16 and pnpm ([#394](https://github.com/coveo/cli/issues/394)) ([aec9ba0](https://github.com/coveo/cli/commit/aec9ba0c6448dcee79343aa99aee5eed548e84c8))
- remove `appendCmdIfWindows` ([#391](https://github.com/coveo/cli/issues/391)) ([61d8f13](https://github.com/coveo/cli/commit/61d8f132c44ad96bc428e0aff876d207e4aaff14))
- **react:** remove console errors ([#385](https://github.com/coveo/cli/issues/385)) ([ed4069f](https://github.com/coveo/cli/commit/ed4069f874b8d84b984fb6d45a41c9d2c89527fe))
- **vue:** Remove `FieldActions` warning ([#382](https://github.com/coveo/cli/issues/382)) ([bae7a60](https://github.com/coveo/cli/commit/bae7a609d26cdf1c8d9839aab4705ad80eac7718))

### Features

- **config:** add list snapshot command ([#374](https://github.com/coveo/cli/issues/374)) ([e8c9250](https://github.com/coveo/cli/commit/e8c925084ff54c2e67114a5f576455f27aec03a8))
- **config:** initialize git repo when doing initial pull ([#379](https://github.com/coveo/cli/issues/379)) ([b21b8ff](https://github.com/coveo/cli/commit/b21b8ff19dff5e5c140f63213cb59022903dea5e))

# [1.10.0](https://github.com/coveo/cli/compare/v1.9.0...v1.10.0) (2021-07-21)

### Bug Fixes

- **push:** fix incorrect types for timestamp when using delete older than ([#363](https://github.com/coveo/cli/issues/363)) ([41030d4](https://github.com/coveo/cli/commit/41030d42edee62d4b91e1a4eabbbe0f05e2654a8))
- **snapshot:** pull should use new enum ([#365](https://github.com/coveo/cli/issues/365)) ([4fbffef](https://github.com/coveo/cli/commit/4fbffef433c30c6e6723664a5937eaf7a53ac592))

### Features

- **cli:** add `--resourceTypes` flag ([#341](https://github.com/coveo/cli/issues/341)) ([37b2b9c](https://github.com/coveo/cli/commit/37b2b9c18791d1451db3fac3d6a695a1ca5003cf))
- **push:** add support for push:add command ([#349](https://github.com/coveo/cli/issues/349)) ([ae8a48e](https://github.com/coveo/cli/commit/ae8a48ea95ef7026d0468bfff121b02657ef4fb4))
- **push:** add support for very large batch of documents ([#358](https://github.com/coveo/cli/issues/358)) ([03927d7](https://github.com/coveo/cli/commit/03927d7fc7c8165f09f87431630d51c7a5789e6e))
- **push:** support security identities in JSON documents ([#366](https://github.com/coveo/cli/issues/366)) ([73ac2b5](https://github.com/coveo/cli/commit/73ac2b5d8d9870112975e06f2290fb50ca27c0d7))

# [1.9.0](https://github.com/coveo/cli/compare/v1.8.0...v1.9.0) (2021-07-16)

### Bug Fixes

- **cli:** exclude dev patches ([#304](https://github.com/coveo/cli/issues/304)) ([0a2b164](https://github.com/coveo/cli/commit/0a2b1645d3158e914ca6b626f081a49b4fdfc3a2))
- **cli:** invalid url in snapshot error message ([#327](https://github.com/coveo/cli/issues/327)) ([0b7c9f8](https://github.com/coveo/cli/commit/0b7c9f854e95a5db23f002884e6fa8534f06f246))
- **cli:** put back windows signing with fix for github workflow ([#300](https://github.com/coveo/cli/issues/300)) ([1b5a7ed](https://github.com/coveo/cli/commit/1b5a7ed72c8ec5192b61750e655867fb5026bba4))
- **J:CDX-227:** bump @babel/preset-typescript from 7.12.17 to 7.14.5 ([#271](https://github.com/coveo/cli/issues/271)) ([8970aca](https://github.com/coveo/cli/commit/8970acab1ca9726d00f47cdf2dda4924cdcec165))
- **J:CDX-227:** bump @coveord/platform-client from 20.2.0 to 21.4.0 ([#314](https://github.com/coveo/cli/issues/314)) ([a56a0fd](https://github.com/coveo/cli/commit/a56a0fdcb59290d2b58ce32028db53390cffb498))
- **J:CDX-227:** bump @types/node from 10.17.60 to 14.17.4 (^14) ([#308](https://github.com/coveo/cli/issues/308)) ([9ccb7d7](https://github.com/coveo/cli/commit/9ccb7d716e01d84147b0090d27aad4ac2b2d0e9b))
- **J:CDX-227:** bump @vue/cli from 4.5.12 to 4.5.13 ([#318](https://github.com/coveo/cli/issues/318)) ([d9ff1c6](https://github.com/coveo/cli/commit/d9ff1c6f1e6bd1b3c60bbe32bb038cc7dba35ce5))
- **J:CDX-227:** bump eslint from 7.29.0 to 7.30.0 ([#323](https://github.com/coveo/cli/issues/323)) ([23689ae](https://github.com/coveo/cli/commit/23689aebbe3d9905236b578cc9e9c5886a45e5fb))
- **J:CDX-227:** bump fs-extra from 9.1.0 to 10.0.0 ([#295](https://github.com/coveo/cli/issues/295)) ([581f233](https://github.com/coveo/cli/commit/581f2339278dbb2009cd85b7854bbb86a05bdd90))
- **J:CDX-227:** bump prettier from 2.3.0 to 2.3.1 ([#269](https://github.com/coveo/cli/issues/269)) ([64c0600](https://github.com/coveo/cli/commit/64c0600b5776b85ff184ab66cf5e167516636002))
- **J:CDX-227:** bump ts-node from 8.10.2 to 10.0.0 ([#268](https://github.com/coveo/cli/issues/268)) ([ca94620](https://github.com/coveo/cli/commit/ca94620c781d4e5cdd597036a6fe4aa5375b822f))

### Features

- **analytics:** add analytics hook on org:config commands ([#336](https://github.com/coveo/cli/issues/336)) ([d753b97](https://github.com/coveo/cli/commit/d753b9724160cd16222acfde475340d156ac98de))
- **angular-12:** update all deps, tweak port-allocator ([#340](https://github.com/coveo/cli/issues/340)) ([42540da](https://github.com/coveo/cli/commit/42540da92c22ae522eb36b65311ac14749311b38))
- **cli:** add warning and update instructions for NPM installations ([#306](https://github.com/coveo/cli/issues/306)) ([a71c2d2](https://github.com/coveo/cli/commit/a71c2d20eea516c18c3e4865130d142af4e24b9c))
- **cli:** create class for the `pull` command ([#328](https://github.com/coveo/cli/issues/328)) ([8ec50e9](https://github.com/coveo/cli/commit/8ec50e98004455acd5c4312dffc6f626a9c1bb94))
- **cli:** do not propose to apply a snapshot with no changes ([#303](https://github.com/coveo/cli/issues/303)) ([f2ec64e](https://github.com/coveo/cli/commit/f2ec64ed3d6d3d635e24d83bf1388c68ddb95f6c))
- **cli:** monitor command ([#319](https://github.com/coveo/cli/issues/319)) ([a1b99e6](https://github.com/coveo/cli/commit/a1b99e6c63706aed53888d9100c7300abbcb17b7))
- **cli:** provide relevant info if snapshot operation is taking too long ([#305](https://github.com/coveo/cli/issues/305)) ([5932a76](https://github.com/coveo/cli/commit/5932a765a58f9c35996442eb0891cb67c19f3c99))
- **cli:** refresh project with snapshot content ([#331](https://github.com/coveo/cli/issues/331)) ([e7c2858](https://github.com/coveo/cli/commit/e7c2858e7de1ba81b12e9f8b4d5f39c6e3e2337c))
- **push:** add delete document push source command ([#343](https://github.com/coveo/cli/issues/343)) ([17e9b8b](https://github.com/coveo/cli/commit/17e9b8b4d2346680ced39d9744be80c11025d7ba))
- **push:** add push source create new command ([#339](https://github.com/coveo/cli/issues/339)) ([fcb41eb](https://github.com/coveo/cli/commit/fcb41eb4888ac3937fe8c5e7dc13fbfd0347e1d5))
- **push:** add push source list command ([#335](https://github.com/coveo/cli/issues/335)) ([7364794](https://github.com/coveo/cli/commit/736479473518c46e32d9b27ed94216f9ba54b1bb))

# [1.8.0](https://github.com/coveo/cli/compare/v1.7.0...v1.8.0) (2021-06-25)

**Note:** Version bump only for package cli-tools

# [1.7.0](https://github.com/coveo/cli/compare/v1.6.0...v1.7.0) (2021-06-25)

**Note:** Version bump only for package cli-tools

# [1.6.0](https://github.com/coveo/cli/compare/v1.5.0...v1.6.0) (2021-06-25)

### Bug Fixes

- **J:CDX-227:** bump @actions/github from 4.0.0 to 5.0.0 ([#294](https://github.com/coveo/cli/issues/294)) ([9ffbafb](https://github.com/coveo/cli/commit/9ffbafb5a83214dd58a7c7b26700c4fb342748e3))
- **J:CDX-227:** bump eslint from 7.26.0 to 7.29.0 ([#279](https://github.com/coveo/cli/issues/279)) ([227651c](https://github.com/coveo/cli/commit/227651ce2056acef9e82dc88cc4b3a38a55e010f))
- **J:CDX-227:** bump eslint-config-prettier from 7.2.0 to 8.3.0 ([#293](https://github.com/coveo/cli/issues/293)) ([c425f7a](https://github.com/coveo/cli/commit/c425f7a86aa3ddf579cd4164fa41eacadb2ec2ac))
- **J:CDX-227:** bump tslib from 1.14.1 to 2.3.0 ([#283](https://github.com/coveo/cli/issues/283)) ([aff708a](https://github.com/coveo/cli/commit/aff708ab541aebcf012add7909fcd8be21e589f5))
- **vue:** fix fieldToInclude options ([1213b38](https://github.com/coveo/cli/commit/1213b389067da6a38729e5d88680c2be27685e6e))

### Features

- add flag `--skip-preview` on the push command ([#275](https://github.com/coveo/cli/issues/275)) ([a2b4741](https://github.com/coveo/cli/commit/a2b47410316edb805e9d60a300f8de542fb08259))

# [1.5.0](https://github.com/coveo/cli/compare/v1.3.0...v1.5.0) (2021-06-22)

### Bug Fixes

- **J:CDX-227:** bump buefy from 0.9.6 to 0.9.8 ([#280](https://github.com/coveo/cli/issues/280)) ([8157f61](https://github.com/coveo/cli/commit/8157f612e874fd2d216df1e3baab1364138e2460))
- **ui:** use await/async ([#264](https://github.com/coveo/cli/issues/264)) ([4c90fd1](https://github.com/coveo/cli/commit/4c90fd1f8958f5d3160393d3233633103fb88523))
- fix race condition between create and validate ([#256](https://github.com/coveo/cli/issues/256)) ([415b803](https://github.com/coveo/cli/commit/415b803cdef703cf79a98b29c866ed097b49a5fd))

### Features

- **ui:** support for Headless v1 ([#262](https://github.com/coveo/cli/issues/262)) ([4ef75f9](https://github.com/coveo/cli/commit/4ef75f9ef8327277231308bf6475e4a3d94ab1ac))
- add flag to support delete changes ([#258](https://github.com/coveo/cli/issues/258)) ([e0c9aad](https://github.com/coveo/cli/commit/e0c9aade588838e3636378bfb6cf017557663365))
- add light preview ([#254](https://github.com/coveo/cli/issues/254)) ([3269a59](https://github.com/coveo/cli/commit/3269a596004d20452925e86c0d2dcebe543537ca))
- add push command ([#260](https://github.com/coveo/cli/issues/260)) ([25b8c6c](https://github.com/coveo/cli/commit/25b8c6cf815ec99b7de14b454f982a6f9e4b01fe))
- remove `--projectPath` flag ([#277](https://github.com/coveo/cli/issues/277)) ([47c98cc](https://github.com/coveo/cli/commit/47c98ccd9ee632aa35975ec2781efe2b1d6d3a0e))

# [1.3.0](https://github.com/coveo/cli/compare/v1.2.1...v1.3.0) (2021-06-14)

### Bug Fixes

- **vue:** .eslintrc blocks user from commiting ([#224](https://github.com/coveo/cli/issues/224)) ([c8d9de0](https://github.com/coveo/cli/commit/c8d9de087631b6a40f6613caada01aa892a091bf))

### Features

- delete a snapshot ([#247](https://github.com/coveo/cli/issues/247)) ([7d0a259](https://github.com/coveo/cli/commit/7d0a259535cb4572447eb20349224302ea1e06f4))
- setup a synchronization plan if the resources are in error ([#248](https://github.com/coveo/cli/issues/248)) ([2077d9c](https://github.com/coveo/cli/commit/2077d9c72c0314e714a814d9140190c9610bb9d3))
- **cli:** create Zip from project ([#235](https://github.com/coveo/cli/issues/235)) ([3ab41c8](https://github.com/coveo/cli/commit/3ab41c8bb1af5fdef3b0a99a5cbcec315d3db715))
- **cli:** push snapshots to an organization ([#237](https://github.com/coveo/cli/issues/237)) ([28e23c6](https://github.com/coveo/cli/commit/28e23c64495ba96676c650b974d54d44188b7266))
- **cli:** validate snapshots ([#240](https://github.com/coveo/cli/issues/240)) ([ea88941](https://github.com/coveo/cli/commit/ea88941648b865e4f76d01121e4cf5b6760b5e9d))
- add snapshot class ([#236](https://github.com/coveo/cli/issues/236)) ([aa02ed1](https://github.com/coveo/cli/commit/aa02ed1a079abfc1abeaaeca9f090abcc8483109))
- assign a dynamic port to both front and back ends on all ui project ([#230](https://github.com/coveo/cli/issues/230)) ([46d9dfd](https://github.com/coveo/cli/commit/46d9dfd47af749f6d1fc120668383982bfa2e249))
- **search:** add a dump index command ([#233](https://github.com/coveo/cli/issues/233)) ([1a16ab3](https://github.com/coveo/cli/commit/1a16ab3947f572fa7f6506e7b8966356f9f87b10))

## [1.2.1](https://github.com/coveo/cli/compare/v1.2.0...v1.2.1) (2021-05-17)

### Bug Fixes

- **cli:** set dependency and cd fix ([#223](https://github.com/coveo/cli/issues/223)) ([3a89594](https://github.com/coveo/cli/commit/3a8959431d4bb0ea9a83f283afc6e65764aab6ed))

# [1.2.0](https://github.com/coveo/cli/compare/v1.1.1...v1.2.0) (2021-05-14)

### Bug Fixes

- **angular:** lock-on @angular/material to 11.x ([#221](https://github.com/coveo/cli/issues/221)) ([71bce18](https://github.com/coveo/cli/commit/71bce183b5ee26dfc0920c61412d44d1afac9780))

### Features

- **cli:** make the CLI available through `npm` and `npx` ([#208](https://github.com/coveo/cli/issues/208)) ([dadbbe8](https://github.com/coveo/cli/commit/dadbbe8c3b4c97a2ff14112f7a154cc49daf7b99))

## [1.1.1](https://github.com/coveo/cli/compare/v1.1.0...v1.1.1) (2021-05-05)

### Bug Fixes

- **angular:** fix angular modifier to works with windows. ([#200](https://github.com/coveo/cli/issues/200)) ([06fe8c6](https://github.com/coveo/cli/commit/06fe8c68e6c315ad75273f4a8fb0810bc40adc22))
- **cli:** resync cli sibling dep version with its own ([#202](https://github.com/coveo/cli/issues/202)) ([330bf6e](https://github.com/coveo/cli/commit/330bf6ebdbf37b30cd8ef9463fac83b4f8245182))

# [1.1.0](https://github.com/coveo/cli/compare/v1.0.15...v1.1.0) (2021-05-04)

### Bug Fixes

- **angular:** fix Coveo headless error on application run ([#193](https://github.com/coveo/cli/issues/193)) ([f633459](https://github.com/coveo/cli/commit/f6334594ed1dc8ec74b916f42150430eccad98c0))

### Features

- **cli:** display "Happy Hacking" message at the end of the project creation ([#178](https://github.com/coveo/cli/issues/178)) ([c5e7619](https://github.com/coveo/cli/commit/c5e7619b805c927f5b4f5a2380a4381f61127dd3))

## [1.0.15](https://github.com/coveo/cli/compare/v1.0.14...v1.0.15) (2021-04-21)

### Bug Fixes

- **cli:** include patches when packing ([#174](https://github.com/coveo/cli/issues/174)) ([54aee22](https://github.com/coveo/cli/commit/54aee225f3cfec041e896c3d95a3c07f7055cb3c))

## [1.0.14](https://github.com/coveo/cli/compare/v1.0.13...v1.0.14) (2021-04-20)

**Note:** Version bump only for package cli-tools

## [1.0.13](https://github.com/coveo/cli/compare/v1.0.12...v1.0.13) (2021-04-20)

**Note:** Version bump only for package cli-tools

## [1.0.12](https://github.com/coveo/cli/compare/v1.0.11...v1.0.12) (2021-04-20)

**Note:** Version bump only for package cli-tools

## [1.0.11](https://github.com/coveo/cli/compare/v1.0.10...v1.0.11) (2021-04-20)

**Note:** Version bump only for package cli-tools

## [1.0.10](https://github.com/coveo/cli/compare/v1.0.9...v1.0.10) (2021-04-20)

**Note:** Version bump only for package cli-tools

## [1.0.9](https://github.com/coveo/cli/compare/v1.0.8...v1.0.9) (2021-04-20)

**Note:** Version bump only for package cli-tools

## [1.0.8](https://github.com/coveo/cli/compare/v1.0.7...v1.0.8) (2021-04-20)

**Note:** Version bump only for package cli-tools

## [1.0.7](https://github.com/coveo/cli/compare/v1.0.1...v1.0.7) (2021-04-19)

### Bug Fixes

- **vue:** fix typo in pager component [#165](https://github.com/coveo/cli/issues/165) ([f67c3fb](https://github.com/coveo/cli/commit/f67c3fb8ec480403f059578e711394313b2fbb41))

## [1.0.1](https://github.com/coveo/cli/compare/v1.0.0...v1.0.1) (2021-04-17)

### Bug Fixes

- **cli:** allow update to run without the analytics setting being set ([#161](https://github.com/coveo/cli/issues/161)) ([6de528f](https://github.com/coveo/cli/commit/6de528f7bb6e57a7066c083481b2049a855c7730))
- **cli:** append .cmd for npx & npm ([#158](https://github.com/coveo/cli/issues/158)) ([e67238b](https://github.com/coveo/cli/commit/e67238b9bbe87fd65d3a69e67f3b6d8322014679))

# [1.0.0](https://github.com/coveo/cli/compare/v0.8.0...v1.0.0) (2021-04-15)

**Note:** Version bump only for package cli-tools

# [0.8.0](https://github.com/coveo/cli/compare/v0.7.0...v0.8.0) (2021-04-15)

- ci(release)!: first release ([aa65f1b](https://github.com/coveo/cli/commit/aa65f1b6fa0db1f301d51207cc427f5c791ecc57))

### Bug Fixes

- **angular:** fix headless doc links ([#126](https://github.com/coveo/cli/issues/126)) ([c574fda](https://github.com/coveo/cli/commit/c574fda8ba5c598e41d3cda724e030b990bfa9f5))
- **angular:** prevent d.ts files from being copied to project ([#135](https://github.com/coveo/cli/issues/135)) ([44cae70](https://github.com/coveo/cli/commit/44cae70e504895e82cfba64b58e049f05ef4f96c))
- **ci:** ensure .npmrc is properly written ([#127](https://github.com/coveo/cli/issues/127)) ([a1b686b](https://github.com/coveo/cli/commit/a1b686b7dadb1b46d58bc35d5e30ef80eb454afa))
- **server:** always return a JSON object ([#136](https://github.com/coveo/cli/issues/136)) ([8cef023](https://github.com/coveo/cli/commit/8cef023893bd9e3d1afd134332100dfbc3ffb942))

### Features

- **angular:** add node and npm preconditions ([#141](https://github.com/coveo/cli/issues/141)) ([028a422](https://github.com/coveo/cli/commit/028a4221c18591335009a57faeab15d1312ea8dc))
- **angular:** better feedback message on command completion ([#125](https://github.com/coveo/cli/issues/125)) ([13ecb1d](https://github.com/coveo/cli/commit/13ecb1d3ca6c0f376516fda828d93edd46aaf770))
- **angular:** ignore node_modules from server folder ([#154](https://github.com/coveo/cli/issues/154)) ([54c88ad](https://github.com/coveo/cli/commit/54c88ad62374948a2d8797b8ac82d25e81bcc37a))
- **angular:** redirect user to an error page if the `.env` file is invalid ([#140](https://github.com/coveo/cli/issues/140)) ([9ed203b](https://github.com/coveo/cli/commit/9ed203b3e949b2267ba24b3ef92059a9b84428b7))
- **cli:** remove form-data polyfill ([#152](https://github.com/coveo/cli/issues/152)) ([5701223](https://github.com/coveo/cli/commit/57012239f40adeeba364fe6cf20994549f04b26e))
- **cli:** use api key in `.env` file ([#142](https://github.com/coveo/cli/issues/142)) ([2a48f0d](https://github.com/coveo/cli/commit/2a48f0d95e74819cdc6cb5fc6352238be9b09ab5))
- **config:** improve configuration validation on invalid org id ([#128](https://github.com/coveo/cli/issues/128)) ([676b7f3](https://github.com/coveo/cli/commit/676b7f32a7b66c066f5010fe4703a646a7fa4a5e))
- **vue:** better feedback on command completion ([#124](https://github.com/coveo/cli/issues/124)) ([0be987e](https://github.com/coveo/cli/commit/0be987ef246c9f7dcde3e0230b5be59a44ec4609))
- **vue:** fix linting in vue project and rework headless initialization ([#150](https://github.com/coveo/cli/issues/150)) ([336890c](https://github.com/coveo/cli/commit/336890ce22dfc383599d3e2fee61d7e1862b4d6e))
- **vue:** support `npm run serve` command ([#153](https://github.com/coveo/cli/issues/153)) ([375d6ce](https://github.com/coveo/cli/commit/375d6ce68e7a4fec3def8ca92ab879b63e37a96b))

### BREAKING CHANGES

- first release

# [0.7.0](https://github.com/coveo/cli/compare/v0.6.1...v0.7.0) (2021-03-29)

### Bug Fixes

- **angular:** fix search-token-server path ([#115](https://github.com/coveo/cli/issues/115)) ([c4b74e7](https://github.com/coveo/cli/commit/c4b74e75c075b8da082ce0f740ae358177dafebc))
- **angular:** npm start command on Angular project returns warning ([#93](https://github.com/coveo/cli/issues/93)) ([6b0f104](https://github.com/coveo/cli/commit/6b0f104ac3f8ea7cb9338a77a4d4d8bea9712660))
- **cli:** do not print API key when running command `ui:create:vue` ([#117](https://github.com/coveo/cli/issues/117)) ([9cbd8c8](https://github.com/coveo/cli/commit/9cbd8c88966468fa70cc162348bb7f9318791c53))
- **cli:** missing await in authentication decorator ([#109](https://github.com/coveo/cli/issues/109)) ([f54e27c](https://github.com/coveo/cli/commit/f54e27c1b634fa415cf39a655fafea863ce6ed3b))
- **react:** add .env.example to template ([#118](https://github.com/coveo/cli/issues/118)) ([d320c68](https://github.com/coveo/cli/commit/d320c68e174ac95a50b71b81870451adbe368dfd))

### Features

- **cli:** add --version flag for all ui:create:\* commands ([#105](https://github.com/coveo/cli/issues/105)) ([50f699c](https://github.com/coveo/cli/commit/50f699cac450f49c77f44bce590f0ab19d9cc559))
- **login:** improve feedback message on sucessful login ([#107](https://github.com/coveo/cli/issues/107)) ([a2ac53d](https://github.com/coveo/cli/commit/a2ac53ddfb0200a377798e6217135357e5651a97))
- **oauth:** remove keytar dependencies ([#108](https://github.com/coveo/cli/issues/108)) ([ee876e6](https://github.com/coveo/cli/commit/ee876e6d3e96b5271dfe3e5e64af1c3f256f4f4b))
- **react:** improve react hero banner + links ([#114](https://github.com/coveo/cli/issues/114)) ([c43c9f8](https://github.com/coveo/cli/commit/c43c9f840c8c158417f3ba55ccb6336d0cd4e98c))
- **vue:** improve hero banner documentation link ([#110](https://github.com/coveo/cli/issues/110)) ([cc08497](https://github.com/coveo/cli/commit/cc084978f9aa2039f46543a85ddc4452a7ca7593))

## [0.6.1](https://github.com/coveo/cli/compare/v0.6.0...v0.6.1) (2021-03-19)

### Bug Fixes

- **angular:** add missing file to angular project ([#95](https://github.com/coveo/cli/issues/95)) ([4a406c8](https://github.com/coveo/cli/commit/4a406c81a7dc48ba49185f579a634416abd9d5f2))
- **cli:** replace github.ref by GITHUB_REF ([#90](https://github.com/coveo/cli/issues/90)) ([eaa8f35](https://github.com/coveo/cli/commit/eaa8f357d3ac5a467cb1e264e99f5318a7de134d))
- **react:** add missing file & dependencies to React project ([#97](https://github.com/coveo/cli/issues/97)) ([b931776](https://github.com/coveo/cli/commit/b93177664eadc49ed4e37e987404567ea313642f))

# [0.6.0](https://github.com/coveo/cli/compare/v0.5.0...v0.6.0) (2021-03-17)

### Bug Fixes

- **angular:** add definite assignment assertion to props ([#86](https://github.com/coveo/cli/issues/86)) ([85f5b95](https://github.com/coveo/cli/commit/85f5b95cc94be7bc525de42a8b2ecdb29d70506c))
- **angular:** add missing user flag in Angular schematic ([#84](https://github.com/coveo/cli/issues/84)) ([9b5b8a4](https://github.com/coveo/cli/commit/9b5b8a41af7d8a6210402b77a631c00e616db53e))
- **angular:** copy schema only once in postbuild script ([#89](https://github.com/coveo/cli/issues/89)) ([dceea50](https://github.com/coveo/cli/commit/dceea50ef7c76335a51d87505748df7a210ad90c))
- **cli:** make oclif-dev pack:win works on Windows ([#83](https://github.com/coveo/cli/issues/83)) ([2b0f9a7](https://github.com/coveo/cli/commit/2b0f9a74288b057efec8b5102816d53712ff421e))
- **cli:** ui:create:vue command crashes because of invalid preset ([#81](https://github.com/coveo/cli/issues/81)) ([122c862](https://github.com/coveo/cli/commit/122c8622624ffa10f0212b44de77962eaf60e786))
- **react:** use and detect local npx to create-react-app ([#85](https://github.com/coveo/cli/issues/85)) ([b7ac6dd](https://github.com/coveo/cli/commit/b7ac6ddd3f9b26d9720116268549a5ed68754afa))
- **vue:** remove environment variables type warning ([#82](https://github.com/coveo/cli/issues/82)) ([ea5281a](https://github.com/coveo/cli/commit/ea5281a3bc5a69a6709edd9702bfb06e39bf5dac))

### Features

- **cli:** clean-up and refactor entrypoints ([#75](https://github.com/coveo/cli/issues/75)) ([d281787](https://github.com/coveo/cli/commit/d2817874d5eb7c1b7aca0117a9116073a4807162))

# [0.5.0](https://github.com/coveo/cli/compare/v0.4.0...v0.5.0) (2021-03-10)

### Features

- **cli:** support for auto update packaging ([#72](https://github.com/coveo/cli/issues/72)) ([2d7c1c7](https://github.com/coveo/cli/commit/2d7c1c761d9578dfb47d8a92bd5a827e6d2a4b0b))

# [0.4.0](https://github.com/coveo/cli/compare/v0.3.2...v0.4.0) (2021-03-08)

### Features

- **react:** setup a route guard in React to pass search token ([#53](https://github.com/coveo/cli/issues/53)) ([ec8469c](https://github.com/coveo/cli/commit/ec8469c9631f25f61345311f2a1ac2acde39895b))

## [0.3.2](https://github.com/coveo/cli/compare/v0.3.1...v0.3.2) (2021-03-05)

### Bug Fixes

- **macos:** fix app identifier issue on install ([#65](https://github.com/coveo/cli/issues/65)) ([415288b](https://github.com/coveo/cli/commit/415288b937df0aa0638c9d08a8ec2358086de07d))

## [0.3.1](https://github.com/coveo/cli/compare/v0.3.0...v0.3.1) (2021-03-03)

### Bug Fixes

- **cli:** ui:create:vue command not invoking @coveo/typescript correctly ([#60](https://github.com/coveo/cli/issues/60)) ([da6e963](https://github.com/coveo/cli/commit/da6e9633be6f1d90471064239f3b77d5ce8e13e8))
- **vue:** set vue plugin dependencies to any ([#62](https://github.com/coveo/cli/issues/62)) ([f9957b8](https://github.com/coveo/cli/commit/f9957b8dc8e328e2d8d595e36564d842d1fcb9f2))
- **vue:** vue generator template structure with invalid utils path ([#63](https://github.com/coveo/cli/issues/63)) ([7929d56](https://github.com/coveo/cli/commit/7929d56432be1a4adf4d9a46e359bff3df02735b))

# [0.3.0](https://github.com/coveo/cli/compare/v0.2.0...v0.3.0) (2021-02-26)

### Bug Fixes

- **cli:** fix matching tags for binary release ([#49](https://github.com/coveo/cli/issues/49)) ([b515cb3](https://github.com/coveo/cli/commit/b515cb3ff81ab22f0cc3f49e4a9ef7d6158c7549))
- **cli:** use different commit token for release ([#51](https://github.com/coveo/cli/issues/51)) ([53e9a3c](https://github.com/coveo/cli/commit/53e9a3c3171cf0b723a455100c27f76fe69df9b2))
- **vue:** add missing route in Vuejs Router ([#50](https://github.com/coveo/cli/issues/50)) ([1f59970](https://github.com/coveo/cli/commit/1f599707dc7b175d90572dcff49dc722003c7edb))

### Features

- **cli:** extract user email from oauth flow ([#48](https://github.com/coveo/cli/issues/48)) ([136d66b](https://github.com/coveo/cli/commit/136d66b03f0682a9e53b7117272fbe41cf246487))

# 0.2.0 (2021-02-25)

### Bug Fixes

- **analytics:** bump coveo.analytics to fix node js support ([#22](https://github.com/coveo/cli/issues/22)) ([11fad8b](https://github.com/coveo/cli/commit/11fad8ba701dc6098209243f2d34ac5bdabeef5e))
- **analytics:** fix analytics hook for expired or logged out ([#31](https://github.com/coveo/cli/issues/31)) ([1c9964e](https://github.com/coveo/cli/commit/1c9964ecc02c65e6de3616c0f3e5dffa0347fbe3))
- **angular:** components not correctly imported in the Angular app module ([#28](https://github.com/coveo/cli/issues/28)) ([b02909f](https://github.com/coveo/cli/commit/b02909fe0b5ec43ea718420058619959ec7f5d6f))
- **cli:** fix vuejs --preset flag option ([#29](https://github.com/coveo/cli/issues/29)) ([e7df203](https://github.com/coveo/cli/commit/e7df2032a01ad760e5166a161f507de74ae01192))
- **cli:** set user email and name for version release ([9e9b081](https://github.com/coveo/cli/commit/9e9b081501c2955bdb7d1725e342e07df0eff000))

### Features

- **analytics:** add analytics hooks for success and failure ([#18](https://github.com/coveo/cli/issues/18)) ([f4a09d5](https://github.com/coveo/cli/commit/f4a09d58bff4e347c1d8769b92978327a5b9c831))
- **analytics:** add new metadata for analytics, fix validation + UT ([#23](https://github.com/coveo/cli/issues/23)) ([7fc7081](https://github.com/coveo/cli/commit/7fc7081891984e0c596b43f5a011ec7fe5ff91fe))
- **analytics:** analytics disclaimer on first run ([#25](https://github.com/coveo/cli/issues/25)) ([675e8b5](https://github.com/coveo/cli/commit/675e8b521bdce44438c6e1ff9d0a2a98a0962a55))
- **angular:** add all the necessary template files to Angular schematic ([#20](https://github.com/coveo/cli/issues/20)) ([3b4d5fe](https://github.com/coveo/cli/commit/3b4d5feec653525f400bb4f62522238264533d18))
- **angular:** configure the headless engine as a service ([#39](https://github.com/coveo/cli/issues/39)) ([60108e4](https://github.com/coveo/cli/commit/60108e4b959464d946d2f7a5de26193f89fe7b1d))
- **angular:** create an angular schematic ([#19](https://github.com/coveo/cli/issues/19)) ([38aef0f](https://github.com/coveo/cli/commit/38aef0fd358d8b8b6252f7e6bcdd02e58f2323fa))
- **angular:** setup token generation flow for angular project ([#37](https://github.com/coveo/cli/issues/37)) ([00ffa05](https://github.com/coveo/cli/commit/00ffa05d2572e0a0f9b9dc71552e569b3807bca7))
- **cli:** add @coveo/search-token-server package ([#33](https://github.com/coveo/cli/issues/33)) ([23c9035](https://github.com/coveo/cli/commit/23c9035c66dcd15fcc10c5fb038a5d1333929e52))
- **cli:** add auth:login command ([#8](https://github.com/coveo/cli/issues/8)) ([fc29937](https://github.com/coveo/cli/commit/fc2993770d1efd5633e5d8ff00c1d5105535ee59))
- **cli:** add support for storage of access token + config ([#10](https://github.com/coveo/cli/issues/10)) ([c8d0beb](https://github.com/coveo/cli/commit/c8d0bebdb33996097a4688ba568675633cce35ea))
- **cli:** add ui:create:react command ([#13](https://github.com/coveo/cli/issues/13)) ([078bdf2](https://github.com/coveo/cli/commit/078bdf2f44dd7939c00ad7811b412676ef643fa0))
- **cli:** add ui:create:vue command ([#11](https://github.com/coveo/cli/issues/11)) ([d48bc85](https://github.com/coveo/cli/commit/d48bc8594c2857b92fd221fd434e9cbd27802ff3))
- **cli:** connect React project with client's org ([#36](https://github.com/coveo/cli/issues/36)) ([7aec1dd](https://github.com/coveo/cli/commit/7aec1dd37f75be44e3e5b71cd9d8dc47dd5ea3a5))
- **cli:** connect Vuejs project with client's cloud org ([#43](https://github.com/coveo/cli/issues/43)) ([d6dad47](https://github.com/coveo/cli/commit/d6dad47cd0c056fd07a27c18f08de0780a4efcd9))
- **cli:** create command to generate an angular project ([#24](https://github.com/coveo/cli/issues/24)) ([e35b27b](https://github.com/coveo/cli/commit/e35b27b8f7a3ef03be10cf9ce3d6fb5d154328e5))
- **cli:** support for different platform region and environment ([#7](https://github.com/coveo/cli/issues/7)) ([59bc8c1](https://github.com/coveo/cli/commit/59bc8c1a17f8b2ee2b1380f9f23a131008b7bb9c))
- **cli:** support refresh token mechanism ([#14](https://github.com/coveo/cli/issues/14)) ([e8647f3](https://github.com/coveo/cli/commit/e8647f3f21c21ce85588265038571b85bb62e0f5))
- **oauth:** remove refresh token mechanism ([#30](https://github.com/coveo/cli/issues/30)) ([a18712c](https://github.com/coveo/cli/commit/a18712c70c85789ee9cbae0fb75d4c0b991262e1))
- **react:** add template for Create React App CLI ([#12](https://github.com/coveo/cli/issues/12)) ([d9c2ba3](https://github.com/coveo/cli/commit/d9c2ba37d2d23f77614ac6a2ba551f745b7383bd))
- **token-server:** add platformUrl to .env file ([#34](https://github.com/coveo/cli/issues/34)) ([ef167e4](https://github.com/coveo/cli/commit/ef167e4b4cf99af00908d53dffab797bb9e84921))
- **token-server:** add server port to .env file ([#35](https://github.com/coveo/cli/issues/35)) ([491eeb5](https://github.com/coveo/cli/commit/491eeb5f0ac929dd10a1356a9ee01d3683daae1b))
