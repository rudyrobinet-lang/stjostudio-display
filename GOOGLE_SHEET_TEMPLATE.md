# 📊 Modèle Google Sheet - St-Jo'Studio

## Instructions de création

### Option 1 : Créer manuellement (5 minutes)

1. **Allez sur** : https://sheets.google.com

2. **Créez un nouveau document** : Cliquez sur le "+" ou "Document vierge"

3. **Renommez le document** : "St-Jo'Studio Display"

4. **Créez 4 onglets** (en bas de la page) :
   - Reservations
   - Activites
   - Configuration
   - Instructions

---

## Onglet 1 : Reservations

**Ligne 1 (en-têtes)** :
```
Date début | Date fin | Nom voyageur | Nb personnes | Langue | Statut
```

**Exemples de données (lignes 2+)** :
```
2025-11-05 | 2025-11-10 | Sophie Martin    | 2 | FR | Confirmé
2025-11-15 | 2025-11-20 | John Smith       | 4 | EN | Confirmé
2025-12-01 | 2025-12-05 | Maria Garcia     | 3 | ES | Confirmé
2025-12-20 | 2025-12-27 | Famille Dubois   | 4 | FR | Confirmé
```

**Format des colonnes :**
- **Colonnes A et B (dates)** : Sélectionnez les colonnes → Format → Nombre → Date
- **Colonne D (nombre)** : Format numérique
- **Colonne E (langue)** : Texte brut (FR, EN, ES, etc.)
- **Colonne F (statut)** : Texte (Confirmé ou Annulé)

---

## Onglet 2 : Activites

**Ligne 1 (en-têtes)** :
```
Icône | Nom activité | Description | Distance | Horaires | Actif
```

**Exemples de données (lignes 2+)** :
```
🏢 | Salon d'achat 2025 de BMR inc.        | Salon BMR                    | 4 km     | Centre des congrès        | Oui
💪 | Physiothérapie 360 édition 2025       | Salon des pro de la santé    | 4.5 km   | En face du Hilton         | Oui
🐾 | Pitou-Minou                           | Salon au poil                | 2.3 km   | De 9h à 16h              | Oui
🍷 | Dégustation vins                      | Cave locale                  | 5 km     | 15h00-18h00              | Oui
🚴 | Location de vélos                     | Vélos électriques            | 2 km     | 9h-19h                   | Oui
🎭 | Théâtre du Vieux-Québec              | Spectacles variés            | 3 km     | Voir horaire en ligne    | Non
```

**💡 Comment ajouter des emojis dans Google Sheets :**
- Windows : Touche `Windows` + `.` (point)
- Mac : `Cmd` + `Ctrl` + `Espace`
- Ou copiez-collez depuis ici : 🏢 💪 🐾 🍷 🚴 🎭 🎨 🏰 🌊 🎪 🎯 🎸 🎬 📚 🏃 ⛷️ 🎿 🛶 🏊

---

## Onglet 3 : Configuration

**2 colonnes : Paramètre | Valeur**

```
Nom propriété              | St-Jo'Studio
Ville météo               | Quebec
Heure check-out           | 11:00 AM
Règle 1                   | Vider les poubelles en quittant
Règle 2                   | Pas de cigarette ou vapoteuse
Règle 3                   | Mode calme à partir de 21h pour les voisins
Style visuel              | Moderne
```

**Vous pouvez ajouter d'autres paramètres si nécessaire**

---

## Onglet 4 : Instructions

**Copiez-collez ce texte dans la cellule A1 :**

```
GUIDE D'UTILISATION - St-Jo'Studio Display

📋 ONGLET RESERVATIONS
- Ajoutez une ligne par réservation
- Format dates : AAAA-MM-JJ (ex: 2025-12-25)
- Langue : FR (français), EN (anglais), ES (espagnol)
- Statut : "Confirmé" pour afficher, "Annulé" pour masquer

🎯 ONGLET ACTIVITES
- Maximum 4 activités affichées simultanément
- Si plus de 4 : rotation automatique toutes les 8 secondes
- Actif "Oui" = affiché, "Non" = masqué
- Utilisez des emojis pour l'icône (Windows: Win+. / Mac: Cmd+Ctrl+Espace)

⚙️ ONGLET CONFIGURATION
- Ces paramètres remplacent ceux du fichier config.js
- Modifiez ici pour personnaliser sans toucher au code

🔄 MISE À JOUR
- Les modifications apparaissent automatiquement dans les 5 minutes
- Pas besoin de recharger manuellement

📞 SUPPORT
- Consultez le fichier README.md pour plus d'aide
```

---

## Étapes finales

### 1. Rendre le Google Sheet public

1. Cliquez sur **"Partager"** (bouton bleu en haut à droite)
2. Cliquez sur **"Modifier l'accès"** ou le cadenas
3. Sous "Accès général", sélectionnez **"Tous les utilisateurs disposant du lien"**
4. Assurez-vous que le rôle est **"Lecteur"** (pas Éditeur)
5. Cliquez **"Terminé"**

### 2. Copier l'ID du Google Sheet

1. Regardez l'URL dans votre navigateur :
   ```
   https://docs.google.com/spreadsheets/d/1AbC2DeF3GhI4JkL5MnO6PqR7StU8VwX9YzA/edit
   ```

2. Copiez la partie entre `/d/` et `/edit` :
   ```
   1AbC2DeF3GhI4JkL5MnO6PqR7StU8VwX9YzA
   ```

3. Collez cet ID dans le fichier `config.js` :
   ```javascript
   googleSheetId: "1AbC2DeF3GhI4JkL5MnO6PqR7StU8VwX9YzA",
   ```

---

## ✅ Checklist

- [ ] Document créé et renommé "St-Jo'Studio Display"
- [ ] 4 onglets créés : Reservations, Activites, Configuration, Instructions
- [ ] En-têtes ajoutés dans chaque onglet
- [ ] Exemples de données ajoutés
- [ ] Format des dates appliqué (Format → Nombre → Date)
- [ ] Document partagé publiquement (Lecteur)
- [ ] ID copié et ajouté dans config.js

---

## 🎨 Conseils de mise en forme

### Pour un Google Sheet plus lisible :

1. **Ligne d'en-tête en gras** :
   - Sélectionnez la ligne 1
   - Cliquez sur "B" (gras) dans la barre d'outils

2. **Couleur de fond pour les en-têtes** :
   - Sélectionnez la ligne 1
   - Cliquez sur l'icône de seau de peinture
   - Choisissez une couleur (ex: bleu clair)

3. **Figer la ligne d'en-tête** :
   - Affichage → Figer → 1 ligne
   - Permet de garder les en-têtes visibles lors du défilement

4. **Ajuster la largeur des colonnes** :
   - Double-cliquez sur la bordure entre deux colonnes (ajustement automatique)

---

## 📝 Template de réservation rapide

**Copiez-collez ces lignes pour ajouter des réservations rapidement** :

```
2025-11-05 | 2025-11-10 | [Nom]    | 2 | FR | Confirmé
2025-11-15 | 2025-11-20 | [Nom]    | 4 | EN | Confirmé
2025-12-01 | 2025-12-05 | [Nom]    | 3 | ES | Confirmé
```

Remplacez `[Nom]` par le nom de votre invité.

---

## 🚀 Vous êtes prêt !

Votre Google Sheet est maintenant configuré et prêt à être utilisé avec l'application St-Jo'Studio Display.

**Prochaine étape** : Suivez le README.md pour déployer l'application sur Vercel.