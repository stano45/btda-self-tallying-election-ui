# Self-Tallying Election UI
This is the UI for: https://github.com/stano45/btda-self-tallying-election

## Install & Run
```bash
# Install dependencies
yarn

# Start the blockchain (in a separate terminal)
ganache-cli

# Deploy the contract (requires the btda-self-tallying-election repo at the same level)
yarn migrate

# Start the UI
yarn dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
WARNING: Login in as voters in sequence, e.g. voter1, voter2, voter3, etc., otherwise there will be an error.

## yarn scripts

### Build and dev scripts

- `dev` – start dev server
- `build` – bundle application for production
- `export` – exports static website to `out` folder
- `analyze` – analyzes application bundle with [@next/bundle-analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

### Testing scripts

- `typecheck` – checks TypeScript types
- `lint` – runs ESLint
- `prettier:check` – checks files with Prettier
- `jest` – runs jest tests
- `jest:watch` – starts jest watch
- `test` – runs `jest`, `prettier:check`, `lint` and `typecheck` scripts

### Other scripts

- `prettier:write` – formats all files with Prettier
