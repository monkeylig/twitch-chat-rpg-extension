import React from 'react';

import RPGUI from '../common/rpg-ui-elements';
import backend from '../common/backend-calls';
import frontend_context from '../common/frontend-context';
import '../App.css';
import './game_menu.css';
import BagMenu from './bag';

class GameMenu extends React.Component {

    constructor(props) {
        super(props);

        this.onNavigate = this.onNavigate.bind(this);
        this.renderBattle = this.renderBattle.bind(this);
        this.onFightClick = this.onFightClick.bind(this);
        this.renderMenu = this.renderMenu.bind(this);

        this.mounted = false;
        this.navData = [
            {
                id: "menu-btn1",
                icon: "backpack",
                pageName: "Bag"
            },
            {
                default: true,
                id: "menu-btn2",
                icon: "swords",
                pageName: "battle"
            },
            {
                id: "menu-btn3",
                icon: "settings",
                pageName: "settings"
            }
        ]

        this.pageData = [
            {
                id: "page1",
                htmlId: "menu-page",
                onRenderPage: this.renderMenu
            },
            {
                default: true,
                id: "page2",
                htmlId: "battle-page",
                onRenderPage: this.renderBattle
            },
            {
                id: "page3",
                htmlId: "settings-page",
                onRenderPage: this.renderSettings
            }
        ]
    }

    onFightClick(monsterId) {
        backend.startBattle(this.props.playerData.id, this.props.gameState.id, monsterId)
        .then(battleState => {
            this.props.onNavigate('battle', battleState);
        });
    }

    onNavigate(event) {
        const navNumber = event.target.id.slice(-1);
        document.getElementById("page" + navNumber).checked = true;
    }

    renderMenu() {
        return <BagMenu player={this.props.playerData}/>;
    }

    renderSettings() {
        return (<h1>Settings!</h1>);
    }

    renderBattle() {
        const monsterCards = [];
        let index=0;
        const monsters = this.props.gameState ? this.props.gameState.monsters : [];
        for(const monster of monsters) {
            const monsterData = {
                monsterName: monster.name,
                monsterImage: backend.getResourceURL(monster.avatar),
                level: monster.level,
                attack: monster.attackRating,
                defence: monster.defenceRating,
                magic: monster.magicRating
            };
            monsterCards.push(<RPGUI.MonsterCard {...monsterData} key={index} onFightClick={() => this.onFightClick(monster.id)}/>);
            index++;
        }

        return (
            <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2px'}}>
                {monsterCards}
            </div>
            );
    }
    render() {

        return (
            <div id="content-frame" className="content-flex">
                <MenuNav navData={this.navData} onNavigate={this.onNavigate}/>
                <Carousel pageData={this.pageData}/>
            </div>
            );
    }
}

function MenuNav(props) {
    const menuButtons = props.navData.map((element, index) =>
        <label key={"btn-" + index} className="menu_label" htmlFor={element.id}>
            <div className="icon material-symbols-outlined">{element.icon}</div>
            <div className="menu_text">{element.pageName}</div>
        </label>
    );

    const navButtons = props.navData.map((element, index) => 
        <input key={"input-" + index} onChange={props.onNavigate} className="menu_input" id={element.id} defaultChecked={element.default} name="menu" type="radio" />
    );

    const menuNav = [];
    for(let i = 0; i < menuButtons.length; i++) {
        menuNav.push(navButtons[i], menuButtons[i]);
    }

    return (
        <div className="menu">
            {menuNav}
        </div>
    );
}

function Carousel(props) {
    const inputButtons = props.pageData.map((element, index) =>
        <input key={"input-" + index} type="radio" id={element.id} defaultChecked={element.default} name="pages" />
    );

    const pageUi = props.pageData.map((element, index) =>
        <div key={"page-" + index} className="page" id={element.htmlId}>
            {element.onRenderPage()}
        </div>
    );

    const carouselPages = [];
    for(let i = 0; i < pageUi.length; i++) {
        carouselPages.push(inputButtons[i], pageUi[i]);
    }
    return (
        <div className="carousel">
            {carouselPages}
        </div>
    );
}

export default GameMenu;