import React from 'react';
import './common.css'
import utility from './utility';

function RPGButton(props) 
{
    let colorClass = props.rpgColor ? props.rpgColor : "";

    return (
            <button id={props.id} className={"rpg-btn " + props.className} >
                <p onClick={props.onClick} className={colorClass}>
                    <span className={"bg " + colorClass}></span>
                    <span className={"base " + colorClass}></span>
                    <span className="text">{props.children}</span>
                </p>
            </button>);
}

function RPGTextBox(props) {
    return (
        <div id={props.id} className="inp">
            <input type="text" id="inp" placeholder="&nbsp;" onInput={props.onInput}/>
            <span className="label">{props.children}</span>
            <span className="focus-bg"></span>
        </div>
    );
}

function RPGCard(props) {
    return (
        <div className={"rpg-card " + props.className}>
            {props.children}
        </div>
    );
}

function RPGProgressBar(props) {
    let progress = props.progress;
    if(!progress) {
        progress = 0;
    }
    let filledStyle = {flexGrow: progress};
    let emptyStyle = {flexGrow: 1-progress};

    if(props.color) {
        filledStyle["background"] = props.color;
    }

    return (
        <div id={props.id} className={"rpg-bar " + props.className}>
            <div style={filledStyle} className="rpg-filledbar"></div>
            <div style={emptyStyle} className="rpg-emptybar"></div>
        </div>
    );
}

function RPGProgressBar_setProperties(id, properties) {
    const progressBar = document.getElementById(id);
    if(!progressBar) {
        return;
    }

    const elements = progressBar.getElementsByTagName('div');
    elements[0]['style']['flex-grow'] = properties.progress;
    elements[1]['style']['flex-grow'] = 1-properties.progress;
}

function RPGProgressBar_onTransitionEnd(id, callback) {
    const fillBar = document.querySelector(`#${id} div`);
    if(!fillBar) {
        return;
    }
    fillBar.ontransitionend = callback;
}

function RPGMonsterCard(props) {
    return (
        <RPGCard className="rpg-monster-card">
            <h3>{props.monsterName}</h3>
            <div className="rpg-monster-avatar-container">
                <img className="rpg-monster-avatar" src={props.monsterImage}/>
            </div>
            <h5>Level {props.level}</h5>
            <h5>Attack</h5>
            <RPGProgressBar progress={props.attack}/>
            <h5>Defence</h5>
            <RPGProgressBar progress={props.defence}/>
            <h5>Magic</h5>
            <RPGProgressBar progress={props.magic}/>
            <RPGButton className="rpg-monster-card-btn" onClick={props.onFightClick}>Fight!</RPGButton>
        </RPGCard>
    );
}

function RPGMediaScroller(props) {
    return (
        <div className={"rpg-media-scroller " + props.className} id={props.id}>
            {props.children}
        </div>
    );
}

function RPGSprite(props) {

    const autoplay = utility.getValue(props.autoplay, false);
    const frameWidth = utility.getValue(props.frameWidth, 50);
    const frameHeight = utility.getValue(props.frameHeight, 50);
    const frameCount = utility.getValue(props.frameCount, 1);
    const duration = utility.getValue(props.duration, 1);
    const iterationCount = utility.getValue(props.iterationCount, "infinite");
    const spriteSheet = utility.getValue(props.spriteSheet, "");

    const containerStyle = {
        aspectRatio: `${frameWidth} / ${frameHeight}`,
    };

    const style = {
        width: `${frameCount * 100}%`,
        animationDuration: `${duration}s`,
        animationIterationCount: `${iterationCount}`,
        animationTimingFunction: `steps(${frameCount})`,
        animationPlayState: autoplay ? 'running' : 'paused',
        animationName: 'play-rpg-sprite'
    };

    return(
    <div id={props.id} className="rpg-sprite" style={containerStyle} onClick={props.onClick}>
        <img src={spriteSheet} style={style}></img>
    </div>
);
}

function RPGSprite_play(id) {
    const sprite = document.querySelector(`#${id} img`);
    if(!sprite) {
        return;
    } 

    sprite.style['animation-name'] = '';

    requestAnimationFrame((time) => {
        requestAnimationFrame((time) => {
            sprite.style['animation-name'] = 'play-rpg-sprite';
            sprite.style['animation-play-state'] = 'running';
        });
    });
}

function RPGSprite_onAnimationEnd(id, callback) {
    const sprite = document.querySelector(`#${id} img`);
    if(!sprite) {
        return;
    }

    sprite.onanimationend = callback;    
}

function RPGSprite_setProperties(id, properties) {
    const autoplay = utility.getValue(properties.autoplay, false);
    const frameWidth = utility.getValue(properties.frameWidth, 50);
    const frameHeight = utility.getValue(properties.frameHeight, 50);
    const frameCount = utility.getValue(properties.frameCount, 1);
    const duration = utility.getValue(properties.duration, 1);
    const iterationCount = utility.getValue(properties.iterationCount, "infinite");
    const spriteSheet = utility.getValue(properties.spriteSheet, "");

    const container = document.getElementById(id);
    const sprite = container.querySelector(`img`);
    if(!sprite) {
        return;
    }

    container.style['aspect-ratio'] = `${frameWidth} / ${frameHeight}`;

    sprite.style['width'] = `${frameCount * 100}%`;
    sprite.style['animation-duration'] = `${duration}s`;
    sprite.style['animation-iteration-count'] = iterationCount;
    sprite.style['animation-timing-function'] = `steps(${frameCount})`;
    sprite.style['animation-play-state'] = autoplay ? 'running' : 'paused';
    sprite.setAttribute('src', spriteSheet)
}

const RPGUI = {
    Button: RPGButton,
    TextBox: RPGTextBox,
    Card: RPGCard,
    MonsterCard: RPGMonsterCard,
    ProgressBar: RPGProgressBar,
    ProgressBar_setProperties: RPGProgressBar_setProperties,
    ProgressBar_onTransitionEnd: RPGProgressBar_onTransitionEnd,
    MediaScroller: RPGMediaScroller,
    Sprite: RPGSprite,
    Sprite_play: RPGSprite_play,
    Sprite_onAnimationEnd: RPGSprite_onAnimationEnd,
    RPGRed: "#ff4655",
    RPGBlue: "#3852ff",
    RPGGreen: "#2bff5d"
};

export default RPGUI;