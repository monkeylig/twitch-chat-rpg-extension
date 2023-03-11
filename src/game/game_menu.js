import React from 'react';

import RPGUI from '../common/rpg-ui-elements';
import backend from '../common/backend-calls';
import frontend_context from '../common/frontend-context';
import '../App.css';
import './game_menu.css';

class GameMenu extends React.Component {
    playerState;
    gameState;

    constructor(props) {
        super(props);

        if(this.props.gameState) {
            this.gameState = this.props.gameState;
        }
        else {
            this.gameState = { monsters: [] };
        }

        if(this.props.playerState) {
            this.playerState = this.props.playerState;
        }
        else {
            this.playerState = {};
        }

        this.onNavigate = this.onNavigate.bind(this);
        this.renderBattle = this.renderBattle.bind(this);

        this.mounted = false;
        this.navData = [
            {
                id: "menu-btn1",
                icon: "menu",
                pageName: "menu"
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

    onNavigate(event) {
        const navNumber = event.target.id.slice(-1);
        document.getElementById("page" + navNumber).checked = true;
    }

    renderMenu() {
        return (<h1>Menu!</h1>);
    }

    renderSettings() {
        return (<h1>Settings!</h1>);
    }

    renderBattle() {
        const monsterData = {
            monsterName: 'Skellingting',
            level: 40,
            attack: 0.35,
            defence: 0.74,
            magic: 0.58
        };

        const monsterCards = [];
        let count=0;
        for(const monster of this.gameState.monsters) {
            const monsterData = {
                monsterName: monster.name,
                monsterImage: backend.getResourceURL(monster.avatar),
                level: monster.level,
                attack: monster.attackRating,
                defence: monster.defenceRating,
                magic: monster.magicRating
            };
            console.log(monsterData);

            monsterCards.push(<RPGUI.MonsterCard {...monsterData} key={count}/>);
            count++;
        }

        return (
            <RPGUI.MediaScroller>
                {monsterCards}
            </RPGUI.MediaScroller>
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