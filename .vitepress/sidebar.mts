import fs from 'node:fs'
import path from 'node:path'

const contentRoot = path.resolve(process.cwd())
type PackageConfig = { name: string; title: string }

function toLink(filePath: string): string {
  const rel = path.relative(contentRoot, filePath).replace(/\\/g, '/')
  if (rel === 'index.md') return '/'
  if (rel.endsWith('/index.md')) return `/${rel.slice(0, -'/index.md'.length)}/`
  return `/${rel.replace(/\.md$/, '')}`
}

function buildItems(absDir: string): Array<Record<string, unknown>> {
  const entries = fs.readdirSync(absDir, { withFileTypes: true })

  const items: Array<Record<string, unknown>> = []

  for (const entry of entries) {
    const fullPath = path.join(absDir, entry.name)

    if (entry.isDirectory()) {
      items.push({
        text: entry.name,
        collapsed: false,
        items: buildItems(fullPath)
      })
      continue
    }

    if (entry.isFile() && entry.name.endsWith('.md')) {
      items.push({
        text: entry.name,
        link: toLink(fullPath)
      })
    }
  }

  return items
}

function collectMarkdownFiles(absDir: string): string[] {
  const entries = fs.readdirSync(absDir, { withFileTypes: true })
  const out: string[] = []

  for (const entry of entries) {
    const fullPath = path.join(absDir, entry.name)
    if (entry.isDirectory()) {
      out.push(...collectMarkdownFiles(fullPath))
      continue
    }
    if (entry.isFile() && entry.name.endsWith('.md')) {
      out.push(fullPath)
    }
  }

  return out
}

export function buildSection(section: string): Array<Record<string, unknown>> {
  const sectionRoot = path.join(contentRoot, section)
  if (!fs.existsSync(sectionRoot)) return []
  const items: Array<Record<string, unknown>> = []
  return items
}

export function buildSectionFromPackages(section: string, packages: PackageConfig[]): Array<Record<string, unknown>> {
  const sectionRoot = path.join(contentRoot, section)
  if (!fs.existsSync(sectionRoot)) return []

  const items: Array<Record<string, unknown>> = []

  for (const pkg of packages) {
    const fullPath = path.join(sectionRoot, pkg.name)
    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) {
      console.warn(`[sidebar] Missing content for package "${pkg.name}" in section "${section}" at ${fullPath}`)
      continue
    }

    const markdownFiles = collectMarkdownFiles(fullPath)
    const onlyIndex =
      markdownFiles.length === 1 && path.basename(markdownFiles[0]) === 'index.md'

    if (onlyIndex) {
      items.push({
        text: pkg.title,
        link: toLink(markdownFiles[0])
      })
      continue
    }

    items.push({
      text: pkg.title,
      collapsed: false,
      items: buildItems(fullPath)
    })
  }

  return items
}
