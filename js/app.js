function update() {
  const filtered = getFilteredRecipes();
  renderRecipes(filtered);
  renderActiveTags();
  updateDropdowns(filtered);
}

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

// Recherche principale
document.getElementById('search-main').addEventListener('input', e => {
  state.searchQuery = e.target.value.trim();
  update();
});

update();
