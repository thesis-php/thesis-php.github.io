#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { mkdtemp, mkdir, rm, cp, stat } from 'node:fs/promises'
import fs from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import packageGroups from '../packages.mjs'

const workspaceRoot = process.cwd()
const organization = 'thesis-php'

async function run(command, args, cwd = workspaceRoot) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: false
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`))
    })
  })
}

async function runCapture(command, args, cwd = workspaceRoot) {
  return await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout.trim())
        return
      }
      reject(new Error(`${command} ${args.join(' ')} exited with code ${code}: ${stderr.trim()}`))
    })
  })
}

async function exists(filePath) {
  try {
    await stat(filePath)
    return true
  } catch {
    return false
  }
}

async function findReadme(repoDir) {
  const candidates = ['README.md', 'Readme.md', 'readme.md']
  for (const name of candidates) {
    const filePath = path.join(repoDir, name)
    if (await exists(filePath)) return filePath
  }
  return null
}

function getMarkdownFiles(absDir) {
  const entries = fs.readdirSync(absDir, { withFileTypes: true })
  const out = []

  for (const entry of entries) {
    const fullPath = path.join(absDir, entry.name)
    if (entry.isDirectory()) {
      out.push(...getMarkdownFiles(fullPath))
      continue
    }
    if (entry.isFile() && entry.name.endsWith('.md')) {
      out.push(fullPath)
    }
  }

  return out
}

function splitUrlAndSuffix(rawTarget) {
  if (rawTarget.startsWith('<')) {
    const closeIndex = rawTarget.indexOf('>')
    if (closeIndex > 0) {
      return {
        url: rawTarget.slice(1, closeIndex),
        suffix: rawTarget.slice(closeIndex + 1)
      }
    }
  }

  const firstSpace = rawTarget.search(/\s/)
  if (firstSpace === -1) {
    return { url: rawTarget, suffix: '' }
  }

  return {
    url: rawTarget.slice(0, firstSpace),
    suffix: rawTarget.slice(firstSpace)
  }
}

function shouldSkipUrl(url) {
  if (!url) return true
  if (url.startsWith('#') || url.startsWith('/')) return true
  if (url.startsWith('mailto:') || url.startsWith('tel:')) return true
  if (url.startsWith('http://') || url.startsWith('https://')) return true
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)) return true
  return false
}

function resolvePathCandidate(baseDir, relativePath) {
  const exact = path.resolve(baseDir, relativePath)
  if (fs.existsSync(exact)) return exact

  const withMd = `${exact}.md`
  if (fs.existsSync(withMd)) return withMd

  const asIndex = path.join(exact, 'index.md')
  if (fs.existsSync(asIndex)) return asIndex

  return null
}

function toRepoRelative(absPath, repoRoot) {
  return path.relative(repoRoot, absPath).replace(/\\/g, '/')
}

function toGithubUrl(repoSlug, branch, absPath, repoRoot) {
  const repoRelative = toRepoRelative(absPath, repoRoot)
  const type = fs.statSync(absPath).isDirectory() ? 'tree' : 'blob'
  return `https://github.com/${repoSlug}/${type}/${branch}/${repoRelative}`
}

function rewriteMarkdownLinks({
  targetRoot,
  targetMarkdownFile,
  sourceMarkdownFile,
  sourceRepoRoot,
  repoSlug,
  branch
}) {
  const input = fs.readFileSync(targetMarkdownFile, 'utf8')
  const output = input.replace(/(!?\[[^\]]*]\()([^)]+)(\))/g, (_, prefix, rawTarget, suffix) => {
    const { url, suffix: urlSuffix } = splitUrlAndSuffix(rawTarget)
    if (shouldSkipUrl(url)) return `${prefix}${rawTarget}${suffix}`

    const localResolved = resolvePathCandidate(path.dirname(targetMarkdownFile), url)
    if (localResolved && localResolved.startsWith(targetRoot)) {
      return `${prefix}${rawTarget}${suffix}`
    }

    const sourceResolved = resolvePathCandidate(path.dirname(sourceMarkdownFile), url)
    if (!sourceResolved || !sourceResolved.startsWith(sourceRepoRoot)) {
      return `${prefix}${rawTarget}${suffix}`
    }

    const githubUrl = toGithubUrl(repoSlug, branch, sourceResolved, sourceRepoRoot)
    return `${prefix}${githubUrl}${urlSuffix}${suffix}`
  })

  if (output !== input) {
    fs.writeFileSync(targetMarkdownFile, output, 'utf8')
  }
}

function rewriteLinksInCopiedDocs({
  targetRoot,
  sourceRoot,
  sourceRepoRoot,
  repoSlug,
  branch
}) {
  const mdFiles = getMarkdownFiles(targetRoot)
  for (const targetMarkdownFile of mdFiles) {
    const rel = path.relative(targetRoot, targetMarkdownFile)
    const sourceMarkdownFile = path.join(sourceRoot, rel)
    if (!fs.existsSync(sourceMarkdownFile)) {
      continue
    }

    rewriteMarkdownLinks({
      targetRoot,
      targetMarkdownFile,
      sourceMarkdownFile,
      sourceRepoRoot,
      repoSlug,
      branch
    })
  }
}

async function main() {
  const tempRoot = await mkdtemp(path.join(tmpdir(), 'thesis-docs-sync-'))

  try {
    for (const [section, packages] of Object.entries(packageGroups)) {
      const sectionRoot = path.join(workspaceRoot, section)
      await mkdir(sectionRoot, { recursive: true })

      for (const pkg of packages) {
        const packageName = pkg.name
        const repoUrl = `https://github.com/${organization}/${packageName}.git`
        const repoSlug = `${organization}/${packageName}`
        const checkoutDir = path.join(tempRoot, packageName)
        const sourceDocsDir = path.join(checkoutDir, 'docs')
        const targetDir = path.join(sectionRoot, packageName)

        console.log(`\n-> Sync ${organization}/${packageName} -> ${section}/${packageName}`)
        await run('git', ['clone', '--depth', '1', repoUrl, checkoutDir])
        const branch = await runCapture('git', ['rev-parse', '--abbrev-ref', 'HEAD'], checkoutDir)

        await rm(targetDir, { recursive: true, force: true })
        await mkdir(targetDir, { recursive: true })

        if (await exists(sourceDocsDir)) {
          await cp(sourceDocsDir, targetDir, { recursive: true })
          rewriteLinksInCopiedDocs({
            targetRoot: targetDir,
            sourceRoot: sourceDocsDir,
            sourceRepoRoot: checkoutDir,
            repoSlug,
            branch
          })
          console.log(`   docs/ copied -> ${path.relative(workspaceRoot, targetDir)}`)
          continue
        }

        const readmePath = await findReadme(checkoutDir)
        if (!readmePath) {
          throw new Error(`No docs/ or README.md found for ${organization}/${packageName}`)
        }

        await cp(readmePath, path.join(targetDir, 'index.md'))
        rewriteMarkdownLinks({
          targetRoot: targetDir,
          targetMarkdownFile: path.join(targetDir, 'index.md'),
          sourceMarkdownFile: readmePath,
          sourceRepoRoot: checkoutDir,
          repoSlug,
          branch
        })
        console.log(`   README fallback -> ${path.relative(workspaceRoot, targetDir)}/index.md`)
      }
    }

    console.log('\nDone.')
  } finally {
    await rm(tempRoot, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(`\nSync failed: ${error.message}`)
  process.exit(1)
})
