class GitHubDB {
    constructor() {
        this.owner = 'fuflik52';
        this.repo = 'Testlogin';
        this.branch = 'main';
        this.token = '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';
        this.basePath = 'data';
    }

    async saveUser(userData) {
        try {
            // Получаем текущее содержимое файла
            const currentData = await this.getCurrentData();
            
            // Проверяем, существует ли пользователь
            const userIndex = currentData.users.findIndex(user => user.telegramId === userData.telegramId);
            
            if (userIndex === -1) {
                // Добавляем нового пользователя
                currentData.users.push(userData);
            } else {
                // Обновляем существующего пользователя
                currentData.users[userIndex] = {
                    ...currentData.users[userIndex],
                    ...userData,
                    lastUpdate: new Date().toISOString()
                };
            }
            
            // Обновляем время последнего обновления
            currentData.lastUpdate = new Date().toISOString();
            
            // Сохраняем обновленные данные
            await this.updateFile(currentData);
            
            return true;
        } catch (error) {
            console.error('Error saving user data:', error);
            return false;
        }
    }

    async getUser(telegramId) {
        try {
            const currentData = await this.getCurrentData();
            return currentData.users.find(user => user.telegramId === telegramId) || null;
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    }

    async getCurrentData() {
        try {
            const response = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.basePath}/users.json`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.github+json',
                    'Authorization': `token ${this.token}`,
                    'X-GitHub-Api-Version': '2022-11-28',
                    'User-Agent': 'Koala-Game'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    await this.createInitialFile();
                    return { users: [], lastUpdate: new Date().toISOString() };
                }
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const content = atob(data.content);
            return JSON.parse(content);
        } catch (error) {
            console.error('Error getting current data:', error);
            return { users: [], lastUpdate: new Date().toISOString() };
        }
    }

    async createInitialFile() {
        const content = {
            users: [],
            lastUpdate: new Date().toISOString()
        };

        const encodedContent = btoa(JSON.stringify(content, null, 2));

        await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.basePath}/users.json`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `token ${this.token}`,
                'X-GitHub-Api-Version': '2022-11-28',
                'User-Agent': 'Koala-Game',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Create initial users.json',
                content: encodedContent,
                branch: this.branch
            })
        });
    }

    async updateFile(content) {
        try {
            // Получаем текущий файл для получения SHA
            const currentFile = await fetch(
                `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.basePath}/users.json`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/vnd.github+json',
                        'Authorization': `token ${this.token}`,
                        'X-GitHub-Api-Version': '2022-11-28',
                        'User-Agent': 'Koala-Game'
                    }
                }
            ).then(res => res.json());

            // Кодируем новое содержимое в base64
            const encodedContent = btoa(JSON.stringify(content, null, 2));

            // Отправляем обновление
            const response = await fetch(
                `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.basePath}/users.json`,
                {
                    method: 'PUT',
                    headers: {
                        'Accept': 'application/vnd.github+json',
                        'Authorization': `token ${this.token}`,
                        'X-GitHub-Api-Version': '2022-11-28',
                        'User-Agent': 'Koala-Game',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: 'Update users data',
                        content: encodedContent,
                        sha: currentFile.sha,
                        branch: this.branch
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }

            return true;
        } catch (error) {
            console.error('Error updating file:', error);
            return false;
        }
    }
}

// Экспортируем экземпляр класса
window.githubDB = new GitHubDB();
