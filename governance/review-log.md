# 复核记录

## 2026-09-10：v3.5.0 与图片服务事实校准

- **范围**：当前版本、版本锁、来源链接、图片服务清单；平台证据保持 2026-09-06 的独立核验日期与原状态。
- **来源**：[v3.5.0 Release](https://github.com/geekjourneyx/md2wechat-skill/releases/tag/v3.5.0)、commit `cbc8c600ed1f9cccbc29a33576f657c07d39ba9a` 的 VERSION、README、LICENSE、Layout、Discovery 和 IMAGE_PROVISIONERS。
- **变化**：稳定版本更新为 v3.5.0；图片服务为 8 个 canonical provider，Atlas Cloud 新增，TuZi 为既有服务；48 / 77 / 56 / 63 口径不变。
- **边界**：不执行图片生成、上传、草稿或四宿主测试；历史复核记录保留。官方 Linux 二进制 SHA-256 与 Release 匹配；`version`、`capabilities`、`skills read`、`providers list/show`、`themes list`、`layout list` 只读查询成功；12 项测试、证据校验和真实上游漂移检查通过。

## 2026-09-06：v3.4.0 与办公 Agent 平台

- **范围**：稳定版本、产品接口、排版数量、v3.2.0 至 v3.4.0 变化、四个办公 Agent 平台。
- **来源**：v3.4.0 Release、tag commit `07fdea284e71ddaf5c6b5311238d7e9c2df3b8af`、该 commit 的 CHANGELOG / README / Discovery 文档与源码、产品路由合同、四个平台官方入口，以及千问办公和 DuMate 的官方 Skill 安装文档。
- **变化**：当前基线从 v3.1.0 更新为 v3.4.0；排版口径更新为 48 个 API 主题、77 个推荐场景、56 个推荐语法名、63 项渲染语法能力；新增平台状态数据、30 天复核投影、本地锁校验和每日上游漂移检查。
- **验证**：检查 Release 与 tag 指向；核对 immutable source 中的版本和数量；官方文档确认千问办公可通过在线 URL 或 SKILL.zip 安装、DuMate 可通过 URL 或 .zip/.md 导入；运行平台数据和锁测试及验证脚本。未在四个平台中安装 md2wechat，也未验证远程草稿闭环。
- **结果**：千问办公、DuMate 为 `install-ready`；WorkBuddy、豆包工作为 `smoke-pending`；四者均为 `publiclySupported=false`。

## 2026-07-14：v3.1.0（历史）

- **范围**：v3.1.0 的项目身份、安装入口、命令、主题与排版、Provider 和提示词。
- **来源**：`geekjourneyx/md2wechat-skill@f9af7a9110b2b472c8fc3fd9a3103863f6bf3862`、当时的站点文档和许可证。
- **验证**：当时记录运行了 `version --json`、`capabilities --json`、`themes list --json`、`layout list --json`、`providers list --json` 和 `prompts list --json`。
- **结果**：作为旧版本复核记录保留；当前内容以 2026-09-06 的 v3.4.0 基线为准。
