// --- CONFIGURATION GLOBALE ---
const terminal = {
    input: document.getElementById('cmd-input'),
    output: document.getElementById('output'),
    boot: document.getElementById('boot-sequence'),
    interface: document.getElementById('main-interface'),
    wrapper: document.getElementById('main-wrapper'),
    discoOverlay: document.getElementById('disco-overlay'), 
    inForm: false,
    formStep: 0,
    formData: {},
    sounds: { enabled: true, ctx: new (window.AudioContext || window.webkitAudioContext)() }
};

// Configuration des étapes du formulaire (avec Interruption UX Décalée)
const formConfig = [
    { key: 'name', prompt: 'NOM DE CODE :', type: 'text' },
    { key: 'interrupt', prompt: 'VÉRIFICATION SYSTÈME : Tapez "NIRD" pour continuer.', special: true }, // Interruption
    { key: 'email', prompt: 'FRÉQUENCE DE CONTACT (Email) :', type: 'email' },
    { key: 'subject', prompt: 'OBJET DE LA MISSION :', type: 'text' },
    { key: 'message', prompt: 'CONTENU DU MANIFESTE :', type: 'textarea' }
];

// --- EASTER EGGS : KONAMI CODE ---
const konamiCode = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiIndex = 0;
let idleTimer; 

// --- SYSTÈME AUDIO GÉNÉRATIF (inchangé) ---
function playSound(type) {
    if (!terminal.sounds.enabled || terminal.sounds.ctx.state === 'suspended') return;
    const ctx = terminal.sounds.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'keystroke') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(600 + Math.random()*200, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.03);
    } else if (type === 'boot') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 1.5);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 1.5);
    } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, ctx.currentTime);
        osc.frequency.setValueAtTime(130, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.4);
        triggerShake(); 
    } else if (type === 'success') {
        let now = ctx.currentTime;
        [440, 554, 659].forEach((freq, i) => {
            let osc2 = ctx.createOscillator();
            let gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.value = freq;
            gain2.gain.setValueAtTime(0.1, now + i*0.1);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + i*0.1 + 0.2);
            osc2.connect(gain2); gain2.connect(ctx.destination);
            osc2.start(now + i*0.1); osc2.stop(now + i*0.1 + 0.2);
        });
    }
}

// Fonction pour faire trembler l'écran (inchangée)
function triggerShake() {
    terminal.wrapper.classList.remove('shake-screen');
    void terminal.wrapper.offsetWidth;
    terminal.wrapper.classList.add('shake-screen');
}

// --- SÉQUENCE DE DÉMARRAGE (BOOT - inchangée) ---
async function startBoot() {
    document.body.addEventListener('click', () => {
        if(terminal.sounds.ctx.state === 'suspended') terminal.sounds.ctx.resume();
        terminal.input.focus();
    }, {once:true});

    printBootLine("NIRD BIOS (c) 2025 The Resistance Frontend Collective");
    printBootLine("Initializing hardware...");
    await sleep(500);
    
    printBootLine("CHECKING SYSTEM MEMORY...", "system");
    let memDiv = document.createElement('div');
    memDiv.className = 'line success';
    terminal.boot.appendChild(memDiv);
    for(let i=0; i<=128; i+=8) {
         memDiv.textContent = `> ${i.toString().padStart(3, '0')} MB RAM OK`;
         playSound('keystroke');
         await sleep(30);
    }
    
    printBootLine("Loading Kernel modules...", "system");
    await sleep(400);
    printBootLine("[ OK ] mount /dev/resistance_fs");
    await sleep(300);
    printBootLine("Establishing secure tunnel to Village Numérique...", "system");
    
    let loadDiv = document.createElement('div');
    loadDiv.className = 'line';
    terminal.boot.appendChild(loadDiv);
    for(let i=0; i<5; i++) {
        loadDiv.textContent = "CONNECTING " + ".".repeat(i%4);
        await sleep(400);
    }
    loadDiv.remove();

    printBootLine("CONNECTION ESTABLISHED.", "success");
    await sleep(800);
    
    terminal.boot.style.display = 'none';
    terminal.interface.style.display = 'block';
    playSound('boot');
    printLine("BIENVENUE DANS LE TERMINAL DE RÉSISTANCE.", "success");
    printLine("Tapez 'help' pour voir les protocoles disponibles.", "system");
    terminal.input.focus();
}

// --- UTILITAIRES D'AFFICHAGE (inchangés) ---
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function printBootLine(text, type = '') {
    const div = document.createElement('div');
    div.className = `line ${type}`;
    div.textContent = text;
    terminal.boot.appendChild(div);
    terminal.wrapper.scrollTop = terminal.wrapper.scrollHeight;
}

function printLine(text, type = '') {
    const div = document.createElement('div');
    div.className = `line ${type}`;
    div.innerHTML = text.replace(/\n/g, '<br>').replace(/ /g, '&nbsp;'); 
    terminal.output.appendChild(div);
    const screen = document.getElementById('terminal-screen');
    screen.scrollTop = screen.scrollHeight;
}

// --- SYSTÈME DE COMMANDES (Nouveaux Easter Eggs réalistes) ---
const commands = {
    'help': () => {
        printLine("--- PROTOCOLES DISPONIBLES ---", "system");
        printLine("  contact     : > Lancer le formulaire de transmission");
        printLine("  clear       : > Nettoyer l'écran du terminal");
        printLine("  about       : > Infos sur la démarche NIRD");
        printLine("  date        : > Afficher l'heure système");
        printLine("  **hack** : > Tester vos capacités de bypass ! (Fun)", "success");
        printLine("  **sudo** : > Tenter d'obtenir des privilèges (réf. UNIX)", "success"); // Nouveau
        printLine("  **apt update**:> Mettre à jour les dépendances (réf. Linux)", "success"); // Nouveau
    },
    'clear': () => {
        terminal.output.innerHTML = '';
        playSound('success');
    },
    'about': () => {
        printLine("NIRD: Numérique Inclusif, Responsable, Durable.");
        printLine("Objectif: Fournir des armes open-source aux établissements scolaires contre les GAFAM.");
    },
    'date': () => {
       printLine(new Date().toUTCString(), "system");
    },
    'rm -rf /': async () => {
        playSound('error');
        printLine("ALERTE : TENTATIVE DE SABOTAGE DÉTECTÉE.", "error");
        await sleep(1000);
        printLine("...juste une blague. Ne refaites jamais ça.", "success");
        terminal.input.disabled = false;
        terminal.input.focus();
    },
    'contact': () => {
        startForm();
    },
    
    // 🥚 EGG 1: SUDO (Réponse classique mais décalée)
    'sudo': () => {
        printLine("usage: sudo [-H] [-L] [-P] [-b] [-E] [-i] [-k] [-n] [-r role] [-t type] [-v]", "error");
        printLine("Désolé. Seul l'Administrateur peut devenir root. Mot de passe incorrect.", "error");
    },
    
    // 🥚 EGG 2: APT UPDATE (Simulation de mise à jour)
    'apt update': async () => {
        printLine("Hit:1 http://nird-mirror.org/repo green-kernel InRelease", "system");
        printLine("Get:2 http://nird-mirror.org/packages critical-patch [42.1 kB]", "system");
        await sleep(500);
        printLine("Get:3 http://nird-mirror.org/packages goliath-bypass [1200 kB]", "system");
        await sleep(1000);
        printLine("Fetched 1242 kB in 2s (621 kB/s)", "success");
        printLine("Lecture des listes de paquets... Fait.", "success");
    },

    // 🥚 EGG 3: IPCONFIG/IFCONFIG (Simulation d'infos réseau)
    'ipconfig': () => {
         printLine("eth0: flags=2051<UP,BROADCAST,RUNNING,MULTICAST> mtu 1500", "system");
         printLine("        inet 192.168.42.1 netmask 255.255.255.0 broadcast 192.168.42.255", "system");
         printLine("        inet6 fe80::d8ee:42ff:f8e4:273/64 scopeid 0x20<link>", "system");
         printLine("        ether d2:ee:42:e4:02:73 txqueuelen 1000 (Ethernet)", "system");
         printLine("lo: flags=73<UP,LOOPBACK,RUNNING> mtu 65536", "system");
         printLine("        inet 127.0.0.1 netmask 255.0.0.0", "system");
    },
    
    'hack': async () => {
        printLine("--- INITIATION DU BYPASS DE GOLIATH_FW ---", "system");
        let hackDiv = document.createElement('div');
        hackDiv.className = 'line hacking-text';
        terminal.output.appendChild(hackDiv);
        
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
        
        for(let i=0; i<30; i++) {
            let line = "0x" + Math.floor(Math.random()*0xFFFFFFFF).toString(16) + " ";
            for(let j=0; j<40; j++) {
                line += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            hackDiv.textContent = line;
            playSound('keystroke');
            await sleep(20);
        }
        
        printLine("[ BYPASS TERMINÉ ] Accès refusé par le pare-feu...", "error");
        hackDiv.remove();
    },
    
    'cat': () => {
        printLine(`
 /\\_/\\
( o.o )
 > ^ < 
        `, "system");
        printLine("cat: Erreur de lecture. Le fichier est probablement un chat. Opération annulée.", "error");
    }
};

// --- LOGIQUE DU FORMULAIRE (inchangée) ---
function startForm() {
    terminal.inForm = true;
    terminal.formStep = 0;
    terminal.formData = {};
    playSound('success');
    printLine("--- INITIALISATION DU PROTOCOLE DE CONTACT ---", "success");
    printLine(formConfig[0].prompt, "system");
    document.querySelector('.prompt').textContent = "INPUT>";
}

async function handleFormInput(value) {
    if(value === '') return; 

    const currentField = formConfig[terminal.formStep];
    
    if (currentField.special && currentField.key === 'interrupt') {
        printLine(value, "user");
        if (value.toUpperCase() === 'NIRD') {
            printLine("Vérification réussie. Protocole de transmission réactivé.", "success");
            terminal.formStep++;
        } else {
            printLine("ERREUR CRITIQUE. Vous n'êtes pas un initié. Recommencez.", "error");
            triggerShake();
            terminal.formStep--; 
        }
        await sleep(500);
    } else {
        terminal.formData[currentField.key] = value;
        terminal.formStep++;
        printLine(value, "user");
        playSound('success');
        await sleep(200);
    }

    if (terminal.formStep < formConfig.length) {
        printLine(formConfig[terminal.formStep].prompt, "system");
    } else {
        terminal.inForm = false;
        document.querySelector('.prompt').textContent = "agent@nird:~$";
        submitForm();
    }
}

async function submitForm() {
    playSound('boot');
    printLine("Validation des données... OK", "system");
    await sleep(500);
    printLine("Chiffrement du paquet (AES-256)...", "system");
    await sleep(800);
    
    let barDiv = document.createElement('div');
    barDiv.className = 'line success';
    terminal.output.appendChild(barDiv);
    const width = 25;
    for(let i=0; i<=width; i++) {
        let filled = "█".repeat(i);
        let empty = "░".repeat(width-i);
        barDiv.textContent = `TRANSMISSION: [${filled}${empty}] ${Math.round((i/width)*100)}%`;
        playSound('keystroke');
        await sleep(50);
    }
    
    printLine("Paquet envoyé. En attente d'accusé de réception...", "system");
    await sleep(1500);
    
    playSound('success');
    document.getElementById('modal-success').classList.remove('hidden');
}

// --- GESTIONNAIRE D'ÉVÉNEMENTS CLAVIER (avec Timer d'ennui technique) ---

function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
        if (!terminal.inForm && terminal.interface.style.display !== 'none') {
            // Message d'ennui plus technique
            printLine("ALERT: Console input idle for 15s. Process suspension imminent. Type 'activity' or face timeout.", "error");
            playSound('error');
        }
    }, 15000);
}

terminal.input.addEventListener('keydown', function(e) {
    resetIdleTimer();
    
    // --- KONAMI CODE TRACKER ---
    const isDiscoActive = document.body.classList.contains('disco-mode');

    if(e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if(konamiIndex === konamiCode.length) {
            if (!isDiscoActive) {
                document.body.classList.add('disco-mode');
                terminal.discoOverlay.classList.remove('hidden');
                printLine("🕺 KERNEL MODE: DISCO ACTIVÉ. ATTENTION AUX EFFETS STROBOSCOPIQUES. 🕺", "success");
            } else {
                document.body.classList.remove('disco-mode');
                terminal.discoOverlay.classList.add('hidden');
                printLine("MODE DISCO DÉSACTIVÉ. Revert to secure mode.", "system");
            }
            konamiIndex = 0;
        }
    } else if (e.key.length !== 1 && konamiIndex > 0) {
        // Ignorer les touches fonctionnelles
    } else {
        konamiIndex = 0;
    }

    // Touche Entrée
    if (e.key === 'Enter') {
        const value = this.value; 
        this.value = ''; 
        
        if (terminal.inForm) {
            handleFormInput(value);
        } else {
            const trimmedValue = value.trim();
            if (trimmedValue !== '') {
                 printLine(`agent@nird:~$ ${trimmedValue}`, "user");
                 if (commands[trimmedValue]) {
                     commands[trimmedValue]();
                 } else {
                     printLine(`Erreur: Commande '${trimmedValue}' inconnue. Type 'help'.`, "error");
                     playSound('error');
                 }
            }
        }
    } 
    // Sons de frappe
    else if (e.key.length === 1) {
        playSound('keystroke');
    }
});

// Lancement au chargement de la page
window.onload = () => {
    startBoot();
    resetIdleTimer();
}