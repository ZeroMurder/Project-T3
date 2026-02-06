<?php
class Product {
    private $conn;
    private $table_name = "products";

    public $id;
    public $manufacturer_id;
    public $name;
    public $type;
    public $price;
    public $unit;
    public $specs;
    public $url;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Чтение всех товаров с именем производителя
    public function read() {
        $query = "SELECT p.*, m.name as manufacturer_name 
                  FROM " . $this->table_name . " p
                  LEFT JOIN manufacturers m ON p.manufacturer_id = m.id
                  ORDER BY p.id DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Чтение одного товара
    public function readOne() {
        $query = "SELECT p.*, m.name as manufacturer_name 
                  FROM " . $this->table_name . " p
                  LEFT JOIN manufacturers m ON p.manufacturer_id = m.id
                  WHERE p.id = ? 
                  LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Создание товара
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET manufacturer_id=:manufacturer_id, name=:name, type=:type, 
                      price=:price, unit=:unit, specs=:specs, url=:url,
                      created_at=NOW(), updated_at=NOW()";
        
        $stmt = $this->conn->prepare($query);
        
        // Очистка данных
        $this->manufacturer_id = (int)$this->manufacturer_id;
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->type = htmlspecialchars(strip_tags($this->type));
        $this->price = $this->price ? (float)$this->price : null;
        $this->unit = htmlspecialchars(strip_tags($this->unit));
        $this->specs = htmlspecialchars(strip_tags($this->specs));
        $this->url = htmlspecialchars(strip_tags($this->url));
        
        // Привязка параметров
        $stmt->bindParam(":manufacturer_id", $this->manufacturer_id);
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":type", $this->type);
        $stmt->bindParam(":price", $this->price);
        $stmt->bindParam(":unit", $this->unit);
        $stmt->bindParam(":specs", $this->specs);
        $stmt->bindParam(":url", $this->url);
        
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    // Обновление товара
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET manufacturer_id=:manufacturer_id, name=:name, type=:type, 
                      price=:price, unit=:unit, specs=:specs, url=:url,
                      updated_at=NOW()
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        // Очистка данных
        $this->id = (int)$this->id;
        $this->manufacturer_id = (int)$this->manufacturer_id;
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->type = htmlspecialchars(strip_tags($this->type));
        $this->price = $this->price ? (float)$this->price : null;
        $this->unit = htmlspecialchars(strip_tags($this->unit));
        $this->specs = htmlspecialchars(strip_tags($this->specs));
        $this->url = htmlspecialchars(strip_tags($this->url));
        
        // Привязка параметров
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":manufacturer_id", $this->manufacturer_id);
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":type", $this->type);
        $stmt->bindParam(":price", $this->price);
        $stmt->bindParam(":unit", $this->unit);
        $stmt->bindParam(":specs", $this->specs);
        $stmt->bindParam(":url", $this->url);
        
        return $stmt->execute();
    }

    // Удаление товара
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        
        $this->id = (int)$this->id;
        $stmt->bindParam(":id", $this->id);
        
        return $stmt->execute();
    }
}
?>