<template>
  <div
    class="modal fade show d-block exit-confirm-modal"
    tabindex="-1"
    style="background-color: rgba(0,0,0,0.6); backdrop-filter: blur(8px);"
  >
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
              <i class="bi bi-question-circle-fill text-warning"></i>
            </div>
            <div>
              <h5 class="modal-title mb-0">退出确认</h5>
              <p class="text-muted small mb-0">请选择您希望的操作</p>
            </div>
          </div>
          <button 
            type="button" 
            class="btn-close" 
            @click="handleChoice('cancel')"
            aria-label="关闭"
          ></button>
        </div>

        <div class="modal-body pt-2">
          <p class="text-muted mb-4">您希望如何处理当前应用？</p>

          <div class="exit-options">
            <button
              type="button"
              class="btn btn-option btn-outline-danger w-100 mb-3"
              @click="handleChoice('quit')"
            >
              <div class="d-flex align-items-center">
                <i class="bi bi-power me-3"></i>
                <div class="text-start">
                  <div class="fw-semibold">直接退出软件</div>
                  <small class>完全关闭应用程序</small>
                </div>
              </div>
            </button>

            <button
              type="button"
              class="btn btn-option btn-outline-primary w-100 mb-3"
              @click="handleChoice('minimize')"
            >
              <div class="d-flex align-items-center">
                <i class="bi bi-arrow-down-circle me-3"></i>
                <div class="text-start">
                  <div class="fw-semibold">最小化到托盘</div>
                  <small class>隐藏窗口到系统托盘</small>
                </div>
              </div>
            </button>



            <!-- 不再提示选项 -->
            <div class="form-check mt-3 pt-3 border-top">
              <input 
                class="form-check-input" 
                type="checkbox" 
                id="dontShowAgain" 
                v-model="dontShowAgain"
              >
              <label class="form-check-label text-muted" for="dontShowAgain">
                不再提示，下次直接执行此操作
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'ExitConfirmModal',
  emits: ['choice'],
  setup(props, { emit }) {
    const dontShowAgain = ref(false)

    const handleChoice = (choice) => {
      emit('choice', {
        action: choice,
        dontShowAgain: dontShowAgain.value
      })
    }

    return {
      dontShowAgain,
      handleChoice
    }
  }
}</script>

<style scoped>
.exit-confirm-modal {
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
  background: linear-gradient(135deg, #007bff, #0056b3);
  top: -60px;
  right: -60px;
}

.circle-2 {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #28a745, #1e7e34);
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
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
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
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
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

.btn-outline-primary:hover {
  background: linear-gradient(135deg, #007bff, #0056b3);
  border-color: #007bff;
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

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  opacity: 0.6;
  transition: all 0.2s ease;
  padding: 0.5rem;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
}

.btn-close::before {
  content: "\00d7";
  font-weight: bold;
  color: #6c757d;
}

.exit-options {
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

.form-check {
  animation: slideUp 0.3s ease-out 0.2s both;
}

.form-check-input {
  border-radius: 4px;
  border: 2px solid #dee2e6;
  transition: all 0.2s ease;
}

.form-check-input:checked {
  background-color: #007bff;
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
}

.form-check-input:focus {
  border-color: #0078d7a6;
  box-shadow: none;
  outline: none;
}

.form-check-label {
  font-size: 0.9rem;
  cursor: pointer;
  transition: color 0.2s ease;
}

.form-check-label:hover {
  color: #495057 !important;
}
</style>