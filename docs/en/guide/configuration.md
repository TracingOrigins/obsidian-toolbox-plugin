# Configuration

This guide covers the configuration options available in our documentation system.

## Basic Configuration

The main configuration file is located at `docs/.vitepress/config.ts`. Here you can configure:

- Site title and description
- Navigation menu
- Sidebar structure
- Theme settings
- Search functionality

## Language Configuration

The site supports multiple languages through the `locales` configuration:

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

## Navigation Configuration

Configure the navigation menu in the `themeConfig.nav` section:

```ts
nav: [
  { text: 'Home', link: '/en/' },
  { text: 'Guide', link: '/en/guide/' },
  { text: 'Examples', link: '/en/examples/' }
]
```

## Sidebar Configuration

The sidebar can be configured per section in `themeConfig.sidebar`:

```ts
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
  ]
}
```

## Search Configuration

Configure the search functionality in the `search` section:

```ts
search: {
  provider: 'local',
  options: {
    translations: {
      button: {
        buttonText: 'Search',
        buttonAriaLabel: 'Search'
      }
    }
  }
}
```

## Additional Options

- Custom theme colors
- Social media links
- Footer configuration
- Logo settings

For more detailed configuration options, please refer to the [VitePress documentation](https://vitepress.dev/). 