# 上游来源

本页列出事实核验使用的原始来源。Wiki 是证据索引，不替代这些来源。

## 来源优先级

1. LICENSE、源码和精确 commit：定义实现、许可证和静态契约。
2. Release 和精确 tag：定义公开稳定版本。
3. 所安装 CLI 的 discovery 输出：定义当前二进制实际暴露的能力。
4. [md2wechat 文档中心](https://www.md2wechat.cn/docs)：定义面向用户的安装、配置和使用说明。
5. Wiki：保存带日期的人工核验快照，不覆盖前四类来源。

搜索摘要、模型回答、截图和第三方转述不能替代原始来源。

## 产品、版本与许可证

- 源码：[geekjourneyx/md2wechat-skill](https://github.com/geekjourneyx/md2wechat-skill)
- v3.1.0：[Release](https://github.com/geekjourneyx/md2wechat-skill/releases/tag/v3.1.0)
- 核验 commit：[`f9af7a9110b2b472c8fc3fd9a3103863f6bf3862`](https://github.com/geekjourneyx/md2wechat-skill/tree/f9af7a9110b2b472c8fc3fd9a3103863f6bf3862)
- 上游许可证：[LICENSE@f9af7a9](https://github.com/geekjourneyx/md2wechat-skill/blob/f9af7a9110b2b472c8fc3fd9a3103863f6bf3862/LICENSE)
- Wiki 许可证：[CC BY 4.0](../LICENSE.md)

## 正式文档与接口

- 文档中心：[md2wechat 文档](https://www.md2wechat.cn/docs)
- CLI 接入手册：[md2wechat CLI](https://www.md2wechat.cn/docs/md2wechat)
- Agent 协议：[SKILL.md](https://www.md2wechat.cn/docs/md2wechat/skill.md)
- API：[API 文档](https://www.md2wechat.cn/api-docs)

## CLI discovery

```bash
md2wechat version --json
md2wechat capabilities --json
md2wechat themes list --json
md2wechat layout list --json
md2wechat providers list --json
md2wechat prompts list --json
```

运行 discovery 前，先确认 `version --json` 返回值与事实页声明的基线一致；版本不一致时停止比较，并切换到匹配的发布二进制。源码构建显示 `dev` 时，以所检 commit 的精确 tag 作为版本证据。

## 使用规则

- 每项易变事实记录来源、版本或 commit、核验日期、状态和失效条件。
- 外部项目能力需要链接到其官方文档、源码或可复现验证结果。
- GitHub Stars、下载量和其他持续变化的展示数字不进入稳定事实登记。
- 原始来源相互冲突时，将 Wiki 条目标为 `review-due`，记录冲突，不自行猜测结论。
