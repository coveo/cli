# CLI RFCs

This directory contains Request For Comments that apply to the Coveo CLI, or related projects.

## How-to RFC

### Propose:

- Clone the repo
- Create a branch
- Copy accepted/0000-template.md into accepted/0000-your-rfc-name.md
- Fill in and edit the template with your proposal
- Submit a PR

### Implement:

When you implement the matter discussed in a RFC, the PR doing so MUST also move the rfc from accepted to implemented. [^1]

### Withdraw:

If we realize that we won't implement an RFC after we accepted it, we MUST withdraw it and explains why using the [template](./rejected/0000-template.md).

[^1]: This allow to associate a changeset to the source code to a RFC.
