# Vue Components

This page demonstrates how to use Vue components in VitePress.

## Basic Component Usage

You can use Vue components directly in your Markdown files:

```vue
<template>
  <div class="demo-component">
    <h3>Counter Component</h3>
    <button @click="count++">Count is: {{ count }}</button>
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

## Component Props

You can pass props to components:

```vue
<template>
  <div class="props-demo">
    <h3>Props Demo</h3>
    <p>Message: {{ message }}</p>
    <button @click="updateMessage">Update Message</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const message = ref('Hello from props!')

function updateMessage() {
  message.value = 'Message updated!'
}
</script>
```

## Component Events

Components can emit events:

```vue
<template>
  <div class="events-demo">
    <h3>Events Demo</h3>
    <button @click="handleClick">Click me</button>
    <p>Last clicked: {{ lastClickTime }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const lastClickTime = ref('Never')

function handleClick() {
  lastClickTime.value = new Date().toLocaleTimeString()
}
</script>
```

## Component Composition

You can compose multiple components:

```vue
<template>
  <div class="composition-demo">
    <h3>Composition Demo</h3>
    <div class="counter">
      <button @click="decrement">-</button>
      <span>{{ count }}</span>
      <button @click="increment">+</button>
    </div>
    <p>Total changes: {{ changes }}</p>
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