// Страница производителя
document.addEventListener('DOMContentLoaded', function() {
    console.log('Страница производителя загружается...');
    
    // Получаем ID производителя из URL
    const urlParams = new URLSearchParams(window.location.search);
    const manufacturerId = urlParams.get('id');
    
    if (!manufacturerId) {
        showError('ID производителя не указан');
        return;
    }
    
    loadManufacturerData(manufacturerId);
});

// Загрузка данных производителя
async function loadManufacturerData(id) {
    try {
        // Загружаем информацию о производителе
        const manufacturerResponse = await fetch(`../backend/api/manufacturers.php?id=${id}`);
        const manufacturerData = await manufacturerResponse.json();
        
        if (!manufacturerData.success) {
            throw new Error('Производитель не найден');
        }
        
        const manufacturer = manufacturerData.data;
        
        // Загружаем продукцию производителя
        const productsResponse = await fetch(`../backend/api/products.php?manufacturer_id=${id}`);
        const productsData = await productsResponse.json();
        const products = productsData.success ? productsData.data : [];
        
        // Отображаем данные
        displayManufacturerInfo(manufacturer);
        displayProducts(products);
        
    } catch (error) {
        console.error('Error loading manufacturer data:', error);
        showError('Ошибка загрузки данных производителя');
    }
}

// Отображение информации о производителе
function displayManufacturerInfo(manufacturer) {
    const container = document.getElementById('manufacturerInfo');
    
    if (!container) return;
    
    let html = `
        <div class="card shadow-lg">
            <div class="card-header bg-primary text-white">
                <h2 class="mb-0"><i class="bi bi-building me-2"></i>${escapeHtml(manufacturer.name)}</h2>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <h4 class="text-primary mb-3">
                            <i class="bi bi-geo-alt me-2"></i>${escapeHtml(manufacturer.city || 'Город не указан')}
                        </h4>
                        
                        <div class="mb-4">
                            <h5>Контактная информация:</h5>
                            <div class="row">
                                ${manufacturer.phone ? `
                                    <div class="col-md-6 mb-2">
                                        <i class="bi bi-telephone text-primary me-2"></i>
                                        <strong>Телефон:</strong>
                                        <a href="tel:${escapeHtml(manufacturer.phone)}" class="ms-2">
                                            ${escapeHtml(manufacturer.phone)}
                                        </a>
                                    </div>
                                ` : ''}
                                
                                ${manufacturer.email ? `
                                    <div class="col-md-6 mb-2">
                                        <i class="bi bi-envelope text-primary me-2"></i>
                                        <strong>Email:</strong>
                                        <a href="mailto:${escapeHtml(manufacturer.email)}" class="ms-2">
                                            ${escapeHtml(manufacturer.email)}
                                        </a>
                                    </div>
                                ` : ''}
                                
                                ${manufacturer.website ? `
                                    <div class="col-md-6 mb-2">
                                        <i class="bi bi-globe text-primary me-2"></i>
                                        <strong>Сайт:</strong>
                                        <a href="${escapeHtml(manufacturer.website)}" target="_blank" class="ms-2">
                                            ${escapeHtml(manufacturer.website)}
                                        </a>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <h5>Описание:</h5>
                            <p class="lead">${escapeHtml(manufacturer.description || 'Описание отсутствует')}</p>
                        </div>
                    </div>
                    
                    <div class="col-md-4">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <div class="bg-primary rounded-circle p-4 d-inline-block mb-3">
                                    <i class="bi bi-building text-white display-4"></i>
                                </div>
                                
                                ${manufacturer.website ? `
                                    <a href="${escapeHtml(manufacturer.website)}" 
                                       target="_blank" 
                                       class="btn btn-primary btn-lg w-100 mb-2">
                                        <i class="bi bi-globe me-2"></i>Перейти на сайт
                                    </a>
                                ` : ''}
                                
                                ${manufacturer.phone ? `
                                    <a href="tel:${escapeHtml(manufacturer.phone)}" 
                                       class="btn btn-success btn-lg w-100 mb-2">
                                        <i class="bi bi-telephone me-2"></i>Позвонить
                                    </a>
                                ` : ''}
                                
                                ${manufacturer.email ? `
                                    <a href="mailto:${escapeHtml(manufacturer.email)}" 
                                       class="btn btn-info btn-lg w-100">
                                        <i class="bi bi-envelope me-2"></i>Написать email
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// Отображение продукции
function displayProducts(products) {
    const container = document.getElementById('productsList');
    
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="bi bi-info-circle me-2"></i>
                У этого производителя пока нет товаров в каталоге.
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="table-responsive">
            <table class="table table-hover table-striped">
                <thead class="table-primary">
                    <tr>
                        <th>#</th>
                        <th>Название</th>
                        <th>Тип</th>
                        <th>Цена</th>
                        <th>Ед. изм.</th>
                        <th>Характеристики</th>
                        <th>Ссылка</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    products.forEach((product, index) => {
        html += `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${escapeHtml(product.name)}</strong></td>
                <td>
                    <span class="badge ${getTypeBadgeClass(product.type)}">
                        ${escapeHtml(product.type || 'Не указан')}
                    </span>
                </td>
                <td>
                    ${product.price ? `
                        <span class="text-success fw-bold">
                            ${parseFloat(product.price).toFixed(2)} руб.
                        </span>
                    ` : '<span class="text-muted">По запросу</span>'}
                </td>
                <td>${escapeHtml(product.unit || 'м')}</td>
                <td class="small">${escapeHtml(product.specs || 'Характеристики не указаны')}</td>
                <td>
                    ${product.url ? `
                        <a href="${escapeHtml(product.url)}" target="_blank" class="btn btn-sm btn-outline-primary">
                            <i class="bi bi-link-45deg"></i>
                        </a>
                    ` : ''}
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
        
        <div class="mt-3">
            <div class="alert alert-success">
                <i class="bi bi-box-seam me-2"></i>
                Найдено товаров: <strong>${products.length}</strong>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// Получить класс для бейджа типа
function getTypeBadgeClass(type) {
    const typeClasses = {
        'Силовой': 'bg-danger',
        'Оптический': 'bg-success',
        'СИП': 'bg-warning text-dark',
        'Витая пара': 'bg-info',
        'Коаксиальный': 'bg-secondary',
        'Контрольный': 'bg-primary',
        'Установочный': 'bg-dark',
        'Гибкий': 'bg-purple'
    };
    
    return typeClasses[type] || 'bg-secondary';
}

// Показать ошибку
function showError(message) {
    const container = document.getElementById('manufacturerInfo');
    if (container) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    ${message}
                    <a href="index.html" class="btn btn-sm btn-outline-danger ms-3">
                        <i class="bi bi-arrow-left me-1"></i>Вернуться на главную
                    </a>
                </div>
            </div>
        `;
    }
}

// Экранирование HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}