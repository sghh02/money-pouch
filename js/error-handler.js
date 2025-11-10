/**
 * MoneyPouch - エラーハンドリング
 * 統一されたエラー処理を提供
 */

const ErrorHandler = {
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

        // トーストやモーダルで表示することも可能
        // 現在はシンプルにalertを使用
        alert(message);
    },

    /**
     * 成功メッセージを表示
     */
    showSuccess(message) {
        // トーストやモーダルで表示することも可能
        // 現在はシンプルにalertを使用
        alert(message);
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
