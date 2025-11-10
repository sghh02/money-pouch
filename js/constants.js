/**
 * MoneyPouch - 定数定義
 * アプリケーション全体で使用する定数を管理
 */

const CONSTANTS = {
    // UI設定
    MAX_CONTAINER_WIDTH: 480,
    DEFAULT_DISPLAY_COUNT: 5,
    MODAL_ANIMATION_DELAY: 300,

    // 金額制限
    MIN_AMOUNT: 0,
    MAX_AMOUNT: 10000000, // 1000万円

    // LocalStorageキー
    STORAGE_KEYS: {
        EXPENSES: 'moneypouch_expenses',
        BUDGET: 'moneypouch_budget',
        GOALS: 'moneypouch_goals',
        SAVINGS_POOL: 'moneypouch_savings_pool'
    },

    // カテゴリ定義
    CATEGORIES: {
        food: {
            name: '食費',
            icon: 'restaurant',
            color: 'rgba(255, 183, 77, 0.5)',
            iconColor: '#ffe4b3'
        },
        entertainment: {
            name: '娯楽',
            icon: 'sports_esports',
            color: 'rgba(129, 140, 248, 0.5)',
            iconColor: '#c7ccfc'
        },
        transport: {
            name: '交通費',
            icon: 'directions_bus',
            color: 'rgba(74, 222, 128, 0.5)',
            iconColor: '#c0f5d5'
        },
        shopping: {
            name: '買い物',
            icon: 'shopping_bag',
            color: 'rgba(244, 114, 182, 0.5)',
            iconColor: '#fcc9e6'
        },
        health: {
            name: '医療',
            icon: 'favorite',
            color: 'rgba(248, 113, 113, 0.5)',
            iconColor: '#fdc7c7'
        },
        other: {
            name: 'その他',
            icon: 'more_horiz',
            color: 'rgba(156, 163, 175, 0.5)',
            iconColor: '#dfe2e6'
        }
    },

    // エラーメッセージ
    ERRORS: {
        EXPENSE_NOT_FOUND: '支出が見つかりません',
        GOAL_NOT_FOUND: '目標が見つかりません',
        INVALID_AMOUNT: '金額は0以上の数値を入力してください',
        AMOUNT_TOO_LARGE: '金額が大きすぎます（1000万円以下で入力してください）',
        INSUFFICIENT_POOL: '総貯蓄額が不足しています',
        INSUFFICIENT_GOAL: '目標の入金額が不足しています',
        STORAGE_ERROR: 'データの読み込みに失敗しました',
        SAVE_ERROR: 'データの保存に失敗しました'
    },

    // 成功メッセージ
    SUCCESS: {
        EXPENSE_ADDED: '支出を記録しました',
        EXPENSE_UPDATED: '支出を更新しました',
        EXPENSE_DELETED: '支出を削除しました',
        BUDGET_SAVED: '予算を設定しました',
        GOAL_CREATED: '貯蓄目標を作成しました',
        GOAL_UPDATED: '目標を更新しました',
        GOAL_DELETED: '目標を削除しました',
        DEPOSIT_SUCCESS: '入金しました',
        WITHDRAW_SUCCESS: '総貯蓄額に返済しました'
    }
};

// グローバルに公開
if (typeof window !== 'undefined') {
    window.CONSTANTS = CONSTANTS;
}
