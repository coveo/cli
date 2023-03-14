- Feature Name: Taxonomy for Atomic in the Coveo CLI
- Start Date: 2023-03-08

# Summary

[summary]: #summary

Create a one-stop-shop topic for CLI user that uses Atomic:

- `atomic:deploy` as an alias for `ui:deploy`
- `atomic:init` would either 'run' `ui:create:atomic` or start a blank lib project `npm init @coveo/atomic-component-project`, depending on user input.
- `atomic:component` (also available with alias `atomic:cmp`) would either `npm init @coveo/atomic-component` or `npm init @coveo/atomic-result-component`

# Motivation

[motivation]: #motivation

With the addition of the Custom Component creation in the Coveo CLI, an issue arise:
A user using atomic would have to navigate in at least 3 topics:

- `ui`, for `ui:deploy`
- `ui:create`, for `ui:atomic`
- `tbd` for the custom components commands, or mix it up in `ui:create`.

To avoid this confusion, we should have everything related to atomic present in an eponym topic (directly or as an alias)

# Guide-level explanation

[guide-level-explanation]: #guide-level-explanation

An Oclif command can be aliased to another with minimal configuration:

```ts
import {Command, Flags} from '@oclif/core';

export class ConfigIndex extends Command {
  static aliases = ['config:index', 'config:list'];
}
```

https://oclif.io/docs/aliases

That work if the logic required by the alias is identical to the aliased command, otherwise, it is recommended to "break up the code so that it can be called directly" ([Oclif doc](https://oclif.io/docs/running_programmatically))

# Reference-level explanation

[reference-level-explanation]: #reference-level-explanation

1. Add an alias on `ui:deploy`
2. Refactor logic of `ui:create:atomic` in another file
3. Create `atomic:init`.
   - Flags: `type`, can be either `lib(rary)` or `app(lication)`. Optional.
   - Args: `name`, name of the project. Required.
   - Logic:
     - if `type` undefined, ask the user what kind of project he want to init. Store in `type`
     - then if `type` is `lib`, run `npm init @coveo/atomic-component-project <args.name>`
     - then if `type` is `app`, run invoke the logic of `ui:create:atomic` that we refactored on step 2
4. Create `atomic:cmp`.
   - Flags: `type`, can be either `page` or `result`. Optional.
   - Args: `name`, name of the component. Required.
   - Logic:
     - if `type` undefined, ask the user what kind of project he want to init. Store in `type`
     - then if `type` is `page`, run `npm init @coveo/atomic-component <args.name>`
     - then if `type` is `result`, run `npm init @coveo/atomic-result-component <args.name>`

# Drawbacks

[drawbacks]: #drawbacks

Each alias is essentially another command we can't break.

# Rationale and alternatives

[rationale-and-alternatives]: #rationale-and-alternatives

Alternatively, we can accept to have the commands for atomic-custom-component in another topic.
I dislike this alternative because I think it has the potential of creating confusion for our users.

Alternatively, we can rename the command instead of aliasing. This would be a breaking change, which makes it a bad alternative.

I think that having a single topic for atomic is the clearest option for the user: "You want to work with Atomic, just type atomic"
For the realisation, alias comes with little to no effort, and the maintenance cost is low.

# Prior art

[prior-art]: #prior-art

- [SFDX, lightning commands](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_lightning_commands_unified.htm): Everything is under the lightning topic.

# Unresolved questions

[unresolved-questions]: #unresolved-questions

- exact name of commands, flags, and args are TBD

# Future possibilities

[future-possibilities]: #future-possibilities

If this kind of topic is prefered by user, we could try to reproduce this process in another area of the CLI
We can also keep that in mind as we extend the feature set of the CLI.

We could also:

- Extract Atomic into its own plugin
- Make this plugin exposes its 'CLI'. This would allow to simplify `coveo atomic:init` to `atomic init` for example.
