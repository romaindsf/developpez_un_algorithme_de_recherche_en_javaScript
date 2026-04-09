# explications.app.js — Orchestrateur central et event listeners

> `app.js` est le chef d'orchestre. Il ne fait rien tout seul — il connecte toutes les autres pièces.

---

## Rôle du fichier

`app.js` a deux responsabilités :

1. **La fonction `update()`** : l'unique point d'entrée pour rafraîchir toute l'interface. Dès que quelque chose change, on appelle `update()`.
2. **Les event listeners** : écouter les interactions de l'utilisateur (frappe dans la barre de recherche, clics sur les dropdowns, clic à l'extérieur) et réagir en modifiant `state` puis en appelant `update()`.

C'est le dernier fichier chargé car il appelle des fonctions définies dans tous les autres fichiers.

---

## Le code complet avec explications ligne par ligne

```javascript
// ─────────────────────────────────────────────────────────────────
// FONCTION update() : LE CŒUR DE L'ORCHESTRATION
// ─────────────────────────────────────────────────────────────────

function update() {
  // Étape 1 : calculer la liste des recettes filtrées (search.js)
  // Cette liste est stockée dans une variable locale car on en a besoin plusieurs fois
  const filtered = getFilteredRecipes();

  // Étape 2 : vider et reconstruire la grille de cartes (cards.js)
  renderRecipes(filtered);

  // Étape 3 : vider et reconstruire les badges de tags actifs (tags.js)
  renderActiveTags();

  // Étape 4 : vider et reconstruire les listes des dropdowns (dropdowns.js)
  // On passe "filtered" (pas la liste complète) car les dropdowns
  // ne doivent proposer que les options des recettes actuellement affichées
  updateDropdowns(filtered);
}
// NOTE : update() est déclarée ici mais utilisée aussi dans tags.js (addTag, removeTag)
// JavaScript hisse les déclarations de fonctions (hoisting) donc ce n'est pas un problème
```

```javascript
// ─────────────────────────────────────────────────────────────────
// EVENT LISTENERS : DROPDOWNS (ouverture / fermeture / recherche interne)
// ─────────────────────────────────────────────────────────────────

// On boucle sur les 3 dropdowns pour éviter de répéter 3x le même code
DROPDOWNS.forEach(({ id }) => {
  // Récupération des éléments DOM de ce dropdown
  const el = document.getElementById(id);
  const toggle = el.querySelector('.dropdown-toggle');  // ← le bouton "Ingrédients ▼"
  const panel = el.querySelector('.dropdown-panel');    // ← le panneau déroulant (liste + recherche)
  const chevron = el.querySelector('.chevron');          // ← l'icône ▼ / ▲

  // ── Listener 1 : clic sur le bouton toggle ──────────────────────
  toggle.addEventListener('click', () => {
    // On vérifie si le panel est ACTUELLEMENT ouvert
    // "hidden" est une classe Tailwind qui applique display:none
    const isOpen = !panel.classList.contains('hidden');

    // On ferme TOUS les dropdowns d'abord (y compris celui-ci s'il était ouvert)
    closeAllDropdowns();

    // Si le dropdown était FERMÉ, on l'ouvre maintenant
    if (!isOpen) {
      panel.classList.remove('hidden');         // ← rend visible
      chevron.classList.add('rotate-180');      // ← anime le chevron ▼ → ▲
      panel.querySelector('.dropdown-search').focus();  // ← met le focus sur le champ de recherche interne
      // focus() = meilleure UX : l'utilisateur peut taper immédiatement
    }
    // Si le dropdown était OUVERT : il a été fermé par closeAllDropdowns() → rien d'autre à faire
  });

  // ── Listener 2 : frappe dans le champ de recherche interne du dropdown ──
  panel.querySelector('.dropdown-search').addEventListener('input', e => {
    const list = panel.querySelector('.dropdown-list');

    // On retrouve la category correspondant à cet id (ex: 'ingredients' pour 'dropdown-ingredients')
    const { category } = DROPDOWNS.find(d => d.id === id);

    // On recalcule les options disponibles depuis les recettes actuellement filtrées
    const options = getAvailableOptions(getFilteredRecipes());

    // On re-rend uniquement la liste de CE dropdown avec le filtre texte appliqué
    renderDropdownOptions(list, options[category], e.target.value, category);
    //                                              ^^^^^^^^^^^^^ texte saisi dans le dropdown
  });
});
```

```javascript
// ─────────────────────────────────────────────────────────────────
// EVENT LISTENER : FERMETURE AU CLIC EXTÉRIEUR
// ─────────────────────────────────────────────────────────────────

document.addEventListener('click', e => {
  // e.target.closest('[id^="dropdown-"]') remonte dans l'arbre DOM
  // à partir de l'élément cliqué pour chercher un ancêtre dont l'id commence par "dropdown-"
  // Si on a cliqué EN DEHORS d'un dropdown → .closest() retourne null → on ferme tout
  if (!e.target.closest('[id^="dropdown-"]')) closeAllDropdowns();
  //   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  //   Sélecteur CSS attr : id commençant par "dropdown-"
  //   ^= signifie "commence par" en sélecteur d'attribut CSS
});
```

```javascript
// ─────────────────────────────────────────────────────────────────
// EVENT LISTENER : BARRE DE RECHERCHE PRINCIPALE
// ─────────────────────────────────────────────────────────────────

document.getElementById('search-main').addEventListener('input', e => {
  // 'input' se déclenche à CHAQUE frappe (différent de 'change' qui se déclenche à la perte de focus)
  // .trim() supprime les espaces au début et à la fin
  // Ex : "  coco  " → "coco"
  state.searchQuery = e.target.value.trim();

  // Déclenche le recalcul complet de l'interface
  update();
});

// ─────────────────────────────────────────────────────────────────
// INITIALISATION : premier rendu au chargement de la page
// ─────────────────────────────────────────────────────────────────

// On appelle update() une fois au démarrage pour :
// - Afficher les 50 recettes (state.searchQuery est vide → retourne tout)
// - Remplir les dropdowns avec toutes les options disponibles
// - Afficher le compteur "50 recettes"
update();
```

---

## Schéma du flux d'événements

```
Utilisateur tape "coco" dans la barre
        ↓
listener 'input' sur #search-main
        ↓
state.searchQuery = "coco"
        ↓
update()
        ├── getFilteredRecipes() → [recettes avec "coco"]
        ├── renderRecipes([...]) → cartes mises à jour dans le DOM
        ├── renderActiveTags()   → badges tags mis à jour
        └── updateDropdowns([...]) → listes filtrées mises à jour


Utilisateur clique sur "Blender" dans le dropdown Appareils
        ↓
listener 'click' sur le <li> dans renderDropdownOptions()
        ↓
addTag('appliance', 'Blender')  [dans tags.js]
        ↓
state.tags.appliance.push('Blender')
        ↓
update()  ← appelé depuis addTag()
        ├── getFilteredRecipes() → [recettes "coco" + appareil Blender]
        └── ...
```

---

## Pourquoi 'input' et non 'keyup' ou 'change' ?

| Événement | Se déclenche | Problème |
|---|---|---|
| `keyup` | À chaque relâchement de touche | Ne gère pas le copier-coller, les coupures, etc. |
| `change` | Quand le champ perd le focus | Trop tardif — l'utilisateur doit cliquer ailleurs |
| `input` ✓ | À chaque modification du contenu | Gère clavier, copier-coller, dictée vocale, etc. |

`input` est l'événement recommandé pour la recherche en temps réel.

---

## La technique .closest() pour la détection de clic extérieur

```javascript
e.target.closest('[id^="dropdown-"]')
```

Imaginons que l'utilisateur clique sur une option dans la liste d'un dropdown :
```
document  ← listener ici
  └─ #dropdown-ingredients  ← closest trouve ça
       └─ .dropdown-panel
            └─ .dropdown-list
                 └─ li  ← e.target (élément cliqué)
```

`.closest()` remonte dans l'arbre DOM depuis `li` → `ul` → `.dropdown-panel` → `#dropdown-ingredients` → TROUVÉ → retourne l'élément → `!` inverse → `false` → on ne ferme PAS le dropdown.

Si on clique sur la carte d'une recette (en dehors du dropdown), `.closest()` ne trouve aucun ancêtre avec `id^="dropdown-"` → retourne `null` → `!null === true` → on ferme les dropdowns.

---

## Questions jury et réponses

### Q1 : "Pourquoi tout passe par une seule fonction `update()` ?"

**Réponse :** C'est le pattern du **rendu déclaratif**. Plutôt que de mettre à jour chaque partie de l'UI indépendamment (ce qui peut créer des incohérences), on part toujours de l'état actuel et on recalcule tout. C'est prévisible et facile à déboguer : si l'affichage est incorrect, on sait que le problème vient de l'état ou d'une fonction de rendu. L'inconvénient est qu'on re-rend tout même quand peu de choses ont changé — acceptable avec 50 recettes, mais problématique à grande échelle (c'est pourquoi React utilise un DOM virtuel avec comparaison de différences).

---

### Q2 : "Pourquoi `app.js` est-il le dernier fichier chargé ?"

**Réponse :** `app.js` appelle des fonctions définies dans tous les autres fichiers : `getFilteredRecipes()` (search.js), `renderRecipes()` (cards.js), `renderActiveTags()` (tags.js), `updateDropdowns()` (dropdowns.js). Si `app.js` était chargé avant ces fichiers, JavaScript lèverait une `ReferenceError` : "getFilteredRecipes is not defined". L'ordre de chargement des `<script>` dans le HTML garantit que toutes les dépendances sont disponibles quand `app.js` s'exécute.

---

### Q3 : "Qu'est-ce que `e.target.closest()` fait ?"

**Réponse :** `.closest(selector)` est une méthode DOM qui, à partir d'un élément, remonte dans l'arbre DOM vers les ancêtres jusqu'à trouver un élément qui correspond au sélecteur CSS donné. Si aucun ancêtre ne correspond, elle retourne `null`. Ici, `'[id^="dropdown-"]'` est un sélecteur d'attribut CSS — il sélectionne tout élément dont l'attribut `id` commence par "dropdown-". C'est la technique standard pour détecter un clic en dehors d'un composant sans avoir besoin de bibliothèque externe.

---

### Q4 : "Pourquoi appeler `closeAllDropdowns()` avant de décider d'ouvrir ?"

**Réponse :** C'est pour gérer le cas où **plusieurs dropdowns seraient ouverts simultanément**, ce qui n'est pas souhaité. La logique est :
1. Ferme tout (y compris le dropdown cliqué s'il était ouvert)
2. Si le dropdown cliqué était fermé, l'ouvre

Ainsi, cliquer sur un dropdown fermé l'ouvre, cliquer sur un dropdown ouvert le ferme, et cliquer sur un dropdown quand un autre est ouvert ferme l'autre et ouvre le nouveau. Tout ça avec seulement 4 lignes de code.

---

### Q5 : "Pourquoi `.trim()` sur la valeur de recherche ?"

**Réponse :** `.trim()` supprime les espaces en début et fin de chaîne. Sans lui, un utilisateur qui taperait " coco " (avec des espaces involontaires) ne trouverait aucun résultat car aucun nom de recette ne contient " coco " avec des espaces. C'est une petite amélioration d'UX qui évite les faux négatifs. Note : on ne supprime pas les espaces au milieu de la chaîne, car "tarte aux pommes" est une requête valide avec des espaces internes.

---

### Q6 : "Pourquoi utiliser `DROPDOWNS.forEach` plutôt que de répéter le code 3 fois ?"

**Réponse :** Principe **DRY (Don't Repeat Yourself)**. Sans la boucle, on aurait 3 blocs de code identiques — un pour les ingrédients, un pour les appareils, un pour les ustensiles. Si on voulait changer le comportement (par exemple, ajouter un effet d'animation à l'ouverture), on devrait le modifier 3 fois. Avec la boucle, une seule modification suffit. C'est aussi plus maintenable si on ajoute une 4ème catégorie de filtre — il suffit d'ajouter un objet dans le tableau `DROPDOWNS` dans `state.js`.
