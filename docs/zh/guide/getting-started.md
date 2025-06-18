# 快速开始

本指南将帮助您开始使用我们的文档系统。我们将详细介绍安装过程、基本用法和一些高级功能。

## 前提条件

在开始之前，请确保您已安装以下软件：

- Node.js 16 或更高版本
  ```bash
  node --version  # 应为 v16.0.0 或更高
  ```
- npm（随 Node.js 一起安装）或 yarn
  ```bash
  npm --version   # 应为 7.0.0 或更高
  ```
- Git 版本控制工具
  ```bash
  git --version   # 任何最新版本都可以
  ```

## 安装

假设要在vitepress-docs中安装vitepress项目

1. 准备工作
   ```bash
   mkdir vitepress-docs
   cd vitepress-docs
   ```

2. 开始安装：
   ```bash
   npm add -D vitepress
   ```

3. 开始初始化：
   ```bash
   npx vitepress init
   ```

4. 安装依赖：
   ```bash
   npm install
   ```

5. 启动开发服务器：
   ```bash
   npm run docs:dev
   ```

   开发服务器默认会在 `http://localhost:5173` 启动。

## 项目结构

```
docs/
├── .vitepress/          # VitePress 配置
│   ├── config.ts        # 主配置文件
│   └── theme/           # 自定义主题文件
├── public/              # 静态资源
│   ├── favicon.png
│   └── logo.png
├── en/                  # 英文文档
│   ├── guide/          # 指南部分
│   └── examples/       # 示例部分
└── zh/                  # 中文文档
    ├── guide/          # 指南部分
    └── examples/       # 示例部分
```

## 基本使用

### 创建新文档

1. 在相应的语言目录中创建新的文档文件：
   - 英文：`docs/en/`
   - 中文：`docs/zh/`

2. 使用 Markdown 语法添加内容：
   ```markdown
   # 您的标题

   ## 第一部分
   第一部分的内容...

   ## 第二部分
   第二部分的内容...
   ```

3. 在 `docs/.vitepress/config.ts` 中更新导航：
   ```ts
   sidebar: {
     '/zh/guide/': [
       {
         text: '指南',
         items: [
           { text: '您的新页面', link: '/zh/guide/your-new-page' }
         ]
       }
     ]
   }
   ```

### Markdown 功能

1. 带语法高亮的代码块：
   ```js
   const hello = 'world';
   console.log(hello);
   ```

2. 表格：
   | 功能 | 描述 |
   |------|------|
   | Markdown | 使用 Markdown 编写内容 |
   | Vue | 使用 Vue 组件 |

3. 自定义容器：
   ::: tip
   这是一个提示
   :::

   ::: warning
   这是一个警告
   :::

### Vue 组件

您可以在 Markdown 文件中使用 Vue 组件：

```vue
<template>
  <div class="custom-component">
    {{ message }}
  </div>
</template>

<script setup>
const message = '来自 Vue 的问候！'
</script>
```

## 高级功能

### 自定义主题

1. 在 `.vitepress/theme/` 中创建自定义主题文件：
   ```ts
   // .vitepress/theme/index.ts
   import DefaultTheme from 'vitepress/theme'
   import MyLayout from './MyLayout.vue'

   export default {
     ...DefaultTheme,
     Layout: MyLayout
   }
   ```

2. 添加自定义样式：
   ```scss
   // .vitepress/theme/custom.scss
   :root {
     --vp-c-brand: #646cff;
     --vp-c-brand-light: #747bff;
   }
   ```

### 搜索配置

在 `config.ts` 中配置搜索功能：

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

## 部署

1. 构建文档：
   ```bash
   npm run docs:build
   # 或者使用 yarn
   yarn docs:build
   ```

2. 构建后的文件将位于 `docs/.vitepress/dist` 目录

3. 部署到您的托管服务：
   - GitHub Pages
   - Netlify
   - Vercel
   - 任何静态托管服务

## 下一步

- 查看[配置](./configuration.md)指南了解详细设置选项
- 探索[示例](../examples/)部分的使用示例
- 加入我们的社区获取支持和讨论
- 关注我们的 [GitHub 仓库](https://github.com/your-repo/docs)获取更新 