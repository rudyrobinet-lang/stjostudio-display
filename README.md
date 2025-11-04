# 🏠 St-Jo'Studio - Affichage Digital Signage

Application d'affichage pour votre Airbnb avec informations personnalisées pour vos voyageurs.

## 📋 Table des matières
1. [Installation rapide](#installation-rapide)
2. [Configuration Google Sheets](#configuration-google-sheets)
3. [Configuration API Météo](#configuration-api-météo)
4. [Déploiement sur Vercel](#déploiement-sur-vercel)
5. [Configuration du player Yodek](#configuration-du-player-yodek)
6. [Personnalisation](#personnalisation)
7. [Dépannage](#dépannage)

---

## ⚡ Installation rapide

### Étape 1 : Créer votre Google Sheet

1. **Copiez ce modèle Google Sheet** : [Lien vers le modèle](#)
   - OU créez un nouveau Google Sheet manuellement (voir section suivante)

2. **Rendez votre Google Sheet public** :
   - Cliquez sur "Partager" (en haut à droite)
   - Cliquez sur "Modifier"
   - Sélectionnez "Tous les utilisateurs disposant du lien"
   - Assurez-vous que le rôle est "Lecteur"
   - Cliquez sur "Terminé"

3. **Copiez l'ID de votre Google Sheet** :
   - Dans l'URL : `https://docs.google.com/spreadsheets/d/VOTRE_ID_ICI/edit`
   - Copiez la partie `VOTRE_ID_ICI`

### Étape 2 : Configurer le projet

1. **Téléchargez tous les fichiers** de ce projet

2. **Éditez le fichier `config.js`** :
   ```javascript
   googleSheetId: "COLLEZ_VOTRE_ID_ICI",
   ```

3. **(Optionnel) Configurez la météo** - voir section [Configuration API Météo](#configuration-api-météo)

### Étape 3 : Déployer sur Vercel

Voir section [Déploiement sur Vercel](#déploiement-sur-vercel)

---

## 📊 Configuration Google Sheets

### Structure du Google Sheet

Votre Google Sheet doit contenir **4 onglets** :

#### **Onglet 1 : Reservations**

| Date début | Date fin | Nom voyageur | Nb personnes | Langue | Statut |
|------------|----------|--------------|--------------|--------|--------|
| 2025-11-05 | 2025-11-10 | Sophie Martin | 2 | FR | Confirmé |
| 2025-11-15 | 2025-11-20 | John Smith | 4 | EN | Confirmé |
| 2025-12-01 | 2025-12-05 | Maria Garcia | 3 | ES | Confirmé |

**Instructions :**
- **Date début / Date fin** : Format `AAAA-MM-JJ` (ex: 2025-11-05)
- **Nom voyageur** : Nom complet de votre invité
- **Nb personnes** : Nombre (1, 2, 3, 4, etc.)
- **Langue** : FR, EN, ES (code à 2 lettres)
- **Statut** : "Confirmé" ou "Annulé"

#### **Onglet 2 : Activites**

| Icône | Nom activité | Description | Distance | Horaires | Actif |
|-------|--------------|-------------|----------|----------|-------|
| 🏢 | Salon d'achat 2025 de BMR inc. | Salon BMR | 4 km | Centre des congrès | Oui |
| 💪 | Physiothérapie 360 édition 2025 | Salon des pro de la santé | 4.5 km | En face du Hilton | Oui |
| 🐾 | Pitou-Minou | Salon au poil | 2.3 km | De 9h à 16h | Oui |
| 🎭 | Festival de Québec | Spectacles en plein air | Centre-ville | 18h-23h | Non |

**Instructions :**
- **Icône** : Emoji unique (🍷 🚴 🎨 🏰 🎭 🎪 🎯 etc.)
- **Nom activité** : Nom complet de l'événement/activité
- **Description** : Description courte
- **Distance** : Distance ou localisation
- **Horaires** : Heures d'ouverture ou informations complémentaires
- **Actif** : "Oui" pour afficher, "Non" pour masquer

**💡 Astuce** : Seules les 4 premières activités actives sont affichées, puis rotation automatique

#### **Onglet 3 : Configuration**

| Paramètre | Valeur |
|-----------|--------|
| Nom propriété | St-Jo'Studio |
| Ville météo | Quebec |
| Heure check-out | 11:00 AM |
| Règle 1 | Vider les poubelles en quittant |
| Règle 2 | Pas de cigarette ou vapoteuse |
| Règle 3 | Mode calme à partir de 21h pour les voisins |

**Instructions :**
- Ces valeurs remplacent celles du fichier `config.js`
- Vous pouvez modifier directement dans le Google Sheet

#### **Onglet 4 : Instructions**

Cet onglet contient la documentation pour remplir les autres onglets.
Vous pouvez y mettre vos propres notes.

---

## 🌤️ Configuration API Météo

### Obtenir une clé API gratuite OpenWeatherMap

1. **Créez un compte sur** : https://openweathermap.org/api

2. **Choisissez le plan gratuit** ("Free")
   - 1,000 appels API / jour (largement suffisant)
   - Prévisions actuelles

3. **Obtenez votre clé API** :
   - Allez dans "My API Keys"
   - Copiez votre clé (format : `abc123def456...`)

4. **Ajoutez la clé dans `config.js`** :
   ```javascript
   weatherApiKey: "VOTRE_CLE_API_ICI",
   ```

**⚠️ Note** : L'activation de la clé peut prendre jusqu'à 2 heures

**Sans clé API** : L'application fonctionnera quand même, mais sans météo

---

## 🚀 Déploiement sur Vercel

### Méthode 1 : Déploiement via GitHub (recommandé)

1. **Créez un compte GitHub** (si vous n'en avez pas) : https://github.com

2. **Créez un nouveau repository** :
   - Cliquez sur "New repository"
   - Nom : `stjostudio-display` (ou autre)
   - Cochez "Public"
   - Cliquez "Create repository"

3. **Uploadez les fichiers** :
   - Glissez-déposez tous les fichiers du projet dans GitHub
   - Ou utilisez GitHub Desktop (plus simple)

4. **Connectez-vous à Vercel** : https://vercel.com
   - Cliquez "Sign Up"
   - Choisissez "Continue with GitHub"

5. **Importez votre projet** :
   - Cliquez "Add New" → "Project"
   - Sélectionnez votre repository `stjostudio-display`
   - Cliquez "Import"
   - **Laissez tous les paramètres par défaut**
   - Cliquez "Deploy"

6. **Récupérez votre URL** :
   - Après quelques secondes : `https://stjostudio-display.vercel.app`
   - C'est cette URL que vous utiliserez sur votre Yodek

### Méthode 2 : Déploiement direct (plus rapide)

1. **Installez Vercel CLI** :
   ```bash
   npm install -g vercel
   ```

2. **Dans le dossier du projet** :
   ```bash
   vercel
   ```

3. **Suivez les instructions** et récupérez votre URL

---

## 📺 Configuration du player Yodek

1. **Accédez à votre interface Yodek**

2. **Créez une nouvelle playlist** (ou modifiez une existante)

3. **Ajoutez une page web** :
   - Type de contenu : "Page Web" ou "URL"
   - URL : `https://votre-app.vercel.app`
   - Durée : Illimitée (ou selon préférence)

4. **Paramètres recommandés** :
   - Rafraîchissement : Toutes les heures (optionnel)
   - Mode plein écran : Activé
   - Rotation écran : Paysage (horizontal)

5. **Assignez à votre écran** et c'est terminé ! ✅

---

## 🎨 Personnalisation

### Changer les couleurs

Éditez `styles.css` :

```css
/* Couleur principale (actuellement cyan/bleu) */
background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);

/* Remplacez par vos couleurs, par exemple violet/rose : */
background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
```

### Ajouter plus de langues

Éditez `config.js` section `translations` :

```javascript
de: {  // Allemand
    welcome: "Willkommen",
    checkout: "Abreise",
    // ...
}
```

### Modifier les intervalles de rafraîchissement

Dans `config.js` :

```javascript
refreshInterval: {
    data: 300000,      // 5 minutes (en millisecondes)
    weather: 600000,   // 10 minutes
    time: 60000        // 1 minute
}
```

---

## 🔧 Dépannage

### Problème : "Configuration incomplète"

**Solution** :
- Vérifiez que `googleSheetId` dans `config.js` contient votre ID Google Sheet
- Format correct : `1AbC2DeF3GhI4JkL5MnO6PqR7StU8VwX9YzA`

### Problème : Aucune donnée n'apparaît

**Solutions** :
1. Vérifiez que votre Google Sheet est **public** (partagé avec "Tous les utilisateurs disposant du lien")
2. Vérifiez les noms des onglets : `Reservations`, `Activites`, `Configuration` (respectez la casse)
3. Ouvrez la console du navigateur (F12) pour voir les erreurs

### Problème : Météo non disponible

**Solutions** :
1. Vérifiez que votre clé API est correcte dans `config.js`
2. Attendez jusqu'à 2h après création du compte OpenWeatherMap
3. Vérifiez le nom de la ville dans `config.js` : `city: "Quebec"` (sans accents)

### Problème : Dates mal formatées

**Solution** :
- Utilisez le format `AAAA-MM-JJ` (ex: 2025-12-25)
- OU utilisez le format de date Google Sheets (sélectionnez la colonne → Format → Date)

### Problème : Les activités ne tournent pas

**Solution** :
- Assurez-vous d'avoir plus de 4 activités avec "Actif = Oui"
- La rotation se fait toutes les 8 secondes

---

## 📱 Support

**Questions ou problèmes ?**
- Consultez la console du navigateur (F12) pour les erreurs
- Vérifiez que toutes les configurations sont correctes
- Testez d'abord sur votre ordinateur avant de déployer

---

## ✅ Checklist de déploiement

- [ ] Google Sheet créé avec 4 onglets
- [ ] Google Sheet partagé publiquement
- [ ] ID Google Sheet copié dans `config.js`
- [ ] Clé API météo ajoutée (optionnel)
- [ ] Fichiers uploadés sur GitHub
- [ ] Projet déployé sur Vercel
- [ ] URL Vercel testée dans un navigateur
- [ ] URL ajoutée dans Yodek
- [ ] Test complet sur l'écran

---

## 🎉 Vous êtes prêt !

Votre affichage St-Jo'Studio est maintenant opérationnel.

**Mise à jour des données** : Éditez simplement votre Google Sheet, les changements apparaîtront automatiquement dans les 5 minutes.

Bon séjour à vos invités ! 🏠✨