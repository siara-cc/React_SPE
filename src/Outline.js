import React, { PureComponent } from 'react';
import './w3.css';
import './Outline.css';
import { readPage, openPage } from './AppFunctions.js';
import { getVarInt } from './AppFunctions.js';
import { toHexString } from './AppFunctions.js';
import { getIntValue } from './AppFunctions.js';
import { getFloatValue } from './AppFunctions.js';
import { twoBytesToInt } from './AppFunctions.js';
import { fourBytesToInt } from './AppFunctions.js';
import cr_res from 'cr_addon_resources';

class Outline extends PureComponent {
  render() {
    return (
        <div className="w3-row outln">
            <div className="w3-col m2 w3-container container"
                   id="mainOutline" style={{minWidth:'35%', padding: '5px'}}>
              <div className="watermark">{cr_res.getString("page_outline")}</div>
              <PageList parentState={this.props.parentState} 
                pageList={this.props.parentState.pageList} 
                setPageContent={this.props.setPageContent} />
            </div>
            <div className="w3-col m2 w3-container container"
                   style={{minWidth:'65%', padding: '5px'}}>
              <div className="watermark">{cr_res.getString("page_contents")}</div>
              <div className="detailArea" id="detailArea">
                <DetailArea parentState={this.props.parentState}
                  addPageItem={this.props.addPageItem} />
              </div>
            </div>
        </div>
    );
  }
}

class PageList extends React.PureComponent {
  render() {
    return (
      <ul class="outlineArea" id="mainOutline">
        {this.props.pageList.map(pageItem => (
          <li id={pageItem.pageId} attrPageNo={pageItem.pageNo}
            attrStart={pageItem.start} attrTypName={pageItem.typName}
            onClick={(event) => { 
              var pc = readPage(this.props.parentState.dbInfo.myBinaryFileFD,
                this.props.parentState.dbInfo.pageSize,
                parseInt(event.target.getAttribute("attrPageNo"), 10),
                this.props.parentState.dbInfo.pageSize);
              this.props.setPageContent(parseInt(event.target.getAttribute("attrStart"), 10),
                event.target.getAttribute("attrTypName"), 
                event.target.id, pc);
              event.preventDefault();}}>
              {pageItem.typName} {pageItem.typDesc}
              <PageList parentState={this.props.parentState} 
                pageList={pageItem.pageList} 
                setPageContent={this.props.setPageContent} />
          </li>
        ))}
      </ul>
    );
  }
}

class DetailArea extends PureComponent {
  render() {
    if (this.props.parentState.typName === "Header")
      return <HeaderDetail parentState={this.props.parentState} 
               addPageItem={this.props.addPageItem}/>
    else if (this.props.parentState.typName === "BTree")
      return <BTreeDetail parentState={this.props.parentState} 
               addPageItem={this.props.addPageItem}/>
      else if (this.props.parentState.typName === "FreeTrunk")
      return <FreeTrunkDetail parentState={this.props.parentState} 
               addPageItem={this.props.addPageItem}/>
      else if (this.props.parentState.typName === "FreeLeaf")
      return <FreeLeafDetail parentState={this.props.parentState} 
               addPageItem={this.props.addPageItem}/>
      else if (this.props.parentState.typName === "Overflow")
      return <OverflowDetail parentState={this.props.parentState} 
               addPageItem={this.props.addPageItem}/>
      return <div>-</div>;
  }
}

class HeaderDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.openFLPage = this.openFLPage.bind(this);
  }
  openFLPage(flPageNo, flType) {
    openPage(this.props.parentState.dbInfo.myBinaryFileFD,
      "", flPageNo, flType, false, this.props.parentState, this.props.addPageItem);
  }
  render() {
    var pageContent = this.props.parentState.pageContent;
    var firstFLTrunk = fourBytesToInt(pageContent, 32);
    var flCount = fourBytesToInt(pageContent, 36);
    var encoding = fourBytesToInt(pageContent, 56);
    var txtEncoding = (encoding === 2 ? "utf-16le" : (encoding === 3 ? "utf-16be" : "utf-8"));
    this.props.parentState.dbInfo.txtEncoding = txtEncoding;
    var button = ""
    if (flCount > 0) {
      button = <input type="button" value={cr_res.getString("Open")}
                 onClick={this.openFLPage.bind(this, firstFLTrunk, (flCount === 1 ? "fl" : "ft"))} />
    }
    return (<div>
      <br/><b><u>{cr_res.getString("file_header")}</u></b><br/>
      <br/>{cr_res.getString("header_str")}<b>{cr_res.getString("sqlite_f3")}</b>
      <br/>{cr_res.getString("page_size")}<b>{this.props.parentState.dbInfo.pageSize}</b>
      <br/>{cr_res.getString("ff_write_ver")}<b>{(pageContent[18] === 1 ? "Legacy" : "WAL")}</b>
      <br/>{cr_res.getString("ff_read_ver")}<b>{(pageContent[19] === 1 ? "Legacy" : "WAL")}</b>
      <br/>{cr_res.getString("unused_res_space")}<b>{pageContent[20]}</b>
      <br/>{cr_res.getString("max_pl_frac")}<b>{pageContent[21]}</b>
      <br/>{cr_res.getString("min_pl_frac")}<b>{pageContent[22]}</b>
      <br/>{cr_res.getString("leaf_pl_frac")}<b>{pageContent[23]}</b>
      <br/>{cr_res.getString("file_chg_ctr")}<b>{fourBytesToInt(pageContent, 24)}</b>
      <br/>{cr_res.getString("db_size_pages")}<b>{fourBytesToInt(pageContent, 28)}</b>
      <br/>{cr_res.getString("page_no_fflt")}<b>{firstFLTrunk}</b>
      {button}
      <br/>{cr_res.getString("fl_count")}<b>{flCount}</b>
      <br/>{cr_res.getString("sch_cookie")}<b>{fourBytesToInt(pageContent, 40)}</b>
      <br/>{cr_res.getString("sch_fmt_num")}<b>{fourBytesToInt(pageContent, 44)}</b>
      <br/>{cr_res.getString("dflt_pg_cache_sz")}<b>{fourBytesToInt(pageContent, 48)}</b>
      <br/>{cr_res.getString("lgst_bt_pg_no")}<b>{fourBytesToInt(pageContent, 52)}</b>
      <br/>{cr_res.getString("db_txt_enc")}<b>{txtEncoding}</b>
      <br/>{cr_res.getString("usr_ver_pgma")}<b>{fourBytesToInt(pageContent, 60)}</b>
      <br/>{cr_res.getString("inc_vac_mode")}<b>{fourBytesToInt(pageContent, 64)}</b>
      <br/>{cr_res.getString("app_id_pgma")}<b>{fourBytesToInt(pageContent, 68)}</b>
      <br/>{cr_res.getString("vv_for_num")}<b>{fourBytesToInt(pageContent, 92)}</b>
      <br/>{cr_res.getString("sqlite_ver_num")}<b>{fourBytesToInt(pageContent, 96)}</b>
      <br/><br/></div>)
  }
}

class FreeTrunkDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.openFreePage = this.openFreePage.bind(this);
  }
  openFreePage(flPageNo, flType) {
    openPage(this.props.parentState.dbInfo.myBinaryFileFD,
      "", flPageNo, flType, false, this.props.parentState, this.props.addPageItem);
  }
  render() {
    var pageContent = this.props.parentState.pageContent;
    var nextTrunk = fourBytesToInt(pageContent, 0);
    var leafCount = fourBytesToInt(pageContent, 4);
    var button = ""
    if (nextTrunk > 0) {
      button = <input type='button' value={cr_res.getString("open")} 
                 onClick={this.openFreePage.bind(this, nextTrunk, "ft")} />
    }
    var leafList = []
    for (var i = 0; i < leafCount; i++) {
      var leafPageNo = fourBytesToInt(pageContent, 8 + i * 4);
      leafList.push(<tr><td>{leafPageNo}</td><td><input type="button"
                 value={cr_res.getString("open")}
                 onClick={this.openFreePage.bind(this, leafPageNo, "fl")} /></td></tr>)
    }
    var leafHTML = ""
    if (leafCount > 0) {
      leafHTML = (<table cellspacing='1' cellpadding='1' border='1'>
                   <tr><td>{cr_res.getString("leaf_pg_no")}</td>
                   <td>{cr_res.getString("open")}</td></tr>
                   {leafList}
                   </table>)
    }
    return (<div><br/><span>{cr_res.getString("next_trnk_pg")}</span><b>{nextTrunk}</b>
              <br/>{cr_res.getString("fl_leaf_count")}<b>{leafCount}</b>
              {button}
              {leafHTML}
            </div>)
  }
}

class FreeLeafDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.openBTPage = this.openBTPage.bind(this);
  }
  openBTPage(pageNo, type) {
    openPage(this.props.parentState.dbInfo.myBinaryFileFD,
      "", pageNo, type, false, this.props.parentState, this.props.addPageItem);
  }
  render() {
    var pageContent = this.props.parentState.pageContent;
    var ptype = pageContent[0];
    if (ptype === 2 || ptype === 5 || ptype === 10 || ptype === 13) {
      var pageNo = 0; // TODO
      return (<input type="button" value={cr_res.getString("show_as_bt_pg")} 
                onClick={this.openBTPage.bind(this, pageNo, "b")} />)
    }
    return ""
  }
}

class OverflowDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.openOFPage = this.openOFPage.bind(this);
  }
  openOFPage(pageNo, type) {
    openPage(this.props.parentState.dbInfo.myBinaryFileFD,
      "", pageNo, type, false, this.props.parentState, this.props.addPageItem);
  }
  render() {
    var pageContent = this.props.parentState.pageContent;
    var nextPageNo = fourBytesToInt(pageContent, 0);
    if (nextPageNo) {
      return (<td><input type='button' value={cr_res.getString("nxt_pg") + " (" + nextPageNo + ")"}
                onClick={this.openOFPage.bind(this, nextPageNo, "o")} /></td>)
    }
    return "Last overflow page"
  }
}

class BTreeDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.formColDataHtml = this.formColDataHtml.bind(this);
    this.openBTPage = this.openBTPage.bind(this);
  }
  openBTPage(pageNo, type, parentPageId) {
    openPage(this.props.parentState.dbInfo.myBinaryFileFD,
      parentPageId, pageNo, type, false, this.props.parentState, this.props.addPageItem);
  }
  formColDataHtml(arr, cellPtr, pageId, dbInfo) {
    var hdr = [];
    var det = [];
    var hdrInfo = getVarInt(arr, cellPtr);
    var hdrLen = hdrInfo[0] - hdrInfo[1];
    var dataPtr = cellPtr + hdrInfo[0];
    cellPtr += hdrInfo[1];
    var colIdx = 0;
    for (var i = 0; i < hdrLen; ) {
      var colInfo = getVarInt(arr, cellPtr);
      var colValue;
      switch (colInfo[0]) {
        case 0:
        case 8:
        case 9:
          hdr.push(<td>-</td>)
          colValue = (colInfo[0] === 0 ? "null" : (colInfo[0] === 8 ? "0" : "1"));
          break;
        case 1:
        case 2:
        case 3:
        case 4:
          hdr.push(<td>i{(8 * colInfo[0])}</td>)
          colValue = getIntValue(arr, dataPtr, colInfo[0])
          dataPtr += colInfo[0];
          break;
        case 5:
        case 6:
          hdr.push(<td>i{(colInfo[0] === 5 ? "48" : "64")}</td>)
          colValue = getIntValue(arr, dataPtr, colInfo[0] === 5 ? 6 : 8)
          dataPtr += (colInfo[0] === 5 ? 6 : 8);
          break;
        case 7:
          hdr.push(<td>f64</td>)
          colValue = getFloatValue(arr, dataPtr).toPrecision()
          dataPtr += 8;
          break;
        case 10:
        case 11:
          hdr.push(<td>?</td>);
          colValue = "?";
          break;
        default:
          var dataLen = colInfo[0] - (colInfo[0] % 2 ? 12 : 13);
          dataLen /= 2;
          dataLen = Math.floor(dataLen);
          if (colInfo[0] % 2) {
            hdr.push(<td>text</td>);
            var dec = new TextDecoder(dbInfo.txtEncoding);
            colValue = dec.decode(arr.slice(dataPtr, dataPtr + dataLen))
          } else {
            hdr.push(<td>blob</td>)
            colValue = toHexString(arr.slice(dataPtr, dataLen))
          }
          dataPtr += dataLen;
      }
      if (pageId.substr(0, 2) === 'r0' && colIdx === 3) {
        det.push(<td>{colValue} <input type="button" value={cr_res.getString("open")}
                  onClick={this.openBTPage.bind(this, colValue, "b", "r0")} /></td>)
      } else
        det.push(<td>{colValue}</td>)
      i += colInfo[1];
      cellPtr += colInfo[1];
      colIdx++;
    }
    return [hdr, det];
  }
  render() {
    var pageNo, ptype, ptypestr;
    var parentState = this.props.parentState;
    var pageContent = parentState.pageContent;
    var dbInfo = parentState.dbInfo;
    ptype = pageContent[parentState.start];
    switch (ptype) {
      case 2:
        ptypestr = cr_res.getString("int_idx");
        break;
     case 5:
        ptypestr = cr_res.getString("int_tbl");
        break;
     case 10:
        ptypestr = cr_res.getString("leaf_idx");
        break;
     case 13:
        ptypestr = cr_res.getString("leaf_tbl");
        break;
     default:
        ptypestr = cr_res.getString("invalid");
        break;
    }
    var cellCount = twoBytesToInt(pageContent, parentState.start + 3);
    var pageId = parentState.pageId;
    var hdrSize = 8;
    var rightPtrHTML = ""
    if (ptype === 2 || ptype === 5) {
      var rightPtr = fourBytesToInt(pageContent, parentState.start + 8);
      rightPtrHTML = <span><br/>{cr_res.getString("right_most_ptr")}<b>{rightPtr}</b>
      <input type='button' value={cr_res.getString("open")} onclick='openPage(\"{pageId}\",{rightPtr}, \"b\", false)'/></span>
      hdrSize = 12;
    }
    var hdr = ""
    var rowArray = []
    for (var cell = 0; cell < cellCount; cell++) {
      var cellPtr = twoBytesToInt(pageContent, cell * 2 + hdrSize + parentState.start);
      var cellContent = []
      if (ptype === 2 || ptype === 5) {
        var pNo = fourBytesToInt(pageContent, cellPtr);
        cellContent.push(<td><input type="button" value={cr_res.getString("page") + pNo} 
          onClick={this.openBTPage.bind(this, pNo, "b", pageId)} /></td>)
        cellPtr += 4;
      }
      var vInt = getVarInt(pageContent, cellPtr);
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
          var vInt1 = getVarInt(pageContent, cellPtr);
          cellContent.push(<td>-</td>)
          cellContent.push(<td>{vInt1[0]}</td>)
          cellContent.push(<td>{vInt[0]}</td>)
          cellPtr += vInt1[1];
          break;
        default:
      }
      if (ptype === 2 || ptype === 10 || ptype === 13) {
        var X = (ptype === 13 ? dbInfo.maxLeaf : dbInfo.maxLocal);
        var P = vInt[0];
        pageNo = 0;
        var oarr;
        if (P > X) {
            var M = dbInfo.minLeaf;
            var ovflwMaxPageBytes = (dbInfo.usableSize - 4);
            var K = M + (P - M) % ovflwMaxPageBytes;
            var surplus = P - (K > X ? M : K);
            var dataEnd = cellPtr + P - surplus;
            pageNo = fourBytesToInt(pageContent, dataEnd);
            oarr = new Uint16Array(P);
            for (var k = cellPtr; k < dataEnd; k++)
              oarr[k - cellPtr] = pageContent[k];
            var oPageNo = pageNo;
            while (surplus > 0) {
              var toRead = (surplus > ovflwMaxPageBytes ? ovflwMaxPageBytes : surplus) + 4;
              var obuf = readPage(dbInfo.myBinaryFileFD, dbInfo.pageSize, oPageNo, toRead);
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
        var hdrDtl = this.formColDataHtml((P > X ? oarr : pageContent), (P > X ? 0 : cellPtr), pageId, dbInfo);
        hdr = hdrDtl[0];
        cellContent.push(hdrDtl[1]);
        if (pageNo) {
          cellContent.push(<td><input type="button" value={cr_res.getString("page") + pageNo} 
                             onClick={this.openBTPage.bind(this, pageNo, "o", pageId)} /></td>)
        } else
          cellContent.push(<td>-</td>)
      }
      rowArray.push(<tr>{cellContent}</tr>)
    }
    return (<div>{cr_res.getString("page_type")}<b>{ptypestr}</b> {cr_res.getString("ptype_desc")}
              <br/>{cr_res.getString("first_fb")}<b>{twoBytesToInt(pageContent, parentState.start + 1)}</b>
              <br/>{cr_res.getString("num_cells")}<b>{cellCount}</b>
              <br/>{cr_res.getString("cntnt_area_start")}<b>{twoBytesToInt(pageContent, parentState.start + 5)}</b>
              <br/>{cr_res.getString("frag_free_count")}<b>{pageContent[parentState.start + 7]}</b>
              {rightPtrHTML}
              <br/><br/><b>{cr_res.getString("cells")}</b><br/>
              <table cellspacing='1' cellpadding='1' border='1'>
              <thead><td>{cr_res.getString("page")}</td>
              <td>{cr_res.getString("row_id")}</td>
              <td>{cr_res.getString("len")}</td>
              {hdr}<td>{cr_res.getString("ovfl")}</td></thead>
              {rowArray}
              </table></div>)
  }
}

export default Outline;
