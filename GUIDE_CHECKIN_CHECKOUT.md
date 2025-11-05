# ✅ VERSION ULTIME - Gestion Checkin ET Checkout

## 🎯 Votre scénario exact

**5 novembre 2025 :**
- **Martine** checkout à **11:00**
- **Sophie** checkin à **16:00**

### Timeline attendue :

| Heure | Mode | Nom affiché | Explication |
|-------|------|-------------|-------------|
| 10h59 | 👤 GUEST | Martine Monique | Martine encore là |
| 11h00 | ⏱️ COUNTDOWN | Sophie arrive | Martine partie, Sophie pas encore arrivée |
| 15h00 | ⏱️ COUNTDOWN | Sophie arrive | **← Vous êtes ici** |
| 15h59 | ⏱️ COUNTDOWN | Sophie arrive | Presque l'heure du checkin |
| 16h00 | 👤 GUEST | Sophie Martin | Sophie est arrivée ! |

---

## 🚀 Installation (3 minutes)

### 1. Téléchargez les fichiers

[app-checkin-checkout.js](computer:///mnt/user-data/outputs/app-checkin-checkout.js)
[config-updated.js](computer:///mnt/user-data/outputs/config-updated.js)

### 2. Renommez

- `app-checkin-checkout.js` → `app.js`
- `config-updated.js` → `config.js`

### 3. Vérifiez config.js

```javascript
property: {
    checkoutTime: "11:00 AM",  // Heure de départ
    checkinTime: "16:00"        // Heure d'arrivée ← NOUVEAU !
}
```

### 4. Redéployez

GitHub + Vercel ou `vercel --prod`

---

## 📊 Structure Google Sheet (OPTIONNEL)

Si vous voulez des heures **différentes par réservation**, ajoutez 2 colonnes :

| A: Checkin | B: Checkout | C: Name | D: Nb | E: Lang | F: Statut | **G: H.Checkin** | **H: H.Checkout** |
|------------|-------------|---------|-------|---------|-----------|-----------------|-------------------|
| 02/11/2025 | 05/11/2025 | Martine | 2 | EN | Confirmé | (vide) | **11:00 AM** |
| 05/11/2025 | 10/11/2025 | Sophie | 2 | EN | Confirmé | **16:00** | (vide) |

**Colonnes optionnelles G et H :**
- **G (Heure Checkin)** : Heure d'arrivée spécifique (ex: "16:00")
- **H (Heure Checkout)** : Heure de départ spécifique (ex: "11:00 AM")

**Si vides** : Utilise les heures par défaut de config.js

---

## ⚙️ Configuration

### Méthode 1 : Dans config.js (recommandé)

```javascript
property: {
    checkoutTime: "11:00 AM",  // Tous partent à 11h par défaut
    checkinTime: "16:00"        // Tous arrivent à 16h par défaut
}
```

### Méthode 2 : Dans Google Sheet (onglet Configuration)

```
Paramètre           | Valeur
Heure check-out     | 11:00 AM
Heure check-in      | 16:00
```

### Méthode 3 : Par réservation (colonnes G et H)

Pour des heures différentes par invité :
```
Martine → Checkout: 11:00 AM (colonne H)
Sophie  → Checkin: 16:00 (colonne G)
```

---

## 🔍 Vérification Console (F12)

Après installation, vous devriez voir :

```
⏰ Heure actuelle: 05/11/2025 15:00:00 (décimal: 15.00)
⏰ Checkout par défaut: 11:00 AM → 11.00
⏰ Checkin par défaut: 16:00 → 16.00

--- Réservation ligne 2 ---
👤 Invité: Martine Monique
⏰ Heures:
  Checkin: 16.00
  Checkout: 11.00
  ✅ Checkin: OUI (arrivé avant aujourd'hui)
  ✅ Checkout: OUI (part aujourd'hui, après heure: 15.00 >= 11.00)
  ❌ Martine n'est plus présente

--- Réservation ligne 3 ---
👤 Invité: Sophie Martin
⏰ Heures:
  Checkin: 16.00
  Checkout: 11.00
  ❌ Checkin: NON (arrive aujourd'hui, avant heure: 15.00 < 16.00)
  🔜 PROCHAINE RÉSERVATION

📊 RÉSULTAT FINAL:
Réservation actuelle: null
Prochaine réservation: {guestName: "Sophie Martin", ...}
Mode qui sera affiché: ⏱️ COUNTDOWN
```

---

## 📝 Cas d'usage

### Cas 1 : Same-day turnover (votre cas)

**Configuration :**
```javascript
checkoutTime: "11:00 AM"
checkinTime: "16:00"
```

**Comportement le 5 novembre :**
- 00h00-10h59 : Martine (GUEST)
- 11h00-15h59 : Countdown (COUNTDOWN)
- 16h00-23h59 : Sophie (GUEST)

### Cas 2 : Checkin anticipé

**Configuration :**
```javascript
checkoutTime: "11:00 AM"
checkinTime: "14:00"  // Checkin à 14h
```

**Comportement :**
- 00h00-10h59 : Martine
- 11h00-13h59 : Countdown (3h d'attente)
- 14h00-23h59 : Sophie

### Cas 3 : Checkout tardif

**Configuration :**
```javascript
checkoutTime: "12:00 PM"  // Noon
checkinTime: "15:00"
```

**Comportement :**
- 00h00-11h59 : Martine
- 12h00-14h59 : Countdown
- 15h00-23h59 : Sophie

---

## 🎯 Formats d'heure acceptés

```javascript
"11:00 AM"    ✅ Format 12h avec AM/PM
"16:00"       ✅ Format 24h
"4:00 PM"     ✅ Format 12h (= 16h00)
"11:00"       ✅ Format 24h (11h00)
```

---

## 🔄 Rafraîchissement automatique

Le code vérifie les réservations **toutes les 5 minutes**.

**Donc :**
- À 15h55 : Affiche Countdown
- À 16h00 : Automatiquement
- À 16h05 : Rafraîchissement → Affiche Sophie

**Pas besoin de recharger manuellement !**

---

## 🆘 Dépannage

### Problème : Countdown ne s'affiche pas à 11h00

**Vérifiez :**
1. `checkoutTime: "11:00 AM"` dans config.js
2. Console (F12) → Cherchez "Checkout: OUI"
3. Martine a bien `status = "Confirmé"`

### Problème : Sophie s'affiche avant 16h00

**Vérifiez :**
1. `checkinTime: "16:00"` dans config.js
2. Console (F12) → Cherchez "Checkin: NON"
3. L'heure système de votre ordinateur/serveur

### Problème : Aucun mode ne change

**Vérifiez :**
1. Les dates sont correctes (05/11/2025)
2. Le statut est "Confirmé" (pas "confirmé" minuscule)
3. Console (F12) pour voir les logs détaillés

---

## 📊 Google Sheet final recommandé

### Version simple (utilise config.js)

| Checkin | Checkout | Name | Nb | Langue | Statut |
|---------|----------|------|-----|--------|--------|
| 02/11/2025 | 05/11/2025 | Martine Monique | 2 | EN | Confirmé |
| 05/11/2025 | 10/11/2025 | Sophie Martin | 2 | EN | Confirmé |

**Heures :** Définies dans config.js pour tous

### Version avancée (heures personnalisées)

| Checkin | Checkout | Name | Nb | Langue | Statut | H.Checkin | H.Checkout |
|---------|----------|------|-----|--------|--------|-----------|------------|
| 02/11/2025 | 05/11/2025 | Martine | 2 | EN | Confirmé | | 11:00 AM |
| 05/11/2025 | 10/11/2025 | Sophie | 2 | EN | Confirmé | 16:00 | |
| 10/11/2025 | 15/11/2025 | John | 4 | EN | Confirmé | 14:00 | 10:00 AM |

**Colonnes G et H** : Heures spécifiques par réservation

---

## ✅ Checklist finale

- [ ] app-checkin-checkout.js renommé en app.js
- [ ] config-updated.js renommé en config.js
- [ ] `checkoutTime: "11:00 AM"` dans config.js
- [ ] `checkinTime: "16:00"` dans config.js
- [ ] Dates correctes dans Google Sheet
- [ ] Statut = "Confirmé" (avec majuscule)
- [ ] Redéployé sur Vercel
- [ ] Testé dans la console (F12)

---

## 🎉 Résultat final

Après installation, à **15h00 aujourd'hui** :

```
Mode affiché : ⏱️ COUNTDOWN
Texte : "Prochains voyageurs"
Nom : Sophie Martin
Compte à rebours : 01j 01h 00m (jusqu'à 16h00)
```

À **16h00** :

```
Mode affiché : 👤 GUEST
Nom : Sophie Martin
Checkout : dimanche 10 novembre 11:00 AM
```

**Tout devrait fonctionner parfaitement maintenant !** 🚀

---

## 💡 Bonus : Temps de ménage

Si vous voulez un **temps de ménage** entre les clients :

```javascript
checkoutTime: "11:00 AM"
checkinTime: "15:00"  // 4h de ménage
```

Le countdown durera de 11h à 15h = 4 heures de préparation ! 🧹

---

Parfait pour votre cas ! Installez maintenant et à 16h00 pile, Sophie apparaîtra ! ✨
