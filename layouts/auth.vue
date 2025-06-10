<template>
  <div class="bg-[url('/background.svg')] bg-center bg-cover bg-no-repeat min-h-screen w-full relative min-w-[350px]">
    <div class="px-0 pb-6 pt-8">
      <slot />
      <div class="mx-0 mb-6 mt-12 py-0 px-4 bottom-0 text-center w-full absolute">
        <div class="text-sm text-black">Copyright &copy; 2025 Produced by Trung Nghĩa</div>
      </div>
    </div>
  </div>
</template>
