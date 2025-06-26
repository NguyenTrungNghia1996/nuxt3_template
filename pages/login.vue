<template>
  <div class="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo công ty -->
      <div class="flex justify-center">
        <img src="/logo.png" alt="Logo công ty" class="h-30 w-auto" />
      </div>
      <a-card class="shadow-xl">
        <h2 class="text-center text-2xl font-bold text-gray-800 mb-6">Đăng nhập hệ thống</h2>
        <a-form :model="form" layout="vertical" @finish="handleLogin" autocomplete="off">
          <a-form-item label="Tài khoản" name="username" :rules="[{ required: true, message: 'Vui lòng nhập nhập tài khoản!' }]">
            <a-input v-model:value="form.username" placeholder="Nhập tài khoản của bạn" size="large">
              <template #prefix>
                <UserOutlined class="text-gray-400" />
              </template>
            </a-input>
          </a-form-item>
          <a-form-item label="Mật khẩu" name="password" :rules="[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]">
            <a-input-password v-model:value="form.password" placeholder="Nhập mật khẩu" size="large">
              <template #prefix>
                <LockOutlined class="text-gray-400" />
              </template>
            </a-input-password>
          </a-form-item>
          <div class="flex justify-between mb-4">
            <a-checkbox v-model:checked="rememberMe"> Ghi nhớ đăng nhập </a-checkbox>
            <!-- <a-typography-link> Quên mật khẩu? </a-typography-link> -->
          </div>
          <a-form-item>
            <a-button type="primary" html-type="submit" size="large" block :loading="loading"> Đăng nhập </a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
  </div>
</template>

<script setup>
const settingStore = useSettingStore();
definePageMeta({ layout: "auth" });
const { RestApi } = useApi();
const userStore = useUserStore();
const { loadMenu } = useMenu();
const { loadPermissions } = usePermissions();

const { rememberMe, saveCredentials, getCredentials, clearCredentials } = useAuth();
const savedCredentials = getCredentials();
const form = reactive({
  username: savedCredentials?.username || "",
  password: savedCredentials?.password || "",
});

// const rememberMe = ref(false);
const loading = ref(false);

const handleLogin = async () => {
  // loading.value = true;
  settingStore.setLoading(true);
  try {
    const { data, status, error } = await RestApi.user.login({ body: JSON.stringify(form) });
    if (status.value == "success") {
      if (rememberMe.value) {
        saveCredentials(form.username, form.password);
      }
      await userStore.setUser(data.value.data);
      // settingStore.setPermissions(DEFAULT_PERMISSIONS);
      await loadMenu();
      await loadPermissions();
      // setPermissions()
      message.success("Đăng nhập thành công!");
      navigateTo("/dashboard");
    } else {
      console.error("error:", error);
      message.error("Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin");
    }
  } catch (error) {
    console.error("Login failed:", error);
    message.error("Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin");
  } finally {
    settingStore.setLoading(false);
    // loading.value = false;
  }
};

watch(rememberMe, async () => {
  if (!rememberMe.value) {
    form.username = "";
    form.password = "";
    clearCredentials();
  }
});
</script>
