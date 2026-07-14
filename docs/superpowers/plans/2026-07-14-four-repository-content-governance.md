# Four-Repository Content Governance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the md2wechat organization profile, Guide, Awesome List, and Wiki into four distinct, evidence-backed content assets without modifying any other repository.

**Architecture:** `md2wechat-wiki` records verified claims, terminology, review policy, and writing rules while upstream repositories remain the original sources. The organization profile routes visitors, the Guide explains user tasks, and the Awesome List publishes a neutral ecosystem dataset and generated directory. Validation is local to each repository; high-risk factual conflicts fail checks while lower-risk review dates remain visible for human review.

**Tech Stack:** Markdown, JSON, Node.js standard library, Bash, GitHub Actions, `md2wechat` CLI read-only discovery.

## Global Constraints

- Writable repositories: `.github`, `awesome-wechat-markdown`, `md2wechat-guide`, `md2wechat-wiki` only.
- Read-only repositories: `/root/go/src/md2wechat-skill`, `wechat-markdown-editor`, `md2wechat-templates`, and every other repository.
- Do not use the sentence pattern `不是……而是……` or promotional filler such as `最强`, `领先`, `一站式`, `全面升级`, `赋能`.
- Every changing number, command, compatibility claim, or project status must include a source and verification date.
- Upstream repositories are original sources; the Wiki is an evidence and review registry.
- Preserve stable Guide paths. Historical commands may appear only in the migration guide and must be marked historical.
- No hard-coded GitHub star counts.
- No composite competitor ranking or unsupported recommendation.

---

### Task 1: Establish the Wiki evidence registry

**Files:**
- Create: `README.md`
- Create: `governance/verified-facts.json`
- Create: `governance/terminology.md`
- Create: `governance/content-style.md`
- Create: `governance/review-policy.md`
- Create: `governance/review-log.md`
- Create: `evidence/upstream-sources.md`
- Create: `scripts/validate-facts.mjs`
- Create: `tests/validate-facts.test.mjs`
- Create: `package.json`
- Create: `.github/workflows/content-quality.yml`

**Interfaces:**
- Consumes: read-only output from `md2wechat version --json`, `capabilities --json`, `themes list --json`, and `layout list --json`.
- Produces: `governance/verified-facts.json`, with entries containing `id`, `claim`, `value`, `source`, `source_commit`, `verified_at`, `risk`, `status`, and `used_by`.

- [ ] **Step 1: Write a failing registry test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { validateRegistry } from "../scripts/validate-facts.mjs";

test("rejects facts without evidence metadata", () => {
  const result = validateRegistry([{ id: "version", value: "3.1.0" }]);
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /source_commit/);
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `node --test tests/validate-facts.test.mjs`
Expected: FAIL because `scripts/validate-facts.mjs` does not exist.

- [ ] **Step 3: Implement the registry validator and current verified facts**

The validator must reject duplicate IDs, missing required fields, dates outside `YYYY-MM-DD`, risk outside `P0|P1|P2`, and status outside `verified|review-due|historical`. Populate the registry only from read-only upstream discovery captured on 2026-07-14.

- [ ] **Step 4: Add the human governance documents**

Write the repository purpose, terminology for themes/modules/scenarios/render capabilities, prohibited prose patterns, P0/P1/P2 policy, and a review log containing the upstream commit used for the first audit.

- [ ] **Step 5: Add zero-dependency validation commands**

```json
{
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test",
    "validate": "node scripts/validate-facts.mjs governance/verified-facts.json"
  }
}
```

- [ ] **Step 6: Run validation**

Run: `npm test && npm run validate`
Expected: all tests pass and output reports the verified fact count.

- [ ] **Step 7: Commit**

```bash
git add README.md governance evidence scripts tests package.json .github/workflows/content-quality.yml docs/superpowers/plans/2026-07-14-four-repository-content-governance.md
git commit -m "docs: establish evidence governance wiki"
```

### Task 2: Rebuild the organization profile as a router

**Files:**
- Modify: `profile/README.md`
- Create: `CONTRIBUTING.md`
- Create: `SUPPORT.md`

**Interfaces:**
- Consumes: stable entity summary and repository roles from the Wiki.
- Produces: a short public organization entry point with one destination per user intent.

- [ ] **Step 1: Record the current failure cases**

Run: `rg -n "30 分钟|可发布稿|40\+|43 个|最强|领先|一站式|不是.*而是" profile/README.md`
Expected: matches show unstable or promotional positioning that must be removed.

- [ ] **Step 2: Rewrite the profile**

The first screen must contain one factual entity sentence, routes for use/docs/ecosystem/governance/support, and no changing capability counts. Add a compact repository table and an explicit statement that source/runtime facts live in the upstream project while governance evidence is recorded in the Wiki.

- [ ] **Step 3: Add contribution and support routing**

`CONTRIBUTING.md` must route documentation, ecosystem-entry, Wiki-evidence, and upstream product issues to their correct repositories. `SUPPORT.md` must distinguish public issues from credential or security-sensitive reports without exposing secrets.

- [ ] **Step 4: Verify prose and links**

Run: `rg -n "30 分钟|40\+|43 个|最强|领先|一站式|全面升级|赋能|不是.*而是" profile/README.md CONTRIBUTING.md SUPPORT.md`
Expected: no matches.

Run: `npx --yes markdown-link-check profile/README.md CONTRIBUTING.md SUPPORT.md`
Expected: no broken links, allowing only documented transient GitHub rate-limit failures.

- [ ] **Step 5: Commit**

```bash
git add profile/README.md CONTRIBUTING.md SUPPORT.md
git commit -m "docs: clarify md2wechat organization routes"
```

### Task 3: Rewrite the Guide around verified v3.1 tasks

**Files:**
- Modify: `README.md`
- Modify: `01-quick-start.md`
- Modify: `02-installation.md`
- Modify: `03-themes-and-styles.md`
- Modify: `04-advanced-typesetting.md`
- Modify: `05-ai-image.md`
- Modify: `06-api-guide.md`
- Modify: `07-faq.md`
- Create: `08-migration-v3.md`
- Create: `CONTRIBUTING.md`
- Create: `scripts/verify-docs.sh`
- Create: `.github/workflows/content-quality.yml`

**Interfaces:**
- Consumes: Wiki verified-fact registry and current read-only upstream CLI help/discovery.
- Produces: stable task pages whose commands can be statically validated and whose changing claims carry source/version context.

- [ ] **Step 1: Make the current guide audit fail visibly**

Run: `rg -n "v2\.[0-9]|config check|--images|minimal-dark|elegant-serif|focus-mono|43 个|3 个基础主题|--cover --draft|convert .* --draft$" *.md`
Expected: multiple matches across the current Guide.

- [ ] **Step 2: Rewrite README and Quick Start**

Use task-oriented language. The minimum path must cover installation verification, `doctor`, `inspect`, theme/layout discovery, preview, convert, and explicit draft-publishing prerequisites. Avoid time promises and generic claims.

- [ ] **Step 3: Rewrite installation and discovery pages**

Use versionless install commands where supported. Document `config validate`, `doctor --json`, `themes list/show`, and the three count terms: recommended scenario entries, recommended syntax names, and render capabilities.

- [ ] **Step 4: Rewrite image, API, and FAQ pages**

Separate cover generation, infographic generation, image planning, and publishing. Document the stable API surface without inventing endpoints. Turn FAQ answers into symptom → check → command → result paths.

- [ ] **Step 5: Add the v3 migration page**

List historical v2 commands and their v3 replacements in a labeled table. Historical strings are allowed only in this file.

- [ ] **Step 6: Add the repository verification script**

The script must fail when stale tokens appear outside `08-migration-v3.md`, when promotional patterns appear in any Markdown file, or when required Guide files are missing.

- [ ] **Step 7: Run Guide checks**

Run: `bash scripts/verify-docs.sh`
Expected: PASS.

Run: `npx --yes markdown-link-check README.md 01-quick-start.md 02-installation.md 03-themes-and-styles.md 04-advanced-typesetting.md 05-ai-image.md 06-api-guide.md 07-faq.md 08-migration-v3.md CONTRIBUTING.md`
Expected: no broken links, allowing only documented transient GitHub rate-limit failures.

- [ ] **Step 8: Commit**

```bash
git add README.md 01-quick-start.md 02-installation.md 03-themes-and-styles.md 04-advanced-typesetting.md 05-ai-image.md 06-api-guide.md 07-faq.md 08-migration-v3.md CONTRIBUTING.md scripts .github/workflows/content-quality.yml
git commit -m "docs: align guide with md2wechat v3 workflow"
```

### Task 4: Convert the Awesome List into a verified dataset

**Files:**
- Create: `data/projects.json`
- Create: `scripts/validate-data.mjs`
- Create: `scripts/generate-readme.mjs`
- Create: `tests/catalog.test.mjs`
- Create: `METHODOLOGY.md`
- Modify: `CONTRIBUTING.md`
- Replace generated content: `README.md`
- Create: `package.json`
- Create: `.github/workflows/content-quality.yml`

**Interfaces:**
- Consumes: public repository metadata and evidence URLs verified on 2026-07-14.
- Produces: sorted neutral directory generated from `data/projects.json` and a machine-checkable contribution contract.

- [ ] **Step 1: Write failing catalog tests**

Tests must reject duplicate URLs, missing license/status/verification date/evidence, promotional descriptions, hard-coded star counts, and unsupported category names.

- [ ] **Step 2: Run the tests and verify failure**

Run: `node --test tests/catalog.test.mjs`
Expected: FAIL because the validator and dataset do not exist.

- [ ] **Step 3: Define categories and verified seed entries**

Allowed categories: `editors-formatters`, `publishing-sync`, `agent-skills`, `mcp-servers`, `ide-plugins`, `api-services`, `templates-learning`, `archive-import`. Each entry must record name, repository, category, description, license, deployment, capabilities, last release or activity, last verified date, evidence URLs, limitations, relationship disclosure, and status.

- [ ] **Step 4: Implement deterministic README generation**

The generator must sort categories in the documented order and entries alphabetically. It must emit scope, selection principles, category table of contents, factual entries, inactive section, contribution link, methodology link, and CC0 license. It must never emit star counts or a total score.

- [ ] **Step 5: Write methodology and contribution rules**

Document inclusion, evidence, status, review date, conflict-of-interest disclosure, correction, inactivity, and removal. One project per pull request is the default.

- [ ] **Step 6: Generate and verify**

Run: `npm test && npm run generate && npm run check`
Expected: tests pass and `git diff --exit-code README.md` exits 0 after regeneration.

- [ ] **Step 7: Commit**

```bash
git add README.md CONTRIBUTING.md METHODOLOGY.md data scripts tests package.json .github/workflows/content-quality.yml
git commit -m "docs: turn awesome list into verified catalog"
```

### Task 5: Cross-repository verification and organization metadata

**Files:**
- Modify if required by validation: only files already listed in Tasks 1–4.
- External in-scope settings: md2wechat organization description, website, repository descriptions, topics, and public pins.

**Interfaces:**
- Consumes: all four completed repositories.
- Produces: a scope-safe release candidate and an evidence-backed handoff.

- [ ] **Step 1: Verify the write boundary**

Run status checks in all local repositories. Expected changes or commits may exist only in `.github`, `awesome-wechat-markdown`, `md2wechat-guide`, and `md2wechat-wiki`. Record unchanged HEADs for `md2wechat-skill`, `wechat-markdown-editor`, and `md2wechat-templates`.

- [ ] **Step 2: Run every local quality gate**

Run Wiki tests, Guide verification, Awesome generation/tests, banned-prose scans, and Markdown link checks. Expected: all blocking checks pass.

- [ ] **Step 3: Review diffs for factual and tonal quality**

Inspect every changed Markdown file. Confirm no repeated long product pitch, no unsupported number, no unqualified comparison, no fake freshness date, and no instructions that trigger publishing side effects without explicit consent.

- [ ] **Step 4: Apply in-scope GitHub metadata**

Use authenticated GitHub commands only for the md2wechat organization and the four scoped repositories. Set concise descriptions, canonical website, focused topics, and public pins. If organization-owner permission is unavailable, report the exact remaining settings without changing another repository.

- [ ] **Step 5: Produce the final handoff**

Report commits per repository, tests run, upstream source commit, scoped metadata applied, any non-blocking link warnings, and the 8-week rollback metrics for the Wiki evidence registry.

