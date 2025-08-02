<template>
  <div class="col-md-6 col-lg-4">
    <div class="card h-100 phrase-card" :class="{ 'border-warning': phrase.isUnknown }">
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div class="flex-grow-1">
            <p class="card-text phrase-text" v-html="highlightedText"></p>
            <p v-if="phrase.translation" class="text-muted small mb-1">
              <strong>翻译:</strong> {{ phrase.translation }}
            </p>
            <p v-if="phrase.notes" class="text-muted small mb-1">
              <strong>备注:</strong> {{ phrase.notes }}
            </p>
          </div>
        </div>

        <div class="mt-auto">
          <div v-if="phrase.tags && phrase.tags.length > 0" class="mb-2">
            <span v-for="tag in phrase.tags" :key="tag" class="badge bg-secondary me-1 mb-1">
              {{ tag }}
            </span>
          </div>

          <div class="d-flex justify-content-between align-items-center text-muted small">
            <span>{{ formatDate(phrase.timestamp) }}</span>

            <div class="phrase-actions">
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

<style scoped>
.phrase-card {
  transition: all 0.2s ease;
  cursor: default;

  background-image: radial-gradient(circle at 87% 22%,
      rgba(255, 221, 235, 0.8) 0%,
      transparent 24%),
    radial-gradient(circle at 90% 44%, rgba(187, 225, 250, 0.7) 0%, transparent 19%),
    radial-gradient(circle at 78% 30%, rgba(255, 248, 225, 0.5) 0%, transparent 40%);
  background-color: #f9f9f9;
}

.phrase-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
}

.phrase-actions {
  transition: opacity 0.2s ease;
  display: none;
}

.phrase-card:hover .phrase-actions {
  display: flex;
}

:deep(mark) {
  background-color: #fff3cd;
  padding: 0 2px;
  border-radius: 2px;
}
</style>
