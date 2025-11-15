/**
 * MoneyPouch - エラーハンドリング
 * 統一されたエラー処理とトースト通知を提供
 */

const ErrorHandler = {
    /**
     * トーストコンテナを初期化
     */
    _initToastContainer() {
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    },

    /**
     * トーストを表示
     */
    _showToast(message, type = 'info', duration = 3000) {
        this._initToastContainer();

        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        // アイコンを決定
        const icons = {
            success: 'check_circle',
            error: 'error',
            warning: 'warning',
            info: 'info'
        };

        // タイトルを決定
        const titles = {
            success: '成功',
            error: 'エラー',
            warning: '警告',
            info: '情報'
        };

        toast.innerHTML = `
            <div class="toast-icon">
                <span class="material-icons">${icons[type]}</span>
            </div>
            <div class="toast-content">
                <div class="toast-title">${titles[type]}</div>
                <div class="toast-message">${this._sanitizeHTML(message)}</div>
            </div>
            <button class="toast-close" aria-label="閉じる">
                <span class="material-icons">close</span>
            </button>
            <div class="toast-progress"></div>
        `;

        container.appendChild(toast);

        // 閉じるボタンのイベント
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this._removeToast(toast);
        });

        // アニメーション開始
        setTimeout(() => toast.classList.add('show'), 10);

        // 自動削除
        if (duration > 0) {
            setTimeout(() => {
                this._removeToast(toast);
            }, duration);
        }

        return toast;
    },

    /**
     * トーストを削除
     */
    _removeToast(toast) {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    },

    /**
     * HTMLをサニタイズ（XSS対策）
     */
    _sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    /**
     * エラーをログに記録
     */
    log(error, context = '') {
        const timestamp = new Date().toISOString();
        const message = error instanceof Error ? error.message : error;
        console.error(`[${timestamp}] ${context}:`, message, error);
    },

    /**
     * ユーザーにエラーを表示
     */
    showError(message, error = null) {
        if (error) {
            this.log(error, message);
        }

        this._showToast(message, 'error', 4000);
    },

    /**
     * 成功メッセージを表示
     */
    showSuccess(message) {
        this._showToast(message, 'success', 3000);
    },

    /**
     * 警告メッセージを表示
     */
    showWarning(message) {
        this._showToast(message, 'warning', 3500);
    },

    /**
     * 情報メッセージを表示
     */
    showInfo(message) {
        this._showToast(message, 'info', 3000);
    },

    /**
     * 確認ダイアログを表示
     */
    confirm(message) {
        return confirm(message);
    },

    /**
     * try-catchをラップして統一的にエラー処理
     */
    async tryExecute(fn, errorMessage, context = '') {
        try {
            return await fn();
        } catch (error) {
            this.log(error, context);
            this.showError(errorMessage);
            throw error;
        }
    },

    /**
     * バリデーションエラーを処理
     */
    handleValidationError(message, inputElement = null) {
        this.showError(message);
        if (inputElement) {
            inputElement.focus();
        }
    }
};

// グローバルに公開
if (typeof window !== 'undefined') {
    window.ErrorHandler = ErrorHandler;
}
