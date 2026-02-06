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
require_once '../models/Manufacturer.php';

// Создаем объекты
$database = new Database();
$db = $database->getConnection();
$manufacturer = new Manufacturer($db);

// Получаем метод запроса
$method = $_SERVER['REQUEST_METHOD'];

// Обработка запросов
try {
    switch ($method) {
        case 'GET':
            // Если есть ID - возвращаем одного производителя
            if (isset($_GET['id']) && is_numeric($_GET['id'])) {
                $manufacturer->id = (int)$_GET['id'];
                $result = $manufacturer->readOne();
                
                if ($result) {
                    echo json_encode([
                        'success' => true,
                        'data' => $result
                    ], JSON_UNESCAPED_UNICODE);
                } else {
                    echo json_encode([
                        'success' => false,
                        'message' => 'Производитель не найден'
                    ], JSON_UNESCAPED_UNICODE);
                }
            } else {
                // Иначе возвращаем всех производителей
                $result = $manufacturer->read();
                
                if ($result) {
                    echo json_encode([
                        'success' => true,
                        'data' => $result
                    ], JSON_UNESCAPED_UNICODE);
                } else {
                    echo json_encode([
                        'success' => true,
                        'data' => [],
                        'message' => 'Производители не найдены'
                    ], JSON_UNESCAPED_UNICODE);
                }
            }
            break;

        case 'POST':
            // Получаем данные из тела запроса
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data || empty($data['name'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Не заполнено имя производителя'
                ], JSON_UNESCAPED_UNICODE);
                break;
            }
            
            $manufacturer->name = $data['name'];
            $manufacturer->website = $data['website'] ?? null;
            $manufacturer->city = $data['city'] ?? null;
            $manufacturer->phone = $data['phone'] ?? null;
            $manufacturer->email = $data['email'] ?? null;
            $manufacturer->description = $data['description'] ?? null;
            
            if ($manufacturer->create()) {
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Производитель успешно создан',
                    'id' => $manufacturer->id
                ], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Не удалось создать производителя'
                ], JSON_UNESCAPED_UNICODE);
            }
            break;

        case 'PUT':
            // Получаем данные из тела запроса
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data || empty($data['id']) || empty($data['name'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Не заполнены обязательные поля'
                ], JSON_UNESCAPED_UNICODE);
                break;
            }
            
            $manufacturer->id = (int)$data['id'];
            $manufacturer->name = $data['name'];
            $manufacturer->website = $data['website'] ?? null;
            $manufacturer->city = $data['city'] ?? null;
            $manufacturer->phone = $data['phone'] ?? null;
            $manufacturer->email = $data['email'] ?? null;
            $manufacturer->description = $data['description'] ?? null;
            
            if ($manufacturer->update()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Производитель успешно обновлен'
                ], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Не удалось обновить производителя'
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
                    'message' => 'Не указан ID производителя'
                ], JSON_UNESCAPED_UNICODE);
                break;
            }
            
            $manufacturer->id = (int)$data['id'];
            
            if ($manufacturer->delete()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Производитель успешно удален'
                ], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Не удалось удалить производителя'
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