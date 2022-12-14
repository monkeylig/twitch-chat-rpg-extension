import React from 'react';
import '../App.css';
import RPGButton from '../common/rpg-button';
import RPGUI from '../common/rpg-ui-elements';
import './getting-started.css'
import '../common/backend-calls';
import backend from '../common/backend-calls';

class SignUp extends React.Component {

    avatars;
    constructor(props) {
        super(props);
        this.state = {page: 'welcome'};
        //this.state = {page: 'pick-name'};
        this.avatars = [];
        this.navigateAvatarPick = this.navigateAvatarPick.bind(this);
    }

    navigateAvatarPick() {
        backend.getStartingAvatars().then((data) => {
            this.avatars = data;
            this.setState({avatarsloaded: true});
        });

        this.setState({page: 'pick-avatar'})
    }

    renderWelcome(props) {
        return (
            <div id="content-frame">
                <p id="intro-text">Welcome to Chat RPG! Click the button below to begin your journey for adventure and treasure.</p>
                <RPGButton id='play-btn' onClick={this.navigateAvatarPick} >Play</RPGButton>
            </div>
        );
    }

    renderAvatarPick(props) {
        if(!this.state.avatarsloaded)
        {
            return <h1>Loading</h1>
        }
        else {
            const avatarImgs = this.avatars.map((url, index) => 
                <img key={index} src={backend.getResourceURL(url)} className='avatarImg'/>
            );
            return (
                <div id="content-frame">
                    <h1>Choose an Avatar!</h1>
                    <div>
                        {avatarImgs}
                    </div>
                </div>
            );   
        }
    }

    renderNamePick(props) {
        return (
            <div id="content-frame">
                <h1>Embark</h1>
                <RPGUI.TextBox id="name-picker">Name</RPGUI.TextBox>
                <RPGUI.Button id="begin-btn">Begin Adventure</RPGUI.Button>
            </div>
        );
    }

    render() {
        switch(this.state.page) {
            case 'welcome':
                return this.renderWelcome(this.props);
            case 'pick-avatar':
                return this.renderAvatarPick(this.props);
            case 'pick-name':
                return this.renderNamePick(this.props);
            default:
                return <h1>Sorry something went wrong.</h1>;
        }
    }   
}

function avatarPicker(props) {
    
}

export default SignUp;