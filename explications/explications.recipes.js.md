# explications.recipes.js — La base de données des recettes

> `recipes.js` est la source de données de l'application — les 50 recettes avec toutes leurs propriétés.

---

## Rôle du fichier

`recipes.js` définit un tableau JavaScript nommé `recipes` contenant 50 objets recette. C'est le fichier de données — il ne contient aucune logique, uniquement des données statiques.

Dans une vraie application en production, ces données viendraient d'une API REST (base de données côté serveur). Ici, on simule la base de données avec un fichier JS statique, selon les instructions du lead dev JB : "l'équipe back-end n'est pas encore formée".

---

## Structure d'une recette (schéma)

```javascript
{
  id: Number,             // Identifiant unique (1, 2, ..., 50)
  image: String,          // Nom du fichier image : "RecetteXX.jpg"
  name: String,           // Nom de la recette
  servings: Number,       // Nombre de personnes
  time: Number,           // Temps de préparation en MINUTES
  description: String,    // Instructions de préparation (texte libre)
  appliance: String,      // UN seul appareil nécessaire (string)
  ustensils: [String],    // PLUSIEURS ustensiles (tableau de strings)
  ingredients: [          // PLUSIEURS ingrédients (tableau d'objets)
    {
      ingredient: String,    // OBLIGATOIRE : nom de l'ingrédient
      quantity: Number,      // OPTIONNEL : quantité numérique
      unit: String,          // OPTIONNEL : unité (ml, grammes, cuillères à soupe, ...)
    }
  ]
}
```

---

## Exemple commenté : la recette 1

```javascript
const recipes = [
  {
    id: 1,
    // id : identifiant unique, de 1 à 50
    // Pas utilisé actuellement dans le code, mais nécessaire pour une future API

    image: "Recette01.jpg",
    // Nom de fichier dans le dossier "recipes img/"
    // Format : RecetteXX.jpg où XX est l'id sur 2 chiffres (01, 02, ..., 50)
    // Utilisé dans cards.js : img.src = `recipes img/${recipe.image}`

    name: "Limonade de Coco",
    // Champ recherché par filterBySearch() dans search.js
    // C'est le premier champ testé (ordre d'importance : nom > description > ingrédients)

    servings: 1,
    // Nombre de personnes — affiché potentiellement mais pas utilisé dans la recherche

    ingredients: [
      {
        ingredient: "Lait de coco",
        quantity: 400,
        unit: "ml",
        // unit est OPTIONNEL — présent ici
      },
      {
        ingredient: "Jus de citron",
        quantity: 2,
        // unit est ABSENT — on affiche juste "2"
      },
      {
        ingredient: "Crème de coco",
        quantity: 2,
        unit: "cuillères à soupe",
      },
      {
        ingredient: "Sucre",
        quantity: 30,
        unit: "grammes",
      },
      {
        ingredient: "Glaçons",
        // quantity ET unit sont ABSENTS — on affiche juste le nom
      },
    ],
    // Ce tableau est utilisé par :
    // - filterBySearch() : test du nom de l'ingrédient
    // - filterByTags() : test de correspondance avec les tags actifs
    // - getAvailableOptions() : pour remplir le dropdown Ingrédients
    // - createIngredientItem() : pour l'affichage dans la carte

    time: 10,
    // En minutes — affiché dans le badge jaune sur la carte ("10min")

    description:
      "Mettre les glaçons à votre goût dans le blender, ajouter le lait, la crème de coco, le jus de 2 citrons et le sucre. Mixer jusqu'à avoir la consistence désirée",
    // Champ recherché par filterBySearch() — deuxième priorité après le nom

    appliance: "Blender",
    // UN seul appareil (string, pas tableau)
    // Utilisé par :
    // - filterByTags() : comparaison exacte (===)
    // - getAvailableOptions() : pour remplir le dropdown Appareils

    ustensils: ["cuillère à Soupe", "verres", "presse citron"],
    // PLUSIEURS ustensiles (tableau)
    // Utilisé par :
    // - filterByTags() : vérification que tous les tags ustensiles sont présents
    // - getAvailableOptions() : pour remplir le dropdown Ustensiles
  },
  // ... 49 autres recettes
];
```

---

## Mapping champs ↔ fonctionnalités

| Champ | Utilisé par | Comment |
|---|---|---|
| `id` | (non utilisé actuellement) | Prévu pour une future API |
| `image` | `createRecipeCard()` | `img.src = 'recipes img/' + recipe.image` |
| `name` | `filterBySearch()`, `createRecipeCard()` | Recherché en premier |
| `servings` | (affiché potentiellement) | Pas dans la recherche |
| `time` | `createRecipeCard()` | Badge "10min" |
| `description` | `filterBySearch()`, `createRecipeCard()` | Recherché en second |
| `appliance` | `filterByTags()`, `getAvailableOptions()`, `createRecipeCard()` | Comparaison exacte dans les tags |
| `ustensils` | `filterByTags()`, `getAvailableOptions()` | Tableau |
| `ingredients[].ingredient` | `filterBySearch()`, `filterByTags()`, `getAvailableOptions()`, `createIngredientItem()` | Champ le plus utilisé |
| `ingredients[].quantity` | `createIngredientItem()` | Optionnel |
| `ingredients[].unit` | `createIngredientItem()` | Optionnel |

---

## Pourquoi un fichier JS et non un fichier JSON ?

**Option JSON** (`recipes.json`):
```json
[{ "id": 1, "name": "Limonade de Coco", ... }]
```
Pour charger un JSON dans une page HTML, il faudrait un `fetch()` asynchrone (promesses, async/await), ce qui complexifie le code. De plus, `fetch()` ne fonctionne pas sur le protocole `file://` (ouverture directe du HTML dans le navigateur) à cause des restrictions CORS.

**Option JS** (`recipes.js`):
```javascript
const recipes = [{ id: 1, name: "Limonade de Coco", ... }];
```
En chargeant `recipes.js` comme un `<script>`, la variable `recipes` est disponible immédiatement, de façon synchrone, sans aucune complication. Tous les autres scripts chargés après peuvent l'utiliser directement.

---

## Cohérences et inconsistances à connaître dans les données

Les données réelles peuvent avoir quelques inconsistances qu'il faut connaître pour la soutenance :

1. **Casse des ustensiles** : certains ustensiles ont des majuscules incohérentes (ex: "cuillère à Soupe" avec S majuscule). La recherche dans `filterByTags` compare avec `===` (comparaison exacte) — ce qui fonctionne car les tags viennent des dropdowns qui eux-mêmes viennent des données. Il n'y a pas d'ambiguïté.

2. **Champs optionnels** : `quantity` et `unit` peuvent être absents, c'est géré dans `createIngredientItem()` avec `if (ing.quantity !== undefined)`.

3. **Format de l'image** : toujours `"RecetteXX.jpg"` avec le numéro sur 2 chiffres. Le code ne valide pas le format — si un fichier était absent, l'`<img>` afficherait une image cassée (comportement natif du navigateur).

---

## Questions jury et réponses

### Q1 : "Pourquoi les données sont-elles dans un fichier JS et non JSON ?"

**Réponse :** L'application tourne directement depuis un fichier HTML ouvert dans le navigateur (protocole `file://`). Le chargement d'un JSON nécessite `fetch()`, qui est bloqué par CORS sur `file://`. Un fichier `.js` avec `const recipes = [...]` est chargé de façon synchrone via `<script>`, sans aucune dépendance asynchrone. C'est le choix le plus simple étant donné la contrainte "pas de build step, pas de serveur".

---

### Q2 : "Comment les images sont-elles liées aux recettes ?"

**Réponse :** Chaque recette a une propriété `image` qui contient le nom du fichier (ex: `"Recette01.jpg"`). Dans `createRecipeCard()`, on construit le chemin complet : `` img.src = `recipes img/${recipe.image}` ``. Le dossier s'appelle "recipes img/" (avec un espace) — c'est le nom du dossier réel sur le filesystem. L'espace dans le chemin est géré nativement par le navigateur dans l'attribut `src`.

---

### Q3 : "Pourquoi `appliance` est une string et `ustensils` est un tableau ?"

**Réponse :** Parce que chaque recette n'utilise qu'**un seul appareil principal** (un blender, un four, etc.), mais peut avoir **plusieurs ustensiles** (un fouet, une casserole et un bol, par exemple). Cette distinction est dans les données source. Dans `filterByTags`, on gère les deux cas différemment :
- Pour `appliance` : `recipe.appliance === tag` (comparaison directe de string)
- Pour `ustensils` : `recipe.ustensils.some(u => u === tag)` (recherche dans le tableau)

---

### Q4 : "Que se passe-t-il si `quantity` est 0 dans un ingrédient ?"

**Réponse :** Dans `createIngredientItem()`, on vérifie `if (ing.quantity !== undefined)`. Si `quantity` vaut `0`, `0 !== undefined` est vrai → on affiche "0 ml" par exemple. Si on avait vérifié `if (ing.quantity)`, alors `0` serait falsy et l'affichage serait incorrect. La vérification avec `!== undefined` est donc plus robuste car elle gère le cas `0` correctement. Dans les données actuelles, une quantité de 0 est improbable en cuisine, mais c'est une bonne pratique.

---

### Q5 : "Pourquoi le champ `id` n'est-il pas utilisé ?"

**Réponse :** Dans cette version du projet, on filtre les recettes par recherche de sous-chaîne dans le texte — on n'a jamais besoin d'identifier une recette par son ID. L'ID serait utile si :
- On avait des URLs de type `/recipe/1` pour afficher une recette spécifiquement
- On faisait des requêtes API de type `GET /api/recipes/1`
- On avait une base de données relationnelle avec des références entre tables

Pour l'instant, l'ID est présent dans les données "pour le futur" : quand l'équipe back-end prendra le relais et créera une vraie API, l'ID sera indispensable.
