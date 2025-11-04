// Application principale pour St-Jo'Studio Display

let currentMode = 'guest';
let currentReservation = null;
let nextReservation = null;
let activities = [];
let currentLanguage = CONFIG.defaultLanguage;

// ==================== INITIALISATION ====================

document.addEventListener('DOMContentLoaded', () => {
    console.log('St-Jo\'Studio Display - Initialisation...');
    
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

    // Mettre à jour l'affichage
    updateDisplay();
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

async function loadReservations() {
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.googleSheetId}/gviz/tq?tqx=out:json&sheet=Reservations`;
    
    try {
        const response = await fetch(url);
        const text = await response.text();
        
        // Google Sheets retourne du JSONP, on doit extraire le JSON
        const json = JSON.parse(text.substring(47).slice(0, -2));
        
        const rows = json.table.rows;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        console.log('Date du jour (today):', today);
        
        currentReservation = null;
        nextReservation = null;
        
        rows.forEach((row, index) => {
            if (!row.c[0] || !row.c[1]) return; // Ignorer les lignes vides
            
            console.log(`--- Ligne ${index + 2} du Google Sheet ---`);
            console.log('Valeur brute startDate:', row.c[0].v);
            console.log('Valeur brute endDate:', row.c[1].v);
            
            const startDate = parseDate(row.c[0].v);
            const endDate = parseDate(row.c[1].v);
            const guestName = row.c[2]?.v || 'Invité';
            const guestCount = row.c[3]?.v || 1;
            const language = row.c[4]?.v?.toLowerCase() || CONFIG.defaultLanguage;
            const status = row.c[5]?.v || 'Confirmé';
            
            console.log('Après parsing - startDate:', startDate);
            console.log('Après parsing - endDate:', endDate);
            console.log('Guest:', guestName, '| Status:', status);
            console.log('Comparaison: startDate <= today ?', startDate <= today);
            console.log('Comparaison: endDate >= today ?', endDate >= today);
            console.log('Comparaison: status confirmé ?', status.toLowerCase() === 'confirmé');
            
            // Réservation en cours
            if (startDate <= today && endDate >= today && status.toLowerCase() === 'confirmé') {
                console.log('✅ RÉSERVATION EN COURS TROUVÉE:', guestName);
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
            if (startDate > today && status.toLowerCase() === 'confirmé') {
                if (!nextReservation || startDate < nextReservation.startDate) {
                    console.log('✅ PROCHAINE RÉSERVATION TROUVÉE:', guestName);
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
        });
        
        console.log('=== RÉSULTAT FINAL ===');
        console.log('Réservation actuelle:', currentReservation);
        console.log('Prochaine réservation:', nextReservation);
        
    } catch (error) {
        console.error('Erreur chargement réservations:', error);
        throw error;
    }
}

async function loadActivities() {
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.googleSheetId}/gviz/tq?tqx=out:json&sheet=Activites`;
    
    try {
        const response = await fetch(url);
        
        // Vérifier si la réponse est OK
        if (!response.ok) {
            throw new Error('Onglet Activites non trouvé');
        }
        
        const text = await response.text();
        const json = JSON.parse(text.substring(47).slice(0, -2));
        
        const rows = json.table.rows;
        activities = [];
        
        rows.forEach(row => {
            if (!row.c[1]) return; // Ignorer les lignes vides
            
            const icon = row.c[0]?.v || '🎯';
            const name = row.c[1]?.v || '';
            const description = row.c[2]?.v || '';
            const distance = row.c[3]?.v || '';
            const hours = row.c[4]?.v || '';
            const active = row.c[5]?.v?.toLowerCase() !== 'non';
            
            if (active && name) {
                activities.push({
                    icon,
                    name,
                    description,
                    distance,
                    hours
                });
            }
        });
        
        console.log(`${activities.length} activités chargées depuis Google Sheet`);
        
    } catch (error) {
        console.warn('Onglet Activites non trouvé, utilisation des activités par défaut');
        activities = getDefaultActivities();
    }
}

async function loadConfiguration() {
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.googleSheetId}/gviz/tq?tqx=out:json&sheet=Configuration`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Onglet Configuration non trouvé');
        }
        
        const text = await response.text();
        const json = JSON.parse(text.substring(47).slice(0, -2));
        
        const rows = json.table.rows;
        
        rows.forEach(row => {
            if (!row.c[0] || !row.c[1]) return;
            
            const param = row.c[0].v;
            const value = row.c[1].v;
            
            switch(param.toLowerCase()) {
                case 'nom propriété':
                case 'nom propriete':
                    CONFIG.property.name = value;
                    break;
                case 'ville météo':
                case 'ville meteo':
                    CONFIG.property.city = value;
                    break;
                case 'heure check-out':
                    CONFIG.property.checkoutTime = value;
                    break;
            }
        });
        
        console.log('Configuration personnalisée chargée');
        
    } catch (error) {
        console.warn('Onglet Configuration non trouvé, utilisation config par défaut');
    }
}

function getDefaultActivities() {
    return [
        {
            icon: '🏢',
            name: 'Salon d\'achat 2025 de BMR inc.',
            description: 'Salon BMR',
            distance: '4 km',
            hours: 'Centre des congrès'
        },
        {
            icon: '💪',
            name: 'Physiothérapie 360 édition 2025',
            description: 'Salon des pro de la santé',
            distance: '4.5 km',
            hours: 'En face du Hilton'
        },
        {
            icon: '🐾',
            name: 'Pitou-Minou',
            description: 'Salon au poil',
            distance: '2.3 km',
            hours: 'De 9h à 16h'
        }
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
    if (currentReservation) {
        showGuestMode();
    } else if (nextReservation) {
        showCountdownMode();
    } else {
        showGuestMode();
    }
}

function showGuestMode() {
    currentMode = 'guest';
    document.getElementById('guestView').style.display = 'grid';
    document.getElementById('countdownView').classList.remove('active');
    
    const guestName = currentReservation ? currentReservation.guestName : 'Bienvenue';
    document.getElementById('guestName').textContent = guestName;
    
    if (currentReservation) {
        const checkoutDate = formatDate(currentReservation.endDate, currentLanguage);
        document.getElementById('checkoutTime').textContent = `${checkoutDate} ${CONFIG.property.checkoutTime}`;
    } else {
        document.getElementById('checkoutTime').textContent = CONFIG.property.checkoutTime;
    }
    
    const rulesText = CONFIG.rules.join(' • ');
    document.getElementById('rulesText').textContent = rulesText;
    
    displayActivities();
    
    const t = CONFIG.translations[currentLanguage];
    document.querySelector('.welcome-label').textContent = t.welcome;
    document.querySelector('.checkout-details').textContent = t.checkout;
    document.querySelector('.weather-sidebar h3').textContent = t.weather;
    document.querySelector('.section-title').textContent = t.activities;
}

function showCountdownMode() {
    currentMode = 'countdown';
    document.getElementById('guestView').style.display = 'none';
    document.getElementById('countdownView').classList.add('active');
    
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
    
    if (activities.length > 4) {
        startActivityRotation();
    }
    
    setTimeout(() => {
        startActivityHighlightAnimation();
    }, 1000);
}

let activityRotationIndex = 4;
let activityRotationInterval = null;
let currentHighlightIndex = 0;
let highlightInterval = null;

// ==================== ANIMATION AUTOMATIQUE ACTIVITÉS ====================

function startActivityHighlightAnimation() {
    if (highlightInterval) {
        clearInterval(highlightInterval);
    }
    
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
    if (activityRotationInterval) {
        clearInterval(activityRotationInterval);
    }
    
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
    
    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
}

// ==================== HEURE ====================

function updateTime() {
    const now = new Date();
    const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    document.getElementById('currentDateTime').textContent = now.toLocaleDateString('fr-FR', options);
    document.getElementById('fullDate').textContent = now.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// ==================== UTILITAIRES ====================

function parseDate(dateString) {
    console.log('📅 Parsing date:', dateString, '| Type:', typeof dateString);
    
    if (dateString instanceof Date) {
        console.log('✅ Déjà un objet Date:', dateString);
        return dateString;
    }
    
    const str = String(dateString);
    
    if (str.includes('Date(')) {
        const timestamp = parseInt(str.match(/\d+/)[0]);
        const date = new Date(timestamp);
        console.log('✅ Date from timestamp:', date);
        return date;
    }
    
    if (!isNaN(dateString) && typeof dateString === 'number') {
        const date = new Date((dateString - 25569) * 86400 * 1000);
        console.log('✅ Date from Excel number:', date);
        return date;
    }
    
    if (str.includes('/')) {
        const parts = str.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1;
            const year = parseInt(parts[2]);
            
            if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year > 2000) {
                const date = new Date(year, month, day);
                console.log('✅ Date from DD/MM/YYYY:', date);
                return date;
            }
        }
    }
    
    if (str.includes('-')) {
        const date = new Date(str);
        console.log('✅ Date from ISO:', date);
        return date;
    }
    
    const date = new Date(str);
    console.log('⚠️ Date from default parser:', date);
    return date;
}

function formatDate(date, lang = 'fr') {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', options);
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showError(message) {
    console.error(message);
    document.getElementById('guestName').textContent = 'Erreur';
    document.getElementById('guestName').classList.add('error');
}

// ==================== BASCULEMENT MODE MANUEL ====================

window.toggleMode = function() {
    if (currentMode === 'guest') {
        if (nextReservation) {
            showCountdownMode();
        }
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
