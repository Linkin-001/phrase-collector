<template>
  <div class="toast-container position-fixed bottom-0 end-0 p-3">
    <div 
      class="toast show" 
      role="alert" 
      aria-live="assertive" 
      aria-atomic="true"
      :class="toastClass"
    >
      <div class="toast-content">
        <i :class="iconClass" class="toast-icon"></i>
        <div class="toast-message">{{ message }}</div>
        <button 
          type="button" 
          class="toast-close" 
          @click="$emit('close')"
          aria-label="Close"
        >
          <i class="bi bi-x"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'

export default {
  name: 'Toast',
  props: {
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
    },
    duration: {
      type: Number,
      default: 3000
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const toastClass = computed(() => {
      switch (props.type) {
        case 'success':
          return 'toast-success'
        case 'error':
          return 'toast-error'
        case 'warning':
          return 'toast-warning'
        case 'info':
        default:
          return 'toast-info'
      }
    })
    
    const iconClass = computed(() => {
      switch (props.type) {
        case 'success':
          return 'bi bi-check-circle-fill'
        case 'error':
          return 'bi bi-x-circle-fill'
        case 'warning':
          return 'bi bi-exclamation-triangle-fill'
        case 'info':
        default:
          return 'bi bi-info-circle-fill'
      }
    })
    
    onMounted(() => {
      if (props.duration > 0) {
        setTimeout(() => {
          emit('close')
        }, props.duration)
      }
    })
    
    return {
      toastClass,
      iconClass
    }
  }
}
</script>

<style scoped>
.toast {
  animation: slideInRight 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  min-width: 300px;
  max-width: 380px;
  border: none;
  border-radius: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.toast-content {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  gap: 12px;
  position: relative;
}

.toast-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  color: #2c3e50;
}

.toast-close {
  background: none;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
  transition: all 0.2s ease;
  flex-shrink: 0;
  color: #6b7280;
}

.toast-close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
}

.toast-close i {
  font-size: 16px;
}

/* 成功样式 */
.toast-success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
  border-left: 4px solid #10b981;
}

.toast-success .toast-icon {
  color: #10b981;
}

/* 错误样式 */
.toast-error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05));
  border-left: 4px solid #ef4444;
}

.toast-error .toast-icon {
  color: #ef4444;
}

/* 警告样式 */
.toast-warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05));
  border-left: 4px solid #f59e0b;
}

.toast-warning .toast-icon {
  color: #f59e0b;
}

/* 信息样式 */
.toast-info {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05));
  border-left: 4px solid #3b82f6;
}

.toast-info .toast-icon {
  color: #3b82f6;
}

/* 进入动画 */
@keyframes slideInRight {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 悬浮效果 */
.toast:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}
</style>