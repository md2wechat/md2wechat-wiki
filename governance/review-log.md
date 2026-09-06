# 复核记录

## 2026-09-06：v3.4.0 与办公 Agent 平台

- **范围**：稳定版本、产品接口、排版数量、v3.2.0 至 v3.4.0 变化、四个办公 Agent 平台。
- **来源**：v3.4.0 Release、tag commit `07fdea284e71ddaf5c6b5311238d7e9c2df3b8af`、该 commit 的 CHANGELOG / README / Discovery 文档与源码、产品路由合同、四个平台官方入口。
- **变化**：当前基线从 v3.1.0 更新为 v3.4.0；排版口径更新为 48 个 API 主题、77 个推荐场景、56 个推荐语法名、63 项渲染语法能力；新增平台状态数据和 30 天复核投影。
- **验证**：检查 Release 与 tag 指向；核对 immutable source 中的版本和数量；运行平台数据测试及验证脚本。未运行四个平台的真实宿主 smoke，也未验证远程草稿闭环。
- **结果**：千问办公、DuMate 为 `install-ready`；WorkBuddy、豆包工作为 `smoke-pending`；四者均为 `publiclySupported=false`。

## 2026-07-14：v3.1.0（历史）

- **范围**：v3.1.0 的项目身份、安装入口、命令、主题与排版、Provider 和提示词。
- **来源**：`geekjourneyx/md2wechat-skill@f9af7a9110b2b472c8fc3fd9a3103863f6bf3862`、当时的站点文档和许可证。
- **验证**：当时记录运行了 `version --json`、`capabilities --json`、`themes list --json`、`layout list --json`、`providers list --json` 和 `prompts list --json`。
- **结果**：作为旧版本复核记录保留；当前内容以 2026-09-06 的 v3.4.0 基线为准。
