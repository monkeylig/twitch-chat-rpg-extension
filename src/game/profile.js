import React, { useRef, useState } from 'react';
import backend from '../common/backend-calls';
import RPGUI from '../common/rpg-ui-elements';

function ProfileViewer({player}) {
    const [dialogMode, setDialogMode] = useState('weapon');
    const [selectedAbility, setSelectedAbility] = useState();

    let dialogFunction;
    let dialogParams;
    switch(dialogMode) {
        case 'weapon':
            dialogFunction = RPGUI.WeaponDialog;
            dialogParams = {
                weapon: player.weapon
            };
            break;
        case 'ability':
            dialogFunction = RPGUI.AbilityDialog;
            dialogParams = {
                ability: selectedAbility
            };
            break;
    }

    const onWeaponClicked = () => {
        setDialogMode('weapon');
        document.getElementById('profileId').showModal();
    };

    const onAbilityClicked = (abilityIndex) => {
        setSelectedAbility(player.abilities[abilityIndex]);
        setDialogMode('ability');
        document.getElementById('profileId').showModal();
    };

    const abilityButtons = player.abilities.map(((ability, index) => {
        return <RPGUI.Button rpgColor='blue' onClick={() => onAbilityClicked(index)} key={index}>{ability.name}</RPGUI.Button>
    }));
    return (
        <div id='prifile-viewer'>
            <section id='profile-header'>
                <h2>{player.name}</h2>
                <span>Level {player.level}</span>
                <img id='profile-header-avatar' src={backend.getResourceURL(player.avatar)}/>
                <span>HP - {player.health}/{player.maxHealth}</span><RPGUI.ProgressBar id='profile-header-health-bar' color={RPGUI.RPGGreen} progress={player.health / player.maxHealth}/>
                <span>EXP - {player.exp}/{player.expToNextLevel}</span><RPGUI.ProgressBar id='profile-header-exp-bar' color={RPGUI.RPGBlue} progress={player.exp / player.expToNextLevel}/>
                <p>Coins - {player.coins}</p>
            </section>
            <section id='profile Stats'>
                <h2>Stats</h2>
                <p>Attack - {player.attack}</p>
                <p>Magic - {player.magic}</p>
                <p>Defence - {player.defence}</p>
            </section>
            <section>
                <h2>Weapon</h2>
                <button onClick={onWeaponClicked} className='custom-button'><img className='profile-icon' src={backend.getResourceURL(player.weapon.icon)}/></button>
                <p>{player.weapon.name}</p>
            </section>
            <section>
                <h2>Abilities</h2>
                {abilityButtons}
            </section>
            <section>
                <h2>Trackers</h2>
                <p>Sword Kills - {player.trackers.weaponKills.sword}</p>
                <p>Staff Kills - {player.trackers.weaponKills.staff}</p>
                <p>Dagger Kills - {player.trackers.weaponKills.dagger}</p>
                <p>Defeats - {player.trackers.deaths}</p>
            </section>
            <RPGUI.DialogControl dialogFunction={dialogFunction} dialogParams={dialogParams} id='profileId' />
        </div>
    );
}

export default ProfileViewer;