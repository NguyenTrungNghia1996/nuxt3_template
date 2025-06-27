let ENDPOINTS = {
  LOGIN: "/login",
  S3: "/api/presigned_url",
  USER_PASSWORD: "/api/users/password",
  MENU: "/api/menus",
  ROLE_GROUP: "/api/role-groups",
  ROLE_GROUP_DETAIL: "/api/role-groups/detail",
  USER_PERMISSION: "/api/permissions",
};
import { useUserStore } from "~~/stores/userStore";
class Request {
  constructor() {
    this.handler = {
      onRequest({ request, options }) {},
      onRequestError({ request, options, error }) {},
      onResponse({ request, response, options }) {
        return response._data;
      },
      async onResponseError({ request, response, options }) {
        if (response.status == 401) {
          message.info("Phiên Đăng Nhập Kết Thúc Vui Lòng Đăng Nhập Lại! ");
          const userStore = useUserStore();
          userStore.logout();
          return await navigateTo("/auth/login");
        }

        return response._data;
      },
    };
    this.base_url = useRuntimeConfig().public.baseURL;
  }

  createHeaders() {
    const userStore = useUserStore();
    return {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${userStore.token}`,
    };
  }

  get(url, options) {
    return useFetch(url, {
      baseURL: this.base_url,
      method: "GET",
      headers: this.createHeaders(),
      ...options,
      ...this.handler,
    });
  }
  post(url, options) {
    return useFetch(url, {
      baseURL: this.base_url,
      method: "POST",
      headers: this.createHeaders(),
      ...options,
      ...this.handler,
    });
  }
  patch(url, options) {
    return useFetch(url, {
      baseURL: this.base_url,
      method: "PATCH",
      headers: this.createHeaders(),
      ...options,
      ...this.handler,
    });
  }
  put(url, options) {
    return useFetch(url, {
      baseURL: this.base_url,
      method: "PUT",
      headers: this.createHeaders(),
      ...options,
      ...this.handler,
    });
  }
  delete(url, options) {
    return useFetch(url, {
      baseURL: this.base_url,
      method: "DELETE",
      headers: this.createHeaders(),
      ...options,
      ...this.handler,
    });
  }
}
class RestApi {
  constructor() {
    this.request = new Request();
    this.user = new User(this.request);
    this.menu = new Menu(this.request);
    this.roles = new RoleGroup(this.request);
  }
  async get_url_upload(acl, content_encoding, content_type, key, platform) {
    let data = { acl, content_encoding, content_type, key, platform };
    return this.request.put(ENDPOINTS.S3, { body: data });
  }
  async upload_s3(
    key,
    data,
    { acl, encoding, content_type, bucket } = {
      acl: "public-read",
      encoding: "base64",
      content_type: "image/jpeg",
      bucket: "website",
    },
  ) {
    const { data: resp } = await this.get_url_upload(acl, encoding, content_type, key, bucket);
    const url = resp.value?.data.upload_url;
    const direct_url = resp.value?.data.direct_url;
    if (!url || !direct_url) throw Error("presigned error");
    let buf;
    switch (encoding) {
      case "base64":
        // buf = Buffer.from(data.replace(/^data:image\/\w+;base64,/, ""), "base64")
        buf = _base64ToArrayBuffer(data.replace(/^data:image\/\w+;base64,/, ""));
        break;
      case "blob":
        buf = data;
        break;
      default:
        throw new Error("Invalid encoding");
    }
    await useFetch(url, {
      method: "PUT",
      headers: {
        Authorization: "",
        "x-amz-acl": acl || "public-read",
        "Content-Encoding": encoding,
        "Content-Type": content_type,
        "Access-Control-Allow-Origin": "*",
      },
      body: buf,
    });
    return direct_url;
  }
}
class Menu {
  constructor(request) {
    this.request = request;
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.MENU, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.MENU, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.MENU, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.MENU, data);
  }
}
class RoleGroup {
  constructor(request) {
    this.request = request;
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.ROLE_GROUP, data);
  }
  async detail(data) {
    return await this.request.get(ENDPOINTS.ROLE_GROUP_DETAIL, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.ROLE_GROUP, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.ROLE_GROUP, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.ROLE_GROUP, data);
  }
}
class User {
  constructor() {
    this.request = new Request();
  }
  async login(data) {
    return await this.request.post(ENDPOINTS.LOGIN, data);
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.USER, data);
  }
  async detail(data) {
    return await this.request.get(ENDPOINTS.USER_DETAIL, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.USER, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.USER, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.USER, data);
  }
  async change_pasword(data) {
    return await this.request.put(ENDPOINTS.USER_PASSWORD, data);
  }
  async permission(data) {
    return await this.request.get(ENDPOINTS.USER_PERMISSION, data);
  }
}

export default () => {
  return { RestApi: new RestApi() };
};
