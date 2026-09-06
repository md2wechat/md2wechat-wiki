import { createHash } from "node:crypto"
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
  ["qwenwork", new Set(["www.qianwen.com", "help.aliyun.com"])],
  ["dumate", new Set(["www.dumate.cn", "cloud.baidu.com"])],
  ["workbuddy", new Set(["open.workbuddy.cn"])],
  ["doubao-work", new Set(["www.doubao.com"])]
])
const expectedSources = {
  runtime: {
    repository: "geekjourneyx/md2wechat-skill",
    path: "VERSION",
    sha: "18091983f59ddde8105e566545a0d9e4a12a4f1c",
    schemaVersion: "v3.4.0"
  },
  products: {
    repository: "md2wechat/.github",
    path: "facts/product-routes.json",
    sha: "9b25b7142815876f44053cf819842db320408d2a",
    schemaVersion: 1
  }
}

function parseCalendarDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return Number.NaN

  const timestamp = Date.parse(`${value}T00:00:00.000Z`)
  if (!Number.isFinite(timestamp)) return Number.NaN

  const date = new Date(timestamp)
  const [, year, month, day] = match
  if (date.getUTCFullYear() !== Number(year) ||
      date.getUTCMonth() + 1 !== Number(month) ||
      date.getUTCDate() !== Number(day)) {
    return Number.NaN
  }
  return timestamp
}

function validHttpsUrl(value) {
  try {
    return new URL(value).protocol === "https:"
  } catch {
    return false
  }
}

function sameValue(actual, expected) {
  return Object.keys(expected).every(key => actual?.[key] === expected[key])
}

export function gitBlobSha(content) {
  const bytes = Buffer.isBuffer(content) ? content : Buffer.from(content, "utf8")
  const header = Buffer.from(`blob ${bytes.length}\0`, "utf8")
  return createHash("sha1").update(header).update(bytes).digest("hex")
}

export function evaluatePlatform(platform, now) {
  const reviewedAt = parseCalendarDate(platform?.reviewedAt)
  const currentTime = now instanceof Date ? now.getTime() : Number.NaN

  if (!Number.isFinite(reviewedAt) || !Number.isFinite(currentTime)) {
    throw new TypeError("reviewedAt and now must be valid UTC dates")
  }
  if (reviewedAt > currentTime) {
    throw new RangeError("reviewedAt must not be later than now")
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
  const currentTime = now instanceof Date ? now.getTime() : Number.NaN
  const registryReviewedAt = parseCalendarDate(registry?.reviewedAt)

  if (registry?.schemaVersion !== 1) errors.push("schemaVersion must equal 1")
  if (!Number.isFinite(registryReviewedAt)) {
    errors.push("reviewedAt must be a valid calendar date")
  } else if (!Number.isFinite(currentTime) || registryReviewedAt > currentTime) {
    errors.push("reviewedAt must not be later than now")
  }
  if (!Array.isArray(registry?.platforms)) return [...errors, "platforms must be an array"]

  const ids = new Set()
  for (const platform of registry.platforms) {
    const prefix = platform?.id || "<missing-id>"
    const reviewedAt = parseCalendarDate(platform?.reviewedAt)

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
    } else if (!officialHosts.get(platform.id)?.has(new URL(platform.officialUrl).hostname)) {
      errors.push(`${prefix}: officialUrl must use an official host`)
    }

    if (!Array.isArray(platform?.evidenceUrls) ||
        platform.evidenceUrls.length === 0 ||
        platform.evidenceUrls.some(url => !validHttpsUrl(url))) {
      errors.push(`${prefix}: evidenceUrls must contain HTTPS URLs`)
    } else if (platform.evidenceUrls.some(url =>
      !officialHosts.get(platform.id)?.has(new URL(url).hostname))) {
      errors.push(`${prefix}: evidenceUrls must use official hosts`)
    }

    if (!statusValues.has(platform?.md2wechatStatus)) {
      errors.push(`${prefix}: invalid md2wechatStatus`)
    }
    if (typeof platform?.publiclySupported !== "boolean") {
      errors.push(`${prefix}: publiclySupported must be boolean`)
    } else if (platform.publiclySupported && !publicStatusValues.has(platform.md2wechatStatus)) {
      errors.push(`${prefix}: only verified or compatible may be publicly supported`)
    }

    if (!Number.isFinite(reviewedAt)) {
      errors.push(`${prefix}: reviewedAt must be a valid calendar date`)
    } else if (!Number.isFinite(currentTime) || reviewedAt > currentTime) {
      errors.push(`${prefix}: reviewedAt must not be later than now`)
    }

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

    if (Number.isFinite(reviewedAt) &&
        Number.isFinite(currentTime) &&
        reviewedAt <= currentTime &&
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

export function validateLock(lock, platformContent) {
  const errors = []

  if (lock?.schemaVersion !== 1) errors.push("lock: schemaVersion must equal 1")
  if (!Number.isFinite(parseCalendarDate(lock?.reviewedAt))) {
    errors.push("lock: reviewedAt must be a valid calendar date")
  }

  const sources = lock?.sources
  if (!sources || typeof sources !== "object" || Array.isArray(sources)) {
    return [...errors, "lock: sources must be an object"]
  }

  for (const name of ["runtime", "products", "platforms"]) {
    const source = sources[name]
    if (!source || typeof source !== "object" || Array.isArray(source)) {
      errors.push(`lock: missing ${name} source`)
      continue
    }
    if (!/^[^/]+\/[^/]+$/.test(source.repository || "")) {
      errors.push(`lock: ${name}.repository is invalid`)
    }
    if (typeof source.path !== "string" || !source.path) {
      errors.push(`lock: ${name}.path is required`)
    }
    if (!/^[0-9a-f]{40}$/.test(source.sha || "")) {
      errors.push(`lock: ${name}.sha must be a full Git blob SHA`)
    }
    if (!(typeof source.schemaVersion === "string" ||
          Number.isInteger(source.schemaVersion))) {
      errors.push(`lock: ${name}.schemaVersion is invalid`)
    }
  }

  for (const name of ["runtime", "products"]) {
    if (!sameValue(sources[name], expectedSources[name])) {
      errors.push(`lock: ${name} source does not match the v3.4.0 baseline`)
    }
  }

  const platformExpected = {
    repository: "md2wechat/md2wechat-wiki",
    path: "evidence/agent-platforms.json",
    schemaVersion: 1
  }
  if (!sameValue(sources.platforms, platformExpected)) {
    errors.push("lock: platforms source shape is invalid")
  }
  if (typeof platformContent !== "string") {
    errors.push("lock: platform content is required")
  } else {
    const actualSha = gitBlobSha(platformContent)
    if (sources.platforms?.sha !== actualSha) {
      errors.push(`lock: platforms.sha mismatch; expected ${actualSha}`)
    }
  }

  return errors
}

function main() {
  const registryText = readFileSync(
    new URL("../evidence/agent-platforms.json", import.meta.url),
    "utf8"
  )
  const registry = JSON.parse(registryText)
  const lock = JSON.parse(
    readFileSync(new URL("../.md2wechat/ecosystem-facts.lock.json", import.meta.url), "utf8")
  )
  const errors = [
    ...validateRegistry(registry),
    ...validateLock(lock, registryText)
  ]

  if (errors.length) {
    for (const error of errors) console.error(`- ${error}`)
    process.exitCode = 1
    return
  }
  console.log(`Validated ${registry.platforms.length} platform records and ecosystem lock.`)
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) main()
