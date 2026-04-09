# INDEX — Architecture globale du projet "Les Petits Plats"

> Fichier de révision pour soutenance — vue d'ensemble du projet

---

## 1. Résumé du projet en une phrase

Application web de recherche de recettes en **Vanilla JavaScript pur**, sans aucun framework, qui permet de filtrer 50 recettes par mot-clé (barre principale) et par tags (ingrédients, appareils, ustensiles).

---

## 2. Structure des fichiers JavaScript

```
js/
├── state.js        — État global partagé (searchQuery + tags actifs)
├── search.js       — Algorithme de filtrage (Algo A : boucles natives)
├── cards.js        — Création et rendu des cartes recettes dans le DOM
├── dropdowns.js    — Gestion des menus filtres (ingrédients / appareils / ustensiles)
├── tags.js         — Ajout, suppression et affichage des tags actifs
└── app.js          — Orchestrateur central + tous les event listeners

recipes/
└── recipes.js      — Base de données des 50 recettes (tableau JS)
```

---

## 3. Flux de données — Comment tout s'enchaîne

```
┌─────────────────────────────────────────────────────┐
│                   UTILISATEUR                       │
│   tape dans la barre  OU  clique un tag dropdown    │
└─────────────────┬──────────────────┬────────────────┘
                  │                  │
                  ▼                  ▼
         state.searchQuery    state.tags[category]
                  │                  │
                  └────────┬─────────┘
                           │
                           ▼
                    update()  ← app.js
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
    renderRecipes()  renderActiveTags()  updateDropdowns()
     (cards.js)        (tags.js)         (dropdowns.js)
              ▲
              │
    getFilteredRecipes()  ← search.js
              │
    filterBySearch(recipes)
              │
    filterByTags(résultat précédent)
              │
        recettes filtrées
```

**Règle clé : tout passe par `update()`**. Cette fonction est le seul point d'entrée pour rafraîchir l'interface. Quand quelque chose change (saisie utilisateur, tag ajouté, tag supprimé), on appelle `update()` et tout se recalcule.

---

## 4. Ordre de chargement des scripts dans index.html

```html
<script src="recipes/recipes.js"></script>   <!-- 1. données -->
<script src="js/state.js"></script>           <!-- 2. état global -->
<script src="js/search.js"></script>          <!-- 3. algo (lit state + recipes) -->
<script src="js/cards.js"></script>           <!-- 4. rendu cartes -->
<script src="js/dropdowns.js"></script>       <!-- 5. rendu dropdowns -->
<script src="js/tags.js"></script>            <!-- 6. gestion tags -->
<script src="js/app.js"></script>             <!-- 7. orchestrateur (dernier) -->
```

**Pourquoi cet ordre ?** Chaque fichier dépend de ceux qui le précèdent. `app.js` doit être chargé en dernier car il appelle toutes les fonctions définies dans les autres fichiers. Si on inversait l'ordre, JavaScript lèverait une `ReferenceError` car les fonctions ne seraient pas encore définies.

---

## 5. Schéma des dépendances entre fichiers

```
recipes.js  ──────────────────────────────► search.js
state.js    ──────────────────────────────► search.js, tags.js, dropdowns.js, app.js
search.js   ──────────────────────────────► app.js
cards.js    ──────────────────────────────► app.js
dropdowns.js ─────────────────────────────► app.js
tags.js     ──────────────────────────────► app.js
```

**Pas de dépendances circulaires** : chaque fichier ne lit que ce qui a été déclaré avant lui.

---

## 6. Choix architecturaux majeurs (questions jury probables)

### "Pourquoi Vanilla JS et pas React / Vue ?"
**Réponse :** Contrainte explicite du projet (cahier des charges de JB). Aucune librairie JS externe autorisée. L'objectif pédagogique est de comprendre le DOM et les algorithmes sans abstraction. Avec 50 recettes, un framework serait une sur-ingénierie totale.

### "Pourquoi pas de module ES6 (`import`/`export`) ?"
**Réponse :** L'application tourne directement via un fichier HTML ouvert dans le navigateur (protocole `file://`). Les modules ES6 nécessitent un serveur HTTP à cause de CORS. Pour éviter cette contrainte sans build step, on utilise des scripts classiques avec un ordre de chargement maîtrisé.

### "Comment avez-vous organisé votre code ?"
**Réponse :** Principe de **séparation des responsabilités** : chaque fichier a un rôle unique et bien défini. `search.js` ne sait pas que le DOM existe. `cards.js` ne sait pas que l'algorithme existe. `app.js` est le seul à connaître tout le monde et à faire le lien. C'est une architecture proche du **pattern MVC** (Modèle = recipes.js + state.js, Vue = cards.js + tags.js + dropdowns.js, Contrôleur = app.js + search.js).

### "Qu'est-ce que l'état global ? Pourquoi ?"
**Réponse :** `state` est un objet JavaScript simple partagé par tous les fichiers. Il contient la requête de recherche en cours et les tags actifs. Sans lui, chaque fonction devrait recevoir ces informations en paramètre, ce qui compliquerait l'API. C'est une forme simplifiée de ce que Redux fait dans React, adaptée à une petite application.

### "Pourquoi une seule fonction `update()` pour tout rafraîchir ?"
**Réponse :** C'est le pattern **source de vérité unique** + **rendu déclaratif**. Plutôt que de mettre à jour partiellement l'interface à chaque action, on recalcule tout depuis l'état. C'est prévisible, cohérent, et facile à déboguer. L'inconvénient serait la performance sur un grand dataset — ici avec 50 recettes, c'est parfaitement acceptable.

---

## 7. Les deux branches Git (contexte du projet)

| Branche | Algorithme | Fichier clé |
|---|---|---|
| `feature/algo-loops` (branche actuelle) | Boucles natives `for` / `break` / `continue` | `js/search.js` |
| (branche B à créer) | Programmation fonctionnelle `filter` / `map` / `reduce` | `js/search.js` |

Seul `search.js` diffère entre les deux branches. Toute l'UI, les dropdowns, les tags, les cartes — tout est partagé.

---

## 8. Complexité algorithmique globale

| Opération | Complexité | Explication |
|---|---|---|
| Recherche principale | O(n × m) | n = 50 recettes, m ≈ 6 ingrédients en moyenne |
| Filtre par tags | O(n × t) | t = nb de tags sélectionnés |
| Construction des options dropdown | O(n × m) | parcours de toutes les recettes |
| Insertion dans un Set | O(1) | Accès hashé |
| Tri des options dropdown | O(k log k) | k = nb d'options uniques |

**Complexité totale d'un `update()`** : O(n × m) — linéaire sur le dataset, acceptable.

---

## 9. Guide de navigation des fichiers d'explications

| Fichier | Quand le lire |
|---|---|
| `explications.search.js.md` | EN PREMIER — c'est le cœur du projet |
| `explications.state.js.md` | Juste après — tout le reste en dépend |
| `explications.app.js.md` | Pour comprendre comment tout s'assemble |
| `explications.cards.js.md` | Si on vous pose des questions sur le DOM |
| `explications.dropdowns.js.md` | Si on vous pose des questions sur les filtres |
| `explications.tags.js.md` | Si on vous pose des questions sur les tags |
| `explications.recipes.js.md` | Pour comprendre la structure des données |
