# 🚀 Guide de démarrage rapide - St-Jo'Studio Display

## ⏱️ Installation en 15 minutes

### 📋 Pré-requis
- [ ] Compte Google (pour Google Sheets)
- [ ] Compte GitHub (gratuit)
- [ ] Compte Vercel (gratuit)
- [ ] Accès à votre player Yodek

---

## Étape 1️⃣ : Créer votre Google Sheet (5 min)

1. **Allez sur** https://sheets.google.com

2. **Créez un nouveau document**

3. **Suivez le guide complet** dans `GOOGLE_SHEET_TEMPLATE.md`
   - Ou copiez simplement cette structure :

**4 onglets à créer :**
```
1. Reservations  → Vos réservations Airbnb
2. Activites     → Événements et activités de la région
3. Configuration → Paramètres de l'affichage
4. Instructions  → Documentation
```

4. **Rendez le Sheet public** :
   - Partager → "Tous les utilisateurs disposant du lien" → Lecteur

5. **Copiez l'ID** (dans l'URL) :
   ```
   https://docs.google.com/spreadsheets/d/[VOTRE_ID]/edit
   ```

---

## Étape 2️⃣ : Configurer l'application (2 min)

1. **Éditez le fichier `config.js`**

2. **Remplacez ces 2 lignes** :
   ```javascript
   googleSheetId: "COLLEZ_VOTRE_ID_ICI",
   weatherApiKey: "OPTIONNEL_VOIR_README",
   ```

3. **Sauvegardez** ✅

---

## Étape 3️⃣ : Déployer sur Vercel (5 min)

### Option A : Via GitHub (recommandé)

1. **Créez un compte GitHub** : https://github.com/signup

2. **Créez un nouveau repository** :
   - Nom : `stjostudio-display`
   - Public
   - Sans README

3. **Uploadez tous les fichiers** :
   - Glissez-déposez dans GitHub
   - Ou utilisez GitHub Desktop

4. **Allez sur Vercel** : https://vercel.com

5. **Connectez GitHub** :
   - Sign Up → "Continue with GitHub"

6. **Importez votre projet** :
   - "Add New" → "Project"
   - Sélectionnez `stjostudio-display`
   - "Deploy"

7. **Récupérez votre URL** :
   ```
   https://stjostudio-display.vercel.app
   ```

### Option B : Via Vercel CLI

```bash
# Installer Vercel CLI
npm install -g vercel

# Dans le dossier du projet
vercel

# Suivre les instructions
```

---

## Étape 4️⃣ : Configurer Yodek (3 min)

1. **Connectez-vous à votre Yodek**

2. **Créez une page web** :
   - Type : Page Web / URL
   - URL : `https://votre-app.vercel.app`
   - Durée : Illimitée

3. **Assignez à votre écran** ✅

---

## ✅ C'est terminé !

Votre affichage est maintenant opérationnel ! 🎉

### Test rapide :

1. **Ouvrez l'URL Vercel dans votre navigateur**
2. **Vérifiez que** :
   - [ ] Le nom "St-Jo'Studio" apparaît
   - [ ] Les activités s'affichent
   - [ ] Le mode peut basculer (bouton en haut à droite)

### Mise à jour des données :

**C'est simple** : Éditez votre Google Sheet !
- Les changements apparaissent automatiquement dans les 5 minutes
- Pas besoin de redéployer

---

## 🆘 Problèmes ?

### L'écran affiche "Configuration incomplète"
→ Vérifiez l'ID Google Sheet dans `config.js`

### Aucune donnée n'apparaît
→ Vérifiez que le Google Sheet est public (Lecteur)

### La météo ne fonctionne pas
→ Normal si vous n'avez pas configuré l'API météo (voir README.md)

### Plus d'aide
→ Consultez `README.md` pour la documentation complète

---

## 📝 Utilisation quotidienne

### Ajouter une nouvelle réservation :

1. Ouvrez votre Google Sheet
2. Onglet "Reservations"
3. Ajoutez une ligne :
   ```
   2025-12-25 | 2025-12-28 | Famille Tremblay | 4 | FR | Confirmé
   ```
4. Sauvegardez (automatique)
5. Attendez 5 minutes → L'écran se met à jour automatiquement ✨

### Modifier les activités :

1. Onglet "Activites"
2. Changez "Actif" de "Oui" à "Non" pour masquer
3. Ou ajoutez de nouvelles lignes
4. Sauvegardez

### Changer les règles :

1. Onglet "Configuration"
2. Modifiez les valeurs
3. Sauvegardez

---

## 🎨 Personnalisation avancée

**Vous voulez changer les couleurs ?**
→ Éditez `styles.css`

**Vous voulez ajouter des langues ?**
→ Éditez `config.js` section `translations`

**Vous voulez modifier le layout ?**
→ Consultez `README.md` section Personnalisation

---

## 📊 Récapitulatif des fichiers

```
stjostudio-display/
├── index.html              → Page principale
├── styles.css              → Styles visuels
├── app.js                  → Logique de l'application
├── config.js               → ⚙️ CONFIGURATION (à éditer)
├── package.json            → Configuration npm
├── vercel.json             → Configuration Vercel
├── README.md               → Documentation complète
├── GOOGLE_SHEET_TEMPLATE.md → Guide Google Sheet
└── QUICK_START.md          → Ce fichier
```

**Fichier le plus important** : `config.js` (c'est le seul que vous devez éditer)

---

## 🎯 Prochaines étapes suggérées

1. ✅ **Testez sur votre ordinateur** avant de mettre sur Yodek
2. ✅ **Ajoutez des réservations réelles** dans le Google Sheet
3. ✅ **Configurez la météo** (optionnel mais recommandé)
4. ✅ **Personnalisez les activités** selon votre région
5. ✅ **Sauvegardez votre Google Sheet** (Fichier → Faire une copie)

---

## 💡 Conseils Pro

### Automatisation
- Synchronisez votre calendrier Airbnb avec Google Calendar
- Puis copiez manuellement dans le Google Sheet
- Ou utilisez Zapier/IFTTT pour automatiser (avancé)

### Backup
- Faites une copie de votre Google Sheet chaque mois
- Exportez en Excel (.xlsx) pour avoir une sauvegarde locale

### Performance
- Limitez à 50 réservations maximum dans le sheet (supprimez les anciennes)
- Gardez max 20 activités

---

## 🌟 Fonctionnalités

✅ **Détection automatique du mode** :
- Invité présent → Affiche l'accueil personnalisé
- Pas d'invité → Affiche le countdown

✅ **Multi-langue** :
- Détecte la langue de l'invité
- Traduit automatiquement l'interface

✅ **Rotation des activités** :
- Change automatiquement toutes les 8 secondes

✅ **Mise à jour automatique** :
- Rafraîchit les données toutes les 5 minutes

---

## 📞 Support

**Documentation complète** : `README.md`
**Problèmes techniques** : Ouvrez la console du navigateur (F12)
**Questions** : Vérifiez d'abord la section Dépannage du README

---

Bon séjour à vos invités ! 🏠✨