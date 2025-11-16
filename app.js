/**
 * MoneyPouch - データ管理モジュール（最適化版）
 * LocalStorageを使用してデータを永続化
 * キャッシュ層による高速化、バリデーション強化
 */

const MoneyPouchApp = {
    // LocalStorageのキー（CONSTANTS から取得）
    get STORAGE_KEYS() {
        return CONSTANTS.STORAGE_KEYS;
    },

    // カテゴリ定義（CONSTANTS から取得）
    get CATEGORIES() {
        return CONSTANTS.CATEGORIES;
    },

    // ========================================
    // キャッシュ層
    // ========================================
    _cache: {
        expenses: null,
        budgets: null,
        goals: null,
        savingsPool: null
    },

    /**
     * キャッシュをクリア
     */
    clearCache(key = null) {
        if (key) {
            this._cache[key] = null;
        } else {
            this._cache = {
                expenses: null,
                budgets: null,
                goals: null,
                savingsPool: null
            };
        }
    },

    // ========================================
    // バリデーション
    // ========================================

    /**
     * 金額をバリデーション
     */
    validateAmount(amount) {
        const numAmount = typeof amount === 'string' ? parseInt(amount, 10) : amount;

        if (isNaN(numAmount) || numAmount < CONSTANTS.MIN_AMOUNT) {
            throw new Error(CONSTANTS.ERRORS.INVALID_AMOUNT);
        }

        if (numAmount > CONSTANTS.MAX_AMOUNT) {
            throw new Error(CONSTANTS.ERRORS.AMOUNT_TOO_LARGE);
        }

        return numAmount;
    },

    /**
     * カテゴリをバリデーション
     */
    validateCategory(category) {
        if (!this.CATEGORIES.hasOwnProperty(category)) {
            throw new Error('無効なカテゴリです');
        }
        return category;
    },

    /**
     * 日付をバリデーション
     */
    validateDate(dateStr) {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            throw new Error('無効な日付です');
        }
        return dateStr;
    },

    // ========================================
    // ユーティリティ
    // ========================================

    /**
     * ユニークIDを生成（substr を slice に変更）
     */
    generateId(prefix) {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    },

    /**
     * 現在の年月を取得 (YYYY-MM形式)
     */
    getCurrentYearMonth() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    },

    /**
     * 月の日数を取得
     */
    getDaysInMonth(yearMonth) {
        const [year, month] = yearMonth.split('-').map(Number);
        return new Date(year, month, 0).getDate();
    },

    /**
     * 月の残り日数を取得
     */
    getRemainingDaysInMonth(yearMonth) {
        if (yearMonth) {
            const [year, month] = yearMonth.split('-').map(Number);
            const currentYearMonth = this.getCurrentYearMonth();

            if (yearMonth < currentYearMonth) {
                return 0;
            }

            if (yearMonth > currentYearMonth) {
                return this.getDaysInMonth(yearMonth);
            }
        }

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const lastDay = new Date(year, month + 1, 0).getDate();
        const today = now.getDate();
        return lastDay - today + 1;
    },

    /**
     * 日付を YYYY-MM-DD 形式に変換
     */
    formatDate(date) {
        // 既にYYYY-MM-DD形式の文字列の場合はそのまま返す（タイムゾーン問題を回避）
        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
        }

        // Dateオブジェクトの場合
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * 日付を M月D日形式に変換
     */
    formatDateJapanese(dateStr) {
        const [year, month, day] = dateStr.split('-');
        return `${parseInt(month, 10)}月${parseInt(day, 10)}日`;
    },

    /**
     * 金額をフォーマット
     */
    formatAmount(amount) {
        const numAmount = typeof amount === 'string' ? parseInt(amount, 10) : amount;
        const validAmount = isNaN(numAmount) ? 0 : numAmount;
        return `¥${validAmount.toLocaleString()}`;
    },

    // ========================================
    // 支出データの操作
    // ========================================

    /**
     * すべての支出データを取得（キャッシュ対応）
     */
    getExpenses() {
        if (this._cache.expenses !== null) {
            return this._cache.expenses;
        }

        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.EXPENSES);
            this._cache.expenses = data ? JSON.parse(data) : [];
            return this._cache.expenses;
        } catch (error) {
            ErrorHandler.log(error, CONSTANTS.ERRORS.STORAGE_ERROR);
            return [];
        }
    },

    /**
     * 支出データを保存（キャッシュ更新）
     */
    _saveExpenses(expenses) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
            this._cache.expenses = expenses;
        } catch (error) {
            ErrorHandler.log(error, CONSTANTS.ERRORS.SAVE_ERROR);
            throw error;
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
            amount: this.validateAmount(expenseData.amount),
            category: this.validateCategory(expenseData.category),
            date: this.validateDate(expenseData.date),
            timestamp: new Date().toISOString()
        };
        expenses.push(newExpense);
        this._saveExpenses(expenses);
        return newExpense;
    },

    /**
     * 支出を更新
     */
    updateExpense(expenseId, updatedData) {
        const expenses = this.getExpenses();
        const index = expenses.findIndex(exp => exp.id === expenseId);
        if (index === -1) {
            throw new Error(CONSTANTS.ERRORS.EXPENSE_NOT_FOUND);
        }
        expenses[index] = {
            ...expenses[index],
            amount: this.validateAmount(updatedData.amount),
            category: this.validateCategory(updatedData.category),
            date: this.validateDate(updatedData.date),
            updatedAt: new Date().toISOString()
        };
        this._saveExpenses(expenses);
        return expenses[index];
    },

    /**
     * 支出を削除
     */
    deleteExpense(expenseId) {
        const expenses = this.getExpenses();
        const filtered = expenses.filter(exp => exp.id !== expenseId);
        this._saveExpenses(filtered);
        return true;
    },

    /**
     * 特定月の支出合計を計算
     */
    getTotalExpensesByMonth(yearMonth) {
        const expenses = this.getExpensesByMonth(yearMonth);
        return expenses.reduce((sum, exp) => sum + parseInt(exp.amount || 0, 10), 0);
    },

    /**
     * 特定日の支出合計を計算
     */
    getTotalExpensesByDate(date) {
        const expenses = this.getExpenses();
        const dateExpenses = expenses.filter(exp => exp.date === date);
        return dateExpenses.reduce((sum, exp) => sum + parseInt(exp.amount || 0, 10), 0);
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
                summary[exp.category] += parseInt(exp.amount || 0, 10);
            }
        });

        return summary;
    },

    // ========================================
    // 予算データの操作
    // ========================================

    /**
     * すべての予算データを取得（キャッシュ対応）
     */
    getAllBudgets() {
        if (this._cache.budgets !== null) {
            return this._cache.budgets;
        }

        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.BUDGET);
            this._cache.budgets = data ? JSON.parse(data) : {};
            return this._cache.budgets;
        } catch (error) {
            ErrorHandler.log(error, CONSTANTS.ERRORS.STORAGE_ERROR);
            return {};
        }
    },

    /**
     * 予算データを保存（キャッシュ更新）
     */
    _saveBudgets(budgets) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.BUDGET, JSON.stringify(budgets));
            this._cache.budgets = budgets;
        } catch (error) {
            ErrorHandler.log(error, CONSTANTS.ERRORS.SAVE_ERROR);
            throw error;
        }
    },

    /**
     * 特定月の予算を取得
     */
    getBudget(yearMonth) {
        const budgets = this.getAllBudgets();

        if (budgets[yearMonth]) {
            return budgets[yearMonth];
        }

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
            amount: this.validateAmount(budgetData.amount),
            calculation: budgetData.calculation || 'dynamic',
            applyRange: budgetData.applyRange || 'current',
            createdAt: new Date().toISOString()
        };

        if (budgetData.applyRange === 'future') {
            budgets[yearMonth] = newBudget;
            budgets['default'] = newBudget;
        } else {
            budgets[yearMonth] = newBudget;
        }

        this._saveBudgets(budgets);
        return newBudget;
    },

    /**
     * 今日のスタート予算を取得・保存
     */
    getTodayBudgetStart(yearMonth, balance, remainingDays, calculationType) {
        const today = this.formatDate(new Date());

        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.DAILY_BUDGET_START);
            const dailyBudgetData = data ? JSON.parse(data) : {};

            // 今日のデータが既に存在するか確認
            if (dailyBudgetData[today]) {
                return dailyBudgetData[today].startBudget;
            }

            // 新しく計算
            let startBudget = 0;
            if (calculationType === 'dynamic') {
                startBudget = remainingDays > 0 ? Math.floor(balance / remainingDays) : 0;
            } else {
                const totalDays = this.getDaysInMonth(yearMonth);
                startBudget = Math.floor(balance / totalDays);
            }

            // 保存
            dailyBudgetData[today] = {
                date: today,
                startBudget: startBudget,
                calculatedAt: new Date().toISOString()
            };

            // 古いデータを削除（30日以上前）
            const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
            Object.keys(dailyBudgetData).forEach(date => {
                if (new Date(date) < thirtyDaysAgo) {
                    delete dailyBudgetData[date];
                }
            });

            localStorage.setItem(this.STORAGE_KEYS.DAILY_BUDGET_START, JSON.stringify(dailyBudgetData));
            return startBudget;
        } catch (error) {
            ErrorHandler.log(error, 'スタート予算の取得に失敗しました');
            // エラーの場合は通常の計算を返す
            if (calculationType === 'dynamic') {
                return remainingDays > 0 ? Math.floor(balance / remainingDays) : 0;
            } else {
                const totalDays = this.getDaysInMonth(yearMonth);
                return Math.floor(balance / totalDays);
            }
        }
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
        const remainingDays = this.getRemainingDaysInMonth(yearMonth);

        // 今日のスタート予算を取得
        const startBudget = this.getTodayBudgetStart(yearMonth, balance, remainingDays, budget.calculation);

        // 今日の支出を取得
        const today = this.formatDate(new Date());
        const todaySpent = this.getTotalExpensesByDate(today);

        // 今日の予算 = スタート予算 - 今日の支出
        const dailyBudget = Math.max(0, startBudget - todaySpent);

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
     * すべての貯蓄目標を取得（キャッシュ対応）
     */
    getGoals() {
        if (this._cache.goals !== null) {
            return this._cache.goals;
        }

        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.GOALS);
            this._cache.goals = data ? JSON.parse(data) : [];
            return this._cache.goals;
        } catch (error) {
            ErrorHandler.log(error, CONSTANTS.ERRORS.STORAGE_ERROR);
            return [];
        }
    },

    /**
     * 貯蓄目標を保存（キャッシュ更新）
     */
    _saveGoals(goals) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.GOALS, JSON.stringify(goals));
            this._cache.goals = goals;
        } catch (error) {
            ErrorHandler.log(error, CONSTANTS.ERRORS.SAVE_ERROR);
            throw error;
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
            amount: this.validateAmount(goalData.amount),
            currentAmount: goalData.currentAmount || 0,
            autoSave: goalData.autoSave || false,
            monthlyAmount: goalData.autoSave ? this.validateAmount(goalData.monthlyAmount) : 0,
            createdAt: new Date().toISOString(),
            achieved: false,
            achievedAt: null
        };
        goals.push(newGoal);
        this._saveGoals(goals);
        return newGoal;
    },

    /**
     * 貯蓄目標を更新
     */
    updateGoal(goalId, updatedData) {
        const goals = this.getGoals();
        const index = goals.findIndex(goal => goal.id === goalId);
        if (index === -1) {
            throw new Error(CONSTANTS.ERRORS.GOAL_NOT_FOUND);
        }

        goals[index] = {
            ...goals[index],
            ...updatedData,
            amount: updatedData.amount !== undefined ? this.validateAmount(updatedData.amount) : goals[index].amount,
            currentAmount: updatedData.currentAmount !== undefined ? this.validateAmount(updatedData.currentAmount) : goals[index].currentAmount,
            monthlyAmount: updatedData.monthlyAmount !== undefined ? this.validateAmount(updatedData.monthlyAmount) : goals[index].monthlyAmount,
            updatedAt: new Date().toISOString()
        };

        // 達成判定
        if (goals[index].currentAmount >= goals[index].amount) {
            if (!goals[index].achieved) {
                goals[index].achieved = true;
                goals[index].achievedAt = new Date().toISOString();
            }
        } else {
            if (goals[index].achieved) {
                goals[index].achieved = false;
                goals[index].achievedAt = null;
            }
        }

        this._saveGoals(goals);
        return goals[index];
    },

    /**
     * 貯蓄目標を削除
     */
    deleteGoal(goalId) {
        const goals = this.getGoals();
        const filtered = goals.filter(goal => goal.id !== goalId);
        this._saveGoals(filtered);
        return true;
    },

    /**
     * 目標に貯蓄額を追加
     */
    addToGoal(goalId, amount) {
        const goals = this.getGoals();
        const goal = goals.find(g => g.id === goalId);
        if (!goal) {
            throw new Error(CONSTANTS.ERRORS.GOAL_NOT_FOUND);
        }

        const newAmount = goal.currentAmount + this.validateAmount(amount);
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
     * 総貯蓄額プールを取得（キャッシュ対応）
     */
    getSavingsPool() {
        if (this._cache.savingsPool !== null) {
            return this._cache.savingsPool;
        }

        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.SAVINGS_POOL);
            this._cache.savingsPool = data ? JSON.parse(data) : { amount: 0, history: [] };
            return this._cache.savingsPool;
        } catch (error) {
            ErrorHandler.log(error, CONSTANTS.ERRORS.STORAGE_ERROR);
            return { amount: 0, history: [] };
        }
    },

    /**
     * 総貯蓄額プールを保存（キャッシュ更新）
     */
    _saveSavingsPool(pool) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.SAVINGS_POOL, JSON.stringify(pool));
            this._cache.savingsPool = pool;
        } catch (error) {
            ErrorHandler.log(error, CONSTANTS.ERRORS.SAVE_ERROR);
            throw error;
        }
    },

    /**
     * 総貯蓄額プールに金額を追加
     */
    addToSavingsPool(amount, note = '') {
        const pool = this.getSavingsPool();
        const validAmount = this.validateAmount(amount);
        pool.amount += validAmount;
        pool.history.push({
            id: this.generateId('pool'),
            amount: validAmount,
            type: 'add',
            note: note,
            timestamp: new Date().toISOString()
        });
        this._saveSavingsPool(pool);
        return pool;
    },

    /**
     * 総貯蓄額プールから金額を引く
     */
    withdrawFromSavingsPool(amount, note = '') {
        const pool = this.getSavingsPool();
        const withdrawAmount = this.validateAmount(amount);

        if (pool.amount < withdrawAmount) {
            throw new Error(CONSTANTS.ERRORS.INSUFFICIENT_POOL);
        }

        pool.amount -= withdrawAmount;
        pool.history.push({
            id: this.generateId('pool'),
            amount: withdrawAmount,
            type: 'withdraw',
            note: note,
            timestamp: new Date().toISOString()
        });
        this._saveSavingsPool(pool);
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
     * 目標に総貯蓄額から入金
     */
    depositToGoalFromPool(goalId, amount) {
        const depositAmount = this.validateAmount(amount);
        const pool = this.getSavingsPool();

        if (pool.amount < depositAmount) {
            throw new Error(CONSTANTS.ERRORS.INSUFFICIENT_POOL);
        }

        const goals = this.getGoals();
        const goal = goals.find(g => g.id === goalId);
        if (!goal) {
            throw new Error(CONSTANTS.ERRORS.GOAL_NOT_FOUND);
        }

        this.withdrawFromSavingsPool(depositAmount, `目標「${goal.name}」へ入金`);
        return this.addToGoal(goalId, depositAmount);
    },

    /**
     * 目標から総貯蓄額へ返済
     */
    withdrawFromGoalToPool(goalId, amount) {
        const withdrawAmount = this.validateAmount(amount);

        const goals = this.getGoals();
        const goal = goals.find(g => g.id === goalId);
        if (!goal) {
            throw new Error(CONSTANTS.ERRORS.GOAL_NOT_FOUND);
        }

        if (goal.currentAmount < withdrawAmount) {
            throw new Error(CONSTANTS.ERRORS.INSUFFICIENT_GOAL);
        }

        const newAmount = goal.currentAmount - withdrawAmount;
        this.updateGoal(goalId, { currentAmount: newAmount });
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
        this.clearCache();
    },

    /**
     * サンプルデータをロード（開発・デモ用）
     */
    loadSampleData() {
        this.saveBudget({
            amount: 50000,
            calculation: 'dynamic',
            applyRange: 'current'
        });

        const today = this.formatDate(new Date());
        const yesterday = this.formatDate(new Date(Date.now() - 86400000));
        const twoDaysAgo = this.formatDate(new Date(Date.now() - 172800000));

        this.addExpense({ amount: 1200, category: 'food', date: today });
        this.addExpense({ amount: 650, category: 'food', date: yesterday });
        this.addExpense({ amount: 3800, category: 'entertainment', date: yesterday });
        this.addExpense({ amount: 220, category: 'transport', date: twoDaysAgo });

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
