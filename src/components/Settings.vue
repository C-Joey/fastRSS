<template>
  <div class="settings-modal fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <!-- 头部 -->
      <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">设置</h2>
        <button @click="$emit('close')" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="p-6 space-y-6">
        <!-- 外观设置 -->
        <section>
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">外观</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">主题</label>
              <div class="flex gap-2">
                <button
                  @click="updateTheme('light')"
                  :class="['flex-1 p-3 rounded-lg border-2 transition-colors', settings.theme === 'light' ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300']"
                >
                  <svg class="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span class="text-sm">浅色</span>
                </button>
                <button
                  @click="updateTheme('dark')"
                  :class="['flex-1 p-3 rounded-lg border-2 transition-colors', settings.theme === 'dark' ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300']"
                >
                  <svg class="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span class="text-sm">深色</span>
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                字体大小: {{ settings.fontSize }}px
              </label>
              <input
                type="range"
                min="12"
                max="24"
                v-model.number="localSettings.fontSize"
                @change="saveSettings"
                class="w-full"
              />
            </div>
          </div>
        </section>

        <!-- AI 翻译设置 -->
        <section>
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">AI 翻译</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">翻译服务</label>
              <select v-model="localSettings.translationProvider" @change="saveSettings" class="input">
                <option value="openai">OpenAI (GPT-3.5)</option>
                <option value="deepl">DeepL</option>
                <option value="google">Google Translate</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">API Key</label>
              <input
                v-model="localSettings.apiKey"
                type="password"
                placeholder="输入 API Key"
                class="input"
                @blur="saveSettings"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                API Key 仅保存在本地,不会上传到服务器
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">目标语言</label>
              <select v-model="localSettings.targetLanguage" @change="saveSettings" class="input">
                <option value="zh-CN">简体中文</option>
                <option value="zh-TW">繁体中文</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>
        </section>

        <!-- 阅读设置 -->
        <section>
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">阅读</h3>
          
          <div class="space-y-4">
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                v-model="localSettings.autoMarkRead"
                @change="saveSettings"
                class="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">打开文章时自动标记为已读</span>
            </label>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                更新频率 (分钟)
              </label>
              <input
                type="number"
                min="5"
                max="1440"
                v-model.number="localSettings.updateInterval"
                @blur="saveSettings"
                class="input"
              />
            </div>
          </div>
        </section>

        <!-- 数据管理 -->
        <section>
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">数据管理</h3>
          
          <div class="space-y-3">
            <button @click="exportOPML" class="w-full btn btn-secondary">
              <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              导出订阅源 (OPML)
            </button>

            <button @click="triggerImportOPML" class="w-full btn btn-secondary">
              <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              导入订阅源 (OPML)
            </button>
            <input
              ref="fileInput"
              type="file"
              accept=".opml,.xml"
              @change="importOPML"
              class="hidden"
            />

            <button @click="clearOldArticles" class="w-full btn btn-secondary">
              <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              清理30天前的文章
            </button>
          </div>
        </section>

        <!-- 关于 -->
        <section>
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">关于</h3>
          <div class="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p><strong>RSS AI Reader</strong> v1.0.0</p>
            <p>一个支持 AI 翻译的 PWA RSS 阅读器</p>
            <p class="text-xs">数据存储在本地 IndexedDB,不会上传到服务器</p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { useSettingsStore } from '@/stores/settings.store';
import { rssService } from '@/services/rss.service';
import { db } from '@/services/db.service';
import { storeToRefs } from 'pinia';

defineEmits(['close']);

const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);

const localSettings = reactive({ ...settings.value });
const fileInput = ref<HTMLInputElement>();

watch(settings, (newSettings) => {
  Object.assign(localSettings, newSettings);
}, { deep: true });

function updateTheme(theme: 'light' | 'dark') {
  localSettings.theme = theme;
  saveSettings();
}

async function saveSettings() {
  await settingsStore.updateSettings(localSettings);
  
  // 应用字体大小
  document.documentElement.style.setProperty('--font-size-base', `${localSettings.fontSize}px`);
}

async function exportOPML() {
  try {
    const opml = await rssService.exportOPML();
    const blob = new Blob([opml], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rss-subscriptions-${new Date().toISOString().split('T')[0]}.opml`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    alert('导出失败');
  }
}

function triggerImportOPML() {
  fileInput.value?.click();
}

async function importOPML(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  try {
    const content = await file.text();
    const count = await rssService.importOPML(content);
    alert(`成功导入 ${count} 个订阅源`);
  } catch (error) {
    alert('导入失败');
  }
}

async function clearOldArticles() {
  if (confirm('确定要清理30天前的文章吗?(收藏的文章不会被删除)')) {
    try {
      await db.clearOldArticles(30);
      alert('清理完成');
    } catch (error) {
      alert('清理失败');
    }
  }
}
</script>
