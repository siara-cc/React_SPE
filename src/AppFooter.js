import React, { PureComponent } from 'react';
import './w3.css';
import './AppFooter.css';
import { openPage } from './AppFunctions.js';
import cr_res from 'cr_addon_resources';

class AppFooter extends PureComponent {
  isNumberKey = (event) => {
    var charCode = (event.which) ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57)
      event.preventDefault();
  }
  handleClick = (event) => {
    event.preventDefault();
    openPage('', event.target.parentElement.children[1].value, 'u', false);
  }
  render() {
    return (
      <div>
        <div className="w3-row dbname" style={{width:'100%', padding: '5px', verticalAlign: 'center'}}>
            {cr_res.getString("page")}
            <input type="text" size="5" defaultValue="2" onKeyPress={this.isNumberKey}
              style={{textAlign: 'right'}}/>&nbsp;
            <button className="w3-bar-item w3-button w3-small w3-green" onClick={this.handleClick}>{cr_res.getString("open")}</button>
            &nbsp;&nbsp; {cr_res.getString("db")}<span id="dbName">&nbsp;<em>{cr_res.getString("not_opened")}</em></span>
        </div>
        <div className="w3-row dbname" style={{width:'100%', padding: '5px', verticalAlign: 'center'}}>
          <div className="w3-col m7 w3-container" style={{height:'100%'}}>
            <a className="w3-hover-green" href="https://www.sqlite.org/fileformat.html">&lt;{cr_res.getString("ref")}&gt;</a>
            &nbsp;| &nbsp;
            <a className="w3-hover-green" href="https://github.com/siara-cc">&copy;&nbsp;<nobr>Siara Logics (cc) 2015-19</nobr></a>
            &nbsp;| &nbsp;
            <a className="w3-hover-green" href="https://github.com/siara-cc/sqlite3_page_explorer">GitHub</a>
            &nbsp;| &nbsp;
            <a className="w3-hover-green" href="http://htmlpreview.github.com/?https://github.com/siara-cc/sqlite3_page_explorer/blob/master/eula.htm">{cr_res.getString("license")}</a>
            &nbsp;| &nbsp;
            <a className="w3-hover-green" href="http://htmlpreview.github.com/?https://github.com/siara-cc/sqlite3_page_explorer/blob/master/privacy.htm">{cr_res.getString("privacy")}</a>
          </div>
          <div className="w3-col m3 w3-container w3-right-align" style={{height:'100%'}}>
            <select onChange={(event) => {
              var obj = event.target;
              if (!window.cr)
                 window.cr = {};
              window.cr.lang = obj.value;
              document.body.dir = obj.options[obj.selectedIndex].getAttribute("direction");
              cr_res.clearCache();
              this.props.setLang(obj.value);
            }}>
              { cr_res.getLangList().map(lang => (
                <option direction={lang[3]}
                  value={lang[0]}>{lang[1] + " (" + lang[2] + ")"}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }
}

export default AppFooter;
