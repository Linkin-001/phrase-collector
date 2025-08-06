<template>
  <div class="modal fade show d-block modern-modal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content modern-modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ phrase ? '编辑短语' : '添加短语' }}
          </h5>
          <button 
            type="button" 
            class="bi bi-x btn-close" 
            @click="$emit('close')"
          ></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="mb-4">
              <label for="phraseText" class="form-label modern-label">
                <i class="bi bi-chat-text me-2"></i>短语内容 *
              </label>
              <textarea 
                id="phraseText"
                v-model="formData.text"
                class="form-control modern-textarea" 
                rows="5" 
                required
                placeholder="请输入短语内容..."
              ></textarea>
            </div>
            
            <div class="mb-4">
              <label for="phraseTranslation" class="form-label modern-label">
                <i class="bi bi-translate me-2"></i>翻译
              </label>
              <input 
                id="phraseTranslation"
                v-model="formData.translation"
                type="text" 
                class="form-control modern-input" 
                placeholder="请输入翻译..."
              >
            </div>
            
            <div class="mb-4">
              <label for="phraseNotes" class="form-label modern-label">
                <i class="bi bi-journal-text me-2"></i>备注
              </label>
              <textarea 
                id="phraseNotes"
                v-model="formData.notes"
                class="form-control modern-textarea" 
                rows="3" 
                placeholder="请输入备注..."
              ></textarea>
            </div>

            <div class="mb-4">
              <label for="phraseTags" class="form-label modern-label">
                <i class="bi bi-tags me-2"></i>标签
              </label>
              <input 
                id="phraseTags"
                v-model="tagInput"
                @keydown.enter.prevent="addTag"
                @keydown="(e) => e.key === ',' && (e.preventDefault(), addTag())"
                type="text" 
                class="form-control modern-input" 
                placeholder="输入标签后按回车或逗号添加"
              >
              <div class="form-text modern-form-text">
                <i class="bi bi-info-circle me-1"></i>按回车键或逗号添加标签
              </div>
              
              <div v-if="formData.tags.length > 0" class="mt-3">
                <div class="modern-tags-container">
                  <span 
                    v-for="(tag, index) in formData.tags" 
                    :key="index"
                    class="modern-tag"
                  >
                    <i class="bi bi-tag-fill me-1"></i>{{ tag }}
                    <button 
                      type="button"
                      @click="removeTag(index)"
                      class="modern-tag-remove"
                    >
                      <i class="bi bi-x"></i>
                    </button>
                  </span>
                </div>
              </div>
            </div>
            
            <div class="mb-4">
              <div class="form-check modern-checkbox">
                <input 
                  id="phraseIsUnknown"
                  v-model="formData.isUnknown"
                  class="form-check-input modern-check-input" 
                  type="checkbox"
                >
                <label class="form-check-label modern-check-label" for="phraseIsUnknown">
                  <i class="bi bi-question-circle me-2"></i>标记为"不认识"
                </label>
              </div>
            </div>
          </form>
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
            @click="handleSubmit"
            :disabled="!formData.text.trim()"
          >
            <i class="bi bi-check-circle me-2"></i>保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { nextTick, onMounted, reactive, ref, watch } from 'vue'

export default {
  name: 'PhraseModal',
  props: {
    phrase: {
      type: Object,
      default: null
    },
    capturedText: {
      type: String,
      default: ''
    }
  },
  emits: ['save', 'close'],
  setup(props, { emit }) {
    const tagInput = ref('')
    
    const formData = reactive({
      text: '',
      translation: '',
      notes: '',
      tags: [],
      isUnknown: false
    })
    
    // 初始化表单数据
    const initFormData = () => {
      if (props.phrase) {
        formData.text = props.phrase.text || ''
        formData.translation = props.phrase.translation || ''
        formData.notes = props.phrase.notes || ''
        // 确保tags始终为字符串数组
        formData.tags = props.phrase.tags ? 
          props.phrase.tags.map(tag => typeof tag === 'string' ? tag : tag.name) : []
        formData.isUnknown = props.phrase.isUnknown || false
      } else {
        formData.text = props.capturedText || ''
        formData.translation = ''
        formData.notes = ''
        formData.tags = []
        formData.isUnknown = false
      }
    }
    
    const addTag = () => {
      const tag = tagInput.value.trim().replace(/,+$/, '')
      if (tag && !formData.tags.includes(tag)) {
        formData.tags.push(tag)
        tagInput.value = ''
      }
    }
    
    const removeTag = (index) => {
      formData.tags.splice(index, 1)
    }
    
    const handleSubmit = () => {
      if (!formData.text.trim()) {
        return
      }
      
      // 创建纯JavaScript对象，避免Vue响应式对象序列化问题
      const phraseData = {
        text: formData.text.trim(),
        translation: formData.translation.trim() || null,
        notes: formData.notes.trim() || null,
        tags: [...(formData.tags || [])], // 创建新数组避免响应式引用
        isUnknown: !!formData.isUnknown, // 确保是布尔值
        timestamp: props.phrase ? props.phrase.timestamp : new Date().toISOString()
      }
      
      emit('save', phraseData)
    }
    
    // 监听 props 变化
    watch(() => props.phrase, () => {
      initFormData()
    }, { immediate: true })
    
    watch(() => props.capturedText, (newText) => {
      if (newText && !props.phrase) {
        formData.text = newText
      }
    })
    
    onMounted(() => {
      // 自动聚焦到文本框
      nextTick(() => {
        const textArea = document.getElementById('phraseText')
        if (textArea) {
          textArea.focus()
          if (!props.phrase && props.capturedText) {
            // 如果是快速捕获，选中所有文本
            textArea.select()
          }
        }
      })
    })
    
    return {
      formData,
      tagInput,
      addTag,
      removeTag,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.tag-item {
  display: inline-flex;
  align-items: center;
  cursor: default;
}

.tag-item .btn-close {
  cursor: pointer;
}

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
</style>