// État global
const state = {
  searchQuery: "",
  tags: {
    ingredients: [],
    appliance: [],
    ustensils: [],
  },
};

// Filtrage

function filterByTags(recipeList) {
  const { ingredients, appliance, ustensils } = state.tags;

  return recipeList.filter((recipe) => {
    const matchIngredients = ingredients.every((tag) =>
      recipe.ingredients.some(
        (i) => i.ingredient === tag,
      ),
    );

    const matchAppareils = appliance.every(
      (tag) => recipe.appliance === tag,
    );

    const matchUstensiles = ustensils.every((tag) =>
      recipe.ustensils.some((u) => u === tag),
    );

    return matchIngredients && matchAppareils && matchUstensiles;
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

// Dropdowns

const DROPDOWNS = [
  { id: "dropdown-ingredients", category: "ingredients" },
  { id: "dropdown-appliance", category: "appliance" },
  { id: "dropdown-ustensils", category: "ustensils" },
];

function getAvailableOptions(recipeList) {
  const ingredients = new Set();
  const appliance = new Set();
  const ustensils = new Set();

  recipeList.forEach(recipe => {
    recipe.ingredients.forEach(i => ingredients.add(i.ingredient));
    appliance.add(recipe.appliance);
    recipe.ustensils.forEach(u => ustensils.add(u));
  });

  return {
    ingredients: [...ingredients].sort((a, b) => a.localeCompare(b, 'fr')),
    appliance:   [...appliance].sort((a, b) => a.localeCompare(b, 'fr')),
    ustensils:  [...ustensils].sort((a, b) => a.localeCompare(b, 'fr')),
  };
}

function renderDropdownOptions(listEl, options, filterText, category) {
  listEl.innerHTML = '';
  const categorySet = new Set(state.tags[category].map(t => t));

  options
    .filter(opt => !categorySet.has(opt))
    .filter(opt => opt.includes(filterText.toLowerCase()))
    .forEach(opt => {
      const li = document.createElement('li');
      li.className = 'px-3 py-2 cursor-pointer rounded hover:bg-[#FFD15B]';
      li.textContent = opt;
      li.addEventListener('click', () => addTag(category, opt));
      listEl.appendChild(li);
    });
}

function updateDropdowns(recipeList) {
  const options = getAvailableOptions(recipeList);

  DROPDOWNS.forEach(({ id, category }) => {
    const panel = document.querySelector(`#${id} .dropdown-panel`);
    const searchInput = panel.querySelector('.dropdown-search');
    const list = panel.querySelector('.dropdown-list');
    renderDropdownOptions(list, options[category], searchInput.value, category);
  });
}

function closeAllDropdowns() {
  DROPDOWNS.forEach(({ id }) => {
    const el = document.getElementById(id);
    el.querySelector('.dropdown-panel').classList.add('hidden');
    el.querySelector('.chevron').classList.remove('rotate-180');
  });
}

// Tags

function addTag(category, value) {
  if (!state.tags[category].includes(value)) {
    state.tags[category].push(value);
    update();
  }
  closeAllDropdowns();
}

function removeTag(category, value) {
  state.tags[category] = state.tags[category].filter(t => t !== value);
  update();
}

function renderActiveTags() {
  const container = document.getElementById('active-tags');
  container.innerHTML = '';

  DROPDOWNS.forEach(({ category }) => {
    state.tags[category].forEach(value => {
      const tag = document.createElement('span');
      tag.className = 'flex items-center gap-3 bg-[#FFD15B] px-4 py-2 rounded-xl text-sm';

      const text = document.createElement('span');
      text.textContent = value;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'font-bold text-base leading-none';
      btn.textContent = '×';
      btn.setAttribute('aria-label', `Supprimer le filtre ${value}`);
      btn.addEventListener('click', () => removeTag(category, value));

      tag.appendChild(text);
      tag.appendChild(btn);
      container.appendChild(tag);
    });
  });
}

// Rendu des cartes

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

// Mise à jour globale

function update() {
  const filtered = getFilteredRecipes();
  renderRecipes(filtered);
  renderActiveTags();
  updateDropdowns(filtered);
}

// Événements

// Ouverture/fermeture des dropdowns
DROPDOWNS.forEach(({ id }) => {
  const el = document.getElementById(id);
  const toggle = el.querySelector('.dropdown-toggle');
  const panel = el.querySelector('.dropdown-panel');
  const chevron = el.querySelector('.chevron');

  toggle.addEventListener('click', () => {
    const isOpen = !panel.classList.contains('hidden');
    closeAllDropdowns();
    if (!isOpen) {
      panel.classList.remove('hidden');
      chevron.classList.add('rotate-180');
      panel.querySelector('.dropdown-search').focus();
    }
  });

  // Recherche dans le dropdown
  panel.querySelector('.dropdown-search').addEventListener('input', e => {
    const list = panel.querySelector('.dropdown-list');
    const { category } = DROPDOWNS.find(d => d.id === id);
    const options = getAvailableOptions(getFilteredRecipes());
    renderDropdownOptions(list, options[category], e.target.value, category);
  });
});

// Fermeture au clic extérieur
document.addEventListener('click', e => {
  if (!e.target.closest('[id^="dropdown-"]')) closeAllDropdowns();
});

// Recherche principale (branchée, algo à implémenter dans les branches A/B)
document.getElementById('search-main').addEventListener('input', e => {
  state.searchQuery = e.target.value.trim();
  update();
});

// Init

update();