# explications.dropdowns.js — Gestion des menus filtres avancés

> `dropdowns.js` gère les 3 menus déroulants : Ingrédients, Appareils, Ustensiles.

---

## Rôle du fichier

`dropdowns.js` s'occupe de deux choses :
1. **Calculer les options disponibles** à partir des recettes actuellement affichées (`getAvailableOptions`)
2. **Afficher ces options** dans les menus déroulants, en tenant compte des tags déjà sélectionnés et du texte de recherche interne (`renderDropdownOptions`)
3. **Orchestrer** la mise à jour des 3 dropdowns en une fois (`updateDropdowns`)
4. **Fermer** tous les dropdowns (`closeAllDropdowns`)

La règle clé : les dropdowns ne proposent que les options **des recettes actuellement filtrées**. Si une recherche réduit les résultats à 5 recettes, les dropdowns ne proposent que les ingrédients/appareils/ustensiles de ces 5 recettes.

---

## Le code complet avec explications ligne par ligne

```javascript
// ─────────────────────────────────────────────────────────────────
// FONCTION 1 : getAvailableOptions
// Extrait toutes les options uniques des recettes actuellement filtrées
// ─────────────────────────────────────────────────────────────────

function getAvailableOptions(recipeList) {
  // On utilise des SET pour accumuler les valeurs UNIQUES
  // Un Set est une collection sans doublons : si on ajoute "Blender" 5 fois, il n'y en a qu'un
  // Avantage vs tableau : .add() est O(1) — pas besoin de vérifier si l'élément existe déjà
  const ingredients = new Set();
  const appliance = new Set();
  const ustensils = new Set();

  // Parcours de chaque recette
  recipeList.forEach(recipe => {
    // Parcours de chaque ingrédient de la recette
    // .add() ajoute au Set (ignore si déjà présent)
    recipe.ingredients.forEach(i => ingredients.add(i.ingredient));

    // L'appareil est une string simple (pas un tableau)
    appliance.add(recipe.appliance);

    // Parcours de chaque ustensile
    recipe.ustensils.forEach(u => ustensils.add(u));
  });

  // On convertit les Sets en tableaux triés par ordre alphabétique (locale française)
  return {
    ingredients: [...ingredients].sort((a, b) => a.localeCompare(b, 'fr')),
    //           ^^^^^^^^^^^^^^^^^^ spread operator : Set → Array
    //                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ tri alphabétique
    //                                                           ^^^^ locale française (accents corrects)
    appliance:   [...appliance].sort((a, b) => a.localeCompare(b, 'fr')),
    ustensils:   [...ustensils].sort((a, b) => a.localeCompare(b, 'fr')),
  };
}
```

```javascript
// ─────────────────────────────────────────────────────────────────
// FONCTION 2 : renderDropdownOptions
// Remplit la liste d'un dropdown avec les options filtrées
// ─────────────────────────────────────────────────────────────────

function renderDropdownOptions(listEl, options, filterText, category) {
  // listEl  : l'élément <ul> du dropdown à remplir
  // options : tableau de toutes les options disponibles pour cette catégorie
  // filterText : texte tapé dans le champ de recherche interne du dropdown
  // category : "ingredients", "appliance", ou "ustensils"

  // Vide la liste actuelle
  listEl.innerHTML = '';

  // On construit un Set des tags DÉJÀ actifs pour cette catégorie
  // Cela permet une vérification O(1) au lieu de O(n) avec .includes()
  const activeSet = new Set(state.tags[category]);
  // Ex : state.tags.ingredients = ["Lait de coco"] → activeSet = Set{"Lait de coco"}

  options
    // Filtre 1 : exclure les options déjà sélectionnées comme tags
    // Si "Lait de coco" est déjà un tag actif, on ne l'affiche pas dans la liste
    .filter(opt => !activeSet.has(opt))
    //              ^^^^^^^^^^^^^^^^^ .has() sur Set = O(1) — rapide

    // Filtre 2 : exclure les options qui ne contiennent pas le texte de recherche interne
    // Insensible à la casse (.toLowerCase() des deux côtés)
    // Si filterText est vide '' : opt.toLowerCase().includes('') est toujours true → rien n'est filtré
    .filter(opt => opt.toLowerCase().includes(filterText.toLowerCase()))

    // Pour chaque option retenue, créer un <li> et l'ajouter
    .forEach(opt => {
      const li = document.createElement('li');
      li.className = 'px-3 py-2 cursor-pointer rounded hover:bg-[#FFD15B]';
      // px-3 py-2 : padding confortable pour la lisibilité
      // cursor-pointer : indique que c'est cliquable (curseur main)
      // rounded : coins légèrement arrondis
      // hover:bg-[#FFD15B] : fond jaune au survol (feedback visuel)

      li.textContent = opt;  // ← textContent : sécurité, pas d'injection HTML possible

      // Au clic sur une option → ajoute le tag correspondant
      li.addEventListener('click', () => addTag(category, opt));
      //                                 ^^^^^^^^^^^^^^^^^^^^^^ défini dans tags.js

      listEl.appendChild(li);
    });
}
```

```javascript
// ─────────────────────────────────────────────────────────────────
// FONCTION 3 : updateDropdowns
// Orchestrateur : met à jour les 3 dropdowns en une fois
// ─────────────────────────────────────────────────────────────────

function updateDropdowns(recipeList) {
  // Calcule toutes les options disponibles en une seule passe
  const options = getAvailableOptions(recipeList);
  //              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ passe une seule fois sur toutes les recettes

  // Met à jour les 3 dropdowns en bouclant sur DROPDOWNS (défini dans state.js)
  DROPDOWNS.forEach(({ id, category }) => {
    // Accès aux éléments DOM du dropdown
    const panel = document.querySelector(`#${id} .dropdown-panel`);
    const searchInput = panel.querySelector('.dropdown-search');
    const list = panel.querySelector('.dropdown-list');

    // Rendu de la liste en tenant compte du texte déjà saisi dans le champ interne
    // searchInput.value : si l'utilisateur avait tapé "but" dans la recherche d'ingrédients,
    // on conserve ce filtre lors de la mise à jour
    renderDropdownOptions(list, options[category], searchInput.value, category);
  });
}
```

```javascript
// ─────────────────────────────────────────────────────────────────
// FONCTION 4 : closeAllDropdowns
// Ferme tous les panneaux déroulants et réinitialise les chevrons
// ─────────────────────────────────────────────────────────────────

function closeAllDropdowns() {
  DROPDOWNS.forEach(({ id }) => {
    const el = document.getElementById(id);

    // Ajoute la classe 'hidden' → display:none → panneau invisible
    el.querySelector('.dropdown-panel').classList.add('hidden');

    // Retire la rotation du chevron → remet l'icône ▼ (au lieu de ▲)
    el.querySelector('.chevron').classList.remove('rotate-180');
    // rotate-180 est une classe Tailwind qui applique transform: rotate(180deg)
  });
}
```

---

## Pourquoi un `Set` plutôt qu'un tableau pour la déduplication ?

Considérons 50 recettes. Si plusieurs recettes utilisent "Beurre" comme ingrédient :

### Avec un tableau (mauvaise approche)
```javascript
const ingredients = [];
recipe.ingredients.forEach(i => {
  if (!ingredients.includes(i.ingredient)) {  // O(n) à chaque fois
    ingredients.push(i.ingredient);
  }
});
// Total : O(n × k) où k = nombre d'ingrédients déjà dans le tableau
```

### Avec un Set (notre approche)
```javascript
const ingredients = new Set();
recipe.ingredients.forEach(i => ingredients.add(i.ingredient));
// .add() vérifie l'unicité en O(1) (table de hachage)
// Total : O(n)
```

Le Set est plus rapide et plus lisible. C'est la structure de données appropriée quand on veut des valeurs uniques.

---

## La logique "options disponibles"

```
50 recettes                 L'utilisateur tape "coco"
       ↓                              ↓
filterBySearch(recipes)       →   [5 recettes avec "coco"]
       ↓                              ↓
getAvailableOptions([5 recettes]) →  uniquement les ingrédients de ces 5 recettes

Résultat dropdown Ingrédients :
  - Lait de coco
  - Crème de coco
  - Sucre
  - Glaçons
  - ...
  (pas de "Thon rouge" qui appartient à une recette absente des résultats)
```

C'est la règle métier du cas d'utilisation #03, règle 5 :
> "Les champs avancés ne proposent que les éléments des recettes actuellement affichées"

---

## Questions jury et réponses

### Q1 : "Pourquoi les options du dropdown changent-elles quand on tape dans la barre de recherche ?"

**Réponse :** C'est une règle métier fondamentale du projet (règle 5 du CU#03). Les dropdowns ne proposent que les options disponibles dans les recettes actuellement filtrées. Ainsi, si on cherche "coco", il serait inutile et trompeur de proposer "Thon rouge" dans le filtre ingrédients — on ne peut pas filtrer par un ingrédient qui n'existe dans aucune des recettes résultantes. `updateDropdowns(filtered)` reçoit la liste filtrée, pas la liste complète, pour cette raison.

---

### Q2 : "Pourquoi utilisez-vous un `Set` dans `getAvailableOptions` ?"

**Réponse :** Plusieurs recettes peuvent partager les mêmes ingrédients, appareils ou ustensiles. Sans Set, on se retrouverait avec des doublons dans les listes. Le Set garantit l'unicité automatiquement : `Set.add('Beurre')` appelé 10 fois ne stocke "Beurre" qu'une seule fois. De plus, `.add()` est O(1) (accès par hash) contre O(n) pour `.includes()` sur un tableau. C'est la structure de données idéale pour ce use case.

---

### Q3 : "Pourquoi `localeCompare(b, 'fr')` pour le tri ?"

**Réponse :** La méthode `.sort()` de JavaScript, sans argument, trie selon l'ordre Unicode — ce qui donne des résultats incorrects pour les chaînes avec des accents en français. Par exemple, `"Échalote".localeCompare("Beurre")` avec le tri standard pourrait placer "Échalote" avant "Beurre" selon l'ordre Unicode, alors qu'on voudrait "Beurre" d'abord. `localeCompare('fr')` utilise les règles de tri de la langue française, ce qui gère correctement les accents (é, à, ü, etc.) et garantit un tri alphabétique conforme aux attentes d'un utilisateur francophone.

---

### Q4 : "Que se passe-t-il si je sélectionne un tag, puis je tape dans le champ de recherche interne du dropdown ?"

**Réponse :** Dans `renderDropdownOptions`, on applique deux filtres successifs :
1. `filter(opt => !activeSet.has(opt))` — exclut les tags déjà sélectionnés
2. `filter(opt => opt.toLowerCase().includes(filterText.toLowerCase()))` — filtre par le texte tapé

Ces deux filtres sont appliqués à chaque `input` dans le champ de recherche interne. Donc si "Lait de coco" est un tag actif, il n'apparaîtra jamais dans la liste, même si l'utilisateur tape "coco". Cela évite de sélectionner deux fois le même tag, et garde la liste propre.

---

### Q5 : "Pourquoi `closeAllDropdowns` est-elle dans ce fichier et pas dans `app.js` ?"

**Réponse :** Elle est utilisée dans 3 endroits :
- `app.js` : au clic sur un toggle, et au clic extérieur
- `tags.js` : dans `addTag()` après avoir sélectionné une option

Si on la mettait dans `app.js` (dernier fichier chargé), `tags.js` (chargé avant) ne pourrait pas y accéder. En la plaçant dans `dropdowns.js` (chargé avant `tags.js` et `app.js`), elle est accessible partout. La règle est : une fonction doit être définie dans le fichier chargé **avant** tous ceux qui l'utilisent.

---

### Q6 : "Qu'est-ce que `[...ingredients]` fait ?"

**Réponse :** `...` est l'opérateur de décomposition (spread operator) de JavaScript ES6. `[...ingredients]` convertit un Set en tableau. On ne peut pas appeler `.sort()` directement sur un Set car ce n'est pas un Array. Cette syntaxe est équivalente à `Array.from(ingredients)`. Une fois converti en tableau, on peut utiliser toutes les méthodes d'Array comme `.sort()`, `.filter()`, `.map()`, etc.
