# Plan de soutenance — Les Petits Plats

## Contexte

Projet complet, tous les livrables sont présents et conformes :
- UI fonctionnelle (barre recherche, 3 dropdowns, tags, grille cartes)
- Branche A : `feature/algo-loops` (boucles natives)
- Branche B : `feature/algo-functional` (programmation fonctionnelle)
- Fiche d'investigation avec benchmark jsben.ch + recommandation
- 2 algorigrammes draw.io

La soutenance dure 25 min : 15 min de présentation + 10 min de questions.

---

## Partie 1 — Fiche d'investigation (5 min)

### Accroche
> "Le client voulait un moteur de recherche sans aucune librairie JS externe. Il fallait donc écrire l'algorithme soi-même — et choisir la meilleure implémentation."

### Structure à suivre

**1. La problématique (30 sec)**
- Parcourir 50 recettes, chercher dans 3 champs : `name`, `description`, `ingredients`
- Contrainte : Vanilla JS pur, pas de Fuse.js, pas de Lodash

**2. Les deux approches testées (2 min)**

Option A — Boucles natives :
- `for` classique avec `break`/`continue` explicites
- Ordre des vérifications pensé par coût croissant : `name` (O(1)) → `description` (O(1)) → `ingredients` (O(m))
- Court-circuit dès la 1ère correspondance → `continue` passe à la recette suivante

Option B — Programmation fonctionnelle :
- `filter()` + `||` + `some()` + `includes()`
- Court-circuit natif : `||` s'arrête dès le premier `true`, `some()` s'arrête au 1er ingrédient trouvé
- Déclaratif, idiomatique ES6+

**Complexité identique : O(n × m)** — n = 50 recettes, m ≈ 6 ingrédients/recette

**3. Les algorigrammes (30 sec)**
- Montrer les 2 fichiers draw.io
- Boîtes arrondies = actions, losanges jaunes = décisions (Yes/No)

**4. Le benchmark jsben.ch (1 min)**
- Navigateur : Chrome, jeu de données : 50 recettes, terme : "coco"
- Option A (boucles) : **57 650 ops/sec (±10.77%)**
- Option B (fonctionnel) : **58 860 ops/sec (±8.88%)** ← Gagnant
- Écart : +2.06% en faveur du fonctionnel

**5. Solution retenue (30 sec)**
> "L'algo fonctionnel est retenu pour deux raisons : léger avantage de performance (+2.06%) ET meilleure lisibilité — code plus maintenable pour l'équipe back-end qui reprend le projet."

---

## Partie 2 — Démonstration de l'application (10 min)

### Prérequis avant de commencer
- Être sur la branche `feature/algo-functional` (version retenue)
- Ouvrir `index.html` dans Chrome
- Vérifier que les 50 cartes s'affichent

### Scénario de démo à suivre dans l'ordre

**Étape 1 — Recherche principale (2 min)**
1. Taper "co" → rien ne se passe (< 3 caractères, règle de gestion non négociable)
2. Taper "coc" → les recettes avec "coco" apparaissent instantanément
3. Continuer avec "coco" → affichage affiné
4. Pointer : le compteur "N recettes" se met à jour

**Étape 2 — Message aucun résultat (30 sec)**
1. Taper "zzzzz" → affiche le message d'erreur
2. Effacer → retour aux 50 recettes

**Étape 3 — Filtres avancés / dropdowns (2 min)**
1. Ouvrir le dropdown "Ingrédients"
2. Montrer que la liste s'adapte (seulement les ingrédients des recettes visibles)
3. Taper dans le champ de recherche interne du dropdown → liste filtrée
4. Sélectionner un ingrédient → tag apparaît sous la barre principale

**Étape 4 — Cumul de tags (2 min)**
1. Ajouter un 2ème tag (ingrédient ou appareil)
2. Montrer que les résultats sont une INTERSECTION (logique AND)
3. Montrer que les dropdowns se mettent à jour avec seulement les options des recettes restantes
4. Supprimer un tag via le ×

**Étape 5 — Recherche par tag en premier (1 min)**
1. Sans rien dans la barre principale, sélectionner directement un tag
2. Montrer que ça fonctionne (scénario A2 de la spec)

**Étape 6 — Rappel des chiffres (30 sec)**
> "Ce rendu tourne sur l'algo fonctionnel : 58 860 ops/sec, légèrement devant les boucles natives."

---

## Partie 3 — Questions prévisibles et réponses préparées (10 min)

### Sur l'algorithme

**Q : Pourquoi l'algo fonctionnel est-il plus performant que les boucles si la complexité est identique ?**
> "La complexité Big O est effectivement identique : O(n × m). La différence vient de l'overhead d'implémentation. Les boucles natives font des appels de fonctions supplémentaires pour gérer le break/continue, tandis que `filter` + `some` bénéficient d'optimisations JIT dans les moteurs V8 modernes. Sur 50 recettes l'écart est faible (+2%), mais il confirme que sur ce dataset, le fonctionnel est légèrement plus efficace."

**Q : L'écart de 2% n'est-il pas dans la marge d'erreur ?**
> "C'est une bonne remarque. Les marges d'erreur se chevauchent légèrement (±10.77% vs ±8.88%). Sur un dataset aussi petit, les deux algos sont équivalents en pratique. C'est précisément pour ça que la lisibilité et la maintenabilité ont été des critères décisifs en plus des chiffres."

**Q : Comment fonctionne exactement le court-circuit dans l'algo fonctionnel ?**
> "Dans filter(), la condition est : `name.includes(q) || description.includes(q) || ingredients.some(...)`. L'opérateur `||` est court-circuité : si le titre correspond, JavaScript n'évalue pas la description ni les ingrédients. Et `some()` s'arrête dès le premier ingrédient trouvé, sans parcourir le reste du tableau."

### Sur l'interface

**Q : Pourquoi la recherche se déclenche à partir de 3 caractères ?**
> "C'est une règle de gestion non négociable de la spec client. En dessous de 3 caractères, les résultats seraient trop nombreux pour être utiles (presque toutes les recettes contiennent 'a' ou 'le'). 3 caractères permettent des résultats pertinents sans surcharge."

**Q : Comment les dropdowns se mettent-ils à jour ?**
> "À chaque modification (saisie ou tag), la fonction `update()` recalcule les recettes filtrées, puis `updateDropdowns()` extrait les options disponibles uniquement depuis ces recettes — via un `Set` pour éviter les doublons en O(1). Les tags déjà actifs sont exclus de la liste."

### Sur Green Code

**Q : Quels principes de Green Code avez-vous appliqués ?**
> "Plusieurs points concrets :
> 1. **Minimum de re-rendus DOM** : le DOM n'est recalculé que lors d'un changement effectif (frappe, ajout/suppression de tag)
> 2. **Set pour les options uniques** : plutôt qu'un tableau avec indexOf (O(n)), un Set donne O(1) pour la déduplication
> 3. **Short-circuit dans les deux algos** : on évite des calculs inutiles dès qu'une correspondance est trouvée
> 4. **Modularisation** : 6 modules avec responsabilités séparées — pas de code mort, pas de surcharge
> 5. **textContent au lieu de innerHTML** : pas de parsing HTML inutile et pas de risque XSS"

**Q : Pourquoi ne pas avoir utilisé un framework comme React ou Vue ?**
> "La spec est explicite : Vanilla JS uniquement, pas de librairie externe. L'équipe back-end récupère le code brut pour l'intégrer à leur API. Un framework aurait ajouté une dépendance non désirée et un build step incompatible avec la contrainte Tailwind CDN."

### Sur la sécurité

**Q : Comment avez-vous géré la sécurité des inputs ?**
> "Tous les inputs utilisateur sont insérés via `textContent` et jamais via `innerHTML`. Ça empêche toute injection HTML ou XSS. La saisie est aussi normalisée en lowercase avant comparaison pour la recherche."

---

## Checklist avant la soutenance

- [ ] Checkout `feature/algo-functional`
- [ ] Tester l'application une fois dans Chrome
- [ ] Algorigrammes draw.io ouverts dans un onglet séparé
- [ ] Fiche investigation visible (fiche-investigation.md ou imprimée)
- [ ] Préparer jsben.ch si on veut montrer le benchmark en live (optionnel)
