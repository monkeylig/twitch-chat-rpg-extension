import React from 'react';
import { useState } from 'react';
import { useRef } from 'react';
import '../App.css';
import RPGUI from '../common/rpg-ui-elements';
import backend from '../common/backend-calls';

import './battle_game.css';

function preloadImages(array, preloadImages) {
    if (!preloadImages.list) {
        preloadImages.list = [];
    }
    var list = preloadImages.list;
    for (var i = 0; i < array.length; i++) {
        var img = new Image();
        img.onload = function() {
            var index = list.indexOf(this);
            if (index !== -1) {
                // remove image from the array once it's loaded
                // for memory consumption reasons
                list.splice(index, 1);
            }
        }
        list.push(img);
        img.src = array[i];
    }
}

class BattleGame extends React.Component {
    constructor(props) {
        super(props);
        this.gameId = props.gameId;
        this.battleId = props.id;
        this.player = props.player;
        this.monster = props.monster;
        this.strikeAnim = Object.assign({}, props.strikeAnim);
        this.strikeAnim.spriteSheet = backend.getResourceURL(props.strikeAnim.spriteSheet);
        this.preloadImages = {};

        const assets = [this.strikeAnim.spriteSheet];

        for(const ability of this.player.abilities) {
            assets.push(backend.getResourceURL(ability.animation.spriteSheet));
        }

        for(const ability of this.monster.abilities) {
            assets.push(backend.getResourceURL(ability.animation.spriteSheet));
        }

        preloadImages(assets, preloadImages);

        this.state = {
            controls: 'battle',
            dialog: '',
            playerHealth: this.player.health,
            monsterHealth: this.monster.health,
            playerAp: 3,
            strikeLevel: this.player.strikeLevel,
            items: this.player.bag.items,
            oldLevel: this.player.level,
            newLevel: this.player.level
        };

        this.onStrike = this.onStrike.bind(this);
        this.onAbilityClicked = this.onAbilityClicked.bind(this);
        this.onEscapeClicked = this.onEscapeClicked.bind(this);
        this.onItemClicked = this.onItemClicked.bind(this);
        this.onItemButtonClicked = this.onItemButtonClicked.bind(this);
        this.backToGame = this.backToGame.bind(this);
        this.runBattleIteration = this.runBattleIteration.bind(this);
    }

    waitCommand(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    battleAnimationCommand(animProperties) {
        const sprite = document.querySelector(`#effect`);
        sprite.style['transform'] = `scaleX(${animProperties.xScale})`;
        sprite.style['left'] = animProperties.xPosition;
        RPGUI.Sprite_setProperties('effect', animProperties)
        
        // Give the DOM time to apply changes before playing
        setTimeout(() => {RPGUI.Sprite_play("effect")}, 1);

        return new Promise((resolve, reject) => {
            RPGUI.Sprite_onAnimationEnd("effect", resolve);
        });
    }

    healthChangeCommand(target, newHealth) {
        let headerId;
        
        if(target.id === this.player.id) {
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

    async syncHealthCommand(target, currentHealth) {
        if(target.health !== currentHealth) {
            await this.healthChangeCommand(target, target.health);
        }
    }

    displayDialogCommand(dialog) {
        this.setState({ controls: 'type-writer', dialog: dialog});
        return new Promise((resolve, reject) => {
            this.onDialogComplete = async () => {
                await this.waitCommand(500);
                resolve();
            };
        });
    }

    getAnimProperties(step) {
        
        if(!step.animation) {
            return {
                iterationCount: 1,
                frameWidth: 1024,
                frameHeight: 1024,
                frameCount: 16,
                spriteSheet: this.strikeAnim.spriteSheet,
                duration: 0.5,
                xPosition: step.actorId == this.player.id ? '200%' : '-200%'
            };
        }
        const animProperties = {
            iterationCount: 1,
            frameWidth: step.animation.frameWidth,
            frameHeight: step.animation.frameHeight,
            frameCount: step.animation.frameCount,
            spriteSheet: backend.getResourceURL(step.animation.spriteSheet),
            duration: step.animation.duration,
            imageRendering: step.animation.imageRendering ? step.animation.imageRendering : 'auto'
        };

        switch(step.animation.positioning) {
            case 'self':
                animProperties.xScale = '1';
                if(step.actorId == this.player.id) {
                    animProperties.xPosition = '-20%';
                }
                else {
                    animProperties.xPosition = '20%';
                }
                break;
            case 'opponent':
            default:
                if(step.actorId == this.player.id) {
                    animProperties.xPosition = '20%';
                    animProperties.xScale = '1';
                }
                else {
                    animProperties.xPosition = '-20%';
                    animProperties.xScale = '-1'
                }
                break;
        }

        return animProperties;
    }
    
    async runBattleIteration(battleUpdate) {
        this.setState({
            strikeLevel: battleUpdate.player.strikeLevel,
            items: battleUpdate.player.bag.items
        });

        let gameOver = false;
        for(const step of battleUpdate.steps) {
            switch (step.type) {
                case 'battle_end':
                    if(battleUpdate.result.endCondition !== 'escape') {
                        await this.waitCommand(1000);
                    }
                    await this.displayDialogCommand(step.description);

                    this.setState({
                        result: battleUpdate.result,
                        oldLevel: this.player.level,
                        newLevel: battleUpdate.player.level
                    });
                    gameOver = true;
                    this.player = battleUpdate.player;
                    const dialog = document.querySelector(`dialog`);
                    dialog.showModal();
                    break;
                case 'info':
                    if(step.description && step.description != '') {
                        await this.displayDialogCommand(step.description);
                    }

                    if(step.animation) {
                        await this.battleAnimationCommand(this.getAnimProperties(step));
                    }
                    break;
                case 'damage':{
                    const target = step.targetId === this.player.id ? this.player : this.monster;
                    const oldHealth = step.targetId === this.player.id ? this.state.playerHealth : this.state.monsterHealth;

                    if(step.damage > 0) {
                        await this.healthChangeCommand(target, oldHealth - step.damage);
                    }
                    break;
                }
                case 'revive':
                    await this.waitCommand(1000);
                case 'heal': {
                    const target = step.targetId === this.player.id ? this.player : this.monster;
                    const oldHealth = step.targetId === this.player.id ? this.state.playerHealth : this.state.monsterHealth;

                    if(step.healAmount > 0) {
                        await this.healthChangeCommand(target, oldHealth + step.healAmount);
                    }
                    break;
                }

            }

            if(step.description && step.type !== 'info' && step.type !== 'battle_end') {
                await this.displayDialogCommand(step.description);
            }
        }

        this.setState({playerAp: battleUpdate.player.ap});

        await this.syncHealthCommand(battleUpdate.player, this.state.playerHealth);
        await this.syncHealthCommand(battleUpdate.monster, this.state.monsterHealth);

        if(gameOver) {
            this.setState({ controls: 'end' });
        }
        else {
            this.setState({ controls: 'battle' });
        }
    }

    onStrike() {
        this.#commitBattleAction({actionType: 'strike'});
    }

    onAbilityClicked(name) {
        this.setState({ controls: 'waiting' });
        backend.battleAction(this.battleId, {actionType: 'ability', abilityName: name})
        .then(this.runBattleIteration)
        .catch(error => {
            if(error.errorCode === 16) {
                this.displayDialogCommand(`${this.player.name} does not have enough AP to use this ability.`)
                .then(() => {
                    this.setState({ controls: 'battle' });
                })
                .catch(() => {this.setState({ controls: 'error' })});
            }
            else {
                this.setState({ controls: 'error' });
            }
        });
    }

    onEscapeClicked() {
        this.#commitBattleAction({actionType: 'escape'});
    }

    onItemClicked(name) {
        this.#commitBattleAction({actionType: 'item', itemName: name});
    }

    onItemButtonClicked() {
        if(this.state.controls === 'item') {
            this.setState({ controls: 'battle' });
        }
        else {
            this.setState({ controls: 'item' });
        }
    }

    #commitBattleAction(battleRequest) {
        if(this.state.controls === 'waiting') {
            return;
        }
        this.setState({ controls: 'waiting' });
        backend.battleAction(this.battleId, battleRequest)
        .then(this.runBattleIteration)
        .catch(error => {
            console.log(error);
            this.setState({ controls: 'error' });
        });
    }

    backToGame() {
        Promise.all([backend.getPlayer(this.player.id), backend.getGame(this.gameId)])
        .then((state) => {
            this.props.onNavigate('game', {playerData: state[0], gameState: state[1]});
        });
    }

    render() {

        const controlLables = {
            strikeText: this.state.strikeLevel == 2 ? this.player.weapon.strikeAbility.name : "Strike"
        };


    
        return (
        <div id="content-frame" className="dark" style={{overflow: 'hidden'}}>
            <div id="header-section">
                <BattleHeader title={this.player.name} level={this.player.level} id="left_header" health={this.state.playerHealth/this.player.maxHealth}/>
                <BattleHeader title={this.monster.name} level={this.monster.level} id="right_header" health={this.state.monsterHealth/this.monster.maxHealth}/>
            </div>
            <div id="avatar-section">
                <div id="battle-effects">
                    <RPGUI.Sprite id="effect" iterationCount={1} frameWidth={1024} frameHeight={1024} frameCount={16} spriteSheet={this.strikeAnim.spriteSheet} duration={0.5}/>
                </div>
                <BattleAvatar image={backend.getResourceURL(this.player.avatar)} id="right-avatar">
                    <CounterBar id="ap_counter" title="AP" maxCount={3} currentCount={this.state.playerAp}/>
                </BattleAvatar>
                <BattleAvatar image={backend.getResourceURL(this.monster.avatar)} id="left-avatar"/>
            </div>
            <BattleControls controls={this.state.controls} text={this.state.dialog} abilities={this.player.abilities} items={this.state.items} onStrike={this.onStrike} onAbilityClicked={this.onAbilityClicked}
                onItemClicked={this.onItemClicked} onDialogComplete={this.onDialogComplete} onContinue={this.backToGame} {...controlLables}/>
                
            {(this.state.controls === 'battle' || this.state.controls === 'item') &&
            <div id="options-section" style={{display: 'flex', justifyContent: 'space-between'}}>
                <RPGUI.Button className="battle-btn" rpgColor="yellow" onClick={this.onEscapeClicked}>Escape</RPGUI.Button>
                <RPGUI.Button className="battle-btn" rpgColor="yellow" onClick={this.onItemButtonClicked}>{this.state.controls === 'item' ? 'Cancel' : 'Items'}</RPGUI.Button>
            </div>}
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
                <h2>{result.endCondition === 'escape' ? 'Escaped!' : 'Defeat'}</h2>
                {result.endCondition !== 'escape' ? <p>Your HP will be partially restored.</p> : <p>You have made it to safety.</p>}
                <RPGUI.Button className="battle-btn" onClick={onContinue}>Continue</RPGUI.Button>
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

    const drops = <ol className='rpg-list'>{result.drops.map((drop, index) => {
        return (
        <li className='drop-item' key={index}>
            <img className='drop-icon' src={backend.getResourceURL(drop.content.icon)}/><span>{drop.content.name}</span>
        </li>);
    })}</ol>
    return (
        <div className='container'>
            <h2>Victory!</h2>
            <h3>+{result.expAward} exp</h3>
            <RPGUI.ProgressBar id={`battle-exp-bar`} progress={expProgress} color={'#3852ff'}/>
            <h3>Level {level}</h3>
            {result.drops.length ? drops : false}
            <RPGUI.Button className="battle-btn" onClick={onContinue}>Continue</RPGUI.Button>
        </div>
    );
}

function BattleControls({controls, text, strikeText, abilities, items, onStrike, onAbilityClicked, onItemClicked, onDialogComplete, onContinue}) {
    let output = <div id="battle-controls" className='control-box' style={{color: 'white'}}><p>Waiting</p></div>;

    if(controls == 'battle') {
        const buttons = [<RPGUI.Button key='strike' className="battle-btn" rpgColor="blue" onClick={onStrike}>{strikeText}</RPGUI.Button>];
        for(const ability of abilities) {
            buttons.push(<RPGUI.Button key={ability.name} className="battle-btn" onClick={()=>onAbilityClicked ? onAbilityClicked(ability.name) : false}>{ability.name}</RPGUI.Button>);
        }
        output = (
            <div id="battle-controls" className='control-box'>
                {buttons}
            </div>
        );
    }
    else if(controls == 'item') {

        const buttons = items ? items.map((item) => {
            return <RPGUI.Button key={item.name} rpgColor="yellow" className="battle-btn" onClick={()=>onItemClicked ? onItemClicked(item.name) : false}>{item.name} x{item.count}</RPGUI.Button>
        }) : false;
        output = (
            <div id="battle-controls" className='control-box scroller'>
                {buttons}
            </div>
        );
    }
    else if(controls === 'type-writer') {
        output = (
        <div className='control-box' id='battle-text-box'>
            <TypeWriter onComplete={onDialogComplete}>{text}</TypeWriter>
        </div>
        );
    }
    else if(controls == 'error') {
        output = <div id="battle-controls" style={{color: 'white'}}><p>Sorry something went wrong</p></div>;
    }
    else if(controls === 'end') {
        output = (
            <div id="battle-controls" className='control-box'>
                <RPGUI.Button rpgColor="yellow" onClick={onContinue}>Continue</RPGUI.Button>
            </div>);
    }

    return output;
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
            <h2 style={{textWrap: 'nowrap'}}>{props.title}</h2>
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
            <p style={{padding: "5px"}}>{props.title}:</p>{items}
        </div>
    );
}

export default BattleGame;