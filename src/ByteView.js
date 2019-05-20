import React, { PureComponent } from 'react';
import { twoBytesToInt } from './AppFunctions'
import { getVarInt } from './AppFunctions'
import { hexFromByte } from './AppFunctions'
import cr_res from 'cr_addon_resources';
import './w3.css';
import './ByteView.css';

class ByteView extends PureComponent {
  syncScroll = (event) => {
    var other1 = document.getElementById(event.target.id === "hexArea1" ? "hexArea2" : "hexArea1");
    var other2 = document.getElementById(event.target.id === "hexArea3" ? "hexArea2" : "hexArea3");
    other1.scrollTop = event.target.scrollTop;
    other2.scrollTop = event.target.scrollTop;
  }  
  render() {
    return (
      <div style={{height:'30%', maxHeight:'30%', width:'100%'}}>
        <div className="w3-row" style={{height:'100%', width:'100%'}}>
          <div className="w3-col m3 w3-container container"
                 style={{minWidth:'37%', padding: '5px'}}>
            <div className="watermark">{cr_res.getString("hex_view")}</div>
            <div className="hexArea" id="hexArea1" onScroll={this.syncScroll}>
              <BytesDisplay parentState={this.props.parentState} mode="hex"/>
            </div>
          </div>
          <div className="w3-col m4 w3-container container"
                 style={{minWidth:'44%', padding: '5px'}}>
            <div className="watermark">{cr_res.getString("dec_view")}</div>
            <div className="hexArea" id="hexArea2" onScroll={this.syncScroll}>
              <BytesDisplay parentState={this.props.parentState} mode="dec"/>
            </div>
          </div>
          <div className="w3-col m2 w3-container container"
                 style={{minWidth:'19%', padding: '5px'}}>
            <div className="watermark">{cr_res.getString("txt_view")}</div>
            <div className="hexArea" id="hexArea3" onScroll={this.syncScroll}>
              <BytesDisplay parentState={this.props.parentState} mode="txt"/>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

var pageInfo = {uint8arr: null, start: 0, ptype: 0, curPos: 0, cellarr: null, cellend: 0,
  atype: 'h', firstFreeBlockStart: 0, cellCount: 0, nxtFB: 0};
function markDumpStart() {
  if (pageInfo.ptype === 0)
    return "";
  if (pageInfo.curPos === pageInfo.start)
    return "<span class='bh'>";
  var hdrSize = (pageInfo.ptype === 2 || pageInfo.ptype === 5) ? 12 : 8;
  if ((pageInfo.curPos - pageInfo.start) === hdrSize && pageInfo.cellCount > 0) {
    pageInfo.cellarr = [];
    for (var i = 0; i < pageInfo.cellCount; i++)
      pageInfo.cellarr[pageInfo.cellarr.length] = twoBytesToInt(pageInfo.uint8arr, i * 2 + pageInfo.curPos);
    pageInfo.cellarr.sort(function sortNumber(num1, num2) {return num1 - num2;});
    return "<span class='bca'>";
  }
  if (pageInfo.nxtFB > 0 && pageInfo.curPos === (pageInfo.start + pageInfo.nxtFB))
    return "<span class='bfb'>";
  if (pageInfo.cellarr != null && pageInfo.cellarr.length > 0 && pageInfo.cellarr[0] === pageInfo.curPos) {
    if (pageInfo.ptype === 5)
      pageInfo.cellend = (pageInfo.cellarr[0] + 4 + getVarInt(pageInfo.uint8arr, pageInfo.cellarr[0] + 4)[1]);
    else {
      var vInt = getVarInt(pageInfo.uint8arr, pageInfo.cellarr[0] + (pageInfo.ptype === 2 ? 4 : 0));
      var X = (pageInfo.ptype === 13 ? this.props.dbInfo.maxLeaf : this.props.dbInfo.maxLocal);
      var P = vInt[0];
      if (P > X) {
        var M = this.props.dbInfo.minLeaf;
        var K = M + (P - M) % (this.props.dbInfo.usableSize - 4);
        P = (K > X ? M : K);
        P += 4;
      }
      if (pageInfo.ptype === 13) {
        pageInfo.cellend = (pageInfo.cellarr[0] + vInt[1] + P
          + getVarInt(pageInfo.uint8arr, pageInfo.cellarr[0] + vInt[1])[1] - 1);
      } else {
        pageInfo.cellend = (pageInfo.cellarr[0] + (pageInfo.ptype === 2 ? 4 : 0) + vInt[1] + P - 1);
      }
    }
    pageInfo.cellarr.shift();
    return "<span class='bc'>";
  }
  return "";
}
const spanend = "</span>";
function markDumpEnd() {
  if (pageInfo.ptype === 0)
    return "";
  var hdrEnd = (pageInfo.ptype === 2 || pageInfo.ptype === 5) ? 11 : 7;
  if ((pageInfo.curPos - pageInfo.start) === hdrEnd)
    return spanend;
  if ((pageInfo.curPos - pageInfo.start) === (hdrEnd + pageInfo.cellCount * 2))
    return spanend;
  if (pageInfo.nxtFB > 0 && pageInfo.curPos === (pageInfo.start + pageInfo.nxtFB + 4)) {
    pageInfo.nxtFB = twoBytesToInt(pageInfo.uint8arr, pageInfo.start + pageInfo.nxtFB + 2);
    return spanend;
  }
  if (pageInfo.cellend > 0 && pageInfo.curPos === pageInfo.cellend) {
    pageInfo.cellend = 0;
    return spanend;
  }
  return "";
}

function getByteHTML(arr, i, mode) {
  var html = "";
  var d = arr[i];
  if (mode === "hex")
    html += hexFromByte(d) + " ";
  else if (mode === "dec") {
    html += (d > 99 ? "" : (d > 9 ? " " : "  "));
    html += d;
    html += " ";
  } else if (mode === "txt") {
    if (d >= 32 && d <= 126)
        html += String.fromCharCode(d);
    else
        html += ".";
  }
  return html;
}

function getViewHTML(arr, start, ptype, mode) {
  pageInfo.uint8arr = arr;
  pageInfo.start = start; pageInfo.ptype = ptype;
  pageInfo.atype = 'h';
  pageInfo.cellarr = null;
  pageInfo.cellend = 0;
  pageInfo.cellCount = twoBytesToInt(arr, start + 3);
  pageInfo.nxtFB = pageInfo.firstFreeBlockStart;
  pageInfo.firstFreeBlockStart = twoBytesToInt(arr, start + 1);
  var html = ""
  var lineArray = []
  for (var i = 0; i < arr.length; i++) {
    if (i > 0 && i % 16 === 0) {
      lineArray.push(html);
      lineArray.push(<br/>)
      html = ""
    }
      //pageInfo.curPos = i;
    //var st = markDumpStart();
    //html += st;
    html += getByteHTML(arr, i, mode);
    //var end = markDumpEnd();
    //html += end;
  }
  if (html !== "")
    lineArray.push(html);
  return <span>{lineArray}</span>;
}

class BytesDisplay extends PureComponent {
  render() {
    var st = this.props.parentState;
    return getViewHTML(st.pageContent, st.start, st.ptype, this.props.mode)
  }
}

export default ByteView;
