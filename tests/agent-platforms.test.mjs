import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import {
  evaluatePlatform,
  gitBlobSha,
  validateLock,
  validateRegistry
} from "../scripts/validate-evidence.mjs"
import { checkUpstreamDrift } from "../scripts/check-upstream-drift.mjs"

const registryText = readFileSync(
  new URL("../evidence/agent-platforms.json", import.meta.url),
  "utf8"
)
const registry = JSON.parse(registryText)
const lock = JSON.parse(
  readFileSync(new URL("../.md2wechat/ecosystem-facts.lock.json", import.meta.url), "utf8")
)

test("records the agreed platform states without public support claims", () => {
  const statusById = Object.fromEntries(
    registry.platforms.map(platform => [platform.id, platform.md2wechatStatus])
  )

  assert.deepEqual(statusById, {
    qwenwork: "install-ready",
    dumate: "install-ready",
    workbuddy: "smoke-pending",
    "doubao-work": "smoke-pending"
  })
  assert.ok(registry.platforms.every(platform => platform.publiclySupported === false))
})

test("install-ready records cite official installation documentation", () => {
  const qwen = registry.platforms.find(platform => platform.id === "qwenwork")
  const dumate = registry.platforms.find(platform => platform.id === "dumate")

  assert.ok(qwen.evidenceUrls.some(url => url.includes("help.aliyun.com/")))
  assert.ok(dumate.evidenceUrls.some(url => url.includes("cloud.baidu.com/doc/Dumate/")))
  assert.match(qwen.evidenceNote, /在线 URL.*SKILL\.zip/)
  assert.match(dumate.evidenceNote, /URL.*\.zip.*\.md/)
})

test("only verified or compatible may be advertised as supported", () => {
  for (const platform of registry.platforms) {
    assert.equal(
      platform.publiclySupported,
      ["verified", "compatible"].includes(platform.md2wechatStatus)
    )
  }

  const invalid = structuredClone(registry)
  invalid.platforms[0].publiclySupported = true
  assert.match(
    validateRegistry(invalid, new Date("2026-09-10T00:00:00Z")).join("\n"),
    /only verified or compatible/
  )
})

test("review expiry deterministically removes public support", () => {
  const expired = evaluatePlatform({
    ...registry.platforms[0],
    md2wechatStatus: "verified",
    publiclySupported: true,
    reviewedAt: "2026-07-01",
    expiresAfterDays: 30
  }, new Date("2026-09-04T00:00:00Z"))

  assert.equal(expired.md2wechatStatus, "review-due")
  assert.equal(expired.publiclySupported, false)
})

test("a fresh verified record remains publicly supported", () => {
  const fresh = evaluatePlatform({
    ...registry.platforms[0],
    md2wechatStatus: "verified",
    publiclySupported: true,
    reviewedAt: "2026-08-20",
    expiresAfterDays: 30
  }, new Date("2026-09-04T00:00:00Z"))

  assert.equal(fresh.md2wechatStatus, "verified")
  assert.equal(fresh.publiclySupported, true)
})

test("rejects nonexistent calendar dates", () => {
  const invalid = structuredClone(registry)
  invalid.reviewedAt = "2026-02-30"
  invalid.platforms[0].reviewedAt = "2026-02-30"

  const errors = validateRegistry(invalid, new Date("2026-09-10T00:00:00Z"))
  assert.ok(errors.some(error => /reviewedAt must be a valid calendar date/.test(error)))
  assert.throws(
    () => evaluatePlatform(invalid.platforms[0], new Date("2026-09-10T00:00:00Z")),
    /valid UTC dates/
  )
})

test("rejects platform review dates later than the injected clock", () => {
  const invalid = structuredClone(registry)
  invalid.platforms[0] = {
    ...invalid.platforms[0],
    md2wechatStatus: "verified",
    publiclySupported: true,
    reviewedAt: "2027-09-06"
  }

  assert.match(
    validateRegistry(invalid, new Date("2026-09-10T00:00:00Z")).join("\n"),
    /must not be later than now/
  )
  assert.throws(
    () => evaluatePlatform(invalid.platforms[0], new Date("2026-09-10T00:00:00Z")),
    /must not be later than now/
  )
})

test("current registry and ecosystem lock validate together", () => {
  assert.deepEqual(
    validateRegistry(registry, new Date("2026-09-10T00:00:00Z")),
    []
  )
  assert.equal(gitBlobSha(registryText), lock.sources.platforms.sha)
  assert.deepEqual(
    validateLock(lock, registryText, new Date("2026-09-10T00:00:00Z")),
    []
  )
})

test("lock validation detects local platform content and pinned source drift", () => {
  const now = new Date("2026-09-10T00:00:00Z")
  assert.match(
    validateLock(lock, `${registryText} `, now).join("\n"),
    /platforms\.sha mismatch/
  )

  const drifted = structuredClone(lock)
  drifted.sources.products.sha = "0".repeat(40)
  drifted.sources.runtime.extra = true
  const errors = validateLock(drifted, registryText, now).join("\n")
  assert.match(errors, /runtime source shape is invalid/)
  assert.match(errors, /products source does not match/)
})

test("lock validation rejects a review date later than the injected clock", () => {
  const future = structuredClone(lock)
  future.reviewedAt = "2027-09-06"

  assert.match(
    validateLock(
      future,
      registryText,
      new Date("2026-09-10T00:00:00Z")
    ).join("\n"),
    /lock: reviewedAt must not be later than now/
  )
})

test("upstream drift check is deterministic with injected fetch", async () => {
  const responses = new Map([
    ["contents/VERSION", {
      sha: lock.sources.runtime.sha,
      content: Buffer.from("3.5.0\n").toString("base64")
    }],
    ["product-routes.json", { sha: lock.sources.products.sha }],
    ["releases/latest", { tag_name: "v3.5.0" }],
    ["git/ref/tags/v3.5.0", {
      object: { type: "tag", sha: "a".repeat(40) }
    }],
    [`git/tags/${"a".repeat(40)}`, {
      object: {
        type: "commit",
        sha: "cbc8c600ed1f9cccbc29a33576f657c07d39ba9a"
      }
    }]
  ])
  const fakeFetch = async url => {
    const entry = [...responses].find(([fragment]) => url.includes(fragment))
    assert.ok(entry, `unexpected URL: ${url}`)
    return { ok: true, status: 200, json: async () => entry[1] }
  }

  assert.deepEqual(await checkUpstreamDrift(lock, fakeFetch), { ok: true, drift: [] })

  responses.set("releases/latest", { tag_name: "v3.6.0" })
  const result = await checkUpstreamDrift(lock, fakeFetch)
  assert.equal(result.ok, false)
  assert.deepEqual(result.drift, [{
    source: "latest-release",
    expected: "v3.5.0",
    actual: "v3.6.0"
  }])
})

test("upstream drift detects a retargeted v3.5.0 tag", async () => {
  const annotatedTagSha = "b".repeat(40)
  const changedCommit = "f".repeat(40)
  const responses = new Map([
    ["contents/VERSION", {
      sha: lock.sources.runtime.sha,
      content: Buffer.from("3.5.0\n").toString("base64")
    }],
    ["product-routes.json", { sha: lock.sources.products.sha }],
    ["releases/latest", { tag_name: "v3.5.0" }],
    ["git/ref/tags/v3.5.0", {
      object: { type: "tag", sha: annotatedTagSha }
    }],
    [`git/tags/${annotatedTagSha}`, {
      object: { type: "commit", sha: changedCommit }
    }]
  ])
  const fakeFetch = async url => {
    const entry = [...responses].find(([fragment]) => url.includes(fragment))
    assert.ok(entry, `unexpected URL: ${url}`)
    return { ok: true, status: 200, json: async () => entry[1] }
  }

  const result = await checkUpstreamDrift(lock, fakeFetch)
  assert.equal(result.ok, false)
  assert.deepEqual(result.drift, [{
    source: "runtime-tag-commit",
    expected: "cbc8c600ed1f9cccbc29a33576f657c07d39ba9a",
    actual: changedCommit
  }])
})
