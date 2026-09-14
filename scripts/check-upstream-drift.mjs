import { readFileSync } from "node:fs"
import { pathToFileURL } from "node:url"

const apiRoot = "https://api.github.com"
const facts = JSON.parse(readFileSync(new URL('../evidence/runtime-facts.json', import.meta.url), 'utf8'))
const urls = {
  runtime: `${apiRoot}/repos/geekjourneyx/md2wechat-skill/contents/VERSION?ref=${facts.runtime.version}`,
  products: `${apiRoot}/repos/md2wechat/.github/contents/facts/product-routes.json`,
  release: `${apiRoot}/repos/geekjourneyx/md2wechat-skill/releases/latest`,
  tagRef: `${apiRoot}/repos/geekjourneyx/md2wechat-skill/git/ref/tags/${facts.runtime.version}`
}
const expectedTagCommit = facts.runtime.commit

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
      throw new Error("v3.6.0 tag contains an invalid Git object")
    }
    if (target.type === "commit") return target.sha
    if (target.type !== "tag") {
      throw new Error(`v3.6.0 tag points to unsupported Git object type: ${target.type}`)
    }
    if (visited.has(target.sha)) throw new Error("v3.6.0 tag contains a cycle")
    visited.add(target.sha)

    const tag = await fetchJson(
      fetchImpl,
      `${apiRoot}/repos/geekjourneyx/md2wechat-skill/git/tags/${target.sha}`,
      token
    )
    target = tag.object
  }

  throw new Error("v3.6.0 tag nesting exceeds the safe resolution limit")
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

const issueRepository = 'geekjourneyx/wechat-markdown-editor'
const lockPath = '.md2wechat/ecosystem-facts.lock.json'
const cell = value => String(value ?? 'unknown').replaceAll('|', '\\|').replace(/[\r\n]/g, ' ').replaceAll('<!--', '&lt;!--')

export function compareConsumerLock(repository, lock, currentFacts) {
  const result = []
  for (const [field, expected] of Object.entries({ schemaVersion: currentFacts.runtime.version, sha: currentFacts.runtime.versionBlobSha })) {
    const actual = lock?.sources?.runtime?.[field]
    if (actual !== expected) result.push({ repository, source: `runtime.${field}`, expected, actual: actual ?? 'missing',
      url: `https://github.com/${repository}/blob/main/${lockPath}`, evidenceUrl: currentFacts.runtime.releaseUrl })
  }
  return result
}

function leafChanges(before, after, prefix = '') {
  const rows = []
  for (const key of new Set([...Object.keys(before || {}), ...Object.keys(after || {})])) {
    const a = before?.[key], b = after?.[key], field = prefix ? `${prefix}.${key}` : key
    if (JSON.stringify(a) === JSON.stringify(b)) continue
    if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) rows.push(...leafChanges(a, b, field))
    else rows.push({ source: field, expected: JSON.stringify(b) ?? 'removed', actual: JSON.stringify(a) ?? 'missing' })
  }
  return rows
}

export async function syncDriftIssue(report, request) {
  if (!report.drift.length) return { mode: 'no-drift' }
  if (!/^v\d+\.\d+\.\d+$/.test(report.version)) throw new Error('Invalid stable release version')
  const marker = `<!-- md2wechat-runtime-drift:${report.version} -->`
  const route = `/repos/${issueRepository}/issues`
  let existing
  for (let page = 1; ; page += 1) {
    const items = await request(`${route}?state=all&per_page=100&page=${page}`)
    if (!Array.isArray(items)) throw new Error('Invalid issue list response')
    existing = items.find(i => !i.pull_request && i.body?.includes(marker))
    if (existing || items.length < 100) break
    if (page >= 100) throw new Error('Issue pagination exceeded limit; refusing duplicate creation')
  }
  const content = ['<!-- drift:start -->', '## 当前事实差异', '',
    '| 仓库 | 字段 | 目标值 | 观测值 | 来源 |', '|---|---|---|---|---|',
    ...report.drift.map(r => `| ${cell(r.repository)} | ${cell(r.source)} | ${cell(r.expected)} | ${cell(r.actual)} | [当前文件](${r.url || report.releaseUrl}) · [依据](${r.evidenceUrl || report.releaseUrl}) |`), '',
    `事实源：[runtime-facts.json](${report.factsUrl || 'https://github.com/md2wechat/md2wechat-wiki/blob/main/evidence/runtime-facts.json'})。`,
    '优先级 P0：维护者核对来源并决定是否修改。未知值和来源变化不代表新能力已支持。只检查当前事实锁，不改写历史版本、模板 verifiedWith 或宿主实测日期。',
    '<!-- drift:end -->'].join('\n')
  let body = `${marker}\n\n本 Issue 由事实漂移检查维护；人工意见写在自动区块外或评论中。不会自动修改文件、创建 PR、关闭 Issue 或合并。\n\n${content}`
  if (existing) {
    const block = /<!-- drift:start -->[\s\S]*?<!-- drift:end -->/
    body = block.test(existing.body) ? existing.body.replace(block, () => content) : `${existing.body}\n\n${content}`
    if (body === existing.body) return { mode: 'unchanged', number: existing.number }
    await request(`${route}/${existing.number}`, { method: 'PATCH', body: { body } })
    return { mode: 'updated', number: existing.number }
  }
  const created = await request(route, { method: 'POST', body: {
    title: `[Runtime facts][${report.version}] 生态事实漂移`, body, labels: ['documentation', 'enhancement']
  } })
  return { mode: 'created', number: created.number }
}

export async function collectEcosystemDrift(request) {
  const wiki = 'md2wechat/md2wechat-wiki'
  const decode = entry => JSON.parse(Buffer.from(entry.content.replace(/\s/g, ''), 'base64').toString('utf8'))
  // Resolve every repository once to keep the evidence URLs and values in the same snapshot.
  const wikiHead = await request(`/repos/${wiki}/commits/main`)
  const factFile = await request(`/repos/${wiki}/contents/evidence/runtime-facts.json?ref=${wikiHead.sha}`)
  const current = decode(factFile)
  if (current.schemaVersion !== 1 || !/^v\d+\.\d+\.\d+$/.test(current.runtime?.version)) throw new Error('Unsupported runtime facts schema')
  const release = await request('/repos/geekjourneyx/md2wechat-skill/releases/latest')
  if (!/^v\d+\.\d+\.\d+$/.test(release.tag_name)) throw new Error('Unexpected stable release tag')
  const factsUrl = `https://github.com/${wiki}/blob/${wikiHead.sha}/evidence/runtime-facts.json`
  const drift = []
  if (release.tag_name !== current.runtime.version) drift.push({ repository: wiki, source: 'latest-release',
    expected: release.tag_name, actual: current.runtime.version, url: factsUrl, evidenceUrl: release.html_url })
  const repositories = ['md2wechat/md2wechat-guide', wiki, 'md2wechat/awesome-wechat-markdown', 'md2wechat/md2wechat-templates']
  const authorityLock = decode(await request(`/repos/${wiki}/contents/${lockPath}?ref=${wikiHead.sha}`))
  for (const repository of repositories) {
    const head = repository === wiki ? wikiHead : await request(`/repos/${repository}/commits/main`)
    const lock = decode(await request(`/repos/${repository}/contents/${lockPath}?ref=${head.sha}`))
    const url = `https://github.com/${repository}/blob/${head.sha}/${lockPath}`
    const digest = await request(`/repos/${repository}/contents/.md2wechat/runtime-facts.sha?ref=${head.sha}`)
    const actualDigest = Buffer.from(digest.content.replace(/\s/g, ''), 'base64').toString('utf8').trim()
    if (actualDigest !== factFile.sha) drift.push({ repository, source: 'runtime-facts.sha', expected: factFile.sha, actual: actualDigest,
      url: `https://github.com/${repository}/blob/${head.sha}/.md2wechat/runtime-facts.sha`, evidenceUrl: factsUrl })
    if (actualDigest !== factFile.sha && /^[0-9a-f]{40}$/.test(actualDigest)) {
      const previous = decode(await request(`/repos/${wiki}/git/blobs/${actualDigest}`))
      drift.push(...leafChanges(previous, current).map(row => ({ ...row, repository, url, evidenceUrl: factsUrl })))
    }
    drift.push(...compareConsumerLock(repository, lock, current).map(r => ({ ...r, url, evidenceUrl: factsUrl })))
    for (const source of ['products', 'platforms']) {
      if (JSON.stringify(lock.sources?.[source]) !== JSON.stringify(authorityLock.sources[source])) drift.push({ repository,
        source, expected: JSON.stringify(authorityLock.sources[source]), actual: JSON.stringify(lock.sources?.[source]), url, evidenceUrl: factsUrl })
    }
  }
  // Changed upstream source blobs require review even if the version string stays constant.
  for (const source of ['products', 'platforms']) {
    const pin = authorityLock.sources[source]
    const actual = await request(`/repos/${pin.repository}/contents/${pin.path}`)
    if (actual.sha !== pin.sha) drift.push({ repository: wiki, source: `${source}.sha`, expected: pin.sha, actual: actual.sha,
      url: factsUrl, evidenceUrl: actual.html_url })
  }
  return { version: release.tag_name, releaseUrl: release.html_url, factsUrl, drift }
}

async function main() {
  if (process.argv.includes('--ecosystem')) {
    const request = async (route, options = {}) => {
      const response = await fetch(`${apiRoot}${route}`, {
        method: options.method || 'GET', headers: { Accept: 'application/vnd.github+json',
          ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) },
        ...(options.body ? { body: JSON.stringify(options.body) } : {}), signal: AbortSignal.timeout(30000)
      })
      if (!response.ok) throw new Error(`GitHub ${response.status}: ${route}`)
      return response.json()
    }
    const report = await collectEcosystemDrift(request)
    console.log(JSON.stringify(report, null, 2))
    if (process.argv.includes('--write-issue')) {
      if (process.env.GITHUB_REPOSITORY !== issueRepository || !process.env.GITHUB_TOKEN) throw new Error('Issue write requires the target repository workflow token')
      console.log(JSON.stringify(await syncDriftIssue(report, request)))
    }
    return
  }
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
