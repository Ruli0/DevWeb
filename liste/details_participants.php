<?php
// Assurez-vous que l'ID est bien passé en paramètre
if (isset($_GET['id'])) {
    // Connexion à la base de données
    $pdo = new PDO('mysql:host=localhost;dbname=TPARENDRE', 'root', '');
    
    // Préparation de la requête pour récupérer les détails du participant
    $stmt = $pdo->prepare("SELECT * FROM participants WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    $participant = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Vérification si le participant existe
    if ($participant) {
        // Affichage des détails du participant
        echo "<h3>Détails du Participant</h3>";
        echo "<p>Nom : " . htmlspecialchars($participant['nom']) . "</p>";
        echo "<p>Prénom : " . htmlspecialchars($participant['prenom']) . "</p>";
        // Affichage des nouvelles informations
        echo "<p>Sexe : " . htmlspecialchars($participant['sexe']) . "</p>";
        echo "<p>Téléphone : " . htmlspecialchars($participant['telephone']) . "</p>";
        echo "<p>Date de naissance : " . htmlspecialchars($participant['naissance']) . "</p>";
        echo "<p>Date de souscription : " . htmlspecialchars($participant['souscription']) . "</p>";
    } else {
        echo "Participant non trouvé.";
    }
}
?>

