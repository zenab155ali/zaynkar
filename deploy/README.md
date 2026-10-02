# Deployment

ZAYNKAR is deployed to **GitHub Pages** from the `gh-pages` branch (kept separate from `main`, which only holds source code).

- **Latest version:** https://zenab155ali.github.io/zaynkar/
- **All versions:** https://zenab155ali.github.io/zaynkar/versions/

Every deploy is kept permanently at `versions/vN/`, so old links never break, while the root `/` always serves the newest version. `deploy/versions.json` is the ledger of what's been deployed.

## How a deploy works

Each version is built **twice** with different Vite `--base` paths — once for the root (`/zaynkar/`) and once archived (`/zaynkar/versions/vN/`) — because the base path is baked into the JS/CSS asset URLs at build time. Both copies are then combined into one `gh-pages` branch commit, replacing the previous root but keeping every past `versions/vN/` folder untouched.

Because this is a client-side React Router app, two extra pieces make deep links (e.g. `/shop/dresses`, a shared product link) work on GitHub Pages' static file server:

1. `index.html` has a small inline script that decodes a redirected URL back to the real path.
2. Each build gets its own `404.html` (the [spa-github-pages](https://github.com/rafgraph/spa-github-pages) technique) that redirects unknown paths through `index.html`.

`src/main.tsx` passes `basename={import.meta.env.BASE_URL}` to `BrowserRouter` so routing works correctly under both the root and the `versions/vN/` subpath — this requires no change for future deploys.

## Running a new deploy

Ask Claude to redeploy, or run `deploy/deploy.sh <next-version-number>` from the repo root (Git Bash). It will:

1. Build the root bundle and the archived `versions/vN/` bundle.
2. Generate the matching `404.html` for each.
3. Check out the `gh-pages` branch into a temporary worktree, replace the root with the new build, add the new `versions/vN/` folder, update `versions/index.html`.
4. Commit and push `gh-pages`.
5. Update `deploy/versions.json` on `main` and commit.

GitHub Pages republishes automatically within ~30–60 seconds of the `gh-pages` push.
