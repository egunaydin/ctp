<!-- src/App.vue -->
<template>
  <div>
    <!-- Login ve benzeri sayfalarda layout kullanma -->
    <RouterView v-if="$route.meta.layout === 'none'" />

    <!-- Diğer tüm sayfalarda DefaultLayout kullan -->
    <DefaultLayout v-else>
      <RouterView />
    </DefaultLayout>
  </div>
</template>

<script setup lang="ts">
import DefaultLayout from "@/components/layout/DefaultLayout.vue";
</script>

<style>
body {
  background-color: #cccccc !important;
}
</style>
