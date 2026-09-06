# 事实复核规则（维护者）

本页供 Wiki 维护者使用，说明事实如何进入当前页面、何时降级，以及如何记录检查结果。

## 必填信息

易变事实需要包含：事实内容、原始来源、版本或完整 commit、核验日期、状态、失效条件和使用位置。关键字段缺失时，状态不能设为 `verified`。

## 状态与复核期

一般事实使用：

- `verified`：已按当前版本核对原始来源。
- `review-due`：来源变化、出现冲突或超过复核期限，需要重新检查。
- `historical`：只用于旧版本和迁移记录，并指向当前替代路径。

办公 Agent 平台使用 `verified`、`compatible`、`install-ready`、`smoke-pending`、`unsupported`、`review-due`。平台记录超过 30 天未复核时，投影为 `review-due` 并设置 `publiclySupported=false`。只有 `verified` 或 `compatible` 可以公开写“支持”。

升级平台到 `verified` 前，需要保存脱敏结果：宿主安装成功、CLI 可见、`version --json`、`capabilities --json`、`inspect` 和预览。若声称草稿能力，还需在用户授权后完成一次真实草稿闭环。

## 风险级别

- **P0，合并前确认**：稳定版本、安装和 CLI 参数、产品 URL、许可证、凭证与授权边界、远程写操作。
- **P1，14 天内复核**：主题和排版数量、Provider、提示词目录、API 能力、项目状态和比较结论。
- **P2，季度抽查**：普通措辞、示例场景和外围元数据。

## 复核步骤

1. 明确触发变化的来源或失效条件。
2. 保存原始 URL、版本或完整 commit。
3. 先把受影响内容标为 `review-due`。
4. 使用匹配版本核对 Release、源码、许可证或 CLI 的只读查询。
5. 更新事实、日期、状态和使用位置。
6. 在复核记录中写明范围、来源、变化和实际验证。

未执行的 CLI 查询或外部 smoke 不能记录为“已验证”。

## 安全

不要提交真实 API Key、Token、AppID、AppSecret、Cookie、私钥、未脱敏错误输出、本机绝对路径或私人信息。示例凭证使用明显占位符。
