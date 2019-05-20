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
      pageId: '',
      typName: "",
      pageContent: [],
      lang: ""
    };
    this.setStateOnOpen = this.setStateOnOpen.bind(this)
    this.setPageContent = this.setPageContent.bind(this)
    this.addPageItem = this.addPageItem.bind(this)
    this.locateParentPageItem = this.locateParentPageItem.bind(this)
    this.setLang = this.setLang.bind(this)
  }
  setStateOnOpen(st) {
    this.setState(st);
  }
  setPageContent(start, typName, pageId, pageBytes) {
    var newState = { pageCount: this.state.pageCount,
      pageList: this.state.pageList,
      dbInfo: this.state.dbInfo,
      start: start,
      pageId: pageId,
      typName: typName,
      pageContent: pageBytes,
      lang: this.state.lang
    }
    this.setState(newState);
  }
  setLang(lang) {
    var newState = { pageCount: this.state.pageCount,
      pageList: this.state.pageList,
      dbInfo: this.state.dbInfo,
      start: this.state.start,
      pageId: this.state.pageId,
      typName: this.state.typName,
      pageContent: this.state.pageContent,
      lang: lang
    }
    this.setState(newState);
  }
  locateParentPageItem(pageList, parentPageId) {
    for (var i = 0; i < pageList.length; i++) {
      if (pageList[i].pageId === parentPageId)
        return pageList[i];
      var pageItem = this.locateParentPageItem(pageList[i].pageList, parentPageId);
      if (pageItem !== null)
        return pageItem;
    }
    return null;
  }  
  addPageItem(pageItem, parentPageId) {
    var parentPageItem = null;
    if (parentPageId !== "") {
      parentPageItem = this.locateParentPageItem(this.state.pageList, parentPageId);
      if (parentPageItem === null)
        parentPageItem = this.state.pageList[this.state.pageList.length - 1];
        parentPageItem.pageList[parentPageItem.pageList.length] = pageItem;
    } else
      this.state.pageList[this.state.pageList.length] = pageItem;
    var newState = { pageCount: this.state.pageCount + 1,
      pageList: this.state.pageList,
      dbInfo: this.state.dbInfo,
      start: this.state.start,
      pageId: this.state.pageId,
      typName: this.state.typName,
      pageContent: this.state.pageContent
    }
    this.setState(newState);
  }
  render() {
    return (
      <div style={{height:'100%'}}>
        <AppHeader parentState={this.state} setStateOnOpen={this.setStateOnOpen} />
        <Outline parentState={this.state} setPageContent={this.setPageContent} 
                  addPageItem={this.addPageItem}/>
        <ByteView parentState={this.state} />
        <AppFooter setLang={this.setLang} lang={this.state.lang} 
          parentState={this.state} addPageItem={this.addPageItem}/>
      </div>
    );
  }
}

export default App;
