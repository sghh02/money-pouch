/**
 * テーマ管理モジュール
 * グローバルスコープを汚染せず、安全にテーマを管理します
 */
(function() {
    'use strict';

    // 定数定義
    const THEMES = [
        { id: 'ocean', name: 'オーシャン', icon: 'waves' },
        { id: 'sunset', name: 'サンセット', icon: 'wb_twilight' },
        { id: 'forest', name: 'フォレスト', icon: 'park' },
        { id: 'lavender', name: 'ラベンダー', icon: 'spa' },
        { id: 'midnight', name: 'ミッドナイト', icon: 'nights_stay' }
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
        return VALID_THEME_IDS.includes(themeId) ? themeId : 'ocean';
    }

    /**
     * 現在のテーマを取得
     */
    function getCurrentTheme() {
        const savedTheme = storage.get(THEME_STORAGE_KEY, 'ocean');
        return validateThemeId(savedTheme);
    }

    /**
     * テーマを適用
     */
    function applyTheme(themeId) {
        const validThemeId = validateThemeId(themeId);
        const html = document.documentElement;

        // テーマ属性を設定
        html.setAttribute('data-theme', validThemeId);

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
     * フォーカス可能な要素を取得
     */
    function getFocusableElements(container) {
        const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        return Array.from(container.querySelectorAll(selector)).filter(el => {
            return !el.hasAttribute('disabled') && el.offsetParent !== null;
        });
    }

    /**
     * フォーカストラップのイベントハンドラ
     */
    function handleFocusTrap(e) {
        const modal = document.getElementById('theme-modal-overlay');
        if (!modal || !modal.classList.contains('active')) return;

        const focusableElements = getFocusableElements(modal);
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Tabキーでのフォーカス移動を制御
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                // Shift+Tab（逆方向）
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab（順方向）
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
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

        // フォーカストラップを有効化
        document.addEventListener('keydown', handleFocusTrap);
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

        // フォーカストラップを無効化（イベントリスナークリーンアップ）
        document.removeEventListener('keydown', handleFocusTrap);
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

            const iconDiv = document.createElement('div');
            iconDiv.className = 'theme-icon';
            iconDiv.setAttribute('aria-hidden', 'true');

            const iconSpan = document.createElement('span');
            iconSpan.className = 'material-icons';
            iconSpan.textContent = theme.icon;
            iconDiv.appendChild(iconSpan);

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

            option.appendChild(iconDiv);
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
