const knex = require('knex');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

class Database {
  constructor() {
    this.db = null;
    this.dbPath = path.join(app.getPath('userData'), 'PhraseCollector', 'data.db');
  }

  async init() {
    // 确保数据目录存在
    const dbDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // 初始化数据库连接
    this.db = knex({
      client: 'sqlite3',
      connection: {
        filename: this.dbPath
      },
      useNullAsDefault: true
    });

    // 创建表
    await this.createTables();
  }

  async createTables() {
    // 创建短语表
    await this.db.schema.hasTable('phrases').then(exists => {
      if (!exists) {
        return this.db.schema.createTable('phrases', table => {
          table.increments('id').primary();
          table.text('text').notNullable(); // 短语内容
          table.text('source').nullable(); // 来源URL/路径
          table.text('appName').nullable(); // 来源应用名称
          table.text('selectionContext').nullable(); // 上下文环境
          table.timestamp('timestamp').defaultTo(this.db.fn.now()); // 保存时间
          table.boolean('isUnknown').defaultTo(false); // 是否不认识
          table.json('metadata').nullable(); // 额外元数据
          table.timestamps(true, true); // created_at, updated_at
        });
      }
    });

    // 创建标签表
    await this.db.schema.hasTable('tags').then(exists => {
      if (!exists) {
        return this.db.schema.createTable('tags', table => {
          table.increments('id').primary();
          table.string('name').notNullable().unique();
          table.string('color').defaultTo('#007bff');
          table.timestamps(true, true);
        });
      }
    });

    // 创建短语标签关联表
    await this.db.schema.hasTable('phrase_tags').then(exists => {
      if (!exists) {
        return this.db.schema.createTable('phrase_tags', table => {
          table.increments('id').primary();
          table.integer('phrase_id').references('id').inTable('phrases').onDelete('CASCADE');
          table.integer('tag_id').references('id').inTable('tags').onDelete('CASCADE');
          table.unique(['phrase_id', 'tag_id']);
        });
      }
    });

    // 创建设置表
    await this.db.schema.hasTable('settings').then(exists => {
      if (!exists) {
        return this.db.schema.createTable('settings', table => {
          table.string('key').primary();
          table.text('value');
          table.timestamps(true, true);
        });
      }
    });
  }

  // 获取短语列表
  async getPhrases(options = {}) {
    const { page = 1, limit = 20, search, tag, isUnknown, sortBy = 'timestamp', sortOrder = 'desc' } = options;
    
    let query = this.db('phrases')
      .leftJoin('phrase_tags', 'phrases.id', 'phrase_tags.phrase_id')
      .leftJoin('tags', 'phrase_tags.tag_id', 'tags.id')
      .select(
        'phrases.*',
        this.db.raw('GROUP_CONCAT(tags.name) as tag_names'),
        this.db.raw('GROUP_CONCAT(tags.color) as tag_colors')
      )
      .groupBy('phrases.id');

    // 搜索过滤
    if (search) {
      query = query.where('phrases.text', 'like', `%${search}%`);
    }

    // 标签过滤
    if (tag) {
      query = query.having('tag_names', 'like', `%${tag}%`);
    }

    // 未知状态过滤
    if (typeof isUnknown === 'boolean') {
      query = query.where('phrases.isUnknown', isUnknown);
    }

    // 排序
    query = query.orderBy(`phrases.${sortBy}`, sortOrder);

    // 分页
    const offset = (page - 1) * limit;
    const results = await query.limit(limit).offset(offset);

    // 获取总数
    const totalQuery = this.db('phrases');
    if (search) {
      totalQuery.where('text', 'like', `%${search}%`);
    }
    if (typeof isUnknown === 'boolean') {
      totalQuery.where('isUnknown', isUnknown);
    }
    const total = await totalQuery.count('id as count').first();

    return {
      data: results.map(phrase => ({
        ...phrase,
        tags: phrase.tag_names ? phrase.tag_names.split(',').map((name, index) => ({
          name,
          color: phrase.tag_colors ? phrase.tag_colors.split(',')[index] : '#007bff'
        })) : []
      })),
      total: total.count,
      page,
      limit,
      totalPages: Math.ceil(total.count / limit)
    };
  }

  // 添加短语
  async addPhrase(phraseData) {
    const { text, source, appName, selectionContext, isUnknown = false, tags = [], metadata = {} } = phraseData;
    
    const [phraseId] = await this.db('phrases').insert({
      text,
      source,
      appName,
      selectionContext,
      isUnknown,
      metadata: JSON.stringify(metadata)
    });

    // 添加标签关联
    if (tags.length > 0) {
      await this.addTagsToPhrase(phraseId, tags);
    }

    return phraseId;
  }

  // 更新短语
  async updatePhrase(id, phraseData) {
    const { text, source, appName, selectionContext, isUnknown, tags, metadata } = phraseData;
    
    const updateData = {};
    if (text !== undefined) updateData.text = text;
    if (source !== undefined) updateData.source = source;
    if (appName !== undefined) updateData.appName = appName;
    if (selectionContext !== undefined) updateData.selectionContext = selectionContext;
    if (isUnknown !== undefined) updateData.isUnknown = isUnknown;
    if (metadata !== undefined) updateData.metadata = JSON.stringify(metadata);

    await this.db('phrases').where('id', id).update(updateData);

    // 更新标签关联
    if (tags !== undefined) {
      await this.db('phrase_tags').where('phrase_id', id).del();
      if (tags.length > 0) {
        await this.addTagsToPhrase(id, tags);
      }
    }

    return true;
  }

  // 删除短语
  async deletePhrase(id) {
    await this.db('phrases').where('id', id).del();
    return true;
  }

  // 搜索短语
  async searchPhrases(query) {
    const results = await this.db('phrases')
      .where('text', 'like', `%${query}%`)
      .orWhere('source', 'like', `%${query}%`)
      .orWhere('appName', 'like', `%${query}%`)
      .orderBy('timestamp', 'desc')
      .limit(50);

    return results;
  }

  // 获取统计信息
  async getPhraseStats() {
    const total = await this.db('phrases').count('id as count').first();
    const unknown = await this.db('phrases').where('isUnknown', true).count('id as count').first();
    const today = await this.db('phrases')
      .where('timestamp', '>=', new Date().toISOString().split('T')[0])
      .count('id as count').first();
    
    const recentSources = await this.db('phrases')
      .select('source', 'appName')
      .whereNotNull('source')
      .groupBy('source', 'appName')
      .count('id as count')
      .orderBy('count', 'desc')
      .limit(5);

    return {
      total: total.count,
      unknown: unknown.count,
      today: today.count,
      recentSources
    };
  }

  // 导出短语
  async exportPhrases(format = 'json') {
    const phrases = await this.db('phrases')
      .leftJoin('phrase_tags', 'phrases.id', 'phrase_tags.phrase_id')
      .leftJoin('tags', 'phrase_tags.tag_id', 'tags.id')
      .select(
        'phrases.*',
        this.db.raw('GROUP_CONCAT(tags.name) as tag_names')
      )
      .groupBy('phrases.id')
      .orderBy('phrases.timestamp', 'desc');

    if (format === 'csv') {
      const csvHeader = 'ID,短语,来源,应用名称,上下文,是否未知,标签,保存时间\n';
      const csvRows = phrases.map(phrase => {
        const tags = phrase.tag_names || '';
        return `${phrase.id},"${phrase.text}","${phrase.source || ''}","${phrase.appName || ''}","${phrase.selectionContext || ''}",${phrase.isUnknown ? '是' : '否'},"${tags}","${phrase.timestamp}"`;
      }).join('\n');
      return csvHeader + csvRows;
    }

    return JSON.stringify(phrases, null, 2);
  }

  // 添加标签到短语
  async addTagsToPhrase(phraseId, tags) {
    for (const tagName of tags) {
      // 获取或创建标签
      let tag = await this.db('tags').where('name', tagName).first();
      if (!tag) {
        const [tagId] = await this.db('tags').insert({ name: tagName });
        tag = { id: tagId, name: tagName };
      }

      // 创建关联
      await this.db('phrase_tags')
        .insert({ phrase_id: phraseId, tag_id: tag.id })
        .onConflict(['phrase_id', 'tag_id'])
        .ignore();
    }
  }

  // 获取所有标签
  async getTags() {
    return await this.db('tags').orderBy('name');
  }

  // 获取设置
  async getSetting(key, defaultValue = null) {
    const setting = await this.db('settings').where('key', key).first();
    return setting ? JSON.parse(setting.value) : defaultValue;
  }

  // 设置配置
  async setSetting(key, value) {
    await this.db('settings')
      .insert({ key, value: JSON.stringify(value) })
      .onConflict('key')
      .merge({ value: JSON.stringify(value) });
  }

  // 关闭数据库连接
  async close() {
    if (this.db) {
      await this.db.destroy();
    }
  }
}

module.exports = Database;