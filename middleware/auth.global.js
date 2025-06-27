import { useUserStore } from "~~/stores/userStore";
import { useSettingStore } from "~~/stores/settingStore";
import { useJwt } from "@vueuse/integrations/useJwt";
import { useMenu } from "~~/composables/useMenu";
export default defineNuxtRouteMiddleware(async to => {
  // Bỏ qua middleware nếu đang ở trang login
  // if (to.path === "/login" || to.path.startsWith("/test/")) return;
  if (to.path === "/login") return;
  const userStore = useUserStore();
  const settingStore = useSettingStore();
  const { loadMenu } = useMenu();
  const { loadPermissions, setPermissions } = usePermissions();
  const token = userStore.token;
  if (!token) return navigateTo("/login");
  try {
    const { payload } = useJwt(token);
    const isTokenValid = payload.value?.exp && Date.now() / 1000 < payload.value.exp;
    if (!isTokenValid) {
      userStore.logout();
      return navigateTo("/login");
    }
    if (settingStore.menu.length === 0) {
      await loadMenu();
    }
    if (settingStore.menuPermissions.length === 0) {
      await loadPermissions()
      // setPermissions()
    }
  } catch (error) {
    console.error("JWT validation error:", error);
    userStore.logout();
    return navigateTo("/login");
  }
});
