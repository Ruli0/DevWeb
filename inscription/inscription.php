<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);


$pdo = new PDO('mysql:host=localhost;dbname=TPARENDRE', 'root', '');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $login = trim($_POST['login']);
    $password = trim($_POST['password']);
    $prenom = trim($_POST['prenom']);
    $nom = trim($_POST['nom']);
    $sexe = isset($_POST['sexe']) ? trim($_POST['sexe']) : null;
    $telephone = isset($_POST['telephone']) ? trim($_POST['telephone']) : null;
    $naissance = isset($_POST['naissance']) ? trim($_POST['naissance']) : null;
    $souscription = isset($_POST['souscription']) ? trim($_POST['souscription']) : null;

    if (empty($login) || empty($password) || empty($prenom) || empty($nom)) {
        echo "<script>alert('Les champs login, mot de passe, prénom et nom sont obligatoires.');</script>";
        echo "<script>window.location.href = 'inscription.html';</script>";
    } else {
        $sql = "INSERT INTO participants (login, password, prenom, nom, sexe, telephone, naissance, souscription) VALUES (:login, :password, :prenom, :nom, :sexe, :telephone, :naissance, :souscription)";
        $stmt = $pdo->prepare($sql);

        $stmt->bindValue(':login', $login);
        $stmt->bindValue(':password', $password);
        $stmt->bindValue(':prenom', $prenom);
        $stmt->bindValue(':nom', $nom);
        $stmt->bindValue(':sexe', $sexe);
        $stmt->bindValue(':telephone', $telephone);
        $stmt->bindValue(':naissance', $naissance);
        $stmt->bindValue(':souscription', $souscription);

        if ($stmt->execute()) {
            echo "<script>alert('Inscription réussie.');</script>";
            echo "<script>window.location.href = 'inscription.html';</script>";
        } else {
            echo "<script>alert('Erreur lors de l'inscription.');</script>";
        }
    }
}
?>
