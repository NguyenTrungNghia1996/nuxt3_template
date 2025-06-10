<template>
  <div>
    {{ data }}
    <TinyMCE v-model="data" class="w-full" />
    <div>Dayjs{{ now }}</div>
  </div>
</template>
<script setup>
const data = ref("");
const { $dayjs } = useNuxtApp();

const now = $dayjs().format("DD/MM/YYYY");
</script>