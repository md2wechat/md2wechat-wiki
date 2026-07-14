# 复核日志

## 2026-07-14

- 上游 CLI：`geekjourneyx/md2wechat-skill@f9af7a9110b2b472c8fc3fd9a3103863f6bf3862`，tag `v3.1.0`
- 站点文档：`wechat-markdown-editor@5eeb69cb3ed18042f34eb67f10faf9b8573c1f72`
- 运行检查：先用 `version --json` 确认 v3.1.0，再执行 `capabilities --json`、`themes list --json`、`layout list --json`、`providers list --json`、`prompts list --json`
- 组织首页：改为任务入口，补充贡献与支持路径，提交 `d9cc052`
- Guide：按 v3.1 工作流重写安装、发现、排版、配图、API、FAQ 和迁移说明，提交 `4bd189c`；按纯文档仓库要求移除自动化文件，提交 `14c5f67`
- Awesome List：移除 Star 和主观排名，新增许可证、最近活动、使用边界、待复核状态和关系披露，提交 `0d66a4a`
- Wiki：建立首批事实登记；事实载体按纯文档要求改为 Markdown
- 文风复核：四仓删除报告腔、自言自语式解释和自家项目导流；修正缺少证据的比较；硬规则扫描无命中
- 链接检查：组织首页与 Guide 的公开入口均可访问；Awesome List 共检查 25 个公开链接，均可访问
- 结果：四仓公开口径已同步到同一核验基线

### Wiki 证据索引复核

- 明确 Wiki 是人工维护的证据索引，不是正式教程、SEO/GEO 落地页或自动控制平面
- 将正式使用文档入口统一为 `https://www.md2wechat.cn/docs`
- 新增官方实体、上游 Source Available 和 Wiki CC BY 4.0 的许可证边界
- 为易变事实补充状态和失效条件
- 增加贡献、安全和隐私规则，禁止真实凭证、本机绝对路径和未经整理的内部实施记录
- 保持纯 Markdown，不引入 registry、validator 或 CI
