/**
 * MoneyPouch - データ管理モジュール
 * LocalStorageを使用してデータを永続化
 */

const MoneyPouchApp = {
    // LocalStorageのキー
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

    /**
     * ユーティリティ: ユニークIDを生成
     */
    generateId(prefix) {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * ユーティリティ: 現在の年月を取得 (YYYY-MM形式)
     */
    getCurrentYearMonth() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    },

    /**
     * ユーティリティ: 月の日数を取得
     */
    getDaysInMonth(yearMonth) {
        const [year, month] = yearMonth.split('-').map(Number);
        return new Date(year, month, 0).getDate();
    },

    /**
     * ユーティリティ: 月の残り日数を取得
     */
    getRemainingDaysInMonth(yearMonth) {
        if (yearMonth) {
            // 特定の月の場合、その月の最終日を返す（過去の月用）
            const [year, month] = yearMonth.split('-').map(Number);
            const currentYearMonth = this.getCurrentYearMonth();

            // 過去の月の場合は0を返す
            if (yearMonth < currentYearMonth) {
                return 0;
            }

            // 未来の月の場合はその月の総日数を返す
            if (yearMonth > currentYearMonth) {
                return this.getDaysInMonth(yearMonth);
            }
        }

        // 現在の月の残り日数
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const lastDay = new Date(year, month + 1, 0).getDate();
        const today = now.getDate();
        return lastDay - today + 1;
    },

    /**
     * ユーティリティ: 日付を YYYY-MM-DD 形式に変換
     */
    formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * ユーティリティ: 日付を M月D日形式に変換
     */
    formatDateJapanese(dateStr) {
        const [year, month, day] = dateStr.split('-');
        return `${parseInt(month)}月${parseInt(day)}日`;
    },

    /**
     * ユーティリティ: 金額をフォーマット
     */
    formatAmount(amount) {
        // 文字列の場合は数値に変換
        const numAmount = typeof amount === 'string' ? parseInt(amount, 10) : amount;
        // 数値でない場合は0として扱う
        const validAmount = isNaN(numAmount) ? 0 : numAmount;
        return `¥${validAmount.toLocaleString()}`;
    },

    // ========================================
    // 支出データの操作
    // ========================================

    /**
     * すべての支出データを取得
     */
    getExpenses() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.EXPENSES);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('支出データの読み込みに失敗しました:', error);
            return [];
        }
    },

    /**
     * 特定月の支出データを取得
     */
    getExpensesByMonth(yearMonth) {
        const expenses = this.getExpenses();
        return expenses.filter(exp => exp.date.startsWith(yearMonth));
    },

    /**
     * 支出を追加
     */
    addExpense(expenseData) {
        const expenses = this.getExpenses();
        const newExpense = {
            id: this.generateId('exp'),
            amount: parseInt(expenseData.amount),
            category: expenseData.category,
            date: expenseData.date,
            timestamp: new Date().toISOString(),
            ...expenseData
        };
        expenses.push(newExpense);
        localStorage.setItem(this.STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
        return newExpense;
    },

    /**
     * 支出を更新
     */
    updateExpense(expenseId, updatedData) {
        const expenses = this.getExpenses();
        const index = expenses.findIndex(exp => exp.id === expenseId);
        if (index === -1) {
            throw new Error('支出が見つかりません');
        }
        expenses[index] = {
            ...expenses[index],
            ...updatedData,
            amount: parseInt(updatedData.amount),
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem(this.STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
        return expenses[index];
    },

    /**
     * 支出を削除
     */
    deleteExpense(expenseId) {
        const expenses = this.getExpenses();
        const filtered = expenses.filter(exp => exp.id !== expenseId);
        localStorage.setItem(this.STORAGE_KEYS.EXPENSES, JSON.stringify(filtered));
        return true;
    },

    /**
     * 特定月の支出合計を計算
     */
    getTotalExpensesByMonth(yearMonth) {
        const expenses = this.getExpensesByMonth(yearMonth);
        return expenses.reduce((sum, exp) => sum + exp.amount, 0);
    },

    /**
     * 特定月のカテゴリ別支出を集計
     */
    getExpensesByCategory(yearMonth) {
        const expenses = this.getExpensesByMonth(yearMonth);
        const summary = {};

        // すべてのカテゴリを初期化
        Object.keys(this.CATEGORIES).forEach(cat => {
            summary[cat] = 0;
        });

        // 支出を集計
        expenses.forEach(exp => {
            if (summary.hasOwnProperty(exp.category)) {
                summary[exp.category] += exp.amount;
            }
        });

        return summary;
    },

    // ========================================
    // 予算データの操作
    // ========================================

    /**
     * すべての予算データを取得
     */
    getAllBudgets() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.BUDGET);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('予算データの読み込みに失敗しました:', error);
            return {};
        }
    },

    /**
     * 特定月の予算を取得
     */
    getBudget(yearMonth) {
        const budgets = this.getAllBudgets();

        // 指定月の予算があればそれを返す
        if (budgets[yearMonth]) {
            return budgets[yearMonth];
        }

        // なければデフォルト予算を返す
        if (budgets['default']) {
            return budgets['default'];
        }

        return null;
    },

    /**
     * 現在の月の予算を取得
     */
    getCurrentBudget() {
        return this.getBudget(this.getCurrentYearMonth());
    },

    /**
     * 予算を設定
     */
    saveBudget(budgetData) {
        const budgets = this.getAllBudgets();
        const yearMonth = budgetData.yearMonth || this.getCurrentYearMonth();

        const newBudget = {
            amount: parseInt(budgetData.amount),
            calculation: budgetData.calculation || 'dynamic',
            applyRange: budgetData.applyRange || 'current',
            createdAt: new Date().toISOString()
        };

        if (budgetData.applyRange === 'future') {
            // 今月以降すべてに適用
            budgets[yearMonth] = newBudget;
            budgets['default'] = newBudget; // デフォルト設定として保存
        } else {
            // 今月のみ
            budgets[yearMonth] = newBudget;
        }

        localStorage.setItem(this.STORAGE_KEYS.BUDGET, JSON.stringify(budgets));
        return newBudget;
    },

    /**
     * 予算残高を計算
     */
    calculateBalance(yearMonth) {
        yearMonth = yearMonth || this.getCurrentYearMonth();
        const budget = this.getBudget(yearMonth);

        if (!budget) {
            return {
                budget: 0,
                spent: 0,
                balance: 0,
                dailyBudget: 0
            };
        }

        const spent = this.getTotalExpensesByMonth(yearMonth);
        const balance = budget.amount - spent;

        let dailyBudget = 0;
        if (budget.calculation === 'dynamic') {
            // 動的計算: 残高 ÷ 残り日数
            const remainingDays = this.getRemainingDaysInMonth(yearMonth);
            dailyBudget = remainingDays > 0 ? Math.floor(balance / remainingDays) : 0;
        } else {
            // 固定計算: 予算 ÷ 月の総日数
            const totalDays = this.getDaysInMonth(yearMonth);
            dailyBudget = Math.floor(budget.amount / totalDays);
        }

        return {
            budget: budget.amount,
            spent,
            balance,
            dailyBudget
        };
    },

    // ========================================
    // 貯蓄目標データの操作
    // ========================================

    /**
     * すべての貯蓄目標を取得
     */
    getGoals() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.GOALS);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('貯蓄目標データの読み込みに失敗しました:', error);
            return [];
        }
    },

    /**
     * 貯蓄目標を追加
     */
    addGoal(goalData) {
        const goals = this.getGoals();
        const newGoal = {
            id: this.generateId('goal'),
            name: goalData.name,
            amount: parseInt(goalData.amount),
            currentAmount: goalData.currentAmount || 0,
            autoSave: goalData.autoSave || false,
            monthlyAmount: goalData.autoSave ? parseInt(goalData.monthlyAmount) : 0,
            createdAt: new Date().toISOString(),
            achieved: false,
            achievedAt: null
        };
        goals.push(newGoal);
        localStorage.setItem(this.STORAGE_KEYS.GOALS, JSON.stringify(goals));
        return newGoal;
    },

    /**
     * 貯蓄目標を更新
     */
    updateGoal(goalId, updatedData) {
        const goals = this.getGoals();
        const index = goals.findIndex(goal => goal.id === goalId);
        if (index === -1) {
            throw new Error('目標が見つかりません');
        }

        goals[index] = {
            ...goals[index],
            ...updatedData,
            amount: updatedData.amount !== undefined ? parseInt(updatedData.amount) : goals[index].amount,
            currentAmount: updatedData.currentAmount !== undefined ? parseInt(updatedData.currentAmount) : goals[index].currentAmount,
            monthlyAmount: updatedData.monthlyAmount !== undefined ? parseInt(updatedData.monthlyAmount) : goals[index].monthlyAmount,
            updatedAt: new Date().toISOString()
        };

        // 達成判定（達成と未達成の両方を判定）
        if (goals[index].currentAmount >= goals[index].amount) {
            // 達成
            if (!goals[index].achieved) {
                goals[index].achieved = true;
                goals[index].achievedAt = new Date().toISOString();
            }
        } else {
            // 未達成に戻す
            if (goals[index].achieved) {
                goals[index].achieved = false;
                goals[index].achievedAt = null;
            }
        }

        localStorage.setItem(this.STORAGE_KEYS.GOALS, JSON.stringify(goals));
        return goals[index];
    },

    /**
     * 貯蓄目標を削除
     */
    deleteGoal(goalId) {
        const goals = this.getGoals();
        const filtered = goals.filter(goal => goal.id !== goalId);
        localStorage.setItem(this.STORAGE_KEYS.GOALS, JSON.stringify(filtered));
        return true;
    },

    /**
     * 目標に貯蓄額を追加
     */
    addToGoal(goalId, amount) {
        const goals = this.getGoals();
        const goal = goals.find(g => g.id === goalId);
        if (!goal) {
            throw new Error('目標が見つかりません');
        }

        const newAmount = goal.currentAmount + parseInt(amount);
        return this.updateGoal(goalId, { currentAmount: newAmount });
    },

    /**
     * 総貯蓄額を計算
     */
    getTotalSavings() {
        const goals = this.getGoals();
        return goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    },

    /**
     * 達成済み目標数を取得
     */
    getAchievedGoalsCount() {
        const goals = this.getGoals();
        return goals.filter(goal => goal.achieved).length;
    },

    /**
     * 今月の積立額を計算
     */
    getMonthlyAutoSaveAmount() {
        const goals = this.getGoals();
        return goals
            .filter(goal => goal.autoSave && !goal.achieved)
            .reduce((sum, goal) => sum + goal.monthlyAmount, 0);
    },

    // ========================================
    // 総貯蓄額プール（余剰金の管理）
    // ========================================

    /**
     * 総貯蓄額プールを取得
     */
    getSavingsPool() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.SAVINGS_POOL);
            return data ? JSON.parse(data) : { amount: 0, history: [] };
        } catch (error) {
            console.error('総貯蓄額プールの読み込みに失敗しました:', error);
            return { amount: 0, history: [] };
        }
    },

    /**
     * 総貯蓄額プールに金額を追加
     */
    addToSavingsPool(amount, note = '') {
        const pool = this.getSavingsPool();
        pool.amount += parseInt(amount);
        pool.history.push({
            id: this.generateId('pool'),
            amount: parseInt(amount),
            type: 'add',
            note: note,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem(this.STORAGE_KEYS.SAVINGS_POOL, JSON.stringify(pool));
        return pool;
    },

    /**
     * 総貯蓄額プールから金額を引く
     */
    withdrawFromSavingsPool(amount, note = '') {
        const pool = this.getSavingsPool();
        const withdrawAmount = parseInt(amount);

        if (pool.amount < withdrawAmount) {
            throw new Error('総貯蓄額が不足しています');
        }

        pool.amount -= withdrawAmount;
        pool.history.push({
            id: this.generateId('pool'),
            amount: withdrawAmount,
            type: 'withdraw',
            note: note,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem(this.STORAGE_KEYS.SAVINGS_POOL, JSON.stringify(pool));
        return pool;
    },

    /**
     * 総貯蓄額プールの残高を取得
     */
    getSavingsPoolBalance() {
        const pool = this.getSavingsPool();
        return pool.amount;
    },

    /**
     * 目標に総貯蓄額から入金（総貯蓄額を減らして目標に追加）
     */
    depositToGoalFromPool(goalId, amount) {
        const depositAmount = parseInt(amount);
        const pool = this.getSavingsPool();

        // 総貯蓄額の残高チェック
        if (pool.amount < depositAmount) {
            throw new Error('総貯蓄額が不足しています');
        }

        // 目標を取得
        const goals = this.getGoals();
        const goal = goals.find(g => g.id === goalId);
        if (!goal) {
            throw new Error('目標が見つかりません');
        }

        // 総貯蓄額から引く
        this.withdrawFromSavingsPool(depositAmount, `目標「${goal.name}」へ入金`);

        // 目標に追加
        return this.addToGoal(goalId, depositAmount);
    },

    /**
     * 目標から総貯蓄額へ返済（目標の金額を減らして総貯蓄額に戻す）
     */
    withdrawFromGoalToPool(goalId, amount) {
        const withdrawAmount = parseInt(amount);

        // 目標を取得
        const goals = this.getGoals();
        const goal = goals.find(g => g.id === goalId);
        if (!goal) {
            throw new Error('目標が見つかりません');
        }

        // 目標の現在額をチェック
        if (goal.currentAmount < withdrawAmount) {
            throw new Error('目標の入金額が不足しています');
        }

        // 目標から減らす
        const newAmount = goal.currentAmount - withdrawAmount;
        this.updateGoal(goalId, { currentAmount: newAmount });

        // 総貯蓄額に追加
        this.addToSavingsPool(withdrawAmount, `目標「${goal.name}」から返済`);

        return { goal: this.getGoals().find(g => g.id === goalId), pool: this.getSavingsPool() };
    },

    // ========================================
    // データの初期化・リセット
    // ========================================

    /**
     * すべてのデータをクリア（開発用）
     */
    clearAllData() {
        localStorage.removeItem(this.STORAGE_KEYS.EXPENSES);
        localStorage.removeItem(this.STORAGE_KEYS.BUDGET);
        localStorage.removeItem(this.STORAGE_KEYS.GOALS);
        localStorage.removeItem(this.STORAGE_KEYS.SAVINGS_POOL);
    },

    /**
     * サンプルデータをロード（開発・デモ用）
     */
    loadSampleData() {
        // サンプル予算
        this.saveBudget({
            amount: 50000,
            calculation: 'dynamic',
            applyRange: 'current'
        });

        // サンプル支出
        const today = this.formatDate(new Date());
        const yesterday = this.formatDate(new Date(Date.now() - 86400000));
        const twoDaysAgo = this.formatDate(new Date(Date.now() - 172800000));

        this.addExpense({ amount: 1200, category: 'food', date: today });
        this.addExpense({ amount: 650, category: 'food', date: yesterday });
        this.addExpense({ amount: 3800, category: 'entertainment', date: yesterday });
        this.addExpense({ amount: 220, category: 'transport', date: twoDaysAgo });

        // サンプル目標
        this.addGoal({
            name: '新しいノートPC',
            amount: 150000,
            currentAmount: 35000,
            autoSave: false
        });

        console.log('サンプルデータをロードしました');
    }
};

// グローバルに公開
window.MoneyPouchApp = MoneyPouchApp;
