<template>
  <div class="modal fade show d-block modern-modal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content modern-modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-info-circle me-2"></i>短语详情
          </h5>
          <button 
            type="button" 
            class="bi bi-x btn-close" 
            @click="$emit('close')"
          ></button>
        </div>
        <div class="modal-body">
          <!-- 分栏式布局 -->
          <div class="phrase-detail-columns">
            <!-- 左栏：主要内容 -->
            <div class="main-content-column">
              <div class="content-card">
                <h6 class="content-section-title">
                  <i class="bi bi-chat-text me-2 text-primary"></i>短语内容
                </h6>
                
                <div class="phrase-text">
                  {{ phrase.text }}
                </div>
                
                <div v-if="phrase.translation" class="phrase-translation">
                  <div class="translation-label">
                    <i class="bi bi-translate me-2 text-info"></i>翻译
                  </div>
                  <div class="translation-content">
                    {{ phrase.translation }}
                  </div>
                </div>
                
                <div v-if="phrase.notes" class="phrase-notes">
                  <div class="notes-label">
                    <i class="bi bi-journal-text me-2 text-secondary"></i>备注
                  </div>
                  <div class="notes-content">
                    {{ phrase.notes }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 右栏：元信息 -->
            <div class="meta-info-column">
              <div class="meta-card">
                <h6 class="meta-section-title">
                  <i class="bi bi-info-circle me-2 text-secondary"></i>详细信息
                </h6>
                
                <!-- 状态信息 -->
                <div class="status-section">
                  <div class="meta-item">
                    <div class="meta-label">状态</div>
                    <span :class="[
                      'badge status-badge',
                      phrase.isUnknown ? 'bg-warning text-dark' : 'bg-success'
                    ]">
                      <i :class="[
                        'bi me-1',
                        phrase.isUnknown ? 'bi-question-circle' : 'bi-check-circle'
                      ]"></i>
                      {{ phrase.isUnknown ? '不认识' : '已掌握' }}
                    </span>
                  </div>
                </div>
                
                <!-- 标签信息 -->
                <div class="tags-section" v-if="phrase.tags && phrase.tags.length > 0">
                  <div class="meta-item">
                    <div class="meta-label">标签</div>
                    <div class="tags-container">
                      <span 
                        v-for="tag in phrase.tags" 
                        :key="tag"
                        class="modern-tag detail-tag"
                      >
                        <i class="bi bi-tag-fill me-1"></i>{{ tag }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <!-- 时间信息 -->
                <div class="time-section">
                  <div class="meta-item">
                    <div class="meta-label">
                      <i class="bi bi-clock me-2"></i>创建时间
                    </div>
                    <div class="time-content">
                      <div class="time-text">
                        {{ formatDateTime(phrase.timestamp) }}
                      </div>
                      <small class="time-ago">
                        {{ formatTimeAgo(phrase.timestamp) }}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer modern-modal-footer">
          <button 
            type="button" 
            class="btn btn-outline-primary modern-btn" 
            @click="$emit('edit', phrase)"
          >
            <i class="bi bi-pencil me-2"></i>编辑
          </button>
          <button 
            type="button" 
            class="btn btn-outline-success modern-btn" 
            @click="$emit('copy', phrase)"
          >
            <i class="bi bi-clipboard me-2"></i>复制
          </button>
          <button 
            type="button" 
            class="btn btn-secondary modern-btn" 
            @click="$emit('close')"
          >
            <i class="bi bi-x-circle me-2"></i>关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'PhraseDetailModal',
  props: {
    phrase: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'edit', 'copy'],
  setup(props) {

    const formatDateTime = (timestamp) => {
      const date = new Date(timestamp)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }

    const formatTimeAgo = (timestamp) => {
      const date = new Date(timestamp)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
      const diffMinutes = Math.ceil(diffTime / (1000 * 60))

      if (diffMinutes < 60) {
        return `${diffMinutes}分钟前`
      } else if (diffHours < 24) {
        return `${diffHours}小时前`
      } else if (diffDays === 1) {
        return '今天'
      } else if (diffDays === 2) {
        return '昨天'
      } else if (diffDays <= 7) {
        return `${diffDays - 1}天前`
      } else {
        return date.toLocaleDateString('zh-CN')
      }
    }

    return {
      formatDateTime,
      formatTimeAgo
    }
  }
}
</script>

<style scoped>
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

/* 分栏式布局 */
.phrase-detail-columns {
  display: flex;
  gap: 2rem;
  min-height: 400px;
}

/* 左栏：主要内容 */
.main-content-column {
  flex: 2;
  min-width: 0;
}

.content-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  height: 100%;
}

.content-card:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

/* 右栏：元信息 */
.meta-info-column {
  flex: 1;
  min-width: 280px;
}

.meta-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  height: 100%;
}

.meta-card:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

/* 标题样式 */
.content-section-title,
.meta-section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
}

/* 主要内容样式 */
.phrase-text {
  font-size: 1.3rem;
  font-weight: 600;
  color: #212529;
  margin-bottom: 1.5rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%);
  border-radius: 12px;
  border-left: 4px solid #2196f3;
  word-break: break-word;
  line-height: 1.6;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.1);
}

.phrase-translation {
  margin-bottom: 1.25rem;
}

.translation-label,
.notes-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #6c757d;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.translation-content {
  font-size: 1.1rem;
  color: #495057;
  padding: 1rem;
  background: linear-gradient(135deg, #e8f5e8 0%, #f0fff0 100%);
  border-radius: 10px;
  border-left: 3px solid #17a2b8;
  line-height: 1.5;
  box-shadow: 0 2px 6px rgba(23, 162, 184, 0.1);
}

.phrase-notes {
  margin-bottom: 1rem;
}

.notes-content {
  font-size: 1rem;
  color: #6c757d;
  padding: 1rem;
  background: linear-gradient(135deg, #fff3cd 0%, #fffbf0 100%);
  border-radius: 10px;
  border-left: 3px solid #ffc107;
  line-height: 1.5;
  font-style: italic;
  box-shadow: 0 2px 6px rgba(255, 193, 7, 0.1);
}

/* 元信息区域样式 */
.meta-item {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.meta-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.meta-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #6c757d;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.time-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.time-text {
  font-size: 0.95rem;
  color: #495057;
  font-weight: 500;
}

.time-ago {
  font-size: 0.8rem;
  color: #adb5bd;
  font-style: italic;
}

.status-badge {
  font-size: 0.85rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.detail-tag {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.detail-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}



.modern-btn {
  border-radius: 8px;
  padding: 0.5rem 1.25rem;
  font-weight: 500;
  transition: all 0.3s ease;
  border-width: 2px;
}

.modern-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.badge {
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .phrase-detail-columns {
    flex-direction: column;
    gap: 1.5rem;
    min-height: auto;
  }
  
  .main-content-column {
    flex: none;
  }
  
  .meta-info-column {
    flex: none;
    min-width: auto;
  }
  
  .content-card,
  .meta-card {
    height: auto;
  }
}

@media (max-width: 768px) {
  .modal-dialog {
    margin: 0.5rem;
  }
  
  .phrase-detail-columns {
    gap: 1rem;
  }
  
  .content-card,
  .meta-card {
    padding: 1.25rem;
    border-radius: 12px;
  }
  
  .phrase-text {
    font-size: 1.2rem;
    padding: 1rem;
    margin-bottom: 1.25rem;
  }
  
  .translation-content,
  .notes-content {
    font-size: 1rem;
    padding: 0.875rem;
  }
  
  .content-section-title,
  .meta-section-title {
    font-size: 0.95rem;
    margin-bottom: 1rem;
  }
  
  .meta-item {
    margin-bottom: 1.25rem;
    padding-bottom: 0.875rem;
  }
  
  .time-text {
    font-size: 0.9rem;
  }
  
  .time-ago {
    font-size: 0.75rem;
  }
}

@media (max-width: 576px) {
  .modal-dialog {
    margin: 0.25rem;
  }
  
  .content-card,
  .meta-card {
    padding: 1rem;
  }
  
  .phrase-text {
    font-size: 1.1rem;
    padding: 0.875rem;
  }
  
  .translation-content,
  .notes-content {
    font-size: 0.95rem;
    padding: 0.75rem;
  }
  
  .detail-tag {
    font-size: 0.75rem;
    padding: 0.3rem 0.6rem;
  }
}
</style>