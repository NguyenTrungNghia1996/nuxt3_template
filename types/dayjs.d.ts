// types/dayjs.d.ts
export {};

declare module "#app" {
  interface NuxtApp {
    $dayjs: typeof import("dayjs");
  }
}

declare module "vue" {
  interface ComponentCustomProperties {
    $dayjs: typeof import("dayjs");
  }
}
