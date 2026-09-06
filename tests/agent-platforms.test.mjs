import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { evaluatePlatform, validateRegistry } from "../scripts/validate-evidence.mjs"

const registry = JSON.parse(
  readFileSync(new URL("../evidence/agent-platforms.json", import.meta.url), "utf8")
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

test("only verified or compatible may be advertised as supported", () => {
  for (const platform of registry.platforms) {
    assert.equal(
      platform.publiclySupported,
      ["verified", "compatible"].includes(platform.md2wechatStatus)
    )
  }

  const invalid = structuredClone(registry)
  invalid.platforms[0].publiclySupported = true
  assert.match(validateRegistry(invalid, new Date("2026-09-06T00:00:00Z")).join("\n"), /only verified or compatible/)
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

test("current registry validates with an injected UTC clock", () => {
  assert.deepEqual(
    validateRegistry(registry, new Date("2026-09-06T00:00:00Z")),
    []
  )
})
