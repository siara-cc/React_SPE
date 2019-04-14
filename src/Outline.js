import React, { Component } from 'react';
import './w3.css';
import './Outline.css';
import { readPage } from './AppFunctions.js';
import { getVarInt } from './AppFunctions.js';
import { toHexString } from './AppFunctions.js';
import { getIntValue } from './AppFunctions.js';
import { getFloatValue } from './AppFunctions.js';
import { twoBytesToInt } from './AppFunctions.js';
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
              <PageList parentState={this.props.parentState} setPageContent={this.props.setPageContent} />
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
        {this.props.parentState.pageList.map(pageItem => (
          <li id={pageItem.pageId} onClick={(event) => { this.props.setPageContent(pageItem.item.typName); }}>
            {pageItem.typName} {pageItem.typDesc} {pageItem.pageNo}
            <input type="hidden" value={pageItem.pageNo}/><ul></ul></li>
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
    else if (this.props.typName === "FreeTrunk")
      return <FreeTrunkDetail />
    else if (this.props.typName === "FreeLeaf")
      return <FreeLeafDetail />
    else if (this.props.typName === "Overflow")
      return <OverflowDetail />
    return null;
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
      <br/>Page Size: <b>{this.props.dbInfo.pageSize} </b>
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
      button = <input type='button' value='Open' onclick='openPage(\"\", {nextTrunk}, \"ft\", false);'/>
    var leafList = []
    for (var i = 0; i < leafCount; i++) {
      var leafPageNo = fourBytesToInt(this.props.pageContent, 8 + i * 4);
      leafList.push(<tr><td>{leafPageNo}
              </td><td><input type="button" value='Open' onclick='openPage(\"\", " 
              + leafPageNo}, \"fl\", false);'/></td></tr>)
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
                    + pageNo}, \"b\", false);'/>)
    }
    return ""
  }
}

class OverflowDetail extends Component {
  render() {
    var nextPageNo = fourBytesToInt(this.props.pageContent, 0);
    if (nextPageNo) {
      return (<td><input type='button' value='Next Page " + nextPageNo + "' onclick='openPage(\"" + obj.id + "\","
      + nextPageNo + ", \"o\", false)'/></td>)
    }
    return "Last overflow page"
  }
}

function formColDataHtml(arr, cellPtr, pageId) {
  var hdr = [];
  var det = [];
  var hdrInfo = getVarInt(arr, cellPtr);
  var hdrLen = hdrInfo[0] - hdrInfo[1];
  var dataPtr = cellPtr + hdrInfo[0];
  cellPtr += hdrInfo[1];
  var colIdx = 0;
  for (var i = 0; i < hdrLen; ) {
    var colInfo = getVarInt(arr, cellPtr);
    switch (colInfo[0]) {
      case 0:
      case 8:
      case 9:
        hdr.push(<td>-</td>)
        det.push(<td>{(colInfo[0] === 0 ? "null" : (colInfo[0] === 8 ? "0" : "1"))}</td>);
        break;
      case 1:
      case 2:
      case 3:
      case 4:
        hdr.push(<td>i{(8 * colInfo[0])}</td>)
        det.push(<td>{getIntValue(arr, dataPtr, colInfo[0])}</td>)
        dataPtr += colInfo[0];
        break;
      case 5:
      case 6:
        hdr.push(<td>i{(colInfo[0] === 5 ? "48" : "64")}</td>)
        det.push(<td>{getIntValue(arr, dataPtr, colInfo[0] === 5 ? 6 : 8)}</td>);
        dataPtr += (colInfo[0] === 5 ? 6 : 8);
        break;
      case 7:
        hdr.push(<td>f64</td>)
        det.push(<td>{getFloatValue(arr, dataPtr).toPrecision()}</td>)
        dataPtr += 8;
        break;
      case 10:
      case 11:
        hdr.push(<td>?</td>);
        det.push(<td>?</td>);
        break;
      default:
        var dataLen = colInfo[0] - (colInfo[0] % 2 ? 12 : 13);
        dataLen /= 2;
        dataLen = Math.floor(dataLen);
        if (colInfo[0] % 2) {
          hdr.push(<td>text</td>);
          var dec = new TextDecoder(this.props.dbInfo.txtEncoding);
          det.push(<td>{dec.decode(arr.slice(dataPtr, dataPtr + dataLen))}</td>)
        } else {
          hdr.push(<td>blob</td>)
          det.push(<td>{toHexString(arr.slice(dataPtr, dataLen))}</td>)
        }
        dataPtr += dataLen;
    }
    if (pageId.substr(0, 2) === 'r0' && colIdx === 3) {
      var pageNo = det.substring(det.lastIndexOf("<td>") + 4); // todo
      det.push(<input type='button' value='Open'
                 onclick='openPage(\"" + pageId + "\"," + pageNo + ", \"b\", true)'/>)
    }
    i += colInfo[1];
    cellPtr += colInfo[1];
    colIdx++;
  }
  return [hdr, det];
}

class BTreeDetail extends Component {
  render() {
    var pageNo = this.props.pageNo;
    var ptype, ptypestr;
    ptype = this.props.pageContent[this.props.start];
    ptypestr = (ptype === 2 ? "Interior index" : (ptype === 5 ? "Interior table" : (ptype === 10 ? "Leaf index" : ptype === 13 ? "Leaf table" : "Invalid")));
    var cellCount = twoBytesToInt(this.props.pageContent, this.props.start + 3);
    var pageId = this.props.pageId;
    var hdrSize = 8;
    var rightPtrHTML = ""
    if (ptype === 2 || ptype === 5) {
      var rightPtr = fourBytesToInt(this.props.pageContent, this.props.start + 8);
      rightPtrHTML = <span><br/>Right most pointer: <b>{rightPtr}</b>&nbsp;<input type='button' value='Open' onclick='openPage(\"{pageId}\",{rightPtr}, \"b\", false)'/></span>
      hdrSize = 12;
    }
    var hdr = ""
    var rowArray = []
    for (var cell = 0; cell < cellCount; cell++) {
      var cellPtr = twoBytesToInt(this.props.pageContent, cell * 2 + hdrSize + this.props.start);
      var cellContent = []
      if (ptype === 2 || ptype === 5) {
        var pNo = fourBytesToInt(this.props.pageContent, cellPtr);
        cellContent.push(<td><input type='button' value='Page {pNo}' onclick='openPage(\"{pageId}\"," 
                + pNo}, \"b\", false)'/></td>)
        cellPtr += 4;
      }
      var vInt = getVarInt(this.props.pageContent, cellPtr);
      cellPtr += vInt[1];
      switch (ptype) {
        case 2:
          cellContent.push(<td>-</td>)
          cellContent.push(<td>{vInt[0]}</td>)
          break;
        case 5:
          cellContent.push(<td>{vInt[0]}</td>)
          cellContent.push(<td>-</td>)
          cellContent.push(<td>-</td>)
          cellContent.push(<td>-</td>)
          break;
        case 10:
          cellContent.push(<td>-</td>)
          cellContent.push(<td>-</td>)
          cellContent.push(<td>{vInt[0]}</td>)
          break;
        case 13:
          var vInt1 = getVarInt(this.props.pageContent, cellPtr);
          cellContent.push(<td>-</td>)
          cellContent.push(<td>{vInt1[0]}</td>)
          cellContent.push(<td>{vInt[0]}</td>)
          cellPtr += vInt1[1];
          break;
        default:
      }
      if (ptype === 2 || ptype === 10 || ptype === 13) {
        var X = (ptype === 13 ? this.props.dbInfo.maxLeaf : this.props.dbInfo.maxLocal);
        var P = vInt[0];
        pageNo = 0;
        var oarr;
        if (P > X) {
            var M = this.props.dbInfo.minLeaf;
            var ovflwMaxPageBytes = (this.props.dbInfo.usableSize - 4);
            var K = M + (P - M) % ovflwMaxPageBytes;
            var surplus = P - (K > X ? M : K);
            var dataEnd = cellPtr + P - surplus;
            pageNo = fourBytesToInt(this.props.pageContent, dataEnd);
            oarr = new Uint16Array(P);
            for (var k = cellPtr; k < dataEnd; k++)
              oarr[k - cellPtr] = this.props.pageContent[k];
            var oPageNo = pageNo;
            while (surplus > 0) {
              var toRead = (surplus > ovflwMaxPageBytes ? ovflwMaxPageBytes : surplus) + 4;
              var obuf = readPage(oPageNo, toRead);
              if (obuf != null) {
                toRead -= 4;
                for (var k1 = 0; k1 < toRead; k1++)
                  oarr[k1 + dataEnd - cellPtr] = obuf[k1 + 4];
                oPageNo = fourBytesToInt(obuf, 0);
                if (oPageNo === 0)
                  break;
                dataEnd += toRead;
              }
              surplus -= ovflwMaxPageBytes;
            }
        }
        var hdrDtl = formColDataHtml((P > X ? oarr : this.props.pageContent), (P > X ? 0 : cellPtr), pageId);
        hdr = hdrDtl[0];
        cellContent.push(hdrDtl[1]);
        if (pageNo) {
          cellContent.push(<td><input type='button' value='Page {pageNo}' onclick='openPage(\"{pageId}\"," 
                    + pageNo}, \"o\", false)'/></td>)
        } else
          cellContent.push(<td>-</td>)
      }
      rowArray.push(<tr>{cellContent}</tr>)
    }
    return (<div>Page type : <b>{ptypestr}</b> (2-interior index, 5-interior table, 10-leaf index, 13-leaf table)
              <br/>First freeblock on the page: <b>{twoBytesToInt(this.props.pageContent, this.props.start + 1)}</b>
              <br/>Number of cells on page: <b>{cellCount}</b>
              <br/>Start of cell content area: <b>{twoBytesToInt(this.props.pageContent, this.props.start + 5)}</b>
              <br/>Number of fragmented free bytes: <b>{this.props.pageContent[this.props.start + 7]}</b>
              {rightPtrHTML}
              <br/><br/><b>Cells:</b><br/>
              <table cellspacing='1' cellpadding='1' border='1'>
              <thead><td>Page</td><td>Row ID</td><td>Len</td>{hdr}<td>Overflow</td></thead>
              {rowArray}
              </table></div>)
  }
}

export default Outline;
