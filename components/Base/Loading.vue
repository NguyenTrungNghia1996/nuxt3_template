<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="loading" class="fixed inset-0 w-full h-screen z-[9999] flex flex-col items-center justify-center" :class="backgroundClass">
        <!-- Logo đặt riêng ở phần trên -->
        <div v-if="showLogo" class="logo-container mb-8">
          <img src="/logo.png" :class="['mx-auto', logoClass]" alt="Logo" />
        </div>

        <div class="loading-content text-center mx-4 max-w-xs sm:max-w-sm">
          <!-- Spinner chuyên nghiệp -->
          <div class="spinner-container mx-auto mb-6">
            <a-spin size="large" />
            <!-- <div class="spinner-circle"></div>
            <div class="spinner-arc"></div> -->
          </div>

          <!-- Nội dung loading -->
          <div class="loading-text">
            <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-1">
              {{ title || "Đang xử lý" }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ description || "Vui lòng chờ trong giây lát..." }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  loading: Boolean,
  title: String,
  description: String,
  showLogo: {
    type: Boolean,
    default: true,
  },
  logoClass: {
    type: String,
    default: "w-16 h-16", // Kích thước mặc định
  },
  transparent: {
    type: Boolean,
    default: false,
  },
});

const backgroundClass = computed(() => ({
  "bg-[#0F172A]/70 backdrop-blur-sm": !props.transparent,
  "bg-transparent": props.transparent,
}));
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.spinner-container {
  position: relative;
  width: 3.5rem;
  height: 3.5rem;
}

.spinner-circle {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
}

.spinner-arc {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top-color: var(--ant-primary-color);
  border-radius: 50%;
  animation: spin 0.8s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Dark mode support */
.dark .spinner-circle {
  border-color: rgba(255, 255, 255, 0.1);
}

/* Logo container */
.logo-container {
  max-width: 120px;
  max-height: 120px;
}
</style>
