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

// Placeholder — remplacé par l'algo de recherche principal (branches A/B)
function filterBySearch(recipeList) {
  if (state.searchQuery.length < 3) return recipeList;
  // TODO: algo de recherche principal (boucles natives ou fonctionnel)
  return recipeList;
}

function getFilteredRecipes() {
  return filterByTags(filterBySearch(recipes));
}
