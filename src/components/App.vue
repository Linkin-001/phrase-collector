<template>
  <div class="d-flex flex-column h-100">
    <!-- 顶部导航栏 -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">
          <i class="bi bi-collection"></i>
          Phrase Collector
        </a>
        
        <!-- 搜索框 -->
        <div class="d-flex flex-grow-1 mx-3">
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-search"></i>
            </span>
            <input 
              type="text" 
              v-model="searchQuery" 
              @input="handleSearch"
              class="form-control" 
              placeholder="搜索短语..."
            >
            <button 
              class="btn text-secondary bg-white btn-outline-light fs-3" 
              type="button" 
              @click="clearSearch"
            >
              <i class="bi bi-x"></i>
            </button>
          </div>
        </div>

        <!-- 工具按钮 -->
        <div class="d-flex gap-2">
          <button 
            class="btn btn-outline-light" 
            @click="openAddModal" 
            title="新建短语"
          >
            <i class="bi bi-plus-lg"></i>
          </button>
          <button 
            class="btn btn-outline-light" 
            @click="openExportModal" 
            title="导出数据"
          >
            <i class="bi bi-download"></i>
          </button>
          <button 
            class="btn btn-outline-light" 
            @click="openSettingsModal" 
            title="设置"
          >
            <i class="bi bi-gear"></i>
          </button>
          <button 
            class="btn btn-outline-light" 
            @click="openExitConfirmModal" 
            title="关闭程序"
          >
            <i class="bi bi-x-circle"></i>
          </button>
        </div>
      </div>
    </nav>

    <!-- 主要内容区域 -->
    <div class="container-fluid flex-grow-1 p-0">
      <div class="row h-100 g-0">
        <!-- 侧边栏 -->
        <div class="col-md-3 bg-light border-end">
          <div class="p-3">
            <!-- 统计信息 -->
            <div class="card mb-3">
              <div class="card-body">
                <h6 class="card-title">统计信息</h6>
                <div class="row text-center">
                  <div class="col-4">
                    <div class="h5 mb-0 text-primary">{{ stats.total }}</div>
                    <small class="text-muted">总计</small>
                  </div>
                  <div class="col-4">
                    <div class="h5 mb-0 text-warning">{{ stats.unknown }}</div>
                    <small class="text-muted">未知</small>
                  </div>
                  <div class="col-4">
                    <div class="h5 mb-0 text-success">{{ stats.today }}</div>
                    <small class="text-muted">今日</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- 过滤器 -->
            <div class="card mb-3">
              <div class="card-body">
                <h6 class="card-title modern-section-title">
                  <i class="bi bi-funnel"></i>
                  智能过滤
                </h6>
                <div class="modern-filter-container">
                  <div class="modern-filter-item">
                    <label class="modern-filter-label">
                      <i class="bi bi-circle-fill"></i>
                      状态筛选
                    </label>
                    <div class="modern-select-wrapper">
                      <select 
                        v-model="filters.status" 
                        @change="applyFilters"
                        class="modern-select"
                      >
                        <option value="">🔍 全部状态</option>
                        <option value="unknown">❓ 未知短语</option>
                        <option value="known">✅ 已知短语</option>
                      </select>
                    </div>
                  </div>
                  <div class="modern-filter-item">
                    <label class="modern-filter-label">
                      <i class="bi bi-sort-down"></i>
                      排序方式
                    </label>
                    <div class="modern-select-wrapper">
                      <select 
                        v-model="filters.sort" 
                        @change="applyFilters"
                        class="modern-select"
                      >
                        <option value="timestamp-desc">🕒 最新优先</option>
                        <option value="timestamp-asc">⏰ 最旧优先</option>
                        <option value="text-asc">🔤 内容A-Z</option>
                        <option value="text-desc">🔡 内容Z-A</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 标签列表 -->
            <div class="card">
              <div class="card-body">
                <h6 class="card-title modern-section-title">
                  <i class="bi bi-tags"></i>
                  标签筛选
                </h6>
                <div class="modern-tags-container">
                  <span 
                    v-for="tag in availableTags" 
                    :key="tag.name"
                    @click="toggleTagFilter(tag.name)"
                    :class="[
                      'modern-tag', 
                      'cursor-pointer',
                      selectedTags.includes(tag.name) ? 'active' : ''
                    ]"
                  >
                    <i class="bi bi-tag-fill"></i>
                    {{ tag.name }} 
                    <span class="tag-count">({{ tag.count }})</span>
                  </span>
                  <div v-if="availableTags.length === 0" class="empty-tags-message">
                    <i class="bi bi-tags text-muted"></i>
                    <span class="text-muted ms-2">暂无标签</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 主内容区 -->
        <div class="col-md-9">
          <div class="p-3 h-100 d-flex flex-column">
            <!-- 短语列表 -->
            <div class="flex-grow-1">
              <div v-if="loading" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">加载中...</span>
                </div>
              </div>
              
              <div v-else-if="filteredPhrases.length === 0" class="text-center py-5">
                <i class="bi bi-collection display-1 text-muted"></i>
                <h4 class="text-muted mt-3">还没有收集任何短语</h4>
                <p class="text-muted">使用 Ctrl+Q 快速捕获选中的文本，或点击上方的 + 按钮手动添加</p>
              </div>
              
              <div v-else class="row g-3">
                <PhraseCard
                  v-for="phrase in paginatedPhrases"
                  :key="phrase.id"
                  :phrase="phrase"
                  :search-query="searchQuery"
                  @toggle-unknown="toggleUnknown"
                  @copy="copyPhrase"
                  @edit="editPhrase"
                  @delete="deletePhrase"
                />
              </div>
            </div>

            <!-- 分页 -->
            <nav v-if="totalPages > 1" aria-label="短语分页" class="mt-3">
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
                    上一页
                  </button>
                </li>
                <li 
                  v-for="page in visiblePages" 
                  :key="page"
                  class="page-item" 
                  :class="{ active: page === currentPage }"
                >
                  <button class="page-link" @click="goToPage(page)">
                    {{ page }}
                  </button>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button class="page-link" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">
                    下一页
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- 模态框组件 -->
    <PhraseModal
      v-if="showPhraseModal"
      :phrase="editingPhrase"
      :captured-text="capturedText"
      @save="savePhrase"
      @close="closePhraseModal"
    />
    
    <ExportModal
      v-if="showExportModal"
      @export="handleExport"
      @close="closeExportModal"
    />
    
    <SettingsModal
      v-if="showSettingsModal"
      @close="closeSettingsModal"
    />
    
    <ExitConfirmModal
      v-if="showExitConfirmModal"
      @choice="handleExitChoice"
      @close="closeExitConfirmModal"
    />
    
    <DeleteConfirmModal
      v-if="showDeleteConfirmModal"
      @choice="handleDeleteChoice"
      @close="closeDeleteConfirmModal"
    />

    <!-- Toast 通知 -->
    <Toast
      v-if="toast.show"
      :message="toast.message"
      :type="toast.type"
      @close="hideToast"
    />
  </div>
</template>

<script>
import { computed, onMounted, reactive, ref } from 'vue'
import DeleteConfirmModal from './DeleteConfirmModal.vue'
import ExitConfirmModal from './ExitConfirmModal.vue'
import ExportModal from './ExportModal.vue'
import PhraseCard from './PhraseCard.vue'
import PhraseModal from './PhraseModal.vue'
import SettingsModal from './SettingsModal.vue'
import Toast from './Toast.vue'

const electronAPI = window.electronAPI || {
  getPhrases: () => Promise.resolve([]),
  addPhrase: () => Promise.resolve(),
  updatePhrase: () => Promise.resolve(),
  deletePhrase: () => Promise.resolve(),
  searchPhrases: () => Promise.resolve([]),
  getPhraseStats: () => Promise.resolve({ total: 0, unknown: 0, today: 0 }),
  exportPhrases: () => Promise.resolve()
}

export default {
  name: 'App',
  components: {
    PhraseCard,
    PhraseModal,
    ExportModal,
    SettingsModal,
    ExitConfirmModal,
    DeleteConfirmModal,
    Toast
  },
  setup() {
    // 响应式数据
    const phrases = ref([])
    const searchQuery = ref('')
    const loading = ref(true)
    const currentPage = ref(1)
    const pageSize = ref(12)
    
    const filters = reactive({
      status: '',
      sort: 'timestamp-desc'
    })
    
    const selectedTags = ref([])
    
    const stats = reactive({
      total: 0,
      unknown: 0,
      today: 0
    })
    
    // 模态框状态
    const showPhraseModal = ref(false)
    const showExportModal = ref(false)
    const showSettingsModal = ref(false)
    const showExitConfirmModal = ref(false)
    const showDeleteConfirmModal = ref(false)
    const editingPhrase = ref(null)
    const capturedText = ref('')
    const deletingPhrase = ref(null)
    
    // Toast 通知
    const toast = reactive({
      show: false,
      message: '',
      type: 'info'
    })
    
    // 计算属性
    const filteredPhrases = computed(() => {
      let result = [...phrases.value]
      
      // 搜索过滤
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(phrase => 
          phrase.text.toLowerCase().includes(query) ||
          phrase.translation?.toLowerCase().includes(query) ||
          phrase.notes?.toLowerCase().includes(query) ||
          phrase.tags?.some(tag => tag.toLowerCase().includes(query))
        )
      }
      
      // 状态过滤
      if (filters.status) {
        result = result.filter(phrase => {
          if (filters.status === 'unknown') return phrase.isUnknown
          if (filters.status === 'known') return !phrase.isUnknown
          return true
        })
      }
      
      // 标签过滤
      if (selectedTags.value.length > 0) {
        result = result.filter(phrase => 
          phrase.tags && phrase.tags.some(tag => selectedTags.value.includes(tag))
        )
      }
      
      // 排序
      result.sort((a, b) => {
        switch (filters.sort) {
          case 'timestamp-asc':
            return new Date(a.timestamp) - new Date(b.timestamp)
          case 'timestamp-desc':
            return new Date(b.timestamp) - new Date(a.timestamp)
          case 'text-asc':
            return a.text.localeCompare(b.text)
          case 'text-desc':
            return b.text.localeCompare(a.text)
          default:
            return new Date(b.timestamp) - new Date(a.timestamp)
        }
      })
      
      return result
    })
    
    const totalPages = computed(() => {
      return Math.ceil(filteredPhrases.value.length / pageSize.value)
    })
    
    const paginatedPhrases = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredPhrases.value.slice(start, end)
    })
    
    const visiblePages = computed(() => {
      const pages = []
      const total = totalPages.value
      const current = currentPage.value
      
      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        if (current <= 4) {
          for (let i = 1; i <= 5; i++) pages.push(i)
          pages.push('...', total)
        } else if (current >= total - 3) {
          pages.push(1, '...')
          for (let i = total - 4; i <= total; i++) pages.push(i)
        } else {
          pages.push(1, '...', current - 1, current, current + 1, '...', total)
        }
      }
      
      return pages.filter(page => page !== '...' || pages.indexOf(page) === pages.lastIndexOf(page))
    })
    
    const availableTags = computed(() => {
      const tagCounts = {}
      phrases.value.forEach(phrase => {
        if (phrase.tags) {
          phrase.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1
          })
        }
      })
      
      return Object.entries(tagCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
    })
    
    // 方法
    const loadPhrases = async () => {
      try {
        loading.value = true
        console.log('开始加载短语...')
        
        if (!window.electronAPI) {
          console.error('electronAPI 未定义')
          showToast('应用初始化失败：electronAPI 未定义', 'error')
          return
        }
        
        const result = await electronAPI.getPhrases()
        console.log('获取到的短语数据:', result)
        
        // 修复：正确处理数据库返回的数据格式
        if (result && Array.isArray(result.data)) {
          phrases.value = result.data
        } else if (Array.isArray(result)) {
          phrases.value = result
        } else {
          console.warn('获取的数据格式不正确:', result)
          phrases.value = []
        }
        
        updateStats()
        console.log('短语加载完成，总数:', phrases.value.length)
      } catch (error) {
        console.error('加载短语失败:', error)
        showToast(`加载短语失败: ${error.message}`, 'error')
        phrases.value = []
      } finally {
        loading.value = false
      }
    }
    
    const updateStats = () => {
      const today = new Date().toDateString()
      stats.total = phrases.value.length
      stats.unknown = phrases.value.filter(p => p.isUnknown).length
      stats.today = phrases.value.filter(p => 
        new Date(p.timestamp).toDateString() === today
      ).length
    }
    
    const handleSearch = () => {
      currentPage.value = 1
    }
    
    const clearSearch = () => {
      searchQuery.value = ''
      currentPage.value = 1
    }
    
    const applyFilters = () => {
      currentPage.value = 1
    }
    
    const toggleTagFilter = (tagName) => {
      const index = selectedTags.value.indexOf(tagName)
      if (index > -1) {
        selectedTags.value.splice(index, 1)
      } else {
        selectedTags.value.push(tagName)
      }
      currentPage.value = 1
    }
    
    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }
    
    const openAddModal = () => {
      editingPhrase.value = null
      showPhraseModal.value = true
    }
    
    const editPhrase = (phrase) => {
      editingPhrase.value = { ...phrase }
      showPhraseModal.value = true
    }
    
    const closePhraseModal = () => {
      showPhraseModal.value = false
      editingPhrase.value = null
      capturedText.value = ''
    }
    
    const savePhrase = async (phraseData) => {
      try {
        if (editingPhrase.value) {
          await electronAPI.updatePhrase(editingPhrase.value.id, phraseData)
          showToast('短语已更新', 'success')
        } else {
          await electronAPI.addPhrase(phraseData)
          showToast('短语已添加', 'success')
        }
        await loadPhrases()
        closePhraseModal()
      } catch (error) {
        console.error('保存短语失败:', error)
        showToast('保存短语失败', 'error')
      }
    }
    
    const toggleUnknown = async (phrase) => {
      try {
        // 只更新isUnknown字段，避免tags格式问题
        await electronAPI.updatePhrase(phrase.id, {
          isUnknown: !phrase.isUnknown
        })
        await loadPhrases()
      } catch (error) {
        console.error('更新短语状态失败:', error)
        showToast('更新失败', 'error')
      }
    }
    
    const copyPhrase = async (phrase) => {
      try {
        await navigator.clipboard.writeText(phrase.text)
        showToast('已复制到剪贴板', 'success')
      } catch (error) {
        console.error('复制失败:', error)
        showToast('复制失败', 'error')
      }
    }
    
    const deletePhrase = (phrase) => {
      deletingPhrase.value = phrase
      showDeleteConfirmModal.value = true
    }
    
    const openDeleteConfirmModal = (phrase) => {
      deletingPhrase.value = phrase
      showDeleteConfirmModal.value = true
    }
    
    const closeDeleteConfirmModal = () => {
      showDeleteConfirmModal.value = false
      deletingPhrase.value = null
    }
    
    const handleDeleteChoice = async (choice) => {
      if (choice === 'confirm' && deletingPhrase.value) {
        try {
          await electronAPI.deletePhrase(deletingPhrase.value.id)
          await loadPhrases()
          showToast('短语已删除', 'success')
        } catch (error) {
          console.error('删除短语失败:', error)
          showToast('删除失败', 'error')
        }
      }
      closeDeleteConfirmModal()
    }
    
    const openExportModal = () => {
      showExportModal.value = true
    }
    
    const closeExportModal = () => {
      showExportModal.value = false
    }
    
    const handleExport = async (format) => {
      try {
        await electronAPI.exportPhrases(format)
        showToast('数据导出成功', 'success')
        closeExportModal()
      } catch (error) {
        console.error('导出失败:', error)
        showToast('导出失败', 'error')
      }
    }
    
    const openSettingsModal = () => {
      showSettingsModal.value = true
    }
    
    const closeSettingsModal = () => {
      showSettingsModal.value = false
    }
    
    const openExitConfirmModal = () => {
      showExitConfirmModal.value = true
    }
    
    const closeExitConfirmModal = () => {
      showExitConfirmModal.value = false
    }
    
    const handleExitChoice = (choiceData) => {
      // choiceData 现在包含 { action, dontShowAgain }
      electronAPI.sendExitChoice(choiceData)
      closeExitConfirmModal()
    }
    
    const showToast = (message, type = 'info') => {
      toast.message = message
      toast.type = type
      toast.show = true
    }
    
    const hideToast = () => {
      toast.show = false
    }
    
    // 生命周期
    onMounted(() => {
      loadPhrases()
      
      // IPC 事件监听
      electronAPI.onQuickCapture((event, data) => {
        editingPhrase.value = null
        capturedText.value = data.text || ''
        showPhraseModal.value = true
      })
      
      electronAPI.onQuickCaptureEmpty(() => {
        editingPhrase.value = null
        capturedText.value = ''
        showPhraseModal.value = true
        showToast('未检测到选中的文本，请手动输入', 'warning')
      })
      
      electronAPI.onNewPhrase(() => {
        openAddModal()
      })
      
      electronAPI.onExportData(() => {
        openExportModal()
      })
      
      electronAPI.onShowAbout(() => {
        openSettingsModal()
      })
      
      electronAPI.onShowExitConfirm(() => {
        openExitConfirmModal()
      })
    })
    
    return {
      // 数据
      phrases,
      searchQuery,
      loading,
      currentPage,
      pageSize,
      filters,
      selectedTags,
      stats,
      showPhraseModal,
      showExportModal,
      showSettingsModal,
      showExitConfirmModal,
      showDeleteConfirmModal,
      editingPhrase,
      capturedText,
      deletingPhrase,
      toast,
      
      // 计算属性
      filteredPhrases,
      totalPages,
      paginatedPhrases,
      visiblePages,
      availableTags,
      
      // 方法
      loadPhrases,
      handleSearch,
      clearSearch,
      applyFilters,
      toggleTagFilter,
      goToPage,
      openAddModal,
      editPhrase,
      closePhraseModal,
      savePhrase,
      toggleUnknown,
      copyPhrase,
      deletePhrase,
      openExportModal,
      closeExportModal,
      handleExport,
      openSettingsModal,
      closeSettingsModal,
      openExitConfirmModal,
      closeExitConfirmModal,
      handleExitChoice,
      openDeleteConfirmModal,
      closeDeleteConfirmModal,
      handleDeleteChoice,
      showToast,
      hideToast
    }
  }
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.tag-badge {
  background-image: radial-gradient(circle at 13% 13%,
      rgba(255, 221, 235, 0.8) 0%,
      transparent 83%),
    radial-gradient(circle at 89% 89%, rgba(187, 225, 250, 0.7) 0%, transparent 99%);
  color: black;
}
</style>