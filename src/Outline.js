import React, { Component } from 'react';
import './w3.css';
import './Outline.css';
import { showPageType } from './AppFunctions.js';
import { fourBytesToInt } from './AppFunctions.js';

class Outline extends Component {
  constructor(props) {
    super(props);
    this.state = { items: []};
  }
  render() {
    return (
        <div className="w3-row outln">
            <div className="w3-col m2 w3-container container"
                   style={{minWidth:'35%', padding: '5px'}}>
              <div className="watermark">Page outline</div>
              <PageList items={this.state.items} />
            </div>
            <div className="w3-col m2 w3-container container"
                   style={{minWidth:'65%', padding: '5px'}}>
              <div className="watermark">Page contents</div>
              <div className="detailArea" id="detailArea">
                <DetailArea />
              </div>
            </div>
        </div>
    );
  }
}

class PageList extends React.Component {
  render() {
    return (
      <ul className="outlineArea" id="mainOutline">
        {this.props.items.map(item => (
          <li id={item.pageId} onClick={(event) => { showPageType(this, event, item.typName); }}>
            {item.typName} {item.typDesc} {item.pageNo}
            <input type="hidden" value={item.pageNo}/><ul></ul></li>
        ))}
      </ul>
    );
  }
}

class DetailArea extends Component {
  render() {
    if (this.props.typName === "Header")
      return <HeaderDetail />
    else if (this.props.typName === "BTree")
      return <BTreeDetail />
    else if (this.props.typName === "LockByte")
      return <LockByteDetail />
    else if (this.props.typName === "FreeTrunk")
      return <FreeTrunkDetail />
    else if (this.props.typName === "FreeLeaf")
      return <FreeLeafDetail />
    else if (this.props.typName === "Overflow")
      return <OverflowDetail />
    else if (this.props.typName === "PtrMap")
      return <PtrMapDetail />
  }
}

class HeaderDetail extends Component {
  render() {
    var firstFLTrunk = fourBytesToInt(this.props.pageContent, 32);
    var flCount = fourBytesToInt(this.props.pageContent, 36);
    var encoding = fourBytesToInt(this.props.pageContent, 56);
    var txtEncoding = (encoding === 2 ? "utf-16le" : (encoding === 3 ? "utf-16be" : "utf-8"));
    var button = ""
    if (flCount > 0) {
      button = <input type="button" value="Open" onClick='openPage(\"\", {firstFLTrunk
               }, \"{(flCount === 1 ? "fl" : "ft")}\", false);'/>
    }
    return (<div><b><u>File header</u></b><br/><br/>Header string: <b>SQLite format 3</b>
      <br/>Page Size: <b>{pageSize} </b>
      <br/>File format write version: <b>{(this.props.pageContent[18] === 1 ? "Legacy" : "WAL")}</b>
      <br/>File format read version: <b>{(this.props.pageContent[19] === 1 ? "Legacy" : "WAL")}</b>
      <br/>Bytes of unused reserved space at the end of each page: <b>{this.props.pageContent[20]}</b>
      <br/>Maximum embedded payload fraction. Must be 64: <b>{this.props.pageContent[21]}</b>
      <br/>Minimum embedded payload fraction. Must be 32: <b>{this.props.pageContent[22]}</b>
      <br/>Leaf payload fraction. Must be 32: <b>{this.props.pageContent[23]}</b>
      <br/>File change counter: <b>{fourBytesToInt(this.props.pageContent, 24)}</b>
      <br/>Size of the database file in pages: <b>{fourBytesToInt(this.props.pageContent, 28)}</b>
      <br/>Page number of the first freelist trunk page: <b>{firstFLTrunk}</b>
      {button}
      <br/>Total number of freelist pages: <b>{flCount}</b>
      <br/>The schema cookie: <b>{fourBytesToInt(this.props.pageContent, 40)}</b>
      <br/>The schema format number (Supported are 1, 2, 3, and 4): <b>{fourBytesToInt(this.props.pageContent, 44)}</b>
      <br/>Default page cache size: <b>{fourBytesToInt(this.props.pageContent, 48)}</b>
      <br/>Largest root b-tree page no. (in auto-vacuum or incremental-vacuum modes, else 0): <b>{fourBytesToInt(this.props.pageContent, 52)}</b>
      <br/>The database text encoding (1-UTF-8, 2-UTF-16le, 3-UTF-16be): <b>{txtEncoding}</b>
      <br/>The 'user version' as read and set by the user_version pragma.: <b>{fourBytesToInt(this.props.pageContent, 60)}</b>
      <br/>Incremental-vacuum mode (0-true, 1-false): <b>{fourBytesToInt(this.props.pageContent, 64)}</b>
      <br/>The 'Application ID' set by PRAGMA application_id: <b>{fourBytesToInt(this.props.pageContent, 68)}</b>
      <br/>The version-valid-for number: <b>{fourBytesToInt(this.props.pageContent, 92)}</b>
      <br/>SQLITE_VERSION_NUMBER: <b>{fourBytesToInt(this.props.pageContent, 96)}</b>
      <br/><br/></div>)
  }
}

class FreeTrunkDetail extends Component {
  render() {
    var nextTrunk = fourBytesToInt(this.props.pageContent, 0);
    var leafCount = fourBytesToInt(this.props.pageContent, 4);
    var button = ""
    if (nextTrunk > 0)
      button = <input type='button' value='Open' onclick='openPage(\"\", " + nextTrunk + ", \"ft\", false);'/>
    var leafList = []
    for (var i = 0; i < leafCount; i++) {
      var leafPageNo = fourBytesToInt(this.props.pageContent, 8 + i * 4);
      leafList.push(<tr><td>{leafPageNo}
              </td><td><input type="button" value='Open' onclick='openPage(\"\", " 
              + leafPageNo + ", \"fl\", false);'/></td></tr>)
    }
    var leafHTML = ""
    if (leafCount > 0) {
      leafHTML = (<table cellspacing='1' cellpadding='1' border='1'>
                   <tr><td>Leaf page no.</td><td>Open</td></tr>
                   {leafList}
                   </table>)
    }
    return (<div><br/><span>Next trunk page: </span><b>{nextTrunk}</b>
              <br/>Freelist leaf count: <b>{leafCount}</b>
              {button}
              {leafHTML}
            </div>)
  }
}

class FreeLeafDetail extends Component {
  render() {
    var ptype = this.props.pageContent[0];
    if (ptype === 2 || ptype === 5 || ptype === 10 || ptype === 13) {
      return (<input type="button" value='Show as B-Tree page' onclick='openPage(\"\", " 
                    + pageNo + ", \"b\", false);'/>)
    }
    return ""
  }
}

class OverflowDetail extends Component {
  render() {
    var nextPageNo = fourBytesToInt(this.props.pageContent, 0);
    if (nextPageNo) {
      return (<td><input type='button' value={"Next Page " + nextPageNo} onclick='openPage(\"" + obj.id + "\"," 
      + nextPageNo + ", \"o\", false)'/></td>)
    }
    return "Last overflow page"
  }
}

export default Outline;
