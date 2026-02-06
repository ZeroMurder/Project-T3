<?php
class Database {
    private $host = "localhost";
    private $db_name = "cableproduction"; // имя базы данных
    private $username = "root";           // стандартный пользователь XAMPP
    private $password = "";               // стандартный пароль XAMPP (пустой)
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username, 
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $exception) {
            // Логируем ошибку вместо вывода
            error_log("Database connection error: " . $exception->getMessage());
            return null; // Возвращаем null вместо создания соединения
        }
        return $this->conn;
    }
}
?>