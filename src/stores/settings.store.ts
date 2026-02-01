// Settings Store - 设置状态管理
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Settings } from '@/types';
import { db } from '@/services/db.service';

export const useSettingsStore = defineStore('settings', () => {
    const settings = ref<Settings>({
        theme: 'light',
        fontSize: 16,
        translationProvider: 'openai',
        apiKey: '',
        autoMarkRead: false,
        updateInterval: 30,
        targetLanguage: 'zh-CN'
    });

    const isLoading = ref(false);

    // Actions
    async function loadSettings() {
        isLoading.value = true;
        try {
            settings.value = await db.getSettings();
            applyTheme(settings.value.theme);
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            isLoading.value = false;
        }
    }

    async function updateSettings(updates: Partial<Settings>) {
        try {
            await db.updateSettings(updates);
            settings.value = { ...settings.value, ...updates };

            // 应用主题
            if (updates.theme) {
                applyTheme(updates.theme);
            }
        } catch (error) {
            console.error('Failed to update settings:', error);
            throw error;
        }
    }

    function applyTheme(theme: 'light' | 'dark') {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    function toggleTheme() {
        const newTheme = settings.value.theme === 'light' ? 'dark' : 'light';
        updateSettings({ theme: newTheme });
    }

    return {
        settings,
        isLoading,
        loadSettings,
        updateSettings,
        toggleTheme
    };
});
