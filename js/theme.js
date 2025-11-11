/**
 * テーマ管理モジュール
 * グローバルスコープを汚染せず、安全にテーマを管理します
 */
(function() {
    'use strict';

    // 定数定義
    const THEMES = [
        { id: 'default', name: 'デフォルト（青紫）', emoji: '🌌' },
        { id: 'pink', name: 'ピンク', emoji: '🌸' },
        { id: 'ocean', name: 'オーシャン', emoji: '🌊' },
        { id: 'sunset', name: 'サンセット', emoji: '🌅' },
        { id: 'forest', name: 'フォレスト', emoji: '🌲' },
        { id: 'midnight', name: 'ミッドナイト', emoji: '🌙' },
        { id: 'monochrome', name: 'モノクローム', emoji: '⚫' }
    ];

    const THEME_STORAGE_KEY = 'moneypouch_theme';
    const VALID_THEME_IDS = THEMES.map(t => t.id);

    /**
     * localStorage操作のラッパー（エラーハンドリング付き）
     */
    const storage = {
        get: function(key, defaultValue) {
            try {
                return localStorage.getItem(key) || defaultValue;
            } catch (e) {
                console.warn('localStorage読み取りエラー:', e);
                return defaultValue;
            }
        },
        set: function(key, value) {
            try {
                localStorage.setItem(key, value);
                return true;
            } catch (e) {
                console.warn('localStorage書き込みエラー:', e);
                return false;
            }
        }
    };

    /**
     * テーマIDをバリデーション
     */
    function validateThemeId(themeId) {
        return VALID_THEME_IDS.includes(themeId) ? themeId : 'default';
    }

    /**
     * 現在のテーマを取得
     */
    function getCurrentTheme() {
        const savedTheme = storage.get(THEME_STORAGE_KEY, 'default');
        return validateThemeId(savedTheme);
    }

    /**
     * テーマを適用
     */
    function applyTheme(themeId) {
        const validThemeId = validateThemeId(themeId);
        const html = document.documentElement;

        // デフォルトテーマの場合は属性を削除
        if (validThemeId === 'default') {
            html.removeAttribute('data-theme');
        } else {
            html.setAttribute('data-theme', validThemeId);
        }

        // ローカルストレージに保存
        storage.set(THEME_STORAGE_KEY, validThemeId);

        return validThemeId;
    }

    /**
     * ページ読み込み時にテーマを適用
     */
    function initTheme() {
        const currentTheme = getCurrentTheme();
        applyTheme(currentTheme);
    }

    /**
     * テーマモーダルを開く
     */
    function openThemeModal() {
        const modal = document.getElementById('theme-modal-overlay');
        if (!modal) return;

        modal.classList.add('active');
        renderThemeOptions();

        // フォーカスをモーダルに移動（アクセシビリティ）
        const firstOption = modal.querySelector('.theme-option');
        if (firstOption) {
            firstOption.focus();
        }

        // body のスクロールを防止
        document.body.style.overflow = 'hidden';
    }

    /**
     * テーマモーダルを閉じる
     */
    function closeThemeModal() {
        const modal = document.getElementById('theme-modal-overlay');
        if (!modal) return;

        modal.classList.remove('active');

        // body のスクロールを復元
        document.body.style.overflow = '';
    }

    /**
     * テーマ選択肢をレンダリング（XSS対策済み）
     */
    function renderThemeOptions() {
        const container = document.getElementById('theme-options-container');
        if (!container) return;

        const currentTheme = getCurrentTheme();

        // 既存の要素をクリア
        container.innerHTML = '';

        // DOMを安全に構築
        THEMES.forEach(theme => {
            const option = document.createElement('div');
            option.className = 'theme-option' + (theme.id === currentTheme ? ' active' : '');
            option.setAttribute('data-theme-id', theme.id);
            option.setAttribute('role', 'button');
            option.setAttribute('tabindex', '0');
            option.setAttribute('aria-label', `テーマ: ${theme.name}`);
            option.setAttribute('aria-pressed', theme.id === currentTheme ? 'true' : 'false');

            const emojiDiv = document.createElement('div');
            emojiDiv.className = 'theme-emoji';
            emojiDiv.setAttribute('aria-hidden', 'true');
            emojiDiv.textContent = theme.emoji;

            const infoDiv = document.createElement('div');
            infoDiv.className = 'theme-info';

            const nameDiv = document.createElement('div');
            nameDiv.className = 'theme-name';
            nameDiv.textContent = theme.name;

            infoDiv.appendChild(nameDiv);

            if (theme.id === currentTheme) {
                const checkDiv = document.createElement('div');
                checkDiv.className = 'theme-check';
                checkDiv.textContent = '✓';
                checkDiv.setAttribute('aria-label', '選択中');
                infoDiv.appendChild(checkDiv);
            }

            option.appendChild(emojiDiv);
            option.appendChild(infoDiv);

            // イベントリスナーを安全に追加（XSS対策）
            option.addEventListener('click', function() {
                selectTheme(theme.id);
            });

            // キーボード操作対応（アクセシビリティ）
            option.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectTheme(theme.id);
                }
            });

            container.appendChild(option);
        });
    }

    /**
     * テーマを選択
     */
    function selectTheme(themeId) {
        const appliedTheme = applyTheme(themeId);
        renderThemeOptions(); // 選択状態を更新

        // 選択されたテーマにフォーカス（アクセシビリティ）
        const selectedOption = document.querySelector(`.theme-option[data-theme-id="${appliedTheme}"]`);
        if (selectedOption) {
            selectedOption.focus();
        }
    }

    /**
     * モーダルのキーボード操作
     */
    function handleModalKeyboard(e) {
        const modal = document.getElementById('theme-modal-overlay');
        if (!modal || !modal.classList.contains('active')) return;

        // Escapeキーでモーダルを閉じる
        if (e.key === 'Escape') {
            closeThemeModal();
        }
    }

    /**
     * 初期化処理
     */
    function initialize() {
        // ページ読み込み時にテーマを適用
        initTheme();

        // DOMContentLoaded後の初期化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupEventListeners);
        } else {
            setupEventListeners();
        }
    }

    /**
     * イベントリスナーのセットアップ
     */
    function setupEventListeners() {
        // モーダルのオーバーレイクリックで閉じる
        const modalOverlay = document.getElementById('theme-modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', function(e) {
                if (e.target === modalOverlay) {
                    closeThemeModal();
                }
            });
        }

        // キーボード操作
        document.addEventListener('keydown', handleModalKeyboard);
    }

    /**
     * グローバルAPIの公開（必要最小限）
     */
    window.ThemeManager = {
        open: openThemeModal,
        close: closeThemeModal,
        apply: applyTheme,
        getCurrent: getCurrentTheme
    };

    // 初期化実行
    initialize();
})();
