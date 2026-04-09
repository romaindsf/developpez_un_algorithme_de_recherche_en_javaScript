# explications.search.js — L'algorithme de recherche (CŒUR DU PROJET)

> **C'est le fichier le plus important à maîtriser pour la soutenance.**
> Il contient l'algorithme principal qui fait tout le travail de filtrage.

---

## Rôle du fichier

`search.js` est **le moteur de recherche**. Il reçoit la liste complète des 50 recettes, applique les critères de filtrage (texte saisi + tags sélectionnés), et retourne uniquement les recettes qui correspondent.

Ce fichier est sur la **branche A — Algo boucles natives** (`feature/algo-loops`).

---

## Le code complet avec explications ligne par ligne

```javascript
// ─────────────────────────────────────────────────────────────────
// FONCTION 1 : filterByTags
// Filtre les recettes selon les tags actifs (ingrédients, appareils, ustensiles)
// ─────────────────────────────────────────────────────────────────

function filterByTags(recipeList) {
  // On destructure state.tags pour récupérer les 3 tableaux de tags actifs
  // Ex : ingredients = ["Lait de coco", "Sucre"], appliance = ["Blender"], ustensils = []
  const { ingredients, appliance, ustensils } = state.tags;

  // .filter() retourne un NOUVEAU tableau (non-mutation du tableau original)
  // Pour chaque recette, on vérifie qu'elle satisfait TOUS les tags actifs
  return recipeList.filter(recipe => {

    // .every() = logique AND : tous les tags sélectionnés doivent être présents
    // .some()  = logique OR  : au moins un ingrédient de la recette doit matcher
    // Ici : CHAQUE tag ingredient sélectionné doit se trouver QUELQUE PART dans les ingrédients de la recette
    const matchIngredients = ingredients.every(tag =>
      recipe.ingredients.some(i => i.ingredient === tag)
    //                                              ^^^^ comparaison stricte (===)
    //                                              pas .includes() car on compare des objets
    );

    // Pour l'appareil : il n'y en a qu'un par recette (string, pas tableau)
    // appliance est toujours un tableau de 0 ou 1 élément (on ne peut pas sélectionner 2 appareils)
    // .every() sur tableau vide retourne TOUJOURS true → si aucun appareil sélectionné, toutes les recettes passent
    const matchAppliance = appliance.every(tag =>
      recipe.appliance === tag
    );

    // Même logique pour les ustensiles
    const matchUstensils = ustensils.every(tag =>
      recipe.ustensils.some(u => u === tag)
    );

    // La recette est conservée SEULEMENT si elle satisfait LES TROIS conditions
    // C'est la logique AND globale : ingrédients ET appareil ET ustensiles
    return matchIngredients && matchAppliance && matchUstensils;
  });
}
```

```javascript
// ─────────────────────────────────────────────────────────────────
// FONCTION 2 : filterBySearch  ← L'ALGO A (boucles natives)
// Filtre les recettes selon le texte saisi dans la barre principale
// ─────────────────────────────────────────────────────────────────

// Commentaire explicite dans le code : "Algo A — Boucles natives (for, break, continue)"
function filterBySearch(recipeList) {

  // RÈGLE MÉTIER : la recherche ne se déclenche qu'à partir de 3 caractères
  // Si moins de 3 caractères, on retourne toutes les recettes sans filtrer
  // Cela évite des résultats trop nombreux et peu pertinents sur 1-2 lettres
  if (state.searchQuery.length < 3) return recipeList;

  // On normalise la requête en minuscules UNE SEULE FOIS (optimisation)
  // Si on faisait .toLowerCase() à l'intérieur de la boucle, on le recalculerait n fois inutilement
  const query = state.searchQuery.toLowerCase();

  // Tableau résultat : on accumule les recettes qui matchent
  const results = [];

  // BOUCLE PRINCIPALE : parcours de chaque recette (n = 50)
  for (let i = 0; i < recipeList.length; i++) {
    const recipe = recipeList[i];

    // TEST 1 : le nom de la recette contient-il la requête ?
    // .toLowerCase() pour comparaison insensible à la casse
    // .includes() : sous-chaîne — "choc" trouve "chocolat"
    if (recipe.name.toLowerCase().includes(query)) {
      results.push(recipe);
      continue;  // ← SHORT-CIRCUIT : on a trouvé, inutile de tester description et ingrédients
                 // "continue" passe directement à la recette suivante (i++)
    }

    // TEST 2 : la description contient-elle la requête ?
    // On arrive ici uniquement si le nom n'a PAS matché
    if (recipe.description.toLowerCase().includes(query)) {
      results.push(recipe);
      continue;  // ← idem, on saute les ingrédients
    }

    // TEST 3 : un ingrédient contient-il la requête ?
    // On arrive ici uniquement si nom ET description n'ont PAS matché
    // BOUCLE IMBRIQUÉE : parcours des ingrédients de cette recette (m ≈ 6)
    for (let j = 0; j < recipe.ingredients.length; j++) {
      if (recipe.ingredients[j].ingredient.toLowerCase().includes(query)) {
        results.push(recipe);
        break;  // ← SHORT-CIRCUIT : on a trouvé UN ingrédient qui matche, inutile de tester les suivants
                // "break" sort de la boucle interne (ingrédients), pas de la boucle externe (recettes)
      }
    }
    // Si aucun ingrédient ne matche : on ne pousse rien, on passe à la recette suivante
  }

  return results;
}
```

```javascript
// ─────────────────────────────────────────────────────────────────
// FONCTION 3 : getFilteredRecipes
// Point d'entrée unique : combine les deux filtres
// ─────────────────────────────────────────────────────────────────

function getFilteredRecipes() {
  // COMPOSITION de fonctions :
  // 1. filterBySearch(recipes) → filtre les 50 recettes par texte → donne [recettes_texte]
  // 2. filterByTags([recettes_texte]) → filtre ce résultat par tags → donne [recettes_finales]
  //
  // L'ordre est important : on filtre d'abord par texte, PUIS par tags
  // Cela respecte la règle métier : les dropdowns ne proposent que les options des recettes restantes
  return filterByTags(filterBySearch(recipes));
  //                                 ^^^^^^^ recettes vient de recipes.js, variable globale
}
```

---

## Explication visuelle de l'algorithme (Algo A)

```
recipes (50 recettes)
        │
        ▼
filterBySearch(recipes)
        │
        ├── recette 0 : "Limonade de Coco"
        │       ├── nom contient "coco" ? OUI → push + continue ✓
        │
        ├── recette 1 : "Poisson Cru à la tahitienne"
        │       ├── nom contient "coco" ? NON
        │       ├── description contient "coco" ? NON
        │       ├── ingrédient[0] "Thon Rouge" contient "coco" ? NON
        │       ├── ingrédient[1] "Concombre" contient "coco" ? NON
        │       └── ... aucun match → recette ignorée ✗
        │
        ├── recette 2 : "Tarte au chocolat"
        │       ├── nom contient "coco" ? NON
        │       ├── description contient "coco" ? OUI → push + continue ✓
        │
        └── ... (47 autres recettes)
        │
        ▼
[recettes où "coco" apparaît]
        │
        ▼
filterByTags([...])
        │   (si tag "Blender" actif)
        ├── garde uniquement les recettes avec appliance === "Blender"
        │
        ▼
résultat final affiché
```

---

## Complexité algorithmique

### Notation Big O de filterBySearch

- **n** = nombre de recettes (50 dans notre cas)
- **m** = nombre d'ingrédients par recette (≈ 6 en moyenne)
- **k** = longueur du champ de texte (name, description, ingredient)

**Cas pire** : aucune recette ne matche → on parcourt tout
- Boucle externe : n itérations
- Pour chaque recette : test name (O(k)), test description (O(k)), boucle ingredients m×O(k)
- **Total : O(n × m)** — linéaire composé

**Cas optimal** : le nom de la recette matche toujours
- On ne teste jamais description ni ingrédients (grâce au `continue`)
- **Total : O(n)** — strictement linéaire

### Pourquoi c'est acceptable

Avec n=50 et m≈6 :
- Cas pire : 50 × 6 = 300 opérations élémentaires
- Exécuté en quelques microsecondes sur n'importe quel ordinateur
- La recherche dichotomique (O(log n)) serait 6x plus rapide en théorie, mais nécessite des données **triées** — impossible ici car on cherche par sous-chaîne, pas par valeur exacte

---

## Différence Algo A vs Algo B

| | Algo A (boucles natives) | Algo B (fonctionnel) |
|---|---|---|
| **Syntaxe** | `for`, `break`, `continue` | `filter`, `some`, `every` |
| **Lisibilité** | Plus verbeux mais très explicite | Plus compact et déclaratif |
| **Performance** | Légèrement plus rapide | Légèrement plus lent (closures, tableaux intermédiaires) |
| **Short-circuit** | `break` / `continue` explicites | Géré par `.some()` implicitement |
| **Tableaux intermédiaires** | Aucun (on pousse dans `results`) | `.filter()` crée un nouveau tableau à chaque appel |
| **Débogage** | Facile (on peut ajouter `console.log` dans la boucle) | Plus difficile (fonctions anonymes enchaînées) |

---

## Questions jury et réponses

### Q1 : "Pourquoi avez-vous choisi les boucles natives pour l'Algo A ?"

**Réponse :** L'algorithme avec boucles natives (`for`) permet d'utiliser les instructions `break` et `continue` pour court-circuiter les itérations dès qu'une correspondance est trouvée. Cela évite de parcourir inutilement les champs restants d'une recette. Avec `.filter()`, on n'a pas ce contrôle aussi fin — même si `.some()` fait du short-circuit en interne, le comportement est implicite. Les boucles natives sont aussi marginalement plus rapides car elles n'ont pas l'overhead des appels de fonctions (closures) créés par `.filter()` et `.some()`.

---

### Q2 : "Expliquez le `break` et le `continue` dans votre algorithme."

**Réponse :**
- `continue` (ligne 29 et 33) : utilisé dans la boucle externe (recettes). Quand le nom ou la description matche, on ajoute la recette et on passe **immédiatement** à la recette suivante sans tester les ingrédients. On économise m tests inutiles.
- `break` (ligne 39) : utilisé dans la boucle interne (ingrédients). Quand un ingrédient matche, on ajoute la recette et on sort **immédiatement** de la boucle ingrédients. On évite de tester les ingrédients restants de cette recette.
- Sans ces deux instructions, l'algorithme fonctionnerait quand même mais serait moins efficace et risquerait d'ajouter la même recette plusieurs fois dans `results`.

---

### Q3 : "Pourquoi la recherche se déclenche-t-elle à 3 caractères minimum ?"

**Réponse :** C'est une règle métier définie dans le cahier des charges (cas d'utilisation #03). En dessous de 3 caractères, la requête est trop courte pour être discriminante — "la" donnerait des centaines de résultats et serait inutile. La valeur 3 est un compromis entre réactivité et pertinence des résultats. Techniquement, c'est `if (state.searchQuery.length < 3) return recipeList` : on retourne le tableau complet non filtré, ce qui affiche toutes les recettes.

---

### Q4 : "Pourquoi cherchez-vous dans 3 champs différents (nom, description, ingrédients) ?"

**Réponse :** C'est la spécification du cas d'utilisation #03. Un utilisateur peut chercher "coco" et vouloir trouver des recettes dont le titre est "Limonade de Coco", ou dont la description mentionne la noix de coco, ou qui contiennent de la crème de coco comme ingrédient. La recherche dans plusieurs champs augmente la recall (taux de rappel) — on trouve plus de résultats pertinents. L'ordre des tests (nom → description → ingrédients) est intentionnel : on teste d'abord les champs les plus courts et les plus discriminants.

---

### Q5 : "Qu'est-ce que .includes() fait exactement ?"

**Réponse :** `String.prototype.includes(substring)` retourne `true` si la chaîne de caractères contient la sous-chaîne en paramètre, `false` sinon. Sa complexité est O(k) où k est la longueur du champ de texte. Par exemple : `"Limonade de Coco".toLowerCase().includes("coco")` → `true`. Ce n'est pas une recherche par mot entier — "coco" trouve aussi "noix de coco" et "chocolat-coco". C'est intentionnel : la recherche est par sous-chaîne pour être plus flexible.

---

### Q6 : "Pourquoi filterBySearch est-il appelé AVANT filterByTags ?"

**Réponse :** L'ordre est dans `getFilteredRecipes()` : `filterByTags(filterBySearch(recipes))`. On applique d'abord le filtre texte, puis les tags sur le résultat. Cela respecte la règle métier : les dropdowns ne doivent proposer que les options disponibles dans les recettes **déjà filtrées par le texte**. Si on inversait, les dropdowns pourraient proposer des ingrédients de recettes que le texte exclurait — incohérence pour l'utilisateur.

---

### Q7 : "Comment gérez-vous la casse (majuscules/minuscules) ?"

**Réponse :** On normalise tout en minuscules avant la comparaison :
- La requête : `const query = state.searchQuery.toLowerCase()` — calculé UNE SEULE FOIS avant la boucle
- Chaque champ : `recipe.name.toLowerCase()`, `recipe.description.toLowerCase()`, `recipe.ingredients[j].ingredient.toLowerCase()`
On n'utilise pas les regex car `.toLowerCase()` + `.includes()` est plus lisible et suffisant pour ce use case.

---

### Q8 : "Votre algorithme est-il sécurisé ?"

**Réponse :** Oui, pour deux raisons :
1. **Pas d'injection XSS** : on ne passe jamais l'input utilisateur directement dans du HTML. La requête est utilisée uniquement pour des comparaisons JavaScript (`.includes()`), jamais insérée dans le DOM.
2. **Pas d'injection de code** : `.includes()` est une méthode sur une chaîne de caractères — elle ne peut pas exécuter du code. Le pire qu'un utilisateur puisse faire est de taper une chaîne qui ne matche rien.

---

### Q9 : "Quelle est la différence entre `===` et `.includes()` dans vos comparaisons ?"

**Réponse :**
- Dans `filterBySearch` : on utilise `.includes()` pour une **recherche partielle** (sous-chaîne). "coco" trouve "noix de coco".
- Dans `filterByTags` : on utilise `===` pour une **comparaison exacte**. Si le tag sélectionné est "Lait de coco", la recette doit avoir un ingrédient qui s'appelle exactement "Lait de coco". C'est normal car les tags viennent des dropdowns, qui eux-mêmes viennent des données — il n'y a donc pas d'ambiguïté.

---

### Q10 : "Que se passe-t-il si l'utilisateur efface tout ce qu'il a tapé ?"

**Réponse :** La propriété `state.searchQuery` est mise à jour à chaque frappe via l'event listener `input`. Quand l'utilisateur efface tout, `state.searchQuery` devient `''` (chaîne vide). La condition `if (state.searchQuery.length < 3) return recipeList` est déclenchée (0 < 3), donc `filterBySearch` retourne toutes les recettes sans filtrer. Le résultat affiché revient aux 50 recettes (ou aux recettes filtrées par tags s'il y en a).
