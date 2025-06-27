<template>
  <div class="p-2 md:p-4 bg-white min-h-full max-w-lg mx-auto">
    <a-form ref="formRef" :model="formState" layout="vertical">
      <a-form-item label="Tên đăng nhập">
        <a-input v-model:value="formState.username" disabled />
      </a-form-item>
      <a-form-item label="Họ tên" name="name" :rules="[{ required: true, message: 'Vui lòng nhập họ tên' }]">
        <a-input v-model:value="formState.name" />
      </a-form-item>
      <a-form-item label="Ảnh đại diện" name="url_avatar">
        <input type="file" accept="image/*" @change="handleAvatarChange" :disabled="uploadingAvatar" />
        <div class="mt-2">
          <a-avatar v-if="formState.url_avatar" :src="formState.url_avatar" size="large" />
          <a-avatar v-else size="large">
            <template #icon>
              <UserOutlined />
            </template>
          </a-avatar>
        </div>
      </a-form-item>
      <div class="flex justify-end mt-4">
        <a-button type="primary" @click="handleSave" :loading="saving">Lưu thay đổi</a-button>
      </div>
    </a-form>
  </div>
</template>

<script setup>
const { RestApi } = useApi()
const userStore = useUserStore()
const formRef = ref()
const uploadingAvatar = ref(false)
const saving = ref(false)

const formState = reactive({
  id: '',
  username: '',
  name: '',
  url_avatar: ''
})

const fetchProfile = async () => {
  try {
    const { data } = await RestApi.me.detail()
    if (data.value?.status === 'success') {
      Object.assign(formState, data.value.data)
    }
  } catch (e) {
    message.error('Không thể tải thông tin')
  }
}

const handleAvatarChange = async e => {
  const file = e.target.files[0]
  if (!file) return
  try {
    uploadingAvatar.value = true
    const url = await RestApi.upload_s3(`${Date.now()}_${file.name}`, file, {
      acl: 'public-read',
      encoding: 'blob',
      content_type: file.type,
      bucket: 'website'
    })
    formState.url_avatar = url
  } catch (err) {
    message.error('Upload ảnh thất bại')
  } finally {
    uploadingAvatar.value = false
  }
}

const handleSave = async () => {
  try {
    await formRef.value?.validate()
    saving.value = true
    const payload = { name: formState.name, url_avatar: formState.url_avatar }
    const res = await RestApi.me.update({ body: payload })
    if (res.data.value?.status === 'success') {
      message.success(res.data.value?.message || 'Cập nhật thành công')
      userStore.setUser({ ...userStore.user, user: { ...userStore.user.user, name: formState.name, avatar: formState.url_avatar } })
    } else {
      throw new Error(res.data.value?.message || 'Thất bại')
    }
  } catch (err) {
    message.error(err.message || 'Lỗi khi lưu')
  } finally {
    saving.value = false
  }
}

await fetchProfile()
</script>
