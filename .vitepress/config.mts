import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Thesis PHP",
  description: "Documentation",
  themeConfig: {
    siteTitle: 'Thesis PHP',

    search: {
      provider: 'local'
    },

    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.png',

    nav: [
      // { text: 'Home', link: '/' },
      // { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Contracts',
        items: [
          { text: 'Transaction', link: '/transaction/' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/thesis-php' },
      { icon: 'telegram', link: 'https://t.me/thesis_php' },
    ]
  }
})
