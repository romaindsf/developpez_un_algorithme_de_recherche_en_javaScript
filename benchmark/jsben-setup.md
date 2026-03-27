# Benchmark jsben.ch — Algo de recherche

URL : https://jsben.ch

---

## Mode d'emploi

1. Aller sur **jsben.ch**
2. Coller le bloc **Setup** dans le champ "Setup" (icône engrenage ou onglet "Setup Code")
3. Coller **Snippet 1** dans le bloc "Case 1"
4. Coller **Snippet 2** dans le bloc "Case 2"
5. Cliquer sur **Run** (ou le bouton ▶)
6. Attendre la fin des itérations, noter les **ops/sec** pour chaque cas

---

## Bloc Setup (exécuté une seule fois avant chaque snippet)

Copier le contenu de `recipes/recipes.js` **en entier**, puis ajouter à la fin :

```js
const state = {
  searchQuery: 'coco',
  tags: { ingredients: [], appliance: [], ustensils: [] },
};
```

> Le terme `'coco'` est représentatif : court, présent dans plusieurs recettes (noms, descriptions, ingrédients), sans correspondance dans tous les champs — ce qui force les deux algos à parcourir les trois niveaux.

---

## Snippet 1 — Algo A : Boucles natives

```js
function filterBySearch(recipeList) {
  if (state.searchQuery.length < 3) return recipeList;
  const query = state.searchQuery.toLowerCase();
  const results = [];

  for (let i = 0; i < recipeList.length; i++) {
    const recipe = recipeList[i];

    if (recipe.name.toLowerCase().includes(query)) {
      results.push(recipe);
      continue;
    }
    if (recipe.description.toLowerCase().includes(query)) {
      results.push(recipe);
      continue;
    }
    for (let j = 0; j < recipe.ingredients.length; j++) {
      if (recipe.ingredients[j].ingredient.toLowerCase().includes(query)) {
        results.push(recipe);
        break;
      }
    }
  }
  return results;
}

filterBySearch(recipes);
```

---

## Snippet 2 — Algo B : Programmation fonctionnelle

```js
function filterBySearch(recipeList) {
  if (state.searchQuery.length < 3) return recipeList;
  const query = state.searchQuery.toLowerCase();

  return recipeList.filter(recipe =>
    recipe.name.toLowerCase().includes(query) ||
    recipe.description.toLowerCase().includes(query) ||
    recipe.ingredients.some(i => i.ingredient.toLowerCase().includes(query))
  );
}

filterBySearch(recipes);
```

---

## Après le benchmark

Reporter les résultats dans `fiche-investigation.md` — section **Résultats du benchmark** :

| Algorithme | Ops/sec | Navigateur | Date |
|---|---|---|---|
| Algo A — Boucles natives | _à compléter_ | | |
| Algo B — Fonctionnel | _à compléter_ | | |
