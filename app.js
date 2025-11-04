*** app.js.orig
--- app.js
@@
 let currentMode = 'guest';
 let currentReservation = null;
 let nextReservation = null;
 let activities = [];
 let currentLanguage = CONFIG.defaultLanguage;
+// Fenêtre de présence (heure locale)
+const CHECKIN_HOUR = 16;   // 16:00 le jour d'arrivée
+const CHECKOUT_HOUR = 11;  // 11:00 le jour du départ
 
 // ==================== INITIALISATION ====================
 
 document.addEventListener('DOMContentLoaded', () => {
@@
 async function loadReservations() {
   const url = `https://docs.google.com/spreadsheets/d/${CONFIG.googleSheetId}/gviz/tq?tqx=out:json&sheet=Reservations`;
 
   try {
     const response = await fetch(url);
     const text = await response.text();
     
     // Google Sheets retourne du JSONP, on doit extraire le JSON
     const json = JSON.parse(text.substring(47).slice(0, -2));
     
     const rows = json.table.rows;
-    const today = new Date();
-    today.setHours(0, 0, 0, 0);
+    const now = new Date(); // heure locale
 
     currentReservation = null;
     nextReservation = null;
     
     rows.forEach(row => {
       if (!row.c[0] || !row.c[1]) return; // Ignorer les lignes vides
-      
-      const startDate = parseDate(row.c[0].v);
-      const endDate = parseDate(row.c[1].v);
+      // startDate/endDate: dates (jour) extraites depuis Google (tolérant JJ/MM/AAAA)
+      const startDate = parseDate(row.c[0].v);
+      const endDate   = parseDate(row.c[1].v);
       const guestName = row.c[2]?.v || 'Invité';
       const guestCount = row.c[3]?.v || 1;
       const language = row.c[4]?.v?.toLowerCase() || CONFIG.defaultLanguage;
       const status = row.c[5]?.v || 'Confirmé';
 
+      if (!startDate || !endDate) return;
+
+      // Fenêtres de présence (locales) : arrivée 16:00 → départ 11:00
+      const startAt = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), CHECKIN_HOUR, 0, 0);
+      const endAt   = new Date(endDate.getFullYear(),   endDate.getMonth(),   endDate.getDate(),   CHECKOUT_HOUR, 0, 0);
+
       // Réservation en cours
-      if (startDate <= today && endDate >= today && status.toLowerCase() === 'confirmé') {
+      if (now >= startAt && now < endAt && status.toLowerCase() === 'confirmé') {
         currentReservation = {
-          startDate,
-          endDate,
+          startDate, endDate,
+          startAt,   endAt,
           guestName,
           guestCount,
           language,
           status
         };
         currentLanguage = language;
       }
       
       // Prochaine réservation
-      if (startDate > today && status.toLowerCase() === 'confirmé') {
-        if (!nextReservation || startDate < nextReservation.startDate) {
+      if (startAt > now && status.toLowerCase() === 'confirmé') {
+        if (!nextReservation || startAt < nextReservation.startAt) {
           nextReservation = {
-            startDate,
-            endDate,
+            startDate, endDate,
+            startAt,   endAt,
             guestName,
             guestCount,
             language,
             status
           };
         }
       }
     });
@@
 function showGuestMode() {
   currentMode = 'guest';
   document.getElementById('guestView').style.display = 'grid';
   document.getElementById('countdownView').classList.remove('active');
   
   // Nom de l'invité
   const guestName = currentReservation ? currentReservation.guestName : 'Bienvenue';
   document.getElementById('guestName').textContent = guestName;
   
   // Date de check-out
   if (currentReservation) {
-    const checkoutDate = formatDate(currentReservation.endDate, currentLanguage);
-    document.getElementById('checkoutTime').textContent = `${checkoutDate} ${CONFIG.property.checkoutTime}`;
+    const checkoutDate = formatDate(currentReservation.endDate, currentLanguage);
+    document.getElementById('checkoutTime').textContent = `${checkoutDate} ${CONFIG.property.checkoutTime}`;
   } else {
     document.getElementById('checkoutTime').textContent = CONFIG.property.checkoutTime;
   }
@@
 function showCountdownMode() {
   currentMode = 'countdown';
   document.getElementById('guestView').style.display = 'none';
   document.getElementById('countdownView').classList.add('active');
   
   if (nextReservation) {
     document.getElementById('nextGuestName').textContent = nextReservation.guestName;
     document.getElementById('nextGuestCount').textContent = `👥 ${nextReservation.guestCount} ${CONFIG.translations[currentLanguage].people}`;
     
     // Calculer et afficher le countdown
-    updateCountdown();
+    updateCountdown();
     setInterval(updateCountdown, 60000); // Mettre à jour chaque minute
   }
 }
@@
 function updateCountdown() {
   if (!nextReservation) return;
   
   const now = new Date();
-  const target = new Date(nextReservation.startDate);
+  // Compte à rebours jusqu'à l'heure réelle d'arrivée (16:00)
+  const target = nextReservation.startAt ? new Date(nextReservation.startAt) : new Date(nextReservation.startDate);
   const diff = target - now;
   
   if (diff <= 0) {
     // Recharger les données si la date est passée
     loadData();
     return;
   }
@@
-function parseDate(dateString) {
-  // Gérer différents formats de date
-  if (dateString.includes('Date(')) {
-    // Format Google Sheets Date()
-    const timestamp = parseInt(dateString.match(/\d+/)[0]);
-    return new Date(timestamp);
-  }
-  return new Date(dateString);
-}
+function parseDate(input) {
+  // Accepte: "Date(YYYY,MM,DD,...)" de Google, "YYYY-MM-DD", "JJ/MM/AAAA"
+  if (input == null) return null;
+  const str = String(input).trim();
+
+  // Google Sheets JSON: Date(YYYY,MM,DD,HH,mm,ss)
+  if (str.includes('Date(')) {
+    const parts = str.match(/Date\((\d+),\s*(\d+),\s*(\d+)/);
+    if (parts) {
+      const y = Number(parts[1]);
+      const m = Number(parts[2]); // déjà 0-based
+      const d = Number(parts[3]);
+      return new Date(y, m, d, 0, 0, 0);
+    }
+  }
+
+  // JJ/MM/AAAA
+  if (str.includes('/')) {
+    const [jj, mm, aaaa] = str.split('/').map(s => Number(s));
+    if (aaaa && mm && jj) return new Date(aaaa, mm - 1, jj, 0, 0, 0);
+  }
+
+  // YYYY-MM-DD
+  if (str.includes('-')) {
+    const [y, m, d] = str.split('-').map(s => Number(s));
+    if (y && m && d) return new Date(y, m - 1, d, 0, 0, 0);
+  }
+
+  // Fallback (laisse le moteur parser si possible)
+  const dt = new Date(str);
+  return isNaN(dt.getTime()) ? null : dt;
+}
