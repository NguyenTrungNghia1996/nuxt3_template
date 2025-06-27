<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm người dùng..." enter-button @search="handleSearch" class="w-full md:w-1/3" />
      <a-button @click="resetForm" class="w-full md:w-auto">Đặt lại</a-button>
      <a-button type="primary" @click="showModal" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">Thêm mới</a-button>
    </div>

    <ClientOnly class="overflow-x-auto">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="pagination"
        :loading="loading"
        :scroll="{ x: '800' }"
        @change="handleTableChange"
        bordered
        size="small"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </template>
          <template v-if="column.key === 'role_groups'">
            <span v-if="record.role_groups && record.role_groups.length">
              {{ record.role_groups.map(id => roleGroupNameMap.value[id] || id).join(', ') }}
            </span>
            <span v-else class="text-gray-400">Trống</span>
          </template>
          <template v-if="column.key === 'action'">
            <div class="flex justify-center">
              <a-button type="link" size="small" @click="editItem(record)" :disabled="!settingStore.currentPermission">
                <template #icon>
                  <EditOutlined />
                </template>
              </a-button>
            </div>
          </template>
        </template>
      </a-table>
    </ClientOnly>

    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa Người dùng' : 'Thêm mới Người dùng'" @cancel="handleCancel" :width="500">
      <a-form ref="formRef" :model="formState" layout="vertical">
        <a-form-item label="Tên đăng nhập" v-if="!isEdit" name="username" :rules="[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]">
          <a-input v-model:value="formState.username" />
        </a-form-item>
        <a-form-item label="Mật khẩu" v-if="!isEdit" name="password" :rules="[{ required: true, message: 'Vui lòng nhập mật khẩu' }]">
          <a-input-password v-model:value="formState.password" />
        </a-form-item>
        <a-form-item label="Họ tên" name="name" :rules="[{ required: true, message: 'Vui lòng nhập họ tên' }]">
          <a-input v-model:value="formState.name" />
        </a-form-item>
        <a-form-item label="Nhóm quyền" name="role_groups">
          <a-select v-model:value="formState.role_groups" mode="multiple" :options="roleGroupOptions" option-label-prop="label" />
        </a-form-item>
      </a-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <a-button @click="handleCancel">Hủy</a-button>
          <a-button type="primary" @click="handleOk" :loading="confirmLoading">
            {{ isEdit ? 'Cập nhật' : 'Thêm mới' }}
          </a-button>
        </div>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
const { RestApi } = useApi()
const settingStore = useSettingStore()

const searchText = ref('')
const loading = ref(false)
const visible = ref(false)
const confirmLoading = ref(false)
const isEdit = ref(false)
const formRef = ref()

const dataSource = ref([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['1', '10', '20', '50'],
  showTotal: total => `Tổng ${total} bản ghi`
})

const columns = [
  { title: 'STT', key: 'stt', width: 50, align: 'center' },
  { title: 'Tên đăng nhập', dataIndex: 'username', key: 'username' },
  { title: 'Họ tên', dataIndex: 'name', key: 'name' },
  { title: 'Nhóm quyền', key: 'role_groups' },
  { title: 'Thao tác', key: 'action', width: 80, align: 'center', fixed: 'right' }
]

const formState = reactive({
  id: null,
  username: '',
  password: '',
  name: '',
  role_groups: []
})

const roleGroupOptions = ref([])
const roleGroupNameMap = ref({})

const param = ref({ page: 1, limit: 10, search: '' })

const fetchRoleGroups = async () => {
  try {
    const { data } = await RestApi.roles.list({ params: { PageIndex: 1, PageSize: 1000 } })
    if (data.value?.status === 'success') {
      const items = data.value.data.items || []
      roleGroupOptions.value = items.map(i => ({ value: i.id, label: i.name }))
    }
  } catch (e) {
    console.error(e)
  }
}

const fetchRoleGroupName = async (id) => {
  if (roleGroupNameMap.value[id]) return roleGroupNameMap.value[id]
  try {
    const { data } = await RestApi.roles.detail({ params: { id } })
    if (data.value?.status === 'success') {
      const name = data.value.data.name
      roleGroupNameMap.value[id] = name
      return name
    }
  } catch (e) {
    console.error(e)
  }
  return id
}

const updateRoleGroupNames = async (items) => {
  const ids = new Set()
  items.forEach((item) => {
    ;(item.role_groups || []).forEach((id) => ids.add(id))
  })
  const promises = []
  ids.forEach((id) => {
    if (!roleGroupNameMap.value[id]) {
      promises.push(fetchRoleGroupName(id))
    }
  })
  await Promise.all(promises)
}

const fetchData = async p => {
  try {
    loading.value = true
    const { data } = await RestApi.user.list({ params: p })
    if (data.value?.status === 'success') {
      dataSource.value = data.value.data.items || []
      pagination.total = data.value.data.total
      await updateRoleGroupNames(dataSource.value)
    }
  } catch (err) {
    message.error('Không thể tải dữ liệu')
  } finally {
    loading.value = false
  }
}

const handleTableChange = async pag => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  param.value.page = pag.current
  param.value.limit = pag.pageSize
  await fetchData({ ...param.value })
}

const handleSearch = async () => {
  param.value.search = searchText.value
  pagination.current = 1
  await fetchData({ ...param.value, page: 1 })
}

const showModal = () => {
  isEdit.value = false
  Object.assign(formState, { id: null, username: '', password: '', name: '', role_groups: [] })
  visible.value = true
}

const editItem = record => {
  isEdit.value = true
  Object.assign(formState, { id: record.id, username: record.username, name: record.name, role_groups: record.role_groups.slice(), password: '' })
  visible.value = true
}

const handleOk = async () => {
  try {
    await formRef.value?.validate()
    confirmLoading.value = true
    let res
    if (isEdit.value) {
      const payload = { id: formState.id, name: formState.name, role_groups: formState.role_groups }
      res = await RestApi.user.update({ body: payload })
    } else {
      const payload = { username: formState.username, password: formState.password, name: formState.name, role_groups: formState.role_groups }
      res = await RestApi.user.create({ body: payload })
    }
    if (res.data.value?.status === 'success') {
      message.success(res.data.value?.message || 'Thành công')
      visible.value = false
      await fetchData({ ...param.value })
    } else {
      throw new Error(res.error?.value?.data?.message || 'Lỗi không xác định')
    }
  } catch (err) {
    message.error(err.message || 'Lỗi khi lưu thông tin')
  } finally {
    confirmLoading.value = false
  }
}

const handleCancel = () => {
  formRef.value?.resetFields()
  visible.value = false
}

const resetForm = async () => {
  if (formRef.value) formRef.value.resetFields()
  param.value = { page: 1, limit: 10, search: '' }
  pagination.current = 1
  pagination.pageSize = 10
  searchText.value = ''
  await fetchData({ ...param.value })
}

await fetchRoleGroups()
await fetchData({ ...param.value })
</script>

