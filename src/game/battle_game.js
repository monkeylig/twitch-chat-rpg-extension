import React from 'react';
import { useState } from 'react';
import { useRef } from 'react';
import '../App.css';
import RPGUI from '../common/rpg-ui-elements';
import backend from '../common/backend-calls';

import './battle_game.css';

class BattleGame extends React.Component {
    constructor(props) {
        super(props);
        this.gameId = props.gameId;
        this.battleId = props.id;
        this.player = props.player;
        this.monster = props.monster;
        this.strikeAnim = Object.assign({}, props.strikeAnim);
        this.strikeAnim.spriteSheet = backend.getResourceURL(props.strikeAnim.spriteSheet);

        this.state = {
            controls: 'battle',
            dialog: '',
            playerHealth: this.player.health,
            monsterHealth: this.monster.health,
            strikeLevel: this.player.strikeLevel
        };

        this.onStrike = this.onStrike.bind(this);
        this.backToGame = this.backToGame.bind(this);
        this.runBattleIteration = this.runBattleIteration.bind(this);
    }

    battleAnimationCommand(animProperties) {
        const sprite = document.querySelector(`#effect`);
        sprite.style['transform'] = `translateX(${animProperties.xPosition})`
        RPGUI.Sprite_play("effect");

        return new Promise((resolve, reject) => {
            RPGUI.Sprite_onAnimationEnd("effect", resolve);
        });
    }

    healthChangeCommand(target, newHealth) {
        let headerId;
        
        if(target == this.player) {
            this.setState({playerHealth: newHealth});
            headerId = 'left_header';
        }
        else {
            this.setState({monsterHealth: newHealth});
            headerId = 'right_header';
        }

        return new Promise((resolve, reject) => {
            BattleHeader_onTransitionEnd(headerId, (event) => { resolve(); });
        });
    }

    displayDialogCommand(dialog) {
        this.setState({ controls: 'type-writer', dialog: dialog});
        return new Promise((resolve, reject) => {
            this.onDialogComplete = resolve;
        });
    }

    getAnimProperties(step, isStrike) {
        if (isStrike) {
            return {
                iterationCount: 1,
                frameWidth: 1024,
                frameHeight: 1024,
                frameCount: 16,
                spriteSheet: this.strikeAnim.spriteSheet,
                duration: 0.5,
                xPosition: step.actorId == this.player.id ? '20%' : '-20%'
            };
        }
        return {};
    }
    
    async runBattleIteration(battleUpdate) {
        this.setState({
            strikeLevel: battleUpdate.player.strikeLevel
        });

        for(const step of battleUpdate.steps) {
            switch (step.type) {
                case 'strike':
                    await this.displayDialogCommand(step.description);
                    await this.battleAnimationCommand(this.getAnimProperties(step, true));

                    const target = step.actorId == this.player.id ? this.monster : this.player;
                    const newHealth = step.actorId == this.player.id ? battleUpdate.monster.health : battleUpdate.player.health;

                    await this.healthChangeCommand(target, newHealth);
                    break;
                case 'battle_end':
                    await this.displayDialogCommand(step.description);

                    this.setState({
                        result: battleUpdate.result,
                        oldLevel: this.player.level,
                        newLevel: battleUpdate.player.level
                    });

                    this.player = battleUpdate.player;
                    const dialog = document.querySelector(`dialog`);
                    dialog.showModal();
                    break;
            }
        }

        this.setState({ controls: 'battle' });
    }

    onStrike() {
        this.setState({ controls: 'waiting' });
        backend.battleAction(this.battleId, 'strike')
        .then(this.runBattleIteration)
        .catch(error => {
            this.setState({ controls: 'error' });
        });
    }

    backToGame() {
        backend.getGame(this.gameId)
        .then(gameUpdate => {
            this.props.onNavigate('game', {playerData: this.player, gameState: gameUpdate});
        });
    }

    render() {

        const controlLables = {
            strikeText: this.state.strikeLevel == 2 ? this.player.weapon.strikeAbility.name : "Strike"
        };


    
        return (
        <div id="content-frame" className="dark">
            <div id="header-section">
                <BattleHeader title={this.player.name} level={this.player.level} id="left_header" health={this.state.playerHealth/this.player.maxHealth}/>
                <BattleHeader title={this.monster.name} level={this.monster.level} id="right_header" health={this.state.monsterHealth/this.monster.maxHealth}/>
            </div>
            <div id="avatar-section">
                <div id="battle-effects">
                    <RPGUI.Sprite id="effect" iterationCount={1} frameWidth={1024} frameHeight={1024} frameCount={16} spriteSheet={this.strikeAnim.spriteSheet} duration={0.5}/>
                </div>
                <BattleAvatar image={backend.getResourceURL(this.player.avatar)} id="right-avatar">
                    <CounterBar id="ap_counter" title="AP" maxCount={3} currentCount={this.player.ap}/>
                </BattleAvatar>
                <BattleAvatar image={backend.getResourceURL(this.monster.avatar)} id="left-avatar"/>
            </div>
            <BattleControls controls={this.state.controls} text={this.state.dialog} onStrike={this.onStrike} onDialogComplete={this.onDialogComplete} {...controlLables}/>
            <div id="options-section">
                <RPGUI.Button className="battle-btn" rpgColor="yellow">Escape</RPGUI.Button>
            </div>
            <dialog id='battle-dialog'>
                { this.state.result ? <ResultDialog player={this.player} result={this.state.result} oldLevel={this.state.oldLevel} newLevel={this.state.newLevel} onContinue={this.backToGame}/> : <></>}
            </dialog>
        </div>
        );
    }
}

function ResultDialog({player, result, oldLevel, newLevel, onContinue}) {

    const startingExp = newLevel == oldLevel ? (player.exp - result.expAward) / player.expToNextLevel: 0;
    const [level, setLevel] = useState(oldLevel);
    const [expProgress, setExpProgress] = useState(startingExp);
    const animDone = useRef(false);
    const intervalRef = useRef(0);

    if(result.winner != player.id) {
        return (
            <div className='container'>
                <h2>Defeat</h2>
            </div>
        );
    }

    if(!animDone.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = setTimeout(() => {
            if(level != newLevel) {
                setLevel(level + 1);
            }
            else {
                setExpProgress(player.exp / player.expToNextLevel);
                animDone.current = true;
            }
        }, 500);
    }

    return (
        <div className='container'>
            <h2>Victory!</h2>
            <h3>+{result.expAward} exp</h3>
            <RPGUI.ProgressBar id={`battle-exp-bar`} progress={expProgress} color={'#3852ff'}/>
            <h3>Level {level}</h3>
            <RPGUI.Button className="battle-btn" onClick={onContinue}>Continue</RPGUI.Button>
        </div>
    );
}

function BattleControls(props) {
    let controls = <p>Waiting</p>;

    if(props.controls == 'battle') {
        controls = (
            <div id="battle-controls" className='control-box'>
                <RPGUI.Button className="battle-btn" rpgColor="blue" onClick={props.onStrike}>{props.strikeText}</RPGUI.Button>
                <RPGUI.Button className="battle-btn">Ajfugheldjgh</RPGUI.Button>
                <RPGUI.Button className="battle-btn">Ability 2</RPGUI.Button>
                <RPGUI.Button className="battle-btn">Ability 3</RPGUI.Button>
            </div>
        );
    }
    else if(props.controls === 'type-writer') {
        controls = (
        <div className='control-box' id='battle-text-box'>
            <TypeWriter onComplete={props.onDialogComplete}>{props.text}</TypeWriter>
        </div>
        );
    }

    else if(props.controls == 'error') {
        controls = <p>Sorry something went wrong</p>;
    }

    return controls;
}

function TypeWriter(props) {

    const [message, setMessage] = useState('');
    let srcIndex = useRef(0);
    let intervalRef = useRef(0);
    let oldMessage = useRef(props.children);

    if(oldMessage.current !== props.children) {
        srcIndex.current = 0;
        intervalRef.current = 0;
        oldMessage.current = props.children;
    }

    const typerFunction = () => {
        setMessage(props.children.substring(0, srcIndex.current + 1));
        srcIndex.current += 1;

        if (srcIndex.current >= props.children.length && props.onComplete)
        {
            props.onComplete();

        }
    }

    clearTimeout(intervalRef.current);
    if (srcIndex.current < props.children.length) {
        intervalRef.current = setTimeout(typerFunction, 50);
    }

    return <p className="type-writer">{message}</p>
}

function BattleHeader(props) {
    let healthColor = (props.health > 0.3) ? '#2bff5d' : '#ff4655';

    return (
        <div className="battle_header" id={props.id}>
            <h2>{props.title}</h2>
            <p>Level {props.level}</p>
            <RPGUI.ProgressBar id={`${props.id}-progress-bar`} progress={props.health} color={healthColor}/>
        </div>
    );
}

function BattleHeader_onTransitionEnd(id, callback) {
    RPGUI.ProgressBar_onTransitionEnd(`${id}-progress-bar`, callback);
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