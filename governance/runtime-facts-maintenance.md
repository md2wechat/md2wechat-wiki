# 维护运行时事实

`evidence/runtime-facts.json` 是生态仓的机器可读事实入口，记录当前版本、发布日期、四类数量、模板数、图片服务、价格、接口和多平台草稿边界。每组事实附原始来源。办公 Agent 状态继续由 `evidence/agent-platforms.json` 管理，不复制第二套平台状态。

四仓的 `.md2wechat/ecosystem-facts.lock.json` 固定上游 VERSION、产品路由和平台来源；`.md2wechat/runtime-facts.sha` 固定已经人工校准的事实文件 Git blob SHA。摘要只证明审阅者接受了对应事实快照，不证明模板或宿主重新实测。

## Release 后更新

1. 读取 Release、解析 tag 到完整 commit，核对 VERSION 和相应文档。主题/场景/语法/能力保持独立计数。
2. 更新事实文件和当前文档。Atlas Cloud 在 v3.5 加入，TuZi 为既有 provider；不能把新版本文档日期当作功能首发日期。
3. 保留历史迁移段落、模板 `verifiedWith` 和平台实测日期。三内容平台草稿证据不升级四办公 Agent 状态。
4. 运行 `node --test tests/*.test.mjs`、`node scripts/validate-evidence.mjs`、`node scripts/check-upstream-drift.mjs`。
5. 用 `git hash-object evidence/runtime-facts.json` 得到摘要；四仓文档核对后更新各自的 `.md2wechat/runtime-facts.sha`，提交 PR。

## 自动追踪

核心仓 `geekjourneyx/wechat-markdown-editor` 的工作流每 12 小时检查一次，也可手动运行。执行代码固定到已审阅 Wiki commit；数据读取 Wiki 和四仓各自的默认分支快照。只有核心仓工作流 token 可以写入核心仓 Issue，不需要跨仓写权限。

同一 Release 以 `<!-- md2wechat-runtime-drift:vX.Y.Z -->` 去重，遍历开放及关闭 Issue 的全部分页。自动内容限定在 `drift:start/end` 区块，保留人工意见，不关闭或重新打开 Issue；无差异不写入。并发由工作流串行化。人工意见请写在自动区块外或评论中。

检查范围：最新 Release、四仓 runtime/产品/平台锁、完整事实快照摘要；快照发生变化时逐字段列出旧值、新值、仓库和来源。历史文档不扫描为当前版本。它不能自动判断自然语言文案是否正确，也不会从上游 Release 猜测 provider 或价格；新事实仍需人工查证。

读取、鉴权、限流或来源解析失败会让任务失败，不发布“没有漂移”的结论，不根据不完整扫描建 Issue。必须先合并 Wiki 和其他三仓的初始摘要，再启用核心仓工作流。缺失摘要会阻断扫描，Actions 页面保留错误；恢复来源后可手动重跑。

每 12 小时是计划频率，GitHub 调度延迟、Actions 额度不足会影响执行，不能承诺严格 24 小时 SLA。这里不修改 API 服务、不运行 API 或可视化测试、不调用图片服务、不创建草稿，也不自动提交 PR、合并或发布。

需求与审批：[W38 Issue #11](https://github.com/geekjourneyx/wechat-markdown-editor/issues/11)，A-001 / A-002。
