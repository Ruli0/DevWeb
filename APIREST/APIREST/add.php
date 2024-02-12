<?php
// api/add.php
require_once '../db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['nom'], $data['prenom'])) {
    $stmt = $pdo->prepare("INSERT INTO participants (nom, prenom, sexe, telephone, naissance, souscription) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$data['nom'], $data['prenom'], $data['sexe'], $data['telephone'], $data['naissance'], $data['souscription']]);
    echo json_encode(['message' => 'Participant ajouté avec succès']);
} else {
    echo json_encode(['message' => 'Erreur lors de l\'ajout du participant']);
}
?>

