// Configuration pour St-Jo'Studio
const CONFIG = {
    // Informations de la propriété
    property: {
        name: "St-Jo'Studio",
        city: "Quebec",
        checkoutTime: "11:00 AM"
    },

    // Règles de la maison
    rules: [
        "Vider les poubelles en quittant",
        "Pas de cigarette ou vapoteuse",
        "Mode calme à partir de 21h pour les voisins"
    ],

    // ID de votre Google Sheet
    googleSheetId: "1NHDpR3YXOck6M2UMceHGX-qJPuA01g7JOoPxmAkfCS8",

    // Clé API OpenWeatherMap
    weatherApiKey: "ba383d66b8a4087bb3bc608771e82f55",

    // Langue par défaut si non spécifiée dans la réservation
    defaultLanguage: "fr",

    // Traductions
    translations: {
        fr: {
            welcome: "Bienvenue",
            checkout: "Check-out",
            weather: "Météo",
            activities: "Activités et événements",
            nextGuests: "Prochains voyageurs",
            nextArrival: "Prochaine arrivée",
            people: "personnes",
            days: "Jours",
            hours: "Heures",
            minutes: "Minutes",
            stayInProgress: "Séjour en cours"
        },
        en: {
            welcome: "Welcome",
            checkout: "Check-out",
            weather: "Weather",
            activities: "Activities and events",
            nextGuests: "Next guests",
            nextArrival: "Next arrival",
            people: "people",
            days: "Days",
            hours: "Hours",
            minutes: "Minutes",
            stayInProgress: "Stay in progress"
        },
        es: {
            welcome: "Bienvenido",
            checkout: "Salida",
            weather: "Tiempo",
            activities: "Actividades y eventos",
            nextGuests: "Próximos huéspedes",
            nextArrival: "Próxima llegada",
            people: "personas",
            days: "Días",
            hours: "Horas",
            minutes: "Minutos",
            stayInProgress: "Estancia en curso"
        }
    },

    // Icônes météo
    weatherIcons: {
        "Clear": "☀️",
        "Clouds": "☁️",
        "Rain": "🌧️",
        "Drizzle": "🌦️",
        "Snow": "❄️",
        "Thunderstorm": "⛈️",
        "Mist": "🌫️",
        "Fog": "🌫️",
        "default": "🌤️"
    },

    // Intervalle de rafraîchissement (en millisecondes)
    refreshInterval: {
        data: 300000,      // 5 minutes pour les données (réservations, activités)
        weather: 600000,   // 10 minutes pour la météo
        time: 60000        // 1 minute pour l'heure
    }
};
