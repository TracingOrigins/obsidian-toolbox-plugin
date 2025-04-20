# Vue 组件

本页面展示了如何在 VitePress 中使用 Vue 组件。

## 基本组件使用

你可以直接在 Markdown 文件中使用 Vue 组件：

```vue
<template>
  <div class="demo-component">
    <h3>计数器组件</h3>
    <button @click="count++">计数：{{ count }}</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<style>
.demo-component {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
```

## 组件属性

你可以向组件传递属性：

```vue
<template>
  <div class="props-demo">
    <h3>属性演示</h3>
    <p>消息：{{ message }}</p>
    <button @click="updateMessage">更新消息</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const message = ref('来自属性的问候！')

function updateMessage() {
  message.value = '消息已更新！'
}
</script>
```

## 组件事件

组件可以触发事件：

```vue
<template>
  <div class="events-demo">
    <h3>事件演示</h3>
    <button @click="handleClick">点击我</button>
    <p>最后点击时间：{{ lastClickTime }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const lastClickTime = ref('从未点击')

function handleClick() {
  lastClickTime.value = new Date().toLocaleTimeString()
}
</script>
```

## 组件组合

你可以组合多个组件：

```vue
<template>
  <div class="composition-demo">
    <h3>组合演示</h3>
    <div class="counter">
      <button @click="decrement">-</button>
      <span>{{ count }}</span>
      <button @click="increment">+</button>
    </div>
    <p>总变化次数：{{ changes }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const count = ref(0)
const changes = ref(0)

function increment() {
  count.value++
  changes.value++
}

function decrement() {
  count.value--
  changes.value++
}
</script>

<style>
.composition-demo {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.counter {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
}
</style>
``` 