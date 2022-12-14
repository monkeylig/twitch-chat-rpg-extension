import logo from './logo.svg';
import './App.css';
import React from 'react';

import SignUp from './getting-started/getting-started'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {page: 'landing'};

    this.navigate = this.navigate.bind(this);
  }

  navigate(nextPage) {
    this.setState({page: nextPage});
  }

  render() {
    switch (this.state.page) {
      case 'landing':
        return <Landing onNavigate={this.navigate}/>;
      case 'get-started':
        return <SignUp/>;
      default:
        return <p>Sorry, somthing went wrong</p>;
    }
  }
}

function Landing(props) {
  window.Twitch.ext.onAuthorized((auth) => {
    console.log('The JWT that will be passed to the EBS is', auth.token);
    console.log('The channel ID is', auth.userId);
    window.Twitch.ext.rig.log('Broadcaster ' + window.Twitch.ext.configuration.broadcaster)
  });
  if(props.onNavigate)
  {
    setTimeout(() => {
      props.onNavigate('get-started');
    }, 1000); 
  }
  return <p>Loading Chat RPG</p>
}

export default App;
