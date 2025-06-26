<template>
  <div class="p-4 bg-white rounded shadow min-h-full">
    <!-- 🧭 Thanh công cụ tìm kiếm & thêm mới -->
    <div class="flex flex-col md:flex-row justify-end items-end md:items-center gap-2 mb-6">
      <a-button type="primary" @click="showModal(null)" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">Thêm mới</a-button>
    </div>

    <!-- 📋 Bảng danh sách menu -->
    <a-table
      :columns="columns"
      :data-source="nestedMenuData"
      :pagination="false"
      :loading="loading"
      :scroll="{ x: 1000 }"
      :row-class-name="rowClassName"
      :expand-icon-column-index="0"
      bordered
      size="small"
    >
      <template #bodyCell="{ column, record }">
        <!-- Cột Icon -->
        <template v-if="column.key === 'icon'">
          <Icon :name="record.icon" />
        </template>
        <!-- Cột Hành động -->
        <template v-if="column.key === 'action'">
          <div class="flex justify-center gap-2">
            <a-tooltip title="Thêm menu con" v-if="getDepth(record) < 2">
              <a-button type="link" size="small" @click="showModal(record.id)" :disabled="!settingStore.currentPermission">
                <FolderAddOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip title="Sửa">
              <a-button type="link" size="small" @click="editItem(record)" :disabled="!settingStore.currentPermission">
                <EditOutlined />
              </a-button>
            </a-tooltip>
            <a-popconfirm title="Bạn chắc chắn muốn xóa?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteItem(record.id)">
              <a-tooltip title="Xóa">
                <a-button type="link" danger size="small" :disabled="!settingStore.currentPermission">
                  <DeleteOutlined />
                </a-button>
              </a-tooltip>
            </a-popconfirm>
          </div>
        </template>
      </template>
    </a-table>

    <!-- 📝 Modal tạo / sửa menu -->
    <a-modal
      v-model:open="visible"
      :title="isEdit ? 'Chỉnh sửa menu' : currentParentId ? 'Thêm menu con' : 'Thêm menu mới'"
      @cancel="handleCancel"
      :width="700"
      :footer="null"
    >
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules">
        <a-form-item label="Tiêu đề menu" name="title">
          <a-input v-model:value="formState.title" placeholder="Nhập tiêu đề menu" @input="onTitleInput" />
        </a-form-item>
        <a-form-item label="Key menu" name="key">
          <a-input v-model:value="formState.key" :disabled="true" placeholder="Tự động sinh từ tiêu đề" />
        </a-form-item>
        <a-form-item label="Đường dẫn" name="url">
          <a-input v-model:value="formState.url" />
        </a-form-item>
        <IconPicker v-model="formState.icon" />
        <div class="flex justify-end gap-2 mt-6">
          <a-button @click="handleCancel">Hủy</a-button>
          <a-button type="primary" @click="handleOk" :loading="confirmLoading">
            {{ isEdit ? 'Cập nhật' : 'Thêm mới' }}
          </a-button>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
const settingStore = useSettingStore()
const { RestApi } = useApi()

// --- Trạng thái hiển thị ---
const searchText = ref('')
const visible = ref(false)
const confirmLoading = ref(false)
const isEdit = ref(false)
const currentId = ref(null)
const currentParentId = ref(null)

// --- Dữ liệu & biểu mẫu ---
const formRef = ref()
const dataSource = ref([])
const nestedMenuData = ref([])
const menuOptions = ref([])

const formState = reactive({
  id: null,
  title: '',
  key: '',
  url: '',
  icon: '',
  parent_Id: null,
  permissionBit: 0
})

const rules = {
  title: [{ required: true, message: 'Vui lòng nhập tiêu đề', trigger: 'blur' }],
  key: [{ required: true, message: 'Vui lòng nhập key', trigger: 'blur' }]
}

// --- Cấu hình bảng ---
const columns = [
  { title: 'Tiêu đề', dataIndex: 'title', key: 'title', width: 200 },
  { title: 'Key', dataIndex: 'key', key: 'key', width: 150 },
  { title: 'Đường dẫn', dataIndex: 'url', key: 'url', width: 200, ellipsis: true },
  { title: 'BitIndex', dataIndex: 'permissionBit', key: 'permissionBit', width: 100, ellipsis: true },
  { title: 'Icon', dataIndex: 'icon', key: 'icon', width: 100, ellipsis: true },
  { title: 'Thao tác', key: 'action', align: 'center', fixed: 'right', width: 160 }
]

const loading = ref(false)
const param = ref({ search: '' })

// --- Phân trang (dự phòng nếu thêm sau) ---
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 📌 Tạo key ngẫu nhiên
const generateRandomKey = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = 'menu-'
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 📌 Gán key tự động từ tiêu đề
const onTitleInput = (e) => {
  formState.title = e.target.value
  if (!isEdit.value) {
    formState.key = generateRandomKey()
  }
}

// 📌 Lấy permissionBit chưa dùng
const getNextAvailablePermissionBit = (parentId) => {
  const siblings = dataSource.value.filter(i => i.parent_Id === parentId)
  const usedBits = siblings.map(i => i.permissionBit).filter(bit => typeof bit === 'number')
  for (let i = 0; i < 64; i += 2) {
    if (!usedBits.includes(i)) return i
  }
  return usedBits.length * 2
}

// 📌 Lấy độ sâu menu (cấp cha – con)
const getDepth = (record) => {
  let depth = 1
  let parent = dataSource.value.find(i => i.id === record.parent_Id)
  while (parent) {
    depth++
    parent = dataSource.value.find(i => i.parent_Id === parent.id)
  }
  return depth
}

// 📌 Đặt màu nền theo cấp độ
const rowClassName = (record) => {
  const level = getDepth(record)
  if (level === 1) return 'level-1-row'
  if (level === 2) return 'level-2-row'
  return ''
}

// 📌 Xây cây lồng nhau cho a-table
const buildNestedMenu = (items, parentId = null) => {
  return items
    .filter(i => i.parent_Id === parentId)
    .map(i => ({ ...i, children: buildNestedMenu(items, i.id) }))
}

// 📌 Tạo danh sách chọn menu cha
const buildMenuOptions = (items) => {
  return items
    .filter(i => i.parent_Id === null)
    .map(i => ({ id: i.id, title: i.title, children: [] }))
}

// 📌 Mở modal thêm mới / thêm con
const showModal = (parentId) => {
  if (parentId) {
    const parent = dataSource.value.find(i => i.id === parentId)
    if (getDepth(parent) >= 2) return message.warning('Chỉ cho phép tối đa 2 cấp menu')
  }

  isEdit.value = false
  currentId.value = null
  currentParentId.value = parentId
  Object.assign(formState, {
    id: null,
    title: '',
    key: generateRandomKey(),
    url: '',
    icon: '',
    parent_Id: parentId || null,
    permissionBit: getNextAvailablePermissionBit(parentId || null)
  })
  visible.value = true
}

// 📌 Mở modal sửa
const editItem = (record) => {
  isEdit.value = true
  currentId.value = record.id
  Object.assign(formState, { ...record })
  visible.value = true
}

// 📌 Lưu dữ liệu
const handleOk = async () => {
  try {
    await formRef.value.validate()
    confirmLoading.value = true
    const payload = { ...formState }

    if (isEdit.value) {
      await RestApi.menu.update({ body: payload })
      message.success('Cập nhật thành công')
    } else {
      delete payload.id
      await RestApi.menu.create({ body: payload })
      message.success('Thêm mới thành công')
    }

    visible.value = false
    await fetchData({ ...param.value })
  } catch (err) {
    message.error(err.message || 'Lỗi khi lưu menu')
  } finally {
    confirmLoading.value = false
  }
}

// 📌 Đóng modal
const handleCancel = () => {
  formRef.value?.resetFields()
  visible.value = false
}

// 📌 Xóa menu
const deleteItem = async (id) => {
  try {
    const { data } = await RestApi.menu.delete({ params: { id } })
    if (data.value?.status === 'success') {
      message.success('Xóa thành công')
      await fetchData({ ...param.value })
    } else {
      message.error(data.value?.message || 'Có lỗi xảy ra')
    }
  } catch {
    message.error('Lỗi khi xóa')
  }
}

// 📌 Gọi API lấy dữ liệu menu
const fetchData = async (param) => {
  try {
    loading.value = true
    const { data } = await RestApi.menu.list({ params: param })
    if (data.value?.status === 'success') {
      dataSource.value = data.value.data
      nestedMenuData.value = buildNestedMenu(dataSource.value)
      menuOptions.value = buildMenuOptions(dataSource.value)
    }
  } catch (e) {
    message.error('Lỗi khi tải menu')
  } finally {
    loading.value = false
  }
}

// 🚀 Khởi tạo dữ liệu khi vào trang
await fetchData({ ...param.value })
</script>

<style scoped>
:deep(.level-1-row) {
  background-color: #fafafa;
}
:deep(.level-2-row) {
  background-color: #f5f5f5;
}
</style>
