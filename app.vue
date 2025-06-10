<template>
  <a-extract-style>
    <a-config-provider :locale="locale" :theme="theme">
      <BaseLoading :loading="loading" title="Đang tải dữ liệu" description="Dữ liệu đang được xử lý..." :transparent="false" :show-logo="true" logo-class="w-20 h-20" />
      <BaseLoading :loading="settingStore.isLoading" :title="settingStore.loading.title" :description="settingStore.loading.description" :transparent="settingStore.loading.transparent" :show-logo="settingStore.loading.showLogo" logo-class="w-20 h-20" />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </a-config-provider>
  </a-extract-style>
</template>
<script setup>
const settingStore = useSettingStore();
import vi_VN from "ant-design-vue/es/locale/vi_VN";
const locale = computed(() => {
  return vi_VN;
});
const nuxtApp = useNuxtApp();
const loading = ref(true);
nuxtApp.hook("page:start", () => {
  loading.value = true;
});
nuxtApp.hook("page:finish", () => {
  loading.value = false;
});
const theme = ref({
  token: {
    colorPrimary: "#0057A0", // Màu xanh dương đậm trong logo – làm màu chủ đạo
    colorSuccess: "#7AC943", // Màu xanh lá logo – dùng cho thành công (Success)
    colorWarning: "#F59E0B", // Vàng cam nhẹ – cảnh báo nhưng vẫn hài hòa với logo
    colorError: "#DC2626", // Đỏ đậm hiện đại – phù hợp cho trạng thái lỗi
    colorInfo: "#0284C7",
  },
});
</script>
