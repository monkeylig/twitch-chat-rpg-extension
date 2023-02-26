import React from 'react';
import './common.css'

function RPGButton(props) {
    return (
            <div id={props.id} className={"rpg-btn " + props.className} >
                    <p onClick={props.onClick}>
                            <span className="bg"></span>
                            <span className="base"></span>
                            <span className="text">{props.children}</span>
                    </p>
            </div>);
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
        progress = 0.4;
    }
    let filledStyle = {flexGrow: progress};
    let emptyStyle = {flexGrow: 1-progress};

    return (
        <div className="rpg-bar">
            <div style={filledStyle} className="rpg-filledbar"></div>
            <div style={emptyStyle} className="rpg-emptybar"></div>
        </div>
    );
}

function RPGMonsterCard(props) {
    return (
        <RPGCard className="rpg-monster-card">
            <h3>{props.monsterName}</h3>
            <div className="rpg-monster-avatar-container">
                <img className="rpg-monster-avatar" src="./monster_bonegolem.png"/>
            </div>
            <h5>Level {props.level}</h5>
            <h5>Attack</h5>
            <RPGProgressBar progress={props.attack}/>
            <h5>Defence</h5>
            <RPGProgressBar progress={props.defence}/>
            <h5>Magic</h5>
            <RPGProgressBar progress={props.magic}/>
            <RPGButton className="rpg-monster-card-btn">Fight!</RPGButton>
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

const RPGUI = {
    Button: RPGButton,
    TextBox: RPGTextBox,
    Card: RPGCard,
    MonsterCard: RPGMonsterCard,
    ProgressBar: RPGProgressBar,
    MediaScroller: RPGMediaScroller
};

export default RPGUI;