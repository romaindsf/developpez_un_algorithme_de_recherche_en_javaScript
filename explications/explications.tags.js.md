# explications.tags.js — Gestion des tags actifs

> `tags.js` gère l'ajout, la suppression et l'affichage des badges de filtres sélectionnés.

---

## Rôle du fichier

Quand l'utilisateur clique sur une option dans un dropdown (ex: "Blender"), un **tag** est créé : un badge visuel jaune avec un bouton × pour le supprimer. `tags.js` gère ce cycle de vie : ajout → affichage → suppression.

Ce fichier définit 3 fonctions :
- `addTag(category, value)` — ajoute un tag dans l'état
- `removeTag(category, value)` — supprime un tag de l'état
- `renderActiveTags()` — re-crée visuellement tous les badges actifs

---

## Le code complet avec explications ligne par ligne

```javascript
// ─────────────────────────────────────────────────────────────────
// FONCTION 1 : addTag
// Ajoute un tag dans l'état et déclenche la mise à jour
// ─────────────────────────────────────────────────────────────────

function addTag(category, value) {
  // Vérifie que le tag n'est pas déjà actif (évite les doublons)
  // Ex : si "Blender" est déjà dans state.tags.appliance, on ne l'ajoute pas deux fois
  if (!state.tags[category].includes(value)) {
    state.tags[category].push(value);  // ← .push() modifie le tableau en place (mutation)
    update();  // ← recalcule tout : recettes, tags affichés, options dropdown
  }
  // On ferme le dropdown même si le tag était déjà actif (l'utilisateur a cliqué, il faut fermer)
  closeAllDropdowns();  // ← défini dans dropdowns.js
}
```

```javascript
// ─────────────────────────────────────────────────────────────────
// FONCTION 2 : removeTag
// Supprime un tag de l'état et déclenche la mise à jour
// ─────────────────────────────────────────────────────────────────

function removeTag(category, value) {
  // .filter() retourne un NOUVEAU tableau sans la valeur supprimée (pas de mutation)
  // On écrase le tableau de tags pour la catégorie concernée
  state.tags[category] = state.tags[category].filter(t => t !== value);
  //                                           ^^^^^^^^^^^^^^^^^^^^^^^^^^
  //                                           garde tous les tags SAUF celui supprimé
  //                                           t !== value : comparaison stricte (pas d'ambiguïté)
  update();  // ← recalcule tout
}
```

```javascript
// ─────────────────────────────────────────────────────────────────
// FONCTION 3 : renderActiveTags
// Recrée visuellement tous les badges de tags actifs
// ─────────────────────────────────────────────────────────────────

function renderActiveTags() {
  // Récupère le conteneur des tags dans le DOM
  const container = document.getElementById('active-tags');

  // Vide le conteneur : supprime tous les badges existants
  container.innerHTML = '';

  // Boucle sur les 3 catégories (en utilisant DROPDOWNS de state.js)
  DROPDOWNS.forEach(({ category }) => {
    // Pour chaque tag actif dans cette catégorie
    state.tags[category].forEach(value => {

      // ── Création du badge ───────────────────────────────────────
      const tag = document.createElement('span');
      tag.className = 'flex items-center gap-3 bg-[#FFD15B] px-4 py-2 rounded-xl text-sm';
      // flex items-center : flexbox horizontal, centré verticalement
      // gap-3 : espace de 12px entre le texte et le bouton ×
      // bg-[#FFD15B] : fond jaune (couleur accent du projet)
      // px-4 py-2 : padding
      // rounded-xl : coins très arrondis (pill)
      // text-sm : petite taille de texte

      // ── Texte du tag ─────────────────────────────────────────────
      const text = document.createElement('span');
      text.textContent = value;  // ex: "Blender", "Lait de coco"

      // ── Bouton × (suppression) ───────────────────────────────────
      const btn = document.createElement('button');
      btn.type = 'button';
      // btn.type = 'button' : IMPORTANT — empêche le comportement de submit de formulaire
      // Sans ça, si le tag était dans un <form>, le clic soumettrait le formulaire

      btn.className = 'font-bold text-base leading-none';
      btn.textContent = '×';  // ← caractère ×, pas la lettre x (meilleure sémantique)

      // Accessibilité : le lecteur d'écran lira "Supprimer le filtre Blender"
      // Sans cet attribut, il lirait juste "×" ce qui n'est pas compréhensible
      btn.setAttribute('aria-label', `Supprimer le filtre ${value}`);

      // Au clic : supprime CE tag (closure sur category et value)
      btn.addEventListener('click', () => removeTag(category, value));
      //                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
      //                             Arrow function : capture category et value par closure
      //                             Chaque bouton × est lié à son propre tag

      // ── Assemblage ───────────────────────────────────────────────
      tag.appendChild(text);
      tag.appendChild(btn);
      container.appendChild(tag);
    });
  });
}
```

---

## Concept : la closure dans les event listeners

Dans `renderActiveTags()`, on crée plusieurs boutons × dans une boucle. Chaque bouton doit savoir quel tag supprimer. Voici comment ça marche :

```javascript
DROPDOWNS.forEach(({ category }) => {          // ex: category = "appliance"
  state.tags[category].forEach(value => {      // ex: value = "Blender"
    const btn = document.createElement('button');
    btn.addEventListener('click', () => removeTag(category, value));
    //                                              ^^^^^^^^  ^^^^^
    //                             Ces variables sont "capturées" par la closure
    //                             Quand le bouton est cliqué, JavaScript se souvient
    //                             des valeurs category et value au moment de la création
  });
});
```

C'est une **closure** : la fonction passée à `addEventListener` "ferme sur" les variables `category` et `value` de la portée englobante. Même après que la boucle est terminée, chaque callback se souvient de ses propres valeurs.

Sans closure (si on passait directement la référence), tous les boutons supprimer appelleraient `removeTag` avec les mêmes paramètres (ceux de la dernière itération).

---

## Différence entre addTag (mutation) et removeTag (immutable)

```javascript
// addTag : mutation directe
state.tags[category].push(value);  // modifie le tableau existant

// removeTag : création d'un nouveau tableau
state.tags[category] = state.tags[category].filter(t => t !== value);
```

Ces deux approches sont fonctionnellement équivalentes dans notre cas (on appelle `update()` dans les deux cas qui re-rend tout). La différence est stylistique :
- `.push()` est plus concis pour l'ajout
- `.filter()` est plus expressif pour la suppression (lit comme "garde tout sauf ça")

---

## Questions jury et réponses

### Q1 : "Comment le bouton × sait-il quel tag supprimer ?"

**Réponse :** Grâce aux **closures** JavaScript. Dans `renderActiveTags()`, on boucle sur les tags actifs. Pour chaque tag, on crée un bouton et on lui attache un listener `() => removeTag(category, value)`. Les variables `category` et `value` sont capturées par la fonction anonyme au moment de sa création. Quand l'utilisateur clique sur le bouton, la fonction se souvient des valeurs exactes de `category` et `value` pour ce tag spécifique. C'est le mécanisme de closure de JavaScript.

---

### Q2 : "Pourquoi `btn.type = 'button'` ?"

**Réponse :** En HTML, un bouton sans attribut `type` a la valeur par défaut `type="submit"`. Si ce bouton se trouve à l'intérieur d'un formulaire `<form>`, cliquer dessus soumettra le formulaire (rechargement de page ou envoi). En spécifiant `type="button"`, on indique explicitement que ce bouton n'est qu'un déclencheur d'action JavaScript, sans comportement de formulaire. C'est une bonne pratique défensive même si on n'est pas dans un `<form>`.

---

### Q3 : "Pourquoi `aria-label` sur le bouton × ?"

**Réponse :** `aria-label` est un attribut d'accessibilité ARIA (Accessible Rich Internet Applications). Sans lui, un lecteur d'écran (utilisé par les personnes malvoyantes) lirait simplement "×" pour le bouton — ce qui ne signifie rien. Avec `aria-label='Supprimer le filtre Blender'`, le lecteur d'écran annonce l'action complète. C'est une exigence des standards WCAG (Web Content Accessibility Guidelines) et fait partie de la validation globale du projet. C'est aussi mentionné implicitement dans la contrainte "HTML/CSS valide W3C".

---

### Q4 : "Pourquoi `removeTag` utilise `.filter()` plutôt que `.splice()` ?"

**Réponse :** `.splice()` mute le tableau en place (`array.splice(index, 1)`) et nécessite de connaître l'index de l'élément à supprimer. `.filter()` crée un nouveau tableau, ce qui est plus lisible : `filter(t => t !== value)` se lit comme "garde tout sauf la valeur à supprimer". De plus, `.filter()` ne modifie pas le tableau original — on réassigne `state.tags[category]` au résultat. C'est une approche plus fonctionnelle et moins sujette aux bugs (pas de problème d'index lors d'une suppression dans une boucle).

---

### Q5 : "Que se passe-t-il si l'utilisateur clique sur le même tag deux fois ?"

**Réponse :** `addTag()` vérifie d'abord `if (!state.tags[category].includes(value))` avant de pousser le tag. Si le tag est déjà présent, on ne l'ajoute pas une seconde fois. On appelle quand même `closeAllDropdowns()` pour fermer le menu. Dans `renderDropdownOptions()`, les tags déjà actifs sont filtrés hors de la liste — donc l'utilisateur ne peut même pas voir l'option une fois qu'elle est sélectionnée. Le double-ajout est donc impossible en pratique.

---

### Q6 : "Pourquoi reconstruire tous les tags à chaque `update()` plutôt que de modifier seulement ce qui a changé ?"

**Réponse :** C'est un choix délibéré de simplicité. Reconstruire l'intégralité des tags à chaque appel (via `renderActiveTags()`) est simple, cohérent, et évite les bugs de synchronisation. Avec 50 recettes et quelques tags au maximum, l'impact performance est négligeable — ça s'exécute en microsecondes. La solution "optimisée" (diff, mise à jour partielle) serait beaucoup plus complexe à implémenter et à maintenir. C'est le principe d'ingénierie "premature optimization is the root of all evil" — on optimise seulement quand c'est nécessaire.
