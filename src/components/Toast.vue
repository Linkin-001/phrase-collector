<template>
  <div class="toast-container position-fixed bottom-0 end-0 p-3">
    <div 
      class="toast show" 
      role="alert" 
      aria-live="assertive" 
      aria-atomic="true"
    >
      <div class="toast-header" :class="headerClass">
        <i :class="iconClass" class="me-2"></i>
        <strong class="me-auto">{{ title }}</strong>
        <small class="text-muted">刚刚</small>
        <button 
          type="button" 
          class="btn-close" 
          @click="$emit('close')"
          aria-label="Close"
        ></button>
      </div>
      <div class="toast-body">
        {{ message }}
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
    const title = computed(() => {
      switch (props.type) {
        case 'success':
          return '成功'
        case 'error':
          return '错误'
        case 'warning':
          return '警告'
        case 'info':
        default:
          return '提示'
      }
    })
    
    const headerClass = computed(() => {
      switch (props.type) {
        case 'success':
          return 'bg-success text-white'
        case 'error':
          return 'bg-danger text-white'
        case 'warning':
          return 'bg-warning text-dark'
        case 'info':
        default:
          return 'bg-primary text-white'
      }
    })
    
    const iconClass = computed(() => {
      switch (props.type) {
        case 'success':
          return 'bi bi-check-circle-fill text-white'
        case 'error':
          return 'bi bi-exclamation-triangle-fill text-white'
        case 'warning':
          return 'bi bi-exclamation-triangle-fill text-dark'
        case 'info':
        default:
          return 'bi bi-info-circle-fill text-white'
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
      title,
      headerClass,
      iconClass
    }
  }
}
</script>

<style scoped>
.toast {
  animation: slideInRight 0.3s ease-out;
  min-width: 300px;
  max-width: 400px;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-header.bg-success .btn-close,
.toast-header.bg-danger .btn-close,
.toast-header.bg-primary .btn-close {
  filter: invert(1) grayscale(100%) brightness(200%);
}

.toast-header.bg-warning .btn-close {
  filter: none;
}
</style>