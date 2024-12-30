// Telegram functionality
const TELEGRAM_BOT_NAME = 'YOUR_BOT_NAME'; // Замените на имя вашего бота

function initTelegramLogin() {
    // Проверяем сохраненное имя пользователя
    const savedUsername = localStorage.getItem('telegramUsername');
    if (savedUsername) {
        updateUsername(savedUsername);
        return;
    }

    // Добавляем скрипт Telegram Widget
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', TELEGRAM_BOT_NAME);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    document.head.appendChild(script);
}

// Функция обновления имени пользователя
function updateUsername(username) {
    const usernameElement = document.querySelector('.username');
    if (usernameElement) {
        usernameElement.textContent = username;
    }
}

// Обработчик авторизации Telegram
window.onTelegramAuth = function(user) {
    if (user && user.username) {
        localStorage.setItem('telegramUsername', user.username);
        updateUsername(user.username);
    }
};

// Main game functionality
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем Telegram логин
    initTelegramLogin();

    // Navigation handling
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Main circle click handling
    const mainCircle = document.querySelector('.main-circle');
    const clickInfo = document.querySelector('.click-info');
    const balanceElement = document.querySelector('.balance');
    const progressElement = document.querySelector('.progress');
    const progressTextElement = document.querySelector('.progress-text');
    const rewardFrame = document.querySelector('.reward-frame');
    const rewardValue = document.querySelector('.reward-value');
    const collectBtn = document.querySelector('.collect-btn');
    
    let energy = 100;
    let balance = 0;
    let isAnimating = false;
    let lastActivityTime = Date.now();
    let rewardShown = false;
    let accumulatedReward = 0;

    // Функция обновления энергии
    function updateEnergy(value) {
        energy = Math.min(100, Math.max(0, value));
        const width = (energy / 100) * 100;
        progressElement.style.width = width + '%';
        progressTextElement.textContent = Math.floor(energy) + '/100';
        
        // Обновляем состояние кнопки
        if (energy <= 0) {
            mainCircle.classList.add('disabled');
        } else {
            mainCircle.classList.remove('disabled');
        }
    }

    // Автоматическое пополнение энергии
    setInterval(() => {
        if (energy < 100) {
            updateEnergy(energy + 0.5);
        }
    }, 1000);

    // Проверка неактивности и накопление награды
    setInterval(() => {
        const currentTime = Date.now();
        const inactiveTime = (currentTime - lastActivityTime) / 1000; // в секундах

        if (inactiveTime > 10) {
            accumulatedReward = Math.floor(inactiveTime * 0.1 * 100) / 100; // 0.1 за секунду
            rewardValue.textContent = accumulatedReward.toFixed(2);
            if (!rewardShown) {
                rewardFrame.style.display = 'block';
                rewardShown = true;
            }
        }
    }, 1000);

    // Обработка клика по кнопке Collect
    collectBtn.addEventListener('click', () => {
        balance += accumulatedReward;
        balanceElement.textContent = balance.toFixed(2);
        rewardFrame.style.display = 'none';
        rewardShown = false;
        lastActivityTime = Date.now();
        accumulatedReward = 0;
    });

    // Обработка клика по основной кнопке
    mainCircle.addEventListener('click', () => {
        if (energy <= 0) return;
        
        lastActivityTime = Date.now();
        accumulatedReward = 0;

        // Обновляем баланс немедленно
        balance++;
        balanceElement.textContent = balance.toFixed(2);

        // Обновляем энергию
        updateEnergy(energy - 1);

        // Показываем анимацию
        if (!isAnimating) {
            isAnimating = true;
            clickInfo.classList.remove('show');
            void clickInfo.offsetWidth;
            clickInfo.classList.add('show');
            
            setTimeout(() => {
                isAnimating = false;
            }, 300);
        }
    });
});
