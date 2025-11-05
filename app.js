// Application principale pour St-Jo'Studio Display
// VERSION AMÉLIORÉE avec gestion de l'heure de checkout

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

function parseCheckoutTime(timeString) {
    // Parse "11:00 AM" ou "11:00" et retourne l'heure en format 24h
    const match = timeString.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return 11; // Par défaut 11h00
    
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
        
        // Google Sheets retourne du JSONP, on doit extraire le JSON
        const json = JSON.parse(text.substring(47).slice(0, -2));
        
        const rows = json.table.rows;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Minuit aujourd'hui
        const currentHour = now.getHours() + (now.getMinutes() / 60); // Heure actuelle en décimal
        
        console.log('Date du jour (minuit):', today.toLocaleDateString('fr-FR'));
        console.log('Heure actuelle:', now.toLocaleTimeString('fr-FR'));
        console.log('Heure décimale:', currentHour.toFixed(2));
        
        // Parser l'heure de checkout depuis config
        const checkoutHour = parseCheckoutTime(CONFIG.property.checkoutTime);
        console.log('Heure de checkout configurée:', CONFIG.property.checkoutTime, '→', checkoutHour.toFixed(2));
        
        currentReservation = null;
        nextReservation = null;
        
        rows.forEach((row, index) => {
            if (!row.c[0] || !row.c[1]) return; // Ignorer les lignes vides
            
            // Les colonnes sont : Checkin, Checkout, Name, Nb personnes, Langue, Statut
            const startDate = parseFrenchDate(row.c[0].f || row.c[0].v);
            const endDate = parseFrenchDate(row.c[1].f || row.c[1].v);
            const guestName = row.c[2]?.v || 'Invité';
            const guestCount = row.c[3]?.v || 1;
            const language = row.c[4]?.v?.toLowerCase() || CONFIG.defaultLanguage;
            const status = row.c[5]?.v || 'Confirmé';
            
            console.log(`\n--- Réservation ligne ${index + 2} ---`);
            console.log('  Nom:', guestName);
            console.log('  Check-in:', startDate.toLocaleDateString('fr-FR'));
            console.log('  Check-out:', endDate.toLocaleDateString('fr-FR'));
            console.log('  Statut:', status);
            
            // ========================================
            // LOGIQUE AMÉLIORÉE DE DÉTECTION
            // ========================================
            
            const isConfirmed = status.toLowerCase() === 'confirmé';
            
            // 1. L'invité est-il arrivé ? (startDate <= aujourd'hui)
            const hasArrived = startDate <= today;
            
            // 2. L'invité est-il encore là ?
            // - Si endDate > aujourd'hui → OUI (part demain ou plus tard)
            // - Si endDate = aujourd'hui → Dépend de l'heure
            //   * Si heure actuelle < heure checkout → OUI (encore là)
            //   * Si heure actuelle >= heure checkout → NON (déjà parti)
            const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
            
            let isStillPresent = false;
            if (endDateOnly > today) {
                // Part demain ou plus tard
                isStillPresent = true;
                console.log('  → Part après aujourd\'hui: OUI, encore présent');
            } else if (endDateOnly.getTime() === today.getTime()) {
                // Part aujourd'hui - vérifier l'heure
                if (currentHour < checkoutHour) {
                    isStillPresent = true;
                    console.log(`  → Part aujourd'hui, mais avant checkout (${currentHour.toFixed(2)} < ${checkoutHour}): OUI, encore présent`);
                } else {
                    isStillPresent = false;
                    console.log(`  → Part aujourd'hui, après checkout (${currentHour.toFixed(2)} >= ${checkoutHour}): NON, déjà parti`);
                }
            } else {
                // Parti hier ou avant
                isStillPresent = false;
                console.log('  → Parti avant aujourd\'hui: NON');
            }
            
            // Réservation EN COURS : arrivé + encore présent + confirmé
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
            
            // Prochaine réservation : arrive dans le futur + confirmé
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
            
            // CAS SPÉCIAL : Arrive aujourd'hui mais pas encore checkin
            // Si startDate = aujourd'hui ET heure < checkin (15h par exemple)
            // On pourrait considérer que c'est encore une "prochaine réservation"
            // Mais pour simplifier, on considère qu'à partir de minuit, l'invité "arrive aujourd'hui"
        });
        
        console.log('\n========================================');
        console.log('📊 RÉSULTAT FINAL:');
        console.log('Réservation actuelle:', currentReservation);
        console.log('Prochaine réservation:', nextReservation);
        console.log('Mode qui sera affiché:', currentReservation ? 'GUEST' : (nextReservation ? 'COUNTDOWN' : 'GUEST par défaut'));
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
        
        if (!response.ok) {
            throw new Error('Onglet Activites non trouvé');
        }
        
        const text = await response.text();
        const json = JSON.parse(text.substring(47).slice(0, -2));
        
        const rows = json.table.rows;
        activities = [];
        
        rows.forEach(row => {
            if (!row.c[1]) return;
            
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
    console.log('\n🖥️  Mise à jour de l'affichage...');
    console.log('currentReservation:', currentReservation);
    console.log('nextReservation:', nextReservation);
    
    // Déterminer le mode (invité présent ou countdown)
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
    document.getElementById('guestView').style.display = 'grid';
    document.getElementById('countdownView').classList.remove('active');
    
    // Nom de l'invité
    const guestName = currentReservation ? currentReservation.guestName : 'Bienvenue';
    document.getElementById('guestName').textContent = guestName;
    
    // Date de check-out
    if (currentReservation) {
        const checkoutDate = formatDate(currentReservation.endDate, currentLanguage);
        document.getElementById('checkoutTime').textContent = `${checkoutDate} ${CONFIG.property.checkoutTime}`;
    } else {
        document.getElementById('checkoutTime').textContent = CONFIG.property.checkoutTime;
    }
    
    // Règles
    const rulesText = CONFIG.rules.join(' • ');
    document.getElementById('rulesText').textContent = rulesText;
    
    // Activités
    displayActivities();
    
    // Traductions
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
        
        // Calculer et afficher le countdown
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

function parseFrenchDate(dateString) {
    if (dateString instanceof Date) {
        return dateString;
    }
    
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
    
    return new Date(dateString);
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
