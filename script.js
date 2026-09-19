const telas = document.querySelectorAll(".tela");

let telaAtual = "entrada";

let somAtivo = false;
let audioContext = null;
let masterGain = null;
let musicaAtiva = false;
let musicaIntervalo = null;


/* CORAÇÕES */

function criarCoracoes(tela) {

    const container =
        tela.querySelector(".coracoes-flutuantes");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const quantidade =
        window.innerWidth < 600 ? 10 : 18;

    for (let i = 0; i < quantidade; i++) {

        const coracao =
            document.createElement("span");

        coracao.className =
            "coracao-flutuante";

        coracao.textContent =
            Math.random() > .45 ? "♡" : "♥";

        coracao.style.left =
            `${Math.random() * 100}%`;

        coracao.style.setProperty(
            "--tamanho",
            `${8 + Math.random() * 14}px`
        );

        coracao.style.setProperty(
            "--duracao",
            `${9 + Math.random() * 12}s`
        );

        coracao.style.setProperty(
            "--delay",
            `${Math.random() * -15}s`
        );

        coracao.style.setProperty(
            "--desvio",
            `${-80 + Math.random() * 160}px`
        );

        coracao.style.setProperty(
            "--blur",
            `${Math.random() * 1.5}px`
        );

        container.appendChild(coracao);
    }
}


telas.forEach(criarCoracoes);


/* ÁUDIO */

function prepararAudio() {

    if (!audioContext) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

        masterGain =
            audioContext.createGain();

        masterGain.gain.value = .10;

        masterGain.connect(
            audioContext.destination
        );
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }
}


function tocarNota(
    frequencia,
    duracao = 2,
    volume = .025,
    tipo = "sine",
    atraso = 0
) {

    if (
        !audioContext ||
        !masterGain ||
        !somAtivo
    ) {
        return;
    }

    const agora =
        audioContext.currentTime + atraso;

    const oscilador =
        audioContext.createOscillator();

    const ganho =
        audioContext.createGain();

    const filtro =
        audioContext.createBiquadFilter();

    oscilador.type = tipo;

    oscilador.frequency.value =
        frequencia;

    filtro.type = "lowpass";
    filtro.frequency.value = 1800;
    filtro.Q.value = .5;

    ganho.gain.setValueAtTime(
        0,
        agora
    );

    ganho.gain.linearRampToValueAtTime(
        volume,
        agora + .25
    );

    ganho.gain.exponentialRampToValueAtTime(
        .001,
        agora + duracao
    );

    oscilador.connect(filtro);
    filtro.connect(ganho);
    ganho.connect(masterGain);

    oscilador.start(agora);

    oscilador.stop(
        agora + duracao + .1
    );
}


const acordes = [

    [261.63,329.63,392,493.88],

    [220,261.63,329.63,392],

    [174.61,220,261.63,329.63],

    [196,246.94,293.66,392]

];


const melodias = [

    [493.88,523.25,587.33,659.25],

    [392,440,493.88,523.25],

    [329.63,392,440,493.88],

    [392,440,493.88,587.33]

];


let acordeAtual = 0;


function tocarAcorde() {

    if (!somAtivo) {
        return;
    }

    const acorde =
        acordes[acordeAtual];

    const melodia =
        melodias[acordeAtual];

    acorde.forEach(
        (nota, indice) => {

            tocarNota(
                nota,
                3.3,
                .025,
                indice === 0
                    ? "sine"
                    : "triangle"
            );

        }
    );

    tocarNota(
        acorde[0] / 2,
        3.5,
        .018,
        "sine"
    );

    melodia.forEach(
        (nota, indice) => {

            tocarNota(
                nota,
                1.8,
                .016,
                "triangle",
                indice * .55
            );

        }
    );

    acordeAtual++;

    if (
        acordeAtual >= acordes.length
    ) {
        acordeAtual = 0;
    }
}


function iniciarMusica() {

    prepararAudio();

    somAtivo = true;

    const botaoSom =
        document.getElementById(
            "somControl"
        );

    botaoSom.textContent = "🔊";

    if (musicaAtiva) {
        return;
    }

    musicaAtiva = true;

    tocarAcorde();

    musicaIntervalo =
        setInterval(
            tocarAcorde,
            3500
        );
}


function pararMusica() {

    somAtivo = false;

    const botaoSom =
        document.getElementById(
            "somControl"
        );

    botaoSom.textContent = "🔇";

    if (
        masterGain &&
        audioContext
    ) {

        masterGain.gain.cancelScheduledValues(
            audioContext.currentTime
        );

        masterGain.gain.setTargetAtTime(
            0,
            audioContext.currentTime,
            .15
        );
    }

    musicaAtiva = false;

    if (musicaIntervalo) {

        clearInterval(
            musicaIntervalo
        );

        musicaIntervalo = null;
    }
}


document
    .getElementById("somControl")
    .addEventListener(
        "click",
        () => {

            if (!somAtivo) {
                iniciarMusica();
            } else {
                pararMusica();
            }

        }
    );


/* SONS */

function somClique() {

    if (!somAtivo || !audioContext) {
        return;
    }

    tocarNota(
        880,
        .3,
        .035,
        "sine"
    );
}


function somTransicao() {

    if (!somAtivo || !audioContext) {
        return;
    }

    tocarNota(
        523.25,
        .5,
        .025,
        "sine"
    );

    tocarNota(
        659.25,
        .7,
        .02,
        "triangle",
        .12
    );
}


function somFinal() {

    if (!somAtivo || !audioContext) {
        return;
    }

    tocarNota(
        261.63,
        3,
        .025,
        "sine"
    );

    tocarNota(
        329.63,
        3,
        .025,
        "sine",
        .2
    );

    tocarNota(
        392,
        3,
        .025,
        "triangle",
        .4
    );

    tocarNota(
        523.25,
        4,
        .035,
        "triangle",
        .7
    );
}


/* TROCA DE TELA */

function abrirTela(nome) {

    const destino =
        document.getElementById(nome);

    if (!destino) {
        return;
    }

    telas.forEach(
        tela => {
            tela.classList.remove("ativa");
        }
    );

    destino.classList.add("ativa");

    telaAtual = nome;

    criarCoracoes(destino);

    const animacoes =
        destino.querySelectorAll(
            ".entrada-animacao"
        );

    animacoes.forEach(
        elemento => {

            elemento.style.animation =
                "none";

            void elemento.offsetWidth;

            elemento.style.animation = "";

        }
    );


    if (nome === "final") {

        destino.classList.remove(
            "final-iniciando"
        );

        void destino.offsetWidth;

        destino.classList.add(
            "final-iniciando"
        );

        somFinal();
    }

    somTransicao();
}


/* ENTRADA */

function entrarNoUniverso() {

    prepararAudio();

    iniciarMusica();

    somClique();

    const coracao =
        document.querySelector(
            ".coracao"
        );

    if (coracao) {

        coracao.style.animation =
            "explodirCoracao .8s forwards";
    }

    setTimeout(
        () => {
            abrirTela("inicio");
        },
        650
    );
}


document
    .getElementById("botaoEntrada")
    .addEventListener(
        "click",
        entrarNoUniverso
    );


/* BOTÕES */

document
    .querySelectorAll("[data-ir]")
    .forEach(botao => {

        botao.addEventListener(
            "click",
            () => {

                abrirTela(
                    botao.dataset.ir
                );

            }
        );

    });


/* CARDS */

document
    .querySelectorAll(".universo-card")
    .forEach(card => {

        card.addEventListener(
            "click",
            () => {

                abrirTela(
                    card.dataset.universo
                );

            }
        );


        card.addEventListener(
            "mousemove",
            evento => {

                if (window.innerWidth < 850) {
                    return;
                }

                const rect =
                    card.getBoundingClientRect();

                const x =
                    evento.clientX -
                    rect.left;

                const y =
                    evento.clientY -
                    rect.top;

                const centroX =
                    rect.width / 2;

                const centroY =
                    rect.height / 2;

                const rotateX =
                    ((y - centroY) / centroY) * -4;

                const rotateY =
                    ((x - centroX) / centroX) * 4;

                card.style.transform =
                    `perspective(900px)
                     rotateX(${rotateX}deg)
                     rotateY(${rotateY}deg)
                     translateY(-5px)`;

            }
        );


        card.addEventListener(
            "mouseleave",
            () => {
                card.style.transform = "";
            }
        );

    });


/* PRÓXIMOS */

document
    .querySelectorAll("[data-proximo]")
    .forEach(botao => {

        botao.addEventListener(
            "click",
            () => {

                abrirTela(
                    botao.dataset.proximo
                );

            }
        );

    });


/* FOTO FINAL */

const fotoFinal =
    document.getElementById(
        "fotoFinalTrigger"
    );


if (fotoFinal) {

    fotoFinal.addEventListener(
        "click",
        () => {

            prepararAudio();

            if (!somAtivo) {
                iniciarMusica();
            }

            somFinal();

            fotoFinal.classList.add(
                "foto-final-ativa"
            );

            setTimeout(
                () => {
                    abrirTela("final");
                },
                700
            );

        }
    );

}


/* ESC */

document.addEventListener(
    "keydown",
    evento => {

        if (evento.key === "Escape") {

            if (
                telaAtual !== "entrada" &&
                telaAtual !== "inicio"
            ) {

                abrirTela("universos");

            }

        }

    }
);


/* SWIPE */

let toqueInicialX = 0;
let toqueFinalX = 0;


document.addEventListener(
    "touchstart",
    evento => {

        toqueInicialX =
            evento.changedTouches[0].screenX;

    },
    { passive: true }
);


document.addEventListener(
    "touchend",
    evento => {

        toqueFinalX =
            evento.changedTouches[0].screenX;

        const distancia =
            toqueFinalX -
            toqueInicialX;

        if (Math.abs(distancia) < 80) {
            return;
        }

        const universos = [
            "bts",
            "hello",
            "sylvanian",
            "chorao",
            "pulgar",
            "michael"
        ];

        const indice =
            universos.indexOf(telaAtual);

        if (indice === -1) {
            return;
        }

        if (distancia < 0) {

            const proximo =
                universos[indice + 1];

            if (proximo) {
                abrirTela(proximo);
            }

        } else {

            const anterior =
                universos[indice - 1];

            if (anterior) {
                abrirTela(anterior);
            }

        }

    },
    { passive: true }
);


/* EFEITOS */

const estilo =
    document.createElement("style");

estilo.textContent = `

@keyframes explodirCoracao {

    0% {
        transform: rotate(-45deg) scale(1);
        opacity: 1;
        filter: blur(0);
    }

    45% {
        transform: rotate(-45deg) scale(1.4);
        opacity: 1;
        filter: blur(2px);
    }

    100% {
        transform: rotate(-45deg) scale(5);
        opacity: 0;
        filter: blur(20px);
    }

}

.foto-final-ativa .foto-final-card {

    animation:
        fotoFinalExplode
        .7s
        cubic-bezier(.16,1,.3,1)
        forwards;

}

.foto-final-ativa .foto-final-glow {

    animation:
        fotoGlowFinal
        .7s
        ease
        forwards;

}

@keyframes fotoFinalExplode {

    0% {
        transform: scale(1);
        filter: brightness(1);
    }

    45% {
        transform: scale(1.08);
        filter: brightness(1.4);
    }

    100% {
        transform: scale(1.35);
        filter: brightness(2) blur(8px);
        opacity: 0;
    }

}

@keyframes fotoGlowFinal {

    0% {
        transform: scale(1);
        opacity: .7;
    }

    100% {
        transform: scale(2);
        opacity: 0;
    }

}

`;

document.head.appendChild(estilo);


/* INÍCIO */

abrirTela("entrada");