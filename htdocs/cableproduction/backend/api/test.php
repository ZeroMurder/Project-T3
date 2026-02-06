<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/database.php';

$database = new Database();
$db = $database->connect();

$response = [
    'success' => true,
    'message' => 'Cable Production Aggregator API',
    'version' => '1.0',
    'timestamp' => date('Y-m-d H:i:s'),
    'endpoints' => [
        [
            'method' => 'GET',
            'url' => '/api/manufacturers.php',
            'description' => 'Get all manufacturers'
        ],
        [
            'method' => 'GET',
            'url' => '/api/manufacturers.php?id=1',
            'description' => 'Get manufacturer by ID'
        ],
        [
            'method' => 'GET',
            'url' => '/api/manufacturers.php?action=cities',
            'description' => 'Get all cities'
        ],
        [
            'method' => 'GET',
            'url' => '/api/products.php',
            'description' => 'Get all products'
        ],
        [
            'method' => 'GET',
            'url' => '/api/products.php?manufacturer_id=1',
            'description' => 'Get products by manufacturer ID'
        ],
        [
            'method' => 'GET',
            'url' => '/api/products.php?action=types',
            'description' => 'Get all product types'
        ]
    ]
];

// Test database connection
if ($db) {
    $response['database'] = [
        'status' => 'connected',
        'database' => 'cable_production_db',
        'host' => 'localhost'
    ];
    
    // Get some stats if possible
    try {
        $stmt = $db->query("SELECT COUNT(*) as manufacturers FROM manufacturers");
        $manufacturers_count = $stmt->fetchColumn();
        
        $stmt = $db->query("SELECT COUNT(*) as products FROM products");
        $products_count = $stmt->fetchColumn();
        
        $response['stats'] = [
            'manufacturers' => $manufacturers_count,
            'products' => $products_count
        ];
    } catch (Exception $e) {
        $response['stats'] = [
            'message' => 'Tables not created yet. Run migrate.bat to create database.'
        ];
    }
} else {
    $response['database'] = [
        'status' => 'disconnected',
        'message' => 'Failed to connect to database. Check XAMPP is running.'
    ];
    $response['success'] = false;
}

http_response_code(200);
echo json_encode($response);
?>