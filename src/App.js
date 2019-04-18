import React, { PureComponent } from 'react';
import AppHeader from './AppHeader';
import Outline from './Outline';
import ByteView from './ByteView';
import AppFooter from './AppFooter';
import './App.css';

class App extends PureComponent {
  constructor(props) {
    super(props)
    this.state = { pageCount: 0,
      pageList: [],
      dbInfo: {myBinaryFileFD: 0,
        pageSize: 0, usableSize: 0, 
        maxLocal: 0, minLocal: 0,
        maxLeaf: 0, minLeaf: 0,
        txtEncoding: "utf-8"
      },
      start: 0,
      paggeId: '',
      typName: "",
      pageContent: []
    };
    this.setStateOnOpen = this.setStateOnOpen.bind(this)
    this.setPageContent = this.setPageContent.bind(this)
    this.updateState = this.updateState.bind(this)
  }
  setStateOnOpen(st) {
    this.setState(st);
  }
  setPageContent(start, typName, pageBytes, pageId) {
    var newState = { pageCount: this.state.pageCount,
      pageList: this.state.pageList,
      dbInfo: this.state.dbInfo,
      start: start,
      pageId: pageId,
      typName: typName,
      pageContent: pageBytes
    }
    this.setState(newState);
  }
  updateState(newState) {
    this.setState(newState);
  }
  render() {
    return (
      <div style={{height:'100%'}}>
        <AppHeader parentState={this.state} setStateOnOpen={this.setStateOnOpen} />
        <Outline parentState={this.state} setPageContent={this.setPageContent} 
                  updateState={this.updateState}/>
        <ByteView parentState={this.state} />
        <AppFooter updateState={this.updateState} />
      </div>
    );
  }
}

export default App;
