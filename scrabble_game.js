// scrabble_game.js (Mise à jour pour le Drag and Drop)

let correctWord = null;

// Fonction pour mélanger un tableau (utile si vous voulez générer le mélange aléatoirement)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Fonction pour créer une tuile
function createTile(letter) {
    const tile = document.createElement('span');
    tile.className = 'tile';
    tile.textContent = letter;
    tile.draggable = true; // Rendre l'élément déplaçable

    // Ajouter les écouteurs d'événements pour le Drag-and-Drop
    tile.addEventListener('dragstart', handleDragStart);
    tile.addEventListener('dragover', handleDragOver);
    tile.addEventListener('dragleave', handleDragLeave);
    tile.addEventListener('drop', handleDrop);
    tile.addEventListener('dragend', handleDragEnd);

    return tile;
}


// ===============================================
// LOGIQUE DRAG-AND-DROP (Glisser-Déposer)
// ===============================================

let draggedItem = null;

function handleDragStart(e) {
    draggedItem = this;
    // Ajoute une classe pour l'effet visuel
    setTimeout(() => this.classList.add('dragging'), 0);
    // Définit les données qui seront transférées (ici juste le texte)
    e.dataTransfer.setData('text/plain', e.target.textContent);
}

function handleDragOver(e) {
    // ESSENTIEL : Empêche le comportement par défaut (qui interdit le drop)
    e.preventDefault();
    // Indique visuellement où l'élément sera inséré
    if (this !== draggedItem) {
        this.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');

    // Si l'élément déplacé n'est pas l'élément sur lequel on dépose
    if (this !== draggedItem) {
        const container = this.parentNode;

        // Trouver la position de l'élément sur lequel on dépose
        const targetIndex = Array.from(container.children).indexOf(this);

        // Déterminer où insérer l'élément déplacé (avant ou après la cible)
        const rect = this.getBoundingClientRect();
        const mouseX = e.clientX;

        if (mouseX < rect.left + rect.width / 2) {
            // Déposer à gauche de l'élément cible
            container.insertBefore(draggedItem, this);
        } else {
            // Déposer à droite de l'élément cible
            container.insertBefore(draggedItem, this.nextSibling);
        }
    }
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    const allTiles = document.querySelectorAll('.tile');
    allTiles.forEach(tile => tile.classList.remove('drag-over'));
    draggedItem = null;
}

// ===============================================
// LOGIQUE DU JEU
// ===============================================

function initGame(word, mixedLetters) {
    correctWord = word.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Gère les accents !
    const mixedLettersDiv = document.getElementById('mixed-letters');

    if (!mixedLettersDiv) {
        console.error("Element #mixed-letters not found!");
        return;
    }

    mixedLettersDiv.innerHTML = '';

    // Créer les tuiles déplaçables
    mixedLetters.toUpperCase().split('').forEach(letter => {
        const tile = createTile(letter);
        mixedLettersDiv.appendChild(tile);
    });

    // Assurer que le conteneur est une zone de dépôt même quand il est vide (ou presque)
    mixedLettersDiv.addEventListener('dragover', (e) => e.preventDefault());

    document.getElementById('feedback-message').textContent = '';
    document.getElementById('daily-surprise').style.display = 'none';
}

function checkWord() {
    const mixedLettersDiv = document.getElementById('mixed-letters');
    const feedback = document.getElementById('feedback-message');
    const tiles = mixedLettersDiv.querySelectorAll('.tile');

    if (!correctWord) {
        console.error("Le jeu n'est pas initialisé.");
        return;
    }

    // 1. Reconstituer le mot à partir de l'ordre actuel des tuiles
    let submittedWord = '';
    tiles.forEach(tile => {
        // Normaliser aussi les lettres des tuiles pour enlever les accents dans la vérification
        submittedWord += tile.textContent.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    });

    // 2. Vérification
    if (submittedWord === correctWord) {
        // Afficher la surprise
        document.getElementById('daily-surprise').style.display = 'block';

        // Désactiver le jeu
        document.querySelector('button').disabled = true;
        tiles.forEach(tile => tile.draggable = false); // Les tuiles ne sont plus déplaçables

    } else {
        feedback.textContent = 'Essayes encore ! 🤔';
        feedback.style.color = 'red';
    }
}