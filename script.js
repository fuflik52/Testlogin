document.addEventListener('DOMContentLoaded', function() {
    const mainCircle = document.querySelector('.main-circle');
    const gameArea = document.querySelector('.game-area');
    const progressBar = document.querySelector('.progress');
    const progressText = document.querySelector('.progress-text');
    const balanceElement = document.querySelector('.balance');
    const rateElement = document.querySelector('.user-info .rate');
    const container = document.querySelector('.container');
    let clickCount = 0;
    let energy = 100;
    const maxEnergy = 100;
    const energyPerClick = 1;
    const energyRegenRate = 1;
    window.totalHourlyRate = 10;
    window.purchasedCards = []; // Массив для хранения купленных карт

    // Обновление баланса каждую секунду
    setInterval(() => {
        const increment = window.totalHourlyRate / 3600;
        clickCount += increment;
        balanceElement.textContent = Math.floor(clickCount);
        // Сохраняем текущий баланс
        if (window.telegramAuth && window.telegramAuth.isAuthenticated) {
            window.telegramAuth.saveBalance(clickCount);
        }
    }, 1000);

    // Восстановление энергии каждую секунду
    setInterval(() => {
        if (energy < maxEnergy) {
            energy = Math.min(maxEnergy, energy + energyRegenRate);
            updateEnergy();
            // Сохраняем текущую энергию
            if (window.telegramAuth && window.telegramAuth.isAuthenticated) {
                window.telegramAuth.saveEnergy(energy);
            }
        }
    }, 1000);

    function updateEnergy() {
        progressText.textContent = `${Math.floor(energy)}/${maxEnergy}`;
        progressBar.style.width = `${(energy / maxEnergy) * 100}%`;
        
        if (energy <= 0) {
            mainCircle.classList.add('disabled');
        } else {
            mainCircle.classList.remove('disabled');
        }
    }

    // Функция для создания и показа всплывающего окна с заработком
    function showEarningsPopup(amount) {
        const bottomNav = document.querySelector('.bottom-nav');
        const popupDiv = document.createElement('div');
        popupDiv.className = 'flex flex-col items-center bg-[#262626] rounded-lg w-full mb-2 earnings-popup';
        popupDiv.style.position = 'fixed';
        popupDiv.style.bottom = '70px';
        popupDiv.style.left = '0';
        popupDiv.style.right = '0';
        popupDiv.style.margin = '0 15px';
        popupDiv.style.zIndex = '1000';
        
        popupDiv.innerHTML = `
            <div class="flex items-center gap-2 p-3">
                <img alt="Token" src="images/leaf-popup.png" width="24" height="24">
                <span class="text-white text-2xl font-semibold">${amount.toFixed(2)}</span>
            </div>
            <p class="text-gray-300 mb-2 text-lg">Received for time away</p>
            <button class="collect-btn bg-[#2BBE56] text-white w-full py-2 rounded-lg mb-2">Collect</button>
        `;

        document.body.insertBefore(popupDiv, bottomNav);

        // Обработчик для кнопки Collect
        const collectBtn = popupDiv.querySelector('.collect-btn');
        collectBtn.addEventListener('click', () => {
            clickCount += amount;
            balanceElement.textContent = Math.floor(clickCount);
            window.telegramAuth.updateLastCollectTime();
            popupDiv.remove();
        });
    }

    // Проверяем заработок при загрузке страницы
    if (window.telegramAuth && window.telegramAuth.isAuthenticated) {
        // const earnings = window.telegramAuth.getTimeAwayEarnings();
        // if (earnings > 0) {
        //     showEarningsPopup(earnings);
        // }
    }

    // Обработчик видимости страницы
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && window.telegramAuth && window.telegramAuth.isAuthenticated) {
            // const earnings = window.telegramAuth.getTimeAwayEarnings();
            // if (earnings > 0) {
            //     showEarningsPopup(earnings);
            // }
        }
    });

    // Добавляем обработку покупки карточки
    function handleCardPurchase(card) {
        if (window.telegramAuth) {
            window.telegramAuth.addPurchasedItem(card);
            window.purchasedCards = window.telegramAuth.purchasedItems;
            window.totalHourlyRate += card.hourlyRate;
        }
    }

    // Создаем контейнеры для разделов
    const homeSection = document.createElement('div');
    homeSection.className = 'home-section';
    homeSection.appendChild(gameArea);
    homeSection.appendChild(document.querySelector('.progress-container'));
    container.insertBefore(homeSection, document.querySelector('.bottom-nav'));

    const cardsSection = createCardsSection();
    const frensSection = createFrensSection();
    const miningSection = createMiningSection();
    const rewardSection = createRewardSection();

    // Показываем только домашнюю страницу изначально
    cardsSection.style.display = 'none';
    frensSection.style.display = 'none';
    miningSection.style.display = 'none';
    rewardSection.style.display = 'none';

    const sections = {
        'home': homeSection,
        'cards': cardsSection,
        'frens': frensSection,
        'mining': miningSection,
        'reward': rewardSection
    };

    // Обработка клика по навигации
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            
            // Убираем активный класс со всех пунктов меню
            document.querySelectorAll('.nav-item').forEach(navItem => {
                navItem.classList.remove('active');
            });
            
            // Добавляем активный класс выбранному пункту
            item.classList.add('active');
            
            // Скрываем все секции
            Object.values(sections).forEach(section => {
                if (section) section.style.display = 'none';
            });
            
            // Показываем выбранную секцию
            if (sections[section]) {
                sections[section].style.display = 'block';
            }
        });
    });

    mainCircle.addEventListener('click', function(e) {
        if (energy <= 0) return;

        energy = Math.max(0, energy - energyPerClick);
        updateEnergy();

        const clickInfo = document.createElement('div');
        clickInfo.className = 'click-info';
        
        const icon = document.createElement('img');
        icon.src = 'https://i.postimg.cc/FFx7T4Bh/image.png';
        icon.className = 'click-icon';
        clickInfo.appendChild(icon);
        
        const value = document.createElement('span');
        value.className = 'click-value';
        value.textContent = '+1';
        clickInfo.appendChild(value);

        clickInfo.style.position = 'absolute';
        clickInfo.style.left = '50%';
        clickInfo.style.top = '40%';
        clickInfo.style.transform = 'translateX(-50%)';

        gameArea.appendChild(clickInfo);

        requestAnimationFrame(() => {
            clickInfo.classList.add('show');
        });

        setTimeout(() => {
            gameArea.removeChild(clickInfo);
        }, 800);

        clickCount++;
        balanceElement.textContent = Math.floor(clickCount);
        // Сохраняем баланс после клика
        if (window.telegramAuth && window.telegramAuth.isAuthenticated) {
            window.telegramAuth.saveBalance(clickCount);
        }
    });

    function createCardsSection() {
        const section = document.createElement('div');
        section.className = 'cards-section';
        
        // Создаем переключатель подразделов
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'tabs-container';
        tabsContainer.innerHTML = `
            <div class="bg-[#1A1B1A] p-1 rounded-xl flex gap-2 mb-3">
                <button class="tab-btn active flex-1 py-3 rounded-lg text-center transition-all duration-300 bg-[#262626] text-white" data-tab="new">New Cards</button>
                <button class="tab-btn flex-1 py-3 rounded-lg text-center transition-all duration-300 text-white/50" data-tab="owned">Your Cards</button>
            </div>
        `;

        // Создаем контейнеры для карточек
        const newCardsContainer = document.createElement('div');
        newCardsContainer.className = 'cards-container';

        const ownedCardsContainer = document.createElement('div');
        ownedCardsContainer.className = 'cards-container';
        ownedCardsContainer.style.display = 'none';

        const cardsData = [
            {
                id: 1,
                image: "https://res.cloudinary.com/dib4woqge/image/upload/v1735300135/1000000472_wu48p4.png",
                title: "Начало пути",
                description: "Коала только начинает своё путешествие. Даёт 120 эвкалипта в час",
                price: "10K",
                perHour: 120
            },
            {
                id: 2,
                image: "https://i.postimg.cc/sxpJmh0S/image.png",
                title: "Первые деньги",
                description: "Коала заработала свои первые деньги. Продолжаем в том же духе. Добавляет 350 эвкалипта в час",
                price: "25K",
                perHour: 350
            },
            {
                id: 3,
                image: "https://i.postimg.cc/pVwWnFHC/image.png",
                title: "Коала на отдыхе",
                description: "После первых заработанных денег можно хорошенько отдохнуть. Добавляет 800 эвкалипта в час",
                price: "50K",
                perHour: 800
            },
            {
                id: 4,
                image: "https://i.postimg.cc/nLCgk3KD/image.png",
                title: "Снежные забавы",
                description: "Наступила зима, а значит можно хорошо порезвиться в снежки. Но не забываем про прибыль в 1800 эвкалипта в час",
                price: "100K",
                perHour: 1800
            }
        ];

        // Функция создания карточки
        function createCardElement(card, isOwned = false) {
            const cardElement = document.createElement('div');
            cardElement.className = 'card-item';
            cardElement.innerHTML = `
                <div class="card-image">
                    <img src="${card.image}" alt="${card.title}" class="card-img">
                </div>
                <div class="card-title">${card.title}</div>
                <div class="card-description">${card.description}</div>
                <div class="card-footer">
                    ${isOwned ? 
                        '<button class="card-price purchased"><span>Куплено</span></button>' :
                        `<button class="card-price" data-id="${card.id}" data-rate="${card.perHour}">
                            <img src="https://i.postimg.cc/FFx7T4Bh/image.png" alt="leaf" class="leaf-icon">
                            <span>${card.price}</span>
                        </button>`
                    }
                    <div class="per-hour">
                        <div class="rate">
                            <img src="https://i.postimg.cc/FFx7T4Bh/image.png" alt="leaf" class="leaf-icon">
                            <span>${card.perHour}</span>
                        </div>
                        <span class="rate-label">per hour</span>
                    </div>
                </div>
            `;

            if (!isOwned) {
                const buyButton = cardElement.querySelector('.card-price');
                buyButton.addEventListener('click', function() {
                    const cardId = this.dataset.id;
                    const hourlyRate = parseInt(this.dataset.rate);
                    
                    if (!this.classList.contains('purchased')) {
                        this.classList.add('purchased');
                        this.innerHTML = '<span>Куплено</span>';
                        
                        window.totalHourlyRate += hourlyRate;
                        const rateElement = document.querySelector('.user-info .rate');
                        rateElement.textContent = `${window.totalHourlyRate}/hour`;

                        // Добавляем карту в купленные
                        window.purchasedCards.push(card);
                        updateOwnedCards();
                        handleCardPurchase(card);
                    }
                });
            }

            return cardElement;
        }

        // Функция обновления списка купленных карт
        function updateOwnedCards() {
            ownedCardsContainer.innerHTML = '';
            if (window.purchasedCards.length === 0) {
                const emptyMessage = document.createElement('div');
                emptyMessage.className = 'empty-message';
                emptyMessage.textContent = 'У вас пока нет купленных карт';
                ownedCardsContainer.appendChild(emptyMessage);
            } else {
                window.purchasedCards.forEach(card => {
                    ownedCardsContainer.appendChild(createCardElement(card, true));
                });
            }
        }

        // Добавляем карточки в контейнер новых карт
        cardsData.forEach(card => {
            newCardsContainer.appendChild(createCardElement(card));
        });

        // Инициализируем список купленных карт
        updateOwnedCards();

        // Обработчики переключения табов
        tabsContainer.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                tabsContainer.querySelectorAll('.tab-btn').forEach(b => {
                    b.classList.remove('active', 'bg-[#262626]');
                    b.classList.add('text-white/50');
                });
                this.classList.add('active', 'bg-[#262626]');
                this.classList.remove('text-white/50');

                const tabName = this.dataset.tab;
                if (tabName === 'new') {
                    newCardsContainer.style.display = 'grid';
                    ownedCardsContainer.style.display = 'none';
                } else {
                    newCardsContainer.style.display = 'none';
                    ownedCardsContainer.style.display = 'grid';
                    updateOwnedCards();
                }
            });
        });

        section.appendChild(tabsContainer);
        section.appendChild(newCardsContainer);
        section.appendChild(ownedCardsContainer);
        document.querySelector('.container').insertBefore(section, document.querySelector('.bottom-nav'));
        return section;
    }

    function createFrensSection() {
        const section = document.createElement('div');
        section.className = 'frens-section';
        section.innerHTML = '<div class="section-title">Frens Section</div>';
        document.querySelector('.container').insertBefore(section, document.querySelector('.bottom-nav'));
        return section;
    }

    function createMiningSection() {
        const section = document.createElement('div');
        section.className = 'mining-section';
        section.innerHTML = '<div class="section-title">Mining Section</div>';
        document.querySelector('.container').insertBefore(section, document.querySelector('.bottom-nav'));
        return section;
    }

    function createRewardSection() {
        const section = document.createElement('div');
        section.className = 'reward-section';
        section.innerHTML = '<div class="section-title">Reward Section</div>';
        document.querySelector('.container').insertBefore(section, document.querySelector('.bottom-nav'));
        return section;
    }
});
