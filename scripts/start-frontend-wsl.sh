#!/usr/bin/env bash
set -euo pipefail

cd /mnt/d/mianshiti/web/docs-site

if ! command -v node >/dev/null 2>&1; then
  echo "未检测到 Linux 侧 node，请先在 WSL 里安装 Node.js。"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "未检测到 Linux 侧 npm，请先在 WSL 里安装 npm。"
  exit 1
fi

npm run start -- --host 0.0.0.0 --port 3000
