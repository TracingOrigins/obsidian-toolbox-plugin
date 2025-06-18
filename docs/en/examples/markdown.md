# Markdown Examples

This page demonstrates various Markdown features supported by VitePress.

## Basic Syntax

### Headers

# H1 Header
## H2 Header
### H3 Header
#### H4 Header

### Text Formatting

**Bold text**
*Italic text*
~~Strikethrough text~~

### Lists

Unordered list:
- Item 1
- Item 2
  - Nested item 1
  - Nested item 2

Ordered list:
1. First item
2. Second item
   1. Nested item 1
   2. Nested item 2

### Links and Images

[External link](https://vitepress.dev)
![Image alt text](/images/logo.png)

### Code Blocks

```js
const greeting = 'Hello, VitePress!'
console.log(greeting)
```

### Tables

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |

### Blockquotes

> This is a blockquote
> With multiple lines

## Advanced Features

### Frontmatter

```yaml
---
title: My Page
description: A page with frontmatter
---
```

### Custom Containers

::: tip
This is a tip
:::

::: warning
This is a warning
:::

::: danger
This is a dangerous warning
:::

### Emoji Support

🚀 �� 🌙 🔍 🌐

### Task Lists

- [x] Completed task
- [ ] Pending task 