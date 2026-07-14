# 已核验事实

核验日期：2026-07-14  
上游基线：[`geekjourneyx/md2wechat-skill@f9af7a9`](https://github.com/geekjourneyx/md2wechat-skill/tree/f9af7a9110b2b472c8fc3fd9a3103863f6bf3862)

## 版本与接口

| 事实 | 核验结果 | 风险 | 证据 | 使用仓库 |
|---|---|---|---|---|
| 当前稳定版本 | `v3.1.0` | P0 | [Release](https://github.com/geekjourneyx/md2wechat-skill/releases/tag/v3.1.0)；精确 tag 对应 `f9af7a9` | Guide、Wiki |
| 公开稳定转换接口 | `POST https://www.md2wechat.cn/api/convert` | P0 | [API 文档](https://www.md2wechat.cn/api-docs)；站点基线 `wechat-markdown-editor@5eeb69c` | Guide、Wiki |

## CLI 能力

顶层 CLI 共 25 个命令：

`convert`、`inspect`、`advise`、`preview`、`config`、`write`、`humanize`、`title`、`upload_image`、`download_and_upload`、`generate_image`、`generate_cover`、`generate_infographic`、`create_draft`、`create_image_post`、`test-draft`、`providers`、`themes`、`prompts`、`layout`、`brand`、`doctor`、`skills`、`capabilities`、`version`。

- 风险：P0
- 证据：[CLI 入口源码](https://github.com/geekjourneyx/md2wechat-skill/blob/f9af7a9110b2b472c8fc3fd9a3103863f6bf3862/cmd/md2wechat/main.go)
- 核验命令：`md2wechat capabilities --json`
- 使用仓库：Guide、Wiki

## 主题与排版

| 事实 | 核验结果 | 风险 | 证据与命令 |
|---|---|---|---|
| 主题目录 | 53 个目录条目，52 个可选主题；API 主题 48 个，AI 主题 4 个 | P1 | [discovery.go](https://github.com/geekjourneyx/md2wechat-skill/blob/f9af7a9110b2b472c8fc3fd9a3103863f6bf3862/cmd/md2wechat/discovery.go)；`md2wechat themes list --json` |
| 高级排版 | 68 个主推场景、53 个主推语法名、60 项渲染语法能力、3 个兼容模块、4 个基础增强 | P1 | [schema.go](https://github.com/geekjourneyx/md2wechat-skill/blob/f9af7a9110b2b472c8fc3fd9a3103863f6bf3862/internal/layoutcatalog/schema.go)；`md2wechat capabilities --json` |

数字含义见[术语口径](terminology.md)。Guide 正文优先引导用户运行发现命令，减少版本变化造成的陈旧描述。

## 图片工作流

| 模式 | 核验结果 | 风险 | 证据 |
|---|---|---|---|
| 计划模式 | 返回 `IMAGE_PLAN_READY`；由宿主 Agent 执行；不要求 Provider；不直接调用图片服务 | P0 | [discovery.go](https://github.com/geekjourneyx/md2wechat-skill/blob/f9af7a9110b2b472c8fc3fd9a3103863f6bf3862/cmd/md2wechat/discovery.go) |
| 直接生成 | 需要 Provider 和图片 API Key；会调用外部图片服务 | P0 | [discovery.go](https://github.com/geekjourneyx/md2wechat-skill/blob/f9af7a9110b2b472c8fc3fd9a3103863f6bf3862/cmd/md2wechat/discovery.go) |

## Provider 与提示词

- 图片 Provider：`gemini`、`modelscope`、`openai`、`openrouter`、`tuzi`、`volcengine`。风险 P1；[源码](https://github.com/geekjourneyx/md2wechat-skill/blob/f9af7a9110b2b472c8fc3fd9a3103863f6bf3862/internal/image/provider.go)；核验命令 `md2wechat providers list --json`。
- 内置提示词：32 个，其中图片 25 个、humanizer 5 个、refine 1 个、title 1 个。风险 P1；[源码](https://github.com/geekjourneyx/md2wechat-skill/blob/f9af7a9110b2b472c8fc3fd9a3103863f6bf3862/internal/promptcatalog/catalog.go)；核验命令 `md2wechat prompts list --json`。

本页事实由 Guide 和 Wiki 使用。数量变化时，先更新核验结果与日期，再检查引用页面。
