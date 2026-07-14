import test from "node:test"
import assert from "node:assert/strict"

import { validateRegistry } from "../scripts/validate-facts.mjs"

const validFact = {
  id: "release.version",
  claim: "当前稳定版本",
  value: "3.1.0",
  source: "https://github.com/geekjourneyx/md2wechat-skill/releases/tag/v3.1.0",
  source_commit: "f9af7a9110b2b472c8fc3fd9a3103863f6bf3862",
  verified_at: "2026-07-14",
  risk: "P0",
  status: "verified",
  used_by: ["md2wechat-guide"],
}

test("accepts a complete fact", () => {
  assert.deepEqual(validateRegistry([validFact]), { ok: true, errors: [] })
})

test("rejects facts without evidence metadata", () => {
  const result = validateRegistry([{ id: "version", value: "3.1.0" }])
  assert.equal(result.ok, false)
  assert.match(result.errors.join("\n"), /source_commit/)
})

test("rejects duplicate IDs", () => {
  const result = validateRegistry([validFact, validFact])
  assert.equal(result.ok, false)
  assert.match(result.errors.join("\n"), /duplicate id/)
})

test("rejects invalid dates, risk levels and statuses", () => {
  const result = validateRegistry([
    {
      ...validFact,
      verified_at: "14/07/2026",
      risk: "critical",
      status: "fresh",
    },
  ])
  assert.equal(result.ok, false)
  assert.match(result.errors.join("\n"), /verified_at/)
  assert.match(result.errors.join("\n"), /risk/)
  assert.match(result.errors.join("\n"), /status/)
})
