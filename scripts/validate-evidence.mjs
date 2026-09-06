import { readFileSync } from "node:fs"
import { pathToFileURL } from "node:url"

const statusValues = new Set([
  "verified",
  "compatible",
  "install-ready",
  "smoke-pending",
  "unsupported",
  "review-due"
])
const publicStatusValues = new Set(["verified", "compatible"])
const platformIds = new Set(["qwenwork", "dumate", "workbuddy", "doubao-work"])
const officialHosts = new Map([
  ["qwenwork", "www.qianwen.com"],
  ["dumate", "www.dumate.cn"],
  ["workbuddy", "open.workbuddy.cn"],
  ["doubao-work", "www.doubao.com"]
])

function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
}

function validHttpsUrl(value) {
  try {
    return new URL(value).protocol === "https:"
  } catch {
    return false
  }
}

export function evaluatePlatform(platform, now) {
  const reviewedAt = Date.parse(`${platform.reviewedAt}T00:00:00Z`)
  const currentTime = now instanceof Date ? now.getTime() : Number.NaN

  if (!Number.isFinite(reviewedAt) || !Number.isFinite(currentTime)) {
    throw new TypeError("reviewedAt and now must be valid UTC dates")
  }

  const ageInDays = Math.floor((currentTime - reviewedAt) / 86_400_000)
  if (ageInDays > platform.expiresAfterDays) {
    return { ...platform, md2wechatStatus: "review-due", publiclySupported: false }
  }

  return {
    ...platform,
    publiclySupported:
      Boolean(platform.publiclySupported) &&
      publicStatusValues.has(platform.md2wechatStatus)
  }
}

export function validateRegistry(registry, now = new Date()) {
  const errors = []

  if (registry?.schemaVersion !== 1) errors.push("schemaVersion must equal 1")
  if (!validDate(registry?.reviewedAt)) errors.push("reviewedAt must be a valid date")
  if (!Array.isArray(registry?.platforms)) return [...errors, "platforms must be an array"]

  const ids = new Set()
  for (const platform of registry.platforms) {
    const prefix = platform?.id || "<missing-id>"

    if (!platformIds.has(platform?.id)) errors.push(`${prefix}: unknown id`)
    if (ids.has(platform?.id)) errors.push(`${prefix}: duplicate id`)
    ids.add(platform?.id)

    for (const field of ["name", "vendor", "evidenceNote"]) {
      if (typeof platform?.[field] !== "string" || !platform[field].trim()) {
        errors.push(`${prefix}: ${field} is required`)
      }
    }

    if (!validHttpsUrl(platform?.officialUrl)) {
      errors.push(`${prefix}: officialUrl must be HTTPS`)
    } else if (new URL(platform.officialUrl).hostname !== officialHosts.get(platform.id)) {
      errors.push(`${prefix}: officialUrl must use the official host`)
    }

    if (!Array.isArray(platform?.evidenceUrls) ||
        platform.evidenceUrls.length === 0 ||
        platform.evidenceUrls.some(url => !validHttpsUrl(url))) {
      errors.push(`${prefix}: evidenceUrls must contain HTTPS URLs`)
    }

    if (!statusValues.has(platform?.md2wechatStatus)) {
      errors.push(`${prefix}: invalid md2wechatStatus`)
    }
    if (typeof platform?.publiclySupported !== "boolean") {
      errors.push(`${prefix}: publiclySupported must be boolean`)
    } else if (platform.publiclySupported && !publicStatusValues.has(platform.md2wechatStatus)) {
      errors.push(`${prefix}: only verified or compatible may be publicly supported`)
    }

    if (!validDate(platform?.reviewedAt)) errors.push(`${prefix}: invalid reviewedAt`)
    if (!Number.isInteger(platform?.expiresAfterDays) || platform.expiresAfterDays < 1) {
      errors.push(`${prefix}: expiresAfterDays must be a positive integer`)
    }

    for (const field of ["invalidationConditions", "nextSmoke"]) {
      if (!Array.isArray(platform?.[field]) ||
          platform[field].length === 0 ||
          platform[field].some(item => typeof item !== "string" || !item.trim())) {
        errors.push(`${prefix}: ${field} must contain non-empty strings`)
      }
    }

    if (validDate(platform?.reviewedAt) &&
        Number.isInteger(platform?.expiresAfterDays) &&
        evaluatePlatform(platform, now).md2wechatStatus === "review-due" &&
        platform.md2wechatStatus !== "review-due") {
      errors.push(`${prefix}: review is overdue`)
    }
  }

  for (const id of platformIds) {
    if (!ids.has(id)) errors.push(`${id}: missing platform`)
  }
  if (registry.platforms.length !== platformIds.size) {
    errors.push(`platforms must contain exactly ${platformIds.size} records`)
  }

  return errors
}

function main() {
  const registry = JSON.parse(
    readFileSync(new URL("../evidence/agent-platforms.json", import.meta.url), "utf8")
  )
  const errors = validateRegistry(registry)
  if (errors.length) {
    for (const error of errors) console.error(`- ${error}`)
    process.exitCode = 1
    return
  }
  console.log(`Validated ${registry.platforms.length} platform evidence records.`)
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) main()
