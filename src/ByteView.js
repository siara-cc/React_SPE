import React, { Component } from 'react';
import { twoBytesToInt } from './AppFunctions'
import { getVarInt } from './AppFunctions'
import { hexFromByte } from './AppFunctions'
import './w3.css';
import './ByteView.css';

class ByteView extends Component {
  syncScroll = (event) => {
    var other1 = document.getElementById(event.target.id === "hexArea1" ? "hexArea2" : "hexArea1");
    var other2 = document.getElementById(event.target.id === "hexArea3" ? "hexArea2" : "hexArea3");
    other1.scrollTop = event.target.scrollTop;
    other2.scrollTop = event.target.scrollTop;
  }  
  render() {
    return (
      <div style={{height:'35%', maxHeight:'35%', width:'100%'}}>
        <div className="w3-row" style={{height:'100%', width:'100%'}}>
          <div className="w3-col m3 w3-container container"
                 style={{minWidth:'37%', padding: '5px'}}>
            <div className="watermark">Hex view</div>
            <div className="hexArea" id="hexArea1" onScroll={this.syncScroll}>
              <BytesDisplay mode="hex"/>
            </div>
          </div>
          <div className="w3-col m4 w3-container container"
                 style={{minWidth:'44%', padding: '5px'}}>
            <div className="watermark">Decimal view</div>
            <div className="hexArea" id="hexArea2" onScroll={this.syncScroll}>
              <BytesDisplay mode="dec"/>
            </div>
          </div>
          <div className="w3-col m2 w3-container container"
                 style={{minWidth:'19%', padding: '5px'}}>
            <div className="watermark">Text view</div>
            <div className="hexArea" id="hexArea3" onScroll={this.syncScroll}>
              <BytesDisplay mode="txt"/>
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
const brk = "<br>";
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
  for (var i = 0; i < arr.length; i++) {
    if (i > 0 && i % 16 === 0) {
      html += brk;
    }
    pageInfo.curPos = i;
    var st = markDumpStart();
    html += st;
    if (mode === "hex")
      html += hexFromByte(arr[i]) + " ";
    else if (mode === "dec") {
      var d = arr[i];
      html += (d > 99 ? "" : (d > 9 ? " " : "  "));
      html += d;
      html += " ";
    } else if (mode === "txt") {
      if (d >= 32 && d <= 126)
          html += String.fromCharCode(d);
      else
          html += ".";
    }
    var end = markDumpEnd();
    html += end;
  }
  return "<span>" + html + "</span>";
}

class BytesDisplay extends Component {
  render() {
    return getViewHTML(this.props.pageContent, this.props.start, this.props.ptype, this.props.mode)
  }
}

export default ByteView;
