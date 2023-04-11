import React from 'react';
import '../App.css';
import RPGUI from '../common/rpg-ui-elements';
import backend from '../common/backend-calls';

import './battle_game.css';

const BattleCommands = {
    BATTLE_ANIMATION: "battle_animation"
}

class BattleGame extends React.Component {
    constructor(props) {
        super(props);
        this.battleId = props.id;
        this.player = props.player;
        this.monster = props.monster;
        this.strikeAnim = backend.getResourceURL(props.strikeAnim);
        this.commandQueue = [];

        this.state = { controls: 'battle' };

        this.onStrike = this.onStrike.bind(this);
        this.executeCommands = this.executeCommands.bind(this);
        this.runBattleIteration = this.runBattleIteration.bind(this);
    }

    battleAnimationCommand(command) {
        const sprite = document.querySelector(`#effect`);
        sprite.style['transform'] = `translateX(${command.animProperties.xPosition})`
        RPGUI.Sprite_play("effect");
        RPGUI.Sprite_onAnimationEnd("effect", this.executeCommands);
    }

    executeCommands() {
        const command = this.commandQueue.shift();
        if(!command) {
            this.setState({ controls: 'battle' });
            return;
        }

        switch (command.type) {
            case BattleCommands.BATTLE_ANIMATION:
                this.battleAnimationCommand(command);
                break;
            default:
                console.log("Unknown command in queue");
                this.executeCommands();
                break;
        }
    }

    submitCommands(commands) {
        this.commandQueue.push(...commands);
        this.executeCommands();
    }

    runBattleIteration(battleUpdate) {
        this.player = battleUpdate.player;
        this.monster = battleUpdate.monster;

        const commands = [];
        battleUpdate.steps.forEach(step => {
            switch (step.type) {
                case 'strike':
                    commands.push({
                        type: BattleCommands.BATTLE_ANIMATION,
                        animProperties: {
                            iterationCount: 1,
                            frameWidth: 1024,
                            frameHeight: 1024,
                            frameCount: 16,
                            spriteSheet: this.strikeAnim,
                            duration: 0.5,
                            xPosition: step.actorId == this.player.id ? '20%' : '-20%'
                        }
                    });
                    break;
            }
        });

        this.submitCommands(commands);
    }

    onStrike() {
        this.setState({ controls: 'waiting' });
        backend.battleAction(this.battleId, 'strike')
        .then(this.runBattleIteration)
        .catch(error => {
            this.setState({ controls: 'error' });
        });
    }

    onClick() {
        RPGUI.Sprite_play("effect");
    }
    render() {

        const controlLables = {
            strikeText: this.player.strikeLevel == 2 ? this.player.weapon.strikeAbility.name : "Strike"
        };
        return (
        <div id="content-frame" className="dark">
            <div id="header-section">
                <BattleHeader title={this.player.name} level={this.player.level} id="left_header" health={this.player.health/this.player.maxHealth}/>
                <BattleHeader title={this.monster.name} level={this.monster.level} id="right_header" health={this.monster.health/this.monster.maxHealth}/>
            </div>
            <div id="avatar-section">
                <div id="battle-effects">
                    <RPGUI.Sprite id="effect" iterationCount={1} frameWidth={1024} frameHeight={1024} frameCount={16} spriteSheet={this.strikeAnim} duration={0.5}/>
                </div>
                <BattleAvatar image={backend.getResourceURL(this.player.avatar)} id="right-avatar">
                    <CounterBar id="ap_counter" title="AP" maxCount={3} currentCount={this.player.ap}/>
                </BattleAvatar>
                <BattleAvatar image={backend.getResourceURL(this.monster.avatar)} id="left-avatar"/>
            </div>
            <BattleControls controls={this.state.controls} onStrike={this.onStrike} {...controlLables}/>
            <div id="options-section">
                <RPGUI.Button className="battle-btn" rpgColor="yellow">Escape</RPGUI.Button>
            </div>
        </div>
        );
    }
}

function BattleControls(props) {
    let controls = <p>Waiting</p>;

    if(props.controls == 'battle') {
        controls = (
            <div id="battle-controls">
                <RPGUI.Button className="battle-btn" rpgColor="blue" onClick={props.onStrike}>{props.strikeText}</RPGUI.Button>
                <RPGUI.Button className="battle-btn">Ajfugheldjgh</RPGUI.Button>
                <RPGUI.Button className="battle-btn">Ability 2</RPGUI.Button>
                <RPGUI.Button className="battle-btn">Ability 3</RPGUI.Button>
            </div>
        );
    }

    else if(props.controls == 'error') {
        controls = <p>Sorry something went wrong</p>;
    }

    return controls;
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