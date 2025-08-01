<!-- src/App.vue -->
<template>
  <DefaultLayout>
    <RouterView />
  </DefaultLayout>
</template>

<script setup lang="ts">
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
</script>

<style>
body {
  background-color: #cccccc !important;
}
</style>
