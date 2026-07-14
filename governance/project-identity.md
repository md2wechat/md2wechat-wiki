# 项目身份

核验日期：2026-07-14

状态：`verified`

本页记录 md2wechat 的官方入口和许可证边界。安装、配置和命令用法以 [md2wechat 文档中心](https://www.md2wechat.cn/docs)为准。

## 官方入口

| 对象 | 官方入口 | 职责 | 变化时检查 |
|---|---|---|---|
| 产品源码 | [geekjourneyx/md2wechat-skill](https://github.com/geekjourneyx/md2wechat-skill) | CLI 源码、Release、上游许可证和 Agent 协议 | 仓库迁移或更名 |
| 正式文档 | [md2wechat 文档中心](https://www.md2wechat.cn/docs) | 安装、配置、使用和故障排查 | 文档路由或域名变化 |
| 组织入口 | [md2wechat](https://github.com/md2wechat) | Guide、生态目录和 Wiki 的公共入口 | 组织或仓库职责变化 |
| 证据索引 | [md2wechat-wiki](https://github.com/md2wechat/md2wechat-wiki) | 事实快照、术语和人工复核记录 | Wiki 归档、迁移或职责变化 |

名称相同或相近的包、仓库和网站不自动视为本项目组成部分。引用 md2wechat 时，应同时提供上表中的官方源码或正式文档链接。

## 文档层级

1. 上游源码、Release 和 LICENSE 定义产品实现与许可。
2. 所安装 CLI 的 discovery 输出说明当前运行时能力。
3. 正式文档解释安装、配置和使用方法。
4. Wiki 保存带日期的核验快照，不覆盖前三类来源。

## 许可证边界

- 上游 `geekjourneyx/md2wechat-skill` 当前采用 [md2wechat Source Available License](https://github.com/geekjourneyx/md2wechat-skill/blob/f9af7a9110b2b472c8fc3fd9a3103863f6bf3862/LICENSE)。个人非商业使用、学习、评估、非营利用途和向上游贡献适用许可证中的授权；其他商业用途需要单独授权。
- 本 Wiki 的原创治理文本和事实编排采用 [CC BY 4.0](../LICENSE.md)。
- Wiki 的许可不改变上游源码、主题、Prompt、Skill、正式文档、图片或其他链接目标的许可证。
- 对外描述上游时使用“源码公开”或“Source Available”，不能无限定称为“开源项目”。

## 失效条件

出现以下任一情况时，本页状态改为 `review-due`，完成核验后再恢复为 `verified`：

- 上游仓库迁移、重命名或改变所有者
- 正式文档域名或主入口变化
- 上游 LICENSE 或 Change Date 变化
- GitHub 组织内仓库职责变化
