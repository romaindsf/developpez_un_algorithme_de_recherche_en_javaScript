# Les Petits Plats — Fiche d'investigation fonctionnalité #2

---

# Fiche d'investigation de fonctionnalité

| **Fonctionnalité :** Recherche de recettes | **Fonctionnalité #2** |
|---|---|
| **Problématique :** Comment parcourir et filtrer efficacement un tableau de 50 recettes en JavaScript vanilla, sans librairie, pour retourner les recettes correspondant à la saisie utilisateur dans le titre, la description et les ingrédients ? | |

---

## Option 1 — Boucles natives (`for`, `break`, `continue`)

L'algorithme parcourt le tableau de recettes avec une boucle `for` classique. Pour chaque recette, il vérifie séquentiellement le titre, puis la description, puis les ingrédients. Dès qu'une correspondance est trouvée, un `continue` passe à la recette suivante sans poursuivre les vérifications. Pour les ingrédients, un `break` interrompt la boucle interne dès le premier ingrédient correspondant.

| **Avantages** | **Inconvénients** |
|---|---|
| Contrôle total du flux d'exécution | Plus verbeux |
| Short-circuit explicite via `break`/`continue` | Gestion manuelle du `break`/`continue` |
| Pas de tableau intermédiaire créé | Moins lisible pour des développeurs peu familiers avec les boucles bas niveau |
| Overhead minimal — pas de closures ni d'appels de méthodes supplémentaires | |

**Complexité :** O(n × m) — n recettes, m ingrédients par recette
**Résultat jsben.ch :** _à compléter après benchmark_

---

## Option 2 — Programmation fonctionnelle (`filter`, `some`, `includes`)

L'algorithme utilise `filter()` sur le tableau de recettes. Pour chaque recette, la condition combine les trois champs avec `||` (court-circuit natif dès la première correspondance) et utilise `some()` pour les ingrédients (s'arrête au premier ingrédient correspondant).

| **Avantages** | **Inconvénients** |
|---|---|
| Concis et déclaratif | Crée un tableau intermédiaire (overhead mémoire) |
| Très lisible, idiomatique ES6+ | Overhead des closures JavaScript |
| Facilement compréhensible par tous les niveaux | Moins de contrôle sur le flux exact |
| Court-circuit assuré par `||` et `some()` | |

**Complexité :** O(n × m) — identique à l'Option 1
**Résultat jsben.ch :** _à compléter après benchmark_

---

## Résultats benchmark jsben.ch

> _À compléter après exécution des tests de performance sur jsben.ch_
>
> Tester uniquement la recherche principale (pas les filtres par tags).
> Comparer le nombre d'opérations/seconde pour chaque implémentation sur le même jeu de données (50 recettes).

| | Option 1 — Boucles natives | Option 2 — Fonctionnel |
|---|---|---|
| Opérations/seconde | — | — |
| Résultat relatif | — | — |

---

## Solution retenue

> _À compléter après benchmark_

---

## Annexes

- Algorigramme Option 1 (boucles natives) : _voir fichier draw.io_
- Algorigramme Option 2 (fonctionnel) : _voir fichier draw.io_
