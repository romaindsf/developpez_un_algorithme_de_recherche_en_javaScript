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
