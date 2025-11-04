# 📦 St-Jo'Studio Display - Package Complet

## 🎉 Votre application est prête !

Tous les fichiers nécessaires pour votre affichage digital Airbnb ont été créés.

---

## 📁 Contenu du package

### Fichiers principaux (à déployer)
```
✅ index.html              → Page principale de l'application
✅ styles.css              → Styles visuels (design moderne minimaliste)
✅ app.js                  → Logique et intégration Google Sheets
✅ config.js               → ⚙️ CONFIGURATION (VOUS DEVEZ ÉDITER CE FICHIER)
✅ package.json            → Configuration pour npm/Vercel
✅ vercel.json             → Configuration de déploiement Vercel
✅ .gitignore              → Fichiers à ignorer dans Git
```

### Documentation
```
📖 README.md               → Documentation complète (LISEZ-MOI EN PREMIER)
📖 QUICK_START.md          → Guide de démarrage rapide (15 minutes)
📖 GOOGLE_SHEET_TEMPLATE.md → Instructions pour créer votre Google Sheet
📖 PROJET_SUMMARY.md       → Ce fichier
```

### Fichiers de démonstration
```
🎨 demo.html               → Version de test avec données fictives
🎨 airbnb-display-elegant.html   → Prototype style élégant
🎨 airbnb-display-modern.html    → Prototype style moderne
🎨 airbnb-display-nature.html    → Prototype style nature
```

---

## 🚀 Par où commencer ?

### Option 1 : Installation rapide (15 min)
Suivez le fichier **QUICK_START.md**

### Option 2 : Installation détaillée
Suivez le fichier **README.md**

### Option 3 : Tester d'abord
Ouvrez **demo.html** dans votre navigateur pour voir le rendu final

---

## ⚙️ Configuration requise

### Ce que VOUS devez faire :

1. **Créer un Google Sheet** (5 min)
   - Suivez `GOOGLE_SHEET_TEMPLATE.md`
   - 4 onglets : Reservations, Activites, Configuration, Instructions

2. **Éditer config.js** (2 min)
   - Ligne 21 : Ajoutez votre Google Sheet ID
   - Ligne 24 : (Optionnel) Ajoutez votre clé API météo

3. **Déployer sur Vercel** (5 min)
   - Via GitHub (recommandé)
   - Ou via Vercel CLI

4. **Configurer Yodek** (3 min)
   - Ajoutez l'URL Vercel comme page web

---

## 📊 Structure de votre Google Sheet

### Onglet 1 : Reservations
```
Date début | Date fin | Nom voyageur | Nb personnes | Langue | Statut
2025-11-05 | 2025-11-10 | Sophie Martin | 2 | FR | Confirmé
```

### Onglet 2 : Activites
```
Icône | Nom activité | Description | Distance | Horaires | Actif
🏢    | Salon BMR    | Salon d'achat | 4 km   | Centre congrès | Oui
```

### Onglet 3 : Configuration
```
Paramètre          | Valeur
Nom propriété      | St-Jo'Studio
Ville météo        | Quebec
Heure check-out    | 11:00 AM
```

---

## 🎯 Fonctionnalités

### ✅ Gestion automatique
- **Détection du mode** : Invité présent ou countdown automatique
- **Multi-langue** : FR, EN, ES (détection automatique)
- **Rotation activités** : Change toutes les 8 secondes si plus de 4
- **Rafraîchissement** : Mise à jour auto toutes les 5 minutes

### ✅ Personnalisation
- **Style** : Moderne & Minimaliste (bleu cyan)
- **Météo** : Intégration OpenWeatherMap
- **Activités** : Gestion complète via Google Sheet
- **Règles** : Personnalisables

### ✅ Affichage
- **Mode Invité** :
  - Message de bienvenue personnalisé
  - Météo en temps réel
  - Activités de la région (4 max affichées)
  - Check-out et règles

- **Mode Countdown** :
  - Compte à rebours avant prochains invités
  - Nom et nombre de personnes
  - Design attrayant

---

## 🔧 Configuration config.js

**Fichier le plus important à éditer** :

```javascript
const CONFIG = {
    // VOUS DEVEZ REMPLACER CES 2 VALEURS :
    googleSheetId: "VOTRE_GOOGLE_SHEET_ID",
    weatherApiKey: "VOTRE_CLE_API_METEO", // Optionnel

    // Le reste est déjà configuré :
    property: {
        name: "St-Jo'Studio",
        city: "Quebec",
        checkoutTime: "11:00 AM"
    },
    
    rules: [
        "Vider les poubelles en quittant",
        "Pas de cigarette ou vapoteuse",
        "Mode calme à partir de 21h pour les voisins"
    ],
    
    // ... (traductions, icônes, etc.)
};
```

---

## 🌐 Déploiement

### Sur Vercel (gratuit, recommandé)

**Via GitHub :**
1. Créez un repo GitHub
2. Uploadez les fichiers
3. Connectez Vercel à GitHub
4. Deploy → Récupérez l'URL

**Via CLI :**
```bash
npm install -g vercel
cd stjostudio-display
vercel
```

**Résultat :**
```
https://stjostudio-display.vercel.app
```

---

## 📱 Configuration Yodek

1. Page Web / URL
2. URL : `https://votre-app.vercel.app`
3. Durée : Illimitée
4. Plein écran : Oui
5. Orientation : Paysage (horizontal)

---

## 🔄 Mise à jour des données

**C'est ultra simple !**

1. Ouvrez votre Google Sheet
2. Modifiez les données
3. Sauvegardez (automatique)
4. Attendez 5 minutes
5. ✨ L'écran se met à jour automatiquement

**Pas besoin de :**
- ❌ Redéployer sur Vercel
- ❌ Recharger Yodek
- ❌ Toucher au code

---

## 🎨 Autres styles disponibles

Si vous préférez un autre style que "Moderne", vous avez :

### Style Élégant & Chaleureux
- Dégradés violet/doré
- Ambiance luxueuse
- Fichier : `airbnb-display-elegant.html`

### Style Nature & Local
- Tons verts naturels
- Ambiance écologique
- Fichier : `airbnb-display-nature.html`

**Pour changer de style** :
1. Copiez le contenu CSS du fichier HTML de style choisi
2. Remplacez dans `styles.css`
3. Redéployez

---

## 📈 Limites et performances

### Recommandations :
- **Réservations** : Max 50 dans le Google Sheet
- **Activités** : Max 20 (4 affichées simultanément)
- **Rafraîchissement** : Toutes les 5 minutes (configurable)

### Compatibilité :
- ✅ Tous navigateurs modernes
- ✅ Yodek et autres players digital signage
- ✅ Résolution optimisée pour 1920x1080
- ✅ Responsive (s'adapte aux autres tailles)

---

## 🆘 Dépannage rapide

### "Configuration incomplète"
→ Éditez `config.js` et ajoutez votre Google Sheet ID

### Aucune donnée
→ Vérifiez que le Google Sheet est public (Lecteur)

### Météo non disponible
→ Normal sans clé API (voir README.md pour config)

### Plus d'aide
→ Consultez **README.md** section Dépannage

---

## 📞 Checklist avant mise en production

- [ ] Google Sheet créé avec 4 onglets
- [ ] Google Sheet rendu public
- [ ] ID Google Sheet copié dans `config.js`
- [ ] (Optionnel) Clé API météo configurée
- [ ] Fichiers uploadés sur GitHub
- [ ] Projet déployé sur Vercel
- [ ] URL testée dans un navigateur
- [ ] Données de test ajoutées dans le Google Sheet
- [ ] Test complet effectué (mode invité + countdown)
- [ ] URL ajoutée dans Yodek
- [ ] Test final sur l'écran physique

---

## 💡 Conseils d'utilisation

### Gestion quotidienne
- **Ajoutez vos réservations** dès confirmation
- **Marquez "Annulé"** pour masquer sans supprimer
- **Activez/désactivez** les activités selon les saisons

### Maintenance
- **Nettoyez** les vieilles réservations chaque mois
- **Mettez à jour** les activités régulièrement
- **Faites une copie** du Google Sheet en backup

### Automatisation (avancé)
- Synchronisez Airbnb → Google Calendar
- Utilisez Zapier pour copier dans le Google Sheet
- Ou gérez manuellement (5 min par réservation)

---

## 🌟 Fonctionnalités futures possibles

Si vous voulez améliorer l'application :
- 📸 Photos du logement en arrière-plan
- 🗺️ Carte interactive des activités
- 📱 QR code pour infos supplémentaires
- 🏆 Avis clients
- 📊 Statistiques de séjour

**Contactez un développeur** pour ces ajouts personnalisés.

---

## 📄 Licence

Ce projet est fourni tel quel pour votre usage personnel.
Vous êtes libre de le modifier selon vos besoins.

---

## 🎉 Vous êtes prêt !

Tout est là pour que votre affichage St-Jo'Studio fonctionne parfaitement.

**Prochaine étape** : Ouvrez `QUICK_START.md` ou `README.md`

Bon séjour à vos invités ! 🏠✨

---

**Version** : 1.0.0  
**Date** : Novembre 2025  
**Propriété** : St-Jo'Studio, Quebec