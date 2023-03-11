import React from 'react';
import '../App.css';
import RPGUI from '../common/rpg-ui-elements';
import hero from './hero_paladin.png'
import skell from './monster_bonegolem.png'

import './battle_game.css';

class BattleGame extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
        <div id="content-frame" className="dark">
            <div id="header-section">
                <BattleHeader title="Skellington" level="50" id="left_header" health={0.75}/>
                <BattleHeader title="Jhard" level="50" id="right_header" health={0.3}/>
            </div>
            <div id="avatar-section">
                <BattleAvatar image={skell} id="left-avatar"/>
                <BattleAvatar image={hero} id="right-avatar">
                    <CounterBar id="ap_counter" title="AP" maxCount={3} currentCount={3}/>
                </BattleAvatar>
            </div>
            <div id="battle-controls">
                <RPGUI.Button className="battle-btn" rpgColor="blue">Strike</RPGUI.Button>
                <RPGUI.Button className="battle-btn">Ajfugheldjgh</RPGUI.Button>
                <RPGUI.Button className="battle-btn">Ability 2</RPGUI.Button>
                <RPGUI.Button className="battle-btn">Ability 3</RPGUI.Button>
            </div>
            <div id="options-section">
                <RPGUI.Button className="battle-btn" rpgColor="yellow">Escape</RPGUI.Button>
            </div>
        </div>
        );
    }
}

function BattleHeader(props) {
    let healthColor = (props.health > 0.3) ? '#2bff5d' : '#ff4655';

    return (
        <div className="battle_header" id={props.id}>
            <h2>{props.title}</h2>
            <p>Level {props.level}</p>
            <RPGUI.ProgressBar progress={props.health} color={healthColor}/>
        </div>
    );
}

function BattleAvatar(props) {
    return (
        <div className="battle-avatar">
            <img id={props.id} src={props.image}/>
            {props.children}
        </div>
    );
}

function CounterBar(props) {
    const items = [];

    for(let i=0; i < props.maxCount; i++) {
        if(i >= props.currentCount) {
            items.push(<div key={i} className="item" style={{opacity: 0}}></div>);    
        }
        else {
            items.push(<div key={i} className="item"></div>);
        }
    }
    
    return (
        <div className="counter_bar" id={props.id}>
            <p>{props.title}:</p>{items}
        </div>
    );
}

export default BattleGame;