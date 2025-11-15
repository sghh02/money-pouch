/**
 * FOUC対策: テーマを即座に適用
 * このスクリプトはHTMLの<head>内で即座に実行される必要があります
 */
(function() {
    'use strict';

    try {
        const theme = localStorage.getItem('moneypouch_theme') || 'default';
        document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
        // localStorageが使えない環境ではデフォルトテーマを適用
        document.documentElement.setAttribute('data-theme', 'default');
    }
})();
