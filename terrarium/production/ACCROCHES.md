# Les accroches

_Écrit le 16 novembre 2026. Rien n'est encore publié : tout ce qui suit est une hypothèse de départ, à vérifier sur les chiffres du compte (rétention à 3 secondes, dans `videos/resultats.csv`)._

## Ce qu'une accroche doit faire, en deux secondes

1. **Dire à qui on parle** : « Développeur, ingénieur », « Tu grimpes… ».
2. **Ouvrir une question** que le spectateur veut voir fermée.
3. **Promettre une réponse courte** : il doit sentir que ça ne durera pas.

La première image compte autant que la première phrase : c'est elle qui s'affiche avant que le son ne parte.

## Sept modèles

| Modèle | Exemple | Quand l'utiliser |
|---|---|---|
| La question qui pique | « À quoi on sert encore, maintenant que l'IA code ? » | Un avis sur un sujet qui inquiète |
| L'aveu | « Je me suis trompé pendant trois ans sur ma façon de grimper. » | Un changement d'avis, une erreur |
| Le contre-pied | « Arrête de grimper avec les bras. » | Un conseil qui contredit l'habitude |
| La scène | « Hier, un client m'a dit : je n'ai rien compris. » | Une histoire vécue |
| Le défi | « La plupart des gens se trompent sur cette énigme. » | Une énigme, un test |
| La promesse courte | « Trois gestes, quarante secondes. » | Une liste |
| Le chiffre vrai | Un chiffre que tu peux sourcer, dit sans détour | Seulement si le chiffre est vérifié |

## À éviter

- Se présenter, saluer, annoncer le sujet (« Aujourd'hui je vais parler de… »).
- Un préambule avant la phrase forte (« Ça fait un moment que je me pose une question… »).
- Plus de 12 mots avant le premier point, ou plus de 4 secondes.
- Un chiffre inventé (« seuls 10 % des gens… ») : le défi « la plupart des gens se trompent » fait le même effet sans faux chiffre.
- Une accroche qui promet plus que la vidéo ne donne : les gens partent, et ne reviennent pas.

## La méthode

1. Écrire **trois accroches** pour chaque vidéo, avec trois modèles différents.
2. Les dire à voix haute. Garder celle qu'on dirait à un ami sans rougir.
3. Enregistrer en commençant **directement** par l'accroche. S'il y a un faux départ, le montage le coupe (`"retirer"`).
4. Vérifier l'ouverture : `npm run video -- <id> --accroche` donne quatre images des trois premières secondes, et les conseils du montage.
5. Après publication, noter la rétention à 3 secondes de chaque vidéo et le modèle d'accroche utilisé. Au bout de dix vidéos, garder les deux modèles qui retiennent le mieux.

## Ce que l'outil fait de lui-même

- Le silence du début de la prise est retiré : la voix part à la première image.
- Le texte du premier plan et le premier sous-titre sont déjà en place à la première image (elle sert de vignette).
- Le premier plan s'ouvre sur un léger zoom avant ; en 3D, la caméra donne un coup de zoom. `"ouverture": "calme"` dans l'épisode retire cet effet.
- Le montage affiche des **conseils** (sans jamais bloquer) : voix qui démarre tard, première phrase de plus de 12 mots ou de 4 secondes, premier plan sur un fond uni sans dessin, vidéo de plus de 45 secondes.

## Trois variantes pour chaque vidéo existante

**Développeur et IA** (`valeur-ia`, accroche actuelle trop longue : 20 mots, 7 secondes)

- La question qui pique : « Développeur : à quoi on sert encore, maintenant que l'IA code ? »
- L'aveu : « J'ai demandé à l'IA si elle allait me remplacer. Sa réponse m'a déçu. »
- Le contre-pied : « Ta valeur de développeur n'est plus dans ton code. »

**Escalade** (`escalade-techniques`)

- Le contre-pied : « Arrête de grimper avec les bras. »
- La question qui pique : « Tu grimpes surtout avec les bras ? C'est pour ça que tu fatigues. »
- La promesse courte : « Six gestes pour moins forcer. Quarante secondes. »

**Énigme du thermomètre** (`enigme-thermometre`)

- Le défi : « La plupart des gens se trompent sur cette énigme. »
- La scène : « Il fait trente degrés dehors. Ta fenêtre est ouverte. »
- La question qui pique : « Que dit vraiment ton thermomètre ? Tu as cinq secondes. »

**Rizière** (`essai-riziere`)

- La scène : « Au Vietnam, j'ai regardé un homme marcher derrière son buffle pendant une heure. »
- Le contre-pied : « Ici, personne ne court. Et pourtant, tout pousse. »
- L'aveu : « J'ai longtemps confondu aller vite et avancer. »
