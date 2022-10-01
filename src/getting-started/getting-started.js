import React from 'react';
import '../App.css';
import RPGButton from '../common/rpg-button';
import './getting-started.css'
import '../common/backend-calls';
import backend from '../common/backend-calls';

class SignUp extends React.Component {

    avatars;
    constructor(props) {
        super(props);
        this.state = {page: 'welcome'};

        this.avatars = [];
    }

    renderWelcome(props) {
        return (
            <div id="content-frame">
                <p id="intro-text">Welcome to Chat RPG! Click the button below to begin your journey for adventure and treasure.</p>
                <RPGButton id='play-btn' onClick={() => {this.setState({page: 'pick-avatar'})}} >Play</RPGButton>
            </div>
        );
    }

    renderAvatarPick(props) {
        if(!this.state.avatarsloaded)
        {
            backend.getStartingAvatars().then((data) => {
                this.avatars = data;
                this.setState({avatarsloaded: true});
            });
            return <h1>Loading</h1>
        }
        else {
            return (
                <div id="content-frame">
                    <h1>Choose an Avatar!</h1>
                    <img src={backend.resourceBackendURL + this.avatars[0]} width="100" height="100"/>
                </div>
            );   
        }
    }

    render() {
        switch(this.state.page) {
            case 'welcome':
                return this.renderWelcome(this.props);
            case 'pick-avatar':
                return this.renderAvatarPick(this.props);
            default:
                return <h1>Sorry something went wrong.</h1>;
        }
    }   
}

function avatarPicker(props) {
    
}

export default SignUp;