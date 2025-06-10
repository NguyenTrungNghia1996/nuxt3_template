<template>
  <div class="p-2">
    <a-breadcrumb class="flex h-full items-center px-4">
      <a-breadcrumb-item v-for="(item, index) in breadcrumbItems" :key="index" class="flex h-full items-center">
        <span v-if="index < breadcrumbItems.length - 1 && item.path" class="flex items-center text-gray-500 hover:text-primary transition-colors duration-200 hover:text-gray-800" @click="() => navigateTo(item.path)">
          <Icon v-if="item.icon" :name="item.icon" class="mr-2 text-base" />
          <span>{{ item.title }}</span>
        </span>
        <span v-else class="flex items-center text-gray-500 font-medium hover:text-gray-800">
          <Icon v-if="item.icon" :name="item.icon" class="mr-2 text-base" />
          <span>{{ item.title }}</span>
        </span>
      </a-breadcrumb-item>
    </a-breadcrumb>
  </div>
</template>

<script setup>
const route = useRoute();
const settingStore = useSettingStore();
const breadcrumbItems = ref([]);

// Lấy menu data từ store
const menuData = computed(() => settingStore.menuItems);

// Hàm tìm kiếm menu item theo path
const findMenuItemByPath = (items, path) => {
  for (const item of items) {
    if (item.url === path) {
      return [item];
    }

    // Kiểm tra dynamic routes (ví dụ: /products/:id)
    if (item.url && item.url.includes(":")) {
      const basePath = item.url.split(":")[0];
      if (path.startsWith(basePath)) {
        return [item];
      }
    }

    if (item.children) {
      const found = findMenuItemByPath(item.children, path);
      if (found.length > 0) {
        return [item, ...found];
      }
    }
  }
  return [];
};

// Hàm cập nhật breadcrumb
const updateBreadcrumb = () => {
  const matchedItems = findMenuItemByPath(menuData.value, route.path);

  breadcrumbItems.value = matchedItems.map(item => ({
    title: item.title,
    icon: item.icon,
    path: item.url,
  }));

  // Thêm trang chủ nếu không phải là trang chủ
  if (breadcrumbItems.value.length === 0 || breadcrumbItems.value[0].path !== "/") {
    breadcrumbItems.value.unshift({
      title: "Trang chủ",
      icon: "ant-design:home-outlined",
      path: "/dashboard",
    });
  }

  // Thêm title từ route meta nếu có
  if (route.meta?.breadcrumb) {
    breadcrumbItems.value.push({
      title: route.meta.breadcrumb,
      path: route.path,
    });
  }
  useHead({
    title: computed(() => breadcrumbItems.value[breadcrumbItems.value.length - 1].title || "Nguyên Anh EST"),
  });
};

// Theo dõi thay đổi route
watch(() => route.path, updateBreadcrumb, { immediate: true });

// Theo dõi thay đổi menu data (nếu cần)
watch(() => settingStore.menu, updateBreadcrumb);
</script>

<style>
/* Custom separator style to match Tailwind design */
.ant-breadcrumb-separator {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  color: #9ca3af; /* Tailwind's text-gray-400 */
}
</style>
