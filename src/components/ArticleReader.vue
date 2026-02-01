<template>
  <div class="article-reader h-full bg-white dark:bg-gray-900 flex flex-col">
    <div v-if="!selectedArticle" class="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
      <div class="text-center">
        <svg class="w-24 h-24 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <p class="text-lg">选择一篇文章开始阅读</p>
      </div>
    </div>

    <div v-else class="flex-1 flex flex-col overflow-hidden">
      <!-- 文章头部 -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 class="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          {{ selectedArticle.title }}
        </h1>
        
        <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <span v-if="selectedArticle.author">{{ selectedArticle.author }}</span>
          <span>{{ formatDate(selectedArticle.pubDate) }}</span>
          <a :href="selectedArticle.link" target="_blank" class="text-primary-600 hover:text-primary-700 dark:text-primary-400">
            查看原文 ↗
          </a>
        </div>

        <!-- 操作按钮 -->
        <div class="flex items-center gap-2">
          <button
            @click="toggleStar"
            :class="['btn btn-ghost', selectedArticle.isStarred ? 'text-yellow-500' : '']"
          >
            <svg class="w-5 h-5" :class="selectedArticle.isStarred ? 'fill-current' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            {{ selectedArticle.isStarred ? '已收藏' : '收藏' }}
          </button>

          <button @click="translateArticle" :disabled="isTranslating" class="btn btn-primary">
            <svg v-if="!isTranslating" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span v-if="isTranslating" class="spinner mr-2"></span>
            {{ isTranslating ? '翻译中...' : showTranslation ? '显示原文' : '翻译全文' }}
          </button>

          <button @click="toggleBilingualMode" v-if="translatedContent" class="btn btn-secondary">
            {{ bilingualMode ? '单语模式' : '双语对照' }}
          </button>
        </div>
      </div>

      <!-- 文章内容 -->
      <div class="flex-1 overflow-y-auto p-6">
        <div v-if="bilingualMode && translatedContent" class="grid grid-cols-2 gap-6">
          <div>
            <h3 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">原文</h3>
            <div class="article-content" v-html="selectedArticle.content"></div>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">译文</h3>
            <div class="article-content prose-sm" v-html="translatedContent"></div>
          </div>
        </div>

        <div v-else>
          <div
            class="article-content"
            v-html="showTranslation && translatedContent ? translatedContent : selectedArticle.content"
            @mouseup="handleTextSelection"
          ></div>
        </div>

        <!-- 选中翻译弹窗 -->
        <div
          v-if="showSelectionTranslate"
          :style="{ top: selectionPosition.y + 'px', left: selectionPosition.x + 'px' }"
          class="fixed bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 z-50 max-w-md"
        >
          <div v-if="selectionTranslating" class="flex items-center gap-2">
            <span class="spinner"></span>
            <span class="text-sm">翻译中...</span>
          </div>
          <div v-else-if="selectionTranslation" class="text-sm">
            <div class="font-medium text-gray-900 dark:text-white mb-1">翻译:</div>
            <div class="text-gray-700 dark:text-gray-300">{{ selectionTranslation }}</div>
          </div>
          <button @click="showSelectionTranslate = false" class="absolute top-1 right-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useArticleStore } from '@/stores/article.store';
import { useSettingsStore } from '@/stores/settings.store';
import { translationService } from '@/services/translate.service';
import { storeToRefs } from 'pinia';
import dayjs from 'dayjs';

const articleStore = useArticleStore();
const settingsStore = useSettingsStore();

const { selectedArticle } = storeToRefs(articleStore);
const { settings } = storeToRefs(settingsStore);

const isTranslating = ref(false);
const showTranslation = ref(false);
const translatedContent = ref('');
const bilingualMode = ref(false);

const showSelectionTranslate = ref(false);
const selectionTranslating = ref(false);
const selectionTranslation = ref('');
const selectionPosition = ref({ x: 0, y: 0 });

watch(selectedArticle, () => {
  showTranslation.value = false;
  translatedContent.value = '';
  bilingualMode.value = false;
  showSelectionTranslate.value = false;
});

function toggleStar() {
  if (selectedArticle.value?.id) {
    articleStore.toggleStar(selectedArticle.value.id);
  }
}

async function translateArticle() {
  if (!selectedArticle.value?.id) return;

  if (showTranslation.value) {
    showTranslation.value = false;
    return;
  }

  if (translatedContent.value) {
    showTranslation.value = true;
    return;
  }

  if (!settings.value.apiKey) {
    alert('请先在设置中配置 API Key');
    return;
  }

  isTranslating.value = true;
  try {
    const translated = await translationService.translateArticle(
      selectedArticle.value.id,
      settings.value.targetLanguage,
      settings.value.translationProvider,
      settings.value.apiKey
    );
    translatedContent.value = translated;
    showTranslation.value = true;
  } catch (error) {
    console.error('Translation failed:', error);
    alert('翻译失败,请检查 API Key 是否正确');
  } finally {
    isTranslating.value = false;
  }
}

function toggleBilingualMode() {
  bilingualMode.value = !bilingualMode.value;
  if (bilingualMode.value) {
    showTranslation.value = false;
  }
}

async function handleTextSelection() {
  const selection = window.getSelection();
  const text = selection?.toString().trim();

  if (!text || text.length < 2) {
    showSelectionTranslate.value = false;
    return;
  }

  if (!settings.value.apiKey) return;

  const range = selection?.getRangeAt(0);
  const rect = range?.getBoundingClientRect();

  if (rect) {
    selectionPosition.value = {
      x: rect.left + rect.width / 2 - 150,
      y: rect.bottom + window.scrollY + 10
    };
  }

  showSelectionTranslate.value = true;
  selectionTranslating.value = true;
  selectionTranslation.value = '';

  try {
    const translated = await translationService.translate(
      text,
      settings.value.targetLanguage,
      settings.value.translationProvider,
      settings.value.apiKey
    );
    selectionTranslation.value = translated;
  } catch (error) {
    console.error('Selection translation failed:', error);
    selectionTranslation.value = '翻译失败';
  } finally {
    selectionTranslating.value = false;
  }
}

function formatDate(date: Date): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
}
</script>

<style scoped>
.article-content {
  font-size: 1.1rem;
  line-height: 1.8;
}

.article-content :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 1.5rem 0;
}

.article-content :deep(p) {
  margin-bottom: 1rem;
}

.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3) {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.article-content :deep(a) {
  color: #4f46e5;
  text-decoration: underline;
}

.article-content :deep(pre) {
  overflow-x: auto;
  padding: 1rem;
  border-radius: 0.5rem;
}

.article-content :deep(code) {
  font-family: 'Courier New', monospace;
}
</style>
