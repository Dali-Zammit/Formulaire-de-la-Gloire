// ============================================
// NIRD TERMINAL - V6.0 (Secure Transmission Protocol) - Version Fusionnée
// ============================================

// ============================================
// VARIABLES GLOBALES & CONFIGURATION UX
// ============================================
const terminalInput = document.getElementById('terminal-input');
const output = document.getElementById('terminal-output');
const wrapper = document.getElementById('main-wrapper'); 
const inputPrompt = document.getElementById('input-prompt'); 
const modalSuccess = document.getElementById('modal-success'); 
const modalContent = document.querySelector('#modal-success .modal-content');
// La barre de progression dans la modale
const finalProgressBarFill = document.querySelector('.progress-bar-final .fill');


// Configuration Audio (Essentiel pour le son)
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
let soundEnabled = true;
let volume = 0.5;

// Historique
let commandHistory = [];
let historyIndex = -1;

// Formulaire
let formMode = false;
let formStep = 0;
let formData = { name: '', email: '', subject: '', message: '' };
const steps = ['name', 'email', 'subject', 'message'];
const labels = ['NOM DE L\'OPÉRATEUR/ÉQUIPE', 'CONTACT MAIL CHIFFRÉ', 'OBJET DE LA MISSION', 'CONTENU DU MANIFESTE'];

// Easter Eggs
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiProgress = 0;
const BUFFER_LIMIT = 50; // Seuil de caractères pour le Buffer Overflow

// Fonction utilitaire pour le délai
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// FONCTIONS AUDIO & VISUELLES (Animations)
// ============================================
function playSound(freq, type, duration, gainValue) {
    if (!soundEnabled || audioContext.state === 'suspended') return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = freq;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(volume * gainValue, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function playKeySound() {
    playSound(700 + Math.random() * 300, 'square', 0.03, 0.15); 
}

function playSubmitSound() {
    playSound(450, 'sawtooth', 0.1, 0.5); 
}

function playErrorSound() {
    playSound(150, 'square', 0.1, 0.8);
    triggerShake(); // Ajout de l'effet de secousse
}

function playSuccessSound() {
    [800, 950, 1100].forEach((f, i) => {
        setTimeout(() => playSound(f, 'sawtooth', 0.05, 0.3), i * 50);
    });
}

// 💥 Déclenche l'animation de secousse (shake-screen)
function triggerShake() {
    if (wrapper) { 
        wrapper.classList.remove('shake-screen');
        void wrapper.offsetWidth; // Force le reflow
        wrapper.classList.add('shake-screen');
    }
}

// ============================================
// FICHIERS SIMULÉS (Messages Thématiques)
// ============================================
const files = {
    'PROTOCOLE_README.nrd': `╔══════════════════════════════════════════╗
║ NIRD PROJECT - PROTOCOLE DE MISSION ║
╚══════════════════════════════════════════╝
Projet NIRD : Détoxification et souveraineté numérique.
Votre rôle est d'acheminer le Manifeste chiffré.
Tapez 'contact' pour initier la séquence de transmission.`,
    'manifeste_nird.txt': `🌍 PILIER INCLUSIF: Un web libre et accessible à tous.
🌱 PILIER RESPONSABLE: Souveraineté des données et Open Source.
♻️ PILIER DURABLE: Sobriété et réduction de l'empreinte carbone.
Résistance numérique en cours.`,
    'GOLIATH_VAINCU.sh': `#!/bin/bash
echo "Analyse des vulnérabilités de Goliath réussie."
echo "Système en cours de décentralisation."
exit 0`,
    'secrets_gafam.dat': `🔒 FICHIER CHIFRÉ - NIVEAU 5 🔒
[!] ACCÈS REFUSÉ. Autorisation ROOT requise.`,
};

// ============================================
// COMMANDES (Logique conservée)
// ============================================
const commands = {
    help: () => {
        playSuccessSound();
        return `╔══════════════════════════════════════════╗
║         PROTOCOLES DE RÉSISTANCE          ║
╚══════════════════════════════════════════╝
📝 contact      -> Démarrer la transmission Manifeste
📤 send         -> Valider l'envoi chiffré
📂 ls           -> Lister les ressources locales
📄 cat <fichier> -> Afficher le contenu de la ressource
💻 sysinfo      -> État du système NIRD Core
📜 log          -> Journal des commandes
💡 mantra       -> Mantra de résistance
🧹 clear        -> Nettoyer l'écran du protocole`;
    },

    ls: () => {
        playKeySound();
        return Object.keys(files).map(f => '📄 '+f).join('\n');
    },
    cat: (filename) => {
        const fileContent = files[filename];
        if (fileContent) {
            playKeySound();
            return fileContent;
        }
        playErrorSound();
        return `❌ ERREUR: Fichier "${filename}" introuvable. Ressource non localisée.`;
    },
    pwd: () => {
        playKeySound();
        return '/resistance/protocole/transmission_secure';
    },
    whoami: () => {
        playKeySound();
        return '👤 Opérateur NIRD - Niveau 1 (Résistant)';
    },
    clear: () => {
        playKeySound();
        output.innerHTML = '';
        return '';
    },
    history: () => {
        playKeySound();
        return commandHistory.length ? commandHistory.map((c, i) => `${i + 1}: ${c}`).join('\n') : 'Journal de commandes vide.';
    },
    contact: () => {
        startForm();
        return '';
    },
    send: () => {
        sendForm();
        return '';
    },
    neofetch: () => commands.sysinfo(), // Alias thématique
    sysinfo: () => {
        playKeySound();
        return `
                            [ CORE NIRD STATUS ]
                            ━━━━━━━━━━━━━━━━━━━━━━━━━━━
                            OS: NIRD Core v6.0 (Open Source)
                            Shell: BASH (Mode Chiffré)
                            Réseau: Décentralisé / Tor
                            Intégrité: OK (100% Non-GAFAM)
`;
    },
    cowsay: (msg) => {
        playKeySound();
        return `< ${msg || "La sobriété est la force."} >\n \\   ^__^\n  \\  (oo)\\_______\n     (__)\\       )\\/\\\n         ||----w |\n         ||     ||`;
    },
    fortune: () => commands.mantra(), // Alias thématique
    mantra: () => {
        playKeySound();
        const f = [
            "💡 MANTRA: Moins de code, plus d'éthique.",
            "🌍 MANTRA: L'inclusion numérique est la première des résistances.",
            "♻️ MANTRA: L'obsolescence n'est qu'une illusion de Goliath.",
            "🎯 MANTRA: Nous sommes les astérix du numérique."
        ];
        return f[Math.floor(Math.random() * f.length)];
    },
    matrix: () => {
        return '🟢 PROTOCOLE MATRIX ENGAGÉ ! (Simulation visuelle active)';
    },
    shutdown: () => {
        playErrorSound();
        print('🚨 ALERTE CRITIQUE: Déconnexion non sécurisée. Procédure d\'effacement des données...', 'error');
        wrapper.classList.add('panic-mode');
        terminalInput.disabled = true;
        
        // Simule l'affichage de la modale de succès pour la séquence de fermeture dramatique
        modalSuccess.classList.remove('hidden');
        modalContent.querySelector('h1').textContent = 'SHUTDOWN CRITIQUE';
        modalContent.querySelector('p').textContent = 'EFFACEMENT DES DONNÉES EN COURS.';
        if (finalProgressBarFill) finalProgressBarFill.style.width = '100%';
        
        setTimeout(() => {
             location.reload(); 
        }, 5000); 
        return 'FERMETURE DU SYSTÈME NIRD...';
    }
};

// ============================================
// AFFICHAGE AVANCÉ (Typing effect)
// ============================================
function print(text, className = '') {
    const div = document.createElement('div');
    div.className = 'output-line ' + className;
    output.appendChild(div);

    let i = 0;
    const interval = setInterval(() => {
        if (i < text.length) {
            // Utiliser innerHTML pour permettre les tags (ex: **send**)
            // NOTE: L'affichage caractère par caractère ne gère pas bien les balises HTML ou Markdown.
            // On affiche le texte brut puis on le formate à la fin.
            div.textContent += text[i];
            if (Math.random() < 0.2) playKeySound();
            i++;
        } else {
            clearInterval(interval);
            // Remplacement final des ** par <b>
            div.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'); 
        }
        output.scrollTop = output.scrollHeight;
    }, 15);
}

// Nouvelle fonction printLine (sans effet de frappe, pour la barre de progression)
function printLine(text, className = '') {
    const div = document.createElement('div');
    div.className = 'output-line ' + className;
    div.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    output.appendChild(div);
    output.scrollTop = output.scrollHeight;
    return div;
}

// ============================================
// FORMULAIRE (Transmission Manifeste)
// ============================================
function startForm() {
    playSuccessSound();
    formMode = true;
    formStep = 0;
    formData = { name: '', email: '', subject: '', message: '' };
    print('📝 PROTOCOLE DE TRANSMISSION DÉMARRÉ. Veuillez entrer le **NOM DE L\'OPÉRATEUR/ÉQUIPE** :', 'info');
    inputPrompt.textContent = "INPUT>"; 
}

function handleForm(input) {
    if (input.toLowerCase() === 'send') {
         sendForm(); 
         return;
    }
    
    printLine(`INPUT> ${input}`, 'command');

    formData[steps[formStep]] = input;
    formStep++;

    if (formStep < steps.length) {
        print(`✅ ${labels[formStep - 1]} : ENREGISTRÉ. Veuillez entrer le **${labels[formStep]}** :`, 'success');
    } else {
        formMode = false;
        playSuccessSound();
        inputPrompt.textContent = "nird@digital-detox:~$";
        print("✅ TOUS LES PARAMÈTRES ENREGISTRÉS. Manifeste prêt pour le chiffrement.", 'success glow');
        print("Tapez **send** pour initier la séquence de transmission sécurisée.", 'info');
    }
}

// Fonction de soumission asynchrone pour l'animation détaillée
async function submitForm() {
    playSubmitSound();
    printLine("Validation des données... OK", "info");
    await sleep(500);
    printLine("Chiffrement du paquet (AES-256)...", "info");
    await sleep(800);
    
    let barDiv = printLine("TRANSMISSION: [░░░░░░░░░░░░░░░░░░░░░░░░░] 0%", "success");
    const width = 25;
    for(let i=0; i<=width; i++) {
        let filled = "█".repeat(i);
        let empty = "░".repeat(width-i);
        barDiv.textContent = `TRANSMISSION: [${filled}${empty}] ${Math.round((i/width)*100)}%`;
        playSound(700, 'sine', 0.01, 0.05); // Son de progression plus subtil
        await sleep(50);
    }
    
    printLine("Paquet envoyé. En attente d'accusé de réception...", "info");
    await sleep(1500);
    
    // Remplacement du ancien code ASCII art par le nouveau modal
    playSuccessSound();
    modalSuccess.classList.remove('hidden');

    // Assurez-vous que l'animation CSS de la barre de progression se réinitialise
    // en la masquant puis la réaffichant si besoin. Ici, l'animation se lance
    // via la classe CSS, pas besoin de la gérer en JS.
}

function sendForm() {
    if (formMode) {
        return; 
    }

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        playErrorSound();
        print('❌ ÉCHEC DE LA TRANSMISSION: Formulaire incomplet. Exécutez "contact" pour remplir les paramètres.', 'error');
        return;
    }
    
    // Déclenchement de la nouvelle séquence de soumission
    printLine('===========================================================', 'info');
    printLine('>>> INITIATION DU PROTOCOLE [MANIFESTE_NIRD_V3] <<<', 'info');
    printLine('===========================================================', 'info');
    
    submitForm();
}


// ============================================
// EXECUTION COMMANDES & GESTION DES TOUCHES
// ============================================
function executeCommand(cmd) {
    if (!cmd) return;
    
    // On utilise printLine pour l'input, pas d'effet de frappe ici
    printLine(`nird@digital-detox:~$ ${cmd}`, 'command');
    
    commandHistory.push(cmd);
    historyIndex = -1;

    if (formMode) {
        handleForm(cmd);
        return;
    }

    const parts = cmd.split(' ');
    const baseCmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    let result = null;

    if (commands[cmd.toLowerCase()]) {
        result = commands[cmd.toLowerCase()]();
    } else if (commands[baseCmd]) {
        result = commands[baseCmd](args);
    } else {
        playErrorSound();
        result = `❌ ERREUR: Commande "${cmd}" non reconnue. Consultez les 'help'.`;
    }
    
    if (result !== '' && result !== null) {
        print(result);
    }
}

terminalInput.addEventListener('keydown', e => {
    
    // 💥 Logique du Buffer Overflow visuel
    const isBufferFull = (e.target.value.length >= BUFFER_LIMIT && e.key.length === 1);
    
    if (isBufferFull) {
        wrapper.classList.add('overflow-glitch'); 
        e.target.classList.add('overflow-alert');
        if (e.key === 'Enter') { 
            wrapper.classList.remove('overflow-glitch');
            e.target.classList.remove('overflow-alert');
        }
    } else {
        wrapper.classList.remove('overflow-glitch');
        e.target.classList.remove('overflow-alert');
    }
    
    if (e.key === 'Enter') {
        e.preventDefault();
        executeCommand(e.target.value.trim());
        e.target.value = '';
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (commandHistory.length > 0) {
            historyIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
            terminalInput.value = commandHistory[commandHistory.length - 1 - historyIndex];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        historyIndex = Math.max(historyIndex - 1, -1);
        terminalInput.value = historyIndex === -1 ? '' : commandHistory[commandHistory.length - 1 - historyIndex];
    }
    
    // Konami Code
    if (e.key === konamiCode[konamiProgress]) {
        konamiProgress++;
        if (konamiProgress === konamiCode.length) {
            konamiProgress = 0;
            playSuccessSound();
            print('🎮 PROTOCOLE KONAMI CODE ENGAGÉ ! Déblocage de l\'accès ROOT !', 'success glow');
        }
    } else if (e.key.length === 1) {
        // Play sound only for character keys
        playKeySound();
        konamiProgress = 0;
    } else if (e.key !== 'Shift' && e.key !== 'Control' && e.key !== 'Alt' && !e.key.startsWith('Arrow')) {
        konamiProgress = 0;
    }
});

// ============================================
// INIT
// ============================================
document.addEventListener('click', () => {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    terminalInput.focus();
}, { once: true }); 

window.onload = () => {
    terminalInput.focus();
}