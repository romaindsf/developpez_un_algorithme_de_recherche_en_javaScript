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

// Algo B — Programmation fonctionnelle (filter, some, includes)
function filterBySearch(recipeList) {
  if (state.searchQuery.length < 3) return recipeList;
  const query = state.searchQuery.toLowerCase();

  return recipeList.filter(recipe =>
    recipe.name.toLowerCase().includes(query) ||
    recipe.description.toLowerCase().includes(query) ||
    recipe.ingredients.some(i => i.ingredient.toLowerCase().includes(query))
  );
}

function getFilteredRecipes() {
  return filterByTags(filterBySearch(recipes));
}
