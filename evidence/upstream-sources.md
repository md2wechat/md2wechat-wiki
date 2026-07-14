# 上游来源

## CLI 与发布

- 源码：[geekjourneyx/md2wechat-skill](https://github.com/geekjourneyx/md2wechat-skill)
- v3.1.0：[Release](https://github.com/geekjourneyx/md2wechat-skill/releases/tag/v3.1.0)
- CLI 接入手册：[md2wechat 文档](https://www.md2wechat.cn/docs/md2wechat)
- Agent 协议：[SKILL.md](https://www.md2wechat.cn/docs/md2wechat/skill.md)
- API：[API 文档](https://www.md2wechat.cn/api-docs)

## 核验命令

```bash
md2wechat version --json
md2wechat capabilities --json
md2wechat themes list --json
md2wechat layout list --json
md2wechat providers list --json
md2wechat prompts list --json
```

源码构建显示 `dev` 时，以当前 commit 的精确 tag 作为版本证据。发布二进制的 `version --json` 仍应返回正式版本号。

## 使用规则

- 原始来源优先于本仓登记。
- 搜索摘要不能替代源码、Release 或正式文档。
- 外部项目能力需要链接到项目文档或可复现测试。
- GitHub Stars 会持续变化，不进入事实登记。
