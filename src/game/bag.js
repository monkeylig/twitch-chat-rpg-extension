import React, { useRef } from 'react';
import RPGUI from '../common/rpg-ui-elements';
import backend from '../common/backend-calls';
import { useState } from 'react';
import { click } from '@testing-library/user-event/dist/click';

function BagMenu({player}) {

    const [currentWeaponId, setCurrentWeaponId] = useState(player.weapon.id);
    const [playerWeapons, setPlayerWeapons] = useState(player.bag.weapons);
    let selectedWeaponId = useRef(0);
    
    const clickEquip = weaponId => {
        backend.equipWeapon(player.id, weaponId)
        .then((newPlayer) => {
            setCurrentWeaponId(newPlayer.weapon.id);
        }).catch(error => {
            console.log(error);
        });
    };

    const clickDrop = (weaponId) => {
        selectedWeaponId.current = weaponId;
        const dialog = document.querySelector(`#bag-confirm-weapon-drop`);
        dialog.showModal();
    }

    const cancelDrop = () => {
        const dialog = document.querySelector(`#bag-confirm-weapon-drop`);
        dialog.close();
    }

    const confirmDrop = weaponId => {
        backend.dropWeapon(player.id, weaponId)
        .then((newPlayer) => {
            setPlayerWeapons(newPlayer.bag.weapons);
            const dialog = document.querySelector(`#bag-confirm-weapon-drop`);
            dialog.close();
        }).catch(error => {
            console.log(error);
        });
    }

    const bagItems = playerWeapons.map((weapon, index) => {
        let options;
        if(currentWeaponId === weapon.id) {
            options = <button style={{pointerEvents: 'none'}} className='circle-btn btn-green material-symbols-outlined'>done</button>
        }
        else {
            options = (
            <>
                <button onClick={() => {clickEquip(weapon.id)}} className='circle-btn material-symbols-outlined'>add</button>
                <button onClick={() => {clickDrop(weapon.id)}} className='circle-btn btn-red material-symbols-outlined bag-drop-item-btn'>remove</button>
            </>
            );
        }

        const bagOptions = (
            <div className='bag-manage-options'>
                {options}
            </div>);
        return <WeaponCard key={weapon.id} image={backend.getResourceURL(weapon.icon)} avatarChildren={bagOptions} {...weapon}/>;
    });
    return (
        <RPGUI.MediaScroller scrolly>
            <RPGUI.ButtonGroup id='player-bag-options'>
                <div>
                    <input type='radio' name='bag-section-option' id='group-input-0' className='group-input'/>
                    <label htmlFor='group-input-0' className='rpg-btn-group-item'>Weapons</label>
                    <input type='radio' name='bag-section-option' id='group-input-1' className='group-input'/>
                    <label htmlFor='group-input-1' className='rpg-btn-group-item'>Items</label>
                    <input type='radio' name='bag-section-option' id='group-input-2' className='group-input'/>
                    <label htmlFor='group-input-2' className='rpg-btn-group-item'>Books</label>
                </div>
            </RPGUI.ButtonGroup>
            
            <div id='bag-container'>
                {bagItems}
            </div>

            <dialog id='bag-confirm-weapon-drop'>
                <p>Are you sure that you want to drop this weapon?</p>
                <div >
                    <RPGUI.Button onClick={cancelDrop}>No</RPGUI.Button>
                    <RPGUI.Button onClick={() => {confirmDrop(selectedWeaponId.current)}}rpgColor='blue'>Yes</RPGUI.Button>
                </div>
            </dialog>
         </RPGUI.MediaScroller>
  );
}

function WeaponCard({image, name, baseDamage, statGrowth, avatarChildren}) {

    return (
    <RPGUI.AvatarCard className="weapon-card" title={name} image={image} avatarChildren={avatarChildren}>
            <div className='bag-card-content'>
                <p>Damage: {baseDamage}</p>
                <RPGUI.Button className='bag-card-btn'>Slash</RPGUI.Button>
                <h5>Leveling</h5>
                <p>Health: +{statGrowth.maxHealth}</p>
                <p>Attack: +{statGrowth.attack}</p>
                <p>Magic: +{statGrowth.magic}</p>
                <p>Defence: +{statGrowth.defence}</p>
            </div>
    </RPGUI.AvatarCard>
    );
}

export default BagMenu;