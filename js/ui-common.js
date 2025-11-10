/**
 * MoneyPouch - UI共通処理
 * 共通のUI機能を提供
 */

const UICommon = {
    /**
     * カテゴリボタンを生成
     */
    generateCategoryButtons(containerId, selectedCategory = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        Object.entries(CONSTANTS.CATEGORIES).forEach(([categoryId, category]) => {
            const isActive = categoryId === selectedCategory ? 'active' : '';
            const buttonHTML = `
                <button type="button" class="category-btn ${isActive}" data-category="${categoryId}">
                    <div class="category-btn-icon" style="background: ${category.color};">
                        <span class="material-icons" style="color: ${category.iconColor};">${category.icon}</span>
                    </div>
                    <span class="category-btn-label">${category.name}</span>
                </button>
            `;
            container.insertAdjacentHTML('beforeend', buttonHTML);
        });

        // カテゴリ選択イベント（イベントデリゲーション）
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.category-btn');
            if (!btn) return;

            container.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 対応する hidden input に値を設定
            const hiddenInput = container.parentElement.querySelector('input[type="hidden"]');
            if (hiddenInput) {
                hiddenInput.value = btn.dataset.category;
            }
        });
    },

    /**
     * 金額入力のバリデーション（UI用）
     */
    validateAmountInput(input) {
        const value = parseFloat(input.value);

        if (isNaN(value) || value < CONSTANTS.MIN_AMOUNT) {
            ErrorHandler.handleValidationError(CONSTANTS.ERRORS.INVALID_AMOUNT, input);
            input.value = '';
            return false;
        }

        if (value > CONSTANTS.MAX_AMOUNT) {
            ErrorHandler.handleValidationError(CONSTANTS.ERRORS.AMOUNT_TOO_LARGE, input);
            input.value = '';
            return false;
        }

        // 整数に丸める
        input.value = Math.floor(value);
        return true;
    },

    /**
     * モーダルを開く（アクセシビリティ対応）
     */
    openModal(modalElement, focusElement = null) {
        modalElement.classList.add('active');
        document.body.style.overflow = 'hidden';

        // フォーカス管理
        if (focusElement) {
            setTimeout(() => focusElement.focus(), CONSTANTS.MODAL_ANIMATION_DELAY);
        }

        // ESCキーで閉じる
        const closeOnEsc = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modalElement);
                document.removeEventListener('keydown', closeOnEsc);
            }
        };
        document.addEventListener('keydown', closeOnEsc);
    },

    /**
     * モーダルを閉じる
     */
    closeModal(modalElement) {
        modalElement.classList.remove('active');
        document.body.style.overflow = '';
    },

    /**
     * 今日の日付を取得（input[type="date"]用）
     */
    getTodayDate() {
        return MoneyPouchApp.formatDate(new Date());
    },

    /**
     * ローディング表示を追加（将来的な拡張用）
     */
    showLoading(container = document.body) {
        const loadingHTML = `
            <div class="loading-overlay" id="loadingOverlay">
                <div class="loading-spinner"></div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', loadingHTML);
    },

    /**
     * ローディングを非表示
     */
    hideLoading() {
        const loading = document.getElementById('loadingOverlay');
        if (loading) {
            loading.remove();
        }
    },

    /**
     * 支出アイテムを動的に生成
     */
    createExpenseItemHTML(expense) {
        const category = CONSTANTS.CATEGORIES[expense.category];
        return `
            <div class="expense-item" data-expense-id="${expense.id}">
                <div class="expense-info">
                    <div class="expense-icon" style="background: ${category.color};">
                        <span class="material-icons" style="color: ${category.iconColor};">${category.icon}</span>
                    </div>
                    <div class="expense-details">
                        <span class="expense-category">${category.name}</span>
                        <span class="expense-date">${MoneyPouchApp.formatDateJapanese(expense.date)}</span>
                    </div>
                </div>
                <span class="expense-amount">-${MoneyPouchApp.formatAmount(expense.amount)}</span>
            </div>
        `;
    },

    /**
     * イベントデリゲーションで支出アイテムのクリックを処理
     */
    setupExpenseItemClickHandler(container, callback) {
        container.addEventListener('click', (e) => {
            const item = e.target.closest('.expense-item');
            if (!item) return;

            const expenseId = item.dataset.expenseId;
            if (expenseId && callback) {
                callback(expenseId);
            }
        });
    },

    /**
     * 数値をフォーマット（カンマ区切り）
     */
    formatNumber(num) {
        return num.toLocaleString();
    },

    /**
     * 安全なHTML挿入（XSS対策）
     */
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    /**
     * フォーム入力値を取得して検証
     */
    getFormData(formId) {
        const form = document.getElementById(formId);
        if (!form) return null;

        const formData = new FormData(form);
        const data = {};

        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        return data;
    }
};

// グローバルに公開
if (typeof window !== 'undefined') {
    window.UICommon = UICommon;
}
