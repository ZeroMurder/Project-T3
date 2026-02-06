-- Удаляем существующие таблицы если есть
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS manufacturers;

-- Создаем таблицу manufacturers
CREATE TABLE IF NOT EXISTS manufacturers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    website VARCHAR(500),
    city VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Создаем таблицу products
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    manufacturer_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    price DECIMAL(10,2),
    unit VARCHAR(20),
    specs TEXT,
    url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Создаем индексы БЕЗ дублирования имен
CREATE INDEX idx_m_city ON manufacturers(city);
CREATE INDEX idx_m_name ON manufacturers(name);
CREATE INDEX idx_p_type ON products(type);
CREATE INDEX idx_p_manufacturer ON products(manufacturer_id);
CREATE INDEX idx_p_price ON products(price);