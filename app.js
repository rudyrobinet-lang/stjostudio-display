// Application principale pour St-Jo'Studio Display
// VERSION AVEC OPTION 4 - Shuffle aléatoire de 2 activités toutes les 5 secondes

let currentMode = 'guest';
let currentReservation = null;
let nextReservation = null;
let activities = [];
let currentLanguage = CONFIG.defaultLanguage;

// ==================== INITIALISATION ====================

document.addEventListener('DOMContentLoaded', () => {
    console.log('St-Jo\'Studio Display - Initialisation...');
    console.log('⏰ Heure actuelle:', new Date().toLocaleString('fr-FR'));
    
    if (!validateConfig()) {
        showError('Configuration incomplète. Veuillez vérifier config.js');
        return;
    }

    initializeApp();
});

function validateConfig() {
    if (CONFIG.googleSheetId === 'REMPLACER_PAR_VOTRE_GOOGLE_SHEET_ID') {
        console.error('Google Sheet ID non configuré');
        return false;
    }
    if (CONFIG.weatherApiKey === 'REMPLACER_PAR_VOTRE_CLE_API') {
        console.warn('Clé API météo non configurée - la météo ne sera pas disponible');
    }
    return true;
}

function initializeApp() {
    // Appliquer la couleur cyan par défaut
    document.documentElement.style.setProperty('--primary-color', '#00d4ff');
    document.documentElement.style.setProperty('--secondary-color', '#0099ff');
    
    loadData();
    loadWeather();
    updateTime();

    setInterval(loadData, CONFIG.refreshInterval.data);
    setInterval(loadWeather, CONFIG.refreshInterval.weather);
    setInterval(updateTime, CONFIG.refreshInterval.time);
    
    // Actualisation forcée toutes les 5 minutes pour éviter les gels
    setInterval(() => {
        console.log('🔄 Actualisation forcée de la page...');
        location.reload();
    }, 300000); // 5 minutes = 300000ms
    
    // Activer le fade-in au chargement
    setTimeout(() => {
        const container = document.getElementById('guestView');
        if (container && container.style.display !== 'none') {
            container.classList.add('active');
        }
    }, 100);
}

// ==================== CHARGEMENT DONNÉES GOOGLE SHEETS ====================

async function loadData() {
    try {
        console.log('Chargement des données depuis Google Sheets...');
        await loadReservations();
        await loadActivities();
        await loadConfiguration();
        updateDisplay();
        console.log('Données chargées avec succès');
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        showError('Erreur de chargement des données');
    }
}

function parseTime(timeString) {
    // Parse "11:00 AM", "16:00", etc. et retourne l'heure en décimal
    const match = timeString.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) {
        console.warn('Format d\'heure invalide:', timeString);
        return null;
    }
    
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3]?.toUpperCase();
    
    if (period === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }
    
    return hours + (minutes / 60);
}

async function loadReservations() {
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.googleSheetId}/gviz/tq?tqx=out:json&sheet=Reservations`;
    
    try {
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text.substring(47).slice(0, -2));
        
        const rows = json.table.rows;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const currentHour = now.getHours() + (now.getMinutes() / 60);
        
        console.log('📅 Date du jour (minuit):', today.toLocaleDateString('fr-FR'));
        console.log('⏰ Heure actuelle:', now.toLocaleTimeString('fr-FR'), `(décimal: ${currentHour.toFixed(2)})`);
        
        // Heures par défaut
        const defaultCheckoutHour = parseTime(CONFIG.property.checkoutTime) || 11;
        const defaultCheckinHour = parseTime(CONFIG.property.checkinTime) || 16;
        
        console.log('⏰ Checkout par défaut:', CONFIG.property.checkoutTime, '→', defaultCheckoutHour.toFixed(2));
        console.log('⏰ Checkin par défaut:', CONFIG.property.checkinTime, '→', defaultCheckinHour.toFixed(2));
        
        currentReservation = null;
        nextReservation = null;
        
        rows.forEach((row, index) => {
            if (!row.c[0] || !row.c[1]) return;
            
            console.log(`\n--- Réservation ligne ${index + 2} ---`);
            
            const startDate = parseDate(row.c[0].v);
            const endDate = parseDate(row.c[1].v);
            const guestName = row.c[2]?.v || 'Invité';
            const guestCount = row.c[3]?.v || 1;
            const language = row.c[4]?.v?.toLowerCase() || CONFIG.defaultLanguage;
            const status = row.c[5]?.v || 'Confirmé';
            
            const customCheckinTime = row.c[6]?.v;
            const customCheckoutTime = row.c[7]?.v;
            
            const checkinHour = customCheckinTime ? parseTime(customCheckinTime) : defaultCheckinHour;
            const checkoutHour = customCheckoutTime ? parseTime(customCheckoutTime) : defaultCheckoutHour;
            
            console.log('📅 Dates:');
            console.log('  Checkin:', startDate.toLocaleDateString('fr-FR'));
            console.log('  Checkout:', endDate.toLocaleDateString('fr-FR'));
            console.log('👤 Invité:', guestName);
            console.log('⏰ Heures:');
            console.log('  Checkin:', checkinHour?.toFixed(2) || 'N/A');
            console.log('  Checkout:', checkoutHour?.toFixed(2) || 'N/A');
            console.log('✔️  Statut:', status);
            
            const isConfirmed = status.toLowerCase() === 'confirmé';
            
            const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
            
            let hasCheckedIn = false;
            let hasCheckedOut = false;
            
            if (startDateOnly < today) {
                hasCheckedIn = true;
                console.log('  ✅ Checkin: OUI (arrivé avant aujourd\'hui)');
            } else if (startDateOnly.getTime() === today.getTime()) {
                if (currentHour >= checkinHour) {
                    hasCheckedIn = true;
                    console.log(`  ✅ Checkin: OUI (arrive aujourd'hui, après heure checkin: ${currentHour.toFixed(2)} >= ${checkinHour.toFixed(2)})`);
                } else {
                    hasCheckedIn = false;
                    console.log(`  ❌ Checkin: NON (arrive aujourd'hui, avant heure checkin: ${currentHour.toFixed(2)} < ${checkinHour.toFixed(2)})`);
                }
            } else {
                hasCheckedIn = false;
                console.log('  ❌ Checkin: NON (arrive après aujourd\'hui)');
            }
            
            if (endDateOnly < today) {
                hasCheckedOut = true;
                console.log('  ✅ Checkout: OUI (parti avant aujourd\'hui)');
            } else if (endDateOnly.getTime() === today.getTime()) {
                if (currentHour >= checkoutHour) {
                    hasCheckedOut = true;
                    console.log(`  ✅ Checkout: OUI (part aujourd'hui, après heure checkout: ${currentHour.toFixed(2)} >= ${checkoutHour.toFixed(2)})`);
                } else {
                    hasCheckedOut = false;
                    console.log(`  ❌ Checkout: NON (part aujourd'hui, avant heure checkout: ${currentHour.toFixed(2)} < ${checkoutHour.toFixed(2)})`);
                }
            } else {
                hasCheckedOut = false;
                console.log('  ❌ Checkout: NON (part après aujourd\'hui)');
            }
            
            const isPresent = hasCheckedIn && !hasCheckedOut;
            console.log(`  📊 Résumé: checkedIn=${hasCheckedIn}, checkedOut=${hasCheckedOut}, présent=${isPresent}, confirmé=${isConfirmed}`);
            
            if (isPresent && isConfirmed) {
                console.log('  🎉 RÉSERVATION EN COURS !');
                currentReservation = {
                    startDate, endDate, guestName, guestCount, language, status,
                    checkinHour, checkoutHour
                };
                currentLanguage = language;
            }
            
            if (!hasCheckedIn && isConfirmed) {
                if (!nextReservation || startDate < nextReservation.startDate || 
                    (startDate.getTime() === nextReservation.startDate.getTime() && checkinHour < nextReservation.checkinHour)) {
                    console.log('  🔜 PROCHAINE RÉSERVATION');
                    nextReservation = {
                        startDate, endDate, guestName, guestCount, language, status,
                        checkinHour, checkoutHour
                    };
                }
            }
        });
        
        console.log('\n========================================');
        console.log('📊 RÉSULTAT FINAL:');
        console.log('Réservation actuelle:', currentReservation);
        console.log('Prochaine réservation:', nextReservation);
        console.log('Mode qui sera affiché:', currentReservation ? '👤 GUEST' : (nextReservation ? '⏱️ COUNTDOWN' : '👋 GUEST (défaut)'));
        console.log('========================================\n');
        
    } catch (error) {
        console.error('Erreur chargement réservations:', error);
        throw error;
    }
}

async function loadActivities() {
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.googleSheetId}/gviz/tq?tqx=out:json&sheet=Activites`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Onglet Activites non trouvé');
        
        const text = await response.text();
        const json = JSON.parse(text.substring(47).slice(0, -2));
        
        activities = [];
        const allActivities = [];
        
        json.table.rows.forEach((row, index) => {
            if (index === 0) return;
            if (!row.c[1]) return;
            
            const icon = row.c[0]?.v || '🎯';
            const name = row.c[1]?.v || '';
            const description = row.c[2]?.v || '';
            const distance = row.c[3]?.v || '';
            const hours = row.c[4]?.v || '';
            const active = row.c[5]?.v?.toLowerCase() !== 'non';
            
            const startDate = row.c[6]?.v ? parseDate(row.c[6].v) : null;
            const endDate = row.c[7]?.v ? parseDate(row.c[7].v) : null;
            
            if (active && name) {
                allActivities.push({
                    icon,
                    name,
                    description,
                    distance,
                    hours,
                    startDate,
                    endDate,
                    isPermanent: !startDate && !endDate
                });
            }
        });
        
        activities = filterActivitiesForGuest(allActivities);
        
        console.log(`${activities.length} activités/événements affichés (${allActivities.length} au total)`);
        
    } catch (error) {
        console.warn('Onglet Activites non trouvé, utilisation des activités par défaut');
        activities = getDefaultActivities();
    }
}

function filterActivitiesForGuest(allActivities) {
    if (!currentReservation) {
        console.log('Pas de réservation → Activités permanentes uniquement');
        return allActivities.filter(a => a.isPermanent);
    }
    
    const checkinDate = new Date(currentReservation.startDate);
    checkinDate.setHours(0, 0, 0, 0);
    
    const checkoutDate = new Date(currentReservation.endDate);
    checkoutDate.setHours(23, 59, 59, 999);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const maxFutureDate = new Date(today);
    maxFutureDate.setDate(maxFutureDate.getDate() + 7);
    maxFutureDate.setHours(23, 59, 59, 999);
    
    console.log('\n🎯 FILTRAGE DES ÉVÉNEMENTS');
    console.log('Aujourd\'hui:', today.toLocaleDateString('fr-FR'));
    console.log('Limite future (J+7):', maxFutureDate.toLocaleDateString('fr-FR'));
    console.log('Période du séjour:', checkinDate.toLocaleDateString('fr-FR'), '→', checkoutDate.toLocaleDateString('fr-FR'));
    
    const filtered = allActivities.filter(activity => {
        if (activity.isPermanent) {
            console.log(`✅ Activité permanente: ${activity.name}`);
            return true;
        }
        
        const eventStart = new Date(activity.startDate);
        eventStart.setHours(0, 0, 0, 0);
        
        const eventEnd = new Date(activity.endDate);
        eventEnd.setHours(23, 59, 59, 999);
        
        const startsBeforeEnd = eventStart <= checkoutDate;
        const endsAfterStart = eventEnd >= checkinDate;
        const overlapsSejour = startsBeforeEnd && endsAfterStart;
        
        if (!overlapsSejour) return false;
        
        const isNotFinished = eventEnd >= today;
        if (!isNotFinished) return false;
        
        const startsWithinWeek = eventStart <= maxFutureDate;
        if (!startsWithinWeek) return false;
        
        console.log(`✅ AFFICHER: ${activity.name}`);
        return true;
    });
    
    console.log(`\n📊 Total: ${filtered.length} activités/événements affichés sur ${allActivities.length}\n`);
    
    return filtered;
}

async function loadConfiguration() {
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.googleSheetId}/gviz/tq?tqx=out:json&sheet=Configuration`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Onglet Configuration non trouvé');
        
        const text = await response.text();
        const json = JSON.parse(text.substring(47).slice(0, -2));
        
        json.table.rows.forEach(row => {
            if (!row.c[0] || !row.c[1]) return;
            
            const param = row.c[0].v.toLowerCase();
            const value = row.c[1].v;
            
            if (param.includes('nom propri')) CONFIG.property.name = value;
            else if (param.includes('ville m')) CONFIG.property.city = value;
            else if (param.includes('heure check-out')) CONFIG.property.checkoutTime = value;
            else if (param.includes('heure check-in')) CONFIG.property.checkinTime = value;
        });
        
        console.log('Configuration personnalisée chargée');
    } catch (error) {
        console.warn('Onglet Configuration non trouvé, utilisation config par défaut');
    }
}

function getDefaultActivities() {
    return [
        { icon: '🏢', name: 'Salon d\'achat 2025 de BMR inc.', description: 'Salon BMR', distance: '4 km', hours: 'Centre des congrès' },
        { icon: '💪', name: 'Physiothérapie 360 édition 2025', description: 'Salon des pro de la santé', distance: '4.5 km', hours: 'En face du Hilton' },
        { icon: '🐾', name: 'Pitou-Minou', description: 'Salon au poil', distance: '2.3 km', hours: 'De 9h à 16h' }
    ];
}

// ==================== MÉTÉO ====================

async function loadWeather() {
    if (CONFIG.weatherApiKey === 'REMPLACER_PAR_VOTRE_CLE_API') {
        displayDefaultWeather();
        return;
    }

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${CONFIG.property.city}&appid=${CONFIG.weatherApiKey}&units=metric&lang=fr`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.cod === 200) {
            displayWeather(data);
        } else {
            displayDefaultWeather();
        }
    } catch (error) {
        displayDefaultWeather();
    }
}

function displayWeather(data) {
    const temp = Math.round(data.main.temp);
    const condition = data.weather[0].main;
    const description = data.weather[0].description;
    const humidity = data.main.humidity;
    const windSpeed = Math.round(data.wind.speed * 3.6);
    const icon = CONFIG.weatherIcons[condition] || CONFIG.weatherIcons.default;
    
    document.getElementById('weatherIcon').textContent = icon;
    document.getElementById('temperature').textContent = `${temp}°`;
    document.getElementById('weatherDetails').innerHTML = `
        ${capitalize(description)}<br>
        💧 Humidité: ${humidity}%<br>
        💨 Vent: ${windSpeed} km/h
    `;
}

function displayDefaultWeather() {
    document.getElementById('weatherIcon').textContent = '🌤️';
    document.getElementById('temperature').textContent = '--°';
    document.getElementById('weatherDetails').textContent = 'Météo non disponible';
}

// ==================== MISE À JOUR AFFICHAGE ====================

function updateDisplay() {
    console.log('\n🖥️  Mise à jour de l\'affichage...');
    
    if (currentReservation) {
        console.log('→ Mode GUEST (invité présent)');
        showGuestMode();
    } else if (nextReservation) {
        console.log('→ Mode COUNTDOWN (prochains invités)');
        showCountdownMode();
    } else {
        console.log('→ Mode GUEST par défaut (aucune réservation)');
        showGuestMode();
    }
}

function showGuestMode() {
    currentMode = 'guest';
    
    const countdownView = document.getElementById('countdownView');
    if (countdownView.classList.contains('active')) {
        countdownView.classList.remove('active');
    }
    
    setTimeout(() => {
        const guestView = document.getElementById('guestView');
        guestView.style.display = 'grid';
        void guestView.offsetWidth;
        guestView.classList.add('active');
    }, currentMode === 'countdown' ? 500 : 0);
    
    const guestName = currentReservation ? currentReservation.guestName : 'Bienvenue';
    console.log('💁 Affichage du nom:', guestName);
    document.getElementById('guestName').textContent = guestName;
    
    updateCurrentTime();
    
    if (currentReservation) {
        const checkoutDate = formatDate(currentReservation.endDate, currentLanguage);
        const checkoutTime = currentReservation.checkoutHour ? 
            formatHour(currentReservation.checkoutHour) : CONFIG.property.checkoutTime;
        document.getElementById('checkoutTime').textContent = `${checkoutDate} ${checkoutTime}`;
    } else {
        document.getElementById('checkoutTime').textContent = CONFIG.property.checkoutTime;
    }
    
    document.getElementById('rulesText').textContent = CONFIG.rules.join(' • ');
    displayActivities();
    
    const t = CONFIG.translations[currentLanguage];
    document.querySelector('.welcome-label').textContent = t.welcome;
    document.querySelector('.checkout-details').textContent = t.checkout;
    document.querySelector('.weather-sidebar h3').textContent = t.weather;
    document.querySelector('.section-title').textContent = t.activities;
}

function showCountdownMode() {
    currentMode = 'countdown';
    
    const guestView = document.getElementById('guestView');
    if (guestView.classList.contains('active')) {
        guestView.classList.remove('active');
    }
    
    setTimeout(() => {
        guestView.style.display = 'none';
        
        const countdownView = document.getElementById('countdownView');
        countdownView.classList.add('active');
    }, guestView.classList.contains('active') ? 500 : 0);
    
    if (nextReservation) {
        document.getElementById('nextGuestName').textContent = nextReservation.guestName;
        document.getElementById('nextGuestCount').textContent = `👥 ${nextReservation.guestCount} ${CONFIG.translations[currentLanguage].people}`;
        
        updateCountdown();
        setInterval(updateCountdown, 60000);
    }
}

function displayActivities() {
    const grid = document.getElementById('activityGrid');
    grid.innerHTML = '';
    
    // Afficher les 4 premières activités
    activities.slice(0, 4).forEach(activity => {
        const card = document.createElement('div');
        card.className = 'activity-card-modern';
        
        let eventDate = '';
        if (!activity.isPermanent && activity.startDate && activity.endDate) {
            const startDay = activity.startDate.getDate();
            const endDay = activity.endDate.getDate();
            const month = activity.startDate.toLocaleDateString('fr-FR', { month: 'long' });
            
            eventDate = `<div class="event-date">du ${startDay} au ${endDay} ${month}</div>`;
        }
        
        const details = [];
        if (activity.description) details.push(activity.description);
        if (activity.distance) details.push(activity.distance);
        if (activity.hours) details.push(activity.hours);
        
        card.innerHTML = `
            <div class="activity-header">
                <div class="activity-icon-modern">${activity.icon}</div>
                <div class="activity-title">${activity.name}</div>
            </div>
            ${eventDate}
            <div class="activity-description">
                ${details.join(' • ')}
            </div>
        `;
        
        grid.appendChild(card);
    });
    
    // Mémoriser les 4 activités visibles (indices 0..3) pour éviter les doublons ensuite
    visibleActivityIndices = activities.slice(0, 4).map((_, i) => i);

    // Démarrer la rotation Option 4 si plus de 4 activités
    if (activities.length > 4) {
        startActivityRotation();
    }
}

// ==================== OPTION 4 : SHUFFLE ALÉATOIRE - PRODUCTION ====================

let activityRotationIndex = 4;
let activityRotationInterval = null;

// Suivi des activités actuellement affichées par carte (0..3)
let visibleActivityIndices = [];

// ⚙️ CONFIGURATION DE LA ROTATION
// Pour changer la vitesse ou le nombre de tuiles, modifiez ces valeurs :
const ROTATION_SPEED = 10000;     // Vitesse en millisecondes (5000 = 5 secondes)
const CARDS_TO_CHANGE = 1;       // Nombre de tuiles qui changent (2 = deux tuiles aléatoires)
const FADE_DURATION = 500;       // Durée du fade in/out (500 = 0.5 seconde)

// Renvoie le prochain index d’activité non présent dans 'excluded'
function getNextAvailableIndex(excluded) {
    if (!activities || activities.length === 0) return -1;
    let tries = 0;
    while (tries < activities.length) {
        activityRotationIndex = activityRotationIndex % activities.length;
        const candidate = activityRotationIndex;
        activityRotationIndex++;
        if (!excluded.has(candidate)) return candidate;
        tries++;
    }
    return -1; // pas de candidat sans doublon
}

function startActivityRotation() {
    // Arrêter l'intervalle précédent s'il existe
    if (activityRotationInterval) {
        clearInterval(activityRotationInterval);
    }
    
    console.log(`🎲 Option 4 activée : ${CARDS_TO_CHANGE} tuiles changent toutes les ${ROTATION_SPEED / 1000} secondes`);
    
    activityRotationInterval = setInterval(() => {
        const cards = document.querySelectorAll('.activity-card-modern');
        
        if (cards.length >= 4 && activities.length > 4) {
            // ÉTAPE 1 : Choisir N positions aléatoires
            const positions = [0, 1, 2, 3];
            const randomPositions = [];
            
            for (let i = 0; i < CARDS_TO_CHANGE; i++) {
                const randIndex = Math.floor(Math.random() * positions.length);
                randomPositions.push(positions[randIndex]);
                positions.splice(randIndex, 1);
            }
            
            console.log(`  🎯 Changement positions: ${randomPositions.join(', ')}`);
            
            // ÉTAPE 2 : Fade out des tuiles choisies
            randomPositions.forEach(pos => {
                cards[pos].style.transition = `all ${FADE_DURATION}ms ease`;
                cards[pos].style.opacity = '0';
                cards[pos].style.transform = 'scale(0.95)';
            });
            
            // ÉTAPE 3 : Changer le contenu après le fade out en évitant les doublons
            setTimeout(() => {
                // Ensemble des indices visibles actuels + ceux choisis pendant ce tour
                const chosenThisRound = new Set();
                const currentlyVisible = new Set(visibleActivityIndices);

                randomPositions.forEach(pos => {
                    // Exclure ce qui est déjà visible + déjà choisi dans ce cycle
                    const excluded = new Set([...currentlyVisible, ...chosenThisRound]);

                    // Chercher une activité non visible et non déjà choisie ce tour
                    let nextIdx = getNextAvailableIndex(excluded);

                    // Cas limite : pas assez d'activités uniques
                    // Autoriser un fallback différent de l'activité déjà sur cette tuile
                    if (nextIdx === -1) {
                        const fallbackExcluded = new Set([visibleActivityIndices[pos]]);
                        nextIdx = getNextAvailableIndex(fallbackExcluded);
                        if (nextIdx === -1) {
                            // Rien de propre à faire, on ré-affiche l’ancienne tuile
                            cards[pos].style.opacity = '1';
                            cards[pos].style.transform = 'scale(1)';
                            return;
                        }
                    }

                    const activity = activities[nextIdx];

                    // Date de l'événement
                    let eventDate = '';
                    if (!activity.isPermanent && activity.startDate && activity.endDate) {
                        const startDay = activity.startDate.getDate();
                        const endDay = activity.endDate.getDate();
                        const month = activity.startDate.toLocaleDateString('fr-FR', { month: 'long' });
                        eventDate = `<div class="event-date">du ${startDay} au ${endDay} ${month}</div>`;
                    }

                    const details = [];
                    if (activity.description) details.push(activity.description);
                    if (activity.distance) details.push(activity.distance);
                    if (activity.hours) details.push(activity.hours);

                    // Mettre à jour le contenu
                    cards[pos].innerHTML = `
                        <div class="activity-header">
                            <div class="activity-icon-modern">${activity.icon}</div>
                            <div class="activity-title">${activity.name}</div>
                        </div>
                        ${eventDate}
                        <div class="activity-description">
                            ${details.join(' • ')}
                        </div>
                    `;

                    // Fade in
                    cards[pos].style.opacity = '1';
                    cards[pos].style.transform = 'scale(1)';

                    // Mettre à jour les ensembles d’état
                    chosenThisRound.add(nextIdx);
                    currentlyVisible.delete(visibleActivityIndices[pos]); // l'ancienne activité à cette position n'est plus visible
                    currentlyVisible.add(nextIdx);                       // la nouvelle devient visible
                    visibleActivityIndices[pos] = nextIdx;               // mémoriser le mapping position -> activité
                });
            }, FADE_DURATION);
        }
    }, ROTATION_SPEED);
}

// ==================== FIN OPTION 4 ====================

function updateCountdown() {
    if (!nextReservation) return;
    
    const now = new Date();
    let target = new Date(nextReservation.startDate);
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (target.getTime() === today.getTime() && nextReservation.checkinHour) {
        const hours = Math.floor(nextReservation.checkinHour);
        const minutes = Math.round((nextReservation.checkinHour - hours) * 60);
        target.setHours(hours, minutes, 0, 0);
    }
    
    const diff = target - now;
    
    if (diff <= 0) {
        loadData();
        return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
}

// ==================== HEURE ====================

function updateTime() {
    const now = new Date();
    
    document.getElementById('fullDate').textContent = now.toLocaleDateString('fr-FR', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    
    updateCurrentTime();
}

function updateCurrentTime() {
    const now = new Date();
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    const currentDateTimeElem = document.getElementById('currentDateTime');
    if (currentDateTimeElem) {
        currentDateTimeElem.textContent = now.toLocaleTimeString('fr-FR', timeOptions);
    }
}

// ==================== UTILITAIRES ====================

function parseDate(dateString) {
    if (dateString instanceof Date) return dateString;
    
    const str = String(dateString);
    
    if (str.includes('Date(')) {
        const match = str.match(/Date\((\d+),(\d+),(\d+)\)/);
        if (match) {
            return new Date(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
        }
    }
    
    if (!isNaN(dateString) && typeof dateString === 'number') {
        return new Date((dateString - 25569) * 86400 * 1000);
    }
    
    if (str.includes('/')) {
        const parts = str.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1;
            const year = parseInt(parts[2]);
            if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year > 2000) {
                return new Date(year, month, day);
            }
        }
    }
    
    if (str.includes('-')) {
        return new Date(str);
    }
    
    return new Date(str);
}

function formatDate(date, lang = 'fr') {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', options);
}

function formatHour(decimalHour) {
    const hours = Math.floor(decimalHour);
    const minutes = Math.round((decimalHour - hours) * 60);
    return `${hours}:${String(minutes).padStart(2, '0')}`;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showError(message) {
    console.error(message);
    document.getElementById('guestName').textContent = 'Erreur';
    document.getElementById('guestName').classList.add('error');
}

window.toggleMode = function() {
    if (currentMode === 'guest' && nextReservation) {
        showCountdownMode();
    } else {
        showGuestMode();
    }
};

window.addEventListener('error', (e) => console.error('Erreur globale:', e.error));
window.addEventListener('unhandledrejection', (e) => console.error('Promise rejetée:', e.reason));
