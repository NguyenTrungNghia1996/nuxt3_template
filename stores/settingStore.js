import { defineStore } from "pinia";
export const useSettingStore = defineStore(
  "setting",
  {
    state: () => ({
      loading: {
        title: "Đang xử lý",
        description: "Vui lòng chờ trong giây lát...",
        isActive: false,
        showLogo: true,
        transparent: false,
      },
      menu: [],
      permissions: [],
      current_permission: 0,
    }),
    actions: {
      setLoading(value) {
        this.loading.isActive = value;
      },
      setDetailLoading(value) {
        this.loading = value;
      },
      setMenu(value) {
        this.menu = value;
      },
      setPermissions(value) {
        this.permissions = value;
      },
      setCurrentPermission(value) {
        this.current_permission = value;
      },
    },
    getters: {
      menuItems: state => state.menu,
      menuPermissions: state => state.permissions,
      isLoading: state => state.loading.isActive,
      currentPermission: state => {
        const PERMISSION_STATE = { NO_ACCESS: 0, VIEW: 1, EDIT: 2 };
        return state.current_permission === PERMISSION_STATE.EDIT
      },
    },
    // persist: {
    //   // storage: piniaPluginPersistedstate.localStorage(),
    //   storage: piniaPluginPersistedstate.cookies(),
    // },
  },
  // {
  //   persist: true,
  // },
);
