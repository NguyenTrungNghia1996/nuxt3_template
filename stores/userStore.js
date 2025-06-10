import { defineStore } from "pinia";
export const useUserStore = defineStore(
  "user",
  {
    state: () => ({
      user: {},
    }),
    actions: {
      setUser(value) {
        this.user = value;
      },
      logout() {
        this.user = {};
      },
    },
    getters: {
      token: state => {
        return state.user?.token || null;
      },
      name: state => {
        return state.user?.item?.hoten || null;
      },
      role: state => {
        return state.user?.item?.username || null;
      },
    },
    persist: {
      // storage: piniaPluginPersistedstate.localStorage(),
      storage: piniaPluginPersistedstate.cookies(),
    },
  },
  {
    persist: true,
  },
);
