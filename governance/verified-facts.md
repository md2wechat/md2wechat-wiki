# 当前事实

核验日期：2026-09-14

上游基线：[`v3.6.0@9cb3318f84ff980d1cac41ab0fafbcec525ef6dd`](https://github.com/geekjourneyx/md2wechat-skill/tree/9cb3318f84ff980d1cac41ab0fafbcec525ef6dd)

本页记录对使用和内容维护影响最大的事实。安装步骤和完整命令以 [md2wechat 文档中心](https://www.md2wechat.cn/docs)为准。

## 产品与接口

| 项目 | 当前事实 | 来源 |
|---|---|---|
| md2wechat | 面向 AI Agent 的微信公众号创作与发布 CLI | [产品路由合同](https://github.com/md2wechat/.github/blob/main/facts/product-routes.json) |
| 稳定版本 | `v3.6.0`，tag commit 为 `9cb3318f84ff980d1cac41ab0fafbcec525ef6dd` | [Release](https://github.com/geekjourneyx/md2wechat-skill/releases/tag/v3.6.0) · [commit](https://github.com/geekjourneyx/md2wechat-skill/commit/9cb3318f84ff980d1cac41ab0fafbcec525ef6dd) |
| Convert API | `POST https://www.md2wechat.cn/api/convert`，将 Markdown 转成微信兼容 HTML，不创建草稿 | [API 文档](https://www.md2wechat.cn/api-docs) |
| Publishing API | `https://md2wechat.com/api/v1`，用于素材和草稿相关写操作 | [产品路由合同](https://github.com/md2wechat/.github/blob/main/facts/product-routes.json) |

Publishing API 创建草稿后，文章仍在公众号草稿箱中；这不等于发送或群发。涉及上传和草稿创建时，应在执行前取得用户授权。

## 主题与高级排版

| 维度 | v3.6.0 数量 | 含义 | 来源 |
|---|---:|---|---|
| API 主题 | 48 | API 模式可选择的主题 | [README@v3.6.0](https://github.com/geekjourneyx/md2wechat-skill/blob/9cb3318f84ff980d1cac41ab0fafbcec525ef6dd/README.md) |
| 推荐场景 | 77 | 内容用途到排版选择的场景映射 | [LAYOUT.md@v3.6.0](https://github.com/geekjourneyx/md2wechat-skill/blob/9cb3318f84ff980d1cac41ab0fafbcec525ef6dd/docs/LAYOUT.md) |
| 推荐语法名 | 56 | `layout list --json` 默认给出的推荐语法对象 | [DISCOVERY.md@v3.6.0](https://github.com/geekjourneyx/md2wechat-skill/blob/9cb3318f84ff980d1cac41ab0fafbcec525ef6dd/docs/DISCOVERY.md) |
| 渲染语法能力 | 63 | 56 个推荐语法名、3 个兼容模块和 4 个基础增强能力的合计 | [discovery.go@v3.6.0](https://github.com/geekjourneyx/md2wechat-skill/blob/9cb3318f84ff980d1cac41ab0fafbcec525ef6dd/cmd/md2wechat/discovery.go) |

四组数字不能互换，也不能统一称为“模块数量”。

## 图片生成服务

v3.6.0 枚举 8 个 canonical provider：OpenAI（`openai`）、MiniMax（`minimax`）、Atlas Cloud（`atlascloud`）、TuZi（`tuzi`）、ModelScope（`modelscope`）、OpenRouter（`openrouter`）、Gemini（`gemini`）、Volcengine（`volcengine`）。别名不重复计数。

Atlas Cloud 是 v3.5.0 新增；TuZi 是既有服务，不能把此前清单漏记写成新功能。Atlas Cloud 默认模型为 `openai/gpt-image-2/text-to-image`，默认尺寸为 `1024x1024`。来源：[图片服务文档](https://github.com/geekjourneyx/md2wechat-skill/blob/9cb3318f84ff980d1cac41ab0fafbcec525ef6dd/docs/IMAGE_PROVISIONERS.md)。

以上是版本化文档与发现接口的能力记录，不代表本轮调用了外部图片服务或完成四宿主实测。上游 Release 或来源变化时重新核验。

## v3.2.0 至 v3.6.0 变化

- `v3.2.0`：调整 Discovery 数据职责；API 预览只写转换器返回的 HTML，AI 预览返回 `PREVIEW_ACTION_REQUIRED`；草稿相关检查在远程写操作前完成。
- `v3.3.0`：将高级排版口径校准为 77 / 56 / 63，并补充标题、结尾和 Agent 字段读取顺序。
- `v3.4.0`：增加 MiniMax 图片生成，并在 Provider 查询结果中公开 `supports_subject_reference`；主体参考能力限定为 MiniMax `image-01`。
- `v3.5.0`：新增 Atlas Cloud，支持 `atlascloud`、`atlas-cloud`、`atlas` 三个名称；排版口径保持 48 / 77 / 56 / 63。
- `v3.6.0`：新增 `sync prepare` 与知乎、CSDN、头条未发布草稿流程，见下文。

以上内容来自 [CHANGELOG@v3.6.0](https://github.com/geekjourneyx/md2wechat-skill/blob/9cb3318f84ff980d1cac41ab0fafbcec525ef6dd/CHANGELOG.md)。这里记录接口和发现字段，不作性能评价。

## v3.6.0 多平台未发布草稿

发布于 2026-09-12 15:41:59 UTC。`sync prepare` 将普通 Markdown 准备为本地 `body.html`；输出目录必须尚不存在，父目录必须存在，不修改原稿、不复制或上传图片。高级排版模块、原始 HTML、未解析 Obsidian 语法需先整理，远程图片须另行下载并改为本地引用。

收到 `SYNC_PREPARED` 只表示本地准备成功。浏览器 Agent 还需在已登录账号中完成知乎、CSDN、头条的图片上传、正文填写、草稿保存，并重新打开核对标题、全文、图片位置和主要结构。准备成功不等于草稿完成，不包含公开发布。头条多级标题应在写入前暂停，经作者同意调整原稿；中断后继续已有草稿，避免重复创建。

依据：[SYNC.md](https://github.com/geekjourneyx/md2wechat-skill/blob/9cb3318f84ff980d1cac41ab0fafbcec525ef6dd/docs/SYNC.md)、[SMOKE.md](https://github.com/geekjourneyx/md2wechat-skill/blob/9cb3318f84ff980d1cac41ab0fafbcec525ef6dd/docs/SMOKE.md)。上游记录为 macOS、Chrome 已登录会话实测；不能外推到其他系统或四大办公 Agent。本次仅核对原始资料，未执行草稿或外部图片服务。

## 办公 Agent 平台

| 平台 | 当前状态 | 下一步 |
|---|---|---|
| 千问办公 | `install-ready` | 在可用宿主中安装，再检查 CLI、版本、能力、预览和授权后的草稿流程 |
| DuMate | `install-ready` | 在可用宿主中安装，再检查 CLI、版本、能力、预览和授权后的草稿流程 |
| WorkBuddy | `smoke-pending` | 先确认技能接入方式，再执行相同 smoke |
| 豆包工作 | `smoke-pending` | 先确认技能接入方式，再执行相同 smoke |

四个平台当前均为 `publiclySupported=false`，不能写成 md2wechat 已支持平台。记录与复核日期见 [agent-platforms.json](../evidence/agent-platforms.json)。

## 许可证

- 上游源码适用 [md2wechat Source Available License@v3.6.0](https://github.com/geekjourneyx/md2wechat-skill/blob/9cb3318f84ff980d1cac41ab0fafbcec525ef6dd/LICENSE)。
- Wiki 原创内容适用 [CC BY 4.0](../LICENSE.md)。
- 更完整的实体和许可边界见[项目身份](project-identity.md)。
