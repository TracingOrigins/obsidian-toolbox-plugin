# Getting Started

This guide will help you get started with our documentation system. We'll walk through the installation process, basic usage, and some advanced features.

## Prerequisites

Before you begin, make sure you have the following installed:

- Node.js version 16 or higher
  ```bash
  node --version  # Should be v16.0.0 or higher
  ```
- npm (comes with Node.js) or yarn
  ```bash
  npm --version   # Should be 7.0.0 or higher
  ```
- Git for version control
  ```bash
  git --version   # Any recent version will work
  ```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/docs.git
   cd docs
   ```

2. Install dependencies:
   ```bash
   npm install
   # or if you prefer yarn
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run docs:dev
   # or with yarn
   yarn docs:dev
   ```

   The development server will start at `http://localhost:5173` by default.

## Project Structure

```
docs/
├── .vitepress/          # VitePress configuration
│   ├── config.ts        # Main configuration file
│   └── theme/           # Custom theme files
├── public/              # Static assets
│   ├── favicon.svg
│   └── logo.png
├── en/                  # English documentation
│   ├── guide/          # Guide section
│   └── examples/       # Examples section
└── zh/                  # Chinese documentation
    ├── guide/          # Guide section
    └── examples/       # Examples section
```

## Basic Usage

### Creating New Documentation

1. Create new documentation files in the appropriate language directory:
   - English: `docs/en/`
   - Chinese: `docs/zh/`

2. Add your content using Markdown syntax:
   ```markdown
   # Your Title

   ## Section 1
   Content for section 1...

   ## Section 2
   Content for section 2...
   ```

3. Update the navigation in `docs/.vitepress/config.ts`:
   ```ts
   sidebar: {
     '/en/guide/': [
       {
         text: 'Guide',
         items: [
           { text: 'Your New Page', link: '/en/guide/your-new-page' }
         ]
       }
     ]
   }
   ```

### Markdown Features

1. Code blocks with syntax highlighting:
   ```js
   const hello = 'world';
   console.log(hello);
   ```

2. Tables:
   | Feature | Description |
   |---------|-------------|
   | Markdown | Write content in Markdown |
   | Vue | Use Vue components |

3. Custom containers:
   ::: tip
   This is a tip
   :::

   ::: warning
   This is a warning
   :::

### Vue Components

You can use Vue components in your Markdown files:

```vue
<template>
  <div class="custom-component">
    {{ message }}
  </div>
</template>

<script setup>
const message = 'Hello from Vue!'
</script>
```

## Advanced Features

### Custom Theme

1. Create custom theme files in `.vitepress/theme/`:
   ```ts
   // .vitepress/theme/index.ts
   import DefaultTheme from 'vitepress/theme'
   import MyLayout from './MyLayout.vue'

   export default {
     ...DefaultTheme,
     Layout: MyLayout
   }
   ```

2. Add custom styles:
   ```scss
   // .vitepress/theme/custom.scss
   :root {
     --vp-c-brand: #646cff;
     --vp-c-brand-light: #747bff;
   }
   ```

### Search Configuration

Configure the search functionality in `config.ts`:

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

## Deployment

1. Build the documentation:
   ```bash
   npm run docs:build
   # or with yarn
   yarn docs:build
   ```

2. The built files will be in the `docs/.vitepress/dist` directory

3. Deploy to your hosting service:
   - GitHub Pages
   - Netlify
   - Vercel
   - Any static hosting service

## Next Steps

- Check out the [Configuration](./configuration.md) guide for detailed setup options
- Explore the [Examples](../examples/) section for usage examples
- Join our community for support and discussions
- Follow our [GitHub repository](https://github.com/your-repo/docs) for updates 