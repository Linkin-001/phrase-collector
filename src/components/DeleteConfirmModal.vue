<template>
  <div class="modal fade show d-block delete-confirm-modal" tabindex="-1" style="background-color: rgba(0,0,0,0.6); backdrop-filter: blur(8px);">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <!-- 圆形装饰背景 -->
        <div class="modal-decoration">
          <div class="decoration-circle circle-1"></div>
          <div class="decoration-circle circle-2"></div>
          <div class="decoration-circle circle-3"></div>
        </div>
        
        <div class="modal-header border-0 pb-2">
          <div class="d-flex align-items-center">
            <div class="icon-wrapper me-3">
              <i class="bi bi-exclamation-triangle-fill text-danger"></i>
            </div>
            <div>
              <h5 class="modal-title mb-0">删除确认</h5>
              <p class="text-muted small mb-0">此操作无法撤销</p>
            </div>
          </div>
        </div>
        
        <div class="modal-body pt-2">
          <p class="text-muted mb-4">确定要删除这个短语吗？删除后将无法恢复。</p>
          
          <div class="delete-options">
            <button 
              type="button" 
              class="btn btn-option btn-outline-danger w-100 mb-3"
              @click="handleChoice('confirm')"
            >
              <div class="d-flex align-items-center">
                <i class="bi bi-trash3 me-3"></i>
                <div class="text-start">
                  <div class="fw-semibold">确认删除</div>
                  <small class="">永久删除此短语</small>
                </div>
              </div>
            </button>
            
            <button 
              type="button" 
              class="btn btn-option btn-outline-secondary w-100"
              @click="handleChoice('cancel')"
            >
              <div class="d-flex align-items-center">
                <i class="bi bi-x-circle me-3"></i>
                <div class="text-start">
                  <div class="fw-semibold">取消</div>
                  <small class="">保留此短语</small>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeleteConfirmModal',
  emits: ['choice'],
  setup(props, { emit }) {
    const handleChoice = (choice) => {
      emit('choice', choice)
    }
    
    return {
      handleChoice
    }
  }
}
</script>

<style scoped>
.delete-confirm-modal {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-dialog {
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-30px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.modal-content {
  border: none;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
}

.modal-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
}

.circle-1 {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #dc3545, #c82333);
  top: -60px;
  right: -60px;
}

.circle-2 {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #6c757d, #545b62);
  bottom: -40px;
  left: -40px;
}

.circle-3 {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #ffc107, #e0a800);
  top: 50%;
  left: -30px;
  transform: translateY(-50%);
}

.modal-header,
.modal-body {
  position: relative;
  z-index: 1;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f8d7da, #f5c6cb);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.icon-wrapper i {
  font-size: 24px;
}

.btn-option {
  border-radius: 12px;
  padding: 1rem;
  border-width: 2px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.btn-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.btn-option:hover::before {
  left: 100%;
}

.btn-option:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.btn-outline-danger:hover {
  background: linear-gradient(135deg, #dc3545, #c82333);
  border-color: #dc3545;
  color: white;
}

.btn-outline-secondary:hover {
  background: linear-gradient(135deg, #6c757d, #545b62);
  border-color: #6c757d;
  color: white;
}

.btn-option i {
  font-size: 20px;
}

.delete-options {
  animation: slideUp 0.3s ease-out 0.1s both;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>