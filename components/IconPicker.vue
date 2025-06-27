<template>
  <a-form-item :label="label" :name="name" :rules="rules">
    <div class="flex items-center gap-2 w-full">
      <a-select show-search class="flex-1" :value="modelValue" @update:value="val => $emit('update:modelValue', val)" :placeholder="placeholder" allow-clear :options="filteredOptions" :filter-option="false" @search="onSearch">
        <template #option="{ value }">
          <div class="flex items-center gap-2">
            <Icon :name="value" />
            <span>{{ value.replace('ant-design:', '') }}</span>
          </div>
        </template>
      </a-select>
      <Icon v-if="modelValue" :name="modelValue" class="text-xl" />
    </div>
  </a-form-item>
</template>

<script setup>
import { ref, computed } from 'vue'
import icons from '@iconify-json/ant-design/icons.json'

const props = defineProps({
  modelValue: String,
  label: { type: String, default: 'Icon' },
  name: { type: String, default: 'icon' },
  placeholder: { type: String, default: 'Chọn icon' },
  rules: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue'])
const search = ref('')

const allOptions = Object.keys(icons.icons).map(name => ({
  label: name,
  value: `ant-design:${name}`
}))

const filteredOptions = computed(() => {
  if (!search.value) return allOptions
  const keyword = search.value.toLowerCase()
  return allOptions.filter(i => i.label.toLowerCase().includes(keyword))
})

const onSearch = val => {
  search.value = val
}
</script>
