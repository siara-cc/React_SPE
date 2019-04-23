import React, { PureComponent } from 'react';
import './w3.css';
import './AppHeader.css';
import { selectFile } from './AppFunctions.js';
import cr_res from 'cr_addon_resources';

class AppHeader extends PureComponent {
  render() {
    return (
      <div className="w3-row" style={{width:'100%', padding: '5px'}}>
        <div className="w3-col m3 w3-container" style={{height:'100%', minWidth:'10%'}}>
          <nobr>
            <img src={cr_res.getImgPath("siara_cc_3d.png")} alt="org logo" width="84px" height="48px"></img>
            <img src={cr_res.getImgPath("db_search.png")} alt="app logo" width="48px" height="48px"></img>
          </nobr>
        </div>
        <div className="w3-col m6 w3-container hdr" 
          style={{color: 'green', height:'100%', minWidth:'40%'}}>
          <b><nobr>{cr_res.getString("app_name")}</nobr></b></div>
        <div className="w3-col m3 w3-container" 
          style={{textAlign: 'right', height:'100%', minWidth:'10%'}} >
          <input type="button" className="fancyButton"
            onClick={(event) => {
              selectFile(this.props.parentState, this.props.setStateOnOpen);
            }} value={cr_res.getString("open_db")}/>
        </div>
      </div>
    );
  }
}

export default AppHeader;
