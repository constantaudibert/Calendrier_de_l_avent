// Fonction principale pour initialiser le calendrier
function initializeCalendar() {
    const today = new Date();
    // getMonth() retourne 0 pour Janvier, donc 11 pour Décembre (12)
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    // SIMULATION POUR TEST (Désactivé)
    // const currentMonth = 12;
    // const currentDay = 24;

    const pageAttente = document.getElementById('page-attente');
    const calendrier = document.getElementById('calendrier');

    // Si nous ne sommes pas en Décembre, ou si nous sommes en Décembre mais avant le jour 1
    if (currentMonth !== 12 || currentDay < 1) {
        // Afficher la page d'attente
        pageAttente.style.display = 'flex'; // Utiliser flex pour centrer le contenu
        calendrier.style.display = 'none';

    } else {
        // Nous sommes en Décembre. Afficher le calendrier
        pageAttente.style.display = 'none';
        calendrier.style.display = 'grid';

        // Parcourir les 24 jours du calendrier
        let allUnlocked = true; // Pour vérifier si tout est débloqué

        for (let i = 1; i <= 24; i++) {
            const dayDoor = document.getElementById(`door-${i}`);

            if (dayDoor) {
                // Vérifier si la case doit être accessible (Jour J ou antérieur)
                if (i <= currentDay) {
                    dayDoor.classList.add('unlocked');
                    dayDoor.classList.remove('locked');

                    // Rendre la case cliquable pour charger le contenu
                    dayDoor.onclick = function () {
                        loadContent(i);
                    };

                } else {
                    allUnlocked = false; // Il reste des cases verrouillées
                    // La case est verrouillée (pas encore le jour J)
                    dayDoor.classList.add('locked');
                    dayDoor.classList.remove('unlocked');

                    // Rendre la case non cliquable et afficher un message d'attente
                    dayDoor.onclick = function () {
                        alert("Pas encore le jour J ! Il faut patienter jusqu'au " + i + " décembre.");
                    };
                }
            }
        }

        // GESTION DE L'ÉTOILE FINALE
        // Visible uniquement si on est le 24 ou plus (donc toutes les cases sont débloquables)
        const starFinal = document.getElementById('star-final');
        if (currentDay >= 24) {
            starFinal.style.display = 'block';
            starFinal.onclick = function () {
                alert("Joyeux Noël ! 🎄⭐");
            };
        } else {
            starFinal.style.display = 'none';
        }
    }
}


// Fonction pour charger et afficher le contenu de la surprise du jour
function loadContent(day) {
    // Utiliser fetch pour charger le contenu HTML du fichier correspondant
    fetch(`content/${day}.html`)
        .then(response => {
            if (!response.ok) {
                // Si le fichier n'existe pas, donner un message par défaut
                throw new Error('Fichier de contenu introuvable pour le jour ' + day);
            }
            return response.text();
        })
        .then(htmlContent => {
            // Insérer le contenu chargé dans la modale
            const popupContent = document.getElementById('popup-content');
            popupContent.innerHTML = htmlContent;

            // Afficher la modale
            document.getElementById('popup').style.display = 'block';

            // IMPORTANT : Exécuter les scripts contenus dans le HTML chargé
            // Utilisation de Regex pour extraire le contenu des balises <script>
            // car innerHTML peut parfois ne pas inclure les balises script dans le DOM
            const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
            let match;
            while ((match = scriptRegex.exec(htmlContent)) !== null) {
                const scriptCode = match[1];
                const scriptElement = document.createElement("script");
                scriptElement.textContent = scriptCode;
                document.body.appendChild(scriptElement);
                // Nettoyage après exécution
                setTimeout(() => document.body.removeChild(scriptElement), 100);
            }
        })
        .catch(error => {
            console.error('Erreur de chargement du contenu:', error);
            document.getElementById('popup-content').innerHTML = `
                <h2>Jour ${day} : Surprise non prête !</h2>
                <p>Oups, la surprise pour ce jour n'a pas encore été préparée. Revenez plus tard !</p>
            `;
            document.getElementById('popup').style.display = 'block';
        });
}

// Lancer l'initialisation du calendrier au chargement de la page
document.addEventListener('DOMContentLoaded', initializeCalendar);