import React from 'react';

import '../App.css';

import RPGUI from '../common/rpg-ui-elements';
import './getting-started.css'

import backend from '../common/backend-calls';
import frontend_context from '../common/frontend-context';

class SignUp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {page: 'welcome'};
        this.avatars = [];
        this.selectedAvatar = '';
        this.selectedName = '';
        this.navigateAvatarPick = this.navigateAvatarPick.bind(this);
        this.onAvaterPicked = this.onAvaterPicked.bind(this);
        this.navigateNamePick = this.navigateNamePick.bind(this);
        this.onNameChanged = this.onNameChanged.bind(this);
        this.onBeginAdventure = this.onBeginAdventure.bind(this);
    }

    onBeginAdventure() {
        if(!this.selectedName)
        {
            return;
        }

        backend.createNewPlayer(this.selectedName, frontend_context.playerId, this.selectedAvatar)
        .then((data) => {
            this.props.onNavigate('landing');
        });
    }

    onNameChanged(event) {
        this.selectedName = event.target.value;
    }
    
    onAvaterPicked(event) {
        this.selectedAvatar = event.target.value;
    }
    
    navigateAvatarPick() {
        backend.getStartingAvatars().then((data) => {
            this.avatars = data;
            this.setState({avatarsloaded: true});
        });

        this.setState({page: 'pick-avatar'})
    }

    navigateNamePick() {
        if(!this.selectedAvatar)
        {
            return;
        }

        this.setState({page: 'pick-name'});
    }

    renderWelcome(props) {
        return (
            <div id="content-frame" className='center_column'>
                <p id="intro-text">Welcome to Chat RPG! Click the button below to begin your journey for adventure and treasure.</p>
                <RPGUI.Button id='play-btn' className="responsive-btn" onClick={this.navigateAvatarPick} >Play</RPGUI.Button>
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
            <label key={index}>
                <input type="radio" name="avatar" className="inputProxy" value={url} onChange={this.onAvaterPicked}/>
                <img src={backend.getResourceURL(url)} id={"avatar" + index} className='avatarImg'/>
            </label>
            );
            return (
                <div id="content-frame">
                    <h1 className='title'>Choose an Avatar!</h1>
                    <div id="avatar-pick">
                        {avatarImgs}
                    </div>
                    <RPGUI.Button className="responsive-btn" id="begin-btn" onClick={this.navigateNamePick}>Next</RPGUI.Button>
                </div>
            );   
        }
    }

    renderNamePick(props) {
        return (
            <div id="content-frame">
                <h1 className='title'>Embark</h1>
                <RPGUI.TextBox id="name-picker" onInput={this.onNameChanged}>Name</RPGUI.TextBox>
                <RPGUI.Button className="responsive-btn long" id="begin-btn" onClick={this.onBeginAdventure}>Begin Adventure</RPGUI.Button>
                <RPGUI.Button className="responsive-btn short" id="begin-btn" onClick={this.onBeginAdventure}>Begin</RPGUI.Button>
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

export default SignUp;