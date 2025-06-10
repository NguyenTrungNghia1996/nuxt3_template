// plugins/dayjs.ts
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/vi";

// Kích hoạt plugin
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

// Thiết lập ngôn ngữ mặc định là tiếng Việt
dayjs.locale("vi");

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.provide("dayjs", dayjs);
});
