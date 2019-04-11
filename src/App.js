import React, { Component } from 'react';
import AppHeader from './AppHeader';
import Outline from './Outline';
import ByteView from './ByteView';
import AppFooter from './AppFooter';
import './App.css';

class App extends Component {
  render() {
    return (
      <div style={{height:'100%'}}>
        <AppHeader/>
        <Outline/>
        <ByteView/>
        <AppFooter/>
      </div>
    );
  }
}

export default App;
