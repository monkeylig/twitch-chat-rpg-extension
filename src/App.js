import logo from './logo.svg';
import './App.css';
import React from 'react';
import frontend_context from './common/frontend-context';

import SignUp from './getting-started/getting-started'
import GameMenu from './game/game_menu';
import BattleGame from './game/battle_game';
import backend from './common/backend-calls';

class App extends React.Component {
    nextPageProps;

    constructor(props) {
        super(props);
        this.state = { page: 'landing' };

        this.navigate = this.navigate.bind(this);
    }

    navigate(nextPage, nextPageProps = null) {
        this.nextPageProps = nextPageProps;
        this.setState({ page: nextPage });
    }

    render() {
        switch (this.state.page) {
            case 'landing':
                return <Landing onNavigate={this.navigate}/>;
            case 'get-started':
                return <SignUp onNavigate={this.navigate} />;
            case 'game':
                return <GameMenu onNavigate={this.navigate} {...this.nextPageProps}/>;
            case 'battle':
                return <BattleGame onNavigate={this.navigate} {...this.nextPageProps}/>;
            default:
                return <p>Sorry, somthing went wrong</p>;
        }
    }
}

class Landing extends React.Component {

    constructor(props) {
        super(props);
        this.waitForFrontendContext = this.waitForFrontendContext.bind(this);

        this.frontend_promise = new Promise((resolve, reject) => {
            /*window.Twitch.ext.onAuthorized((auth) => {
                frontend_context.playerId = auth.userId;
                frontend_context.channelId = auth.channelId;
                console.log('The JWT that will be passed to the EBS is', auth.token);
                console.log('The User ID is', frontend_context.playerId);
                console.log('The Channel ID is', auth.channelId);
                resolve(auth);
            });*/
            frontend_context.playerId = 'twitch-test';
            frontend_context.channelId = 'twitch-test-game';
            resolve();
        });
    }

    async waitForFrontendContext() {
        await this.frontend_promise;
        return;
    }

    navigate(nextPage) {
        this.setState({ page: nextPage });
    }

    componentDidMount() {
        this.#tryJoinGame().then((context) => {
            if(!context) {
                this.props.onNavigate('get-started');
                return;
            }
            this.props.onNavigate('game', {playerData: context.playerData, gameState: context.gameState});
        });
    }

    render() {
        return <p>Loading Chat RPG</p>;
    }

    async #tryJoinGame() {
        await this.waitForFrontendContext();

        try {
            const playerData = await backend.getPlayer(frontend_context.playerId, 'twitch');
            return {
                playerData: playerData,
                gameState: await backend.joinGame(playerData.id, frontend_context.channelId)};
        }
        catch (error) {
            if(error.errorCode == 2) {
                return false;
            }
            throw error;
        }
    }
}

export default App;
