const { ipcRenderer } = require('electron');

// 应用状态
let currentPage = 1;
let currentLimit = 20;
let currentSearch = '';
let currentFilters = {
    status: '',
    sort: 'timestamp-desc'
};
let selectedTag = null;
let editingPhraseId = null;

// DOM 元素
const elements = {
    searchInput: document.getElementById('searchInput'),
    clearSearch: document.getElementById('clearSearch'),
    addPhraseBtn: document.getElementById('addPhraseBtn'),
    exportBtn: document.getElementById('exportBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    phrasesList: document.getElementById('phrasesList'),
    pagination: document.getElementById('pagination'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    emptyState: document.getElementById('emptyState'),
    statusFilter: document.getElementById('statusFilter'),
    sortFilter: document.getElementById('sortFilter'),
    tagsList: document.getElementById('tagsList'),
    totalCount: document.getElementById('totalCount'),
    unknownCount: document.getElementById('unknownCount'),
    todayCount: document.getElementById('todayCount'),
    phraseModal: new bootstrap.Modal(document.getElementById('phraseModal')),
    exportModal: new bootstrap.Modal(document.getElementById('exportModal')),
    settingsModal: new bootstrap.Modal(document.getElementById('settingsModal')),
    toast: new bootstrap.Toast(document.getElementById('toast'))
};

// 初始化应用
document.addEventListener('DOMContentLoaded', async () => {
    await initializeApp();
    setupEventListeners();
    setupIpcListeners();
});

// 初始化应用
async function initializeApp() {
    showLoading(true);
    try {
        await loadPhrases();
        await loadStats();
        await loadTags();
    } catch (error) {
        console.error('初始化失败:', error);
        showToast('初始化失败，请重启应用', 'error');
    } finally {
        showLoading(false);
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 搜索功能
    elements.searchInput.addEventListener('input', debounce(handleSearch, 300));
    elements.clearSearch.addEventListener('click', clearSearch);

    // 按钮事件
    elements.addPhraseBtn.addEventListener('click', () => openPhraseModal());
    elements.exportBtn.addEventListener('click', () => elements.exportModal.show());
    elements.settingsBtn.addEventListener('click', () => elements.settingsModal.show());

    // 过滤器
    elements.statusFilter.addEventListener('change', handleFilterChange);
    elements.sortFilter.addEventListener('change', handleFilterChange);

    // 模态框事件
    document.getElementById('savePhraseBtn').addEventListener('click', savePhrase);
    document.getElementById('confirmExportBtn').addEventListener('click', exportData);

    // 键盘快捷键
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// 设置IPC监听器
function setupIpcListeners() {
    // 快速捕获
    ipcRenderer.on('quick-capture', (event, data) => {
        // 处理新的数据结构
        const prefillData = { text: data.text };
        
        // 如果有窗口信息，添加到预填充数据中
        if (data.windowInfo) {
            const { appName, windowTitle, processPath, url } = data.windowInfo;
            
            // 构建来源信息
            let source = '';
            if (url) {
                // 如果有URL（浏览器），使用URL作为来源
                source = url;
            } else if (processPath) {
                // 如果有进程路径，使用文件路径作为来源
                source = processPath;
            } else if (appName) {
                // 否则使用应用名称
                source = appName;
            }
            
            if (source) {
                prefillData.source = source;
            }
            
            // 如果有窗口标题，可以作为额外的上下文信息
            if (windowTitle && windowTitle !== appName) {
                prefillData.context = windowTitle;
            }
        }
        
        openPhraseModal(null, prefillData);
        showToast('已捕获文本，请完善信息后保存', 'success');
    });

    // 快速捕获为空时的处理
    ipcRenderer.on('quick-capture-empty', () => {
        openPhraseModal();
        showToast('未检测到选中文本，请手动输入或先复制文本到剪贴板', 'warning');
    });

    // 聚焦搜索
    ipcRenderer.on('focus-search', () => {
        elements.searchInput.focus();
        elements.searchInput.select();
    });

    // 新建短语
    ipcRenderer.on('new-phrase', () => {
        openPhraseModal();
    });

    // 导出数据
    ipcRenderer.on('export-data', () => {
        elements.exportModal.show();
    });

    // 显示关于
    ipcRenderer.on('show-about', () => {
        elements.settingsModal.show();
    });
}

// 加载短语列表
async function loadPhrases() {
    try {
        const options = {
            page: currentPage,
            limit: currentLimit,
            search: currentSearch,
            sortBy: currentFilters.sort.split('-')[0],
            sortOrder: currentFilters.sort.split('-')[1]
        };

        if (currentFilters.status === 'unknown') {
            options.isUnknown = true;
        } else if (currentFilters.status === 'known') {
            options.isUnknown = false;
        }

        if (selectedTag) {
            options.tag = selectedTag;
        }

        const result = await ipcRenderer.invoke('get-phrases', options);
        renderPhrases(result.data);
        renderPagination(result);
        
        // 显示空状态
        if (result.data.length === 0 && currentPage === 1) {
            elements.emptyState.classList.remove('d-none');
            elements.phrasesList.classList.add('d-none');
        } else {
            elements.emptyState.classList.add('d-none');
            elements.phrasesList.classList.remove('d-none');
        }
    } catch (error) {
        console.error('加载短语失败:', error);
        showToast('加载短语失败', 'error');
    }
}

// 渲染短语列表
function renderPhrases(phrases) {
    elements.phrasesList.innerHTML = '';
    
    phrases.forEach(phrase => {
        const phraseCard = createPhraseCard(phrase);
        elements.phrasesList.appendChild(phraseCard);
    });
}

// 创建短语卡片
function createPhraseCard(phrase) {
    const col = document.createElement('div');
    col.className = 'col-12';
    
    const card = document.createElement('div');
    card.className = `phrase-card fade-in ${phrase.isUnknown ? 'unknown' : ''}`;
    card.dataset.id = phrase.id;
    
    // 高亮搜索关键词
    const highlightedText = highlightSearchTerm(phrase.text, currentSearch);
    
    // 格式化时间
    const timeAgo = formatTimeAgo(new Date(phrase.timestamp));
    
    card.innerHTML = `
        <div class="phrase-text">${highlightedText}</div>
        
        ${phrase.selectionContext ? `
            <div class="phrase-context">
                <i class="bi bi-quote"></i> ${phrase.selectionContext}
            </div>
        ` : ''}
        
        <div class="phrase-meta d-flex justify-content-between align-items-center">
            <div>
                ${phrase.source ? `
                    <a href="#" class="source-link" onclick="openSource('${phrase.source}')">
                        <i class="bi bi-link-45deg"></i>
                        ${truncateText(phrase.source, 50)}
                    </a>
                ` : ''}
                ${phrase.appName ? `
                    <span class="badge bg-secondary ms-2">
                        <i class="bi bi-app"></i> ${phrase.appName}
                    </span>
                ` : ''}
            </div>
            <span class="time-ago">${timeAgo}</span>
        </div>
        
        ${phrase.tags && phrase.tags.length > 0 ? `
            <div class="mt-2">
                ${phrase.tags.map(tag => `
                    <span class="tag" style="background-color: ${tag.color}" onclick="filterByTag('${tag.name}')">
                        ${tag.name}
                    </span>
                `).join('')}
            </div>
        ` : ''}
        
        ${phrase.isUnknown ? `
            <div class="mt-2">
                <span class="unknown-badge">
                    <i class="bi bi-question-circle"></i> 不认识
                </span>
            </div>
        ` : ''}
        
        <div class="phrase-actions">
            <button class="btn btn-sm btn-outline-primary" onclick="editPhrase(${phrase.id})">
                <i class="bi bi-pencil"></i> 编辑
            </button>
            <button class="btn btn-sm btn-outline-success" onclick="copyPhrase('${phrase.text.replace(/'/g, "\\'")}')">  
                <i class="bi bi-clipboard"></i> 复制
            </button>
            <button class="btn btn-sm btn-outline-warning" onclick="toggleUnknown(${phrase.id}, ${!phrase.isUnknown})">
                <i class="bi bi-${phrase.isUnknown ? 'check' : 'question'}-circle"></i> 
                ${phrase.isUnknown ? '标记已知' : '标记未知'}
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="deletePhrase(${phrase.id})">
                <i class="bi bi-trash"></i> 删除
            </button>
        </div>
    `;
    
    col.appendChild(card);
    return col;
}

// 渲染分页
function renderPagination(result) {
    const { page, totalPages, total } = result;
    elements.pagination.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // 上一页
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${page === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
        <a class="page-link" href="#" onclick="changePage(${page - 1})">
            <i class="bi bi-chevron-left"></i>
        </a>
    `;
    elements.pagination.appendChild(prevLi);
    
    // 页码
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === page ? 'active' : ''}`;
        li.innerHTML = `
            <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
        `;
        elements.pagination.appendChild(li);
    }
    
    // 下一页
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${page === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `
        <a class="page-link" href="#" onclick="changePage(${page + 1})">
            <i class="bi bi-chevron-right"></i>
        </a>
    `;
    elements.pagination.appendChild(nextLi);
}

// 加载统计信息
async function loadStats() {
    try {
        const stats = await ipcRenderer.invoke('get-phrase-stats');
        elements.totalCount.textContent = stats.total;
        elements.unknownCount.textContent = stats.unknown;
        elements.todayCount.textContent = stats.today;
    } catch (error) {
        console.error('加载统计失败:', error);
    }
}

// 加载标签
async function loadTags() {
    try {
        const phrases = await ipcRenderer.invoke('get-phrases', { limit: 1000 });
        const tagMap = new Map();
        
        phrases.data.forEach(phrase => {
            if (phrase.tags) {
                phrase.tags.forEach(tag => {
                    tagMap.set(tag.name, tag.color);
                });
            }
        });
        
        renderTags(Array.from(tagMap.entries()).map(([name, color]) => ({ name, color })));
    } catch (error) {
        console.error('加载标签失败:', error);
    }
}

// 渲染标签
function renderTags(tags) {
    elements.tagsList.innerHTML = '';
    
    // 添加"全部"标签
    const allTag = document.createElement('span');
    allTag.className = `tag ${!selectedTag ? 'active' : ''}`;
    allTag.style.backgroundColor = '#6c757d';
    allTag.textContent = '全部';
    allTag.onclick = () => filterByTag(null);
    elements.tagsList.appendChild(allTag);
    
    tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = `tag ${selectedTag === tag.name ? 'active' : ''}`;
        tagElement.style.backgroundColor = tag.color;
        tagElement.textContent = tag.name;
        tagElement.onclick = () => filterByTag(tag.name);
        elements.tagsList.appendChild(tagElement);
    });
}

// 事件处理函数
function handleSearch() {
    currentSearch = elements.searchInput.value.trim();
    currentPage = 1;
    loadPhrases();
}

function clearSearch() {
    elements.searchInput.value = '';
    currentSearch = '';
    currentPage = 1;
    loadPhrases();
}

function handleFilterChange() {
    currentFilters.status = elements.statusFilter.value;
    currentFilters.sort = elements.sortFilter.value;
    currentPage = 1;
    loadPhrases();
}

function filterByTag(tagName) {
    selectedTag = tagName;
    currentPage = 1;
    loadPhrases();
    loadTags(); // 重新渲染标签以更新选中状态
}

function changePage(page) {
    if (page < 1) return;
    currentPage = page;
    loadPhrases();
}

// 短语操作函数
function openPhraseModal(phraseId = null, prefillData = {}) {
    editingPhraseId = phraseId;
    const modalTitle = document.getElementById('phraseModalTitle');
    const form = document.getElementById('phraseForm');
    
    if (phraseId) {
        modalTitle.textContent = '编辑短语';
        // 加载短语数据
        loadPhraseForEdit(phraseId);
    } else {
        modalTitle.textContent = '添加短语';
        form.reset();
        
        // 预填充数据 - 需要在模态框显示后设置，确保DOM元素可用
        setTimeout(() => {
            if (prefillData.text) {
                const phraseTextElement = document.getElementById('phraseText');
                if (phraseTextElement) {
                    phraseTextElement.value = prefillData.text;
                    phraseTextElement.focus();
                }
            }
            
            if (prefillData.source) {
                const phraseSourceElement = document.getElementById('phraseSource');
                if (phraseSourceElement) {
                    phraseSourceElement.value = prefillData.source;
                }
            }
            
            if (prefillData.context) {
                const phraseContextElement = document.getElementById('phraseContext');
                if (phraseContextElement) {
                    phraseContextElement.value = prefillData.context;
                }
            }
        }, 100);
    }
    
    elements.phraseModal.show();
}

async function loadPhraseForEdit(phraseId) {
    try {
        const result = await ipcRenderer.invoke('get-phrases', { limit: 1000 });
        const phrase = result.data.find(p => p.id === phraseId);
        
        if (phrase) {
            document.getElementById('phraseText').value = phrase.text;
            document.getElementById('phraseSource').value = phrase.source || '';
            document.getElementById('phraseAppName').value = phrase.appName || '';
            document.getElementById('phraseContext').value = phrase.selectionContext || '';
            document.getElementById('phraseIsUnknown').checked = phrase.isUnknown;
            
            if (phrase.tags) {
                document.getElementById('phraseTags').value = phrase.tags.map(t => t.name).join(', ');
            }
        }
    } catch (error) {
        console.error('加载短语数据失败:', error);
        showToast('加载短语数据失败', 'error');
    }
}

async function savePhrase() {
    const form = document.getElementById('phraseForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const phraseData = {
        text: document.getElementById('phraseText').value.trim(),
        source: document.getElementById('phraseSource').value.trim(),
        appName: document.getElementById('phraseAppName').value.trim(),
        selectionContext: document.getElementById('phraseContext').value.trim(),
        isUnknown: document.getElementById('phraseIsUnknown').checked,
        tags: document.getElementById('phraseTags').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)
    };
    
    try {
        if (editingPhraseId) {
            await ipcRenderer.invoke('update-phrase', editingPhraseId, phraseData);
            showToast('短语更新成功', 'success');
        } else {
            await ipcRenderer.invoke('add-phrase', phraseData);
            showToast('短语添加成功', 'success');
        }
        
        elements.phraseModal.hide();
        await loadPhrases();
        await loadStats();
        await loadTags();
    } catch (error) {
        console.error('保存短语失败:', error);
        showToast('保存短语失败', 'error');
    }
}

async function editPhrase(phraseId) {
    openPhraseModal(phraseId);
}

function copyPhrase(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('已复制到剪贴板', 'success');
    }).catch(error => {
        console.error('复制失败:', error);
        showToast('复制失败', 'error');
    });
}

async function toggleUnknown(phraseId, isUnknown) {
    try {
        await ipcRenderer.invoke('update-phrase', phraseId, { isUnknown });
        showToast(`已标记为${isUnknown ? '未知' : '已知'}`, 'success');
        await loadPhrases();
        await loadStats();
    } catch (error) {
        console.error('更新状态失败:', error);
        showToast('更新状态失败', 'error');
    }
}

async function deletePhrase(phraseId) {
    if (!confirm('确定要删除这个短语吗？')) {
        return;
    }
    
    try {
        await ipcRenderer.invoke('delete-phrase', phraseId);
        showToast('短语删除成功', 'success');
        await loadPhrases();
        await loadStats();
        await loadTags();
    } catch (error) {
        console.error('删除短语失败:', error);
        showToast('删除短语失败', 'error');
    }
}

// 导出功能
async function exportData() {
    const format = document.querySelector('input[name="exportFormat"]:checked').value;
    
    try {
        const data = await ipcRenderer.invoke('export-phrases', format);
        const blob = new Blob([data], { 
            type: format === 'csv' ? 'text/csv' : 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `phrases_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        elements.exportModal.hide();
        showToast('导出成功', 'success');
    } catch (error) {
        console.error('导出失败:', error);
        showToast('导出失败', 'error');
    }
}

// 键盘快捷键处理
function handleKeyboardShortcuts(event) {
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case 'n':
                event.preventDefault();
                openPhraseModal();
                break;
            case 'e':
                event.preventDefault();
                elements.exportModal.show();
                break;
            case 'f':
                if (event.shiftKey) {
                    event.preventDefault();
                    elements.searchInput.focus();
                    elements.searchInput.select();
                }
                break;
        }
    }
    
    if (event.key === 'Escape') {
        // 关闭模态框
        elements.phraseModal.hide();
        elements.exportModal.hide();
        elements.settingsModal.hide();
    }
}

// 工具函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function highlightSearchTerm(text, searchTerm) {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function formatTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return '刚刚';
    } else if (diffInSeconds < 3600) {
        return `${Math.floor(diffInSeconds / 60)}分钟前`;
    } else if (diffInSeconds < 86400) {
        return `${Math.floor(diffInSeconds / 3600)}小时前`;
    } else if (diffInSeconds < 2592000) {
        return `${Math.floor(diffInSeconds / 86400)}天前`;
    } else {
        return date.toLocaleDateString('zh-CN');
    }
}

function showLoading(show) {
    if (show) {
        elements.loadingSpinner.classList.remove('d-none');
        elements.phrasesList.classList.add('d-none');
        elements.emptyState.classList.add('d-none');
    } else {
        elements.loadingSpinner.classList.add('d-none');
    }
}

function showToast(message, type = 'info') {
    const toastBody = document.getElementById('toastBody');
    const toastHeader = document.querySelector('.toast-header i');
    
    toastBody.textContent = message;
    
    // 更新图标和颜色
    toastHeader.className = `bi me-2 ${
        type === 'success' ? 'bi-check-circle text-success' :
        type === 'error' ? 'bi-exclamation-circle text-danger' :
        type === 'warning' ? 'bi-exclamation-triangle text-warning' :
        'bi-info-circle text-primary'
    }`;
    
    elements.toast.show();
}

function openSource(source) {
    if (source.startsWith('http')) {
        require('electron').shell.openExternal(source);
    } else {
        showToast('无法打开此来源', 'warning');
    }
}

// 全局函数（供HTML调用）
window.editPhrase = editPhrase;
window.copyPhrase = copyPhrase;
window.toggleUnknown = toggleUnknown;
window.deletePhrase = deletePhrase;
window.filterByTag = filterByTag;
window.changePage = changePage;
window.openSource = openSource;