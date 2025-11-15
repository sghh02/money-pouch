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
        modalElement.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // フォーカストラップを設定
        this._setupFocusTrap(modalElement);

        // フォーカス管理
        if (focusElement) {
            setTimeout(() => focusElement.focus(), CONSTANTS.MODAL_ANIMATION_DELAY);
        } else {
            // デフォルトでモーダル内の最初のフォーカス可能要素にフォーカス
            const firstFocusable = this._getFocusableElements(modalElement)[0];
            if (firstFocusable) {
                setTimeout(() => firstFocusable.focus(), CONSTANTS.MODAL_ANIMATION_DELAY);
            }
        }

        // ESCキーで閉じる
        const closeOnEsc = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modalElement);
                document.removeEventListener('keydown', closeOnEsc);
            }
        };
        modalElement._escHandler = closeOnEsc;
        document.addEventListener('keydown', closeOnEsc);
    },

    /**
     * モーダルを閉じる
     */
    closeModal(modalElement) {
        modalElement.classList.remove('active');
        modalElement.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        // イベントリスナーをクリーンアップ
        if (modalElement._escHandler) {
            document.removeEventListener('keydown', modalElement._escHandler);
            delete modalElement._escHandler;
        }
        if (modalElement._focusTrapHandler) {
            document.removeEventListener('keydown', modalElement._focusTrapHandler);
            delete modalElement._focusTrapHandler;
        }
    },

    /**
     * フォーカス可能な要素を取得
     */
    _getFocusableElements(container) {
        const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        return Array.from(container.querySelectorAll(selector)).filter(el => {
            return !el.hasAttribute('disabled') && el.offsetParent !== null;
        });
    },

    /**
     * フォーカストラップを設定
     */
    _setupFocusTrap(modalElement) {
        const handleFocusTrap = (e) => {
            if (!modalElement.classList.contains('active')) return;

            const focusableElements = this._getFocusableElements(modalElement);
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
        };

        modalElement._focusTrapHandler = handleFocusTrap;
        document.addEventListener('keydown', handleFocusTrap);
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
     * 支出アイテムを動的に生成（XSS対策：DOM API使用）
     */
    createExpenseItemElement(expense) {
        const category = CONSTANTS.CATEGORIES[expense.category];

        // 支出アイテムコンテナ
        const item = document.createElement('div');
        item.className = 'expense-item';
        item.dataset.expenseId = expense.id;

        // 支出情報
        const info = document.createElement('div');
        info.className = 'expense-info';

        // アイコン
        const iconDiv = document.createElement('div');
        iconDiv.className = 'expense-icon';
        iconDiv.style.background = `var(--category-${expense.category}-bg)`;

        const icon = document.createElement('span');
        icon.className = 'material-icons';
        icon.style.color = `var(--category-${expense.category}-icon)`;
        icon.textContent = category.icon;
        iconDiv.appendChild(icon);

        // 詳細
        const details = document.createElement('div');
        details.className = 'expense-details';

        const categorySpan = document.createElement('span');
        categorySpan.className = 'expense-category';
        categorySpan.textContent = category.name;

        const dateSpan = document.createElement('span');
        dateSpan.className = 'expense-date';
        dateSpan.textContent = MoneyPouchApp.formatDateJapanese(expense.date);

        details.appendChild(categorySpan);
        details.appendChild(dateSpan);

        info.appendChild(iconDiv);
        info.appendChild(details);

        // 金額
        const amount = document.createElement('span');
        amount.className = 'expense-amount';
        amount.textContent = `-${MoneyPouchApp.formatAmount(expense.amount)}`;

        item.appendChild(info);
        item.appendChild(amount);

        return item;
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
