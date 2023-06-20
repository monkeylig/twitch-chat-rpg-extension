import React, { useRef, useEffect } from 'react';
import RPGUI from '../common/rpg-ui-elements';
import backend from '../common/backend-calls';
import { useState } from 'react';

const BAG_CAPACITY = 10;

function BagMenu({player}) {

    const [lastEquippedWeapon, setLastEquippedWeapon] = useState(player.weapon);
    const [playerWeapons, setPlayerWeapons] = useState(player.bag.weapons);
    const [equippedAbilities, setEquippedAbilities] = useState(player.abilities);
    const [playerBooks, setPlayerBooks] = useState(player.bag.books);
    const [playerItems, setPlayerItems] = useState(player.bag.items);
    const [selectedBagItem, setSelectedBagItem] = useState();
    const [bagGroup, setBagGroup] = useState('weapons');

    const switchBagGroup = (groupName) => {
        setBagGroup(groupName);
        setSelectedBagItem();
    };
    
    const clickBagItem = (bagItem) => {
        setSelectedBagItem(bagItem);
        const dialog = document.querySelector(`#bag-confirm-weapon-drop`);
        dialog.showModal();
    };
    const clickEquip = (bagItem, index, replacedName) => {
        if(bagGroup === 'weapons') {
            backend.equipWeapon(player.id, bagItem.id)
            .then((newPlayer) => {
                setLastEquippedWeapon(bagItem);
            }).catch(error => {
                console.log(error);
            });
        }
        else if(bagGroup === 'books') {
            backend.equipAbility(player.id, bagItem.name, index, replacedName)
            .then((newPlayer) => {
                setEquippedAbilities(newPlayer.abilities);
            }).catch(error => {
                console.log(error);
            });
        }
    };

    const clickDrop = (bagItem) => {
        if(bagGroup === 'weapons') {
            backend.dropWeapon(player.id, bagItem.id)
            .then((newPlayer) => {
                setPlayerWeapons(newPlayer.bag.weapons);
            }).catch(error => {
                console.log(error);
            });
        }
        else if(bagGroup === 'items') {
            backend.dropItem(player.id, bagItem.name)
            .then((newPlayer) => {
                setPlayerItems(newPlayer.bag.items);
            }).catch(error => {
                console.log(error);
            });
        }
        else if(bagGroup === 'books') {
            backend.dropBook(player.id, bagItem.name)
            .then((newPlayer) => {
                setPlayerBooks(newPlayer.bag.books);
            }).catch(error => {
                console.log(error);
            });
        }
    }
    
    let currentBagList;
    let currentDialog;
    let currentDialogParams;

    if(bagGroup === 'weapons') {
        currentBagList = playerWeapons;
        currentDialog = WeaponDialog;
        currentDialogParams = {
            equipped: selectedBagItem && selectedBagItem.id === lastEquippedWeapon.id,
            weapon: selectedBagItem,
            onEquippedClicked: ()=>clickEquip(selectedBagItem),
            onDroppedClicked: ()=>clickDrop(selectedBagItem)
        };
    }
    else if(bagGroup === 'items') {
        currentBagList = playerItems;
        currentDialog = ItemDialog;
        currentDialogParams = {
            item: selectedBagItem,
            onDroppedClicked: ()=>clickDrop(selectedBagItem)
        };
    }
    else if(bagGroup === 'books') {
        currentBagList = playerBooks;
        currentDialog = BookDialog;
        currentDialogParams = {
            book: selectedBagItem,
            equippedAbilities: equippedAbilities,
            playerTracker: player.trackers,
            onEquippedClicked: (index, replacedAbilityName)=>clickEquip(selectedBagItem, index, replacedAbilityName),
            onDroppedClicked: ()=>clickDrop(selectedBagItem)
        };
    }

    if(!selectedBagItem) {
        currentDialog = null;
    }

    const emptySlots = [];
    let i=0;
    while(currentBagList.length + emptySlots.length < BAG_CAPACITY) {
        emptySlots.push(<div className='bag-item' key={bagGroup + i} style={{background: 'rgba(0, 0, 0, 0.212)'}}></div>);
        i++;
    }

    const bagItems = currentBagList.map((bagItem, index) => {
        return <div className='bag-item' onClick={() => clickBagItem(bagItem)} key={bagItem.name + index}><img src={backend.getResourceURL(bagItem.icon)}/><p>{bagItem.name}</p></div>;
    });

    return (
        <div>
            <RPGUI.ButtonGroup id='player-bag-options'>
                <div>
                    <input type='radio' name='bag-section-option' id='group-input-0' className='group-input' onChange={() => switchBagGroup('weapons')} defaultChecked/>
                    <label htmlFor='group-input-0' className='rpg-btn-group-item'>Weapons</label>
                    <input type='radio' name='bag-section-option' id='group-input-1' className='group-input' onChange={() => switchBagGroup('items')}/>
                    <label htmlFor='group-input-1' className='rpg-btn-group-item'>Items</label>
                    <input type='radio' name='bag-section-option' id='group-input-2' className='group-input' onChange={() => switchBagGroup('books')}/>
                    <label htmlFor='group-input-2' className='rpg-btn-group-item'>Books</label>
                </div>
            </RPGUI.ButtonGroup>
            
            <div id='bag-container'>
                {bagItems}
                {emptySlots}
            </div>

            <DialogControl id='bag-confirm-weapon-drop' dialogFunction={currentDialog} dialogParams={currentDialogParams}/>
        </div>
  );
}

function DialogControl({id, dialogFunction, dialogParams}) {

    const [TopDialog, setTopDialog] = useState(dialogFunction);
    const [currentDialogParams, setCurrentDialogParams] = useState(dialogParams);
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
        dialog.onclose = reset;
        setTopDialog(() => dialogFunction);
        setCurrentDialogParams(dialogParams);
    }, [id, dialogFunction, dialogParams]);
    

    return (
        <dialog id={id}>{TopDialog !=null ? React.createElement(TopDialog, {...currentDialogParams, dialogControls}) : <></>}</dialog>
    );
}

function AbilityReplacementDialog({equippedAbilities, dialogControls, onReplaceClicked}) {

    const onReplace = (name) => {
        onReplaceClicked(name);
        dialogControls.exit();
    };
    const abilities = equippedAbilities.map((ability, index) => {
        return (
            <div key={index}>
                <h3>{ability.name}</h3>
                <RPGUI.Button className='bag-card-btn' onClick={() => onReplace(ability.name)}>Replace</RPGUI.Button>
            </div>
        );
    });

    return (
        <div>
            <button onClick={dialogControls.exit} style={{position: 'relative'}} className='circle-btn btn-red material-symbols-outlined'>arrow_back</button>
            {abilities}
        </div>
    );
}

function BookDialog({book, dialogControls, equippedAbilities, playerTracker, onEquippedClicked, onDroppedClicked}) {
    if(!book) {
        return;
    }

    const onReplace = (index, abilityName) => {
        onEquippedClicked(index, abilityName);
    };

    const onEquip = (index)=>{
        if(equippedAbilities.length < 3) {
            onEquippedClicked(index);
        }
        else {
            dialogControls.goToDialog(AbilityReplacementDialog, {equippedAbilities, dialogControls, onReplaceClicked: (abilityName)=>onReplace(index, abilityName)});
        }
    };

    const onDrop = (name) => {
        dialogControls.goToDialog(ConfirmDialog, {confirmMessage: `Are you sure you want to drop ${name}?`, onDroppedClicked});
    };

    const abilities = book.abilities.map((abilityEntry, index) => {
        let weaponRequirementType;
        let weaponRequirement;
        const killRequirements = abilityEntry.weaponKillRequirements; 
        for(const weaponType in killRequirements) {
            weaponRequirementType = weaponType;
            weaponRequirement = killRequirements[weaponRequirementType];
            break;
        }

        let requirementMet = false;
        let equipButton = false;
        let requirementString = `${weaponRequirement} ${weaponRequirementType}`;
        let requirementStyle = {};

        if(playerTracker) {
            requirementMet = playerTracker.weaponKills[weaponRequirementType] >= weaponRequirement;
            requirementString = `${playerTracker.weaponKills[weaponRequirementType]}/${weaponRequirement} ${weaponRequirementType}`;
            requirementStyle = {
                color: requirementMet ? 'green' : 'red'
            };

            if(requirementMet) {
                equipButton = equippedAbilities.find(ele => ele.name === abilityEntry.ability.name) ? <p style={{color: 'green'}}>Equipped!</p> : <RPGUI.Button rpgColor='blue' className='bag-card-btn' onClick={()=>onEquip(index)}>Equip</RPGUI.Button>;
            }
        }

        return (
            <div key={index}>
                <h3>{abilityEntry.ability.name}</h3>
                <p>Style: {abilityEntry.ability.style}</p>
                <p>Requires: <span style={requirementStyle}>{requirementString}</span> kills to equip</p>
                <p>Damage: {abilityEntry.ability.baseDamage}</p>
                {equipButton}
            </div>
        );
    });
    return (
        <div>
            <button onClick={dialogControls.exit} style={{position: 'relative'}} className='circle-btn btn-red material-symbols-outlined'>arrow_back</button>
            <h2>{book.name}</h2>
            {abilities}
            <RPGUI.Button className='bag-card-btn' onClick={()=>onDrop(book.name)}>Drop Book</RPGUI.Button>
        </div>
    );
}

function ItemDialog({item, dialogControls, onDroppedClicked}) {

    const onDrop = (name) => {
        dialogControls.goToDialog(ConfirmDialog, {confirmMessage: `Are you sure you want to drop all ${name}s?`, onDroppedClicked});
    };
    
    return (
        <div>
            <button onClick={dialogControls.exit} style={{position: 'relative'}} className='circle-btn btn-red material-symbols-outlined'>arrow_back</button>
            <h2>{item.name}</h2>
            <p>X{item.count}</p>
            <p>{item.description}</p>
            <RPGUI.Button className='bag-card-btn' onClick={()=>onDrop(item.name)}>Drop</RPGUI.Button>
        </div>
    );
}

function WeaponDialog({weapon, equipped, onEquippedClicked, onDroppedClicked, dialogControls}) {
    if(!weapon) {
        return;
    }

    const onDrop = (name) => {
        dialogControls.goToDialog(ConfirmDialog, {confirmMessage: `Are you sure you want to drop ${name}?`, onDroppedClicked});
    };

    const equipButton = equipped ? <p style={{color: 'green'}}>Equipped!</p> : <RPGUI.Button onClick={onEquippedClicked} rpgColor='blue' className='bag-card-btn'>Equip</RPGUI.Button>;
    return (
    <div>
        <button onClick={dialogControls.exit} style={{position: 'relative'}} className='circle-btn btn-red material-symbols-outlined'>arrow_back</button>
        <h2>{weapon.name}</h2>
        <p>{weapon.type} - {weapon.style}</p>
        <p>Damage: {weapon.baseDamage}</p>
        <p>Strike Ability: {weapon.strikeAbility.name}</p>
        <h3>Leveling</h3>
        <p>Health: +{weapon.statGrowth.maxHealth}</p>
        <p>Attack: +{weapon.statGrowth.attack}</p>
        <p>Magic: +{weapon.statGrowth.magic}</p>
        <p>Defence: +{weapon.statGrowth.defence}</p>
        {equipButton}
        <RPGUI.Button onClick={()=>onDrop(weapon.name)} className='bag-card-btn'>Drop</RPGUI.Button>
    </div>
    );
}

function ConfirmDialog({confirmMessage, onDroppedClicked, dialogControls}) {
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

export default BagMenu;