const path = require('path');
const fs = require('fs');
const { app } = require('electron');

class Database {
  constructor() {
    this.data = {
      phrases: [],
      tags: [],
      settings: {},
      nextId: 1
    };
    this.dbPath = path.join(app.getPath('userData'), 'PhraseCollector', 'data.json');
  }

  async init() {
    // 确保数据目录存在
    const dbDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // 加载现有数据
    await this.loadData();
  }

  async loadData() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const data = JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
        this.data = { ...this.data, ...data };
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  }

  async saveData() {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('保存数据失败:', error);
    }
  }

  // 获取短语列表
  async getPhrases(options = {}) {
    const { page = 1, limit = 20, search, tag, isUnknown, sortBy = 'timestamp', sortOrder = 'desc' } = options;
    
    let phrases = [...this.data.phrases];

    // 搜索过滤
    if (search) {
      phrases = phrases.filter(phrase => 
        phrase.text.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 标签过滤
    if (tag) {
      phrases = phrases.filter(phrase => 
        phrase.tags && phrase.tags.some(t => t.name === tag)
      );
    }

    // 未知状态过滤
    if (typeof isUnknown === 'boolean') {
      phrases = phrases.filter(phrase => phrase.isUnknown === isUnknown);
    }

    // 排序
    phrases.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });

    // 分页
    const total = phrases.length;
    const offset = (page - 1) * limit;
    const paginatedPhrases = phrases.slice(offset, offset + limit);

    return {
      data: paginatedPhrases,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // 添加短语
  async addPhrase(phraseData) {
    const { text, isUnknown = false, tags = [], metadata = {} } = phraseData;
    
    const phrase = {
      id: this.data.nextId++,
      text,
      isUnknown,
      tags: tags.map(tagName => ({ name: tagName, color: '#007bff' })),
      metadata,
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.data.phrases.push(phrase);
    await this.saveData();
    return phrase.id;
  }

  // 更新短语
  async updatePhrase(id, phraseData) {
    const phraseIndex = this.data.phrases.findIndex(p => p.id === id);
    if (phraseIndex === -1) return false;

    const phrase = this.data.phrases[phraseIndex];
    const { text, isUnknown, tags, metadata } = phraseData;
    
    if (text !== undefined) phrase.text = text;
    if (isUnknown !== undefined) phrase.isUnknown = isUnknown;
    if (metadata !== undefined) phrase.metadata = metadata;
    if (tags !== undefined) {
      phrase.tags = tags.map(tagName => ({ name: tagName, color: '#007bff' }));
    }
    phrase.updated_at = new Date().toISOString();

    await this.saveData();
    return true;
  }

  // 删除短语
  async deletePhrase(id) {
    const phraseIndex = this.data.phrases.findIndex(p => p.id === id);
    if (phraseIndex === -1) return false;

    this.data.phrases.splice(phraseIndex, 1);
    await this.saveData();
    return true;
  }

  // 搜索短语
  async searchPhrases(query) {
    return this.data.phrases
      .filter(phrase => 
        phrase.text.toLowerCase().includes(query.toLowerCase()) ||
        (phrase.source && phrase.source.toLowerCase().includes(query.toLowerCase())) ||
        (phrase.appName && phrase.appName.toLowerCase().includes(query.toLowerCase()))
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 50);
  }

  // 获取统计信息
  async getPhraseStats() {
    const total = this.data.phrases.length;
    const unknown = this.data.phrases.filter(p => p.isUnknown).length;
    const today = this.data.phrases.filter(p => {
      const phraseDate = new Date(p.timestamp).toDateString();
      const todayDate = new Date().toDateString();
      return phraseDate === todayDate;
    }).length;
    
    const sourceCounts = {};
    this.data.phrases.forEach(phrase => {
      if (phrase.source) {
        const key = `${phrase.source}|${phrase.appName || ''}`;
        sourceCounts[key] = (sourceCounts[key] || 0) + 1;
      }
    });

    const recentSources = Object.entries(sourceCounts)
      .map(([key, count]) => {
        const [source, appName] = key.split('|');
        return { source, appName, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total,
      unknown,
      today,
      recentSources
    };
  }

  // 导出短语
  async exportPhrases(format = 'json') {
    const phrases = this.data.phrases.map(phrase => ({
      ...phrase,
      tag_names: phrase.tags ? phrase.tags.map(t => t.name).join(',') : ''
    }));

    if (format === 'csv') {
      const csvHeader = 'ID,短语,是否未知,标签,保存时间\n';
      const csvRows = phrases.map(phrase => {
        const tags = phrase.tag_names || '';
        return `${phrase.id},"${phrase.text}",${phrase.isUnknown ? '是' : '否'},"${tags}","${phrase.timestamp}"`;
      }).join('\n');
      return csvHeader + csvRows;
    }

    return JSON.stringify(phrases, null, 2);
  }

  // 获取所有标签
  async getTags() {
    const tagSet = new Set();
    this.data.phrases.forEach(phrase => {
      if (phrase.tags) {
        phrase.tags.forEach(tag => tagSet.add(tag.name));
      }
    });
    return Array.from(tagSet).map(name => ({ name, color: '#007bff' }));
  }

  // 获取设置
  async getSetting(key, defaultValue = null) {
    return this.data.settings[key] !== undefined ? this.data.settings[key] : defaultValue;
  }

  // 设置配置
  async setSetting(key, value) {
    this.data.settings[key] = value;
    await this.saveData();
  }

  // 关闭数据库连接
  async close() {
    await this.saveData();
  }
}

module.exports = Database;