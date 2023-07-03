import React, { useEffect, useRef, useState } from 'react';
import './common.css'
import utility from './utility';

function RPGButton(props) 
{
    let colorClass = props.rpgColor ? props.rpgColor : "";

    return (
            <button id={props.id} className={"rpg-btn custom-button " + props.className} >
                <p onClick={props.onClick} className={colorClass}>
                    <span className={"bg " + colorClass}></span>
                    <span className="text">{props.children}</span>
                </p>
            </button>);
}

function RPGTextBox({id, onInput, children, maxLength=''}) {
    return (
        <div id={id} className="inp">
            <input type="text" id="inp" placeholder="&nbsp;" onInput={onInput} maxLength={maxLength}/>
            <span className="label">{children}</span>
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

function RPGProgressBar({progress=0, color, className, id}) {
    
    let filledStyle = {flexGrow: progress};
    let emptyStyle = {flexGrow: 1-progress};

    if(color) {
        filledStyle["background"] = color;
    }

    return (
        <div id={id} className={"rpg-bar " + className}>
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

function RPGAvatarCard({className, title, image, children, avatarChildren}) {
    return (
    <RPGCard className={`rpg-avater-card ${className}`}>
        <div className='rpg-avater-card-group'>
            <h3>{title}</h3>
            <div className='rpg-avater-card-content'>
                <div className="rpg-card-avatar-container">
                    <img src={image}/>
                    <div className='rpg-avatar-card-layer'>
                        {avatarChildren}
                    </div>
                </div>
                {children}
            </div>
        </div>
    </RPGCard>
    );
}

function RPGMonsterCard(props) {
    return (
        <RPGAvatarCard className="rpg-monster-card" title={props.monsterName} image={props.monsterImage}>
            <h5>Level {props.level}</h5>
            <h5>Attack</h5>
            <RPGProgressBar progress={props.attack}/>
            <h5>Defence</h5>
            <RPGProgressBar progress={props.defence}/>
            <h5>Magic</h5>
            <RPGProgressBar progress={props.magic}/>
            <RPGButton className="rpg-monster-card-btn" onClick={props.onFightClick}>Fight!</RPGButton>
        </RPGAvatarCard>
    );
}

function RPGMediaScroller({className, id, scrollx, scrolly, children}) {

    const xScroll = scrollx ? 'scroll' : 'none';
    const yScroll = scrolly ? 'scroll' : 'none';
    const direction = scrollx ? 'row' : 'column';

    const style = {
        overflowX: xScroll,
        overflowY: yScroll,
        flexDirection: direction
    };
    return (
        <div style={style}className={"rpg-media-scroller " + className} id={id}>
            {children}
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

function RPGSprite_setProperties(id, {autoplay = false, frameWidth = 50, frameHeight = 50, frameCount = 1,
    duration = 1, iterationCount = 'infinite', spriteSheet = ''}) {

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

function RPGButtonGroup(props) {
    return (
    <div id={props.id} className="rpg-btn-group-container rpg-btn-group-green">
        {props.children}
    </div>
    );
}

function RPGContainerItem({onClick, imageSrc, name, style, price, coinImageSrc}) {
    return (
        <div onClick={onClick} style={style}>
            <img src={imageSrc}/>
            <p>{name}</p>
            {price && <p><img style={{width: '20px', position: 'relative', top: '5px'}} src={coinImageSrc}/>{` ${price}`}</p>}
        </div>
    );
}

function RPGAbilityView({ability}) {
    return (
        <>
            <h3>{ability.name}</h3>
            <p>{ability.description}</p>
            <p>{ability.type} - {ability.style}</p>
            <p>Damage: {utility.damageText(ability.baseDamage)}</p>

        </>
    );
}

function RPGDialogControl({id, dialogFunction, dialogParams}) {

    const [TopDialog, setTopDialog] = useState();
    const [currentDialogParams, setCurrentDialogParams] = useState();
    const dialogStack = useRef([]);
    
    const reset = ()=>{
        setTopDialog(() => dialogFunction);
        setCurrentDialogParams(dialogParams);
        dialogStack.current = [];
    };

    const exit = ()=>{
        const newDialog = dialogStack.current.pop();
        if(!newDialog) {
            const dialog = document.getElementById(id);
            dialog.close();
            return;
        }

        setTopDialog(() => newDialog.dialog);
        setCurrentDialogParams(newDialog.params);
    };

    const exitAll = ()=>{
        const dialog = document.getElementById(id);
        dialog.close();
    };


    const goToDialog = (nextDialog, nextDialogParams) => {
        dialogStack.current.push({dialog: TopDialog, params: currentDialogParams});
        setTopDialog(() => nextDialog);
        setCurrentDialogParams(nextDialogParams);
    };

    const dialogControls = {
        exit,
        exitAll,
        goToDialog
    };

    useEffect(()=>{
        const dialog = document.getElementById(id);
        dialog.onclose = () => reset();
        setTopDialog(() => dialogFunction);
        setCurrentDialogParams(dialogParams);
    }, [id, dialogFunction, dialogParams]);
    
    return (
        <dialog id={id}>{TopDialog !=null ? React.createElement(TopDialog, {...currentDialogParams, dialogControls}) : <></>}</dialog>
    );
}

function RPGWeaponDialog({weapon, equipped=false, owned=false, price, canAfford=false, onEquippedClicked, onDroppedClicked, onBuyClicked, dialogControls}) {
    if(!weapon) {
        return;
    }

    const onDrop = (name) => {
        dialogControls.goToDialog(RPGConfirmDropDialog, {confirmMessage: `Are you sure you want to drop ${name}?`, onDroppedClicked});
    };

    const equipButton = equipped ? <p style={{color: 'green'}}>Equipped!</p> : <RPGUI.Button onClick={onEquippedClicked} rpgColor='blue' className='bag-card-btn'>Equip</RPGUI.Button>;
    const buyButton = (
        <>
            {owned && <p style={{color: 'green'}}>Owned</p>}
            {!canAfford && <p style={{color: 'red'}}>You don't have enough coins for this item - {price} Coin</p>}
            {(!owned && canAfford) && <RPGUI.Button onClick={onBuyClicked} rpgColor='blue' className='bag-card-btn'>Buy for {price} Coin</RPGUI.Button>}
        </>);

    return (
    <div>
        <button onClick={dialogControls.exit} style={{position: 'relative'}} className='circle-btn btn-red material-symbols-outlined'>arrow_back</button>
        <h2>{weapon.name}</h2>
        <p>{weapon.description}</p>
        <p>{weapon.type} - {weapon.style}</p>
        <p>Damage: {weapon.baseDamage}</p>
        <p>Strike Ability: {weapon.strikeAbility.name}</p>
        <h3>Leveling</h3>
        <p>Health: +{weapon.statGrowth.maxHealth}</p>
        <p>Attack: +{weapon.statGrowth.attack}</p>
        <p>Magic: +{weapon.statGrowth.magic}</p>
        <p>Defence: +{weapon.statGrowth.defence}</p>
        {onEquippedClicked && equipButton}
        {onDroppedClicked && <RPGUI.Button onClick={()=>onDrop(weapon.name)} className='bag-card-btn'>Drop</RPGUI.Button>}
        {onBuyClicked && buyButton}
    </div>
    );
}

function RPGItemDialog({item, price, canAfford=false, amountOwned=0, onBuyClicked, onDroppedClicked, dialogControls}) {

    if(!item) {
        return;
    }

    const onDrop = (name) => {
        dialogControls.goToDialog(RPGConfirmDropDialog, {confirmMessage: `Are you sure you want to drop all ${name}s?`, onDroppedClicked});
    };
    
    const buyButton = (
        <>
            {!canAfford && <p style={{color: 'red'}}>You don't have enough coins for this item - {price} Coin</p>}
            {canAfford && <RPGUI.Button onClick={onBuyClicked} rpgColor='blue' className='bag-card-btn'>Buy for {price} Coin</RPGUI.Button>}
        </>);

    return (
        <div>
            <button onClick={dialogControls.exit} style={{position: 'relative'}} className='circle-btn btn-red material-symbols-outlined'>arrow_back</button>
            <h2>{item.name} <span style={{fontWeight:'400'}}>x{item.count}</span></h2>
            <p>{item.description}</p>
            {amountOwned > 0 && <p>You own {amountOwned} {item.name}{amountOwned > 1 ? 's' : ''}.</p>}
            {onDroppedClicked && <RPGUI.Button className='bag-card-btn' onClick={()=>onDrop(item.name)}>Drop</RPGUI.Button>}
            {onBuyClicked && buyButton}
        </div>
    );
}

function RPGAbilityDialog({ability, dialogControls}) {
    if(!ability) {
        return;
    }

    return (
        <div>
            <button onClick={dialogControls.exit} style={{position: 'relative'}} className='circle-btn btn-red material-symbols-outlined'>arrow_back</button>
            <RPGUI.AbilityView ability={ability}/>
        </div>
    );
}

function RPGConfirmDropDialog({confirmMessage, onDroppedClicked, dialogControls}) {
    const onDrop = () => {
        onDroppedClicked();
        dialogControls.exitAll();
    };

    return (
        <div>
            <button onClick={dialogControls.exit} style={{position: 'relative'}} className='circle-btn btn-red material-symbols-outlined'>arrow_back</button>
            <p>{confirmMessage}</p>
            <RPGUI.Button onClick={()=>onDrop()} className='bag-card-btn'>Drop</RPGUI.Button>
        </div>
    );
}

const RPGUI = {
    Button: RPGButton,
    TextBox: RPGTextBox,
    Card: RPGCard,
    AvatarCard: RPGAvatarCard,
    MonsterCard: RPGMonsterCard,
    ProgressBar: RPGProgressBar,
    ProgressBar_setProperties: RPGProgressBar_setProperties,
    ProgressBar_onTransitionEnd: RPGProgressBar_onTransitionEnd,
    MediaScroller: RPGMediaScroller,
    Sprite: RPGSprite,
    Sprite_play: RPGSprite_play,
    Sprite_onAnimationEnd: RPGSprite_onAnimationEnd,
    Sprite_setProperties: RPGSprite_setProperties,
    ButtonGroup: RPGButtonGroup,
    ContainerItem: RPGContainerItem,
    WeaponDialog: RPGWeaponDialog,
    ItemDialog: RPGItemDialog,
    DialogControl: RPGDialogControl,
    AbilityView: RPGAbilityView,
    AbilityDialog: RPGAbilityDialog,
    RPGRed: "#ff4655",
    RPGBlue: "#3852ff",
    RPGGreen: "#2bff5d"
};

export default RPGUI;