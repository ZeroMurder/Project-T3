// Функция для хеширования пароля (простая реализация)
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(16);
}

// Функция для шифрования данных
function encryptData(data, key) {
    let result = '';
    for (let i = 0; i < data.length; i++) {
        result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result);
}

// Функция для расшифровки данных
function decryptData(encryptedData, key) {
    const data = atob(encryptedData);
    let result = '';
    for (let i = 0; i < data.length; i++) {
        result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
}

// Регистрация нового администратора
async function registerAdmin(adminName, adminEmail, username, password) {
    // Проверяем, не зарегистрирован ли уже администратор
    if (localStorage.getItem('admin_credentials')) {
        throw new Error('Администратор уже зарегистрирован');
    }
    
    // Хешируем пароль
    const hashedPassword = hashPassword(password);
    
    // Создаем объект с данными администратора
    const adminData = {
        adminName,
        adminEmail,
        username,
        passwordHash: hashedPassword,
        registeredAt: new Date().toISOString()
    };
    
    // Шифруем данные с помощью ключа
    const encryptionKey = 'CP_ADMIN_KEY_2024';
    const encryptedData = encryptData(JSON.stringify(adminData), encryptionKey);
    
    // Сохраняем в localStorage
    localStorage.setItem('admin_credentials', encryptedData);
    
    return true;
}

// Проверка учетных данных
async function checkCredentials(username, password) {
    // Проверяем, есть ли сохраненные учетные данные
    const encryptedData = localStorage.getItem('admin_credentials');
    
    if (!encryptedData) {
        // Если данных нет, проверяем дефолтные (для первой установки)
        if (username === 'admin' && password === 'admin') {
            // Создаем дефолтные учетные данные
            await registerAdmin('Администратор', 'admin@cableproduction.ru', 'admin', 'admin');
            return true;
        }
        return false;
    }
    
    try {
        // Расшифровываем данные
        const encryptionKey = 'CP_ADMIN_KEY_2024';
        const decryptedData = decryptData(encryptedData, encryptionKey);
        const adminData = JSON.parse(decryptedData);
        
        // Проверяем логин и пароль
        if (adminData.username === username) {
            const hashedPassword = hashPassword(password);
            return adminData.passwordHash === hashedPassword;
        }
        
        return false;
    } catch (error) {
        console.error('Ошибка при проверке учетных данных:', error);
        return false;
    }
}

// Получение данных администратора
function getAdminData() {
    const encryptedData = localStorage.getItem('admin_credentials');
    
    if (!encryptedData) {
        return null;
    }
    
    try {
        const encryptionKey = 'CP_ADMIN_KEY_2024';
        const decryptedData = decryptData(encryptedData, encryptionKey);
        return JSON.parse(decryptedData);
    } catch (error) {
        console.error('Ошибка при получении данных администратора:', error);
        return null;
    }
}

// Проверка авторизации
function checkAuth() {
    const isLoggedIn = localStorage.getItem('admin_logged_in') === 'true';
    
    if (!isLoggedIn) {
        // Если не авторизован, перенаправляем на страницу входа
        window.location.href = '../admin_login.html';
        return false;
    }
    
    return true;
}

// Обновление данных администратора
async function updateAdminData(newData) {
    const adminData = getAdminData();
    
    if (!adminData) {
        throw new Error('Данные администратора не найдены');
    }
    
    // Обновляем данные
    const updatedData = {
        ...adminData,
        ...newData,
        updatedAt: new Date().toISOString()
    };
    
    // Шифруем и сохраняем
    const encryptionKey = 'CP_ADMIN_KEY_2024';
    const encryptedData = encryptData(JSON.stringify(updatedData), encryptionKey);
    localStorage.setItem('admin_credentials', encryptedData);
    
    return true;
}

// Изменение пароля
async function changePassword(currentPassword, newPassword) {
    const adminData = getAdminData();
    
    if (!adminData) {
        throw new Error('Данные администратора не найдены');
    }
    
    // Проверяем текущий пароль
    const currentHash = hashPassword(currentPassword);
    if (currentHash !== adminData.passwordHash) {
        throw new Error('Текущий пароль неверен');
    }
    
    // Обновляем пароль
    adminData.passwordHash = hashPassword(newPassword);
    adminData.updatedAt = new Date().toISOString();
    
    // Шифруем и сохраняем
    const encryptionKey = 'CP_ADMIN_KEY_2024';
    const encryptedData = encryptData(JSON.stringify(adminData), encryptionKey);
    localStorage.setItem('admin_credentials', encryptedData);
    
    return true;
}