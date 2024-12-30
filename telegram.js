// Импортируем конфигурацию
import { TELEGRAM_BOT_TOKEN } from './config.js';

class TelegramAuth {
    constructor() {
        this.username = '';
        this.isAuthenticated = false;
        this.initTelegramLogin();
    }

    initTelegramLogin() {
        // Добавляем скрипт Telegram Widget
        const script = document.createElement('script');
        script.src = 'https://telegram.org/js/telegram-widget.js?22';
        script.setAttribute('data-telegram-login', 'CookieClicket_Bot'); // Замените на имя вашего бота
        script.setAttribute('data-size', 'large');
        script.setAttribute('data-onauth', 'onTelegramAuth(user)');
        script.setAttribute('data-request-access', 'write');
        document.head.appendChild(script);

        // Добавляем обработчик авторизации
        window.onTelegramAuth = (user) => {
            this.handleTelegramAuth(user);
        };
    }

    handleTelegramAuth(user) {
        if (user && user.username) {
            this.username = user.username;
            this.isAuthenticated = true;
            
            // Обновляем имя пользователя на странице
            const usernameElement = document.querySelector('.username');
            if (usernameElement) {
                usernameElement.textContent = this.username;
            }

            // Сохраняем данные в localStorage
            localStorage.setItem('telegramUsername', this.username);
            
            // Вызываем событие для оповещения других частей приложения
            const event = new CustomEvent('telegramAuth', { detail: user });
            document.dispatchEvent(event);
        }
    }

    // Проверяем, был ли пользователь уже авторизован
    checkExistingAuth() {
        const savedUsername = localStorage.getItem('telegramUsername');
        if (savedUsername) {
            this.username = savedUsername;
            this.isAuthenticated = true;
            
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
        this.isAuthenticated = false;
        localStorage.removeItem('telegramUsername');
        
        const usernameElement = document.querySelector('.username');
        if (usernameElement) {
            usernameElement.textContent = 'Guest';
        }
    }
}

// Создаем и экспортируем экземпляр класса
const telegramAuth = new TelegramAuth();
export default telegramAuth;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    telegramAuth.checkExistingAuth();
});
