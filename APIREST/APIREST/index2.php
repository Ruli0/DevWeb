<?php
header("Content-type: application/json; charset=UTF-8");

$conn;
try {
  $conn = new PDO('mysql:host=' . $host . ';dbname=' . $db, $user, $pass);
  $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $conn->exec("SET CHARACTER SET utf8");
} catch (PDOException $e) {
    echo 'Connection Error: ' . $e->getMessage();
}

$query  = 'SELECT * FROM todos';
$query = $connection->prepare($query );
$query->execute();
$todos = $query->fetchAll(PDO::FETCH_ASSOC);
if (count($todos) > 0) {
  header('HTTP/1.1 200 OK');
  echo json_encode($todos);
} else {
  header('HTTP/1.1 500 Internal Server Error');
}