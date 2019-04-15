import React, { Component } from 'react';
import AppHeader from './AppHeader';
import Outline from './Outline';
import ByteView from './ByteView';
import AppFooter from './AppFooter';
import './App.css';

class App extends Component {
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
      typName: "BTree",
      pageContent: []
    };
    this.setStateOnOpen = this.setStateOnOpen.bind(this)
    this.setPageContent = this.setPageContent.bind(this)
    this.addPage = this.addPage.bind(this)
  }
  setStateOnOpen(st) {
    this.setState(st);
  }
  setPageContent(start, typName, pageBytes) {
    var newState = { pageCount: this.state.pageCount,
      pageList: this.state.pageList,
      dbInfo: this.state.dbInfo,
      start: start,
      typName: typName,
      pageContent: pageBytes
    }
    this.setState(newState);
  }
  addPage(idx, pageItem) {
    var newList = this.state.pageList.slice(0);
    newList.splice(idx, 0, pageItem);
    var newState = { pageCount: this.state.pageCount + 1,
      pageList: newList,
      dbInfo: this.state.dbInfo,
      currentPage: this.state.currentPage,
      pageContent: this.state.pageContent
    }
    this.setState(newState);
  }
  render() {
    return (
      <div style={{height:'100%'}}>
        <AppHeader parentState={this.state} setStateOnOpen={this.setStateOnOpen} />
        <Outline parentState={this.state} setPageContent={this.setPageContent} 
                  addPage={this.addPage}/>
        <ByteView parentState={this.state} />
        <AppFooter addPage={this.addPage} />
      </div>
    );
  }
}

export default App;
