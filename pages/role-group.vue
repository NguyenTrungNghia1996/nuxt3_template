<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm Nhóm quyền..." enter-button @search="handleSearch" class="w-full md:w-1/3" />
      <a-button @click="resetForm" class="w-full md:w-auto">Đặt lại</a-button>
      <a-button type="primary" @click="showModal" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">Thêm mới</a-button>
    </div>

    <ClientOnly class="overflow-x-auto">
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: '800' }" @change="handleTableChange" bordered size="small">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </template>
          <template v-if="column.key === 'mota'">
            <span v-if="record.mota">{{ record.mota }}</span>
            <span v-else class="text-gray-400">Trống</span>
          </template>
          <template v-if="column.key === 'action'">
            <div class="flex justify-center">
              <div class="md:flex space-x-2">
                <a-button type="link" size="small" @click="editItem(record.id)" :disabled="!settingStore.currentPermission">
                  <template #icon>
                    <EditOutlined />
                  </template>
                </a-button>
                <a-popconfirm title="Bạn chắc chắn muốn xóa?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteItem(record.id)">
                  <a-button type="link" danger size="small" :disabled="!settingStore.currentPermission">
                    <template #icon>
                      <DeleteOutlined />
                    </template>
                  </a-button>
                </a-popconfirm>
              </div>
            </div>
          </template>
        </template>
      </a-table>
    </ClientOnly>

    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa Nhóm quyền' : 'Thêm mới Nhóm quyền'" @cancel="handleCancel" :width="modalWidth" :bodyStyle="{ maxHeight: '70vh', overflowY: 'auto' }">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <a-form ref="formRef" :model="formState" layout="vertical">
          <a-form-item label="Tên Nhóm quyền" name="ten" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }" :rules="rules.ten">
            <a-input v-model:value="formState.ten" placeholder="Nhập tên Nhóm quyền" :maxlength="200" show-count />
          </a-form-item>

          <a-form-item label="Mô tả" name="mota" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
            <a-textarea v-model:value="formState.mota" :rows="4" placeholder="Nhập mô tả (nếu có)" :maxlength="200" show-count />
          </a-form-item>
        </a-form>
        <PermissionEditor v-model="formState.permission" />
      </div>

      <template #footer>
        <div class="flex justify-end space-x-2">
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
const settingStore = useSettingStore();
const { loadPermissions } = usePermissions();
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core';
const { RestApi } = useApi();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller('md');
const modalWidth = computed(() => (isMobile.value ? '95vw' : 1000));
const searchText = ref('');
const loading = ref(false);
const visible = ref(false);
const confirmLoading = ref(false);
const isEdit = ref(false);
const formRef = ref();

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['1', '10', '20', '50'],
  showTotal: (total) => `Tổng ${total} bản ghi`
});

const columns = [
  { title: 'STT', key: 'stt', width: 50, align: 'center' },
  { title: 'Tên Nhóm quyền', dataIndex: 'ten', key: 'ten', ellipsis: true },
  { title: 'Mô tả', dataIndex: 'mota', key: 'mota', ellipsis: true },
  { title: 'Thao tác', key: 'action', width: 80, align: 'center', fixed: 'right' }
];

const formState = reactive({
  id: null,
  ten: '',
  mota: '',
  permission: []
});

const rules = reactive({
  ten: [
    { required: true, message: 'Vui lòng nhập tên Nhóm quyền', trigger: 'blur' },
    { min: 2, message: 'Tên phải có ít nhất 2 ký tự', trigger: 'blur' }
  ]
});

const param = ref({ PageIndex: 1, PageSize: 10, search: '' });
const dataSource = ref([]);

const fetchData = async (param) => {
  try {
    loading.value = true;
    const { data } = await RestApi.roles.list({ params: param });
    if (data.value?.status === 'success') {
      dataSource.value = data.value.data.items || [];
      pagination.total = data.value.data.totalrecord;
    }
  } catch (err) {
    message.error('Không thể tải dữ liệu');
  } finally {
    loading.value = false;
  }
};

const handleTableChange = async (pag) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  param.value.PageIndex = pag.current;
  param.value.PageSize = pag.pageSize;
  await fetchData({ ...param.value });
};

const handleSearch = async () => {
  param.value.search = searchText.value;
  pagination.current = 1;
  await fetchData({ ...param.value });
};

const showModal = async () => {
  isEdit.value = false;
  Object.assign(formState, { id: null, ten: '', mota: '', permission: [] });
  visible.value = true;
};

const editItem = async (id) => {
  isEdit.value = true;
  try {
    const { data } = await RestApi.roles.detail({ params: { id } });
    if (data.value?.status === 'success') {
      Object.assign(formState, data.value.data);
      visible.value = true;
    }
  } catch (err) {
    message.error('Không thể lấy dữ liệu chi tiết');
  }
};

const handleOk = async () => {
  try {
    await formRef.value.validate();
    confirmLoading.value = true;

    let res;
    if (isEdit.value) {
      res = await RestApi.roles.update({ body: { ...formState } });
    } else {
      const payload = { ...formState };
      delete payload.id;
      res = await RestApi.roles.create({ body: payload });
    }

    if (res.data.value?.status === 'success') {
      message.success(res.data.value?.message || 'Thành công');
      await fetchData({ ...param.value });
      visible.value = false;
      formRef.value.resetFields();
    } else {
      throw new Error(res.error?.value?.data?.message || 'Lỗi không xác định');
    }
  } catch (err) {
    message.error(err.message || 'Lỗi khi lưu thông tin');
  } finally {
    await loadPermissions();
    confirmLoading.value = false;
  }
};

const handleCancel = () => {
  formRef.value.resetFields();
  visible.value = false;
};

const deleteItem = async (id) => {
  try {
    const { data } = await RestApi.roles.delete({ params: { id } });
    if (data.value?.status === 'success') {
      message.success(data.value?.message || 'Đã xóa');
      await fetchData({ ...param.value });
    } else {
      message.error(data.value?.message || 'Không thể xóa');
    }
  } catch (err) {
    message.error('Lỗi khi xóa');
  }
};

const resetForm = async () => {
  if (formRef.value) formRef.value.resetFields();
  param.value = { PageIndex: 1, PageSize: 10, search: '' };
  pagination.current = 1;
  pagination.pageSize = 10;
  await fetchData({ ...param.value });
};

await fetchData({ ...param.value });
</script>
<style scoped>
.custom-modal :deep(.ant-modal-body) {
  padding: 16px 24px;
}

.custom-modal :deep(.ant-modal-content) {
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.custom-modal :deep(.ant-modal-header) {
  flex-shrink: 0;
}

.custom-modal :deep(.ant-modal-footer) {
  flex-shrink: 0;
}
</style>
