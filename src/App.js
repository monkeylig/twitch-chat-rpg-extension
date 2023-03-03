import logo from './logo.svg';
import './App.css';
import React from 'react';
import frontend_context from './common/frontend-context';

import SignUp from './getting-started/getting-started'
import GameMenu from './game/game_menu';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = { page: 'game' };

        this.navigate = this.navigate.bind(this);
        this.waitForFrontendContext = this.waitForFrontendContext.bind(this);

        this.frontend_promise = new Promise((resolve, reject) => {
            window.Twitch.ext.onAuthorized((auth) => {
                frontend_context.playerId = auth.userId;
                console.log('The JWT that will be passed to the EBS is', auth.token);
                console.log('The user ID is', frontend_context.playerId);
                window.Twitch.ext.rig.log('Broadcaster ' + window.Twitch.ext.configuration.broadcaster)
                resolve(auth);
            });
        });
    }

    async waitForFrontendContext() {
        await this.frontend_promise;
        return;
    }

    navigate(nextPage) {
        this.setState({ page: nextPage });
    }

    render() {
        switch (this.state.page) {
            case 'landing':
                return <Landing onNavigate={this.navigate} />;
            case 'get-started':
                return <SignUp onNavigate={this.navigate} />;
            case 'game':
                return <GameMenu onNavigate={this.navigate} waitForFrontendContext={this.waitForFrontendContext}/>;
            default:
                return <p>Sorry, somthing went wrong</p>;
        }
    }
}

function Landing(props) {
    if (props.onNavigate) {
        setTimeout(() => {
            props.onNavigate('get-started');
        }, 1000);
    }
    return <p>Loading Chat RPG</p>
}

export default App;
