import fs from "node:fs"
import { pathToFileURL } from "node:url"

const REQUIRED_FIELDS = [
  "id",
  "claim",
  "value",
  "source",
  "source_commit",
  "verified_at",
  "risk",
  "status",
  "used_by",
]

const RISKS = new Set(["P0", "P1", "P2"])
const STATUSES = new Set(["verified", "review-due", "historical"])
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function validateRegistry(facts) {
  const errors = []
  const ids = new Set()

  if (!Array.isArray(facts)) {
    return { ok: false, errors: ["registry must be a JSON array"] }
  }

  facts.forEach((fact, index) => {
    const label = fact?.id || `entry ${index}`

    for (const field of REQUIRED_FIELDS) {
      if (!(field in (fact || {})) || fact[field] === "" || fact[field] == null) {
        errors.push(`${label}: missing ${field}`)
      }
    }

    if (fact?.id) {
      if (ids.has(fact.id)) errors.push(`${label}: duplicate id`)
      ids.add(fact.id)
    }

    if (fact?.verified_at && !DATE_PATTERN.test(fact.verified_at)) {
      errors.push(`${label}: verified_at must use YYYY-MM-DD`)
    }
    if (fact?.risk && !RISKS.has(fact.risk)) {
      errors.push(`${label}: risk must be P0, P1 or P2`)
    }
    if (fact?.status && !STATUSES.has(fact.status)) {
      errors.push(`${label}: status must be verified, review-due or historical`)
    }
    if (fact?.source && !/^https:\/\//.test(fact.source)) {
      errors.push(`${label}: source must be an https URL`)
    }
    if (fact?.source_commit && !/^(?:[0-9a-f]{40}|v\d+\.\d+\.\d+)$/.test(fact.source_commit)) {
      errors.push(`${label}: source_commit must be a full Git commit or SemVer tag`)
    }
    if (fact?.used_by && (!Array.isArray(fact.used_by) || fact.used_by.length === 0)) {
      errors.push(`${label}: used_by must be a non-empty array`)
    }
  })

  return { ok: errors.length === 0, errors }
}

function runCli() {
  const file = process.argv[2]
  if (!file) {
    console.error("usage: node scripts/validate-facts.mjs <registry.json>")
    process.exit(2)
  }

  const result = validateRegistry(JSON.parse(fs.readFileSync(file, "utf8")))
  if (!result.ok) {
    console.error(result.errors.join("\n"))
    process.exit(1)
  }

  const count = JSON.parse(fs.readFileSync(file, "utf8")).length
  console.log(`verified facts: ${count}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli()
}
