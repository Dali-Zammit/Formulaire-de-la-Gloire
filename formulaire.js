const terminalInput = document.getElementById('terminal-input');
const output = document.getElementById('terminal-output');
const wrapper = document.getElementById('main-wrapper'); 
const inputPrompt = document.getElementById('input-prompt');
const modalSuccess = document.getElementById('modal-success'); 
const modalContent = document.querySelector('#modal-success .modal-content');
const finalProgressBarFill = document.querySelector('.progress-bar-final .fill');

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
const labels = [
    "NOM DE L'OPÉRATEUR/ÉQUIPE", 
    "CONTACT MAIL CHIFFRÉ",
    "OBJET DE LA MISSION",
    "CONTENU DU MANIFESTE"
];

const konamiCode = [
    'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
    'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'
];
let konamiProgress = 0;

const BUFFER_LIMIT = 50;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));


function resumeAudioContext() {
    if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            console.log('AudioContext repris après la première interaction.');
        });
    }
}

function playSound(freq, type, duration, gainValue){
    if(!soundEnabled || audioContext.state === "suspended") return;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain); gain.connect(audioContext.destination);
    osc.frequency.value = freq; osc.type = type;
    gain.gain.setValueAtTime(volume * gainValue, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + duration);
}

function playKeySound(){ playSound(650 + Math.random()*300,"square",0.03,0.15); }
function playSubmitSound(){ playSound(450,"sawtooth",0.1,0.5); }
function playErrorSound(){ playSound(150,"square",0.1,0.8); triggerShake(); }
function playSuccessSound(){ [800,950,1100].forEach((f,i)=>setTimeout(()=>playSound(f,"sawtooth",0.05,0.3),i*50)); }
function playInfoSound(){ playSound(400, "sine", 0.08, 0.4); } 
function playClearSound(){ playSound(200, "square", 0.15, 0.6); }

function triggerShake(){
    wrapper.classList.remove("shake-screen");
    void wrapper.offsetWidth;
    wrapper.classList.add("shake-screen");
}

function triggerScanlineGlitch(){
    wrapper.classList.remove("scanline-glitch");
    void wrapper.offsetWidth; 
    wrapper.classList.add("scanline-glitch");
    setTimeout(() => wrapper.classList.remove("scanline-glitch"), 200); 
}

function triggerWaterRipple(){
    wrapper.classList.remove("water-ripple");
    void wrapper.offsetWidth;
    wrapper.classList.add("water-ripple");
    setTimeout(() => wrapper.classList.remove("water-ripple"), 500);
}

function triggerSynthFlash(){
    wrapper.classList.remove("synth-flash");
    void wrapper.offsetWidth;
    wrapper.classList.add("synth-flash");
    setTimeout(() => wrapper.classList.remove("synth-flash"), 150);
}



const files = {
    "PROTOCOLE_README.nrd": `╔══════════════════════════════════════════╗
║ NIRD PROJECT - PROTOCOLE DE MISSION ║
╚══════════════════════════════════════════╝
Projet NIRD : Détoxification et souveraineté numérique.
Tapez 'contact' pour initier la transmission.`,
    "manifeste_nird.txt": `🌍 PILIER INCLUSIF : Un web libre.
♻️ PILIER DURABLE : Sobriété numérique.`,
    "GOLIATH_VAINCU.sh": `#!/bin/bash
echo "Décapage du système central... OK"`,
    "secrets_gafam.dat": `🔒 ACCÈS REFUSÉ 🔒`
};


const commands = {
    help: () => {
        playSuccessSound();
        triggerSynthFlash();
        return `╔══════════════════════════════╗
    PROTOCOLES DISPONIBLES  
╚══════════════════════════════╝
📌 contact -> démarrer transmission
📦 send    -> envoyer manifeste
📂 ls      -> lister fichiers
📑 cat f   -> afficher fichier
⏳ history -> historique commandes
🧽 clear   -> nettoyer affichage
⚙️ sysinfo -> infos système
💬 mantra  -> citation de résistance
🕶 matrix  -> cascade numérique
💣 shutdown -> extinction critique`;
    },

    ls: () => { 
        playInfoSound();
        triggerScanlineGlitch();
        return Object.keys(files).map(f=>"📄 "+f).join("\n"); 
    },
    cat: fname => {
        if(files[fname]){
            playInfoSound();
            triggerScanlineGlitch();
            return files[fname];
        }
        playErrorSound();
        return "❌ fichier introuvable";
    },
    pwd: () => "/resistance/protocole",
    whoami: () => "👤 Résistant NIRD - Niveau 1",
    clear: () => { 
        playClearSound();
        triggerWaterRipple();
        output.innerHTML=""; 
        return ""; 
    },
    history: async () => {
        playInfoSound();
        const delayLine = printLine("⏳ Recherche dans le journal chiffré...", "info");
        await sleep(700);
        delayLine.remove();
        return commandHistory.map((c,i)=>`${i+1}: ${c}`).join("\n");
    },
    contact: () => { startForm(); return ""; },
    send: () => { sendForm(); return ""; },
    sysinfo: () => {
        playInfoSound();
        triggerScanlineGlitch();
        return `
[ NIRD CORE STATUS ]
OS: v6.0 Open Source
Shell: Chiffré
Réseau: Tor
Intégrité: 100% Anti-GAFAM`;
    },
    
    mantra: () => {
        const list = [
            "💡 Moins de code, plus d'éthique.",
            "♻️ La sobriété est un acte de résistance.",
            "🌍 L'inclusion numérique est une obligation morale."
        ];
        return list[Math.floor(Math.random()*list.length)];
    },

    matrix: async () => {
        const line1 = printLine("Tentative d'activation du mode MATRICE...", "info");
        triggerMatrixRain();
        playSuccessSound();

        
        await sleep(1000); 
        line1.innerHTML = "✔ Mode MATRICE initialisé. Connexion au flux **DATA_STREAM**...";
        
        await sleep(500); 
        return "🔵 **CYBER-MATRIX ACTIF**"; 
    },

    shutdown: () => {
        playErrorSound();
        print("⚠️ EXTINCTION CRITIQUE ACTIVÉE", "error");
        modalSuccess.classList.remove("hidden");
        modalContent.querySelector("h1").textContent = "SHUTDOWN CRITIQUE";
        modalContent.querySelector("p").textContent = "EFFACEMENT DES DONNÉES...";
        if(finalProgressBarFill) finalProgressBarFill.style.width="100%";
        terminalInput.disabled=true;
        setTimeout(()=>location.reload(),4000);
        return "";
    }
};


function print(text, cls=""){
    const div = document.createElement("div");
    div.className="output-line "+cls;
    output.appendChild(div);

    let i=0;
    const interval=setInterval(()=>{
        if(i<text.length){
            div.textContent+=text[i];
            if(Math.random()<0.2) playKeySound();
            i++;
        } else {
            clearInterval(interval);
            div.innerHTML = text.replace(/\*\*(.*?)\*\*/g,"<b>$1</b>");
        }
        output.scrollTop = output.scrollHeight;
    },15);
}

function printLine(text,cls=""){
    const div=document.createElement("div");
    div.className="output-line "+cls;
    div.innerHTML=text.replace(/\*\*(.*?)\*\*/g,"<b>$1</b>");
    output.appendChild(div);
    output.scrollTop=output.scrollHeight;
    return div;
}


function startForm(){
    playSuccessSound();
    formMode=true;
    formStep=0;
    formData={name:"",email:"",subject:"",message:""};
    print("📝 Entrez **NOM DE L'OPÉRATEUR/ÉQUIPE**");
    inputPrompt.textContent="INPUT>";
}

function isValidEmail(email){ return /.+@.+\..+/.test(email); }

function handleForm(input){
    if(input.toLowerCase()==="send"){ sendForm(); return; }

    printLine("INPUT> "+input,"command");

    let step = steps[formStep];
    if(step==="email" && !isValidEmail(input)){
        playErrorSound();
        print("❌ Email invalide, veuillez réessayer.","error");
        return;
    }

    formData[step]=input;
    formStep++;

    if(formStep<steps.length){
        print(`✔ ${labels[formStep-1]} enregistré.
➡ Entrer **${labels[formStep]}** :`);
    } else {
        formMode=false;
        playSuccessSound();
        print("✔ Paramètres enregistrés. Tapez **send** pour transmettre.","success glow");
        inputPrompt.textContent="nird@digital-detox:~$";
    }
}

async function submitForm(){
    playSubmitSound();
    printLine("Validation... OK","info");
    await sleep(500);
    printLine("Chiffrement AES-256...","info");
    await sleep(800);

    let bar = printLine("TRANSMISSION: [░░░░░░] 0%","success");
    let width=20;
    for(let i=0;i<=width;i++){
        let f="█".repeat(i);
        let e="░".repeat(width-i);
        bar.textContent=`TRANSMISSION: [${f}${e}] ${Math.round(i/width*100)}%`;
        playSound(700,"sine",0.01,0.05);
        await sleep(40);
    }

    printLine("Attente accusé de réception...","info");
    await sleep(1200);

    playSuccessSound();
    modalSuccess.classList.remove("hidden");
}

function sendForm(){
    if(formMode) return;
    if(!formData.name || !formData.email || !formData.subject || !formData.message){
        playErrorSound();
        print("❌ Formulaire incomplet.","error");
        return;
    }

    printLine(">>> PROTOCOLE ENVOYÉ <<<","info");
    submitForm();
}


function triggerMatrixRain(){
    wrapper.classList.add("matrix-mode");
    setTimeout(()=>wrapper.classList.remove("matrix-mode"),2000);
}


function executeCommand(cmd){
    if(!cmd) return;

    printLine(`nird@digital-detox:~$ ${cmd}`,"command");
    commandHistory.push(cmd);
    historyIndex=-1;

    if(formMode){ handleForm(cmd); return; }

    let parts=cmd.split(" ");
    let base=parts[0].toLowerCase();
    let args=parts.slice(1).join(" ");

    let res=null;

    if(commands[cmd.toLowerCase()]) res=commands[cmd.toLowerCase()]();
    else if(commands[base]) res=commands[base](args);
    else { playErrorSound(); res=`❌ Commande "${cmd}" inconnue.`; }

    if (res instanceof Promise) {
        res.then(finalResult => {
            if (finalResult) print(finalResult);
        });
    } else if (res) {
        print(res);
    }
}

terminalInput.addEventListener("keydown",e=>{
    
    resumeAudioContext(); 
    

    if(e.target.value.length>=BUFFER_LIMIT && e.key.length===1){
        wrapper.classList.add("overflow-glitch");
        terminalInput.classList.add("overflow-alert");
    } else {
        wrapper.classList.remove("overflow-glitch");
        terminalInput.classList.remove("overflow-alert");
    }


    if(e.key===konamiCode[konamiProgress]){
        konamiProgress++;
        if(konamiProgress===konamiCode.length){
            konamiProgress=0;
            playSuccessSound();
            triggerMatrixRain();
            print("✨ EASTER EGG ACTIVÉ ✨","success glow");
        }
    } else konamiProgress=0;


    if(e.key==="Enter"){
        e.preventDefault();
        executeCommand(e.target.value.trim());
        e.target.value="";
    }

   
    if(e.key==="ArrowUp"){
        e.preventDefault();
        if(commandHistory.length>0){
            historyIndex=Math.min(historyIndex+1,commandHistory.length-1);
            terminalInput.value=commandHistory[commandHistory.length-1-historyIndex];
        }
    }

    
    if(e.key==="ArrowDown"){
        e.preventDefault();
        if(historyIndex>0){
            historyIndex--;
            terminalInput.value=commandHistory[commandHistory.length-1-historyIndex];
        } else{
            historyIndex=-1;
            terminalInput.value="";
        }
    }

    
    if(e.key.length===1) playKeySound();
});