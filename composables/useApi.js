let ENDPOINTS = {
  LOGIN: "/login",
  S3: "/api/presigned_url",
};
import { useUserStore } from "~~/stores/userStore";
class Request {
  constructor() {
    this.handler = {
      onRequest({ request, options }) { },
      onRequestError({ request, options, error }) { },
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
    const userStore = useUserStore();
    this.TOKEN = `Bearer ${userStore.token}`;
    this.base_url = useRuntimeConfig().public.baseURL;
  }

  get(url, options) {
    return useFetch(url, {
      baseURL: this.base_url,
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: this.TOKEN,
      },
      ...options,
      ...this.handler,
    });
  }
  post(url, options) {
    return useFetch(url, {
      baseURL: this.base_url,
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: this.TOKEN,
      },
      ...options,
      ...this.handler,
    });
  }
  patch(url, options) {
    return useFetch(url, {
      baseURL: this.base_url,
      method: "PATCH",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: this.TOKEN,
      },
      ...options,
      ...this.handler,
    });
  }
  put(url, options) {
    return useFetch(url, {
      baseURL: this.base_url,
      method: "PUT",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: this.TOKEN,
      },
      ...options,
      ...this.handler,
    });
  }
  delete(url, options) {
    return useFetch(url, {
      baseURL: this.base_url,
      method: "DELETE",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: this.TOKEN,
      },
      ...options,
      ...this.handler,
    });
  }
}
class RestApi {
  constructor() {
    this.request = new Request();
    this.user = new User(this.request);
    this.school_level = new SchoolLevel(this.request);
    this.school_shift = new SchoolShift(this.request);
    this.unit = new Unit(this.request);
    this.school_site = new SchoolSite(this.request);
    this.classroom_type = new ClassroomType(this.request);
    this.menu = new Menu(this.request);
    this.knowledge = new Knowledge(this.request);
    this.expertise = new Expertise(this.request);
    this.grade_level = new GradeLevel(this.request);
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
}
class SchoolLevel {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.SCHOOL_LEVEL, data);
  }
  async detail(data) {
    return await this.request.get(ENDPOINTS.SCHOOL_LEVEL_DETAIL, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.SCHOOL_LEVEL, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.SCHOOL_LEVEL, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.SCHOOL_LEVEL, data);
  }
}
class SchoolShift {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.SCHOOL_SHIFT, data);
  }
  async detail(data) {
    return await this.request.get(ENDPOINTS.SCHOOL_SHIFT_DETAIL, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.SCHOOL_SHIFT, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.SCHOOL_SHIFT, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.SCHOOL_SHIFT, data);
  }
}
class Unit {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.UNIT, data);
  }
  async detail(data) {
    return await this.request.get(ENDPOINTS.UNIT_DETAIL, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.UNIT, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.UNIT, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.UNIT, data);
  }
}
class SchoolSite {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.SCHOOL_SITE, data);
  }
  async detail(data) {
    return await this.request.get(ENDPOINTS.SCHOOL_SITE_DETAIL, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.SCHOOL_SITE, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.SCHOOL_SITE, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.SCHOOL_SITE, data);
  }
}
class ClassroomType {
 constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.CLASSROOM_TYPE, data);
  }
  async detail(data) {
    return await this.request.get(ENDPOINTS.CLASSROOM_TYPE_DETAIL, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.CLASSROOM_TYPE, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.CLASSROOM_TYPE, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.CLASSROOM_TYPE, data);
  }
}
class Menu {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.MENU, data);
  }
  async detail(data) {
    return await this.request.get(ENDPOINTS.MENU_DETAIL, data);
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
class Knowledge{
   constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.KNOWLEDGE, data);
  }
  // async detail(data) {
  //   return await this.request.get(ENDPOINTS.MENU_DETAIL, data);
  // }
  async create(data) {
    return await this.request.post(ENDPOINTS.KNOWLEDGE, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.KNOWLEDGE, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.KNOWLEDGE, data);
  }
}
class Expertise{
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.EXPERTISE, data);
  }
  // async detail(data) {
  //   return await this.request.get(ENDPOINTS.MENU_DETAIL, data);
  // }
  async create(data) {
    return await this.request.post(ENDPOINTS.EXPERTISE, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.EXPERTISE, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.EXPERTISE, data);
  }
}

class GradeLevel {
constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.GRADE_LEVEL, data);
  }
  async detail(data) {
    return await this.request.get(ENDPOINTS.GRADE_LEVEL_DETAIL, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.GRADE_LEVEL, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.GRADE_LEVEL, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.GRADE_LEVEL, data);
  }
}
export default () => {
  return { RestApi: new RestApi() };
};
