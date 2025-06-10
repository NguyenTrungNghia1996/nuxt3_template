<template>
  <div class="grid grid-cols-2 gap-2">
    <a-button type="primary" class="font-roboto w-full md:w-auto" @click="() => { navigateTo('/demo/caphoc') }">
      Demo: SelectSchoolLevel (Cấp Học)
    </a-button>
    <a-button type="primary" class="font-roboto w-full md:w-auto" @click="() => { navigateTo('/demo/cahoc') }">
      Demo: SelectSchoolShift (Ca Học)
    </a-button>
    <a-button type="primary" class="font-roboto w-full md:w-auto" @click="() => { navigateTo('/demo/diemtruong') }">
      Demo: SelectSchoolSite (Điểm trường)
    </a-button>
    <a-button type="primary" class="font-roboto w-full md:w-auto" @click="() => { navigateTo('/demo/loaiphonghoc') }">
      Demo: SelectClassroomType (Loại phòng học)
    </a-button>
    <a-button type="primary" class="font-roboto w-full md:w-auto" @click="() => { navigateTo('/demo/donvi') }">
      Demo: SelectUnit (Đơn vị)
    </a-button>
    <a-button type="primary" class="font-roboto w-full md:w-auto" @click="() => { navigateTo('/demo/nguoidung') }">
      Demo: SelectUser (Người dùng)
    </a-button>
    <a-button type="primary" class="font-roboto w-full md:w-auto" @click="() => { navigateTo('/demo/khoikienthuc') }">
      Demo: SelectKnowledge (Khối kiến thức)
    </a-button>
    <a-button type="primary" class="font-roboto w-full md:w-auto" @click="() => { navigateTo('/demo/tochuyenmon') }">
      Demo: SelectExpertise (Tổ chuyên môn)
    </a-button>
    <a-button type="primary" class="font-roboto w-full md:w-auto" @click="() => { navigateTo('/demo/khoilop') }">
      Demo: SelectGradeLevel (Khối lớp)
    </a-button>
  </div>
</template>
