// テーマ管理モジュール

// 利用可能なテーマ
const THEMES = [
    { id: 'default', name: 'デフォルト（青紫）', emoji: '🌌' },
    { id: 'pink', name: 'ピンク', emoji: '🌸' },
    { id: 'ocean', name: 'オーシャン', emoji: '🌊' },
    { id: 'sunset', name: 'サンセット', emoji: '🌅' },
    { id: 'forest', name: 'フォレスト', emoji: '🌲' },
    { id: 'midnight', name: 'ミッドナイト', emoji: '🌙' },
    { id: 'monochrome', name: 'モノクローム', emoji: '⚫' }
];

// ストレージキー
const THEME_STORAGE_KEY = 'moneypouch_theme';

// 現在のテーマを取得
function getCurrentTheme() {
    return localStorage.getItem(THEME_STORAGE_KEY) || 'default';
}

// テーマを適用
function applyTheme(themeId) {
    const html = document.documentElement;

    // デフォルトテーマの場合は属性を削除
    if (themeId === 'default') {
        html.removeAttribute('data-theme');
    } else {
        html.setAttribute('data-theme', themeId);
    }

    // ローカルストレージに保存
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
}

// ページ読み込み時にテーマを適用
function initTheme() {
    const currentTheme = getCurrentTheme();
    applyTheme(currentTheme);
}

// テーマモーダルを開く
function openThemeModal() {
    const modal = document.getElementById('theme-modal-overlay');
    if (modal) {
        modal.classList.add('active');
        renderThemeOptions();
    }
}

// テーマモーダルを閉じる
function closeThemeModal() {
    const modal = document.getElementById('theme-modal-overlay');
    if (modal) {
        modal.classList.remove('active');
    }
}

// テーマ選択肢をレンダリング
function renderThemeOptions() {
    const container = document.getElementById('theme-options-container');
    if (!container) return;

    const currentTheme = getCurrentTheme();

    container.innerHTML = THEMES.map(theme => `
        <div class="theme-option ${theme.id === currentTheme ? 'active' : ''}"
             data-theme-id="${theme.id}"
             onclick="selectTheme('${theme.id}')">
            <div class="theme-emoji">${theme.emoji}</div>
            <div class="theme-info">
                <div class="theme-name">${theme.name}</div>
                ${theme.id === currentTheme ? '<div class="theme-check">✓</div>' : ''}
            </div>
        </div>
    `).join('');
}

// テーマを選択
function selectTheme(themeId) {
    applyTheme(themeId);
    renderThemeOptions(); // 選択状態を更新
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', () => {
    initTheme();

    // モーダルのオーバーレイクリックで閉じる
    const modalOverlay = document.getElementById('theme-modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeThemeModal();
            }
        });
    }
});
