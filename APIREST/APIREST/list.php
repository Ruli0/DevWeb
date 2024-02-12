<?php
// api/list.php
require_once '../db.php';

$stmt = $pdo->query("SELECT id, nom, prenom, sexe, telephone, naissance, souscription FROM participants");
$participants = $stmt->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json');
echo json_encode($participants);
?>

