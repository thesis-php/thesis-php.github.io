import { defineConfig } from 'vitepress'
import packageGroups from '../packages.mjs'
import { buildSectionFromPackages } from './sidebar.mts'

const navItems: Array<{ text: string; link: string }> = []
const sidebarItems: Record<string, Array<{ text: string; items: unknown[] }>> = {}

const drivers = packageGroups.drivers ?? []
const lowLevel = packageGroups['low-level'] ?? []

if (drivers.length > 0) {
  navItems.push({
    text: 'Drivers',
    link: `/drivers/${drivers[0].name}/`
  })
  sidebarItems['/drivers/'] = [{
    text: 'Drivers',
    items: buildSectionFromPackages('drivers', drivers)
  }]
}

if (lowLevel.length > 0) {
  navItems.push({
    text: 'Low-level',
    link: `/low-level/${lowLevel[0].name}/`
  })
  sidebarItems['/low-level/'] = [{
    text: 'Low-level',
    items: buildSectionFromPackages('low-level', lowLevel)
  }]
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Thesis PHP",
  description: "Documentation",
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/logo.png' }],
    ['link', { rel: 'apple-touch-icon', href: '/logo.png' }]
  ],
  themeConfig: {
    siteTitle: 'Thesis',
    search: {
      provider: 'local'
    },
    logo: '/logo.png',
    nav: navItems,
    sidebar: sidebarItems,
    socialLinks: [
      { icon: 'github', link: 'https://github.com/thesis-php' },
      { icon: 'telegram', link: 'https://t.me/thesis_php' },
    ],
    outline: {
      level: 'deep'
    }
  }
})
