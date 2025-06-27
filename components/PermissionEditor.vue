<template>
  <a-table :columns="menuColumns" :data-source="flatMenuData" size="small" bordered :pagination="false" :scroll="{ y: '60vh' }">
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'permission' && record.permissionBit !== undefined">
        <a-radio-group size="small" option-type="button" button-style="solid" :value="getPermission(record.key, record.permissionBit)" @change="e => setPermission(record.key, record.permissionBit, e.target.value)">
          <a-radio :value="0">Ẩn</a-radio>
          <a-radio :value="1">Xem</a-radio>
          <a-radio :value="2">Sửa</a-radio>
        </a-radio-group>
      </template>
      <template v-else-if="column.dataIndex === 'title'">
        <div :style="{ paddingLeft: (record.level * 16) + 'px' }" class="flex items-center">
          <span v-if="record.children" class="mr-1">📁</span>
          <span v-else class="mr-1">📄</span>
          {{ record.title }}
        </div>
      </template>
    </template>
  </a-table>
</template>

<script setup>
const { RestApi } = useApi()

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const flatData = ref([])
const flatMenuData = ref([])
const menuPermissions = reactive({})

// Tải dữ liệu menu
const fetchData = async () => {
  try {
    const { data } = await RestApi.menu.list()
    if (data.value?.status === 'success') {
      flatData.value = data.value.data // API trả về mảng trực tiếp
      flatMenuData.value = buildMenuWithLevel(flatData.value)
      initMenuPermissions(flatData.value, props.modelValue)
    }
  } catch (e) {
    message.error('Lỗi khi tải menu')
  }
}

function buildMenuWithLevel(data, parentId = null, level = 0) {
  const result = []
  data
    .filter(item => item.parent_Id === parentId)
    .forEach(item => {
      const children = buildMenuWithLevel(data, item.id, level + 1)
      result.push({
        ...item,
        level,
        children: children.length > 0 ? children : undefined
      })
    })
  return result
}

function normalizeInputPermissions(menuData, inputPermissions) {
  const validParentKeys = new Set(menuData.filter(d => d.parent_Id === null).map(d => d.key))
  validParentKeys.add('menu')
  return inputPermissions.filter(item =>
    validParentKeys.has(item.key) && typeof item.permissionValue === 'number'
  )
}

function initMenuPermissions(menuData, serverPerms) {
  const normalizedPermissions = normalizeInputPermissions(menuData, serverPerms)
  Object.keys(menuPermissions).forEach(key => delete menuPermissions[key])
  const serverPermsMap = {}
  normalizedPermissions.forEach(item => {
    serverPermsMap[item.key] = item.permissionValue
  })
  menuPermissions.menu = serverPermsMap.menu || 0
  const parentKeys = menuData.filter(d => d.parent_Id === null).map(d => d.key)
  parentKeys.forEach(key => {
    menuPermissions[key] = serverPermsMap[key] || 0
  })
}

watch(() => props.modelValue, (newVal) => {
  if (flatData.value.length > 0) {
    initMenuPermissions(flatData.value, newVal)
  }
}, { deep: true })

const menuColumns = [
  { title: 'Tên Menu', dataIndex: 'title' },
  { title: 'Quyền', dataIndex: 'permission' },
]

const isTopLevel = (key) => flatMenuData.value.some(m => m.key === key)
const findParentKey = (childKey) => {
  const child = flatData.value.find(item => item.key === childKey)
  if (!child) return null
  const parent = flatData.value.find(item => item.id === child.parent_Id)
  return parent?.key
}

const getPermission = (key, permissionBit) => {
  const isParent = isTopLevel(key)
  const parentKey = isParent ? 'menu' : findParentKey(key)
  return ((menuPermissions[parentKey] ?? 0) >> permissionBit) & 0b11
}

const setPermission = (key, permissionBit, val) => {
  const isParent = isTopLevel(key)
  const parentKey = isParent ? 'menu' : findParentKey(key)
  const current = menuPermissions[parentKey] ?? 0
  const cleared = current & ~(0b11 << permissionBit)
  const updated = cleared | (val << permissionBit)
  menuPermissions[parentKey] = updated
  emit('update:modelValue', permissionList.value)
}

const permissionList = computed(() => {
  const allParentKeys = flatData.value.filter(item => item.parent_Id === null).map(item => item.key)
  const result = []
  result.push({
    key: 'menu',
    permissionValue: menuPermissions.menu || 0
  })
  allParentKeys.forEach(key => {
    result.push({
      key,
      permissionValue: menuPermissions[key] || 0
    })
  })
  return result
})

fetchData()
</script>

<style scoped>
.table-container {
  height: 70vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.table-container :deep(.ant-table) {
  flex: 1;
  overflow: auto;
}
.table-container :deep(.ant-table-container) {
  height: 100%;
}
</style>
