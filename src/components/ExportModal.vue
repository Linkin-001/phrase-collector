<template>
  <div class="modal fade show d-block modern-modal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content modern-modal-content">
        <div class="modal-header">
          <h5 class="modal-title">导出数据</h5>
          <button 
            type="button" 
            class="bi bi-x btn-close" 
            @click="$emit('close')"
          ></button>
        </div>
        <div class="modal-body">
          <div class="mb-4">
            <label class="form-label modern-label">
              <i class="bi bi-file-earmark-arrow-down me-2"></i>选择导出格式
            </label>
            
            <div class="modern-options-container">
              <div class="form-check modern-checkbox">
                <input 
                  id="exportJson"
                  v-model="selectedFormat" 
                  class="form-check-input modern-check-input" 
                  type="radio" 
                  value="json"
                >
                <label class="form-check-label modern-check-label" for="exportJson">
                  <strong>JSON 格式</strong>
                  <div class="text-muted small">包含完整的数据结构，适合备份和迁移</div>
                </label>
              </div>
              
              <div class="form-check modern-checkbox">
                <input 
                  id="exportCsv"
                  v-model="selectedFormat" 
                  class="form-check-input modern-check-input" 
                  type="radio" 
                  value="csv"
                >
                <label class="form-check-label modern-check-label" for="exportCsv">
                  <strong>CSV 格式</strong>
                  <div class="text-muted small">表格格式，可用 Excel 等软件打开</div>
                </label>
              </div>
              
              <div class="form-check modern-checkbox">
                <input 
                  id="exportTxt"
                  v-model="selectedFormat" 
                  class="form-check-input modern-check-input" 
                  type="radio" 
                  value="txt"
                >
                <label class="form-check-label modern-check-label" for="exportTxt">
                  <strong>TXT 格式</strong>
                  <div class="text-muted small">纯文本格式，仅包含短语内容</div>
                </label>
              </div>
            </div>
          </div>
          
          <div class="alert alert-info">
            <i class="bi bi-info-circle me-2"></i>
            导出的文件将保存到您的下载文件夹中
          </div>
        </div>
        <div class="modal-footer modern-modal-footer">
          <button 
            type="button" 
            class="btn btn-outline-secondary modern-btn-cancel" 
            @click="$emit('close')"
          >
            <i class="bi bi-x-circle me-2"></i>取消
          </button>
          <button 
            type="button" 
            class="btn btn-primary modern-btn-save" 
            @click="handleExport"
            :disabled="!selectedFormat"
          >
            <i class="bi bi-download me-2"></i>导出
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'ExportModal',
  emits: ['export', 'close'],
  setup(props, { emit }) {
    const selectedFormat = ref('json')
    
    const handleExport = () => {
      if (selectedFormat.value) {
        emit('export', selectedFormat.value)
      }
    }
    
    return {
      selectedFormat,
      handleExport
    }
  }
}
</script>

<style scoped lang="scss">
.modal {
  animation: fadeIn 0.15s ease-out;
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
  animation: slideIn 0.15s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
  }
  to {
    transform: translateY(0);
  }
}

.form-check {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  transition: all 0.15s ease-in-out;
}

.form-check:hover {
  background-color: #f8f9fa;
  border-color: #adb5bd;
}

.form-check-input:checked + .form-check-label {
  color: #0d6efd;
}

.form-check-input:checked ~ * {
  color: inherit;
}

// Modern options container styles (moved from styles.css)
.modern-options-container {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
}
</style>