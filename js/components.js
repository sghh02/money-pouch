/**
 * MoneyPouch - 共通コンポーネント
 * 再利用可能なHTMLコンポーネントを提供
 */

const Components = {
    /**
     * ボトムナビゲーションを生成
     */
    renderBottomNav(activePage) {
        const nav = document.querySelector('.bottom-nav');
        if (!nav) return;

        const pages = [
            { id: 'home', href: 'home.html', icon: 'home', label: 'ホーム' },
            { id: 'history', href: 'history.html', icon: 'history', label: '履歴' },
            { id: 'goals', href: 'goals.html', icon: 'flag', label: '貯蓄' }
        ];

        const container = document.createElement('div');
        container.className = 'nav-container';

        pages.forEach(page => {
            const item = document.createElement('a');
            item.href = page.href;
            item.className = 'nav-item' + (page.id === activePage ? ' active' : '');
            item.setAttribute('aria-label', page.label);

            const icon = document.createElement('span');
            icon.className = 'material-icons';
            icon.textContent = page.icon;

            const label = document.createElement('span');
            label.className = 'nav-label';
            label.textContent = page.label;

            item.appendChild(icon);
            item.appendChild(label);
            container.appendChild(item);
        });

        nav.innerHTML = '';
        nav.appendChild(container);
    },

    /**
     * テーマ選択モーダルを生成
     */
    renderThemeModal() {
        const existingModal = document.getElementById('theme-modal-overlay');
        if (existingModal) return; // 既に存在する場合はスキップ

        const modal = document.createElement('div');
        modal.id = 'theme-modal-overlay';
        modal.className = 'modal-overlay';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'theme-modal-title');

        modal.innerHTML = `
            <div class="modal" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2 class="modal-title" id="theme-modal-title">テーマカラー</h2>
                </div>
                <div class="modal-body">
                    <div id="theme-options-container"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="ThemeManager.close()">閉じる</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    /**
     * すべての共通コンポーネントを初期化
     */
    init(activePage) {
        // DOMContentLoaded後に実行
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.renderBottomNav(activePage);
                this.renderThemeModal();
            });
        } else {
            this.renderBottomNav(activePage);
            this.renderThemeModal();
        }
    }
};

// グローバルに公開
if (typeof window !== 'undefined') {
    window.Components = Components;
}
