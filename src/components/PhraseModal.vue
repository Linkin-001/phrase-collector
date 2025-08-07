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
              
              <!-- 富文本编辑器工具栏 -->
               <div class="rich-editor-toolbar">
                 <span 
                   class="toolbar-label me-3"
                   @click="toggleBold"
                   :class="{ active: isBoldActive }"
                   title="加粗 (Ctrl+B)"
                 >
                   <i class="bi bi-type-bold me-1"></i>加粗
                 </span>
                 <span 
                   class="toolbar-label"
                   @click="clearFormatting"
                   title="清除格式"
                 >
                   <i class="bi bi-eraser me-1"></i>清除格式
                 </span>
               </div>
              
              <!-- 富文本编辑器 -->
              <div 
                ref="richEditor"
                class="form-control modern-rich-editor" 
                contenteditable="true"
                @input="handleRichTextInput"
                @keydown="handleKeydown"
                @focus="handleFocus"
                @blur="handleBlur"
                :data-placeholder="'请输入短语内容...'"
              ></div>
              
              <!-- 隐藏的textarea用于表单验证 -->
              <textarea 
                v-model="formData.text"
                style="display: none;"
                required
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
    const richEditor = ref(null)
    const isBoldActive = ref(false)
    
    const formData = reactive({
      text: '',
      translation: '',
      notes: '',
      tags: [],
      isUnknown: false
    })
    
    // 富文本编辑器方法
    const toggleBold = () => {
      document.execCommand('bold', false, null)
      updateBoldState()
      richEditor.value?.focus()
    }
    
    const clearFormatting = () => {
      document.execCommand('removeFormat', false, null)
      updateBoldState()
      richEditor.value?.focus()
    }
    
    const updateBoldState = () => {
      isBoldActive.value = document.queryCommandState('bold')
    }
    
    const handleRichTextInput = () => {
      if (richEditor.value) {
        // 获取纯文本内容用于验证
        const textContent = richEditor.value.textContent || ''
        // 获取HTML内容用于保存
        const htmlContent = richEditor.value.innerHTML || ''
        
        // 更新formData，保存HTML格式
        formData.text = htmlContent
        
        // 更新工具栏状态
        updateBoldState()
      }
    }
    
    const handleKeydown = (event) => {
      // Ctrl+B 快捷键加粗
      if (event.ctrlKey && event.key === 'b') {
        event.preventDefault()
        toggleBold()
      }
    }
    
    const handleFocus = () => {
      updateBoldState()
    }
    
    const handleBlur = () => {
      updateBoldState()
    }
    
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
        
        // 设置富文本编辑器内容
        nextTick(() => {
          if (richEditor.value) {
            richEditor.value.innerHTML = formData.text
          }
        })
      } else {
        formData.text = props.capturedText || ''
        formData.translation = ''
        formData.notes = ''
        formData.tags = []
        formData.isUnknown = false
        
        // 设置富文本编辑器内容
        nextTick(() => {
          if (richEditor.value) {
            richEditor.value.innerHTML = formData.text
          }
        })
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
      // 获取纯文本内容用于验证
      const textContent = richEditor.value?.textContent || ''
      if (!textContent.trim()) {
        return
      }
      
      // 创建纯JavaScript对象，避免Vue响应式对象序列化问题
      const phraseData = {
        text: formData.text, // 保存HTML格式的内容
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
      // 自动聚焦到富文本编辑器
      nextTick(() => {
        if (richEditor.value) {
          richEditor.value.focus()
          if (!props.phrase && props.capturedText) {
            // 如果是快速捕获，选中所有文本
            const range = document.createRange()
            range.selectNodeContents(richEditor.value)
            const selection = window.getSelection()
            selection?.removeAllRanges()
            selection?.addRange(range)
          }
        }
      })
    })
    
    return {
      formData,
      tagInput,
      richEditor,
      isBoldActive,
      addTag,
      removeTag,
      handleSubmit,
      toggleBold,
      clearFormatting,
      handleRichTextInput,
      handleKeydown,
      handleFocus,
      handleBlur
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

/* 富文本编辑器样式 */
.rich-editor-toolbar {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-bottom: none;
  border-radius: 0.375rem 0.375rem 0 0;
}

.toolbar-label {
   display: inline-flex;
   align-items: center;
   padding: 0.375rem 0.75rem;
   font-size: 0.875rem;
   font-weight: 500;
   color: #6c757d;
   cursor: pointer;
   border-radius: 0.25rem;
   transition: all 0.2s ease;
   user-select: none;
 }
 
 .toolbar-label:hover {
   color: #0d6efd;
   background-color: rgba(13, 110, 253, 0.1);
 }
 
 .toolbar-label.active {
   color: #0d6efd;
   background-color: rgba(13, 110, 253, 0.15);
   font-weight: 600;
 }

.modern-rich-editor {
  min-height: 120px;
  max-height: 300px;
  overflow-y: auto;
  padding: 0.75rem;
  border-radius: 0 0 0.375rem 0.375rem;
  border-top: none;
  line-height: 1.5;
  font-family: inherit;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.modern-rich-editor:focus {
  box-shadow: none;
  outline: none;
  border: 2px solid #0078d7a6;
  
}

.modern-rich-editor:empty:before {
  content: attr(data-placeholder);
  color: #6c757d;
  font-style: italic;
}

.modern-rich-editor b,
.modern-rich-editor strong {
  font-weight: 600;
  color: #212529;
}

.modern-rich-editor p {
  margin: 0 0 0.5rem 0;
}

.modern-rich-editor p:last-child {
  margin-bottom: 0;
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