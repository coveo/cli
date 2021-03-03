# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.3.1](https://github.com/coveo/cli/compare/v0.3.0...v0.3.1) (2021-03-03)


### Bug Fixes

* **cli:** ui:create:vue command not invoking @coveo/typescript correctly ([#60](https://github.com/coveo/cli/issues/60)) ([da6e963](https://github.com/coveo/cli/commit/da6e9633be6f1d90471064239f3b77d5ce8e13e8))
* **vue:** set vue plugin dependencies to any ([#62](https://github.com/coveo/cli/issues/62)) ([f9957b8](https://github.com/coveo/cli/commit/f9957b8dc8e328e2d8d595e36564d842d1fcb9f2))
* **vue:** vue generator template structure with invalid utils path ([#63](https://github.com/coveo/cli/issues/63)) ([7929d56](https://github.com/coveo/cli/commit/7929d56432be1a4adf4d9a46e359bff3df02735b))





# [0.3.0](https://github.com/coveo/cli/compare/v0.2.0...v0.3.0) (2021-02-26)


### Bug Fixes

* **cli:** fix matching tags for binary release ([#49](https://github.com/coveo/cli/issues/49)) ([b515cb3](https://github.com/coveo/cli/commit/b515cb3ff81ab22f0cc3f49e4a9ef7d6158c7549))
* **cli:** use different commit token for release ([#51](https://github.com/coveo/cli/issues/51)) ([53e9a3c](https://github.com/coveo/cli/commit/53e9a3c3171cf0b723a455100c27f76fe69df9b2))
* **vue:** add missing route in Vuejs Router ([#50](https://github.com/coveo/cli/issues/50)) ([1f59970](https://github.com/coveo/cli/commit/1f599707dc7b175d90572dcff49dc722003c7edb))


### Features

* **cli:** extract user email from oauth flow ([#48](https://github.com/coveo/cli/issues/48)) ([136d66b](https://github.com/coveo/cli/commit/136d66b03f0682a9e53b7117272fbe41cf246487))





# 0.2.0 (2021-02-25)


### Bug Fixes

* **analytics:** bump coveo.analytics to fix node js support ([#22](https://github.com/coveo/cli/issues/22)) ([11fad8b](https://github.com/coveo/cli/commit/11fad8ba701dc6098209243f2d34ac5bdabeef5e))
* **analytics:** fix analytics hook for expired or logged out ([#31](https://github.com/coveo/cli/issues/31)) ([1c9964e](https://github.com/coveo/cli/commit/1c9964ecc02c65e6de3616c0f3e5dffa0347fbe3))
* **angular:** components not correctly imported in the Angular app module ([#28](https://github.com/coveo/cli/issues/28)) ([b02909f](https://github.com/coveo/cli/commit/b02909fe0b5ec43ea718420058619959ec7f5d6f))
* **cli:** fix vuejs --preset flag option ([#29](https://github.com/coveo/cli/issues/29)) ([e7df203](https://github.com/coveo/cli/commit/e7df2032a01ad760e5166a161f507de74ae01192))
* **cli:** set user email and name for version release ([9e9b081](https://github.com/coveo/cli/commit/9e9b081501c2955bdb7d1725e342e07df0eff000))


### Features

* **analytics:** add analytics hooks for success and failure ([#18](https://github.com/coveo/cli/issues/18)) ([f4a09d5](https://github.com/coveo/cli/commit/f4a09d58bff4e347c1d8769b92978327a5b9c831))
* **analytics:** add new metadata for analytics, fix validation + UT ([#23](https://github.com/coveo/cli/issues/23)) ([7fc7081](https://github.com/coveo/cli/commit/7fc7081891984e0c596b43f5a011ec7fe5ff91fe))
* **analytics:** analytics disclaimer on first run ([#25](https://github.com/coveo/cli/issues/25)) ([675e8b5](https://github.com/coveo/cli/commit/675e8b521bdce44438c6e1ff9d0a2a98a0962a55))
* **angular:** add all the necessary template files to Angular schematic ([#20](https://github.com/coveo/cli/issues/20)) ([3b4d5fe](https://github.com/coveo/cli/commit/3b4d5feec653525f400bb4f62522238264533d18))
* **angular:** configure the headless engine as a service ([#39](https://github.com/coveo/cli/issues/39)) ([60108e4](https://github.com/coveo/cli/commit/60108e4b959464d946d2f7a5de26193f89fe7b1d))
* **angular:** create an angular schematic ([#19](https://github.com/coveo/cli/issues/19)) ([38aef0f](https://github.com/coveo/cli/commit/38aef0fd358d8b8b6252f7e6bcdd02e58f2323fa))
* **angular:** setup token generation flow for angular project ([#37](https://github.com/coveo/cli/issues/37)) ([00ffa05](https://github.com/coveo/cli/commit/00ffa05d2572e0a0f9b9dc71552e569b3807bca7))
* **cli:** add @coveo/search-token-server package ([#33](https://github.com/coveo/cli/issues/33)) ([23c9035](https://github.com/coveo/cli/commit/23c9035c66dcd15fcc10c5fb038a5d1333929e52))
* **cli:** add auth:login command  ([#8](https://github.com/coveo/cli/issues/8)) ([fc29937](https://github.com/coveo/cli/commit/fc2993770d1efd5633e5d8ff00c1d5105535ee59))
* **cli:** add support for storage of access token + config ([#10](https://github.com/coveo/cli/issues/10)) ([c8d0beb](https://github.com/coveo/cli/commit/c8d0bebdb33996097a4688ba568675633cce35ea))
* **cli:** add ui:create:react command ([#13](https://github.com/coveo/cli/issues/13)) ([078bdf2](https://github.com/coveo/cli/commit/078bdf2f44dd7939c00ad7811b412676ef643fa0))
* **cli:** add ui:create:vue command ([#11](https://github.com/coveo/cli/issues/11)) ([d48bc85](https://github.com/coveo/cli/commit/d48bc8594c2857b92fd221fd434e9cbd27802ff3))
* **cli:** connect React project with client's org ([#36](https://github.com/coveo/cli/issues/36)) ([7aec1dd](https://github.com/coveo/cli/commit/7aec1dd37f75be44e3e5b71cd9d8dc47dd5ea3a5))
* **cli:** connect Vuejs project with client's cloud org ([#43](https://github.com/coveo/cli/issues/43)) ([d6dad47](https://github.com/coveo/cli/commit/d6dad47cd0c056fd07a27c18f08de0780a4efcd9))
* **cli:** create command to generate an angular project ([#24](https://github.com/coveo/cli/issues/24)) ([e35b27b](https://github.com/coveo/cli/commit/e35b27b8f7a3ef03be10cf9ce3d6fb5d154328e5))
* **cli:** support for different platform region and environment  ([#7](https://github.com/coveo/cli/issues/7)) ([59bc8c1](https://github.com/coveo/cli/commit/59bc8c1a17f8b2ee2b1380f9f23a131008b7bb9c))
* **cli:** support refresh token mechanism ([#14](https://github.com/coveo/cli/issues/14)) ([e8647f3](https://github.com/coveo/cli/commit/e8647f3f21c21ce85588265038571b85bb62e0f5))
* **oauth:** remove refresh token mechanism ([#30](https://github.com/coveo/cli/issues/30)) ([a18712c](https://github.com/coveo/cli/commit/a18712c70c85789ee9cbae0fb75d4c0b991262e1))
* **react:** add template for Create React App CLI ([#12](https://github.com/coveo/cli/issues/12)) ([d9c2ba3](https://github.com/coveo/cli/commit/d9c2ba37d2d23f77614ac6a2ba551f745b7383bd))
* **token-server:** add platformUrl to .env file ([#34](https://github.com/coveo/cli/issues/34)) ([ef167e4](https://github.com/coveo/cli/commit/ef167e4b4cf99af00908d53dffab797bb9e84921))
* **token-server:** add server port to .env file ([#35](https://github.com/coveo/cli/issues/35)) ([491eeb5](https://github.com/coveo/cli/commit/491eeb5f0ac929dd10a1356a9ee01d3683daae1b))
