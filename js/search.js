function filterByTags(recipeList) {
  const { ingredients, appliance, ustensils } = state.tags;

  return recipeList.filter(recipe => {
    const matchIngredients = ingredients.every(tag =>
      recipe.ingredients.some(i => i.ingredient === tag)
    );
    const matchAppliance = appliance.every(tag =>
      recipe.appliance === tag
    );
    const matchUstensils = ustensils.every(tag =>
      recipe.ustensils.some(u => u === tag)
    );
    return matchIngredients && matchAppliance && matchUstensils;
  });
}

// Algo A — Boucles natives (for, break, continue)
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

function getFilteredRecipes() {
  return filterByTags(filterBySearch(recipes));
}
