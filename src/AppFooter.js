import React, { Component } from 'react';
import './w3.css';
import './AppFooter.css';
import { openPage } from './AppFunctions.js';
import cr_res from 'cr_addon_resources';

class AppFooter extends Component {
  constructor(props) {
    super(props);
    this.state = {val: "2"};
  }
  render() {
    return (
      <div>
        <div className="w3-row dbname" style={{width:'100%', padding: '5px', verticalAlign: 'center'}}>
            {cr_res.getString("page")}
            <input type="text" size="5" value={this.state.val}
              onKeyPress={(event) => {
                var charCode = (event.which) ? event.which : event.keyCode;
                if (charCode < 48 || charCode > 57)
                  event.preventDefault();
              }} onChange={(event) => {
                this.setState({val: event.target.value});
              }}
              style={{textAlign: 'right'}}/>&nbsp;
            <button className="w3-bar-item w3-button w3-small w3-green" onClick={(event) => {
                openPage(this.props.parentState.dbInfo.myBinaryFileFD,
                  "", event.target.parentElement.children[0].value, 'u', 
                  false, this.props.parentState, this.props.addPageItem);
                  event.preventDefault();
                }}>{cr_res.getString("open")}</button>
            &nbsp;&nbsp; {cr_res.getString("db")}&nbsp;<span id="dbName"><em>{cr_res.getString("not_opened")}</em></span>
        </div>
        <div className="w3-row w3-container dbname w3-left-align" style={{width:'100%', padding: '5px', verticalAlign: 'center'}}>
          <div className="w3-col m7" style={{height:'100%'}}>
            <a className="w3-hover-green" href="https://www.sqlite.org/fileformat.html">{cr_res.getString("ref")}
            </a> | <a className="w3-hover-green" href="https://github.com/siara-cc">&copy;&nbsp;<nobr>Siara Logics (cc) 2015-19</nobr>
            </a> | <a className="w3-hover-green" href="https://github.com/siara-cc/sqlite3_page_explorer">Git
            </a> | <a className="w3-hover-green" href="https://siara.cc/SPE/eula.html">{cr_res.getString("license")}
            </a> | <a className="w3-hover-green" href="https://siara.cc/SPE/privacy.html">{cr_res.getString("privacy")}</a>
          </div>
          <div className="w3-col m5 w3-right-align" style={{height:'100%'}}>
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
