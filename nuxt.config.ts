// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  app: {
    head: {
      titleTemplate: "%s - VnTimeTable",
      title: "Nguyên Anh EST",
      link: [
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
        },
        { rel: "icon", type: "image/x-icon", href: "/logo.png" },
      ],
    },
  },
  antd: { extractStyle: true },
  css: ["~/assets/css/tailwind.css"],
  modules: ["@nuxt/icon", "@nuxt/image", "@nuxtjs/tailwindcss", "@ant-design-vue/nuxt", "@pinia/nuxt", "pinia-plugin-persistedstate/nuxt", "@vueuse/nuxt"],
  runtimeConfig: {
    encryptionKey: process.env.NUXT_ENCRYPTION_KEY || "default-strong-key-32-chars-123456",
    public: {
      baseURL: process.env.NUXT_PUBLIC_BASE_URL || "http://localhost:4000",
    },
  },
});
