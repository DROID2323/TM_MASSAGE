<?php
require 'auth-check.php';
?>
<!DOCTYPE html>
<html lang="uk">
<head><meta charset="UTF-8"><title>Адмін-панель</title></head>
<body>
    <h2>Вітаю, <?= htmlspecialchars($_SESSION['admin_username']) ?>!</h2>
    <p>Ти успішно залогінений і сесія працює.</p>
    <a href="logout.php">Вийти</a>
</body>
</html>