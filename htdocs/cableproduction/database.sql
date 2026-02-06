-- CableProduction Database Schema
-- Version: 1.0
-- Created: 2024-01-01

-- База данных
CREATE DATABASE IF NOT EXISTS cableproduction_db;
USE cableproduction_db;

-- Таблица производителей
CREATE TABLE manufacturers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Россия',
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    description TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    featured BOOLEAN DEFAULT FALSE,
    product_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Таблица товаров
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'м',
    specs TEXT,
    manufacturer_id INT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id) ON DELETE SET NULL
);

-- Таблица категорий
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    product_count INT DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица администраторов
CREATE TABLE admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    full_name VARCHAR(255),
    role ENUM('admin', 'editor', 'viewer') DEFAULT 'editor',
    last_login TIMESTAMP NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица логов
CREATE TABLE activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT,
    action VARCHAR(255),
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id)
);

-- Начальные данные

-- Производители
INSERT INTO manufacturers (id, name, city, country, email, phone, website, description, status, featured, product_count) VALUES
(1, 'Энергомонтаж', 'Москва', 'Россия', 'info@energomontag.ru', '+7 (495) 123-45-67', 'energomontag.ru', 'Производитель силовых кабелей', 'active', TRUE, 15),
(2, 'Электрокабель', 'Санкт-Петербург', 'Россия', 'sales@elektrokabel.ru', '+7 (812) 234-56-78', 'elektrokabel.ru', 'Производитель оптических кабелей', 'active', FALSE, 12),
(3, 'Сибкабель', 'Новосибирск', 'Россия', 'contact@sibkabel.ru', '+7 (383) 345-67-89', 'sibkabel.ru', 'Производитель кабельной продукции', 'active', TRUE, 8),
(4, 'Москабель', 'Москва', 'Россия', 'info@moskabel.ru', '+7 (495) 456-78-90', 'moskabel.ru', 'Крупный производитель кабелей', 'active', TRUE, 20);

-- Товары
INSERT INTO products (id, name, type, price, unit, specs, manufacturer_id, status) VALUES
(1, 'Кабель ВВГнг 3х2.5', 'Силовой', 45.50, 'м', 'Напряжение 0.66/1 кВ, сечение 3x2.5 мм², не распространяющий горение', 1, 'active'),
(2, 'Оптический кабель ОКБ-12', 'Оптический', 150.00, 'м', '12 волокон, бронированный, для прокладки в грунт', 2, 'active'),
(3, 'Кабель UTP Cat.6', 'Витая пара', 25.30, 'м', 'Витая пара, 4 пары, категория 6, неэкранированный', 3, 'active'),
(4, 'Кабель РК-75', 'Коаксиальный', 38.75, 'м', 'Коаксиальный кабель 75 Ом, для телевидения', 1, 'active'),
(5, 'Кабель СИП-4 16мм²', 'Силовой', 89.90, 'м', 'Самонесущий изолированный провод, 16 мм²', 2, 'active'),
(6, 'Кабель ВВГнг-LS 5х6', 'Силовой', 120.50, 'м', 'Пониженное дымо- и газовыделение, 5x6 мм²', 3, 'active');

-- Категории
INSERT INTO categories (id, name, description, icon, product_count) VALUES
(1, 'Силовые кабели', 'ВВГ, АВВГ, СИП и другие', 'bi-lightning', 3),
(2, 'Оптические кабели', 'Волоконно-оптические линии связи', 'bi-wifi', 1),
(3, 'Сетевые кабели', 'Витая пара, патч-корды', 'bi-hdd-network', 1),
(4, 'Коаксиальные кабели', 'Для телевидения и видеонаблюдения', 'bi-tv', 1);

-- Администратор по умолчанию (пароль: admin123)
INSERT INTO admins (id, username, password_hash, email, full_name, role) VALUES
(1, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@cableproduction.ru', 'Администратор Системы', 'admin');

-- Индексы для оптимизации
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_manufacturer ON products(manufacturer_id);
CREATE INDEX idx_manufacturers_status ON manufacturers(status);
CREATE INDEX idx_manufacturers_featured ON manufacturers(featured);
CREATE INDEX idx_logs_admin ON activity_logs(admin_id);
CREATE INDEX idx_logs_created ON activity_logs(created_at);

-- Триггер для обновления счетчика товаров производителя
DELIMITER //
CREATE TRIGGER update_manufacturer_product_count
AFTER INSERT ON products
FOR EACH ROW
BEGIN
    UPDATE manufacturers 
    SET product_count = (SELECT COUNT(*) FROM products WHERE manufacturer_id = NEW.manufacturer_id AND status = 'active')
    WHERE id = NEW.manufacturer_id;
END//
DELIMITER ;

-- Триггер для обновления счетчика при изменении статуса товара
DELIMITER //
CREATE TRIGGER update_product_status_count
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status OR OLD.manufacturer_id != NEW.manufacturer_id THEN
        UPDATE manufacturers 
        SET product_count = (SELECT COUNT(*) FROM products WHERE manufacturer_id = NEW.manufacturer_id AND status = 'active')
        WHERE id = NEW.manufacturer_id;
        
        IF OLD.manufacturer_id != NEW.manufacturer_id THEN
            UPDATE manufacturers 
            SET product_count = (SELECT COUNT(*) FROM products WHERE manufacturer_id = OLD.manufacturer_id AND status = 'active')
            WHERE id = OLD.manufacturer_id;
        END IF;
    END IF;
END//
DELIMITER ;

-- Триггер для обновления счетчика при удалении товара
DELIMITER //
CREATE TRIGGER delete_product_count
AFTER DELETE ON products
FOR EACH ROW
BEGIN
    UPDATE manufacturers 
    SET product_count = (SELECT COUNT(*) FROM products WHERE manufacturer_id = OLD.manufacturer_id AND status = 'active')
    WHERE id = OLD.manufacturer_id;
END//
DELIMITER ;

-- Представление для статистики
CREATE VIEW product_statistics AS
SELECT 
    m.name as manufacturer_name,
    COUNT(p.id) as total_products,
    SUM(CASE WHEN p.status = 'active' THEN 1 ELSE 0 END) as active_products,
    AVG(p.price) as average_price,
    MIN(p.price) as min_price,
    MAX(p.price) as max_price
FROM manufacturers m
LEFT JOIN products p ON m.id = p.manufacturer_id
GROUP BY m.id, m.name;

-- Представление для категорий
CREATE VIEW category_statistics AS
SELECT 
    p.type as category,
    COUNT(p.id) as product_count,
    AVG(p.price) as average_price
FROM products p
WHERE p.type IS NOT NULL
GROUP BY p.type;

-- Процедура для поиска товаров
DELIMITER //
CREATE PROCEDURE search_products(
    IN search_term VARCHAR(255),
    IN product_type VARCHAR(100),
    IN min_price DECIMAL(10,2),
    IN max_price DECIMAL(10,2)
)
BEGIN
    SELECT 
        p.*,
        m.name as manufacturer_name,
        m.city as manufacturer_city
    FROM products p
    LEFT JOIN manufacturers m ON p.manufacturer_id = m.id
    WHERE p.status = 'active'
        AND (search_term IS NULL OR p.name LIKE CONCAT('%', search_term, '%') OR p.specs LIKE CONCAT('%', search_term, '%'))
        AND (product_type IS NULL OR p.type = product_type)
        AND (min_price IS NULL OR p.price >= min_price)
        AND (max_price IS NULL OR p.price <= max_price)
    ORDER BY p.name;
END//
DELIMITER ;

-- Процедура для получения популярных товаров
DELIMITER //
CREATE PROCEDURE get_popular_products(IN limit_count INT)
BEGIN
    SELECT 
        p.*,
        m.name as manufacturer_name
    FROM products p
    LEFT JOIN manufacturers m ON p.manufacturer_id = m.id
    WHERE p.status = 'active'
    ORDER BY p.created_at DESC
    LIMIT limit_count;
END//
DELIMITER ;