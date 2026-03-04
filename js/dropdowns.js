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
    ustensils:   [...ustensils].sort((a, b) => a.localeCompare(b, 'fr')),
  };
}

function renderDropdownOptions(listEl, options, filterText, category) {
  listEl.innerHTML = '';
  const activeSet = new Set(state.tags[category]);

  options
    .filter(opt => !activeSet.has(opt))
    .filter(opt => opt.toLowerCase().includes(filterText.toLowerCase()))
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
