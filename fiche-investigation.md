Fiche d'investigation de fonctionnalité

Fonctionnalité : Recherche de recettes 

Problématique : 

Comment parcourir et filtrer efficacement un tableau de 50 recettes en JavaScript vanilla, sans librairie, pour retourner les recettes correspondant à la saisie utilisateur dans le titre, la description et les ingrédients ? 

- Option 1: Boucles natives ( for, break, continue)

L'algorithme parcourt le tableau de recettes avec une boucle for classique. Pour chaque recette, il vérifie séquentiellement le titre, puis la description, puis les ingrédients. Dès qu'une correspondance est trouvée, un continue passe à la recette suivante sans poursuivre les vérifications.

Pour les ingrédients, un break interrompt la boucle interne dès le premier ingrédient correspondant.

Choix de conception — ordre des vérifications :

name et description sont des champs scalaires (une chaîne) : un seul .includes() suffit, coût O(1). Ils sont testés en premier. Dès qu'une correspondance est trouvée, le continue court-circuite tout — la boucle sur les ingrédients ne s'exécute jamais.

ingredients est un tableau d'objets : il faut une boucle interne pour parcourir chaque ingrédient, coût O(m). Il est testé en dernier car plus coûteux.

On trie les vérifications par coût croissant pour maximiser les court-circuits et minimiser les opérations CPU.

Avantages

- Contrôle total du flux d'exécution
- Short-circuit explicite via break/continue
- Pas de tableau intermédiaire créé
- Overhead minimal : pas de closures ni d'appels de méthodes supplémentaires

Inconvénients

- Plus verbeux
- Gestion manuelle du break/continue
- Moins lisible pour des développeurs peu familiers avec les boucles bas niveau

Complexité : O(n × m) — n recettes, m ingrédients par recette
Résultat jsben.ch : 57 650 ops/sec (±10.77%)

- Option 2: Programmation fonctionnelle (filter, some, includes)

L'algorithme utilise filter() sur le tableau de recettes. Pour chaque recette, la condition combine les trois champs avec "||" (court-circuit natif dès la première correspondance) et utilise some() pour les ingrédients (s'arrête au premier ingrédient correspondant).

Avantages

- Concis et déclaratif
- Très lisible, idiomatique ES6+
- Facilement compréhensible par tous les niveaux
- Court-circuit assuré par "||" et some()

Inconvénients

- Crée un tableau intermédiaire (overhead mémoire)
- Overhead des closures JavaScript
- Moins de contrôle sur le flux exact

Complexité : O(n × m) — identique à l'Option 1
Résultat jsben.ch : 58 860 ops/sec (±8.88%) — Gagnant

- Résultats benchmark jsben.ch

Navigateur : Chrome 
Jeu de données : 50 recettes 
Terme testé : "coco"

Option 1: Boucles natives 
Option 2: Fonctionnel
Opérations/seconde: 57 650 (±10.77%) et 58 860 (±8.88%) |
Résultat relatif: 97.94%, 100% — Gagnant |


- Solution retenue

L'Option 2 (programmation fonctionnelle) est retenue. Le benchmark confirme un léger avantage en performance : 58 860 ops/sec contre 57 650, soit +2.06%. L'écart est faible — les deux complexités sont identiques en O(n × m) sur 50 recettes — mais la lisibilité du code fonctionnel est nettement supérieure, idiomatique ES6+, et plus maintenable pour l'équipe back-end qui récupérera le projet.

- Annexes

- Algorigramme Option 1 (boucles natives) : voir fichier draw.io
- Algorigramme Option 2 (fonctionnel) : voir fichier draw.io
