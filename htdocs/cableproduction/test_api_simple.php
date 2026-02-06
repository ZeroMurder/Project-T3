<?php
echo "<h1>API Test</h1>";

// Test health endpoint
echo "<h2>Health Check:</h2>";
$health_url = "http://localhost/cableproduction/backend/api/health.php";
$health_response = @file_get_contents($health_url);

if ($health_response) {
    $data = json_decode($health_response, true);
    echo "<pre>" . json_encode($data, JSON_PRETTY_PRINT) . "</pre>";
} else {
    echo "<p style='color:red'>❌ Health API not accessible</p>";
}

// Test manufacturers endpoint
echo "<h2>Manufacturers API:</h2>";
$man_url = "http://localhost/cableproduction/backend/api/manufacturers.php";
$man_response = @file_get_contents($man_url);

if ($man_response) {
    $data = json_decode($man_response, true);
    if ($data && isset($data['success'])) {
        echo "<p style='color:green'>✅ Manufacturers API working - " . count($data['data']) . " records</p>";
    } else {
        echo "<p style='color:red'>❌ Manufacturers API response error</p>";
        echo "<pre>" . $man_response . "</pre>";
    }
} else {
    echo "<p style='color:red'>❌ Manufacturers API not accessible</p>";
}
?>
