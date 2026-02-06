<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Обработка preflight запросов (CORS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Подключаемся к базе данных
require_once '../config/database.php';
require_once '../models/Manufacturer.php';
require_once '../models/Product.php';

// Создаем соединение с БД
$database = new Database();
$db = $database->getConnection();

// Определяем метод запроса
$method = $_SERVER['REQUEST_METHOD'];

// Обрабатываем только POST запросы
if ($method == 'POST') {
    // Получаем входные данные
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['manufacturer_id'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Не указан ID производителя'
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    $manufacturer_id = intval($input['manufacturer_id']);
    
    try {
        // Получаем данные производителя
        $manufacturer = new Manufacturer($db);
        $manufacturer->id = $manufacturer_id;
        $manData = $manufacturer->readOne();
        
        if (!$manData) {
            echo json_encode([
                'success' => false,
                'message' => 'Производитель не найден'
            ], JSON_UNESCAPED_UNICODE);
            exit();
        }
        
        // Имитация парсинга - добавляем тестовые товары
        $demo_products = [
            [
                'name' => 'Кабель ВВГнг 3x1.5 (парсинг)',
                'type' => 'Силовой',
                'price' => 45.50,
                'unit' => 'м',
                'specs' => 'Сечение 3x1.5 мм², напряжение 0.66/1 кВ',
                'url' => 'https://example.com/cable1'
            ],
            [
                'name' => 'Провод ПВС 2x1.5 (парсинг)',
                'type' => 'Монтажный',
                'price' => 28.30,
                'unit' => 'м',
                'specs' => 'Для бытовых электроприборов',
                'url' => 'https://example.com/cable2'
            ]
        ];
        
        $added_count = 0;
        $product = new Product($db);
        
        foreach ($demo_products as $prod) {
            $product->manufacturer_id = $manufacturer_id;
            $product->name = $prod['name'];
            $product->type = $prod['type'];
            $product->price = $prod['price'];
            $product->unit = $prod['unit'];
            $product->specs = $prod['specs'];
            $product->url = $prod['url'];
            
            if ($product->create()) {
                $added_count++;
            }
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Парсинг выполнен успешно',
            'manufacturer_name' => $manData['name'],
            'products_found' => count($demo_products),
            'products_added' => $added_count,
            'note' => 'Это демо-режим. В реальном проекте здесь будет парсинг реального сайта.'
        ], JSON_UNESCAPED_UNICODE);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Ошибка: ' . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
    
} else {
    // Неправильный метод запроса
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Метод не поддерживается. Используйте POST.'
    ], JSON_UNESCAPED_UNICODE);
}
?>