<?php
class Manufacturer {
    private $conn;
    private $table_name = "manufacturers";

    public $id;
    public $name;
    public $website;
    public $city;
    public $phone;
    public $email;
    public $description;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Чтение всех производителей
    public function read() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY name";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Чтение одного производителя
    public function readOne() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Создание производителя
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET name=:name, website=:website, city=:city, 
                      phone=:phone, email=:email, description=:description,
                      created_at=NOW(), updated_at=NOW()";
        
        $stmt = $this->conn->prepare($query);
        
        // Очистка данных
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->website = htmlspecialchars(strip_tags($this->website));
        $this->city = htmlspecialchars(strip_tags($this->city));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->description = htmlspecialchars(strip_tags($this->description));
        
        // Привязка параметров
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":website", $this->website);
        $stmt->bindParam(":city", $this->city);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":description", $this->description);
        
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    // Обновление производителя
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET name=:name, website=:website, city=:city, 
                      phone=:phone, email=:email, description=:description,
                      updated_at=NOW()
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        // Очистка данных
        $this->id = (int)$this->id;
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->website = htmlspecialchars(strip_tags($this->website));
        $this->city = htmlspecialchars(strip_tags($this->city));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->description = htmlspecialchars(strip_tags($this->description));
        
        // Привязка параметров
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":website", $this->website);
        $stmt->bindParam(":city", $this->city);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":description", $this->description);
        
        return $stmt->execute();
    }

    // Удаление производителя
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        
        $this->id = (int)$this->id;
        $stmt->bindParam(":id", $this->id);
        
        return $stmt->execute();
    }
}
?>