import { readFileSync } from "node:fs"
import { pathToFileURL } from "node:url"

const apiRoot = "https://api.github.com"
const urls = {
  runtime: `${apiRoot}/repos/geekjourneyx/md2wechat-skill/contents/VERSION?ref=v3.4.0`,
  products: `${apiRoot}/repos/md2wechat/.github/contents/facts/product-routes.json`,
  release: `${apiRoot}/repos/geekjourneyx/md2wechat-skill/releases/latest`,
  tagRef: `${apiRoot}/repos/geekjourneyx/md2wechat-skill/git/ref/tags/v3.4.0`
}
const expectedTagCommit = "07fdea284e71ddaf5c6b5311238d7e9c2df3b8af"

async function fetchJson(fetchImpl, url, token) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "md2wechat-wiki-evidence-check"
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetchImpl(url, { headers })
  if (!response.ok) throw new Error(`GitHub API ${response.status} for ${url}`)
  return response.json()
}

async function resolveRuntimeTagCommit(fetchImpl, token) {
  let target = (await fetchJson(fetchImpl, urls.tagRef, token)).object
  const visited = new Set()

  for (let depth = 0; depth < 8; depth += 1) {
    if (!target || !/^[0-9a-f]{40}$/.test(target.sha || "")) {
      throw new Error("v3.4.0 tag contains an invalid Git object")
    }
    if (target.type === "commit") return target.sha
    if (target.type !== "tag") {
      throw new Error(`v3.4.0 tag points to unsupported Git object type: ${target.type}`)
    }
    if (visited.has(target.sha)) throw new Error("v3.4.0 tag contains a cycle")
    visited.add(target.sha)

    const tag = await fetchJson(
      fetchImpl,
      `${apiRoot}/repos/geekjourneyx/md2wechat-skill/git/tags/${target.sha}`,
      token
    )
    target = tag.object
  }

  throw new Error("v3.4.0 tag nesting exceeds the safe resolution limit")
}

export async function checkUpstreamDrift(lock, fetchImpl = globalThis.fetch, token = "") {
  if (typeof fetchImpl !== "function") throw new TypeError("fetch implementation is required")

  const [runtime, products, release, tagCommit] = await Promise.all([
    fetchJson(fetchImpl, urls.runtime, token),
    fetchJson(fetchImpl, urls.products, token),
    fetchJson(fetchImpl, urls.release, token),
    resolveRuntimeTagCommit(fetchImpl, token)
  ])
  const runtimeVersion = Buffer.from(
    String(runtime.content || "").replace(/\s/g, ""),
    "base64"
  ).toString("utf8").trim()
  const expectedVersion = String(lock.sources.runtime.schemaVersion).replace(/^v/, "")
  const drift = []

  if (runtime.sha !== lock.sources.runtime.sha) {
    drift.push({ source: "runtime", expected: lock.sources.runtime.sha, actual: runtime.sha })
  }
  if (runtimeVersion !== expectedVersion) {
    drift.push({ source: "runtime-version", expected: expectedVersion, actual: runtimeVersion })
  }
  if (products.sha !== lock.sources.products.sha) {
    drift.push({ source: "products", expected: lock.sources.products.sha, actual: products.sha })
  }
  if (release.tag_name !== lock.sources.runtime.schemaVersion) {
    drift.push({
      source: "latest-release",
      expected: lock.sources.runtime.schemaVersion,
      actual: release.tag_name
    })
  }
  if (tagCommit !== expectedTagCommit) {
    drift.push({
      source: "runtime-tag-commit",
      expected: expectedTagCommit,
      actual: tagCommit
    })
  }

  return { ok: drift.length === 0, drift }
}

async function main() {
  const lock = JSON.parse(
    readFileSync(new URL("../.md2wechat/ecosystem-facts.lock.json", import.meta.url), "utf8")
  )
  const result = await checkUpstreamDrift(lock, globalThis.fetch, process.env.GITHUB_TOKEN || "")
  if (!result.ok) {
    for (const item of result.drift) {
      console.error(`- ${item.source}: expected ${item.expected}, got ${item.actual}`)
    }
    process.exitCode = 1
    return
  }
  console.log("No upstream release or source SHA drift detected.")
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main().catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
}
