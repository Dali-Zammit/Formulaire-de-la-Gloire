// ============================================
// NIRD TERMINAL - V6.0 (Secure Transmission Protocol)
// Mise à jour : UX Console pour la transmission, messages pro/thématiques.
// ============================================

// ============================================
// VARIABLES GLOBALES & AUDIO CONTEXT
// ============================================
const terminalInput = document.getElementById('terminal-input');
const output = document.getElementById('terminal-output');

// Initialisation de l'AudioContext (nécessaire pour le son)
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

let soundEnabled = true;
let volume = 0.5;

let commandHistory = [];
let historyIndex = -1;

let formMode = false;
let formStep = 0;
let formData = { name: '', email: '', subject: '', message: '' };
const steps = ['name', 'email', 'subject', 'message'];
const labels = ['NOM DE L\'OPÉRATEUR/ÉQUIPE', 'CONTACT MAIL CHIFFRÉ', 'OBJET DE LA MISSION', 'CONTENU DU MANIFESTE'];

const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiProgress = 0;

// ============================================
// FONCTIONS AUDIO (Hacker Modifié - Clarté et Impact)
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
    // Son de frappe plus SEC et aigu
    playSound(700 + Math.random() * 300, 'square', 0.03, 0.15); 
}

function playSubmitSound() {
    // Son de soumission (clic de validation net)
    playSound(450, 'sawtooth', 0.1, 0.5); 
}

function playErrorSound() {
    // Son d'erreur (court et bas, plus agressif)
    playSound(150, 'square', 0.1, 0.8);
}

function playSuccessSound() {
    // Son de succès (trois notes plus métalliques)
    [800, 950, 1100].forEach((f, i) => {
        setTimeout(() => playSound(f, 'sawtooth', 0.05, 0.3), i * 50);
    });
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
// COMMANDES
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
        activateMatrix();
        return '🟢 PROTOCOLE MATRIX ENGAGÉ ! (Simulation visuelle active)';
    },
    shutdown: () => {
        playErrorSound();
        print('🚨 ALERTE CRITIQUE: Déconnexion non sécurisée. Procédure d\'effacement des données...', 'error');
        document.body.classList.add('panic-mode');
        setTimeout(() => {
            document.body.innerHTML = '<div style="color:var(--primary-color);text-align:center;padding-top:45vh;font-family:IBM Plex Mono, monospace;">[!] SESSION TERMINÉE. MANIFESTE SÉCURISÉ. [!]</div>';
            setTimeout(() => {
                location.reload();
            }, 3000);
        }, 1000);
        return 'FERMETURE DU SYSTÈME NIRD...';
    }
};

// ============================================
// AFFICHAGE AVANCÉ
// ============================================
function print(text, className = '') {
    const div = document.createElement('div');
    div.className = 'output-line ' + className;
    output.appendChild(div);

    let i = 0;
    const interval = setInterval(() => {
        if (i < text.length) {
            div.textContent += text[i];
            if (Math.random() < 0.2) playKeySound();
            i++;
        } else {
            clearInterval(interval);
            playSuccessSound();
        }
        output.scrollTop = output.scrollHeight;
    }, 15);
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
}

function handleForm(input) {
    formData[steps[formStep]] = input;
    formStep++;

    if (formStep < steps.length) {
        print(`✅ ${labels[formStep - 1]} : ENREGISTRÉ. Veuillez entrer le **${labels[formStep]}** :`, 'success');
        if (Math.random() < 0.3) spawnFirefly();
    } else {
        formMode = false;
        playSuccessSound();
        print("✅ TOUS LES PARAMÈTRES ENREGISTRÉS. Manifeste prêt pour le chiffrement.", 'success glow');
        print("Tapez **send** pour initier la séquence de transmission sécurisée.", 'info');
    }
}

function sendForm() {
    if (formMode) {
        handleForm('send'); 
        return;
    }

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        playErrorSound();
        print('❌ ÉCHEC DE LA TRANSMISSION: Formulaire incomplet. Exécutez "contact" pour remplir les paramètres.', 'error');
        return;
    }
    
    // --- NOUVEAU LOG DE TRANSMISSION ÉPIQUE DANS LA CONSOLE ---
    playSubmitSound();
    
    print('===========================================================', 'info');
    print('>>> INITIATION DU PROTOCOLE [MANIFESTE_NIRD_V3] <<<', 'info');
    print('===========================================================', 'info');
    
    // ÉTAPE 1: CHIFFREMENT (Plus dramatique)
    setTimeout(() => {
        print(`[00:00:01] 🔐 CHIFFREMENT ASYMÉTRIQUE ENGAGÉ. Opérateur: ${formData.name.toUpperCase()}`, 'info');
        print('[00:00:02] 🔑 GÉNÉRATION CLÉ DE SÉCURITÉ P39 (2048-BIT). STATUS: OK.', 'success');
        print('[00:00:03] 🌐 ROUTAGE VIA NOEUDS DÉCENTRALISÉS (TOR). LATENCE: FAIBLE.', 'info');
    }, 1000);

    // ÉTAPE 2: TRANSMISSION DES PILIERS (Le "Wow")
    setTimeout(() => {
        print('-----------------------------------------------------------', 'info');
        print('>>> DÉBUT DE LA TRANSMISSION DES PILIERS DE RÉSISTANCE <<<', 'info');
        print('-----------------------------------------------------------', 'info');
        
        // Simulation de la transmission des 3 piliers NIRD
        setTimeout(() => {
            print('✅ [00:00:05] PILIER 1 - INCLUSIF : ACHEMINÉ [33%]', 'success');
        }, 1000);
        setTimeout(() => {
            print('✅ [00:00:07] PILIER 2 - RESPONSABLE : ACHEMINÉ [66%]', 'success');
        }, 3000);
        setTimeout(() => {
            print('✅ [00:00:09] PILIER 3 - DURABLE : ACHEMINÉ [100%]', 'success');
        }, 5000);
        
        // ÉTAPE 3: SUCCÈS FINAL
        setTimeout(() => {
            spawnConfetti();
            
            // ASCII Art de Confirmation (Wow Visuel)
            print(`
                           ███╗  ██╗      ██╗
                           ███║  ██║      ██║
                           ╚══╝  ╚══╝      ╚══╝
                           ✅ TRANSMISSION VALIDÉE
`, 'success glow');

            print('>>> [SUCCÈS CRITIQUE] MANIFESTE NIRD ACCEPTÉ ET INTÉGRÉ PAR LE CORE !', 'success glow');
            print(`Opérateur **${formData.name.toUpperCase()}**, la résistance a fait un pas de géant contre Goliath. Votre transmission est notre victoire.`, 'info');
            print('---', 'info');
            print('Tapez \'help\' pour une nouvelle séquence de mission.', 'info');
        }, 7000); // Déclenche après 9s (1s + 2s + 2s + 2s + 2s)
        
    }, 1000); // Déclenche après 1s
}
// ============================================
// EASTER EGGS / ANIMATIONS
// ============================================
function spawnFirefly() {
    const f = document.createElement('div');
    f.className = 'firefly';
    f.textContent = '✦';
    f.style.left = Math.random() * window.innerWidth + 'px';
    f.style.top = Math.random() * window.innerHeight + 'px';
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 3000);
}

function spawnConfetti() {
    for (let i = 0; i < 50; i++) {
        const c = document.createElement('div');
        c.className = 'confetti';
        c.style.left = Math.random() * window.innerWidth + 'px';
        c.style.top = '-10px';
        c.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
        document.body.appendChild(c);
        c.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${window.innerHeight}px)` }], { duration: 3000 });
        setTimeout(() => c.remove(), 3000);
    }
}

function activateMatrix() {
    document.body.classList.add('matrix-mode');
    setTimeout(() => document.body.classList.remove('matrix-mode'), 3000);
}

// ============================================
// EXECUTION COMMANDES
// ============================================
function executeCommand(cmd) {
    if (!cmd) return;
    print(`nird@digital-detox:~$ ${cmd}`, 'command');
    commandHistory.push(cmd);
    historyIndex = -1;

    if (formMode && cmd.toLowerCase() !== 'send') {
        handleForm(cmd);
        return;
    }

    const parts = cmd.split(' ');
    const baseCmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    if (commands[cmd.toLowerCase()]) {
        print(commands[cmd.toLowerCase()]());
    } else if (commands[baseCmd]) {
        print(commands[baseCmd](args));
    } else {
        playErrorSound();
        print(`❌ ERREUR: Commande "${cmd}" non reconnue. Consultez les 'help'.`, 'error');
    }
}

// ============================================
// GESTION TOUCHES & INIT
// ============================================
terminalInput.addEventListener('keydown', e => {
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
            spawnConfetti();
        }
    } else if (e.key !== 'Shift' && e.key !== 'Control' && e.key !== 'Alt' && !e.key.startsWith('Arrow')) {
        konamiProgress = 0;
    }
});

document.addEventListener('click', () => {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    terminalInput.focus();
}, { once: true }); 

terminalInput.focus();