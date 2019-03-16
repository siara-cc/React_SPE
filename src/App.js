import React, { Component } from 'react';
import AppHeader from './AppHeader';
import Outline from './Outline';
import ByteView from './ByteView';
import AppFooter from './AppFooter';
import './App.css';
//import $ from 'jquery';

class App extends Component {
  //handleClick() {
  //  $("#hello").val(uc("Hi"));
  //}
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
