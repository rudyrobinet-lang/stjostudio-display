// Application principale pour St-Jo'Studio Display
// VERSION FINALE - Corrigée avec gestion d'erreurs améliorée

let currentMode = 'guest';
let currentReservation = null;
let nextReservation = null;
let activities = [];
let currentLanguage = CONFIG.defaultLanguage;

// ==================== INITIALISATION ====================

document.addEventListener('DOMContentLoaded', () => {
    console.log('St-Jo\'Studio Display - Initialisation...');
    console.log('Heure actuelle:', new Date().toLocaleString('fr-FR'));
    
    // Vérifier la configuration
    if (!validateConfig()) {
        showError('Configuration incomplète. Veuillez vérifier config.js');
        return;
    }

    // Démarrer l'application
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
    // Charger les données initiales
    loadData();
    loadWeather();
    updateTime();

    // Configurer les intervalles de rafraîchissement
    setInterval(loadData, CONFIG.refreshInterval.data);
    setInterval(loadWeather, CONFIG.refreshInterval.weather);
    setInterval(updateTime, CONFIG.refreshInterval.time);
}

// ==================== CHARGEMENT DONNÉES GOOGLE SHEETS ====================

async function loadData() {
    try {
        console.log('Chargement des données depuis Google Sheets...');
        
        // Charger les réservations
        await loadReservations();
        
        // Charger les activités
        await loadActivities();
        
        // Charger la configuration
        await loadConfiguration();
        
        // Mettre à jour l'affichage
        updateDisplay();
        
        console.log('Données chargées avec succès');
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        showError('Erreur de chargement des données');
    }
}

function parseCheckoutTime(timeString) {
    try {
        // Parse "11:00 AM" ou "11:00" et retourne l'heure en format 24h décimal
        const match = timeString.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (!match) {
            console.warn('Format d\'heure invalide, utilisation de 11h00 par défaut');
            return 11;
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
    } catch (error) {
        console.error('Erreur parsing heure checkout:', error);
        return 11; // Défaut 11h00
    }
}

async function loadReservations() {
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.googleSheetId}/gviz/tq?tqx=out:json&sheet=Reservations`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} - Vérifiez que le Google Sheet est public`);
        }
        
        const text = await response.text();
        
        // Vérifier que la réponse contient du JSON
        if (!text.includes('google.visualization.Query.setResponse')) {
            throw new Error('Réponse Google Sheets invalide - vérifiez que l\'onglet "Reservations" existe');
        }
        
        // Google Sheets retourne du JSONP, extraire le JSON
        const json = JSON.parse(text.substring(47).slice(0, -2));
        
        if (!json.table || !json.table.rows) {
            throw new Error('Structure de données invalide');
        }
        
        const rows = json.table.rows;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const currentHour = now.getHours() + (now.getMinutes() / 60);
        
        console.log('Date du jour (minuit):', today.toLocaleDateString('fr-FR'));
        console.log('Heure actuelle:', now.toLocaleTimeString('fr-FR'));
        console.log('Heure décimale:', currentHour.toFixed(2));
        
        // Parser l'heure de checkout
        const checkoutHour = parseCheckoutTime(CONFIG.property.checkoutTime);
        console.log('Heure de checkout configurée:', CONFIG.property.checkoutTime, '→', checkoutHour.toFixed(2));
        
        currentReservation = null;
        nextReservation = null;
        
        rows.forEach((row, index) => {
            try {
                if (!row.c || !row.c[0] || !row.c[1]) {
                    console.log(`Ligne ${index + 2}: ignorée (données manquantes)`);
                    return;
                }
                
                // Colonnes: Checkin, Checkout, Name, Nb personnes, Langue, Statut
                const startDate = parseFrenchDate(row.c[0].f || row.c[0].v);
                const endDate = parseFrenchDate(row.c[1].f || row.c[1].v);
                const guestName = row.c[2]?.v || 'Invité';
                const guestCount = row.c[3]?.v || 1;
                const language = (row.c[4]?.v || CONFIG.defaultLanguage).toLowerCase();
                const status = row.c[5]?.v || 'Confirmé';
                
                // Vérifier que les dates sont valides
                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                    console.warn(`Ligne ${index + 2}: dates invalides, ignorée`);
                    return;
                }
                
                console.log(`\n--- Réservation ligne ${index + 2} ---`);
                console.log('  Nom:', guestName);
                console.log('  Check-in:', startDate.toLocaleDateString('fr-FR'));
                console.log('  Check-out:', endDate.toLocaleDateString('fr-FR'));
                console.log('  Statut:', status);
                
                const isConfirmed = status.toLowerCase() === 'confirmé';
                const hasArrived = startDate <= today;
                const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
                
                let isStillPresent = false;
                
                if (endDateOnly > today) {
                    isStillPresent = true;
                    console.log('  → Part après aujourd\'hui: OUI, encore présent');
                } else if (endDateOnly.getTime() === today.getTime()) {
                    if (currentHour < checkoutHour) {
                        isStillPresent = true;
                        console.log(`  → Part aujourd'hui, avant checkout (${currentHour.toFixed(2)} < ${checkoutHour.toFixed(2)}): OUI, encore présent`);
                    } else {
                        isStillPresent = false;
                        console.log(`  → Part aujourd'hui, après checkout (${currentHour.toFixed(2)} >= ${checkoutHour.toFixed(2)}): NON, déjà parti`);
                    }
                } else {
                    isStillPresent = false;
                    console.log('  → Parti avant aujourd\'hui: NON');
                }
                
                // Réservation EN COURS
                if (hasArrived && isStillPresent && isConfirmed) {
                    console.log('  ✅ RÉSERVATION EN COURS');
                    currentReservation = {
                        startDate,
                        endDate,
                        guestName,
                        guestCount,
                        language,
                        status
                    };
                    currentLanguage = language;
                }
                
                // Prochaine réservation
                if (startDate > today && isConfirmed) {
                    if (!nextReservation || startDate < nextReservation.startDate) {
                        console.log('  🔜 Prochaine réservation');
                        nextReservation = {
                            startDate,
                            endDate,
                            guestName,
                            guestCount,
                            language,
                            status
                        };
                    }
                }
            } catch (rowError) {
                console.error(`Erreur traitement ligne ${index + 2}:`, rowError);
            }
        });
        
        console.log('\n========================================');
        console.log('📊 RÉSULTAT FINAL:');
        console.log('Réservation actuelle:', currentReservation);
        console.log('Prochaine réservation:', nextReservation);
        console.log('Mode qui sera affiché:', currentReservation ? 'GUEST' : (nextReservation ? 'COUNTDOWN' : 'GUEST par défaut'));
        console.log('========================================\n');
        
    } catch (error) {
        console.error('❌ Erreur chargement réservations:', error);
        console.error('URL tentée:', url);
        throw error;
    }
}

async function loadActivities() {
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.googleSheetId}/gviz/tq?tqx=out:json&sheet=Activites`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Onglet Activites non trouvé');
        }
        
        const text = await response.text();
        const json = JSON.parse(text.substring(47).slice(0, -2));
        
        const rows = json.table.rows;
        activities = [];
        
        rows.forEach(row => {
            try {
                if (!row.c || !row.c[1]) return;
                
                const icon = row.c[0]?.v || '🎯';
                const name = row.c[1]?.v || '';
                const description = row.c[2]?.v || '';
                const distance = row.c[3]?.v || '';
                const hours = row.c[4]?.v || '';
                const active = row.c[5]?.v?.toLowerCase() !== 'non';
                
                if (active && name) {
                    activities.push({ icon, name, description, distance, hours });
                }
            } catch (error) {
                console.warn('Erreur traitement activité:', error);
            }
        });
        
        console.log(`${activities.length} activités chargées`);
        
    } catch (error) {
        console.warn('Onglet Activites non trouvé, utilisation des activités par défaut');
        activities = getDefaultActivities();
    }
}

async function loadConfiguration() {
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.googleSheetId}/gviz/tq?tqx=out:json&sheet=Configuration`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Onglet Configuration non trouvé');
        
        const text = await response.text();
        const json = JSON.parse(text.substring(47).slice(0, -2));
        
        json.table.rows.forEach(row => {
            if (!row.c || !row.c[0] || !row.c[1]) return;
            
            const param = row.c[0].v.toLowerCase();
            const value = row.c[1].v;
            
            if (param.includes('nom propri')) CONFIG.property.name = value;
            else if (param.includes('ville m')) CONFIG.property.city = value;
            else if (param.includes('heure check')) CONFIG.property.checkoutTime = value;
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
        console.warn('Météo non disponible - clé API manquante');
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
            console.error('Erreur API météo:', data);
            displayDefaultWeather();
        }
    } catch (error) {
        console.error('Erreur chargement météo:', error);
        displayDefaultWeather();
    }
}

function displayWeather(data) {
    try {
        const temp = Math.round(data.main.temp);
        const condition = data.weather[0].main;
        const description = data.weather[0].description;
        const humidity = data.main.humidity;
        const windSpeed = Math.round(data.wind.speed * 3.6);
        const icon = CONFIG.weatherIcons[condition] || CONFIG.weatherIcons.default;
        
        const weatherIcon = document.getElementById('weatherIcon');
        const temperature = document.getElementById('temperature');
        const weatherDetails = document.getElementById('weatherDetails');
        
        if (weatherIcon) weatherIcon.textContent = icon;
        if (temperature) temperature.textContent = `${temp}°`;
        if (weatherDetails) weatherDetails.innerHTML = `
            ${capitalize(description)}<br>
            💧 Humidité: ${humidity}%<br>
            💨 Vent: ${windSpeed} km/h
        `;
    } catch (error) {
        console.error('Erreur affichage météo:', error);
        displayDefaultWeather();
    }
}

function displayDefaultWeather() {
    const weatherIcon = document.getElementById('weatherIcon');
    const temperature = document.getElementById('temperature');
    const weatherDetails = document.getElementById('weatherDetails');
    
    if (weatherIcon) weatherIcon.textContent = '🌤️';
    if (temperature) temperature.textContent = '--°';
    if (weatherDetails) weatherDetails.textContent = 'Météo non disponible';
}

// ==================== MISE À JOUR AFFICHAGE ====================

function updateDisplay() {
    console.log('\n🖥️  Mise à jour de l'affichage...');
    console.log('currentReservation:', currentReservation);
    console.log('nextReservation:', nextReservation);
    
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
    try {
        currentMode = 'guest';
        
        const guestView = document.getElementById('guestView');
        const countdownView = document.getElementById('countdownView');
        
        if (guestView) guestView.style.display = 'grid';
        if (countdownView) countdownView.classList.remove('active');
        
        // Nom de l'invité
        const guestName = currentReservation ? currentReservation.guestName : 'Bienvenue';
        const guestNameElem = document.getElementById('guestName');
        if (guestNameElem) guestNameElem.textContent = guestName;
        
        // Date de check-out
        const checkoutTimeElem = document.getElementById('checkoutTime');
        if (checkoutTimeElem) {
            if (currentReservation) {
                const checkoutDate = formatDate(currentReservation.endDate, currentLanguage);
                checkoutTimeElem.textContent = `${checkoutDate} ${CONFIG.property.checkoutTime}`;
            } else {
                checkoutTimeElem.textContent = CONFIG.property.checkoutTime;
            }
        }
        
        // Règles
        const rulesTextElem = document.getElementById('rulesText');
        if (rulesTextElem) {
            rulesTextElem.textContent = CONFIG.rules.join(' • ');
        }
        
        // Activités
        displayActivities();
        
        // Traductions
        const t = CONFIG.translations[currentLanguage];
        const welcomeLabel = document.querySelector('.welcome-label');
        const checkoutDetails = document.querySelector('.checkout-details');
        const weatherH3 = document.querySelector('.weather-sidebar h3');
        const sectionTitle = document.querySelector('.section-title');
        
        if (welcomeLabel) welcomeLabel.textContent = t.welcome;
        if (checkoutDetails) checkoutDetails.textContent = t.checkout;
        if (weatherH3) weatherH3.textContent = t.weather;
        if (sectionTitle) sectionTitle.textContent = t.activities;
        
    } catch (error) {
        console.error('Erreur showGuestMode:', error);
    }
}

function showCountdownMode() {
    try {
        currentMode = 'countdown';
        
        const guestView = document.getElementById('guestView');
        const countdownView = document.getElementById('countdownView');
        
        if (guestView) guestView.style.display = 'none';
        if (countdownView) countdownView.classList.add('active');
        
        if (nextReservation) {
            const nextGuestNameElem = document.getElementById('nextGuestName');
            const nextGuestCountElem = document.getElementById('nextGuestCount');
            
            if (nextGuestNameElem) nextGuestNameElem.textContent = nextReservation.guestName;
            if (nextGuestCountElem) {
                nextGuestCountElem.textContent = `👥 ${nextReservation.guestCount} ${CONFIG.translations[currentLanguage].people}`;
            }
            
            updateCountdown();
            setInterval(updateCountdown, 60000);
        }
    } catch (error) {
        console.error('Erreur showCountdownMode:', error);
    }
}

function displayActivities() {
    try {
        const grid = document.getElementById('activityGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        const displayActivities = activities.slice(0, 4);
        
        displayActivities.forEach(activity => {
            const card = document.createElement('div');
            card.className = 'activity-card-modern';
            
            const details = [];
            if (activity.description) details.push(activity.description);
            if (activity.distance) details.push(activity.distance);
            if (activity.hours) details.push(activity.hours);
            
            card.innerHTML = `
                <div class="activity-header">
                    <div class="activity-icon-modern">${activity.icon}</div>
                    <div class="activity-title">${activity.name}</div>
                </div>
                <div class="activity-description">
                    ${details.join(' • ')}
                </div>
            `;
            
            grid.appendChild(card);
        });
        
        if (activities.length > 4) startActivityRotation();
        setTimeout(() => startActivityHighlightAnimation(), 1000);
        
    } catch (error) {
        console.error('Erreur displayActivities:', error);
    }
}

let activityRotationIndex = 4;
let activityRotationInterval = null;
let currentHighlightIndex = 0;
let highlightInterval = null;

function startActivityHighlightAnimation() {
    if (highlightInterval) clearInterval(highlightInterval);
    
    const cards = document.querySelectorAll('.activity-card-modern');
    if (cards.length === 0) return;
    
    currentHighlightIndex = 0;
    
    const highlightCard = () => {
        cards.forEach(card => {
            card.style.transform = 'translateY(0)';
            card.style.borderColor = 'rgba(0, 212, 255, 0.3)';
            card.style.boxShadow = 'none';
        });
        
        if (cards[currentHighlightIndex]) {
            const currentCard = cards[currentHighlightIndex];
            currentCard.style.transform = 'translateY(-5px)';
            currentCard.style.borderColor = '#00d4ff';
            currentCard.style.boxShadow = '0 10px 40px rgba(0, 212, 255, 0.3)';
        }
        
        currentHighlightIndex = (currentHighlightIndex + 1) % cards.length;
    };
    
    highlightCard();
    highlightInterval = setInterval(highlightCard, 3000);
}

function startActivityRotation() {
    if (activityRotationInterval) clearInterval(activityRotationInterval);
    
    activityRotationInterval = setInterval(() => {
        const cards = document.querySelectorAll('.activity-card-modern');
        if (cards.length >= 4 && activities.length > 4) {
            const lastCard = cards[3];
            lastCard.style.opacity = '0';
            
            setTimeout(() => {
                activityRotationIndex = activityRotationIndex % activities.length;
                const activity = activities[activityRotationIndex];
                
                const details = [];
                if (activity.description) details.push(activity.description);
                if (activity.distance) details.push(activity.distance);
                if (activity.hours) details.push(activity.hours);
                
                lastCard.innerHTML = `
                    <div class="activity-header">
                        <div class="activity-icon-modern">${activity.icon}</div>
                        <div class="activity-title">${activity.name}</div>
                    </div>
                    <div class="activity-description">
                        ${details.join(' • ')}
                    </div>
                `;
                
                lastCard.style.opacity = '1';
                activityRotationIndex++;
            }, 500);
        }
    }, 8000);
}

function updateCountdown() {
    if (!nextReservation) return;
    
    try {
        const now = new Date();
        const target = new Date(nextReservation.startDate);
        const diff = target - now;
        
        if (diff <= 0) {
            loadData();
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        const daysElem = document.getElementById('days');
        const hoursElem = document.getElementById('hours');
        const minutesElem = document.getElementById('minutes');
        
        if (daysElem) daysElem.textContent = String(days).padStart(2, '0');
        if (hoursElem) hoursElem.textContent = String(hours).padStart(2, '0');
        if (minutesElem) minutesElem.textContent = String(minutes).padStart(2, '0');
        
    } catch (error) {
        console.error('Erreur updateCountdown:', error);
    }
}

// ==================== HEURE ====================

function updateTime() {
    try {
        const now = new Date();
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        
        const currentDateTime = document.getElementById('currentDateTime');
        const fullDate = document.getElementById('fullDate');
        
        if (currentDateTime) {
            currentDateTime.textContent = now.toLocaleDateString('fr-FR', options);
        }
        if (fullDate) {
            fullDate.textContent = now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        }
    } catch (error) {
        console.error('Erreur updateTime:', error);
    }
}

// ==================== UTILITAIRES ====================

function parseFrenchDate(dateString) {
    try {
        if (dateString instanceof Date) return dateString;
        
        // Format Google Sheets Date()
        if (typeof dateString === 'string' && dateString.includes('Date(')) {
            const match = dateString.match(/Date\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (match) {
                return new Date(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
            }
        }
        
        // Format JJ/MM/AAAA
        if (typeof dateString === 'string' && dateString.includes('/')) {
            const parts = dateString.split('/');
            if (parts.length === 3) {
                const day = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1;
                const year = parseInt(parts[2]);
                return new Date(year, month, day);
            }
        }
        
        // Fallback
        return new Date(dateString);
    } catch (error) {
        console.error('Erreur parseFrenchDate:', error, dateString);
        return new Date();
    }
}

function formatDate(date, lang = 'fr') {
    try {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', options);
    } catch (error) {
        console.error('Erreur formatDate:', error);
        return date.toLocaleDateString();
    }
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showError(message) {
    console.error(message);
    const guestNameElem = document.getElementById('guestName');
    if (guestNameElem) {
        guestNameElem.textContent = 'Erreur';
        guestNameElem.classList.add('error');
    }
}

// ==================== BASCULEMENT MODE MANUEL ====================

window.toggleMode = function() {
    if (currentMode === 'guest' && nextReservation) {
        showCountdownMode();
    } else {
        showGuestMode();
    }
};

// ==================== GESTION ERREURS ====================

window.addEventListener('error', (e) => {
    console.error('Erreur globale:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promise rejetée:', e.reason);
});
