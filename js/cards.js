function createIngredientItem(ing) {
  const li = document.createElement('li');

  const name = document.createElement('span');
  name.className = 'font-bold block';
  name.textContent = ing.ingredient;
  li.appendChild(name);

  if (ing.quantity !== undefined) {
    const detail = document.createElement('span');
    detail.className = 'text-[#7A7A7A]';
    detail.textContent = ing.quantity + (ing.unit ? ' ' + ing.unit : '');
    li.appendChild(detail);
  }

  return li;
}

function createRecipeCard(recipe) {
  const card = document.createElement('article');
  card.className = 'bg-white rounded-[21px] shadow-[0_4px_34px_rgba(0,0,0,0.08)] overflow-hidden';

  const imgWrapper = document.createElement('div');
  imgWrapper.className = 'relative';

  const img = document.createElement('img');
  img.src = `recipes img/${recipe.image}`;
  img.alt = recipe.name;
  img.className = 'w-full h-64 object-cover';
  img.loading = 'lazy';

  const badge = document.createElement('span');
  badge.className = 'absolute top-4 right-4 bg-[#FFD15B] text-xs font-medium px-3 py-1 rounded-full';
  badge.textContent = `${recipe.time}min`;

  imgWrapper.appendChild(img);
  imgWrapper.appendChild(badge);

  const body = document.createElement('div');
  body.className = 'p-6';

  const title = document.createElement('h2');
  title.className = 'font-anton text-lg mb-4';
  title.textContent = recipe.name;

  const recetteLabel = document.createElement('p');
  recetteLabel.className = 'text-[#7A7A7A] text-xs font-bold uppercase tracking-widest mb-1';
  recetteLabel.textContent = 'Recette';

  const desc = document.createElement('p');
  desc.className = 'text-sm text-[#1B1B1B] mb-4 line-clamp-4';
  desc.textContent = recipe.description;

  const ingLabel = document.createElement('p');
  ingLabel.className = 'text-[#7A7A7A] text-xs font-bold uppercase tracking-widest mb-2';
  ingLabel.textContent = 'Ingrédients';

  const ingList = document.createElement('ul');
  ingList.className = 'grid grid-cols-2 gap-x-4 gap-y-2 text-sm';
  recipe.ingredients.forEach(ing => ingList.appendChild(createIngredientItem(ing)));

  body.appendChild(title);
  body.appendChild(recetteLabel);
  body.appendChild(desc);
  body.appendChild(ingLabel);
  body.appendChild(ingList);

  card.appendChild(imgWrapper);
  card.appendChild(body);

  return card;
}

function renderRecipes(recipeList) {
  const grid = document.getElementById('recipes-grid');
  const count = document.getElementById('recipes-count');

  grid.innerHTML = '';
  count.textContent = `${recipeList.length} recette${recipeList.length > 1 ? 's' : ''}`;

  if (recipeList.length === 0) {
    const msg = document.createElement('p');
    msg.className = 'col-span-3 text-center py-16 text-[#7A7A7A]';
    msg.textContent = `Aucune recette ne contient "${state.searchQuery}", vous pouvez chercher « tarte aux pommes », « poisson », etc.`;
    grid.appendChild(msg);
    return;
  }

  recipeList.forEach(recipe => grid.appendChild(createRecipeCard(recipe)));
}
