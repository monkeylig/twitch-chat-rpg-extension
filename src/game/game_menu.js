import React from 'react';

import RPGUI from '../common/rpg-ui-elements';
import backend from '../common/backend-calls';
import frontend_context from '../common/frontend-context';
import '../App.css';
import './game_menu.css';

class GameMenu extends React.Component {

    constructor(props) {
        super(props);
        this.state = {playerDataLoaded : false};

        this.onNavigate = this.onNavigate.bind(this);

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

        this.pagaData = [
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

    componentDidMount() {
        this.props.onFrontendContextAvailable()
        .then(() => {
            console.log(frontend_context.playerId);
            backend.getPlayer(frontend_context.playerId).then(playerData => {
                if(!playerData.hasOwnProperty('twitchId')) {
                    this.props.onNavigate('get-started');
                }
                else {
                    this.setState(
                        {
                            playerDataLoaded: true
                        });
                }
            })
            .catch(error => {
                this.props.onNavigate('get-started');
            });
        });
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
        return (
            <RPGUI.MediaScroller>
                <RPGUI.MonsterCard {...monsterData}/>
                <RPGUI.MonsterCard {...monsterData}/>
                <RPGUI.MonsterCard {...monsterData}/>
            </RPGUI.MediaScroller>
            );
    }

    render() {
        if(this.state.playerDataLoaded) {
            return (
                <div id="content-frame" className="content-flex">
                    <MenuNav navData={this.navData} onNavigate={this.onNavigate}/>
                    <Carousel pageData={this.pagaData}/>
                </div>
                );
        }
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