// Fonction principale pour initialiser le calendrier
function initializeCalendar() {
    // -- CONFIGURATION DE DATE --
    // Production (AUTOMATIQUE):
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    // SIMULATION POUR TEST (Désactivé)
    // const currentMonth = 12;
    // const currentDay = 24;

    const pageAttente = document.getElementById('page-attente');
    const calendrier = document.getElementById('calendrier');

    if (currentMonth !== 12) {
        pageAttente.style.display = 'flex';
        calendrier.style.display = 'none';
        return;
    }

    pageAttente.style.display = 'none';
    calendrier.style.display = 'grid';

    // -- ETAT DU JEU --
    const isCorrupted = localStorage.getItem('day24_corrupted') === 'true';
    const isGameFinished = localStorage.getItem('game_finished') === 'true';
    const swordObtained = localStorage.getItem('sword_obtained') === 'true';

    // -- GENERATION DES CASES --
    for (let i = 1; i <= 24; i++) {
        const door = document.getElementById(`door-${i}`);
        if (!door) continue;

        // Reset classes
        door.classList.remove('unlocked', 'locked', 'barred', 'broken-bars');

        if (i <= currentDay) {
            door.classList.add('unlocked');

            // LOGIQUE JOUR 24
            if (i === 24) {
                // Priorité : Game Finished > Corrupted with Sword > Corrupted without Sword > Normal
                if (isGameFinished) {
                    // Jeu fini : accessible (bonus)
                    door.onclick = () => loadContent(24);
                } else if (isCorrupted && swordObtained) {
                    door.classList.add('broken-bars', 'door-24');
                    door.onclick = () => loadContent(24);
                } else if (isCorrupted && !swordObtained) {
                    door.classList.add('barred', 'door-24');
                    door.onclick = (e) => {
                        e.preventDefault(); e.stopPropagation();
                        alert("CETTE CASE EST BARRICADÉE ! IL TE FAUT UNE ARME !");
                    };
                } else {
                    // Normal (avant hack, si accessible)
                    door.onclick = () => loadContent(24);
                }
            }
            // AUTRES CASES
            else {
                if (isCorrupted && !isGameFinished) {
                    door.onclick = (e) => { e.preventDefault(); alert("ERREUR : SYSTÈME PIRATÉ PAR LE GRINCH !"); };
                    door.style.opacity = "0.7";
                } else {
                    door.onclick = () => loadContent(i);
                }
            }

        } else {
            door.classList.add('locked');
            door.onclick = () => alert(`Patience ! Reviens le ${i} décembre.`);
        }
    }

    // -- ETOILE FINALE --
    const starFinal = document.getElementById('star-final');
    if (starFinal) {
        // L'étoile ne s'affiche QUE si le jeu est fini (calendrier sauvé)
        if (isGameFinished) {
            starFinal.style.display = 'block';
            starFinal.style.animation = "clignoter 2s infinite";
            starFinal.onclick = () => alert("JOYEUX NOËL MAMAN ❤️");
        } else {
            starFinal.style.display = 'none';
        }
    }

    // -- THEME GRINCH --
    if (isCorrupted && !isGameFinished) {
        document.body.classList.add('grinch-theme');
        const countdownContainer = document.getElementById('countdown-container');
        if (countdownContainer) {
            countdownContainer.style.display = 'block';
            startTimer();
        }
    } else {
        document.body.classList.remove('grinch-theme');
        const countdownContainer = document.getElementById('countdown-container');
        if (countdownContainer) countdownContainer.style.display = 'none';

        const scientistFooter = document.getElementById('scientist-footer');
        if (scientistFooter) scientistFooter.style.display = 'none';
    }
}

function startTimer() {
    // Target: December 24, 2024 at 23:00:00 (Past date for testing)
    const targetDate = new Date('2024-12-24T23:00:00');

    function update() {
        const now = new Date();
        const diff = targetDate - now;

        const timerElement = document.getElementById('timer');
        const btnElement = document.getElementById('countdown-btn');

        if (!timerElement || !btnElement) return;

        if (diff <= 0) {
            timerElement.innerText = "00:00:00";
            btnElement.querySelector('.text').innerText = "RASSEMBLEMENT !";
            btnElement.style.cursor = "pointer";
            // Style de succès (Blanc/Or inversé ou Vert validé ?)
            btnElement.style.background = "#28a745"; // Vert succès classique
            btnElement.style.borderColor = "#fff";

            // SHOW REINFORCEMENTS
            const renforts = document.getElementById('reinforcements-btn');
            if (renforts) renforts.style.display = 'block';

            // HIDE SCIENTIST
            const scientistFooter = document.getElementById('scientist-footer');
            if (scientistFooter) scientistFooter.style.display = 'none';

            return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const hoursStr = String(hours).padStart(2, '0');
        const minutesStr = String(minutes).padStart(2, '0');
        const secondsStr = String(seconds).padStart(2, '0');

        timerElement.innerText = `${hoursStr}:${minutesStr}:${secondsStr}`;

        requestAnimationFrame(update);
    }
    update();
}

// Fonction globale pour corrompre le jour 24 (appelée depuis jour 23)
window.corruptDay24 = function () {
    localStorage.setItem('day24_corrupted', 'true');
    // No need to manually manipulate DOM here, just reload to let initializeCalendar do the global work
    console.log("Global Corruption Triggered!");
};


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

            // HIDE COUNTDOWN TO PREVENT OVERLAP
            const cdContainer = document.getElementById('countdown-container');
            if (cdContainer) cdContainer.style.display = 'none';

            // IMPORTANT : Exécuter les scripts contenus dans le HTML chargé

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
            console.warn('Fetch failed (likely CORS on file://). Falling back to Iframe.', error);
            const popupContent = document.getElementById('popup-content');
            // Fallback: Use Iframe
            popupContent.innerHTML = `<iframe src="content/${day}.html" style="width:100%; height:600px; border:none; background:transparent;"></iframe>`;
            document.getElementById('popup').style.display = 'block';
        });
}

// Lancer l'initialisation du calendrier au chargement de la page
document.addEventListener('DOMContentLoaded', initializeCalendar);