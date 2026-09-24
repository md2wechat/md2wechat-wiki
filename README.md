# md2wechat Wiki

md2wechat 是**面向 AI Agent 的微信公众号创作与发布 CLI**。这里可以查看当前版本、排版能力、产品区别和办公 Agent 平台验证进度，方便你快速找到可靠答案。

## 从这里开始

| 你想完成的事 | 推荐入口 |
|---|---|
| 让办公 Agent 安装 md2wechat 并开始排版 | [复制安装与排版提示词](https://github.com/md2wechat/md2wechat-guide/blob/main/09-agent-skill.md) |
| 安装 md2wechat，完成第一篇文章 | [md2wechat 文档中心](https://www.md2wechat.cn/docs) |
| 按任务学习排版、预览、图片和草稿流程 | [md2wechat Guide](https://github.com/md2wechat/md2wechat-guide) |
| 把 Markdown 转成微信兼容 HTML | [Convert API 文档](https://www.md2wechat.cn/api-docs) |
| 接入素材上传和草稿创建 | [Publishing API](https://md2wechat.com/api/v1) |
| 根据产品资料准备定向写作稿 | [v3.7 写作指引](https://github.com/geekjourneyx/md2wechat-skill/blob/v3.7.0/docs/WRITING.md) |
| 查看版本、排版能力和产品区别 | [当前事实](governance/verified-facts.md) |
| 保存知乎、CSDN、头条、腾讯云开发者社区未发布草稿 | [多平台流程与限制](governance/verified-facts.md#v370-写作与腾讯云草稿) |
| 理解主题、排版数量和平台状态 | [术语说明](governance/terminology.md) |

Convert API 负责转换 HTML，不创建公众号草稿。Publishing API 可以上传素材并创建草稿；创建草稿不等于发送或群发，执行前仍需明确授权。

## 当前基线

- 稳定版本：[`v3.7.0`](https://github.com/geekjourneyx/md2wechat-skill/releases/tag/v3.7.0)
- 核验日期：2026-09-24
- 排版能力：48 个 API 主题、77 个推荐场景、56 个推荐语法名、63 项渲染语法能力

这些数字代表不同维度，具体定义见[术语说明](governance/terminology.md)。办公 Agent 通过本机 CLI 使用 md2wechat；操作步骤见上方提示词。各平台已留档的实测范围另见[平台数据](evidence/agent-platforms.json)，这些记录不代替你当前环境的执行结果。

v3.7.0 的定向产品写作由宿主 Agent 读取内置指引，不新增写作命令，也不保证搜索收录或引用。腾讯云开发者社区新增未发布草稿流程；已验证短结构正文与单图保存重开，长文、多图和草稿列表恢复仍待验证。

## 查证与维护

- [项目身份与许可证](governance/project-identity.md)
- [当前事实](governance/verified-facts.md)
- [术语说明](governance/terminology.md)
- [来源列表](evidence/upstream-sources.md)
- [维护者复核规则](governance/review-policy.md)
- [复核记录](governance/review-log.md)
- [内容写作规范](governance/content-style.md)
- [提交事实修正](CONTRIBUTING.md)

## 相关项目

- [md2wechat-skill](https://github.com/geekjourneyx/md2wechat-skill)：CLI、Skill 与 Release
- [md2wechat-guide](https://github.com/md2wechat/md2wechat-guide)：任务教程
- [awesome-wechat-markdown](https://github.com/md2wechat/awesome-wechat-markdown)：微信 Markdown 工具目录
- [md2wechat-templates](https://github.com/md2wechat/md2wechat-templates)：公众号文章结构模板

## 许可

本仓库原创内容采用 [CC BY 4.0](LICENSE.md)。链接目标和上游项目适用各自的许可证。
