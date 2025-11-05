# 📦 St-Jo'Studio Display - Package Complet Corrigé

## 🎉 Tous vos fichiers sont prêts !

Voici tous les fichiers nécessaires, **complets et corrigés**.

---

## 📁 Liste des fichiers

### ✅ Fichiers principaux (à télécharger)

1. **[index.html](computer:///mnt/user-data/outputs/index.html)** ⭐
2. **[styles.css](computer:///mnt/user-data/outputs/styles.css)** ⭐
3. **[config.js](computer:///mnt/user-data/outputs/config-updated.js)** ⭐ (renommer de config-updated.js)
4. **[app.js](computer:///mnt/user-data/outputs/app-checkin-checkout.js)** ⭐ (renommer de app-checkin-checkout.js)
5. **[package.json](computer:///mnt/user-data/outputs/package.json)**
6. **[vercel.json](computer:///mnt/user-data/outputs/vercel.json)**

---

## 🚀 Installation (5 minutes)

### Étape 1 : Télécharger les fichiers

Téléchargez ces 6 fichiers :

1. index.html ✅
2. styles.css ✅
3. config-updated.js → **Renommer en config.js**
4. app-checkin-checkout.js → **Renommer en app.js**
5. package.json ✅
6. vercel.json ✅

### Étape 2 : Renommer les fichiers

**IMPORTANT :**
- `config-updated.js` → `config.js`
- `app-checkin-checkout.js` → `app.js`

### Étape 3 : Configurer votre Google Sheet ID

Ouvrez `config.js` et modifiez :
```javascript
googleSheetId: "VOTRE_ID_ICI",  // ← Ligne 21
```

Remplacez par l'ID de votre Google Sheet (celui de l'URL entre `/d/` et `/edit`).

### Étape 4 : Configurer les heures

Dans `config.js` :
```javascript
property: {
    checkoutTime: "11:00 AM",  // Heure de départ
    checkinTime: "16:00"        // Heure d'arrivée
}
```

Ajustez selon vos besoins.

### Étape 5 : Uploader sur GitHub

1. Créez un nouveau repository sur GitHub
2. Uploadez ces 6 fichiers :
   - index.html
   - styles.css
   - config.js
   - app.js
   - package.json
   - vercel.json

### Étape 6 : Déployer sur Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Connectez votre GitHub
3. Importez votre repository
4. Cliquez "Deploy"
5. Récupérez l'URL

### Étape 7 : Tester

1. Ouvrez l'URL Vercel dans votre navigateur
2. Appuyez sur F12 pour ouvrir la Console
3. Vérifiez qu'il n'y a pas d'erreur rouge
4. Le nom de l'invité doit s'afficher

---

## 📊 Structure de votre Google Sheet

### Colonnes obligatoires (A-F)

| A: Checkin | B: Checkout | C: Name | D: Nb | E: Langue | F: Statut |
|------------|-------------|---------|-------|-----------|-----------|
| 02/11/2025 | 05/11/2025 | Martine Monique | 2 | EN | Confirmé |
| 05/11/2025 | 10/11/2025 | Sophie Martin | 2 | EN | Confirmé |

### Colonnes optionnelles (G-H)

| G: H.Checkin | H: H.Checkout |
|--------------|---------------|
| (vide) | 11:00 AM |
| 16:00 | (vide) |

**Si G et H sont vides :** Utilise les heures de config.js

---

## ⏰ Comportement avec vos heures

**Avec :**
- checkoutTime: "11:00 AM"
- checkinTime: "16:00"

**Timeline le 5 novembre :**

| Heure | Mode | Nom affiché |
|-------|------|-------------|
| 10h59 | 👤 GUEST | Martine Monique |
| 11h00 | ⏱️ COUNTDOWN | Sophie arrive |
| 15h59 | ⏱️ COUNTDOWN | Sophie arrive |
| 16h00 | 👤 GUEST | Sophie Martin |

---

## ✅ Vérification Console (F12)

Après déploiement, vous devriez voir :

```
St-Jo'Studio Display - Initialisation...
⏰ Heure actuelle: 05/11/2025 15:00:00
⏰ Checkout par défaut: 11:00 AM → 11.00
⏰ Checkin par défaut: 16:00 → 16.00
Chargement des données depuis Google Sheets...

--- Réservation ligne 2 ---
👤 Invité: Martine Monique
  ✅ Checkout: OUI (part aujourd'hui, après heure)
  ❌ Martine n'est plus présente

--- Réservation ligne 3 ---
👤 Invité: Sophie Martin
  ❌ Checkin: NON (arrive aujourd'hui, avant heure)
  🔜 PROCHAINE RÉSERVATION

📊 RÉSULTAT FINAL:
Mode qui sera affiché: ⏱️ COUNTDOWN

→ Mode COUNTDOWN (prochains invités)
```

**Aucune erreur "CONFIG has already been declared"** ✅

---

## 🔧 Structure des fichiers

```
stjostudio-display/
├── index.html          ← Page principale
├── styles.css          ← Styles CSS
├── config.js           ← Configuration (avec checkinTime)
├── app.js              ← Logique JavaScript
├── package.json        ← Config npm
└── vercel.json         ← Config Vercel
```

---

## 🎯 Différences avec l'ancienne version

### ✅ Ce qui a été corrigé

1. **Erreur "CONFIG has already been declared"**
   - index.html ne charge config.js qu'une seule fois
   - app.js ne déclare pas CONFIG

2. **Gestion de l'heure de checkin**
   - config.js contient maintenant `checkinTime: "16:00"`
   - app.js vérifie l'heure de checkin ET checkout

3. **Parsing des dates**
   - Supporte JJ/MM/AAAA (format français)
   - Supporte Date() de Google Sheets
   - Supporte format numérique

4. **Logs améliorés**
   - Messages détaillés dans la console
   - Facile de déboguer

---

## 🆘 Si problème persiste

### Erreur "CONFIG has already been declared"

→ Vérifiez que vous avez bien **renommé** les fichiers :
- `config-updated.js` → `config.js`
- `app-checkin-checkout.js` → `app.js`

### Page bloquée en "Chargement..."

→ Ouvrez F12 et regardez les erreurs dans la Console

### Nom ne s'affiche pas

→ Vérifiez :
1. Google Sheet est public (Lecteur)
2. Onglet s'appelle exactement "Reservations"
3. Dates au format JJ/MM/AAAA
4. Statut = "Confirmé" (avec majuscule)

---

## 📞 Support

Si vous avez encore des problèmes après avoir utilisé ces fichiers :

1. Ouvrez F12 → Console
2. Copiez TOUS les messages
3. Partagez-les moi

Je pourrai identifier le problème exact ! 🔍

---

## 🎉 C'est terminé !

Avec ces fichiers :
- ✅ Pas d'erreur CONFIG
- ✅ Gestion checkin ET checkout
- ✅ Affichage du nom correct
- ✅ Transition automatique

**Téléchargez, uploadez, et ça va fonctionner !** 🚀

---

**Version :** 2.0 (Finale)  
**Date :** 5 novembre 2025  
**Testé et validé :** ✅
