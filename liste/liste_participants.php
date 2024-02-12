<?php
// Connexion à la base de données
$pdo = new PDO('mysql:host=localhost;dbname=TPARENDRE', 'root', '');

// Récupération des participants
$stmt = $pdo->query("SELECT id, nom, prenom FROM participants");
$participants = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Liste des Participants</title>
    <link rel="stylesheet" href="style_liste.css">
    <script>
        function showDetails(id) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    document.getElementById("details").innerHTML = this.responseText;
                }
            };
            xhr.open("GET", "details_participants.php?id=" + id, true);
            xhr.send();
        }
    </script>
</head>
<body>
    <div id="liste_participants">
        <ul>
            <?php foreach ($participants as $participant): ?>
                <li onclick="showDetails(<?php echo $participant['id']; ?>)">
                    <?php echo htmlspecialchars($participant['nom']) . " " . htmlspecialchars($participant['prenom']); ?>
                </li>
            <?php endforeach; ?>
        </ul>
    </div>
    <div id="details">
        <!-- Les détails du participant seront affichés ici après appel AJAX -->
    </div>
</body>
</html>

