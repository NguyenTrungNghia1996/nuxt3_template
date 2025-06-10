<template>
  <div class="h-full w-full flex justify-between items-center bg-gray-900 px-6 border-b border-gray-700">
    <!-- Logo with modern glow effect -->
    <div class="flex items-center">
      <img src="/logo.png" alt="Logo" class="h-16 p-2 cursor-pointer transition-all duration-300 ease-out rounded-xl hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 active:scale-95 active:shadow-none" @click="() => navigateTo(`/`)" />
    </div>

    <!-- User dropdown with modern styling -->
    <div class="flex items-center">
      <a-dropdown>
        <div class="flex items-center cursor-pointer transition-all duration-200 ease-out p-1.5 rounded-lg hover:bg-gray-700/50 group" @click.prevent>
          <div class="flex items-center gap-3">
            <!-- User name display -->
            <div class="hidden md:block text-right">
              <div class="text-sm font-medium text-gray-200 group-hover:text-white">
                {{ userStore.name }}
              </div>
              <div class="text-xs text-gray-400">
                {{ userStore.role }}
              </div>
            </div>

            <!-- Avatar -->
            <div class="relative">
              <a-avatar v-if="userStore.user.avatar" :src="userStore.user.avatar" class="w-9 h-9 transition-all duration-300 ease-out group-hover:ring-2 group-hover:ring-blue-400 group-hover:scale-110" />
              <a-avatar v-else class="w-9 h-9 bg-gray-600 transition-all duration-300 ease-out group-hover:ring-2 group-hover:ring-blue-400 group-hover:scale-110" :style="{ verticalAlign: 'middle' }" style="background-color: #8e8e8e">
                <template #icon>
                  <UserOutlined class="text-gray-300" />
                </template>
              </a-avatar>
            </div>
          </div>
        </div>

        <template #overlay>
          <a-menu class="min-w-[180px] bg-gray-800 border border-gray-700 rounded-lg py-1 shadow-xl">
            <a-menu-item key="profile" class="hover:bg-gray-700/50 !px-4 !py-2.5 !mx-0 text-gray-200 hover:text-white" @click="navigateTo('/profile')">
              <div class="flex items-center gap-2">
                <UserOutlined class="text-blue-400" />
                <span>Hồ sơ cá nhân</span>
              </div>
            </a-menu-item>
            <a-menu-item key="change_password" class="hover:bg-gray-700/50 !px-4 !py-2.5 !mx-0 text-gray-200 hover:text-white" @click="showChangePasswordModal">
              <div class="flex items-center gap-2">
                <KeyOutlined class="text-blue-400" />
                <span>Đổi mật khẩu</span>
              </div>
            </a-menu-item>
            <a-menu-item key="logout" class="hover:bg-gray-700/50 !px-4 !py-2.5 !mx-0 text-gray-200 hover:text-white" @click="signOut">
              <div class="flex items-center gap-2">
                <LogoutOutlined class="text-red-400" />
                <span>Đăng xuất</span>
              </div>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>

    <!-- Modern Change Password Modal -->
    <a-modal v-model:open="changePasswordModalVisible" title="Thay đổi mật khẩu" :confirm-loading="confirmLoading" class="[&_.ant-modal-content]:bg-gray-800 [&_.ant-modal-header]:bg-gray-800 [&_.ant-modal-title]:text-white" :footer="null">
      <a-form layout="vertical" :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" autocomplete="off" class="[&_.ant-form-item-label]:text-gray-300 [&_.ant-form-item-label]:font-medium [&_input]:bg-gray-700 [&_input]:border-gray-600 [&_input]:text-white">
        <a-form-item label="Mật khẩu hiện tại" name="currentPassword">
          <a-input-password v-model:value="passwordForm.currentPassword" />
        </a-form-item>
        <a-form-item label="Mật khẩu mới" name="newPassword">
          <a-input-password v-model:value="passwordForm.newPassword" />
        </a-form-item>
        <a-form-item label="Xác nhận mật khẩu" name="confirmPassword">
          <a-input-password v-model:value="passwordForm.confirmPassword" />
        </a-form-item>

        <div class="flex justify-end gap-3 pt-2">
          <a-button @click="handleCancel" class="border-gray-600 text-gray-300 hover:text-white hover:border-blue-400 hover:bg-gray-700/50"> Hủy bỏ </a-button>
          <a-button type="primary" :loading="confirmLoading" @click="handleChangePassword" class="bg-blue-600 hover:bg-blue-500 border-blue-600"> Xác nhận </a-button>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { KeyOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons-vue";

const userStore = useUserStore();
const { RestApi } = useApi();

// Modal state
const changePasswordModalVisible = ref(false);
const confirmLoading = ref(false);
const passwordFormRef = ref();

// Form data
const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// Validation rules
const passwordRules = {
  currentPassword: [{ required: true, message: "Bạn phải nhập mật khẩu hiện tại" }],
  newPassword: [
    { required: true, message: "Bạn phải nhập mật khẩu mới" },
    { min: 6, message: "Mật khẩu có ít nhất 6 kí tự " },
  ],
  confirmPassword: [
    { required: true, message: "Bạn cần xác nhận lại mật khẩu mới" },
    ({ getFieldValue }) => ({
      validator(_, value) {
        if (!value || getFieldValue("newPassword") === value) {
          return Promise.resolve();
        }
        return Promise.reject("Hai mật khẩu không khớp nhau!");
      },
    }),
  ],
};

const showChangePasswordModal = () => {
  changePasswordModalVisible.value = true;
};

const handleChangePassword = async () => {
  try {
    await passwordFormRef.value.validate();
    confirmLoading.value = true;
    const { data, status } = await RestApi.user.change_pasword({
      body: JSON.stringify({
        confirmNewPassword: passwordForm.value.confirmPassword,
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword,
      }),
    });
    if (status.value === "success") {
      message.success("Thay đổi mật khẩu thành công");
      await userStore.logout();
      await navigateTo("/auth/login");
    } else {
      message.error("Thay đổi mật khẩu không thành công");
    }
  } catch (error) {
    message.error(error.response?.data?.message || "Thay đổi mật khẩu thất bại");
  } finally {
    resetForm();
    confirmLoading.value = false;
  }
};

const handleCancel = () => {
  resetForm();
  changePasswordModalVisible.value = false;
};

const resetForm = () => {
  passwordForm.value = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
};

const signOut = async () => {
  try {
    await userStore.logout();
    await navigateTo("/auth/login");
  } catch (error) {
    message.error("Logout failed");
  }
};
</script>

<style scoped>
/* Smooth transitions for all interactive elements */
.ant-dropdown-link,
.ant-avatar,
img {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Custom scrollbar for dropdown */
.ant-dropdown-menu {
  scrollbar-width: thin;
  scrollbar-color: #3b82f6 #1f2937;
}

.ant-dropdown-menu::-webkit-scrollbar {
  width: 6px;
}

.ant-dropdown-menu::-webkit-scrollbar-track {
  background: #1f2937;
}

.ant-dropdown-menu::-webkit-scrollbar-thumb {
  background-color: #3b82f6;
  border-radius: 3px;
}
</style>