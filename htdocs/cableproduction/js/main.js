// Конфигурация
const API_BASE = '../backend/api/';// Исправлен путь - теперь относительный
const ITEMS_PER_PAGE = 9;
const ITEMS_PER_PAGE = 9;
let currentPage = 1;
let totalPages = 1;
let isLoading = false;
// Глобальные переменные
let manufacturersData = [];
let productsData = [];
let filteredManufacturers = [];
let currentPage = 1;
async function filterManufacturers(resetPage = false) {
    if (resetPage) currentPage = 1;
    
    if (isLoading) return;
    isLoading = true;
    
    try {
        // Показать индикатор загрузки
        showLoading();
        
        // Собираем параметры запроса
        const params = new URLSearchParams({
            page: currentPage,
            limit: ITEMS_PER_PAGE
        });
        
        const search = elements.searchInput?.value || '';
        if (search) params.append('search', search);
        
        const city = elements.cityFilter?.value || '';
        if (city) params.append('filters[city]', city);
        
        if (elements.hasPriceFilter?.checked) params.append('filters[has_price]', '1');
        if (elements.hasWebsiteFilter?.checked) params.append('filters[has_website]', '1');
        if (elements.hasEmailFilter?.checked) params.append('filters[has_email]', '1');
        
        // Выполняем запрос с пагинацией
        const response = await fetch(`${API_BASE}manufacturers.php?${params}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            manufacturersData = result.data;
            filteredManufacturers = manufacturersData;
            
            // Обновляем пагинацию
            if (result.pagination) {
                totalPages = result.pagination.pages;
                updatePaginationControls(result.pagination);
            }
            
            // Отображаем результаты
            renderManufacturers();
            
            // Обновляем статистику
            updateStatsFromAPI(result.data);
            
            // Показываем/скрываем кнопку "Показать еще"
            updateLoadMoreButton();
        }
    } catch (error) {
        console.error('Ошибка фильтрации:', error);
        showNotification('Ошибка загрузки данных', 'danger');
    } finally {
        isLoading = false;
    }
}

// Функция для загрузки следующей страницы
async function loadMore() {
    if (currentPage >= totalPages || isLoading) return;
    
    currentPage++;
    isLoading = true;
    
    try {
        // Показать индикатор загрузки
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Загрузка...';
            loadMoreBtn.disabled = true;
        }
        
        // Собираем параметры запроса
        const params = new URLSearchParams({
            page: currentPage,
            limit: ITEMS_PER_PAGE
        });
        
        const search = elements.searchInput?.value || '';
        if (search) params.append('search', search);
        
        const city = elements.cityFilter?.value || '';
        if (city) params.append('filters[city]', city);
        
        // Выполняем запрос
        const response = await fetch(`${API_BASE}manufacturers.php?${params}`);
        const result = await response.json();
        
        if (result.success) {
            // Добавляем новые данные
            manufacturersData = [...manufacturersData, ...result.data];
            filteredManufacturers = manufacturersData;
            
            // Отображаем все данные
            renderManufacturers();
            
            // Обновляем пагинацию
            if (result.pagination) {
                totalPages = result.pagination.pages;
                updatePaginationControls(result.pagination);
            }
            
            // Обновляем кнопку "Показать еще"
            updateLoadMoreButton();
            
            // Плавно скроллим к новым элементам
            setTimeout(() => {
                const cards = document.querySelectorAll('.manufacturer-card');
                if (cards.length > ITEMS_PER_PAGE) {
                    cards[cards.length - ITEMS_PER_PAGE].scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest'
                    });
                }
            }, 100);
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        currentPage--; // Откатываем страницу при ошибке
    } finally {
        isLoading = false;
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.innerHTML = '<i class="bi bi-chevron-down me-1"></i>Показать еще';
            loadMoreBtn.disabled = false;
        }
    }
}

// Создание кнопки "Показать еще"
function createLoadMoreButton() {
    const button = document.createElement('button');
    button.id = 'loadMoreBtn';
    button.className = 'btn btn-outline-primary w-100 mt-4';
    button.innerHTML = '<i class="bi bi-chevron-down me-1"></i>Показать еще';
    button.onclick = loadMore;
    return button;
}

// Обновление кнопки "Показать еще"
function updateLoadMoreButton() {
    let loadMoreBtn = document.getElementById('loadMoreBtn');
    const grid = elements.manufacturersGrid;
    
    if (!grid) return;
    
    if (currentPage < totalPages) {
        if (!loadMoreBtn) {
            loadMoreBtn = createLoadMoreButton();
            grid.parentElement.appendChild(loadMoreBtn);
        }
        loadMoreBtn.classList.remove('d-none');
    } else if (loadMoreBtn) {
        loadMoreBtn.classList.add('d-none');
    }
}

// Создание элементов пагинации
function updatePaginationControls(pagination) {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';
    
    if (pagination.pages <= 1) return;
    
    // Создаем пагинацию
    const ul = document.createElement('ul');
    ul.className = 'pagination justify-content-center';
    
    // Кнопка "Назад"
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
        <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">
            <i class="bi bi-chevron-left"></i>
        </a>
    `;
    ul.appendChild(prevLi);
    
    // Номера страниц
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(pagination.pages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageLi.innerHTML = `
            <a class="page-link" href="#" onclick="changePage(${i})">
                ${i}
            </a>
        `;
        ul.appendChild(pageLi);
    }
    
    // Кнопка "Вперед"
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage >= pagination.pages ? 'disabled' : ''}`;
    nextLi.innerHTML = `
        <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">
            <i class="bi bi-chevron-right"></i>
        </a>
    `;
    ul.appendChild(nextLi);
    
    paginationContainer.appendChild(ul);
}

// Функция смены страницы
function changePage(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    currentPage = page;
    filterManufacturers(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Обновляем функцию renderManufacturers для работы с пагинацией
function renderManufacturers() {
    const grid = elements.manufacturersGrid;
    if (!grid) return;
    
    // Показываем все отфильтрованные производители (текущая страница + предыдущие)
    showManufacturersGrid();
    
    let html = '';
    
    filteredManufacturers.forEach((manufacturer, index) => {
        // Анимация появления с задержкой
        const delay = (index % ITEMS_PER_PAGE) * 100;
        
        html += `
            <div class="col-md-4 mb-4 fade-in" style="animation-delay: ${delay}ms">
                <div class="manufacturer-card">
                    <!-- Остальной код карточки без изменений -->
                </div>
            </div>
        `;
    });
    
    grid.innerHTML = html;
    
    // Инициализируем анимации
    initAnimations();
}
// DOM элементы
const elements = {
    loadingState: document.getElementById('loadingState'),
    emptyState: document.getElementById('emptyState'),
    manufacturersGrid: document.getElementById('manufacturersGrid'),
    searchInput: document.getElementById('searchInput'),
    cityFilter: document.getElementById('cityFilter'),
    typeFilter: document.getElementById('typeFilter'),
    sortSelect: document.getElementById('sortSelect'),
    manufacturerCount: document.getElementById('manufacturerCount'),
    productCount: document.getElementById('productCount'),
    cityCount: document.getElementById('cityCount'),
    typeCount: document.getElementById('typeCount'),
    resultsCount: document.getElementById('resultsCount'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),
    resetFiltersBtn2: document.getElementById('resetFiltersBtn2'),
    refreshBtn: document.getElementById('refreshBtn'),
    exportBtn: document.getElementById('exportBtn'),
    hasPriceFilter: document.getElementById('hasPriceFilter'),
    hasWebsiteFilter: document.getElementById('hasWebsiteFilter'),
    hasEmailFilter: document.getElementById('hasEmailFilter')
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log(' Инициализация приложения...');
    
    // Проверить, есть ли нужные элементы на странице
    if (!document.querySelector('.hero-section')) {
        console.warn(' Герой-секция не найдена, возможно это не главная страница');
        return;
    }
    
    // Инициализация элементов
    initElements();
    
    // Загрузка данных
    loadData();
    
    // Настройка обработчиков событий
    setupEventListeners();
    
    // Настройка навигации
    setupNavigation();
});

// Инициализация элементов
function initElements() {
    console.log('🔧 Инициализация элементов интерфейса...');
    
    // Установка текущего года в футере
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }
    
    // Показать состояние загрузки
    showLoading();
}

// Настройка обработчиков событий
function setupEventListeners() {
    console.log(' Настройка обработчиков событий...');
    
    // Поиск
    if (elements.searchInput) {
        let searchTimeout;
        elements.searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                console.log(' Поиск:', e.target.value);
                filterManufacturers();
            }, 500);
        });
    }
    
    // Фильтры
    if (elements.cityFilter) {
        elements.cityFilter.addEventListener('change', filterManufacturers);
    }
    
    if (elements.typeFilter) {
        elements.typeFilter.addEventListener('change', filterManufacturers);
    }
    
    if (elements.sortSelect) {
        elements.sortSelect.addEventListener('change', filterManufacturers);
    }
    
    // Переключатели
    if (elements.hasPriceFilter) {
        elements.hasPriceFilter.addEventListener('change', filterManufacturers);
    }
    
    if (elements.hasWebsiteFilter) {
        elements.hasWebsiteFilter.addEventListener('change', filterManufacturers);
    }
    
    if (elements.hasEmailFilter) {
        elements.hasEmailFilter.addEventListener('change', filterManufacturers);
    }
    
    // Кнопки
    if (elements.resetFiltersBtn) {
        elements.resetFiltersBtn.addEventListener('click', resetFilters);
    }
    
    if (elements.resetFiltersBtn2) {
        elements.resetFiltersBtn2.addEventListener('click', resetFilters);
    }
    
    if (elements.refreshBtn) {
        elements.refreshBtn.addEventListener('click', loadData);
    }
    
    if (elements.exportBtn) {
        elements.exportBtn.addEventListener('click', exportData);
    }
    
    // Навигация при скролле
    window.addEventListener('scroll', handleScroll);
}
const cityCoordinates = {
    'Москва': [55.7558, 37.6173],
    'Санкт-Петербург': [59.9343, 30.3351],
    'Екатеринбург': [56.8389, 60.6057],
    'Новосибирск': [55.0084, 82.9357],
    'Челябинск': [55.1644, 61.4368],
    'Томск': [56.4977, 84.9744],
    'Волгоград': [48.7080, 44.5133],
    'Хабаровск': [48.4802, 135.0719],
    'Архангельск': [64.5393, 40.5187]
};

// Инициализация карты
function initMap() {
    // Проверим, есть ли элемент карты на странице
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.log('Элемент карты не найден');
        return;
    }
    
    console.log('Инициализация карты...');
    console.log('Доступно производителей:', manufacturersData.length);
    
    // Проверим наличие API Яндекс Карт
    if (typeof ymaps === 'undefined') {
        console.error('API Яндекс Карт не загружен');
        // Покажем сообщение об ошибке
        mapElement.innerHTML = `
            <div class="alert alert-warning text-center py-5">
                <i class="bi bi-exclamation-triangle display-4 mb-3"></i>
                <h5>API Яндекс Карт не загружен</h5>
                <p>Карта не может быть отображена</p>
            </div>
        `;
        return;
    }
    
    // Инициализируем карту через ymaps.ready
    ymaps.ready(initYandexMap);
}

function initYandexMap() {
    console.log('Yandex Maps API готов');
    
    try {
        const map = new ymaps.Map('map', {
            center: [55.76, 37.64],
            zoom: 4,
            controls: ['zoomControl', 'fullscreenControl']
        });
        
        // Создаем кластер для меток
        const clusterer = new ymaps.Clusterer({
            preset: 'islands#greenClusterIcons',
            clusterDisableClickZoom: false,
            clusterHideIconOnBalloonOpen: false,
            geoObjectHideIconOnBalloonOpen: false
        });
        
        let markersCount = 0;
        const dataForMap = manufacturersData.length > 0 ? manufacturersData : [];
        
        console.log('Добавляем метки из данных:', dataForMap.length);
        
        dataForMap.forEach(manufacturer => {
            if (manufacturer.city && cityCoordinates[manufacturer.city]) {
                const coords = cityCoordinates[manufacturer.city];
                const productCount = productsData.filter(p => p.manufacturer_id == manufacturer.id).length;
                
                // Создаем метку
                const placemark = new ymaps.Placemark(coords, {
                    balloonContentHeader: `<strong>${manufacturer.name || 'Производитель'}</strong>`,
                    balloonContentBody: `
                        <div style="max-width: 250px; padding: 5px;">
                            <div><strong>Город:</strong> ${manufacturer.city}</div>
                            <div><strong>Товаров:</strong> ${productCount}</div>
                            ${manufacturer.phone ? `<div><strong>Телефон:</strong> ${manufacturer.phone}</div>` : ''}
                            ${manufacturer.email ? `<div><strong>Email:</strong> ${manufacturer.email}</div>` : ''}
                            <div style="margin-top: 10px;">
                                <button onclick="viewManufacturer(${manufacturer.id})" 
                                        style="background: #10b981; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; width: 100%;">
                                    Подробнее о производителе
                                </button>
                            </div>
                        </div>
                    `,
                    hintContent: manufacturer.name
                }, {
                    preset: 'islands#greenDotIcon',
                    balloonCloseButton: true
                });
                
                // Добавляем метку в кластер
                clusterer.add(placemark);
                markersCount++;
            }
        });
        
        // Добавляем кластер на карту
        map.geoObjects.add(clusterer);
        
        console.log(`Добавлено ${markersCount} меток на карту`);
        
        // Если есть метки, центрируем карту
        if (markersCount > 0) {
            const bounds = clusterer.getBounds();
            if (bounds) {
                map.setBounds(bounds, {
                    checkZoomRange: true,
                    zoomMargin: 50
                });
            }
        }
        
        // Добавляем элементы управления
        map.controls.add('typeSelector');
        map.controls.add('searchControl');
        
    } catch (error) {
        console.error('Ошибка создания карты:', error);
        document.getElementById('map').innerHTML = `
            <div class="alert alert-danger text-center py-5">
                <i class="bi bi-exclamation-triangle display-4 mb-3"></i>
                <h5>Ошибка загрузки карты</h5>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// Настройка навигации
function setupNavigation() {
    console.log(' Настройка навигации...');
    
    // Плавная прокрутка для якорных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#!') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(href);
            
            if (targetElement) {
                const offset = 80;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                
                window.scrollTo({
                    top: targetPosition - offset,
                    behavior: 'smooth'
                });
                
                // Закрыть меню на мобильных
                if (window.innerWidth < 992) {
                    const navbarCollapse = document.querySelector('.navbar-collapse.show');
                    if (navbarCollapse) {
                        const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                        bsCollapse.hide();
                    }
                }
            }
        });
    });
    
    // Скрыть/показать navbar при скролле
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    
    if (navbar) {
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            lastScrollTop = scrollTop;
        });
    }
}

// Обработка скролла
function handleScroll() {
    // Эффект параллакса для hero
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-section');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.05}px)`;
    }
}

// Показать состояние загрузки
function showLoading() {
    if (elements.loadingState) elements.loadingState.classList.remove('d-none');
    if (elements.emptyState) elements.emptyState.classList.add('d-none');
    if (elements.manufacturersGrid) {
        elements.manufacturersGrid.classList.add('d-none');
        elements.manufacturersGrid.innerHTML = '';
    }
}

// Показать пустое состояние
function showEmptyState() {
    if (elements.loadingState) elements.loadingState.classList.add('d-none');
    if (elements.emptyState) elements.emptyState.classList.remove('d-none');
    if (elements.manufacturersGrid) elements.manufacturersGrid.classList.add('d-none');
}

// Показать сетку производителей
function showManufacturersGrid() {
    if (elements.loadingState) elements.loadingState.classList.add('d-none');
    if (elements.emptyState) elements.emptyState.classList.add('d-none');
    if (elements.manufacturersGrid) elements.manufacturersGrid.classList.remove('d-none');
}

// Загрузка данных
function loadData() {
    console.log('📥 Загрузка данных...');
    
    try {
        showLoading();
        
        // Показать индикатор загрузки на кнопке
        if (elements.refreshBtn) {
            const originalHtml = elements.refreshBtn.innerHTML;
            elements.refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise spin"></i>';
            elements.refreshBtn.disabled = true;
        }
        
        // Загрузка производителей
        console.log('Запрашиваем производителей по адресу:', API_BASE + 'manufacturers.php');
        const manResponse = await fetch(API_BASE + 'manufacturers.php', {
            headers: { 
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
        
        console.log('Ответ сервера (производители):', manResponse.status, manResponse.statusText);
        
        if (!manResponse.ok) {
            throw new Error(`Ошибка загрузки производителей: ${manResponse.status} ${manResponse.statusText}`);
        }
        
        const manText = await manResponse.text();
        console.log('Ответ текстом:', manText.substring(0, 200));
        
        let manData;
        try {
            manData = JSON.parse(manText);
        } catch (e) {
            console.error('Ошибка парсинга JSON:', e);
            throw new Error('Сервер вернул невалидный JSON');
        }
        
        console.log(' Производители загружены:', manData.success, manData.data?.length || 0);
        
        // Загрузка продуктов
        console.log('Запрашиваем продукты по адресу:', API_BASE + 'products.php');
        const prodResponse = await fetch(API_BASE + 'products.php', {
            headers: { 
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
        
        console.log('Ответ сервера (продукты):', prodResponse.status, prodResponse.statusText);
        
        if (!prodResponse.ok) {
            throw new Error(`Ошибка загрузки продуктов: ${prodResponse.status} ${prodResponse.statusText}`);
        }
        
        const prodText = await prodResponse.text();
        let prodData;
        try {
            prodData = JSON.parse(prodText);
        } catch (e) {
            console.error('Ошибка парсинга JSON:', e);
            throw new Error('Сервер вернул невалидный JSON');
        }
        
        console.log(' Продукты загружены:', prodData.success, prodData.data?.length || 0);
        
        if (manData.success && prodData.success) {
            manufacturersData = manData.data || [];
            productsData = prodData.data || [];
            
            console.log(` Данные: ${manufacturersData.length} производителей, ${productsData.length} товаров`);
            
            // Обновить статистику
            updateStats();
            
            // Обновить фильтры
            updateFilters();
            
            // ОТОБРАЗИТЬ КАРТУ - УБИРАЕМ ТАЙМАУТ, ИНИЦИАЛИЗИРУЕМ СРАЗУ
            const mapElement = document.getElementById('map');
            if (mapElement && typeof ymaps !== 'undefined') {
                console.log('Инициализируем карту...');
                initMap();
            } else if (mapElement) {
                console.log('Ждем загрузку Яндекс Карт...');
                // Если API еще не загрузилось, ждем
                setTimeout(() => {
                    if (typeof ymaps !== 'undefined') {
                        initMap();
                    }
                }, 1000);
            }
            
            // Отобразить производителей (если есть сетка)
            if (elements.manufacturersGrid) {
                filterManufacturers();
            }
            
            // Показать уведомление
            showNotification('Данные успешно загружены', 'success');
            
        } else {
            throw new Error('API вернуло ошибку');
        }
        
    } catch (error) {
        console.error(' Ошибка загрузки данных:', error);
        showNotification(`Ошибка: ${error.message}`, 'danger');
        
        // Показать детализированную ошибку
        const errorDetails = `
            <div class="alert alert-danger mt-3">
                <h6><i class="bi bi-exclamation-triangle me-2"></i>Ошибка загрузки данных</h6>
                <p class="mb-2">${error.message}</p>
                <small>
                    Проверьте:<br>
                    1. Запущен ли XAMPP/Apache<br>
                    2. Доступен ли API по адресу: ${API_BASE}<br>
                    3. Открывается ли <a href="${API_BASE}health.php" target="_blank">${API_BASE}health.php</a>
                </small>
            </div>
        `;
        
        if (elements.manufacturersGrid) {
            elements.manufacturersGrid.innerHTML = errorDetails;
            elements.manufacturersGrid.classList.remove('d-none');
        }
        
        showEmptyState();
    } finally {
        // Восстановить кнопку обновления
        if (elements.refreshBtn) {
            elements.refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i><span class="d-none d-md-inline"> Обновить</span>';
            elements.refreshBtn.disabled = false;
        }
    }
}
function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.log('Элемент карты не найден');
        return;
    }
    
    console.log('Инициализация карты Leaflet...');
    
    // Создаем карту с центром на Москве
    const map = L.map('map').setView([55.76, 37.64], 4);
    
    // Добавляем слой OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);
    
    // Добавляем метки производителей
    let markersCount = 0;
    
    manufacturersData.forEach(manufacturer => {
        if (manufacturer.city && cityCoordinates[manufacturer.city]) {
            const coords = cityCoordinates[manufacturer.city];
            const productCount = productsData.filter(p => p.manufacturer_id == manufacturer.id).length;
            
            // Создаем иконку
            const greenIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color:#10b981; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; border:3px solid white; box-shadow:0 0 10px rgba(0,0,0,0.3);">${markersCount + 1}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
            
            // Создаем метку
            const marker = L.marker(coords, { icon: greenIcon }).addTo(map);
            
            // Добавляем всплывающее окно
            marker.bindPopup(`
                <div style="min-width:250px; padding:10px;">
                    <h4 style="margin:0 0 10px 0; color:#10b981;">${manufacturer.name}</h4>
                    <p><strong>Город:</strong> ${manufacturer.city}</p>
                    <p><strong>Товаров:</strong> ${productCount}</p>
                    ${manufacturer.phone ? `<p><strong>Телефон:</strong> ${manufacturer.phone}</p>` : ''}
                    ${manufacturer.email ? `<p><strong>Email:</strong> ${manufacturer.email}</p>` : ''}
                    <button onclick="viewManufacturer(${manufacturer.id})" 
                            style="background:#10b981; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer; width:100%; margin-top:10px;">
                        Подробнее
                    </button>
                </div>
            `);
            
            markersCount++;
        }
    });
    
    console.log(`Добавлено ${markersCount} меток на карту`);
    
    // Если есть метки, центрируем карту
    if (markersCount > 0) {
        const markers = [];
        manufacturersData.forEach(manufacturer => {
            if (manufacturer.city && cityCoordinates[manufacturer.city]) {
                markers.push(cityCoordinates[manufacturer.city]);
            }
        });
        
        if (markers.length > 0) {
            const bounds = L.latLngBounds(markers);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }
    
    // Добавляем контролы
    L.control.scale().addTo(map);
}

// Обновление статистики
function updateStats() {
    console.log(' Обновление статистики...');
    
    // Производители
    if (elements.manufacturerCount) {
        elements.manufacturerCount.textContent = manufacturersData.length;
    }
    
    // Продукты
    if (elements.productCount) {
        elements.productCount.textContent = productsData.length;
    }
    
    // Города
    const uniqueCities = [...new Set(manufacturersData
        .map(m => m.city)
        .filter(city => city && city.trim() !== '')
    )];
    
    if (elements.cityCount) {
        elements.cityCount.textContent = uniqueCities.length;
    }
    
    // Типы
    const uniqueTypes = [...new Set(productsData
        .map(p => p.type)
        .filter(type => type && type.trim() !== '')
    )];
    
    if (elements.typeCount) {
        elements.typeCount.textContent = uniqueTypes.length;
    }
}

// Обновление фильтров
function updateFilters() {
    console.log(' Обновление фильтров...');
    
    // Фильтр городов
    if (elements.cityFilter) {
        const cities = [...new Set(manufacturersData
            .map(m => m.city)
            .filter(city => city && city.trim() !== '')
            .sort()
        )];
        
        let options = '<option value="">Все города</option>';
        cities.forEach(city => {
            options += `<option value="${city}">${city}</option>`;
        });
        
        elements.cityFilter.innerHTML = options;
    }
    
    // Фильтр типов
    if (elements.typeFilter) {
        const types = [...new Set(productsData
            .map(p => p.type)
            .filter(type => type && type.trim() !== '')
            .sort()
        )];
        
        let options = '<option value="">Все типы</option>';
        types.forEach(type => {
            options += `<option value="${type}">${type}</option>`;
        });
        
        elements.typeFilter.innerHTML = options;
    }
}

// Фильтрация производителей
function filterManufacturers() {
    console.log(' Фильтрация производителей...');
    
    if (manufacturersData.length === 0) {
        showEmptyState();
        return;
    }
    
    // Применяем фильтры
    filteredManufacturers = [...manufacturersData];
    
    // Поиск по названию и городу
    const search = elements.searchInput?.value.toLowerCase() || '';
    if (search) {
        filteredManufacturers = filteredManufacturers.filter(m => 
            (m.name && m.name.toLowerCase().includes(search)) ||
            (m.city && m.city.toLowerCase().includes(search)) ||
            (m.description && m.description.toLowerCase().includes(search))
        );
    }
    
    // Фильтр по городу
    const city = elements.cityFilter?.value || '';
    if (city) {
        filteredManufacturers = filteredManufacturers.filter(m => m.city === city);
    }
    
    // Фильтр по типу (через продукты)
    const type = elements.typeFilter?.value || '';
    if (type) {
        const manufacturerIdsWithType = [...new Set(productsData
            .filter(p => p.type === type)
            .map(p => p.manufacturer_id)
        )];
        filteredManufacturers = filteredManufacturers.filter(m => 
            manufacturerIdsWithType.includes(m.id)
        );
    }
    
    // Дополнительные фильтры
    if (elements.hasPriceFilter?.checked) {
        const manufacturerIdsWithPrice = [...new Set(productsData
            .filter(p => p.price && p.price > 0)
            .map(p => p.manufacturer_id)
        )];
        filteredManufacturers = filteredManufacturers.filter(m => 
            manufacturerIdsWithPrice.includes(m.id)
        );
    }
    
    if (elements.hasWebsiteFilter?.checked) {
        filteredManufacturers = filteredManufacturers.filter(m => 
            m.website && m.website.trim() !== ''
        );
    }
    
    if (elements.hasEmailFilter?.checked) {
        filteredManufacturers = filteredManufacturers.filter(m => 
            m.email && m.email.trim() !== ''
        );
    }
    
    // Сортировка
    const sort = elements.sortSelect?.value || 'name';
    switch(sort) {
        case 'city':
            filteredManufacturers.sort((a, b) => (a.city || '').localeCompare(b.city || ''));
            break;
        case 'products':
            filteredManufacturers.sort((a, b) => {
                const aCount = productsData.filter(p => p.manufacturer_id == a.id).length;
                const bCount = productsData.filter(p => p.manufacturer_id == b.id).length;
                return bCount - aCount;
            });
            break;
        default: // name
            filteredManufacturers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    
    // Обновить счетчик результатов
    if (elements.resultsCount) {
        const count = filteredManufacturers.length;
        elements.resultsCount.textContent = count === 0 ? 'Ничего не найдено' : 
            `Найдено ${count} ${pluralize(count, ['производитель', 'производителя', 'производителей'])}`;
    }
    
    // Показать/скрыть кнопку экспорта
    if (elements.exportBtn) {
        if (filteredManufacturers.length > 0) {
            elements.exportBtn.classList.remove('d-none');
        } else {
            elements.exportBtn.classList.add('d-none');
        }
    }
    
    // Отобразить результаты
    renderManufacturers();
}

// Отображение производителей
function renderManufacturers() {
    console.log(' Отображение производителей...');
    
    if (filteredManufacturers.length === 0) {
        showEmptyState();
        return;
    }
    
    showManufacturersGrid();
    
    const grid = elements.manufacturersGrid;
    if (!grid) return;
    
    let html = '';
    
    filteredManufacturers.forEach(manufacturer => {
        // Подсчет товаров
        const productCount = productsData.filter(p => p.manufacturer_id == manufacturer.id).length;
        
        // Форматирование контактов
        const contacts = [];
        if (manufacturer.phone) {
            contacts.push(`<div class="contact-item"><i class="bi bi-telephone"></i> ${manufacturer.phone}</div>`);
        }
        if (manufacturer.email) {
            contacts.push(`<div class="contact-item"><i class="bi bi-envelope"></i> ${manufacturer.email}</div>`);
        }
        if (manufacturer.website) {
            contacts.push(`<div class="contact-item"><i class="bi bi-globe"></i> ${manufacturer.website}</div>`);
        }
        
        // Получить типы товаров производителя
        const manufacturerProducts = productsData.filter(p => p.manufacturer_id == manufacturer.id);
        const productTypes = [...new Set(manufacturerProducts.map(p => p.type).filter(Boolean))];
        
        html += `
            <div class="col-md-4 mb-4">
                <div class="product-card manufacturer-card">
                    <div class="product-img">
                        <i class="bi bi-building"></i>
                    </div>
                    <div class="product-body">
                        <h5 class="product-title">${manufacturer.name || 'Без названия'}</h5>
                        
                        <div class="product-manufacturer mb-2">
                            <i class="bi bi-geo-alt me-1"></i>
                            <strong>${manufacturer.city || 'Город не указан'}</strong>
                        </div>
                        
                        ${manufacturer.description ? `
                            <p class="product-specs">${manufacturer.description.substring(0, 100)}...</p>
                        ` : ''}
                        
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div class="product-price">
                                <span class="badge bg-primary">${productCount} товаров</span>
                            </div>
                            
                            ${productTypes.length > 0 ? `
                                <div>
                                    ${productTypes.slice(0, 2).map(type => `
                                        <span class="badge bg-info me-1">${type}</span>
                                    `).join('')}
                                    ${productTypes.length > 2 ? `<span class="badge bg-secondary">+${productTypes.length - 2}</span>` : ''}
                                </div>
                            ` : ''}
                        </div>
                        
                        ${contacts.length > 0 ? `
                            <div class="manufacturer-contacts mb-3">
                                ${contacts.join('')}
                            </div>
                        ` : ''}
                        
                        <button class="btn btn-green w-100" onclick="viewManufacturer(${manufacturer.id})">
                            <i class="bi bi-eye me-2"></i>Подробнее
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    grid.innerHTML = html;
    
    // Инициализация анимаций
    initAnimations();
}

// Просмотр производителя
function viewManufacturer(id) {
    console.log(' Просмотр производителя:', id);
    
    // Сохранить ID в localStorage для использования на странице производителя
    localStorage.setItem('selectedManufacturerId', id);
    
    // Перенаправление на страницу производителя
    window.location.href = 'manufacturer.html?id=' + id;
}

// Сброс фильтров
function resetFilters() {
    console.log(' Сброс фильтров...');
    
    if (elements.searchInput) elements.searchInput.value = '';
    if (elements.cityFilter) elements.cityFilter.value = '';
    if (elements.typeFilter) elements.typeFilter.value = '';
    if (elements.sortSelect) elements.sortSelect.value = 'name';
    if (elements.hasPriceFilter) elements.hasPriceFilter.checked = false;
    if (elements.hasWebsiteFilter) elements.hasWebsiteFilter.checked = false;
    if (elements.hasEmailFilter) elements.hasEmailFilter.checked = false;
    
    filterManufacturers();
    showNotification('Фильтры сброшены', 'info');
}

// Экспорт данных
function exportData() {
    console.log(' Экспорт данных...');
    
    if (filteredManufacturers.length === 0) {
        showNotification('Нет данных для экспорта', 'warning');
        return;
    }
    
    // Подготовка данных для экспорта
    const exportData = filteredManufacturers.map(man => {
        const products = productsData.filter(p => p.manufacturer_id == man.id);
        const productTypes = [...new Set(products.map(p => p.type).filter(Boolean))];
        
        return {
            'ID': man.id,
            'Название': man.name || '',
            'Город': man.city || '',
            'Сайт': man.website || '',
            'Телефон': man.phone || '',
            'Email': man.email || '',
            'Количество товаров': products.length,
            'Типы товаров': productTypes.join(', '),
            'Описание': man.description ? man.description.substring(0, 100) + '...' : ''
        };
    });
    
    // Создание CSV
    const headers = Object.keys(exportData[0]);
    const csv = [
        headers.join(','),
        ...exportData.map(row => 
            headers.map(header => 
                `"${String(row[header] || '').replace(/"/g, '""')}"`
            ).join(',')
        )
    ].join('\n');
    
    // Создание ссылки для скачивания
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cable_production_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Данные экспортированы', 'success');
}

// Показать уведомление
function showNotification(message, type = 'info') {
    // Удалить старые уведомления
    const oldNotifications = document.querySelectorAll('.notification');
    oldNotifications.forEach(n => n.remove());
    
    // Определить иконку и цвет
    let icon, bgColor, textColor;
    switch(type) {
        case 'success':
            icon = 'bi-check-circle-fill';
            bgColor = 'rgba(0, 255, 136, 0.2)';
            textColor = '#00ff88';
            break;
        case 'danger':
            icon = 'bi-exclamation-triangle-fill';
            bgColor = 'rgba(255, 0, 0, 0.2)';
            textColor = '#ff0000';
            break;
        case 'warning':
            icon = 'bi-exclamation-circle-fill';
            bgColor = 'rgba(255, 193, 7, 0.2)';
            textColor = '#ffc107';
            break;
        default:
            icon = 'bi-info-circle-fill';
            bgColor = 'rgba(13, 110, 253, 0.2)';
            textColor = '#0d6efd';
    }
    
    // Создать уведомление
    const notification = document.createElement('div');
    notification.className = `notification alert alert-${type} alert-dismissible fade show`;
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi ${icon} me-2"></i>
            <span>${message}</span>
        </div>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="alert"></button>
    `;
    
    // Добавить стили
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        max-width: 500px;
        background: ${bgColor};
        border: 1px solid ${textColor};
        color: ${textColor};
        border-radius: 12px;
        backdrop-filter: blur(10px);
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Удалить через 5 секунд
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Инициализация анимаций
function initAnimations() {
    // Запустить анимации при появлении в области видимости
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '50px'
    });
    
    const cards = document.querySelectorAll('.manufacturer-card');
    cards.forEach(card => observer.observe(card));
}

// Утилиты
function pluralize(number, words) {
    const cases = [2, 0, 1, 1, 1, 2];
    return words[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[Math.min(number % 10, 5)]];
}

// Добавить стиль для вращающейся иконки
const style = document.createElement('style');
style.textContent = `
    .spin {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .manufacturer-contacts {
        font-size: 0.875rem;
    }
    
    .contact-item {
        margin-bottom: 0.25rem;
        display: flex;
        align-items: center;
    }
    
    .contact-item i {
        margin-right: 0.5rem;
        width: 20px;
        text-align: center;
    }
`;
document.head.appendChild(style);

console.log(' Приложение инициализировано!');

// Экспорт функций для глобального использования
window.viewManufacturer = viewManufacturer;
window.loadData = loadData;
window.resetFilters = resetFilters;
window.exportData = exportData;