# 配置

本指南介绍文档系统中可用的配置选项。

## 基本配置

主配置文件位于 `docs/.vitepress/config.ts`，您可以在此配置：

- 站点标题和描述
- 导航菜单
- 侧边栏结构
- 主题设置
- 搜索功能

## 语言配置

站点通过 `locales` 配置支持多语言：

```ts
locales: {
  en: {
    label: 'English',
    lang: 'en-US',
    link: '/en/'
  },
  zh: {
    label: '简体中文',
    lang: 'zh-CN',
    link: '/zh/'
  }
}
```

## 导航配置

在 `themeConfig.nav` 部分配置导航菜单：

```ts
nav: [
  { text: '首页', link: '/zh/' },
  { text: '指南', link: '/zh/guide/' },
  { text: '示例', link: '/zh/examples/' }
]
```

## 侧边栏配置

可以在 `themeConfig.sidebar` 中按部分配置侧边栏：

```ts
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
  ]
}
```

## 搜索配置

在 `search` 部分配置搜索功能：

```ts
search: {
  provider: 'local',
  options: {
    translations: {
      button: {
        buttonText: '搜索',
        buttonAriaLabel: '搜索'
      }
    }
  }
}
```

## 其他选项

- 自定义主题颜色
- 社交媒体链接
- 页脚配置
- Logo 设置

更多详细的配置选项，请参考 [VitePress 文档](https://vitepress.dev/)。 