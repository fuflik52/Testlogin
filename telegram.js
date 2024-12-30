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
        this.hourlyRate = 10;
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
            
            console.log('[Telegram.WebApp] User authenticated:', this.username);
        }
    }

    saveUserData() {
        if (!this.isAuthenticated) return;
        
        const userData = {
            username: this.username,
            telegramId: this.telegramId,
            purchasedItems: window.purchasedCards || [],
            balance: window.clickCount || 0,
            energy: window.energy || 100,
            hourlyRate: window.totalHourlyRate || 10
        };
        localStorage.setItem(`userData_${this.telegramId}`, JSON.stringify(userData));
        console.log('[Telegram.WebApp] Data saved:', userData);
    }

    loadUserData() {
        if (!this.isAuthenticated) return null;
        
        const userData = localStorage.getItem(`userData_${this.telegramId}`);
        if (userData) {
            const data = JSON.parse(userData);
            this.purchasedItems = data.purchasedItems || [];
            this.balance = Number(data.balance) || 0;
            this.energy = Number(data.energy) || 100;
            this.hourlyRate = Number(data.hourlyRate) || 10;
            
            // Синхронизируем с глобальным состоянием
            window.purchasedCards = this.purchasedItems;
            window.totalHourlyRate = this.hourlyRate;
            window.clickCount = this.balance;
            
            console.log('[Telegram.WebApp] Data loaded:', data);
            return data;
        }
        return null;
    }

    addPurchasedItem(item) {
        if (!this.isAuthenticated) return;
        
        // Проверяем, нет ли уже такой карточки
        if (!this.purchasedItems.some(card => card.id === item.id)) {
            this.purchasedItems.push(item);
            window.purchasedCards = this.purchasedItems;
            this.saveUserData();
            console.log('[Telegram.WebApp] Item purchased:', item);
        }
    }

    saveBalance(balance) {
        this.balance = Number(balance);
        window.clickCount = this.balance; // Сохраняем в глобальную переменную
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
