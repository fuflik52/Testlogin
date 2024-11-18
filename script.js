class Game {
    constructor() {
        this.player = null;
        this.platforms = [];
        this.npcs = [];
        this.items = [];
        this.activeQuests = {}; // Объект для хранения активных квестов по NPC
        this.completedQuests = {}; // Объект для хранения завершенных квестов по NPC
        this.inventory = {}; // Используем объект для хранения количества предметов
        this.playerVelocity = { x: 0, y: 0 };
        this.isJumping = false;
        this.gravity = 0.5;
        this.keys = {};
        this.gameWidth = 3000; // Ширина игры
        this.gameHeight = 600; // Высота игры
        this.isStarted = false;

        // Диалоговое окно
        this.dialogBox = document.getElementById('dialogBox');
        this.dialogText = document.getElementById('dialogText');
        this.acceptQuestButton = document.getElementById('acceptQuest');

        // Текущий NPC для взаимодействия
        this.currentNPC = null;

        // Инвентарь
        this.inventoryGrid = document.querySelector('.inventory-grid');

        // Подсказка взаимодействия
        this.interactionHint = document.getElementById('interactionHint');

        // Контекстное меню и диалоговое окно разделения
        this.contextMenu = document.getElementById('contextMenu');
        this.splitDialog = document.getElementById('splitDialog');
        this.splitOption = document.getElementById('splitOption');
        this.dropOption = document.getElementById('dropOption');
        this.splitAmount = document.getElementById('splitAmount');
        this.confirmSplit = document.getElementById('confirmSplit');
        this.cancelSplit = document.getElementById('cancelSplit');

        this.selectedItem = null;
        this.draggedItem = null;

        this.setupEventListeners();
        this.showStartOverlay();
    }

    showStartOverlay() {
        this.startOverlay = document.getElementById('startOverlay');
        // Используем один обработчик для старта игры
        const startHandler = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.startGame();
                // Удаляем этот обработчик после старта
                document.removeEventListener('keydown', startHandler);
            }
        };
        document.addEventListener('keydown', startHandler);
    }

    startGame() {
        this.isStarted = true;
        this.startOverlay.style.display = 'none';
        this.initializeGame();
        this.gameLoop();
    }

    initializeGame() {
        this.player = this.createPlayer();
        this.platforms = this.createPlatforms();
        this.npcs = this.createNPCs();
        this.items = this.createItems();
        this.updateKeyDisplay(); // Инициализируем отображение нажатых клавиш

        // Обработчики кнопок диалогового окна
        this.acceptQuestButton.addEventListener('click', () => {
            if (this.currentNPC) {
                this.acceptQuest(this.currentNPC);
                this.closeDialog();
            }
        });

        // Обработчики инвентаря
        const inventoryIndicator = document.getElementById('inventoryIndicator');
        const closeInventory = document.getElementById('closeInventory');

        if (inventoryIndicator) {
            inventoryIndicator.addEventListener('click', () => {
                this.toggleInventory();
            });
        }

        if (closeInventory) {
            closeInventory.addEventListener('click', () => {
                this.toggleInventory();
            });
        }

        // Обработчики для контекстного меню
        this.splitOption.addEventListener('click', () => {
            if (!this.selectedItem) return;
            const currentCount = parseInt(this.selectedItem.dataset.count);
            this.splitAmount.max = currentCount - 1;
            this.splitAmount.value = Math.floor(currentCount / 2);
            this.splitDialog.style.display = 'block';
            // Центрируем диалог
            this.splitDialog.style.left = `${(window.innerWidth - this.splitDialog.offsetWidth) / 2}px`;
            this.splitDialog.style.top = `${(window.innerHeight - this.splitDialog.offsetHeight) / 2}px`;
            this.hideContextMenu();
        });

        this.dropOption.addEventListener('click', () => {
            if (!this.selectedItem) return;
            this.selectedItem.remove();
            this.hideContextMenu();
        });

        // Обработчики для диалога разделения
        this.confirmSplit.addEventListener('click', () => {
            if (!this.selectedItem) return;
            const amount = parseInt(this.splitAmount.value);
            const currentCount = parseInt(this.selectedItem.dataset.count);
            
            if (isNaN(amount) || amount <= 0 || amount >= currentCount) return;
            
            this.selectedItem.dataset.count = currentCount - amount;
            this.selectedItem.querySelector('.item-count').textContent = currentCount - amount;
            
            const newItem = this.selectedItem.cloneNode(true);
            newItem.dataset.count = amount;
            newItem.querySelector('.item-count').textContent = amount;
            
            const emptySlot = Array.from(document.querySelectorAll('.inventory-slot'))
                .find(slot => !slot.querySelector('.item'));
            
            if (emptySlot) {
                emptySlot.appendChild(newItem);
                this.initializeDragAndDrop(newItem);
            }
            
            this.hideSplitDialog();
        });

        this.cancelSplit.addEventListener('click', () => {
            this.hideSplitDialog();
        });

        // Инициализация инвентаря
        this.initializeInventory();
    }

    createPlayer() {
        const player = document.createElement('div');
        player.className = 'player';
        player.innerHTML = `
            <svg width="70" height="90" viewBox="0 0 70 90">
                <defs>
                    <linearGradient id="playerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#2ecc71"/>
                        <stop offset="100%" style="stop-color:#27ae60"/>
                    </linearGradient>
                </defs>
                <circle cx="35" cy="35" r="35" fill="url(#playerGradient)"/>
                <rect x="20" y="50" width="30" height="40" fill="#fff" rx="5"/>
                <circle cx="25" cy="60" r="5" fill="#333"/>
                <circle cx="45" cy="60" r="5" fill="#333"/>
                <path d="M25 80 Q35 90 45 80" stroke="#333" fill="none" stroke-width="2"/>
            </svg>
        `;
        document.getElementById('game').appendChild(player);
        return player;
    }

    createPlatforms() {
        const platformsData = [
            { x: 0, y: 550, width: 3000, height: 50 },
            { x: 400, y: 450, width: 200, height: 20 },
            { x: 800, y: 350, width: 200, height: 20 },
            { x: 1200, y: 450, width: 200, height: 20 },
            { x: 1600, y: 350, width: 200, height: 20 },
            { x: 2000, y: 450, width: 200, height: 20 },
            { x: 2400, y: 350, width: 200, height: 20 },
            { x: 2800, y: 450, width: 200, height: 20 },
            { x: 3200, y: 350, width: 200, height: 20 },
            { x: 3600, y: 450, width: 200, height: 20 },
            { x: 4000, y: 350, width: 200, height: 20 },
            { x: 4400, y: 450, width: 200, height: 20 }
        ];

        return platformsData.map(data => {
            const platform = document.createElement('div');
            platform.className = 'platform';
            platform.style.left = data.x + 'px';
            platform.style.top = data.y + 'px';
            platform.style.width = data.width + 'px';
            platform.style.height = data.height + 'px';
            document.getElementById('game').appendChild(platform);
            return platform;
        });
    }

    createNPCs() {
        const npcsData = [
            { 
                id: 1,
                name: "Волшебник", 
                x: 400, 
                y: 420, 
                quest: "Принеси волшебный талисман", 
                requires: null
            },
            { 
                id: 2,
                name: "Маг", 
                x: 1600, 
                y: 420, 
                quest: "Изучи древнюю рукопись", 
                requires: null
            },
            { 
                id: 3,
                name: "Торговец", 
                x: 3200, 
                y: 420, 
                quest: "Продай редкий артефакт", 
                requires: null
            },
            { 
                id: 4,
                name: "Гид", 
                x: 4800, 
                y: 420, 
                quest: "Исследуй скрытый храм", 
                requires: null
            }
        ];

        return npcsData.map(data => {
            const npc = document.createElement('div');
            npc.className = 'npc';
            npc.setAttribute('data-id', data.id);
            npc.innerHTML = `
                <svg width="70" height="90" viewBox="0 0 70 90">
                    <circle cx="35" cy="35" r="35" fill="currentColor"/>
                    <rect x="20" y="50" width="30" height="40" fill="#fff" rx="5"/>
                    <circle cx="25" cy="60" r="5" fill="#333"/>
                    <circle cx="45" cy="60" r="5" fill="#333"/>
                    <path d="M25 80 Q35 90 45 80" stroke="#333" fill="none" stroke-width="2"/>
                </svg>
                <div class="npc-label">${data.name}</div>
            `;
            npc.style.left = data.x + 'px';
            npc.style.top = data.y + 'px';
            npc.dataset.quest = data.quest;
            npc.dataset.requires = data.requires;
            npc.dataset.id = data.id;
            document.getElementById('game').appendChild(npc);
            return npc;
        });
    }

    createItems() {
        const itemsData = [
            { 
                x: 500, 
                y: 400, 
                type: "Волшебный талисман" 
            },
            { 
                x: 900, 
                y: 300, 
                type: "Древняя рукопись" 
            },
            { 
                x: 1700, 
                y: 400, 
                type: "Редкий артефакт" 
            },
            { 
                x: 2500, 
                y: 300, 
                type: "Скрытый храм" 
            },
            { 
                x: 3500, 
                y: 400, 
                type: "Волшебный талисман" 
            },
            { 
                x: 4100, 
                y: 300, 
                type: "Древняя рукопись" 
            }
        ];

        return itemsData.map(data => {
            const item = document.createElement('div');
            item.className = 'game-item item';
            item.style.left = data.x + 'px';
            item.style.top = data.y + 'px';
            item.dataset.type = data.type;

            // Выбор SVG-иконки в зависимости от типа предмета
            let svgIcon = '';
            if (data.type === 'Волшебный талисман') {
                svgIcon = `
                    <svg class="item-icon magical" width="60" height="60" viewBox="0 0 60 60">
                        <path d="M30 15L34.36 22.47L43.3 24.36L37.7 31.63L39.07 40.91L30 36.49L20.93 40.91L22.3 31.63L16.7 24.36L25.64 22.47L30 15Z" 
                              fill="none" stroke="#ffd700" stroke-width="2"/>
                    </svg>
                `;
            } else if (data.type === 'Древняя рукопись') {
                svgIcon = `
                    <svg class="item-icon" width="60" height="60" viewBox="0 0 60 60">
                        <path d="M15 15H45V45H15V15Z M18 18H42M18 27H42M18 36H42M18 45H42" 
                              fill="none" stroke="#ffd700" stroke-width="2"/>
                    </svg>
                `;
            } else if (data.type === 'Редкий артефакт') {
                svgIcon = `
                    <svg class="item-icon magical" width="60" height="60" viewBox="0 0 60 60">
                        <path d="M30 20 L45 30 L30 40 L15 30 Z" fill="none" stroke="#ffd700" stroke-width="2"/>
                        <circle cx="30" cy="30" r="5" fill="none" stroke="#ffd700" stroke-width="2"/>
                        <path d="M30 10 L30 50 M10 30 L50 30" stroke="#ffd700" stroke-width="1"/>
                    </svg>
                `;
            } else if (data.type === 'Скрытый храм') {
                svgIcon = `
                    <svg class="item-icon" width="60" height="60" viewBox="0 0 60 60">
                        <path d="M10 45H50L30 15L10 45Z" fill="none" stroke="#ffd700" stroke-width="2"/>
                        <path d="M20 25h20v20h-20z" fill="none" stroke="#ffd700" stroke-width="2"/>
                    </svg>
                `;
            } else {
                // Дефолтная иконка, если тип не распознан
                svgIcon = `
                    <svg class="item-icon" width="60" height="60" viewBox="0 0 60 60">
                        <circle cx="30" cy="30" r="20" fill="none" stroke="#ffd700" stroke-width="2"/>
                        <text x="30" y="35" text-anchor="middle" fill="#ffd700" font-size="14px" font-family="Arial">?</text>
                    </svg>
                `;
            }

            item.innerHTML = `
                ${svgIcon}
                <div class="item-count">${data.count || 1}</div>
            `;

            // Добавляем обработчик для сбора предметов по клику
            item.addEventListener('click', () => {
                this.collectItem(data.type, item);
                item.dataset.collected = 'true';
            });

            // Инициализируем drag and drop
            this.initializeDragAndDrop(item);

            document.getElementById('game').appendChild(item);
            return item;
        });
    }

    setupEventListeners() {
        // Обработчики для Game класса
        document.addEventListener('keydown', (e) => {
            // Если игра не начата, игнорируем все клавиши, кроме пробела для старта
            if (!this.isStarted) return;

            const code = e.code;

            // Обработка движения
            if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(code)) {
                this.keys[code] = true;
            }

            // Обработка прыжка
            if (code === 'Space') {
                e.preventDefault(); // Предотвращаем прокрутку страницы
                if (!this.isJumping) {
                    this.playerVelocity.y = -15;
                    this.isJumping = true;
                }
            }

            // Обработка взаимодействия
            if (code === 'KeyE') {
                this.interactWithNPC();
            }

            // Обработка открытия инвентаря
            if (code === 'KeyI') {
                this.toggleInventory();
            }

            this.updateKeyDisplay();
        });

        document.addEventListener('keyup', (e) => {
            if (!this.isStarted) return;
            const code = e.code;

            if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(code)) {
                this.keys[code] = false;
            }

            this.updateKeyDisplay();
        });

        // Контекстное меню и диалоговое окно разделения
        this.contextMenu.addEventListener('click', (e) => {
            e.stopPropagation(); // Предотвращаем всплытие
        });

        document.addEventListener('click', () => {
            this.hideContextMenu();
        });
    }

    updateKeyDisplay() {
        const pressedKeys = [];
        if (this.keys['KeyW']) pressedKeys.push('W');
        if (this.keys['KeyA']) pressedKeys.push('A');
        if (this.keys['KeyS']) pressedKeys.push('S');
        if (this.keys['KeyD']) pressedKeys.push('D');
        if (pressedKeys.length === 0) {
            pressedKeys.push('Ничего');
        }
        document.getElementById('pressedKeys').textContent = pressedKeys.join(', ');
    }

    interactWithNPC() {
        const interactionRadius = 60; // Радиус взаимодействия
        let nearestNPC = null;
        let minDistance = Infinity;

        this.npcs.forEach(npc => {
            const quest = npc.dataset.quest;
            const requires = npc.dataset.requires;

            // Проверяем, есть ли уже активный или завершенный квест от этого NPC
            if (this.activeQuests[npc.dataset.id] || this.completedQuests[npc.dataset.id]) {
                // Квест уже принят или завершен
            } else {
                if (requires) {
                    if (!this.inventory[requires] && !this.completedQuests[npc.dataset.id]) {
                        return; // Требование не выполнено
                    }
                }
            }

            const playerX = this.player.offsetLeft + this.player.offsetWidth / 2;
            const playerY = this.player.offsetTop + this.player.offsetHeight / 2;
            const npcX = npc.offsetLeft + npc.offsetWidth / 2;
            const npcY = npc.offsetTop + npc.offsetHeight / 2;

            const distance = Math.sqrt(Math.pow(playerX - npcX, 2) + Math.pow(playerY - npcY, 2));

            if (distance < interactionRadius && distance < minDistance) {
                nearestNPC = npc;
                minDistance = distance;
            }
        });

        if (nearestNPC) {
            this.currentNPC = nearestNPC;
            const npcId = nearestNPC.dataset.id;
            if (this.activeQuests[npcId]) {
                this.showDialog("Выполните квест.");
            } else if (this.completedQuests[npcId]) {
                this.showDialog("Квест выполнен.");
            } else {
                this.showDialog(nearestNPC.dataset.quest);
            }
        }
    }

    showDialog(message) {
        this.dialogText.textContent = message;
        this.dialogBox.classList.remove('hidden');
        // Определяем, нужно ли показывать кнопки
        if (this.currentNPC && !this.activeQuests[this.currentNPC.dataset.id] && !this.completedQuests[this.currentNPC.dataset.id]) {
            this.acceptQuestButton.style.display = 'inline-block';
        } else {
            this.acceptQuestButton.style.display = 'none';
        }
        // Добавляем анимацию
        setTimeout(() => {
            this.dialogBox.classList.add('visible');
        }, 10);
    }

    closeDialog() {
        this.dialogBox.classList.remove('visible');
        // После завершения анимации скрываем элемент
        setTimeout(() => {
            this.dialogBox.classList.add('hidden');
            this.currentNPC = null;
        }, 300); // Время соответствует CSS transition
    }

    acceptQuest(npc) {
        const quest = npc.dataset.quest;
        const requires = npc.dataset.requires;
        const npcId = npc.dataset.id;

        // Добавляем квест в активные, если его еще нет
        if (!this.activeQuests[npcId] && !this.completedQuests[npcId]) {
            this.activeQuests[npcId] = quest;
            this.updateQuestStatus();
            alert(`Квест "${quest}" принят!`);
        }

        // Закрываем диалог
        this.closeDialog();
    }

    updateQuestStatus() {
        const quests = Object.values(this.activeQuests);
        if (quests.length === 0) {
            document.getElementById('questStatus').textContent = `Активные квесты: 0`;
        } else {
            document.getElementById('questStatus').textContent = `Активные квесты:\n${quests.join('\n')}`;
        }
    }

    collectItem(type, itemElement) {
        if (this.inventory[type]) {
            this.inventory[type] += 1;
        } else {
            this.inventory[type] = 1;
        }
        itemElement.remove();
        this.updateInventoryUI();
    }

    updateInventoryUI() {
        // Очистка инвентаря
        this.inventoryGrid.querySelectorAll('.inventory-slot').forEach(slot => {
            slot.innerHTML = '';
        });

        // Заполнение инвентаря
        let index = 0;
        for (const [type, count] of Object.entries(this.inventory)) {
            if (index >= this.inventoryGrid.children.length) break; // Ограничение по количеству слотов
            const slot = this.inventoryGrid.children[index];
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item';
            itemDiv.setAttribute('data-name', type);
            itemDiv.setAttribute('data-count', count);

            // Выбор SVG-иконки в зависимости от типа предмета
            let svgIcon = '';
            if (type === 'Волшебный талисман') {
                svgIcon = `
                    <svg viewBox="0 0 60 60" fill="#ffd700">
                        <path d="M30 15L34.36 22.47L43.3 24.36L37.7 31.63L39.07 40.91L30 36.49L20.93 40.91L22.3 31.63L16.7 24.36L25.64 22.47L30 15Z" 
                              fill="none" stroke="#ffd700" stroke-width="2"/>
                    </svg>
                `;
            } else if (type === 'Древняя рукопись') {
                svgIcon = `
                    <svg viewBox="0 0 60 60" fill="#c0392b">
                        <path d="M15 15H45V45H15V15Z M18 18H42M18 27H42M18 36H42M18 45H42" 
                              fill="none" stroke="#ffd700" stroke-width="2"/>
                    </svg>
                `;
            } else if (type === 'Редкий артефакт') {
                svgIcon = `
                    <svg viewBox="0 0 60 60" fill="#e67e22">
                        <path d="M30 20 L45 30 L30 40 L15 30 Z" fill="none" stroke="#ffd700" stroke-width="2"/>
                        <circle cx="30" cy="30" r="5" fill="none" stroke="#ffd700" stroke-width="2"/>
                        <path d="M30 10 L30 50 M10 30 L50 30" stroke="#ffd700" stroke-width="1"/>
                    </svg>
                `;
            } else if (type === 'Скрытый храм') {
                svgIcon = `
                    <svg viewBox="0 0 60 60" fill="#1abc9c">
                        <path d="M10 45H50L30 15L10 45Z" fill="none" stroke="#ffd700" stroke-width="2"/>
                        <path d="M20 25h20v20h-20z" fill="none" stroke="#ffd700" stroke-width="2"/>
                    </svg>
                `;
            } else {
                // Дефолтная иконка, если тип не распознан
                svgIcon = `
                    <svg viewBox="0 0 60 60" fill="#ffffff">
                        <circle cx="30" cy="30" r="20" fill="none" stroke="#ffd700" stroke-width="2"/>
                        <text x="30" y="35" text-anchor="middle" fill="#ffd700" font-size="14px" font-family="Arial">?</text>
                    </svg>
                `;
            }

            itemDiv.innerHTML = `
                ${svgIcon}
                <div class="item-count">${count}</div>
            `;

            // Добавляем обработчики drag and drop
            this.initializeDragAndDrop(itemDiv);

            // Добавляем обработчик контекстного меню
            itemDiv.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.selectedItem = itemDiv;
                this.contextMenu.style.display = 'block';
                this.contextMenu.style.left = `${e.pageX}px`;
                this.contextMenu.style.top = `${e.pageY}px`;
            });

            this.inventoryGrid.children[index].appendChild(itemDiv);
            index++;
        }

        // Проверяем завершение квестов
        this.checkQuestCompletion();
    }

    toggleInventory() {
        const inventory = document.getElementById('inventory');
        if (inventory.style.display === 'none' || inventory.style.display === '') {
            inventory.style.display = 'block';
        } else {
            inventory.style.display = 'none';
        }
        this.hideContextMenu();
        this.hideSplitDialog();
    }

    initializeInventory() {
        this.updateInventoryUI();
    }

    initializeDragAndDrop(item) {
        item.addEventListener('dragstart', (e) => {
            this.draggedItem = item;
            item.style.opacity = '0.5';
            e.dataTransfer.setData('text/plain', '');
        });

        item.addEventListener('dragend', () => {
            this.draggedItem = null;
            item.style.opacity = '1';
        });

        // Для совместимости с новой системой
        item.setAttribute('draggable', 'true');
    }

    updatePlayer() {
        // Обработка горизонтального движения
        if (this.keys['KeyA']) this.playerVelocity.x = -5;
        else if (this.keys['KeyD']) this.playerVelocity.x = 5;
        else this.playerVelocity.x = 0;

        // Применение гравитации
        this.playerVelocity.y += this.gravity;

        let newX = this.player.offsetLeft + this.playerVelocity.x;
        let newY = this.player.offsetTop + this.playerVelocity.y;

        // Проверка границ
        newX = Math.max(0, Math.min(newX, this.gameWidth - 70));
        newY = Math.max(0, Math.min(newY, this.gameHeight - 90));

        // Проверка коллизий с платформами
        this.platforms.forEach(platform => {
            const platformRect = platform.getBoundingClientRect();
            const playerRect = this.player.getBoundingClientRect();

            // Позиции относительно контейнера игры
            const adjustedPlatformRect = {
                left: platform.offsetLeft,
                top: platform.offsetTop,
                width: platform.offsetWidth,
                height: platform.offsetHeight
            };
            const adjustedPlayerRect = {
                left: newX,
                top: newY,
                width: playerRect.width,
                height: playerRect.height
            };

            if (this.checkCollision(
                adjustedPlayerRect.left, adjustedPlayerRect.top, adjustedPlayerRect.width, adjustedPlayerRect.height,
                adjustedPlatformRect.left, adjustedPlatformRect.top, adjustedPlatformRect.width, adjustedPlatformRect.height
            )) {
                if (this.playerVelocity.y > 0) { // Падение вниз
                    newY = adjustedPlatformRect.top - playerRect.height;
                    this.playerVelocity.y = 0;
                    this.isJumping = false;
                }
            }
        });

        // Обновление позиции игрока
        this.player.style.left = newX + 'px';
        this.player.style.top = newY + 'px';

        // Проверка сбора предметов
        this.checkItemCollection();

        // Проверка взаимодействия с NPC для отображения подсказки
        this.checkProximityToNPC();

        // Следование камеры
        this.followCamera(newX, newY);
    }

    checkItemCollection() {
        this.items.forEach(item => {
            if (item.dataset.collected === 'true') return;

            const playerRect = this.player.getBoundingClientRect();
            const itemRect = item.getBoundingClientRect();

            // Позиции относительно контейнера игры
            const adjustedPlayerRect = {
                left: this.player.offsetLeft,
                top: this.player.offsetTop,
                width: playerRect.width,
                height: playerRect.height
            };
            const adjustedItemRect = {
                left: item.offsetLeft,
                top: item.offsetTop,
                width: item.offsetWidth,
                height: item.offsetHeight
            };

            if (this.checkCollision(
                adjustedPlayerRect.left, adjustedPlayerRect.top, adjustedPlayerRect.width, adjustedPlayerRect.height,
                adjustedItemRect.left, adjustedItemRect.top, adjustedItemRect.width, adjustedItemRect.height
            )) {
                this.collectItem(item.dataset.type, item);
                item.dataset.collected = 'true';
            }
        });
    }

    checkProximityToNPC() {
        let nearAnyNPC = false;

        this.npcs.forEach(npc => {
            const quest = npc.dataset.quest;
            const requires = npc.dataset.requires;

            // Проверяем, выполнены ли требования квеста
            if (requires) {
                if (!this.inventory[requires] && !this.completedQuests[npc.dataset.id]) {
                    return; // Требование не выполнено
                }
            }

            const playerX = this.player.offsetLeft + this.player.offsetWidth / 2;
            const playerY = this.player.offsetTop + this.player.offsetHeight / 2;
            const npcX = npc.offsetLeft + npc.offsetWidth / 2;
            const npcY = npc.offsetTop + npc.offsetHeight / 2;

            const distance = Math.sqrt(Math.pow(playerX - npcX, 2) + Math.pow(playerY - npcY, 2));

            if (distance < 80) { // Радиус для подсказки
                nearAnyNPC = true;
            }
        });

        if (nearAnyNPC) {
            this.interactionHint.classList.remove('hidden');
        } else {
            this.interactionHint.classList.add('hidden');
        }
    }

    followCamera(newX, newY) {
        const gameContainer = document.getElementById('gameContainer');
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Центрируем камеру на игроке
        const cameraX = newX - viewportWidth / 2 + 35; // 35 - половина ширины игрока
        const cameraY = newY - viewportHeight / 2 + 45; // 45 - половина высоты игрока

        // Ограничиваем камеру границами игры
        const maxCameraX = this.gameWidth - viewportWidth;
        const maxCameraY = this.gameHeight - viewportHeight;
        const finalCameraX = Math.max(0, Math.min(cameraX, maxCameraX));
        const finalCameraY = Math.max(0, Math.min(cameraY, maxCameraY));

        // Применяем трансформацию
        gameContainer.scrollLeft = finalCameraX;
        gameContainer.scrollTop = finalCameraY;
    }

    checkCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 &&
               x1 + w1 > x2 &&
               y1 < y2 + h2 &&
               y1 + h1 > y2;
    }

    gameLoop() {
        if (this.isStarted) {
            this.updatePlayer();
            this.checkQuestCompletion();
        }
        requestAnimationFrame(() => this.gameLoop());
    }

    checkQuestCompletion() {
        // Перебираем активные квесты и проверяем их выполнение
        for (const [npcId, quest] of Object.entries(this.activeQuests)) {
            // Поиск NPC, который выдал этот квест
            const npc = this.npcs.find(npc => npc.dataset.id === npcId);
            if (!npc) continue;

            const requires = npc.dataset.requires;
            if (requires && this.inventory[requires]) {
                // Удаляем предмет из инвентаря
                this.inventory[requires] -= 1;
                if (this.inventory[requires] <= 0) {
                    delete this.inventory[requires];
                }

                // Переносим квест в завершенные
                this.completedQuests[npcId] = quest;

                // Удаляем квест из активных
                delete this.activeQuests[npcId];
                this.updateQuestStatus();

                // Обновляем UI инвентаря
                this.updateInventoryUI();

                // Сообщаем игроку о завершении квеста
                alert(`Квест "${quest}" завершен!`);
            }
        }
    }

    // Контекстное меню
    hideContextMenu() {
        this.contextMenu.style.display = 'none';
    }

    // Диалоговое окно разделения
    hideSplitDialog() {
        this.splitDialog.style.display = 'none';
    }
}

window.onload = () => {
    const game = new Game();
};
