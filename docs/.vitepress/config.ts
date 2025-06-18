import { defineConfig } from 'vitepress'
import { useData } from 'vitepress'
import { useRoute } from 'vitepress'

export default defineConfig({
  base: '/',
  title: "Toolbox Docs",
  description: "功能、用法、配置",
  lang: 'en-US',
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/images/favicon.png' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
    ['meta', { name: 'theme-color', content: '#ffffff' }]
  ],
  locales: {
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      themeConfig: {
        outline: {
          label: 'On this page'
        },
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Toolbox', link: '/en/toolbox/' },
          {
            text: 'About',
            items: [
              { text: 'Guide', link: '/en/guide/' },
              { text: 'Examples', link: '/en/examples/' },
            ]
          }
        ],
        sidebar: {
          '/en/guide/': [
            {
              text: 'Guide',
              items: [
                { text: 'Introduction', link: '/en/guide/' },
                { text: 'Getting Started', link: '/en/guide/getting-started' },
                { text: 'Configuration', link: '/en/guide/configuration' }
              ]
            }
          ],
          '/en/examples/': [
            {
              text: 'Examples',
              items: [
                { text: 'Markdown Examples', link: '/en/examples/markdown' },
                { text: 'Vue Components', link: '/en/examples/vue' }
              ]
            }
          ],
          '/en/toolbox/': [
          {
            text: 'Plugin Overview',
            collapsed: false,
            items: [
              { text: 'Introduction', link: '/en/toolbox/introduction' },
              { text: 'Download', link: '/en/toolbox/download' }
            ]
          },
          {
            text: 'Tool List',
            collapsed: false,
            items: [
              { text: 'Auto Timestamps', link: '/en/toolbox/auto-timestamps' },
              { text: 'Tab Copy', link: '/en/toolbox/tab-copy' },
              { text: 'Path Copy', link: '/en/toolbox/path-copy' },
              { text: 'Inline Code Copy', link: '/en/toolbox/inline-code-copy' },
              { text: 'Front Matter Sort', link: '/en/toolbox/front-matter-sort' }
            ]
          },
          {
            text: 'Future Plans',
            collapsed: false,
            items: [
              { text: 'Development Roadmap', link: '/en/toolbox/future-plans' }
            ]
          }
        ]
        },
        search: {
          provider: 'local',
          options: {
            translations: {
              button: {
                buttonText: 'Search',
                buttonAriaLabel: 'Search'
              },
              modal: {
                noResultsText: 'No results found',
                resetButtonTitle: 'Reset search',
                footer: {
                  selectText: 'Select',
                  navigateText: 'Navigate',
                  closeText: 'Close'
                }
              }
            }
          }
        }
      }
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      themeConfig: {
        outline: {
          label: '本页目录'
        },
        nav: [
          { text: '首页', link: '/zh/' },
          { text: '工具箱', link: '/zh/toolbox/' },
          {
            text: '关于',
            items: [
              { text: '指南', link: '/zh/guide/' },
              { text: '示例', link: '/zh/examples/' },
            ]
          }
        ],
        sidebar: {
          '/zh/guide/': [
            {
              text: '指南',
              items: [
                { text: '介绍', link: '/zh/guide/' },
                { text: '快速开始', link: '/zh/guide/getting-started' },
                { text: '配置', link: '/zh/guide/configuration' }
              ]
            }
          ],
          '/zh/examples/': [
            {
              text: '示例',
              items: [
                { text: 'Markdown 示例', link: '/zh/examples/markdown' },
                { text: 'Vue 组件', link: '/zh/examples/vue' }
              ]
            }
          ],
          '/zh/toolbox/': [
          {
            text: '插件概述',
            collapsed: false,
            items: [
              { text: '简介', link: '/zh/toolbox/introduction' },
              { text: '下载', link: '/zh/toolbox/download' }
            ]
          },
          {
            text: '工具列表',
            collapsed: false,
            items: [
              { text: '自动时间戳', link: '/zh/toolbox/auto-timestamps' },
              { text: '标签页复制', link: '/zh/toolbox/tab-copy' },
              { text: '路径复制', link: '/zh/toolbox/path-copy' },
              { text: '行内代码复制', link: '/zh/toolbox/inline-code-copy' },
              { text: '文档属性排序', link: '/zh/toolbox/front-matter-sort' }
            ]
          },
          {
            text: '未来计划',
            collapsed: false,
            items: [
              { text: '未来计划', link: '/zh/toolbox/future-plans' }
            ]
          }
        ],

        },
        search: {
          provider: 'local',
          options: {
            translations: {
              button: {
                buttonText: '搜索',
                buttonAriaLabel: '搜索'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭'
                }
              }
            }
          }
        }
      }
    }
  },
  themeConfig: {
    logo: '/images/favicon.png',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/TracingOrigins' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present TracingOrigins'
    },
    search: {
      provider: 'local'
    }
  }
}) 