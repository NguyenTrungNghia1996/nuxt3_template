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
      menu: [
        {
          title: "Dashboard",
          key: "dashboard",
          url: "/dashboard",
          bitIndex: 0,
          icon: "ant-design:project-outlined",
          children: [],
        },
        {
          title: "Menu",
          key: "menu",
          url: "/menu",
          bitIndex: 2,
          icon: "ant-design:unordered-list-outlined",
          children: [],
        },
        // {
        //   title: "Quản Lý Danh Mục",
        //   key: "category_management",
        //   url: null,
        //   bitIndex: 2,
        //   icon: "ant-design:database-twotone",
        //   children: [
        //     {
        //       title: "Cấp Học",
        //       key: "school_level",
        //       bitIndex: 0,
        //       url: "/category_management/school_level",
        //       icon: "ant-design:unordered-list-outlined",
        //     },
        //   ],
        // },

      ],
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
    },
    getters: {
      menuItems: state => state.menu,
      isLoading: state => state.loading.isActive,
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
