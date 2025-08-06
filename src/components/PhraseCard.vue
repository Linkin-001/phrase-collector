<template>
  <div class="col-md-6 col-lg-6">
    <div class="card phrase-card" :class="{ 'border-warning': phrase.isUnknown }">
      <div class="card-body d-flex flex-column p-0 justify-content-between">
        <div class="d-flex justify-content-between align-items-start mb-0">
          <div class="flex-grow-1 w-100">
            <p class="card-text phrase-text" v-html="highlightedText"></p>
            <p v-if="phrase.translation" class="text-muted small mb-1">
              <strong>翻译:</strong>
              <span class="text-ellipsis">{{ phrase.translation }}</span>
            </p>
            <p v-if="phrase.notes" class="text-muted small mb-1">
              <strong>备注:</strong>
              <span class="text-ellipsis">{{ phrase.notes }}</span>
            </p>
          </div>
        </div>

        <div class="">


          <div class="d-flex justify-content-between align-items-center text-muted small phrase-action-container">
            <div class="d-flex align-items-center flex-grow-1 me-2">
              <span style="font-size: 12px;">{{ formatDate(phrase.timestamp) }}</span>

              <div v-if="phrase.tags && phrase.tags.length > 0" class="ms-3 tags-container">
                <span v-for="(tag, index) in phrase.tags.slice(0, 3)" :key="tag" class="badge ms-1 tag-badge">
                  {{ tag }}
                </span>
                <span v-if="phrase.tags.length > 3" class="badge ms-1 tag-badge-more" :title="phrase.tags.slice(3).join(', ')">
                  +{{ phrase.tags.length - 3 }}
                </span>
              </div>
            </div>

            <div class="phrase-actions flex-shrink-0">
              <button @click="$emit('toggle-unknown', phrase)" :class="[
                'btn btn-sm me-1',
                phrase.isUnknown ? 'btn-warning' : 'btn-outline-secondary',
              ]" :title="phrase.isUnknown ? '标记为已知' : '标记为未知'">
                <i :class="phrase.isUnknown
                  ? 'bi bi-question-circle-fill'
                  : 'bi bi-question-circle'
                  "></i>
              </button>
              <button @click="$emit('copy', phrase)" class="btn btn-sm btn-outline-primary me-1" title="复制">
                <i class="bi bi-clipboard"></i>
              </button>
              <button @click="$emit('edit', phrase)" class="btn btn-sm btn-outline-success me-1" title="编辑">
                <i class="bi bi-pencil"></i>
              </button>
              <button @click="$emit('delete', phrase)" class="btn btn-sm btn-outline-danger" title="删除">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";

export default {
  name: "PhraseCard",
  props: {
    phrase: {
      type: Object,
      required: true,
    },
    searchQuery: {
      type: String,
      default: "",
    },
  },
  emits: ["toggle-unknown", "copy", "edit", "delete"],
  setup(props) {
    const highlightedText = computed(() => {
      if (!props.searchQuery) {
        return escapeHtml(props.phrase.text);
      }

      const query = props.searchQuery.toLowerCase();
      const text = props.phrase.text;
      const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");

      return escapeHtml(text).replace(regex, "<mark>$1</mark>");
    });

    const formatDate = (timestamp) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        return "今天";
      } else if (diffDays === 2) {
        return "昨天";
      } else if (diffDays <= 7) {
        return `${diffDays - 1}天前`;
      } else {
        return date.toLocaleDateString("zh-CN");
      }
    };

    const escapeHtml = (text) => {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    };

    const escapeRegExp = (string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };

    return {
      highlightedText,
      formatDate,
    };
  },
};
</script>

<style scoped lang="scss">
.text-ellipsis {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tag-badge {
  background-image: radial-gradient(circle at 13% 13%,
      rgba(255, 221, 235, 0.8) 0%,
      transparent 83%),
    radial-gradient(circle at 89% 89%, rgba(187, 225, 250, 0.7) 0%, transparent 99%);
  color: black;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
  flex-shrink: 0;
}

.tag-badge-more {
  background-color: #6c757d;
  color: white;
  white-space: nowrap;
  flex-shrink: 0;
  cursor: help;
}

.phrase-card {
  transition: all 0.2s ease;
  cursor: default;
  background-image: radial-gradient(circle at 87% 22%,
      rgba(255, 221, 235, 0.8) 0%,
      transparent 24%),
    radial-gradient(circle at 90% 53%, rgba(187, 225, 250, 0.7) 0%, transparent 43%),
    radial-gradient(circle at 48% 32%, rgba(255, 248, 225, 0.5) 0%, transparent 81%);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-image: radial-gradient(circle at 57% 22%,
        rgba(255, 221, 235, 0.8) 0%,
        transparent 64%),
      radial-gradient(circle at 100% 83%, rgba(187, 225, 250, 0.7) 0%, transparent 43%),
      radial-gradient(circle at 18% 72%, rgba(255, 248, 225, 0.5) 0%, transparent 81%);

    .tags-container {
      max-width: calc(100% - 140px);
    }

    .phrase-actions {
      display: flex;
    }
  }

  &.border-warning .phrase-text {
    border-left: 5px solid #ffc107;
  }

  // Styles moved from styles.css
  &.unknown {
    border-left: 4px solid #ffc107;
    background: linear-gradient(90deg, #fff9e6 0%, white 10%);
  }

  &.selected {
    border-color: #007bff;
    background: linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%);
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
}

.phrase-text {
  font-size: 0.95rem;
  line-height: 1.4;
  word-break: break-word;
  max-height: 120px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  border-left: 5px solid #ff399494;
  padding-left: 0.5rem;
  // Styles moved from styles.css
  font-weight: 500;
  color: #212529;
  margin-bottom: 0.5rem;
}

.phrase-action-container {
  display: flex;
  width: 100%;
  height: 2rem;
  align-items: center;
}

.tags-container {
  max-width: 100%;
  overflow: hidden;
  display: flex;
  flex-wrap: nowrap;
  gap: 0.25rem;
  transition: max-width 0.2s ease;
  height: 100%;
  align-items: center;
}

.phrase-actions {
  transition: opacity 0.2s ease;
  display: none;
  position: relative;
  z-index: 10;

  .btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
  }
}

:deep(mark) {
  background-color: #fff3cd;
  padding: 0 2px;
  border-radius: 2px;
}

// Media query moved from styles.css
@media (max-width: 768px) {
  .phrase-card {
    padding: 0.75rem;
  }

  .phrase-text {
    font-size: 1rem;
  }
}
</style>
