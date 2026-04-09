# explications.cards.js — Rendu DOM des cartes recettes

> `cards.js` est responsable de la création des cartes visuelles et de leur affichage dans la grille.

---

## Rôle du fichier

`cards.js` transforme des **données brutes** (objets JavaScript de `recipes.js`) en **éléments HTML** insérés dans le DOM. Il est purement visuel : il ne sait pas comment fonctionne l'algorithme de recherche, il reçoit juste une liste de recettes et les affiche.

Ce fichier définit 3 fonctions :
- `createIngredientItem(ing)` — crée un `<li>` pour un ingrédient
- `createRecipeCard(recipe)` — crée une carte `<article>` complète
- `renderRecipes(recipeList)` — vide la grille et remplit avec les nouvelles cartes

---

## Le code complet avec explications ligne par ligne

```javascript
// ─────────────────────────────────────────────────────────────────
// FONCTION 1 : createIngredientItem
// Crée un élément <li> pour afficher un ingrédient avec sa quantité
// ─────────────────────────────────────────────────────────────────

function createIngredientItem(ing) {
  // ing = { ingredient: "Lait de coco", quantity: 400, unit: "ml" }
  //   ou = { ingredient: "Glaçons" }  (quantity et unit sont optionnels)

  const li = document.createElement('li');
  // On crée les éléments DOM avec createElement() — jamais avec innerHTML
  // Raison de sécurité : createElement + textContent est immunisé contre l'injection XSS

  const name = document.createElement('span');
  name.className = 'font-bold block';
  // Tailwind : font-bold = gras, block = display:block (prend toute la largeur)
  name.textContent = ing.ingredient;  // ← .textContent, JAMAIS .innerHTML
  li.appendChild(name);

  // La quantité est OPTIONNELLE (certains ingrédients n'ont pas de quantité)
  // On vérifie avec !== undefined plutôt que !ing.quantity
  // car une quantité de 0 est techniquement valide (même si peu probable en cuisine)
  if (ing.quantity !== undefined) {
    const detail = document.createElement('span');
    detail.className = 'text-[#7A7A7A]';  // gris
    // Construction de la chaîne de quantité :
    // Si unit est présente : "400 ml", "2 cuillères à soupe"
    // Si unit est absente : "2" (ex: 2 citrons)
    detail.textContent = ing.quantity + (ing.unit ? ' ' + ing.unit : '');
    //                                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^
    //                                   Ternaire : si ing.unit existe → ' ' + unité, sinon ''
    li.appendChild(detail);
  }

  return li;
}
```

```javascript
// ─────────────────────────────────────────────────────────────────
// FONCTION 2 : createRecipeCard
// Crée la carte complète d'une recette — c'est la fonction principale de ce fichier
// ─────────────────────────────────────────────────────────────────

function createRecipeCard(recipe) {
  // ── Structure HTML générée ──────────────────────────────────────
  // <article class="bg-white rounded-[21px] ...">
  //   <div class="relative">                      ← imgWrapper
  //     <img src="recipes img/..." loading="lazy" />
  //     <span class="absolute ...">10min</span>   ← badge temps
  //   </div>
  //   <div class="p-6">                           ← body
  //     <h2>Limonade de Coco</h2>
  //     <p class="...">Recette</p>               ← label
  //     <p class="... line-clamp-4">...</p>       ← description
  //     <p class="...">Ingrédients</p>            ← label
  //     <ul class="grid grid-cols-2 ...">         ← liste ingrédients
  //       <li>...</li>
  //       ...
  //     </ul>
  //   </div>
  // </article>

  // ── Carte principale ────────────────────────────────────────────
  const card = document.createElement('article');
  // On utilise <article> et non <div> → sémantique HTML5
  // <article> représente un contenu autonome et réutilisable (une recette est autonome)
  card.className = 'bg-white rounded-[21px] shadow-[0_4px_34px_rgba(0,0,0,0.08)] overflow-hidden';
  //               ^^^^^^^^ fond blanc
  //                        ^^^^^^^^^^^^^^^^ arrondi 21px (valeur arbitraire du design)
  //                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ombre portée
  //                                                                                   ^^^^^^^^^^^^^^^^ clip l'image

  // ── Zone image ──────────────────────────────────────────────────
  const imgWrapper = document.createElement('div');
  imgWrapper.className = 'relative';
  // 'relative' est nécessaire pour positionner le badge "10min" en absolu à l'intérieur

  const img = document.createElement('img');
  img.src = `recipes img/${recipe.image}`;
  // Les images sont dans le dossier "recipes img/" (avec espace — nom de dossier original)
  // recipe.image contient "Recette01.jpg", "Recette02.jpg", etc.
  img.alt = recipe.name;
  // alt obligatoire pour l'accessibilité (WCAG) et la validation W3C
  img.className = 'w-full h-64 object-cover';
  // w-full : largeur 100%
  // h-64 : hauteur fixe 256px (4rem × 4 = 16rem... non, h-64 = 16rem = 256px en Tailwind)
  // object-cover : l'image couvre tout l'espace sans déformation (crop centré)
  img.loading = 'lazy';
  // lazy loading : le navigateur charge l'image uniquement quand elle est proche du viewport
  // Optimisation perf : les images hors-écran ne sont pas téléchargées immédiatement

  // ── Badge temps ─────────────────────────────────────────────────
  const badge = document.createElement('span');
  badge.className = 'absolute top-4 right-4 bg-[#FFD15B] text-xs font-medium px-3 py-1 rounded-full';
  // absolute : position absolue par rapport au imgWrapper (qui est relative)
  // top-4 right-4 : 16px du haut et de la droite
  // bg-[#FFD15B] : fond jaune (couleur accent du projet)
  // rounded-full : pill / capsule (border-radius: 9999px)
  badge.textContent = `${recipe.time}min`;
  // Template literal : "10min", "30min", etc.

  imgWrapper.appendChild(img);
  imgWrapper.appendChild(badge);

  // ── Corps de la carte ────────────────────────────────────────────
  const body = document.createElement('div');
  body.className = 'p-6';  // padding 24px sur tous les côtés

  // Titre
  const title = document.createElement('h2');
  title.className = 'font-anton text-lg mb-4';
  // font-anton : police Anton (définie dans Tailwind config ou @font-face)
  // text-lg : 18px (correspond au design)
  title.textContent = recipe.name;

  // Label "Recette" (texte fixe, pas de données variables)
  const recetteLabel = document.createElement('p');
  recetteLabel.className = 'text-[#7A7A7A] text-xs font-bold uppercase tracking-widest mb-1';
  recetteLabel.textContent = 'Recette';

  // Description
  const desc = document.createElement('p');
  desc.className = 'text-sm text-[#1B1B1B] mb-4 line-clamp-4';
  // line-clamp-4 : tronque le texte à 4 lignes avec "..." (fonctionnalité CSS moderne)
  // Cela évite que certaines cartes soient beaucoup plus hautes que d'autres
  desc.textContent = recipe.description;
  // .textContent : si la description contient des caractères HTML (<, >), ils seront affichés
  // en tant que texte brut, pas interprétés → sécurité

  // Label "Ingrédients"
  const ingLabel = document.createElement('p');
  ingLabel.className = 'text-[#7A7A7A] text-xs font-bold uppercase tracking-widest mb-2';
  ingLabel.textContent = 'Ingrédients';

  // Liste des ingrédients en grille 2 colonnes
  const ingList = document.createElement('ul');
  ingList.className = 'grid grid-cols-2 gap-x-4 gap-y-2 text-sm';
  // grid grid-cols-2 : grille CSS avec 2 colonnes égales
  // gap-x-4 : espace horizontal entre colonnes (16px)
  // gap-y-2 : espace vertical entre lignes (8px)

  // On crée un <li> pour chaque ingrédient en appelant createIngredientItem
  recipe.ingredients.forEach(ing => ingList.appendChild(createIngredientItem(ing)));
  //                  ^^^^^^^ .forEach sur le tableau d'ingrédients de la recette

  // Assemblage du corps
  body.appendChild(title);
  body.appendChild(recetteLabel);
  body.appendChild(desc);
  body.appendChild(ingLabel);
  body.appendChild(ingList);

  // Assemblage de la carte
  card.appendChild(imgWrapper);
  card.appendChild(body);

  return card;  // ← retourne l'élément DOM, pas encore inséré dans le document
}
```

```javascript
// ─────────────────────────────────────────────────────────────────
// FONCTION 3 : renderRecipes
// Vide la grille et insère les nouvelles cartes
// ─────────────────────────────────────────────────────────────────

function renderRecipes(recipeList) {
  const grid = document.getElementById('recipes-grid');
  const count = document.getElementById('recipes-count');

  // Vide la grille : supprime toutes les cartes existantes
  grid.innerHTML = '';
  // Note : grid.innerHTML = '' est équivalent à supprimer tous les enfants
  // C'est plus simple que de boucler et appeler removeChild()

  // Met à jour le compteur "N recette(s)"
  // Ternaire pour gérer le pluriel : "1 recette" vs "2 recettes"
  count.textContent = `${recipeList.length} recette${recipeList.length > 1 ? 's' : ''}`;

  // ── CAS VIDE : aucune recette ne correspond ──────────────────────
  if (recipeList.length === 0) {
    const msg = document.createElement('p');
    msg.className = 'col-span-3 text-center py-16 text-[#7A7A7A]';
    // col-span-3 : le message occupe les 3 colonnes de la grille (pour être centré)
    // py-16 : grand padding vertical pour aérer visuellement le message

    // Message conforme au cahier des charges (cas A1 — Aucun résultat)
    msg.textContent = `Aucune recette ne contient "${state.searchQuery}", vous pouvez chercher « tarte aux pommes », « poisson », etc.`;
    //                                              ^^^^^^^^^^^^^^^^^^^^ valeur actuelle de la recherche
    // textContent : le state.searchQuery est affiché en texte brut → sécurité XSS

    grid.appendChild(msg);
    return;  // ← sortie anticipée, pas besoin de continuer
  }

  // ── CAS NORMAL : insertion des cartes ───────────────────────────
  recipeList.forEach(recipe => grid.appendChild(createRecipeCard(recipe)));
  // Pour chaque recette : crée la carte DOM et l'ajoute à la grille
  // Les cartes sont ajoutées une par une dans l'ordre du tableau (l'ordre est conservé)
}
```

---

## Pourquoi `createElement` et pas `innerHTML` ?

Il y a deux façons de créer du HTML en JavaScript :

### Méthode dangereuse (à éviter)
```javascript
card.innerHTML = `<h2>${recipe.name}</h2>`; // RISQUE XSS si recipe.name contient du HTML
```

### Méthode sécurisée (notre approche)
```javascript
const title = document.createElement('h2');
title.textContent = recipe.name;  // textContent échappe automatiquement < > " '
```

Si `recipe.name` contenait `<script>alert('hack')</script>`, avec `innerHTML` ce code s'exécuterait. Avec `textContent`, il serait affiché tel quel comme texte.

Dans notre cas les données viennent de `recipes.js` (un fichier statique contrôlé), donc le risque est théoriquement nul — mais on adopte quand même la bonne pratique.

---

## Structure HTML générée (exemple)

```html
<article class="bg-white rounded-[21px] ...">
  <div class="relative">
    <img src="recipes img/Recette01.jpg" alt="Limonade de Coco" loading="lazy" class="w-full h-64 object-cover">
    <span class="absolute top-4 right-4 bg-[#FFD15B] ... rounded-full">10min</span>
  </div>
  <div class="p-6">
    <h2 class="font-anton text-lg mb-4">Limonade de Coco</h2>
    <p class="text-[#7A7A7A] ... uppercase">Recette</p>
    <p class="text-sm text-[#1B1B1B] ... line-clamp-4">Mettre les glaçons à votre goût...</p>
    <p class="text-[#7A7A7A] ... uppercase">Ingrédients</p>
    <ul class="grid grid-cols-2 ...">
      <li>
        <span class="font-bold block">Lait de coco</span>
        <span class="text-[#7A7A7A]">400 ml</span>
      </li>
      <li>
        <span class="font-bold block">Glaçons</span>
        <!-- pas de span quantité car ing.quantity est undefined -->
      </li>
    </ul>
  </div>
</article>
```

---

## Questions jury et réponses

### Q1 : "Pourquoi utilisez-vous `<article>` et non `<div>` pour les cartes ?"

**Réponse :** `<article>` est une balise HTML5 sémantique qui représente un contenu autonome qui pourrait être distribué ou réutilisé indépendamment — comme un article de blog, un tweet, ou une recette de cuisine. C'est sémantiquement plus correct qu'un `<div>` générique. Les balises sémantiques améliorent l'accessibilité (lecteurs d'écran), le référencement (SEO), et la lisibilité du code. C'est aussi une exigence implicite de la validation W3C : utiliser les bonnes balises au bon endroit.

---

### Q2 : "Pourquoi `loading="lazy"` sur les images ?"

**Réponse :** Le **lazy loading** (chargement paresseux) est une optimisation de performance natif du navigateur. Sans lui, le navigateur télécharge toutes les 50 images au chargement de la page, même celles qui ne sont pas visibles à l'écran. Avec `loading="lazy"`, le navigateur ne charge une image que lorsqu'elle est sur le point d'entrer dans le viewport (la zone visible). Sur mobile avec une connexion lente, ça peut représenter une économie significative de données et un temps de chargement initial bien plus court. C'est une fonctionnalité HTML native, aucun JavaScript nécessaire.

---

### Q3 : "Pourquoi `line-clamp-4` sur la description ?"

**Réponse :** Les descriptions des recettes ont des longueurs très variables. Sans `line-clamp`, certaines cartes seraient deux fois plus hautes que d'autres, rendant la grille inégale et difficile à parcourir visuellement. `line-clamp-4` (propriété CSS `-webkit-line-clamp`) tronque le texte à 4 lignes et ajoute `...` si le texte est plus long. Toutes les cartes ont ainsi la même hauteur de description, ce qui donne une grille plus cohérente et professionnelle.

---

### Q4 : "Pourquoi vider `grid.innerHTML = ''` à chaque appel de `renderRecipes` ?"

**Réponse :** Parce que `update()` est appelée à chaque frappe. Si on n'effaçait pas la grille avant de re-rendre, on ajouterait les nouvelles cartes à la suite des anciennes, résultant en des doublons. `grid.innerHTML = ''` est la façon la plus rapide de vider un élément DOM. Une alternative plus propre serait de boucler sur les enfants et d'appeler `removeChild()`, mais c'est plus verbeux pour le même résultat.

---

### Q5 : "Pourquoi le message 'aucune recette' utilise `col-span-3` ?"

**Réponse :** La grille CSS (#recipes-grid) est configurée en 3 colonnes dans le HTML. Sans `col-span-3`, le `<p>` du message occuperait seulement la première colonne de la grille, ce qui l'afficherait en haut à gauche au lieu d'être centré sur toute la largeur. `col-span-3` étend l'élément sur les 3 colonnes disponibles, permettant à `text-center` de le centrer correctement.

---

### Q6 : "Pourquoi séparer `createIngredientItem` de `createRecipeCard` ?"

**Réponse :** C'est le principe de **décomposition en fonctions** — chaque fonction fait une seule chose. `createIngredientItem` ne s'occupe que d'un ingrédient, `createRecipeCard` s'occupe de la carte entière. Les avantages :
1. Plus lisible : chaque fonction est courte et compréhensible
2. Plus testable : on peut tester `createIngredientItem` indépendamment
3. Plus réutilisable : si on voulait afficher les ingrédients ailleurs, on pourrait réutiliser `createIngredientItem`
Sans cette séparation, `createRecipeCard` serait une fonction de 100 lignes difficile à lire.
