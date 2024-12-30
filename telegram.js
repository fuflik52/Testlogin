// Импортируем конфигурацию
// import { TELEGRAM_BOT_TOKEN } from './config.js';

// Инициализируем Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();

class TelegramAuth {
    constructor() {
        this.username = '';
        this.telegramId = '';
        this.isAuthenticated = false;
        this.purchasedItems = [];
        this.balance = 0;
        this.energy = 100;
        this.initTelegramAuth();
    }

    initTelegramAuth() {
        // Получаем данные пользователя из Telegram Web App
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            const user = tg.initDataUnsafe.user;
            this.handleTelegramAuth(user);
        }

        // Логируем события Telegram Web App
        console.log('[Telegram.WebApp] Initialized');
        tg.onEvent('viewportChanged', () => {
            console.log('[Telegram.WebApp] Viewport changed');
        });
    }

    handleTelegramAuth(user) {
        if (user && user.id) {
            this.username = user.username || user.first_name;
            this.telegramId = user.id;
            this.isAuthenticated = true;
            
            // Загружаем сохраненные данные
            this.loadUserData();
            
            // Обновляем имя пользователя на странице
            const usernameElement = document.querySelector('.username');
            if (usernameElement) {
                usernameElement.textContent = this.username;
            }

            // Сохраняем данные в localStorage
            this.saveUserData();
            
            console.log('[Telegram.WebApp] User authenticated:', this.username);
        }
    }

    saveUserData() {
        const userData = {
            username: this.username,
            telegramId: this.telegramId,
            purchasedItems: this.purchasedItems,
            balance: this.balance,
            energy: this.energy
        };
        localStorage.setItem(`userData_${this.telegramId}`, JSON.stringify(userData));
    }

    loadUserData() {
        const userData = localStorage.getItem(`userData_${this.telegramId}`);
        if (userData) {
            const data = JSON.parse(userData);
            this.purchasedItems = data.purchasedItems || [];
            this.balance = data.balance || 0;
            this.energy = data.energy || 100;
            window.purchasedCards = this.purchasedItems;
            
            // Обновляем значения на странице
            const balanceElement = document.querySelector('.balance');
            const progressText = document.querySelector('.progress-text');
            const progressBar = document.querySelector('.progress');
            
            if (balanceElement) balanceElement.textContent = Math.floor(this.balance);
            if (progressText) progressText.textContent = `${Math.floor(this.energy)}/100`;
            if (progressBar) progressBar.style.width = `${this.energy}%`;
        }
    }

    addPurchasedItem(item) {
        this.purchasedItems.push(item);
        this.saveUserData();
    }

    saveBalance(balance) {
        this.balance = balance;
        this.saveUserData();
    }

    saveEnergy(energy) {
        this.energy = energy;
        this.saveUserData();
    }

    getTimeAwayEarnings() {
        const currentTime = Date.now();
        const timeAway = (currentTime - this.lastCollectTime) / 1000; // в секундах
        const hourlyRate = window.totalHourlyRate || 0;
        const earnings = (hourlyRate / 3600) * timeAway;
        return earnings;
    }

    // Проверяем, был ли пользователь уже авторизован
    checkExistingAuth() {
        const savedData = localStorage.getItem(`userData_${this.telegramId}`);
        if (savedData) {
            const data = JSON.parse(savedData);
            this.username = data.username;
            this.telegramId = data.telegramId;
            this.isAuthenticated = true;
            this.purchasedItems = data.purchasedItems || [];
            this.balance = data.balance || 0;
            this.energy = data.energy || 100;
            
            const usernameElement = document.querySelector('.username');
            if (usernameElement) {
                usernameElement.textContent = this.username;
            }
            return true;
        }
        return false;
    }

    // Выход из аккаунта
    logout() {
        this.username = '';
        this.telegramId = '';
        this.isAuthenticated = false;
        this.purchasedItems = [];
        this.balance = 0;
        this.energy = 100;
        localStorage.removeItem(`userData_${this.telegramId}`);
        
        const usernameElement = document.querySelector('.username');
        if (usernameElement) {
            usernameElement.textContent = 'Guest';
        }
    }
}

// Создаем и экспортируем экземпляр класса
window.telegramAuth = new TelegramAuth();

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.telegramAuth.checkExistingAuth();
});
