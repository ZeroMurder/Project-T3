<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Разрешаем preflight запросы
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Теперь подключаем остальные файлы
require_once '../config/database.php';
require_once '../models/Product.php';

// Создаем объекты
$database = new Database();
$db = $database->getConnection();
$product = new Product($db);

// Получаем метод запроса
$method = $_SERVER['REQUEST_METHOD'];

// Обработка запросов
try {
    switch ($method) {
        case 'GET':
            // Если есть ID - возвращаем один товар
            if (isset($_GET['id']) && is_numeric($_GET['id'])) {
                $product->id = (int)$_GET['id'];
                $result = $product->readOne();
                
                if ($result) {
                    echo json_encode([
                        'success' => true,
                        'data' => $result
                    ], JSON_UNESCAPED_UNICODE);
                } else {
                    echo json_encode([
                        'success' => false,
                        'message' => 'Товар не найден'
                    ], JSON_UNESCAPED_UNICODE);
                }
            } else {
                // Иначе возвращаем все товары
                $result = $product->read();
                
                if ($result) {
                    echo json_encode([
                        'success' => true,
                        'data' => $result
                    ], JSON_UNESCAPED_UNICODE);
                } else {
                    echo json_encode([
                        'success' => true,
                        'data' => [],
                        'message' => 'Товары не найдены'
                    ], JSON_UNESCAPED_UNICODE);
                }
            }
            break;

        case 'POST':
            // Получаем данные из тела запроса
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data || empty($data['name']) || empty($data['manufacturer_id'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Не заполнены обязательные поля'
                ], JSON_UNESCAPED_UNICODE);
                break;
            }
            
            $product->manufacturer_id = (int)$data['manufacturer_id'];
            $product->name = $data['name'];
            $product->type = $data['type'] ?? null;
            $product->price = isset($data['price']) ? (float)$data['price'] : null;
            $product->unit = $data['unit'] ?? 'м';
            $product->specs = $data['specs'] ?? null;
            $product->url = $data['url'] ?? null;
            
            if ($product->create()) {
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Товар успешно создан',
                    'id' => $product->id
                ], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Не удалось создать товар'
                ], JSON_UNESCAPED_UNICODE);
            }
            break;

        case 'PUT':
            // Получаем данные из тела запроса
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data || empty($data['id']) || empty($data['name']) || empty($data['manufacturer_id'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Не заполнены обязательные поля'
                ], JSON_UNESCAPED_UNICODE);
                break;
            }
            
            $product->id = (int)$data['id'];
            $product->manufacturer_id = (int)$data['manufacturer_id'];
            $product->name = $data['name'];
            $product->type = $data['type'] ?? null;
            $product->price = isset($data['price']) ? (float)$data['price'] : null;
            $product->unit = $data['unit'] ?? 'м';
            $product->specs = $data['specs'] ?? null;
            $product->url = $data['url'] ?? null;
            
            if ($product->update()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Товар успешно обновлен'
                ], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Не удалось обновить товар'
                ], JSON_UNESCAPED_UNICODE);
            }
            break;

        case 'DELETE':
            // Получаем данные из тела запроса
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data || empty($data['id'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Не указан ID товара'
                ], JSON_UNESCAPED_UNICODE);
                break;
            }
            
            $product->id = (int)$data['id'];
            
            if ($product->delete()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Товар успешно удален'
                ], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Не удалось удалить товар'
                ], JSON_UNESCAPED_UNICODE);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'message' => 'Метод не поддерживается'
            ], JSON_UNESCAPED_UNICODE);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка сервера: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>