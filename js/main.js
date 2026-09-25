import {Game} from './game.js';

const menuScreen=
    document.getElementById('menu-screen');

const gameScreen=
    document.getElementById('game-screen');

const resultScreen=
    document.getElementById('result-screen');

const modeButtons=
    document.querySelectorAll('.mode-card');

const pauseButton=
    document.getElementById('pause-button');

const soundButton=
    document.getElementById('sound-button');

const resumeButton=
    document.getElementById('resume-button');

const restartButton=
    document.getElementById('restart-button');

const menuButton=
    document.getElementById('menu-button');

const playAgainButton=
    document.getElementById('play-again-button');

const resultMenuButton=
    document.getElementById('result-menu-button');

const guideButton=
    document.getElementById('guide-button');

const menuGuideButton=
    document.getElementById('menu-guide-button');

const guideOverlay=
    document.getElementById('guide-overlay');

const guideClose=
    document.getElementById('guide-close');

const guideBackdrop=
    document.getElementById('guide-backdrop');

const mobileControls=
    document.getElementById('mobile-controls');

const mobileButtons=
    document.querySelectorAll('[data-mobile-action]');

let selectedMode=null;
let game=null;


function showScreen(screen){

    [
        menuScreen,
        gameScreen,
        resultScreen
    ].forEach(item=>{
        item.classList.remove('active');
    });

    screen.classList.add('active');
}


function updateSound(){

    if(!game){
        return;
    }

    soundButton.textContent=
        game.audio.enabled
            ?'SOUND ON'
            :'SOUND OFF';

    soundButton.classList.toggle(
        'sound-off',
        !game.audio.enabled
    );
}


function startGame(mode){

    selectedMode=mode;

    if(game){
        game.stop();
    }

    showScreen(gameScreen);

    game=new Game(mode);

    game.start();

    updateSound();
}


function menu(){

    if(game){
        game.stop();
        game=null;
    }

    closeGuide();

    showScreen(menuScreen);
}


function openGuide(){

    guideOverlay.classList.add(
        'active'
    );

    document.body.classList.add(
        'guide-open'
    );
}


function closeGuide(){

    guideOverlay.classList.remove(
        'active'
    );

    document.body.classList.remove(
        'guide-open'
    );
}


modeButtons.forEach(button=>{

    button.addEventListener(
        'click',
        ()=>{
            startGame(
                button.dataset.mode
            );
        }
    );

});


pauseButton.addEventListener(
    'click',
    ()=>{
        game?.togglePause();
    }
);


soundButton.addEventListener(
    'click',
    ()=>{

        if(!game){
            return;
        }

        game.audio.toggle();

        updateSound();
    }
);


resumeButton.addEventListener(
    'click',
    ()=>{
        game?.resume();
    }
);


restartButton.addEventListener(
    'click',
    ()=>{
        startGame(selectedMode);
    }
);


menuButton.addEventListener(
    'click',
    menu
);


playAgainButton.addEventListener(
    'click',
    ()=>{
        startGame(selectedMode);
    }
);


resultMenuButton.addEventListener(
    'click',
    menu
);


guideButton.addEventListener(
    'click',
    openGuide
);


menuGuideButton.addEventListener(
    'click',
    openGuide
);


guideClose.addEventListener(
    'click',
    closeGuide
);


guideBackdrop.addEventListener(
    'click',
    closeGuide
);


function handleMobileAction(action){

    if(!game || !game.running || game.paused){
        if(action==='pause' && game && game.running){
            game.togglePause();
        }
        return;
    }

    if(action==='left'){
        game.move(-1);
        return;
    }

    if(action==='right'){
        game.move(1);
        return;
    }

    if(action==='rotate-left'){
        game.rotate(-1);
        return;
    }

    if(action==='rotate-right'){
        game.rotate(1);
        return;
    }

    if(action==='drop'){
        game.hardDrop();
        return;
    }

    if(action==='hold'){
        game.hold();
        return;
    }

    if(action==='pause'){
        game.togglePause();
    }
}


mobileButtons.forEach(button=>{

    const action=button.dataset.mobileAction;

    button.addEventListener('pointerdown',event=>{
        event.preventDefault();
        button.classList.add('pressed');

        if(button.setPointerCapture){
            button.setPointerCapture(event.pointerId);
        }

        handleMobileAction(action);
    });

    const release=event=>{
        event.preventDefault();
        button.classList.remove('pressed');
    };

    button.addEventListener('pointerup',release);
    button.addEventListener('pointercancel',release);
    button.addEventListener('lostpointercapture',()=>{
        button.classList.remove('pressed');
    });
});


window.addEventListener(
    'keydown',
    event=>{

        if(
            event.code==='Escape' &&
            guideOverlay.classList.contains(
                'active'
            )
        ){

            event.stopPropagation();

            closeGuide();
        }

    },
    true
);