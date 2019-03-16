import React, { Component } from 'react';
import './w3.css';
import './AppFooter.css';

class AppFooter extends Component {
  render() {
    return (
      <div className="w3-row dbname" style={{width:'100%', padding: '5px', verticalAlign: 'center'}}>
        <div className="w3-col m2 w3-container" style={{height:'100%'}}>
          DB: <span id="dbName"><em>Not opened yet</em></span>
        </div>
        <div className="w3-col m3 w3-container" style={{height:'100%'}}>
          <a className="w3-hover-green" href={{javascript:'var x=1'}}
            onClick={() => { alert("openPage('', this.parentElement.children[1].value, 'u', false);"); }}>Open page:</a>
          <input type="text" size="5" defaultValue="2" onKeyPress={() => { alert("return isNumberKey(event);") }}
            style={{textAlign: 'right'}}/>
        </div>
        <div className="w3-col m5 w3-container w3-right-align" style={{height:'100%'}}>
          <a className="w3-hover-green" href="https://www.sqlite.org/fileformat.html">&lt;Ref&gt;</a>
          &nbsp;|&nbsp;
          <a className="w3-hover-green" href="https://github.com/siara-cc">&copy;&nbsp;Siara Logics (cc) 2015-19</a>
          &nbsp;|&nbsp;
          <a className="w3-hover-green" href="https://github.com/siara-cc/sqlite3_page_explorer">GitHub</a>
          &nbsp;|&nbsp;
          <a className="w3-hover-green" href="http://htmlpreview.github.com/?https://github.com/siara-cc/sqlite3_page_explorer/blob/master/eula.htm">License</a>
          &nbsp;|&nbsp;
          <a className="w3-hover-green" href="http://htmlpreview.github.com/?https://github.com/siara-cc/sqlite3_page_explorer/blob/master/privacy.htm">Privacy</a>
        </div>
      </div>
    );
  }
}

export default AppFooter;
