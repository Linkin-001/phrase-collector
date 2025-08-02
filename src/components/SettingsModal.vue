<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">设置</h5>
          <button 
            type="button" 
            class="btn-close" 
            @click="$emit('close')"
          ></button>
        </div>
        <div class="modal-body">
          <!-- 标签页导航 -->
          <ul class="nav nav-tabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                :class="{ active: activeTab === 'shortcuts' }"
                @click="activeTab = 'shortcuts'"
                type="button"
              >
                <i class="bi bi-keyboard me-1"></i>
                快捷键
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                :class="{ active: activeTab === 'storage' }"
                @click="activeTab = 'storage'"
                type="button"
              >
                <i class="bi bi-database me-1"></i>
                数据存储
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                :class="{ active: activeTab === 'about' }"
                @click="activeTab = 'about'"
                type="button"
              >
                <i class="bi bi-info-circle me-1"></i>
                关于
              </button>
            </li>
          </ul>
          
          <!-- 标签页内容 -->
          <div class="tab-content mt-3">
            <!-- 快捷键标签页 -->
            <div v-if="activeTab === 'shortcuts'" class="tab-pane fade show active">
              <h6>全局快捷键</h6>
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>功能</th>
                      <th>快捷键</th>
                      <th>说明</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>快速捕获</td>
                      <td><kbd>Ctrl+Q</kbd></td>
                      <td>捕获当前选中的文本并添加到短语库</td>
                    </tr>
                    <tr>
                      <td>新建短语</td>
                      <td><kbd>Ctrl+N</kbd></td>
                      <td>打开新建短语对话框</td>
                    </tr>
                    <tr>
                      <td>搜索</td>
                      <td><kbd>Ctrl+F</kbd></td>
                      <td>聚焦到搜索框</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div class="alert alert-info">
                <i class="bi bi-info-circle me-2"></i>
                快捷键在应用运行时全局有效，即使应用在后台也可以使用
              </div>
            </div>
            
            <!-- 数据存储标签页 -->
            <div v-if="activeTab === 'storage'" class="tab-pane fade show active">
              <h6>数据库信息</h6>
              <div class="mb-3">
                <label class="form-label">数据库位置</label>
                <div class="input-group">
                  <input 
                    type="text" 
                    class="form-control" 
                    :value="dbPath" 
                    readonly
                  >
                  <button 
                    class="btn btn-outline-secondary" 
                    type="button"
                    @click="openDbLocation"
                    title="在文件管理器中打开"
                  >
                    <i class="bi bi-folder2-open"></i>
                  </button>
                </div>
                <div class="form-text">数据存储在本地 SQLite 数据库中</div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">数据统计</label>
                <div class="row">
                  <div class="col-md-4">
                    <div class="card text-center">
                      <div class="card-body py-2">
                        <div class="h5 mb-0 text-primary">{{ stats.total }}</div>
                        <small class="text-muted">总短语数</small>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="card text-center">
                      <div class="card-body py-2">
                        <div class="h5 mb-0 text-warning">{{ stats.unknown }}</div>
                        <small class="text-muted">未知短语</small>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="card text-center">
                      <div class="card-body py-2">
                        <div class="h5 mb-0 text-info">{{ formatFileSize(stats.dbSize) }}</div>
                        <small class="text-muted">数据库大小</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle me-2"></i>
                建议定期导出数据进行备份
              </div>
            </div>
            
            <!-- 关于标签页 -->
            <div v-if="activeTab === 'about'" class="tab-pane fade show active">
              <div class="text-center mb-4">
                <i class="bi bi-collection display-4 text-primary mb-3"></i>
                <h4>Phrase Collector</h4>
                <p class="text-muted">短语收集器</p>
              </div>
              
              <div class="row">
                <div class="col-md-6">
                  <h6>应用信息</h6>
                  <table class="table table-sm table-borderless">
                    <tbody>
                      <tr>
                        <td>版本</td>
                        <td><code>{{ appVersion }}</code></td>
                      </tr>
                      <tr>
                        <td>构建版本</td>
                        <td><code>{{ buildVersion }}</code></td>
                      </tr>
                      <tr>
                        <td>Electron</td>
                        <td><code>Unknown</code></td>
                      </tr>
                      <tr>
                        <td>Node.js</td>
                        <td><code>Unknown</code></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="col-md-6">
                  <h6>技术栈</h6>
                  <ul class="list-unstyled">
                    <li><i class="bi bi-check-circle text-success me-1"></i> Vue 3</li>
                    <li><i class="bi bi-check-circle text-success me-1"></i> Electron</li>
                    <li><i class="bi bi-check-circle text-success me-1"></i> Bootstrap 5</li>
                    <li><i class="bi bi-check-circle text-success me-1"></i> SQLite</li>
                  </ul>
                </div>
              </div>
              
              <div class="mt-4">
                <h6>功能特性</h6>
                <div class="row">
                  <div class="col-md-6">
                    <ul class="list-unstyled">
                      <li><i class="bi bi-lightning text-warning me-1"></i> 快速文本捕获</li>
                      <li><i class="bi bi-search text-info me-1"></i> 智能搜索过滤</li>
                      <li><i class="bi bi-tags text-primary me-1"></i> 标签分类管理</li>
                    </ul>
                  </div>
                  <div class="col-md-6">
                    <ul class="list-unstyled">
                      <li><i class="bi bi-download text-success me-1"></i> 多格式数据导出</li>
                      <li><i class="bi bi-database text-secondary me-1"></i> 本地数据存储</li>
                      <li><i class="bi bi-palette text-danger me-1"></i> 现代化界面设计</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div class="text-center mt-4 pt-3 border-top">
                <p class="text-muted small mb-0">
                  © 2024 Phrase Collector. 基于 Electron 构建的桌面应用程序。
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="$emit('close')"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'

export default {
  name: 'SettingsModal',
  emits: ['close'],
  setup() {
    const electronAPI = window.electronAPI
    const activeTab = ref('shortcuts')
    const dbPath = ref('加载中...')
    
    const stats = reactive({
      total: 0,
      unknown: 0,
      dbSize: 0
    })
    
    const appVersion = ref('1.0.0')
    const buildVersion = ref('1.0.0')
    const electronVersion = ref(window.electronAPI?.versions?.electron || 'Unknown')
    const nodeVersion = ref(window.electronAPI?.versions?.node || 'Unknown')
    
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
    
    const openDbLocation = async () => {
      try {
        await electronAPI.openDbLocation()
      } catch (error) {
        console.error('打开数据库位置失败:', error)
      }
    }
    
    const loadAppInfo = async () => {
      try {
        const info = await electronAPI.getAppInfo()
        if (info) {
          appVersion.value = info.version || '1.0.0'
          buildVersion.value = info.buildVersion || '1.0.0'
          dbPath.value = info.dbPath || '未知'
          stats.total = info.stats?.total || 0
          stats.unknown = info.stats?.unknown || 0
          stats.dbSize = info.stats?.dbSize || 0
        }
      } catch (error) {
        console.error('加载应用信息失败:', error)
        dbPath.value = '加载失败'
      }
    }
    
    onMounted(() => {
      loadAppInfo()
    })
    
    return {
      activeTab,
      dbPath,
      stats,
      appVersion,
      buildVersion,
      electronVersion,
      nodeVersion,
      formatFileSize,
      openDbLocation
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

.nav-tabs .nav-link {
  border: none;
  color: #6c757d;
}

.nav-tabs .nav-link.active {
  background-color: #fff;
  border-bottom: 2px solid #0d6efd;
  color: #0d6efd;
}

.nav-tabs .nav-link:hover {
  border-color: transparent;
  color: #0d6efd;
}

kbd {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  padding: 0.1875rem 0.375rem;
  font-size: 0.875em;
}

.table td {
  padding: 0.5rem 0.75rem;
}

.card {
  transition: all 0.15s ease-in-out;
}

.card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>