export class Effects{
    constructor(){
        this.shake=0;
        this.flash=0;
        this.shakePower=0;
        this.message='';
        this.messageTimer=0;

        this.messageElement=
            document.getElementById(
                'game-message'
            );

        this.flashElement=
            document.getElementById(
                'game-flash'
            );
    }

    triggerLineClear(lines){
        const shake={
            1:6,
            2:11,
            3:17,
            4:30
        };

        const flash={
            1:.22,
            2:.3,
            3:.38,
            4:.5
        };

        this.shake=shake[lines]||6;
        this.shakePower=this.shake;
        this.flash=flash[lines]||.22;
    }

    showCombo(combo){
        if(combo<2){
            return;
        }

        this.message=`COMBO ×${combo}`;
        this.messageTimer=700;

        this.playMessage();
    }

    showTetris(){
        this.message='TETRIS!';
        this.messageTimer=950;
        this.shake=32;
        this.shakePower=32;
        this.flash=.5;

        this.playMessage();
    }

    playMessage(){
        if(!this.messageElement){
            return;
        }

        this.messageElement.classList.remove(
            'active'
        );

        void this.messageElement.offsetWidth;

        this.messageElement.classList.add(
            'active'
        );
    }

    update(dt){
        const seconds=dt/1000;

        if(this.shake>0){
            this.shake-=48*seconds;

            if(this.shake<0){
                this.shake=0;
            }
        }

        if(this.flash>0){
            this.flash-=4.8*seconds;

            if(this.flash<0){
                this.flash=0;
            }
        }

        if(this.messageTimer>0){
            this.messageTimer-=dt;

            if(this.messageTimer<=0){
                this.messageTimer=0;
                this.message='';
            }
        }
    }

    updateMessage(){
        if(!this.messageElement){
            return;
        }

        this.messageElement.textContent=
            this.messageTimer>0
                ?this.message
                :'';

        this.messageElement.style.opacity=
            this.messageTimer>0
                ?'1'
                :'0';
    }

    applyShake(element){
        if(!element){
            return;
        }

        if(this.shake<=0){
            element.style.transform='';
            return;
        }

        const intensity=this.shake;

        const x=(Math.random()-.5)*intensity;
        const y=(Math.random()-.5)*intensity;

        const rotate=
            (Math.random()-.5)*
            Math.min(2.5,intensity*.08);

        element.style.transform=
            `translate3d(${x}px,${y}px,0) rotate(${rotate}deg)`;
    }

    applyFlash(){
        if(!this.flashElement){
            return;
        }

        const value=
            Math.max(
                0,
                Math.min(.55,this.flash)
            );

        this.flashElement.style.opacity=value;

        this.flashElement.classList.toggle(
            'active',
            value>0.01
        );
    }

    reset(){
        this.shake=0;
        this.flash=0;
        this.shakePower=0;
        this.message='';
        this.messageTimer=0;

        if(this.flashElement){
            this.flashElement.style.opacity='0';
            this.flashElement.classList.remove(
                'active'
            );
        }

        if(this.messageElement){
            this.messageElement.textContent='';
            this.messageElement.style.opacity='0';
            this.messageElement.classList.remove(
                'active'
            );
        }
    }
}
