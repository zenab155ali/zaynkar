#!/usr/bin/env bash
# Deploys a new ZAYNKAR version to GitHub Pages.
#
# Usage: deploy/deploy.sh <version-number> ["note"]
# Run from the repo root, on a clean `main` working tree, with `gh` authenticated.
set -euo pipefail

# Under Git Bash on Windows, MSYS rewrites any argument that looks like an absolute
# POSIX path (e.g. "/zaynkar/") into a Windows path (e.g. "C:\Program Files\Git\zaynkar\")
# before the child process ever sees it — silently corrupting the --base value below.
export MSYS_NO_PATHCONV=1

VERSION="${1:?Usage: deploy/deploy.sh <version-number> [\"note\"]}"
NOTE="${2:-}"
REPO="zenab155ali/zaynkar"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [ -n "$(git status --porcelain)" ]; then
  echo "Working tree not clean — commit or stash changes on main first." >&2
  exit 1
fi

echo "==> Building version $VERSION"
rm -rf dist-root dist-v
npx tsc -b
npx vite build --base="/" --outDir=dist-root
npx vite build --base="/versions/v$VERSION/" --outDir="dist-v"

make_404() {
  local out="$1" segments="$2"
  cat > "$out" <<EOF
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>ZAYNKAR</title>
    <script type="text/javascript">
      var pathSegmentsToKeep = $segments;
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body></body>
</html>
EOF
}
# pathSegmentsToKeep: 0 at the domain root (/), 2 for an archived version (/versions/vN/)
make_404 dist-root/404.html 0
make_404 dist-v/404.html 2

echo "==> Updating gh-pages branch"
rm -rf gh-pages-wt
git worktree add gh-pages-wt gh-pages
rm -rf gh-pages-wt/assets gh-pages-wt/index.html gh-pages-wt/404.html gh-pages-wt/favicon.svg
cp -r dist-root/. gh-pages-wt/
mkdir -p "gh-pages-wt/versions/v$VERSION"
cp -r dist-v/. "gh-pages-wt/versions/v$VERSION/"

python - "$VERSION" "$NOTE" <<'PYEOF'
import sys, re, pathlib
version, note = sys.argv[1], sys.argv[2]
p = pathlib.Path("gh-pages-wt/versions/index.html")
html = p.read_text(encoding="utf-8") if p.exists() else (
    '<!doctype html><html lang="en"><head><meta charset="utf-8" />'
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" />'
    '<title>ZAYNKAR — Deployed Versions</title>'
    '<style>body{font-family:-apple-system,Segoe UI,Inter,sans-serif;background:#faf8f5;'
    'color:#1b1917;max-width:40rem;margin:4rem auto;padding:0 1.5rem;line-height:1.6}'
    'h1{font-size:1.75rem}ul{padding-left:1.2rem}a{color:#1b1917}'
    '.tag{font-size:0.75rem;color:#6c645b}</style></head><body>'
    '<h1>ZAYNKAR — Deployed Versions</h1>'
    '<p>Every deployed version stays at its own permanent link. <a href="../">Latest version is here.</a></p>'
    '<ul></ul></body></html>'
)
entry = f'<li><a href="v{version}/">Version {version}</a>' + (f' <span class="tag">— {note}</span>' if note else '') + '</li>'
html = re.sub(r'(<ul>)', r'\1\n      ' + entry, html, count=1)
p.write_text(html, encoding="utf-8")
PYEOF

cd gh-pages-wt
git add -A
git commit -m "Deploy: version $VERSION${NOTE:+ ($NOTE)}"
git push origin gh-pages
cd "$ROOT"
git worktree remove gh-pages-wt --force
rm -rf dist-root dist-v

python - "$VERSION" "$NOTE" <<'PYEOF'
import json, sys, datetime, subprocess
version, note = int(sys.argv[1]), sys.argv[2]
sha = subprocess.check_output(["git", "rev-parse", "--short", "HEAD"]).decode().strip()
path = "deploy/versions.json"
data = json.load(open(path, encoding="utf-8"))
data["latestVersion"] = version
data["versions"].append({"version": version, "date": datetime.date.today().isoformat(), "commit": sha, "note": note or "Update"})
json.dump(data, open(path, "w", encoding="utf-8"), indent=2)
open(path, "a", encoding="utf-8").write("\n")
PYEOF
git add deploy/versions.json
git commit -m "Record deployed version $VERSION"
git push

echo ""
echo "Deployed."
echo "  Latest:   https://zaynkar.com/"
echo "  Version $VERSION: https://zaynkar.com/versions/v$VERSION/"
echo "  All versions: https://zaynkar.com/versions/"
echo "  (github.io/zaynkar now redirects to zaynkar.com automatically)"
