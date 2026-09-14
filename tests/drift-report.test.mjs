import test from 'node:test'
import assert from 'node:assert/strict'
import * as monitor from '../scripts/check-upstream-drift.mjs'
import { readFileSync } from 'node:fs'
import { gitBlobSha } from '../scripts/validate-evidence.mjs'

test('the reviewed facts digest matches the actual fact file', () => {
  const content = readFileSync(new URL('../evidence/runtime-facts.json', import.meta.url), 'utf8')
  const digest = readFileSync(new URL('../.md2wechat/runtime-facts.sha', import.meta.url), 'utf8').trim()
  assert.equal(gitBlobSha(content), digest)
})

test('notification API is available', () => {
  assert.equal(typeof monitor.syncDriftIssue, 'function')
  assert.equal(typeof monitor.compareConsumerLock, 'function')
})

test('current lock differences include repository, field and evidence', () => {
  const rows = monitor.compareConsumerLock('md2wechat/md2wechat-guide',
    { sources: { runtime: { schemaVersion: 'v3.5.0', sha: 'old' } } },
    { runtime: { version: 'v3.6.0', versionBlobSha: 'new', releaseUrl: 'https://github.com/geekjourneyx/md2wechat-skill/releases/tag/v3.6.0' } })
  assert.equal(rows.length, 2)
  assert.equal(rows[0].actual, 'v3.5.0')
  assert.match(rows[0].url, /md2wechat-guide\/blob\/main\/\.md2wechat/)
  assert.ok(rows.every(r => r.evidenceUrl && r.repository))
})

test('no drift performs no writes', async () => {
  assert.deepEqual(await monitor.syncDriftIssue({ version: 'v3.6.0', drift: [] },
    async () => { throw new Error('unexpected request') }), { mode: 'no-drift' })
})

test('deduplicates across pages, preserves human body and closed state', async () => {
  const calls = []
  const marker = '<!-- md2wechat-runtime-drift:v3.6.0 -->'
  const request = async (route, options = {}) => {
    calls.push([route, options])
    if (!options.method && route.endsWith('&page=1')) return Array.from({ length: 100 }, () => ({ body: 'other' }))
    if (!options.method) return [{ number: 42, state: 'closed', body: `${marker}\n人工意见保留\n<!-- drift:start -->\n旧内容\n<!-- drift:end -->` }]
    return { number: 42 }
  }
  const result = await monitor.syncDriftIssue({ version: 'v3.6.0', drift: [{ repository: 'md2wechat/wiki', source: 'version', expected: 'v3.6.0', actual: 'v3.5.0', url: 'https://github.com/md2wechat/wiki', evidenceUrl: 'https://github.com/geekjourneyx/md2wechat-skill' }] }, request)
  assert.equal(result.mode, 'updated')
  const write = calls.find(([, o]) => o.method)
  assert.equal(write[1].method, 'PATCH')
  assert.match(write[1].body.body, /人工意见保留/)
  assert.equal(write[1].body.state, undefined)
  assert.match(write[1].body.body, /v3.5.0/)
})

test('failed listing cannot create a duplicate', async () => {
  await assert.rejects(monitor.syncDriftIssue({ version: 'v3.6.0', drift: [{}] }, async () => { throw new Error('HTTP 403') }), /403/)
})

test('new issue contains labels and a stable release marker', async () => {
  let created
  const r = await monitor.syncDriftIssue({ version: 'v3.6.0', drift: [{source:'release',expected:'v3.5.0',actual:'v3.6.0'}] }, async (route, options = {}) => {
    if (!options.method) return []
    created = options.body
    return { number: 12 }
  })
  assert.equal(r.mode, 'created')
  assert.deepEqual(created.labels, ['documentation', 'enhancement'])
  assert.match(created.body, /<!-- md2wechat-runtime-drift:v3.6.0 -->/)
})

test('collection reads pinned snapshots and detects stale facts and runtime independently', async () => {
  const facts = { schemaVersion: 1, runtime: { version: 'v3.6.0', versionBlobSha: 'new', releaseUrl: 'https://github.com/geekjourneyx/md2wechat-skill/releases/tag/v3.6.0' } }
  const pin = { repository: 'md2wechat/md2wechat-wiki', path: 'evidence/agent-platforms.json', sha: 'ok' }
  const lock = { sources: { runtime: { schemaVersion: 'v3.6.0', sha: 'new' }, products: pin, platforms: pin } }
  const content = x => ({ content: Buffer.from(JSON.stringify(x)).toString('base64'), sha: 'facts-sha' })
  const report = await monitor.collectEcosystemDrift(async route => {
    if (route.endsWith('/commits/main')) return { sha: 'pinned' }
    if (route.includes('runtime-facts.json')) return content(facts)
    if (route.includes('runtime-facts.sha')) return {content: Buffer.from('old-facts\n').toString('base64')}
    if (route.includes('releases/latest')) return { tag_name: 'v3.7.0', html_url: 'https://github.com/geekjourneyx/md2wechat-skill/releases/tag/v3.7.0' }
    if (route.includes('ecosystem-facts.lock.json')) {
      assert.match(route, /ref=pinned/)
      const l = structuredClone(lock)
      if (route.includes('md2wechat-guide')) l.sources.runtime.schemaVersion = 'v3.5.0'
      return content(l)
    }
    return { sha: 'ok' }
  })
  assert.equal(report.version, 'v3.7.0')
  assert.ok(report.drift.some(r => r.source === 'latest-release'))
  assert.ok(report.drift.some(r => r.actual === 'v3.5.0'))
  assert.equal(report.drift.filter(r => r.source === 'runtime-facts.sha').length, 4)
})
