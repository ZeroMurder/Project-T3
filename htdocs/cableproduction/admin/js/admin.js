// Глобальные переменные
const API_BASE = '../backend/api/';  // ИСПРАВЛЕННЫЙ ПУТЬ
let manufacturersData = [];
let productsData = [];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Админ-панель инициализируется...');
    console.log('Текущий URL:', window.location.href);
    
    // Проверка авторизации
    if (!checkAuth()) {
        return; // Если не авторизован, дальше не продолжаем
    }
    
    // Инициализация интерфейса
    initAdminPanel();
    
    // Загрузка данных
    loadInitialData();
});

// Проверка авторизации
function checkAuth() {
    const isLoggedIn = localStorage.getItem('admin_logged_in') === 'true';
    const adminName = localStorage.getItem('admin_name') || 'Администратор';
    
    if (!isLoggedIn) {
        // Показываем сообщение о необходимости входа
        document.getElementById('loadingScreen').innerHTML = `
            <div class="text-center">
                <i class="bi bi-exclamation-triangle display-1 text-warning mb-3"></i>
                <h4>Требуется авторизация</h4>
                <p class="text-muted mb-3">Вы не авторизованы в системе</p>
                <button class="btn btn-primary" onclick="window.location.href='../admin_login.html'">
                    <i class="bi bi-box-arrow-in-right me-2"></i>Перейти к входу
                </button>
            </div>
        `;
        return false;
    }
    
    // Обновить имя пользователя
    document.getElementById('currentUser').textContent = adminName;
    document.getElementById('sidebarUserName').textContent = adminName;
    
    return true;
}

// Инициализация панели
function initAdminPanel() {
    console.log('Инициализация панели...');
    
    // Переключение сайдбара
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('adminSidebar');
    const adminContent = document.getElementById('adminContent');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            adminContent.classList.toggle('sidebar-open');
        });
    }
    
    // Навигация по разделам
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Убрать активный класс у всех ссылок
            document.querySelectorAll('.sidebar-nav .nav-link').forEach(l => {
                l.classList.remove('active');
            });
            
            // Добавить активный класс текущей ссылке
            this.classList.add('active');
            
            // Получить раздел
            const section = this.getAttribute('data-section');
            
            // Переключить раздел
            switchSection(section);
        });
    });
    
    // Инициализация поиска
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performGlobalSearch(this.value);
            }, 500);
        });
    }
    
    // Закрыть сайдбар при клике на контент (мобильные)
    adminContent.addEventListener('click', function() {
        if (window.innerWidth < 992 && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            adminContent.classList.remove('sidebar-open');
        }
    });
    
    // Добавляем обработчики фильтров
    setupFilters();
}

// Настройка фильтров
function setupFilters() {
    // Фильтры производителей
    const searchMan = document.getElementById('searchManufacturers');
    const filterCity = document.getElementById('filterCity');
    const sortMan = document.getElementById('sortManufacturers');
    
    if (searchMan) searchMan.addEventListener('input', () => loadManufacturers());
    if (filterCity) filterCity.addEventListener('change', () => loadManufacturers());
    if (sortMan) sortMan.addEventListener('change', () => loadManufacturers());
    
    // Фильтры товаров
    const searchProd = document.getElementById('searchProducts');
    const filterType = document.getElementById('filterType');
    const filterMan = document.getElementById('filterManufacturer');
    
    if (searchProd) searchProd.addEventListener('input', () => loadProducts());
    if (filterType) filterType.addEventListener('change', () => loadProducts());
    if (filterMan) filterMan.addEventListener('change', () => loadProducts());
}

// Загрузка начальных данных
async function loadInitialData() {
    try {
        console.log('Начинаем загрузку данных...');
        console.log('API BASE:', API_BASE);
        console.log('Полный URL health:', window.location.origin + API_BASE + 'health.php');
        
        // Показать статус загрузки
        document.getElementById('loadingScreen').innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary loading-spinner" role="status">
                    <span class="visually-hidden">Загрузка...</span>
                </div>
                <p class="mt-3 text-muted">Загрузка данных...</p>
                <p class="text-muted small">Подключение к API...</p>
            </div>
        `;
        
        // Сначала проверяем доступность API
        console.log('Проверяем доступность API...');
        const healthResponse = await fetch(API_BASE + 'health.php', {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log('Health response status:', healthResponse.status);
        
        if (!healthResponse.ok) {
            const errorText = await healthResponse.text();
            console.error('Health error response:', errorText);
            throw new Error(`API недоступен: ${healthResponse.status} - ${errorText}`);
        }
        
        const healthData = await healthResponse.json();
        console.log('API статус:', healthData);
        
        // Загрузка производителей
        console.log('Загружаем производителей...');
        const manResponse = await fetch(API_BASE + 'manufacturers.php', {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log('Manufacturers response status:', manResponse.status);
        
        if (!manResponse.ok) {
            const errorText = await manResponse.text();
            console.error('Manufacturers error:', errorText);
            throw new Error(`Ошибка загрузки производителей: ${manResponse.status}`);
        }
        
        const manData = await manResponse.json();
        console.log('Производители загружены:', manData.success ? 'Успешно' : 'Ошибка');
        console.log('Количество производителей:', manData.data ? manData.data.length : 0);
        
        if (manData.success) {
            manufacturersData = manData.data;
            console.log('Manufacturers data:', manufacturersData.slice(0, 2)); // Первые 2 для отладки
            updateDashboardStats();
            updateManufacturersTable();
            updateRecentManufacturers();
            updateCitiesFilter();
            updateManufacturersFilter();
        } else {
            console.warn('Производители: ', manData.message);
            manufacturersData = [];
        }
        
        // Загрузка продуктов
        console.log('Загружаем продукты...');
        const prodResponse = await fetch(API_BASE + 'products.php', {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log('Products response status:', prodResponse.status);
        
        if (!prodResponse.ok) {
            const errorText = await prodResponse.text();
            console.error('Products error:', errorText);
            throw new Error(`Ошибка загрузки продуктов: ${prodResponse.status}`);
        }
        
        const prodData = await prodResponse.json();
        console.log('Продукты загружены:', prodData.success ? 'Успешно' : 'Ошибка');
        console.log('Количество продуктов:', prodData.data ? prodData.data.length : 0);
        
        if (prodData.success) {
            productsData = prodData.data;
            console.log('Products data:', productsData.slice(0, 2)); // Первые 2 для отладки
            updateProductsTable();
            updateRecentProducts();
            updateTypesFilter();
        } else {
            console.warn('Продукты: ', prodData.message);
            productsData = [];
        }
        
        // Скрыть загрузочный экран
        setTimeout(() => {
            document.getElementById('loadingScreen').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('loadingScreen').style.display = 'none';
                showNotification('Данные успешно загружены', 'success');
            }, 300);
        }, 500);
        
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        
        // Показать детализированную ошибку
        document.getElementById('loadingScreen').innerHTML = `
            <div class="text-center">
                <i class="bi bi-exclamation-triangle display-1 text-danger mb-3"></i>
                <h4>Ошибка загрузки данных</h4>
                <p class="text-muted mb-3">${error.message}</p>
                <div class="alert alert-warning mb-3">
                    <small>
                        <i class="bi bi-info-circle me-1"></i>
                        Проверьте:<br>
                        1. Запущен ли XAMPP<br>
                        2. Создана ли база данных<br>
                        3. Доступен ли сервер по адресу: ${window.location.origin + API_BASE}<br>
                        4. Открывается ли API в браузере: <a href="${API_BASE + 'health.php'}" target="_blank">${API_BASE + 'health.php'}</a>
                    </small>
                </div>
                <div class="d-flex gap-2 justify-content-center">
                    <button class="btn btn-primary" onclick="loadInitialData()">
                        <i class="bi bi-arrow-clockwise me-2"></i>Повторить
                    </button>
                    <button class="btn btn-outline-light" onclick="adminLogout()">
                        <i class="bi bi-box-arrow-right me-2"></i>Выйти
                    </button>
                </div>
            </div>
        `;
    }
}
async function testAPI() {
    try {
        console.log('🔧 Тестирование API...');
        
        // Тест парсера
        const testResponse = await fetch(API_BASE + 'parser.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                manufacturer_id: 1,
                action: 'parse'
            })
        });
        
        const testResult = await testResponse.json();
        console.log('Тест парсера:', testResult);
        
        if (testResult.success) {
            console.log(' Парсер работает');
        } else {
            console.warn('️ Парсер не работает:', testResult.message);
        }
        
    } catch (error) {
        console.error(' Ошибка тестирования API:', error);
    }
}

// Обновление статистики на дашборде
function updateDashboardStats() {
    console.log('Обновление статистики...');
    
    // Производители
    document.getElementById('statsManufacturers').textContent = manufacturersData.length;
    document.getElementById('detailedManufacturers').textContent = manufacturersData.length;
    
    // Продукты
    document.getElementById('statsProducts').textContent = productsData.length;
    document.getElementById('detailedProducts').textContent = productsData.length;
    
    // Города
    const uniqueCities = [...new Set(manufacturersData
        .map(m => m.city)
        .filter(city => city && city.trim() !== '')
    )];
    document.getElementById('statsCities').textContent = uniqueCities.length;
    document.getElementById('detailedCities').textContent = uniqueCities.length;
    
    // Типы
    const uniqueTypes = [...new Set(productsData
        .map(p => p.type)
        .filter(type => type && type.trim() !== '')
    )];
    document.getElementById('statsTypes').textContent = uniqueTypes.length;
    
    // Средняя цена
    const pricedProducts = productsData.filter(p => p.price && !isNaN(parseFloat(p.price)));
    const avgPrice = pricedProducts.length > 0 
        ? pricedProducts.reduce((sum, p) => sum + parseFloat(p.price), 0) / pricedProducts.length
        : 0;
    document.getElementById('detailedAvgPrice').textContent = avgPrice.toFixed(2) + ' руб.';
    
    console.log('Статистика обновлена');
}

// Обновление таблицы производителей
function updateManufacturersTable() {
    const tbody = document.getElementById('manufacturersTable');
    const countSpan = document.getElementById('manufacturersCount');
    
    if (!tbody) {
        console.error('Не найден tbody manufacturersTable');
        return;
    }
    
    // Применяем фильтры
    let filtered = [...manufacturersData];
    
    // Поиск по названию
    const search = document.getElementById('searchManufacturers')?.value.toLowerCase() || '';
    if (search) {
        filtered = filtered.filter(m => 
            (m.name && m.name.toLowerCase().includes(search)) ||
            (m.city && m.city.toLowerCase().includes(search)) ||
            (m.description && m.description.toLowerCase().includes(search))
        );
    }
    
    // Фильтр по городу
    const city = document.getElementById('filterCity')?.value || '';
    if (city) {
        filtered = filtered.filter(m => m.city === city);
    }
    
    // Сортировка
    const sort = document.getElementById('sortManufacturers')?.value || 'name';
    switch(sort) {
        case 'newest':
            filtered.sort((a, b) => b.id - a.id);
            break;
        case 'products':
            filtered.sort((a, b) => {
                const aCount = productsData.filter(p => p.manufacturer_id == a.id).length;
                const bCount = productsData.filter(p => p.manufacturer_id == b.id).length;
                return bCount - aCount;
            });
            break;
        default:
            filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5">
                    <i class="bi bi-buildings display-4 text-muted mb-3"></i>
                    <p>Производители не найдены</p>
                </td>
            </tr>
        `;
        countSpan.textContent = '0';
        return;
    }
    
    let html = '';
    filtered.forEach(manufacturer => {
        // Подсчет товаров
        const productCount = productsData.filter(p => p.manufacturer_id == manufacturer.id).length;
        
        // Форматирование контактов
        const contacts = [];
        if (manufacturer.phone) contacts.push(`<i class="bi bi-telephone me-1"></i> ${manufacturer.phone}`);
        if (manufacturer.email) contacts.push(`<i class="bi bi-envelope me-1"></i> ${manufacturer.email}`);
        
        html += `
            <tr>
                <td>${manufacturer.id}</td>
                <td>
                    <strong>${manufacturer.name || '-'}</strong>
                    ${manufacturer.description ? `<br><small class="text-muted">${manufacturer.description.substring(0, 50)}...</small>` : ''}
                </td>
                <td>${manufacturer.city || '-'}</td>
                <td>
                    ${contacts.length > 0 ? contacts.join('<br>') : '-'}
                </td>
                <td>
                    <span class="badge bg-primary">${productCount}</span>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="editManufacturer(${manufacturer.id})" title="Редактировать">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteManufacturer(${manufacturer.id})" title="Удалить">
                            <i class="bi bi-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="parseManufacturer(${manufacturer.id})" title="Парсить с сайта">
                            <i class="bi bi-cloud-download"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    countSpan.textContent = filtered.length;
    console.log(`Таблица производителей обновлена: ${filtered.length} записей`);
}


// Обновление таблицы продуктов
function updateProductsTable() {
    const tbody = document.getElementById('productsTable');
    const countSpan = document.getElementById('productsCount');
    
    if (!tbody) {
        console.error('Не найден tbody productsTable');
        return;
    }
    
    // Применяем фильтры
    let filtered = [...productsData];
    
    // Поиск по названию
    const search = document.getElementById('searchProducts')?.value.toLowerCase() || '';
    if (search) {
        filtered = filtered.filter(p => 
            (p.name && p.name.toLowerCase().includes(search)) ||
            (p.specs && p.specs.toLowerCase().includes(search)) ||
            (p.type && p.type.toLowerCase().includes(search))
        );
    }
    
    // Фильтр по типу
    const type = document.getElementById('filterType')?.value || '';
    if (type) {
        filtered = filtered.filter(p => p.type === type);
    }
    
    // Фильтр по производителю
    const manufacturerId = document.getElementById('filterManufacturer')?.value || '';
    if (manufacturerId) {
        filtered = filtered.filter(p => p.manufacturer_id == manufacturerId);
    }
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
                    <i class="bi bi-box-seam display-4 text-muted mb-3"></i>
                    <p>Товары не найдены</p>
                </td>
            </tr>
        `;
        countSpan.textContent = '0';
        return;
    }
    
    let html = '';
    filtered.forEach(product => {
        // Найти производителя
        const manufacturer = manufacturersData.find(m => m.id == product.manufacturer_id);
        
        // Форматирование цены
        let priceDisplay = '<span class="text-muted">По запросу</span>';
        if (product.price && !isNaN(parseFloat(product.price))) {
            priceDisplay = `<strong>${parseFloat(product.price).toFixed(2)} руб./${product.unit || 'м'}</strong>`;
        }
        
        html += `
            <tr>
                <td>${product.id}</td>
                <td>
                    <strong>${product.name || '-'}</strong>
                    ${product.specs ? `<br><small class="text-muted">${product.specs.substring(0, 50)}...</small>` : ''}
                </td>
                <td>${manufacturer ? manufacturer.name : '-'}</td>
                <td>
                    <span class="badge bg-info">${product.type || '-'}</span>
                </td>
                <td>${priceDisplay}</td>
                <td>
                    <div class="d-flex gap-2">
                        <button class="btn-action btn-edit" onclick="editProduct(${product.id})">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteProduct(${product.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    countSpan.textContent = filtered.length;
    console.log(`Таблица товаров обновлена: ${filtered.length} записей`);
}

// Обновление последних производителей
function updateRecentManufacturers() {
    const container = document.getElementById('recentManufacturers');
    if (!container) {
        console.error('Не найден container recentManufacturers');
        return;
    }
    
    const recent = manufacturersData.slice(-5).reverse(); // Последние 5
    
    if (recent.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">Нет производителей</p>';
        return;
    }
    
    let html = '';
    recent.forEach(man => {
        const productCount = productsData.filter(p => p.manufacturer_id == man.id).length;
        
        html += `
            <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-secondary">
                <div>
                    <h6 class="mb-1">${man.name || 'Без названия'}</h6>
                    <small class="text-muted">${man.city || 'Город не указан'}</small>
                </div>
                <div class="text-end">
                    <span class="badge bg-primary">${productCount} товаров</span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Обновление последних продуктов
function updateRecentProducts() {
    const container = document.getElementById('recentProducts');
    if (!container) {
        console.error('Не найден container recentProducts');
        return;
    }
    
    const recent = productsData.slice(-5).reverse(); // Последние 5
    
    if (recent.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">Нет товаров</p>';
        return;
    }
    
    let html = '';
    recent.forEach(product => {
        const manufacturer = manufacturersData.find(m => m.id == product.manufacturer_id);
        
        // Форматирование цены
        let priceBadge = '';
        if (product.price && !isNaN(parseFloat(product.price))) {
            priceBadge = `<span class="badge bg-success">${parseFloat(product.price).toFixed(2)} руб.</span>`;
        } else {
            priceBadge = '<span class="badge bg-secondary">По запросу</span>';
        }
        
        html += `
            <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-secondary">
                <div>
                    <h6 class="mb-1">${product.name || 'Без названия'}</h6>
                    <small class="text-muted">${manufacturer ? manufacturer.name : 'Производитель не указан'}</small>
                </div>
                <div class="text-end">
                    ${priceBadge}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Заполнение фильтра городов
function updateCitiesFilter() {
    const filter = document.getElementById('filterCity');
    if (!filter) {
        console.error('Не найден фильтр городов');
        return;
    }
    
    const cities = [...new Set(manufacturersData
        .map(m => m.city)
        .filter(city => city && city.trim() !== '')
        .sort()
    )];
    
    let options = '<option value="">Все города</option>';
    cities.forEach(city => {
        options += `<option value="${city}">${city}</option>`;
    });
    
    filter.innerHTML = options;
    console.log(`Фильтр городов обновлен: ${cities.length} городов`);
}

// Заполнение фильтра типов
function updateTypesFilter() {
    const filter = document.getElementById('filterType');
    if (!filter) {
        console.error('Не найден фильтр типов');
        return;
    }
    
    const types = [...new Set(productsData
        .map(p => p.type)
        .filter(type => type && type.trim() !== '')
        .sort()
    )];
    
    let options = '<option value="">Все типы</option>';
    types.forEach(type => {
        options += `<option value="${type}">${type}</option>`;
    });
    
    filter.innerHTML = options;
    console.log(`Фильтр типов обновлен: ${types.length} типов`);
}

// Заполнение фильтра производителей
function updateManufacturersFilter() {
    const filter = document.getElementById('filterManufacturer');
    if (!filter) {
        console.error('Не найден фильтр производителей');
        return;
    }
    
    let options = '<option value="">Все производители</option>';
    manufacturersData.forEach(man => {
        options += `<option value="${man.id}">${man.name}</option>`;
    });
    
    filter.innerHTML = options;
    console.log(`Фильтр производителей обновлен: ${manufacturersData.length} производителей`);
}

// Переключение разделов
function switchSection(sectionId) {
    console.log(`Переключение на раздел: ${sectionId}`);
    
    // Скрыть все разделы
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Показать выбранный раздел
    const targetSection = document.getElementById(sectionId + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Загрузить данные для раздела если нужно
        switch(sectionId) {
            case 'dashboard':
                loadDashboardData();
                break;
            case 'manufacturers':
                loadManufacturers();
                break;
            case 'products':
                loadProducts();
                break;
            case 'stats':
                loadStatistics();
                break;
        }
    }
    
    // Закрыть сайдбар на мобильных
    if (window.innerWidth < 992) {
        const sidebar = document.getElementById('adminSidebar');
        const adminContent = document.getElementById('adminContent');
        if (sidebar && adminContent) {
            sidebar.classList.remove('active');
            adminContent.classList.remove('sidebar-open');
        }
    }
}

// Загрузка данных для дашборда
function loadDashboardData() {
    updateDashboardStats();
    updateRecentManufacturers();
    updateRecentProducts();
    showNotification('Дашборд обновлен', 'success');
}

// Загрузка производителей
function loadManufacturers() {
    updateManufacturersTable();
    showNotification('Таблица производителей обновлена', 'info');
}

// Загрузка продуктов
function loadProducts() {
    updateProductsTable();
    showNotification('Таблица товаров обновлена', 'info');
}

// Загрузка статистики
function loadStatistics() {
    updateDashboardStats();
    createCharts();
    showNotification('Статистика обновлена', 'success');
}

// Создание графиков
function createCharts() {
    // График по городам
    const cityCtx = document.getElementById('cityChart');
    if (cityCtx) {
        // Подсчет производителей по городам
        const cityCount = {};
        manufacturersData.forEach(m => {
            if (m.city) {
                cityCount[m.city] = (cityCount[m.city] || 0) + 1;
            }
        });
        
        const sortedCities = Object.entries(cityCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);
        
        new Chart(cityCtx, {
            type: 'bar',
            data: {
                labels: sortedCities.map(item => item[0]),
                datasets: [{
                    label: 'Количество производителей',
                    data: sortedCities.map(item => item[1]),
                    backgroundColor: 'rgba(13, 110, 253, 0.7)',
                    borderColor: 'rgba(13, 110, 253, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true
                    }
                }
            }
        });
    }
    
    // График по типам
    const typeCtx = document.getElementById('typeChart');
    if (typeCtx) {
        // Подсчет товаров по типам
        const typeCount = {};
        productsData.forEach(p => {
            if (p.type) {
                typeCount[p.type] = (typeCount[p.type] || 0) + 1;
            }
        });
        
        const sortedTypes = Object.entries(typeCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);
        
        new Chart(typeCtx, {
            type: 'pie',
            data: {
                labels: sortedTypes.map(item => item[0]),
                datasets: [{
                    label: 'Количество товаров',
                    data: sortedTypes.map(item => item[1]),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

// Показать модальное окно производителя
function showManufacturerModal(id = null) {
    const modalElement = document.getElementById('manufacturerModal');
    if (!modalElement) return;
    
    const modal = new bootstrap.Modal(modalElement);
    const title = document.getElementById('manufacturerModalTitle');
    const form = document.getElementById('manufacturerForm');
    
    form.reset();
    
    if (id) {
        title.textContent = 'Редактировать производителя';
        // Загрузить данные производителя
        const manufacturer = manufacturersData.find(m => m.id == id);
        if (manufacturer) {
            document.getElementById('manufacturerId').value = manufacturer.id;
            document.getElementById('manufacturerName').value = manufacturer.name || '';
            document.getElementById('manufacturerCity').value = manufacturer.city || '';
            document.getElementById('manufacturerWebsite').value = manufacturer.website || '';
            document.getElementById('manufacturerPhone').value = manufacturer.phone || '';
            document.getElementById('manufacturerEmail').value = manufacturer.email || '';
            document.getElementById('manufacturerDescription').value = manufacturer.description || '';
        }
    } else {
        title.textContent = 'Добавить производителя';
        document.getElementById('manufacturerId').value = '';
    }
    
    modal.show();
}

// Показать модальное окно товара
function showProductModal(id = null) {
    const modalElement = document.getElementById('productModal');
    if (!modalElement) return;
    
    const modal = new bootstrap.Modal(modalElement);
    const title = document.getElementById('productModalTitle');
    const form = document.getElementById('productForm');
    const manufacturerSelect = document.getElementById('productManufacturer');
    
    form.reset();
    
    // Заполнить список производителей
    let options = '<option value="">Выберите производителя</option>';
    manufacturersData.forEach(man => {
        options += `<option value="${man.id}">${man.name}</option>`;
    });
    manufacturerSelect.innerHTML = options;
    
    if (id) {
        title.textContent = 'Редактировать товар';
        // Загрузить данные товара
        const product = productsData.find(p => p.id == id);
        if (product) {
            document.getElementById('productId').value = product.id;
            document.getElementById('productManufacturer').value = product.manufacturer_id;
            document.getElementById('productName').value = product.name || '';
            document.getElementById('productType').value = product.type || '';
            document.getElementById('productPrice').value = product.price || '';
            document.getElementById('productUnit').value = product.unit || 'м';
            document.getElementById('productSpecs').value = product.specs || '';
            document.getElementById('productUrl').value = product.url || '';
        }
    } else {
        title.textContent = 'Добавить товар';
        document.getElementById('productId').value = '';
    }
    
    modal.show();
}

// Сохранить производителя
async function saveManufacturer() {
    const id = document.getElementById('manufacturerId').value;
    const name = document.getElementById('manufacturerName').value;
    
    if (!name.trim()) {
        showNotification('Введите название производителя', 'warning');
        return;
    }
    
    const data = {
        name: name.trim(),
        city: document.getElementById('manufacturerCity').value.trim(),
        website: document.getElementById('manufacturerWebsite').value.trim(),
        phone: document.getElementById('manufacturerPhone').value.trim(),
        email: document.getElementById('manufacturerEmail').value.trim(),
        description: document.getElementById('manufacturerDescription').value.trim()
    };
    
    let url = API_BASE + 'manufacturers.php';
    let method = 'POST';
    
    if (id) {
        data.id = parseInt(id);
        method = 'PUT';
    }
    
    try {
        console.log('Отправляем данные:', data);
        console.log('Метод:', method);
        console.log('URL:', url);
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        console.log('Ответ сервера:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Ошибка ответа:', errorText);
            throw new Error(`HTTP ошибка: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Результат:', result);
        
        if (result.success) {
            showNotification(
                id ? 'Производитель обновлен' : 'Производитель добавлен', 
                'success'
            );
            
            // Закрыть модальное окно
            const modalElement = document.getElementById('manufacturerModal');
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) modal.hide();
            }
            
            // Перезагрузить данные
            await reloadAllData();
        } else {
            showNotification(result.message || 'Ошибка сохранения', 'danger');
        }
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        showNotification(`Ошибка сохранения: ${error.message}`, 'danger');
    }
}

// Сохранить товар
async function saveProduct() {
    const id = document.getElementById('productId').value;
    const manufacturerId = document.getElementById('productManufacturer').value;
    const name = document.getElementById('productName').value;
    
    if (!manufacturerId) {
        showNotification('Выберите производителя', 'warning');
        return;
    }
    
    if (!name.trim()) {
        showNotification('Введите название товара', 'warning');
        return;
    }
    
    const data = {
        manufacturer_id: parseInt(manufacturerId),
        name: name.trim(),
        type: document.getElementById('productType').value.trim(),
        price: document.getElementById('productPrice').value ? parseFloat(document.getElementById('productPrice').value) : null,
        unit: document.getElementById('productUnit').value.trim() || 'м',
        specs: document.getElementById('productSpecs').value.trim(),
        url: document.getElementById('productUrl').value.trim()
    };
    
    let url = API_BASE + 'products.php';
    let method = 'POST';
    
    if (id) {
        data.id = parseInt(id);
        method = 'PUT';
    }
    
    try {
        console.log('Отправляем данные товара:', data);
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        console.log('Ответ сервера:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Ошибка ответа:', errorText);
            throw new Error(`HTTP ошибка: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Результат:', result);
        
        if (result.success) {
            showNotification(
                id ? 'Товар обновлен' : 'Товар добавлен', 
                'success'
            );
            
            // Закрыть модальное окно
            const modalElement = document.getElementById('productModal');
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) modal.hide();
            }
            
            // Перезагрузить данные
            await reloadAllData();
        } else {
            showNotification(result.message || 'Ошибка сохранения', 'danger');
        }
    } catch (error) {
        console.error('Ошибка сохранения товара:', error);
        showNotification(`Ошибка сохранения: ${error.message}`, 'danger');
    }
}

// Перезагрузка всех данных
async function reloadAllData() {
    try {
        console.log('Перезагружаем данные...');
        
        const [manResponse, prodResponse] = await Promise.all([
            fetch(API_BASE + 'manufacturers.php', {
                headers: { 'Accept': 'application/json' }
            }),
            fetch(API_BASE + 'products.php', {
                headers: { 'Accept': 'application/json' }
            })
        ]);
        
        console.log('Статус запроса производителей:', manResponse.status);
        console.log('Статус запроса товаров:', prodResponse.status);
        
        if (manResponse.ok && prodResponse.ok) {
            const manData = await manResponse.json();
            const prodData = await prodResponse.json();
            
            console.log('Данные производителей получены:', manData.success);
            console.log('Данные товаров получены:', prodData.success);
            
            if (manData.success && prodData.success) {
                manufacturersData = manData.data || [];
                productsData = prodData.data || [];
                
                console.log('Производителей:', manufacturersData.length);
                console.log('Товаров:', productsData.length);
                
                updateDashboardStats();
                updateManufacturersTable();
                updateRecentManufacturers();
                updateCitiesFilter();
                updateManufacturersFilter();
                
                updateProductsTable();
                updateRecentProducts();
                updateTypesFilter();
                
                showNotification('Данные обновлены', 'success');
            }
        } else {
            throw new Error('Один из запросов не удался');
        }
    } catch (error) {
        console.error('Ошибка перезагрузки:', error);
        showNotification('Ошибка обновления данных', 'danger');
    }
}

// Редактировать производителя
function editManufacturer(id) {
    showManufacturerModal(id);
}

// Удалить производителя
async function deleteManufacturer(id) {
    if (!confirm('Удалить этого производителя? Все его товары также будут удалены.')) {
        return;
    }
    
    try {
        const response = await fetch(API_BASE + 'manufacturers.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ id: id })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Производитель удален', 'success');
            await reloadAllData();
        } else {
            showNotification(result.message || 'Ошибка удаления', 'danger');
        }
    } catch (error) {
        console.error('Ошибка удаления:', error);
        showNotification('Ошибка удаления', 'danger');
    }
}

// Редактировать товар
function editProduct(id) {
    showProductModal(id);
}

// Удалить товар
async function deleteProduct(id) {
    if (!confirm('Удалить этот товар?')) {
        return;
    }
    
    try {
        const response = await fetch(API_BASE + 'products.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ id: id })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Товар удален', 'success');
            await reloadAllData();
        } else {
            showNotification(result.message || 'Ошибка удаления', 'danger');
        }
    } catch (error) {
        console.error('Ошибка удаления:', error);
        showNotification('Ошибка удаления', 'danger');
    }
}

// Глобальный поиск
function performGlobalSearch(query) {
    if (!query.trim()) return;
    
    // Переключаемся на раздел производителей
    switchSection('manufacturers');
    
    // Устанавливаем поисковый запрос
    const searchInput = document.getElementById('searchManufacturers');
    if (searchInput) {
        searchInput.value = query;
        loadManufacturers();
    }
    
    showNotification(`Поиск по запросу: "${query}"`, 'info');
}

// Экспорт в Excel
async function exportToExcel(type) {
    try {
        console.log(`🚀 Экспорт ${type}...`);
        
        // Проверяем, загружены ли данные
        if ((type === 'manufacturers' && manufacturersData.length === 0) || 
            (type === 'products' && productsData.length === 0)) {
            showNotification('Нет данных для экспорта', 'warning');
            return;
        }
        
        let data, filename;
        
        if (type === 'manufacturers') {
            // Экспорт производителей
            data = manufacturersData.map(man => ({
                'ID': man.id || '',
                'Название': man.name || '',
                'Город': man.city || '',
                'Телефон': man.phone || '',
                'Email': man.email || '',
                'Сайт': man.website || '',
                'Описание': man.description || ''
            }));
            filename = `производители_${new Date().toISOString().slice(0,10)}.csv`;
        } else {
            // Экспорт товаров
            data = productsData.map(p => {
                const manufacturer = manufacturersData.find(m => m.id == p.manufacturer_id);
                return {
                    'ID': p.id || '',
                    'Название': p.name || '',
                    'Производитель': manufacturer ? manufacturer.name : '',
                    'Тип': p.type || '',
                    'Цена': p.price ? `${parseFloat(p.price).toFixed(2)} руб.` : '',
                    'Единица': p.unit || 'м',
                    'Характеристики': p.specs || ''
                };
            });
            filename = `товары_${new Date().toISOString().slice(0,10)}.csv`;
        }
        
        // Создание CSV
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(';'),
            ...data.map(row => 
                headers.map(header => {
                    let value = row[header] || '';
                    // Экранируем кавычки
                    if (typeof value === 'string') {
                        value = value.replace(/"/g, '""');
                        if (value.includes(';') || value.includes('"') || value.includes('\n')) {
                            value = `"${value}"`;
                        }
                    }
                    return value;
                }).join(';')
            )
        ].join('\r\n');
        
        // Создаем и скачиваем файл
        const blob = new Blob(['\uFEFF' + csvContent], { 
            type: 'text/csv;charset=utf-8;' 
        });
        
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        
        // Очистка
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
        
        console.log(` Экспорт завершен: ${filename}`);
        showNotification(`Файл ${filename} скачан`, 'success');
        
    } catch (error) {
        console.error(' Ошибка экспорта:', error);
        showNotification(`Ошибка экспорта: ${error.message}`, 'danger');
    }
}
// Сохранение настроек
function saveSettings() {
    const adminName = document.getElementById('adminName').value;
    const adminEmail = document.getElementById('adminEmail').value;
    
    localStorage.setItem('admin_name', adminName);
    localStorage.setItem('admin_email', adminEmail);
    
    // Обновить интерфейс
    document.getElementById('currentUser').textContent = adminName;
    document.getElementById('sidebarUserName').textContent = adminName;
    document.getElementById('sidebarUserEmail').textContent = adminEmail;
    
    showNotification('Настройки сохранены', 'success');
}

// Выход из системы
function adminLogout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        localStorage.removeItem('admin_logged_in');
        localStorage.removeItem('admin_name');
        localStorage.removeItem('admin_email');
        localStorage.removeItem('admin_username');
        localStorage.removeItem('admin_password');
        localStorage.removeItem('remember_admin');
        window.location.href = '../admin_login.html';
    }
}

// Показать уведомление
function showNotification(message, type = 'info') {
    // Удалить старые уведомления
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    // Создать уведомление
    const notification = document.createElement('div');
    notification.className = `notification alert alert-${type} alert-dismissible fade show`;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="alert"></button>
    `;
    
    // Добавить стили
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        max-width: 500px;
    `;
    
    document.body.appendChild(notification);
    
    // Удалить через 5 секунд
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Экспорт функций в глобальную область видимости
window.switchSection = switchSection;
window.loadDashboardData = loadDashboardData;
window.loadManufacturers = loadManufacturers;
window.loadProducts = loadProducts;
window.loadStatistics = loadStatistics;
window.showManufacturerModal = showManufacturerModal;
window.showProductModal = showProductModal;
window.saveManufacturer = saveManufacturer;
window.saveProduct = saveProduct;
window.editManufacturer = editManufacturer;
window.deleteManufacturer = deleteManufacturer;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.saveSettings = saveSettings;
window.adminLogout = adminLogout;
window.exportToExcel = exportToExcel;
window.reloadAllData = reloadAllData;
window.loadInitialData = loadInitialData;
window.parseManufacturer = parseManufacturer;