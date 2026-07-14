# 已核验事实

核验日期：2026-07-14

上游基线：[`geekjourneyx/md2wechat-skill@f9af7a9`](https://github.com/geekjourneyx/md2wechat-skill/tree/f9af7a9110b2b472c8fc3fd9a3103863f6bf3862)

默认状态：`verified`

本页是带日期的事实快照。安装、配置和命令用法以 [md2wechat 文档中心](https://www.md2wechat.cn/docs)为准；当前运行时能力优先通过所安装 CLI 的 discovery 命令确认。

## 官方实体与许可证

| 事实 | 核验结果 | 风险 | 状态 | 失效条件 | 证据 | 使用位置 |
|---|---|---|---|---|---|---|
| 官方产品源码 | `geekjourneyx/md2wechat-skill` | P0 | `verified` | 仓库迁移、重命名或改变所有者 | [GitHub 仓库](https://github.com/geekjourneyx/md2wechat-skill) | README、项目身份、Wiki |
| 正式文档入口 | `https://www.md2wechat.cn/docs` | P0 | `verified` | 文档域名或主路由变化 | [文档中心](https://www.md2wechat.cn/docs) | README、项目身份、Wiki |
| 上游许可证 | md2wechat Source Available License；Change Date 为 2030-01-01，之后转为 Apache-2.0 | P0 | `verified` | 上游 LICENSE、Change Date 或适用范围变化 | [LICENSE@f9af7a9](https://github.com/geekjourneyx/md2wechat-skill/blob/f9af7a9110b2b472c8fc3fd9a3103863f6bf3862/LICENSE) | README、项目身份、Wiki |
| Wiki 许可证 | CC BY 4.0，仅覆盖本仓库原创治理文本和事实编排 | P0 | `verified` | 本仓库 LICENSE 变化 | [LICENSE](../LICENSE.md) | README、贡献规则、Wiki |

完整边界见[项目身份](project-identity.md)。

## 版本与接口

| 事实 | 核验结果 | 风险 | 状态 | 失效条件 | 证据 | 使用位置 |
|---|---|---|---|---|---|---|
| 稳定版本 | `v3.1.0` | P0 | `verified` | 发布新的稳定版本、撤回 Release 或 tag 指向变化 | [Release](https://github.com/geekjourneyx/md2wechat-skill/releases/tag/v3.1.0)；精确 tag 对应 `f9af7a9` | Guide、Wiki |
| 公开稳定转换接口 | `POST https://www.md2wechat.cn/api/convert` | P0 | `verified` | 路径、认证、请求或响应契约变化 | [API 文档](https://www.md2wechat.cn/api-docs)；站点基线 `wechat-markdown-editor@5eeb69c` | Guide、Wiki |

## CLI 能力

顶层 CLI 共 25 个命令：

`convert`、`inspect`、`advise`、`preview`、`config`、`write`、`humanize`、`title`、`upload_image`、`download_and_upload`、`generate_image`、`generate_cover`、`generate_infographic`、`create_draft`、`create_image_post`、`test-draft`、`providers`、`themes`、`prompts`、`layout`、`brand`、`doctor`、`skills`、`capabilities`、`version`。

- 风险：P0
- 状态：`verified`
- 失效条件：顶层命令新增、删除、重命名或行为边界变化
- 证据：[CLI 入口源码](https://github.com/geekjourneyx/md2wechat-skill/blob/f9af7a9110b2b472c8fc3fd9a3103863f6bf3862/cmd/md2wechat/main.go)
- 核验命令：`md2wechat capabilities --json`
- 使用位置：Guide、Wiki

## 主题与排版

| 事实 | 核验结果 | 风险 | 状态 | 失效条件 | 证据与命令 |
|---|---|---|---|---|---|
| 主题目录 | 53 个目录条目，52 个可选主题；API 主题 48 个，AI 主题 4 个 | P1 | `verified` | discovery 输出数量或主题分类变化 | [discovery.go](https://github.com/geekjourneyx/md2wechat-skill/blob/f9af7a9110b2b472c8fc3fd9a3103863f6bf3862/cmd/md2wechat/discovery.go)；`md2wechat themes list --json` |
| 高级排版 | 68 个主推场景、53 个主推语法名、60 项渲染语法能力、3 个兼容模块、4 个基础增强 | P1 | `verified` | layout schema、推荐集合或 discovery 输出变化 | [schema.go](https://github.com/geekjourneyx/md2wechat-skill/blob/f9af7a9110b2b472c8fc3fd9a3103863f6bf3862/internal/layoutcatalog/schema.go)；`md2wechat capabilities --json` |

数字含义见[术语口径](terminology.md)。正式文档应优先引导用户运行 discovery 命令，减少版本变化造成的陈旧描述。

## 图片工作流

| 模式 | 核验结果 | 风险 | 状态 | 失效条件 | 证据 |
|---|---|---|---|---|---|
| 计划模式 | 返回 `IMAGE_PLAN_READY`；由宿主 Agent 执行；不要求 Provider；不直接调用图片服务 | P0 | `verified` | response code、执行所有者、Provider 要求或副作用变化 | [discovery.go](https://github.com/geekjourneyx/md2wechat-skill/blob/f9af7a9110b2b472c8fc3fd9a3103863f6bf3862/cmd/md2wechat/discovery.go) |
| 直接生成 | 需要 Provider 和图片 API Key；会调用外部图片服务 | P0 | `verified` | Provider、凭证要求或外部调用边界变化 | [discovery.go](https://github.com/geekjourneyx/md2wechat-skill/blob/f9af7a9110b2b472c8fc3fd9a3103863f6bf3862/cmd/md2wechat/discovery.go) |

## Provider 与提示词

### 图片 Provider

- 核验结果：`gemini`、`modelscope`、`openai`、`openrouter`、`tuzi`、`volcengine`
- 风险：P1
- 状态：`verified`
- 失效条件：Provider 新增、删除、重命名或 discovery 输出变化
- 证据：[源码](https://github.com/geekjourneyx/md2wechat-skill/blob/f9af7a9110b2b472c8fc3fd9a3103863f6bf3862/internal/image/provider.go)
- 核验命令：`md2wechat providers list --json`

### 内置提示词

- 核验结果：32 个，其中图片 25 个、humanizer 5 个、refine 1 个、title 1 个
- 风险：P1
- 状态：`verified`
- 失效条件：提示词目录、分类或 discovery 输出变化
- 证据：[源码](https://github.com/geekjourneyx/md2wechat-skill/blob/f9af7a9110b2b472c8fc3fd9a3103863f6bf3862/internal/promptcatalog/catalog.go)
- 核验命令：`md2wechat prompts list --json`

## 使用规则

- 数量或行为变化时，先把相关条目标为 `review-due`，完成原始来源核验后再更新结果与日期。
- 事实成为历史用法时改为 `historical`，并链接替代路径，不直接删除迁移所需证据。
- Wiki 只记录已完成的人工核验，不承诺自动同步 Guide、官网或其他仓库。
