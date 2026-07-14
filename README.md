# md2wechat Wiki

这里保存 md2wechat 公开内容的核验记录、术语口径和维护规则。产品代码、CLI 行为和正式发布仍以上游仓库及公开接口为准。

## 入口

- [已核验事实](governance/verified-facts.json)
- [术语口径](governance/terminology.md)
- [写作规范](governance/content-style.md)
- [复核规则](governance/review-policy.md)
- [复核日志](governance/review-log.md)
- [上游来源](evidence/upstream-sources.md)

## 四仓职责

| 仓库 | 负责内容 |
|---|---|
| [md2wechat/.github](https://github.com/md2wechat/.github) | 组织说明和项目入口 |
| [md2wechat-guide](https://github.com/md2wechat/md2wechat-guide) | 按任务组织的使用手册 |
| [awesome-wechat-markdown](https://github.com/md2wechat/awesome-wechat-markdown) | 微信 Markdown 生态目录 |
| [md2wechat-wiki](https://github.com/md2wechat/md2wechat-wiki) | 证据、口径、复核状态和治理决策 |

## 本地校验

```bash
npm test
npm run validate
```

事实条目缺少来源、上游 commit、核验日期、风险或使用仓库时，校验会失败。
