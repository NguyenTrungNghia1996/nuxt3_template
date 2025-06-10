<template>
  <div class="w-full h-screen flex flex-col bg-gray-200 overflow-auto">
    <div class="h-15">
      <BaseHeader />
    </div>
    <div class="w-full flex-1 flex overflow-hidden min-h-[calc(100vh-60px)]">
      <BaseMenu />
      <div class="flex-1 flex flex-col overflow-hidden">
        <div class="sticky top-0 z-10 bg-white">
          <BaseBreadcrumb />
        </div>
        <div class="p-2 flex-1 overflow-y-auto">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
