<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ phrase ? '编辑短语' : '添加短语' }}
          </h5>
          <button 
            type="button" 
            class="btn-close" 
            @click="$emit('close')"
          ></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label for="phraseText" class="form-label">短语内容 *</label>
              <textarea 
                id="phraseText"
                v-model="formData.text"
                class="form-control" 
                rows="8" 
                required
                placeholder="请输入短语内容..."
              ></textarea>
            </div>
            
            <div class="mb-3">
              <label for="phraseTranslation" class="form-label">翻译</label>
              <input 
                id="phraseTranslation"
                v-model="formData.translation"
                type="text" 
                class="form-control" 
                placeholder="请输入翻译..."
              >
            </div>
            
            <div class="mb-3">
              <label for="phraseNotes" class="form-label">备注</label>
              <textarea 
                id="phraseNotes"
                v-model="formData.notes"
                class="form-control" 
                rows="3" 
                placeholder="请输入备注..."
              ></textarea>
            </div>

            <div class="mb-3">
              <label for="phraseTags" class="form-label">标签</label>
              <input 
                id="phraseTags"
                v-model="tagInput"
                @keydown.enter.prevent="addTag"
                @keydown.comma.prevent="addTag"
                type="text" 
                class="form-control" 
                placeholder="输入标签后按回车或逗号添加"
              >
              <div class="form-text">按回车键或逗号添加标签</div>
              
              <div v-if="formData.tags.length > 0" class="mt-2">
                <span 
                  v-for="(tag, index) in formData.tags" 
                  :key="index"
                  class="badge bg-secondary me-1 mb-1 tag-item"
                >
                  {{ tag }}
                  <button 
                    type="button"
                    @click="removeTag(index)"
                    class="btn-close btn-close-white ms-1"
                    style="font-size: 0.6em;"
                  ></button>
                </span>
              </div>
            </div>
            
            <div class="mb-3">
              <div class="form-check">
                <input 
                  id="phraseIsUnknown"
                  v-model="formData.isUnknown"
                  class="form-check-input" 
                  type="checkbox"
                >
                <label class="form-check-label" for="phraseIsUnknown">
                  标记为"不认识"
                </label>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="$emit('close')"
          >
            取消
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            @click="handleSubmit"
            :disabled="!formData.text.trim()"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, watch, nextTick, onMounted } from 'vue'

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
        formData.tags = props.phrase.tags ? [...props.phrase.tags] : []
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
      
      const phraseData = {
        text: formData.text.trim(),
        translation: formData.translation.trim() || null,
        notes: formData.notes.trim() || null,
        tags: formData.tags || [],
        isUnknown: formData.isUnknown,
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