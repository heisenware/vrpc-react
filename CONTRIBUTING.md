# Contributing to vrpc-react

Thank you for considering a contribution! Whether it's a bug report, a
documentation fix, or a new feature - all help is welcome.

## Reporting bugs & requesting features

Please use the
[GitHub issue tracker](https://github.com/heisenware/vrpc-react/issues).
For bugs, include:

- the `vrpc-react`, `vrpc`, and React versions you are using
- your backend setup (agent language, broker)
- a minimal reproduction if possible - the [example app](example/) is a good
  starting point

## Development setup

You need **Node.js >= 20.19** (required by the Vite 8 build toolchain).

```bash
git clone https://github.com/heisenware/vrpc-react.git
cd vrpc-react
npm install
```

Useful scripts:

| Script              | Purpose                                             |
| :------------------ | :-------------------------------------------------- |
| `npm run lint`      | Lint the whole repository                           |
| `npm run format`    | Auto-fix lint and formatting issues                 |
| `npm run typecheck` | Type-check the library with TypeScript              |
| `npm run build`     | Build the distributable bundles + type declarations |

To try your changes against a running system, use the
[example](example/README.md): start the backend agent and the frontend, which
consumes the library directly from your working tree (`file:../..`).

## Code style

The project uses [neostandard](https://github.com/neostandard/neostandard)
(no semicolons, 2-space indent), enforced through ESLint - there is no
separate formatter. If you use VS Code, the committed workspace settings
format on save automatically; otherwise run `npm run format` before
committing.

## Pull requests

1. Fork and create a feature branch off `master`.
2. Keep the PR focused on one change.
3. Make sure `npm run lint`, `npm run typecheck`, and `npm run build` all
   pass - CI runs exactly these.
4. Describe *why* the change is needed, not only what it does.

By contributing, you agree that your contributions will be licensed under the
[MIT License](LICENSE).
