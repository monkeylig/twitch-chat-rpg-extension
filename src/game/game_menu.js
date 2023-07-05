import React from 'react';

import RPGUI from '../common/rpg-ui-elements';
import backend from '../common/backend-calls';
import frontend_context from '../common/frontend-context';
import '../App.css';
import './game_menu.css';
import BagMenu from './bag';
import ShopMenu from './shop';
import ProfileViewer from './profile';

class GameMenu extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            player: this.props.playerData
        }

        this.onNavigate = this.onNavigate.bind(this);
        this.onPlayerChanged = this.onPlayerChanged.bind(this);
        this.renderBattle = this.renderBattle.bind(this);
        this.onFightClick = this.onFightClick.bind(this);
        this.renderBagMenu = this.renderBagMenu.bind(this);
        this.renderShop = this.renderShop.bind(this);
        this.renderProfile = this.renderProfile.bind(this);

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
                icon: "store",
                pageName: "shop"
            },
            {
                id: "menu-btn4",
                icon: "account_box",
                pageName: "profile"
            }
        ]

        this.pageData = [
            {
                id: "page1",
                htmlId: "menu-page",
                onRenderPage: this.renderBagMenu
            },
            {
                default: true,
                id: "page2",
                htmlId: "battle-page",
                onRenderPage: this.renderBattle
            },
            {
                id: "page3",
                htmlId: "shop-page",
                onRenderPage: this.renderShop
            },
            {
                id: "page4",
                htmlId: "profile-page",
                onRenderPage: this.renderProfile
            }
        ]
    }

    onPlayerChanged(playerData) {
        this.setState({player: playerData});
    }

    onFightClick(monsterId, fallbackMonster) {
        backend.startBattle(this.props.playerData.id, this.props.gameState.id, monsterId, fallbackMonster)
        .then(battleState => {
            this.props.onNavigate('battle', battleState);
        });
    }

    onNavigate(event) {
        const navNumber = event.target.id.slice(-1);
        document.getElementById("page" + navNumber).checked = true;
    }

    renderBagMenu() {
        return <BagMenu player={this.state.player} onPlayerChanged={this.onPlayerChanged}/>;
    }

    renderProfile() {
        return <ProfileViewer player={this.state.player}/>;
    }

    renderShop() {
        return <ShopMenu player={this.state.player} onPlayerChanged={this.onPlayerChanged}/>;
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
            monsterCards.push(<RPGUI.MonsterCard {...monsterData} key={index} onFightClick={() => this.onFightClick(monster.id, {monsterClass: monster.class, level: monster.level})}/>);
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