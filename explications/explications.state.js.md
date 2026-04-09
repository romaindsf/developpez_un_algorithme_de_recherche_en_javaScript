# explications.state.js — Gestion de l'état global

> Fichier le plus court (14 lignes) mais fondamental : tout le reste en dépend.

---

## Rôle du fichier

`state.js` définit **l'état global de l'application** — c'est-à-dire toutes les informations qui changent au fil du temps et qui influencent ce qu'on affiche.

Sans état partagé, chaque fonction devrait recevoir la requête de recherche et les tags actifs en paramètre à chaque appel. Avec un objet `state` global, toutes les fonctions peuvent y accéder directement, ce qui simplifie considérablement le code.

---

## Le code complet avec explications ligne par ligne

```javascript
// ─────────────────────────────────────────────────────────────────
// OBJET STATE : source de vérité unique de l'application
// ─────────────────────────────────────────────────────────────────

const state = {

  // searchQuery : le texte actuellement saisi dans la barre de recherche principale
  // Valeur initiale : '' (chaîne vide) → aucune recherche en cours
  // Modifié par : l'event listener 'input' sur #search-main dans app.js
  // Utilisé par : filterBySearch() dans search.js
  searchQuery: '',

  // tags : les filtres actifs sélectionnés dans les dropdowns
  // Chaque propriété est un TABLEAU car l'utilisateur peut sélectionner plusieurs tags
  // Ex: { ingredients: ["Lait de coco", "Sucre"], appliance: [], ustensils: ["fouet"] }
  tags: {
    ingredients: [],  // tags d'ingrédients sélectionnés
    appliance: [],    // tags d'appareils sélectionnés (en pratique: 0 ou 1 élément)
    ustensils: [],    // tags d'ustensiles sélectionnés
  },

};

// ─────────────────────────────────────────────────────────────────
// CONSTANTE DROPDOWNS : configuration des 3 menus filtres
// ─────────────────────────────────────────────────────────────────

// Tableau de 3 objets, un par dropdown
// Utilisé dans app.js pour boucler sur les 3 dropdowns sans répéter le code 3 fois
const DROPDOWNS = [
  { id: 'dropdown-ingredients', category: 'ingredients' },
  //  ^^^^^^^^^^^^^^^^^^^^^^^^^ id de l'élément HTML   ^^^^^^^^^^^ clé dans state.tags
  { id: 'dropdown-appliance',   category: 'appliance' },
  { id: 'dropdown-ustensils',   category: 'ustensils' },
];
// La propriété "id" correspond aux id des éléments HTML dans index.html
// La propriété "category" correspond à la clé dans state.tags
// Exemple d'utilisation dans app.js :
//   DROPDOWNS.forEach(({ id, category }) => {
//     const el = document.getElementById(id);   // ← utilise "id"
//     state.tags[category].push(value);          // ← utilise "category"
//   });
```

---

## Pourquoi `const` et non `let` pour `state` ?

`state` est déclaré avec `const` ce qui signifie qu'on ne peut pas réassigner la variable (`state = autreChose` serait une erreur). Cependant, on peut **modifier les propriétés** de l'objet : `state.searchQuery = "coco"` fonctionne parfaitement.

C'est une convention JavaScript : utiliser `const` pour les objets qu'on ne réassigne jamais, même si on modifie leur contenu.

---

## Comment `state` est-il modifié ?

Il y a exactement **deux endroits** dans le code qui modifient `state` :

### 1. Modification de `searchQuery` (dans `app.js`)
```javascript
document.getElementById('search-main').addEventListener('input', e => {
  state.searchQuery = e.target.value.trim();  // ← modification directe
  update();
});
```

### 2. Modification de `tags` (dans `tags.js`)
```javascript
// Ajout d'un tag :
function addTag(category, value) {
  state.tags[category].push(value);  // ← .push() modifie le tableau en place
}

// Suppression d'un tag :
function removeTag(category, value) {
  state.tags[category] = state.tags[category].filter(t => t !== value);
  // ↑ crée un NOUVEAU tableau sans la valeur (non-mutation)
}
```

---

## Le pattern "source de vérité unique"

`state` est la **source de vérité** : l'interface doit toujours refléter exactement ce que contient `state`. C'est pour ça qu'on appelle `update()` chaque fois que `state` change — pour re-synchroniser l'interface avec l'état.

```
Utilisateur agit
       ↓
state est modifié
       ↓
update() est appelé
       ↓
L'interface reflète le nouvel état
```

Ce pattern est similaire à ce que font React (avec `setState`) ou Vue (avec la réactivité), mais implémenté manuellement ici.

---

## Pourquoi DROPDOWNS est dans state.js et non app.js ?

DROPDOWNS est utilisé dans **plusieurs fichiers** :
- `app.js` : pour attacher les event listeners
- `dropdowns.js` : pour `updateDropdowns()` et `closeAllDropdowns()`
- `tags.js` : pour `renderActiveTags()`

En le mettant dans `state.js` (chargé en premier), il est accessible partout. Si on l'avait mis dans `app.js` (chargé en dernier), `dropdowns.js` et `tags.js` ne pourraient pas y accéder.

---

## Questions jury et réponses

### Q1 : "Qu'est-ce que l'état global et pourquoi l'utilisez-vous ?"

**Réponse :** L'état global est un objet JavaScript (`state`) accessible depuis tous les fichiers de l'application. Il contient les informations qui varient au cours du temps : la requête de recherche et les tags actifs. Sans lui, chaque fonction appelée devrait recevoir ces informations en paramètre, ce qui compliquerait les appels de fonctions. L'état global est un pattern courant dans les applications web — React l'appelle "state", Vue l'appelle "data" — ici on l'implémente simplement avec un objet `const`.

---

### Q2 : "N'est-ce pas risqué d'avoir un état global mutable ?"

**Réponse :** Dans une grande application, oui — l'état global mutable peut mener à des bugs difficiles à tracer si plusieurs parties du code le modifient de façon incontrôlée. Ici, c'est acceptable car :
1. L'application est petite (6 fichiers, ~285 lignes de code)
2. Il n'y a que 2 endroits qui modifient `state` : `app.js` (searchQuery) et `tags.js` (tags)
3. Les modifications sont toujours suivies d'un appel `update()` qui re-synchronise l'UI
Pour une application plus grande, on utiliserait un pattern comme Redux (React) ou Pinia (Vue) qui impose des règles strictes sur les modifications d'état.

---

### Q3 : "Pourquoi tags est-il un objet avec 3 tableaux et pas un seul tableau plat ?"

**Réponse :** Parce qu'on a besoin de savoir **à quelle catégorie** appartient chaque tag pour :
- Afficher les tags dans le bon groupe dans les dropdowns
- Filtrer correctement dans `filterByTags` (un ingrédient ne peut pas matcher un ustensile)
- Supprimer le bon tag lors du clic sur ×

Un tableau plat `tags: ["Lait de coco", "Blender"]` ne permettrait pas de distinguer "Lait de coco est un ingrédient" de "Blender est un appareil".

---

### Q4 : "Pourquoi utilisez-vous `state.tags[category]` avec des crochets plutôt que `state.tags.ingredients` ?"

**Réponse :** C'est l'**accès dynamique aux propriétés** en JavaScript. `category` est une variable qui contient une chaîne de caractères ("ingredients", "appliance", ou "ustensils"). On ne peut pas écrire `state.tags.category` car JavaScript chercherait littéralement une propriété nommée "category" — qui n'existe pas. La notation entre crochets `state.tags[category]` permet d'utiliser la valeur de la variable comme nom de propriété. C'est ce qui permet à `addTag`, `removeTag` et `renderDropdownOptions` de fonctionner pour les 3 catégories avec le même code.
