<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'tm_massage_service');
define('DB_USER', 'root');
define('DB_PASS', 'DIMKA1Q2W3E```');

function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
    }
    return $pdo;
}