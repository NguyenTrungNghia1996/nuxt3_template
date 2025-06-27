<template>
  <div class="h-full flex flex-col">
    <ClientOnly>
      <a-layout class="flex-1 overflow-y-auto">
        <a-layout-sider theme="light" width="250px" v-model:collapsed="collapsed" :collapsible="true" collapsed-width="50">
          <div class="p-2">
            <template v-if="!collapsed">
              <a-input v-model:value="searchQuery" placeholder="Tìm kiếm menu..." allow-clear @focus="expandSidebar" />
            </template>
            <template v-else>
              <div class="w-full flex justify-center cursor-pointer" @click="expandSidebar">
                <Icon name="ant-design:search-outlined" class="text-lg" />
              </div>
            </template>
          </div>
          <a-menu theme="light" :open-keys="menuState.openKeys" v-model:selectedKeys="selectedMenuKeys" mode="inline" @openChange="onMenuOpenChange">
            <template v-for="menuItem in filteredMenuList" :key="menuItem.key">
              <a-sub-menu v-if="menuItem.children?.length" :key="menuItem.key">
                <template #icon>
                  <Icon :name="menuItem.icon || 'ant-design:folder-outlined'" class="text-xl" />
                </template>
                <template #title>
                  <p class="font-roboto">{{ menuItem.title }}</p>
                </template>
                <a-menu-item v-for="subItem in menuItem.children" :key="subItem.url">
                  <p @click="navigateToPage(subItem.url)" class="font-roboto">
                    {{ subItem.title }}
                  </p>
                </a-menu-item>
              </a-sub-menu>
              <a-menu-item v-else-if="menuItem.url" :key="menuItem.url" @click="navigateToPage(menuItem.url)">
                <template #icon>
                  <Icon :name="menuItem.icon || 'ant-design:file-outlined'" class="text-xl" />
                </template>
                <p class="font-roboto">{{ menuItem.title }}</p>
              </a-menu-item>
            </template>
          </a-menu>
        </a-layout-sider>
      </a-layout>
    </ClientOnly>
  </div>
</template>

<script setup>
const settingStore = useSettingStore();
import { useMenu } from "~/composables/useMenu";
import { useRouter } from "vue-router";
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";

const router = useRouter();

const collapsed = ref(false);
const selectedMenuKeys = ref([]);
const menuState = reactive({ openKeys: [] });
const searchQuery = ref("");

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMediumAndUp = breakpoints.greaterOrEqual("md");
const isLargeAndUp = breakpoints.greaterOrEqual("lg");

// Auto collapse/expand based on screen size
watch(isMediumAndUp, () => {
  if (!isMediumAndUp.value && !collapsed.value) collapsed.value = true;
});
watch(isLargeAndUp, () => {
  if (isLargeAndUp.value && collapsed.value) collapsed.value = false;
});
const { visibleMenu } = useMenu();
const formattedMenu = computed(() => {
  return visibleMenu.value;
});
// Filter menu based on search query
const filteredMenuList = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase();
  if (!keyword) return formattedMenu.value;

  return formattedMenu.value
    .map(menu => {
      const matchingChildren = menu.children?.filter(child => child.title.toLowerCase().includes(keyword));

      if (menu.title.toLowerCase().includes(keyword)) {
        return menu;
      } else if (matchingChildren?.length) {
        return {
          ...menu,
          children: matchingChildren,
        };
      }
      return null;
    })
    .filter(Boolean);
});

// Navigation function
const navigateToPage = async url => {
  if (url) {
    await router.push(url);
  }
};

// Handle sub-menu open/close
const onMenuOpenChange = openKeys => {
  menuState.openKeys = openKeys.length ? [openKeys.at(-1)] : [];
};

// Update selected menu when route changes
watch(
  () => router.currentRoute.value.fullPath,
  newPath => {
    selectedMenuKeys.value = [newPath];
  },
  { immediate: true },
);

// Expand sidebar when search is clicked
const expandSidebar = () => {
  collapsed.value = false;
};

// Initialize menu state on mount
onMounted(() => {
  selectedMenuKeys.value = [router.currentRoute.value.fullPath];
  const currentPath = router.currentRoute.value.fullPath;

  // Find parent menu containing current route
  const parentItem = formattedMenu.value.find(menu => menu.children?.some(child => child.url === currentPath));

  if (parentItem) {
    menuState.openKeys = [parentItem.key];
  }
});
</script>
