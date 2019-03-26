import React, { Component } from 'react';
import './w3.css';
import './AppHeader.css';
import { selectFile } from './AppFunctions.js';

class AppHeader extends Component {
  render() {
    return (
      <div className="w3-row" style={{width:'100%', padding: '5px'}}>
        <div className="w3-col m3 w3-container" style={{height:'100%', minWidth:'10%'}}>
          <nobr>
            <img src="res/img/siara_cc_3d.png" alt="org logo" width="84px" height="48px"></img>
            <img src="res/icons/db_search.png" alt="app logo" width="48px" height="48px"></img>
          </nobr>
        </div>
        <div className="w3-col m6 w3-container hdr" 
          style={{color: 'green', height:'100%', minWidth:'40%'}}>
          <b><nobr>Sqlite Page Explorer</nobr></b></div>
        <div className="w3-col m3 w3-container" 
          style={{textAlign: 'right', height:'100%', minWidth:'10%'}} >
          <input type="button" className="fancyButton" onClick={(event) => { selectFile(); }} value="Open database"/>
        </div>
      </div>
    );
  }
}

export default AppHeader;
