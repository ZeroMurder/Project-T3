<?php
// Исправление подключения к базе данных
echo "Исправление API подключения...<br>";

// 1. Исправляем config/database.php
$database_file = "backend/config/database.php";
if (file_exists($database_file)) {
    $content = file_get_contents($database_file);
    
    // Добавляем метод connect() если его нет
    if (strpos($content, 'public function connect()') === false) {
        $content = str_replace(
            'public function getConnection() {',
            'public function getConnection() {',
            $content
        );
        
        // Добавляем метод connect() в конец класса
        $content = str_replace(
            '}',
            "}\n\n    // Метод для обратной совместимости\n    public function connect() {\n        return \$this->getConnection();\n    }",
            $content
        );
        
        file_put_contents($database_file, $content);
        echo "✅ database.php исправлен<br>";
    } else {
        echo "✅ database.php уже содержит метод connect()<br>";
    }
}

// 2. Исправляем manufacturers.php
$manufacturers_file = "backend/api/manufacturers.php";
if (file_exists($manufacturers_file)) {
    $content = file_get_contents($manufacturers_file);
    $content = str_replace('$db = $database->connect();', '$db = $database->getConnection();', $content);
    file_put_contents($manufacturers_file, $content);
    echo "✅ manufacturers.php исправлен<br>";
}

// 3. Исправляем products.php
$products_file = "backend/api/products.php";
if (file_exists($products_file)) {
    $content = file_get_contents($products_file);
    $content = str_replace('$db = $database->connect();', '$db = $database->getConnection();', $content);
    file_put_contents($products_file, $content);
    echo "✅ products.php исправлен<br>";
}

echo "<br><strong>Исправления применены!</strong><br>";
echo "Теперь проверьте:<br>";
echo "1. <a href='http://localhost/cableproduction/backend/api/manufacturers.php'>API производителей</a><br>";
echo "2. <a href='http://localhost/cableproduction/backend/api/products.php'>API товаров</a><br>";
?>