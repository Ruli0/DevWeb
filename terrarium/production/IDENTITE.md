# Identité du compte

_En construction, pas à pas : chaque élément est proposé, puis validé par toi. Dernière mise à jour : 13 novembre 2026._

## Ce qui est décidé

- **Musique** : **Drift**, phonk à 145 BPM, cloche rapide et saturée, 808 lourde (validée le 13 nov.).
- **Style** : **nuit bioluminescente à la lanterne, dosage B** (validé le 13 nov.). Palette du style 1 (vert acide, cyan, langue rose, fond bleu nuit), obscurité forte (0,75) autour de la zone éclairée, faisceau chaud de la lanterne, et ce qui est bioluminescent brille dans le noir.
- **Âme du compte** : **le gardien du terrarium**, un personnage récurrent qui garde des IA dans son terrarium et commente avec humour.
- **Ton** : divertissant avant tout. Chaque épisode a un gag, et l'apprentissage vient en bonus.

## En cours de choix

| Élément | Statut | Pistes |
|---|---|---|
| Style de nuit | **validé** (tour 2, dosage B) | — |
| Le gardien | premier croquis | « Mousse » (nom provisoire) : petit robot rond, tête moussue, un œil cyan, lanterne au bout d'une perche |
| Musique | **validée** : Drift (145 BPM) | — |
| Texte à l'écran | tour 2 envoyé | T5 edit phonk, T6 terminal de Mousse, T7 annotations, T8 cinéma |
| Scénarios | à venir (étape 3) | un pitch de 4 ou 5 lignes par épisode, avec un gag |
| Nom du compte et bio | plus tard | `@les.nuits.du.terrarium`, `@mousse.terrarium` |

## Itérations

### Style, tour 1 (13 nov.)

- **Montré** : la même image (deuxième coup de langue du caméléon, plan large) en 4 styles de nuit, avec un premier croquis de Mousse en bas à droite tenant sa lanterne vers la scène, une légende d'exemple en haut et le repère « Nuit n° 1 ».
  1. **Bioluminescente** : bleu nuit, caméléon vert acide lumineux, langue rose, accents verts.
  2. **Lanterne** : presque noir, seule la lumière chaude de la lanterne éclaire le caméléon.
  3. **Néon phonk** : violet profond, caméléon rose néon, langue cyan.
  4. **Douce** : bleu clair de lune, couleurs adoucies, proche du style actuel.
- **Méthode** : recoloration de l'image actuelle par un script d'essai (hors du dépôt), pas encore intégrée au moteur.
- **Corrigé avant l'envoi** : plan trop serré, papillon devant le sujet, langue devenue bleue, lanterne peu lisible, carrés autour des lucioles.
- **Ton retour** : « Couleur du 1 avec l'effet nuit du 2. »

### Style, tour 2 (13 nov.)

- **Montré** : le mélange demandé, en 3 dosages d'obscurité sur la même image. La palette est celle du 1 : caméléon vert acide, langue rose, mousse et lucioles qui luisent. La nuit est celle du 2 : obscurité autour d'une zone éclairée, et un faisceau chaud qui part de la lanterne vers le caméléon.
  - A : obscurité 0,6 ;
  - B : 0,75 ;
  - C : 0,85.
- **Nouveau** : les éléments bioluminescents gardent leur propre lueur par-dessus l'obscurité. On les voit dans le noir, sans que la lanterne les éclaire.
- **Corrigé avant l'envoi** : lueurs trop grosses, dosages trop proches, faisceau invisible.
- **Ton retour** : « B ». Style validé.

### Musique, tour 1 (13 nov.)

- **Montré** : 3 extraits phonk originaux de 10 s, sur l'image du style B, au même volume (normalisés à -14 LUFS, pour ne pas favoriser le plus fort).
  1. **Drift** : 145 BPM, cloche rapide et saturée, charleston en doubles croches, 808 lourde qui glisse.
  2. **Sombre** : 96 BPM en demi-temps, cloche grave noyée de réverbération, nappe menaçante, 808 longue.
  3. **Joueuse** : 124 BPM avec du swing, cloche qui saute d'octave, 808 courte et rebondissante, claquements de doigts.
- **Méthode** : script d'essai hors du dépôt, avec les outils de synthèse de `scripts/build-sons.js`.
- **Ton retour** : « Drift est parfait ». Musique validée.
- **Envoi** : l'envoi de fichiers a d'abord échoué (erreur 503), puis a fonctionné. Les extraits sont aussi sur la page d'écoute « Atelier des nuits » (artifact privé), avec les sons intégrés.

### Texte à l'écran, tour 1 (13 nov.)

- **Demandé par toi** : valider aussi comment le texte s'affiche sur la vidéo.
- **Montré** : sur l'image du style B, le morceau « Jamais du premier coup. » dans 4 styles. Tous sont dans la zone sûre, sur 2 lignes au plus.
  - **T1, gros titre** : blanc détouré de noir, mot clé en vert, en haut.
  - **T2, néon** : le texte brille en vert et cyan, comme une enseigne.
  - **T3, bulle de Mousse** : c'est le gardien qui parle, dans une bulle bordée de cyan dont la queue pointe vers lui.
  - **T4, mot à mot** : trois ou quatre mots à la fois, le mot en cours surligné (deux instants montrés).
- **Ton retour** : « Texte pas convaincu encore. »

### Texte à l'écran, tour 2 (13 nov.)

- **Hypothèse** : les 4 premiers styles se ressemblaient trop (du texte blanc gras, sous différentes formes). Ce tour propose des directions franches, chacune avec une personnalité.
  - **T5, edit phonk** : League Gothic en capitales, penché, décalage rouge et bleu, qui claque sur le temps.
  - **T6, terminal de Mousse** : Space Mono vert sur l'écran du robot, tapé lettre par lettre, avec un curseur.
  - **T7, annotations** : Permanent Marker et flèches dessinées sur la scène (« ton IA », « un outil ! »).
  - **T8, cinéma** : EB Garamond en italique, avec des filets, en fondu lent.
- **Contraintes** : tous dans la zone sûre. T7 utilise une police non fournie par HyperFrames : il faudra l'embarquer dans `assets/fonts/`.
- **Ton retour** : _en attente_.
