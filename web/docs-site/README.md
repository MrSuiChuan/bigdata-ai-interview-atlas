# Docs Site

这个站点基于 Docusaurus 构建，直接读取仓库根目录下的 `docs/` 内容。

## 本地命令

```bash
npm install
npm run start
npm run build
npm run serve
```

## GitHub Pages 部署

仓库已经支持通过 GitHub Actions 自动部署到 GitHub Pages。

### 默认行为

如果这是普通仓库，例如 `https://github.com/<owner>/<repo>`：

- 站点地址会自动推导为 `https://<owner>.github.io/<repo>/`
- `url` 和 `baseUrl` 不需要手工写死

如果这是用户主页仓库，例如 `<owner>.github.io`：

- 站点地址会自动推导为 `https://<owner>.github.io/`

### 可选覆盖变量

如果你要使用自定义域名，或者想手动覆盖默认推导，可以在 GitHub 仓库的 `Settings -> Secrets and variables -> Actions -> Variables` 中设置：

- `DOCS_SITE_URL`：例如 `https://docs.example.com`
- `DOCS_SITE_BASE_URL`：例如 `/` 或 `/mianshiti/`
- `DOCS_SITE_OWNER`：可选，覆盖仓库 owner
- `DOCS_SITE_REPO`：可选，覆盖仓库名

### 启用方式

1. 把仓库推到 GitHub
2. 默认分支使用 `main`
3. 在仓库 `Settings -> Pages` 中把 Source 切换为 `GitHub Actions`
4. 推送到 `main` 后，工作流 `.github/workflows/deploy-pages.yml` 会自动构建并发布

## 说明

1. 站点通过 `../../docs` 读取仓库根目录内容。
2. 知识库文档使用 `kb_id`，因为 Docusaurus 会保留 frontmatter 中的 `id`。
3. `webpack` 固定为 `5.105.0`，是为了规避当前 Docusaurus 组合下的兼容性问题。
