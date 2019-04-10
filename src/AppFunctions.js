import $ from 'jquery';
import cr_fs from 'cr_addon_file';
import cr_basic from 'cr_addon_basic';

var myBinaryFileFD = 0;
var pageSize, usableSize, maxLocal, minLocal, maxLeaf, minLeaf;
var pageInfo = {uint8arr: null, start: 0, ptype: 0, curPos: 0, cellarr: null, cellend: 0,
                  atype: 'h', firstFreeBlockStart: 0, cellCount: 0, nxtFB: 0};
var txtEncoding = "utf-8";

export function fourBytesToInt(arr, pos) {
  return (arr[pos] << 24) + (arr[pos + 1] << 16) + (arr[pos + 2] << 8) + arr[pos + 3];
}

export function twoBytesToInt(arr, pos) {
  return (arr[pos] << 8) + arr[pos + 1];
}

export function bytesToInt(b1, b2) {
  return (b1 << 8) + b2;
}

export function getIntValue(arr, pos, sz) {
  var ret = 0;
  for (var i = 0; i < sz; i++) {
    ret <<= 8;
    ret += arr[pos + i];
  }
  return ret;
}

export function getFloatValue(arr, pos) {
  var buffer = new ArrayBuffer(8);
  var dv = new DataView(buffer);
  for (var i = 0; i < 8; i++) {
    dv.setUint8(i, arr[pos + i]);
  }
  return dv.getFloat64(0, false);
}

export function getVarInt(arr, pos) {
  var ret = [0, 0];
  while (ret[1]++ < 8) {
    ret[0] <<= 7;
    var b = arr[pos];
    ret[0] += b & 0x7F;
    if ((b >> 7) === 0)
        return ret;
    pos++;
  }
  ret[1]++;
  ret[0] <<= 8;
  ret[0] += arr[pos];
  return ret;
}

export function getHexFromNibble(nibble) {
  if (nibble < 10)
      return String.fromCharCode(48 + nibble);
  else
      return String.fromCharCode(97 + nibble - 10);
}

export function hexFromByte(b) {
  return getHexFromNibble(b >> 4) + getHexFromNibble(b & 0x0F);
}

export function toHexString(buf) {
  var s = "";
  for (var i = 0; i < buf.length; i++) {
    if (i !== 0)
      s += " ";
    s += hexFromByte(buf[i]);
  }
  return s;
}

export function markDumpStart() {
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
      var X = (pageInfo.ptype === 13 ? maxLeaf : maxLocal);
      var P = vInt[0];
      if (P > X) {
        var M = minLeaf;
        var K = M + (P - M) % (usableSize - 4);
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
export function markDumpEnd() {
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

export function showHex(arr, start, ptype) {
  pageInfo.uint8arr = arr;
  pageInfo.start = start; pageInfo.ptype = ptype;
  pageInfo.atype = 'h';
  pageInfo.cellarr = null;
  pageInfo.cellend = 0;
  pageInfo.cellCount = twoBytesToInt(arr, start + 3);
  pageInfo.nxtFB = pageInfo.firstFreeBlockStart;
  pageInfo.firstFreeBlockStart = twoBytesToInt(arr, start + 1);
  var hex = "";
  var dec = "";
  var txt = "";
  for (var i = 0; i < arr.length; i++) {
    if (i > 0 && i % 16 === 0) {
      hex += brk;
      dec += brk;
      txt += brk;
    }
    pageInfo.curPos = i;
    var st = markDumpStart();
    hex += st; dec += st; txt += st;
    hex += hexFromByte(arr[i]) + " ";
    var d = arr[i];
    dec += (d > 99 ? "" : (d > 9 ? " " : "  "));
    dec += d;
    dec += " ";
    if (d >= 32 && d <= 126)
        txt += String.fromCharCode(d);
    else
        txt += ".";
    var end = markDumpEnd();
    hex += end; dec += end; txt += end;
  }
  $('#hexArea1').empty().append(hex);
  $('#hexArea2').empty().append(dec);
  $('#hexArea3').empty().append(txt);
}

export function readPage(pageNo, len) {
  if (!myBinaryFileFD) {
    alert("File not open");
    return;
  }
  var buffer = cr_fs.read(myBinaryFileFD, 0, len, (pageNo - 1) * pageSize);
  if (buffer.length < len) {
    alert("Unable to read page from file. Read " + buffer.length + " bytes.");
    return null;
  }
  return buffer;
}

export function openPage(parentPageId, pageNo, typ, isRoot) {
  if (!myBinaryFileFD) {
    alert("File not open");
    return;
  }
  var typName = (typ === 'b' ? "BTree" : (typ === 'l' ? "LockByte" 
      : (typ === 'ft' ? "FreeTrunk" : (typ === 'fl' ? "FreeLeaf" 
      : (typ === 'o' ? "Overflow" : (typ === 'u' ? "" : "PtrMap"))))));
  try {
    var typDesc = typName;
    if (typ === 'ft' || typ === 'fl' || typ === 'u')
       typDesc = "Page";
    if (typ === 'b') {
      var buffer = readPage(pageNo, 1);
      if (buffer != null) {
        var ptype = buffer[0];
        if (typ === 'b')
          typDesc = (ptype === 2 ? "interior index" : (ptype === 5 ? "interior table" : (ptype === 10 ? "leaf index" : "leaf table")));
      }
    }
    if (parentPageId === '') {
      var pId = typ + pageNo;
      if (document.getElementById(pId) === null) {
        $('#mainOutline').append('<li id="' + pId 
          + '" onclick="show' + typName + 'Page(this, event, 0)">' + typName + ' ' + typDesc + ' ' + pageNo 
          + '<input type="hidden" value="' + pageNo + '"/><ul></ul></li>');
      } else
        alert("Already open");
    } else {
      var pageId = (isRoot ? "p" + parentPageId.substring(1) : parentPageId) + '_' + typ + pageNo;
      if (document.getElementById(pageId) === null) {
        $('#' + parentPageId).children("ul").append('<li id="' + pageId
          + '" onclick="show' + typName + 'Page(this, event, 0)">' + typName  + ' ' + typDesc + ' ' + pageNo 
          + '<input type="hidden" value="' + pageNo + '"/><ul></ul></li>');
      } else
        alert("Already open");
    }
  } catch (err) {
      alert(err);
      window.close();
  }
}

export function showHeader(obj) {
  var arr = readPage(1, 100);
  if (arr === null)
      return;
  showHex(arr, 100, 13);
}

export function formColDataHtml(arr, cellPtr, pageId) {
  var hdr = "";
  var det = "";
  var hdrInfo = getVarInt(arr, cellPtr);
  var hdrLen = hdrInfo[0] - hdrInfo[1];
  var dataPtr = cellPtr + hdrInfo[0];
  cellPtr += hdrInfo[1];
  var colIdx = 0;
  for (var i = 0; i < hdrLen; ) {
    det += "<td>";
    var colInfo = getVarInt(arr, cellPtr);
    switch (colInfo[0]) {
      case 0:
      case 8:
      case 9:
        hdr += "<td>-</td>";
        det += (colInfo[0] === 0 ? "null" : (colInfo[0] === 8 ? "0" : "1"));
        break;
      case 1:
      case 2:
      case 3:
      case 4:
        hdr += "<td>i" + (8 * colInfo[0]) + "</td>";
        det += getIntValue(arr, dataPtr, colInfo[0]);
        dataPtr += colInfo[0];
        break;
      case 5:
      case 6:
        hdr += "<td>i" + (colInfo[0] === 5 ? "48" : "64") + "</td>";
        det += getIntValue(arr, dataPtr, colInfo[0] === 5 ? 6 : 8);
        dataPtr += (colInfo[0] === 5 ? 6 : 8);
        break;
      case 7:
        hdr += "<td>f64</td>";
        det += getFloatValue(arr, dataPtr).toPrecision();
        dataPtr += 8;
        break;
      case 10:
      case 11:
        hdr += "?";
        det += "?";
        break;
      default:
        var dataLen = colInfo[0] - (colInfo[0] % 2 ? 12 : 13);
        dataLen /= 2;
        dataLen = Math.floor(dataLen);
        if (colInfo[0] % 2) {
          hdr += "<td>text</td>";
          var dec = new TextDecoder(txtEncoding);
          det += dec.decode(arr.slice(dataPtr, dataPtr + dataLen));
        } else {
          hdr += "<td>blob</td>";
          det += toHexString(arr.slice(dataPtr, dataLen));
        }
        dataPtr += dataLen;
    }
    if (pageId.substr(0, 2) === 'r0' && colIdx === 3) {
      var pageNo = det.substring(det.lastIndexOf("<td>") + 4);
      det += "<input type='button' value='Open'"
              + " onclick='openPage(\"" + pageId + "\"," + pageNo + ", \"b\", true)'/>";
    }
    det += "</td>";
    i += colInfo[1];
    cellPtr += colInfo[1];
    colIdx++;
  }
  return [hdr, det];
}

export function showBTreePage(obj, evt, start) {
  var pageNo = parseInt(obj.children.item(0).value);
  var arr = readPage(pageNo, pageSize);
  if (arr === null)
    return;
  var ptype, ptypestr;
  ptype = arr[start];
  showHex(arr, start, ptype);
  ptypestr = (ptype === 2 ? "Interior index" : (ptype === 5 ? "Interior table" : (ptype === 10 ? "Leaf index" : ptype === 13 ? "Leaf table" : "Invalid")));
  var det = "Page type : <b>" + ptypestr + "</b> (2-interior index, 5-interior table, 10-leaf index, 13-leaf table)";
  det += "<br>First freeblock on the page: <b>" + twoBytesToInt(arr, start + 1) + "</b>";
  var cellCount = twoBytesToInt(arr, start + 3);
  det += "<br>Number of cells on page: <b>" + cellCount + "</b>";
  det += "<br>Start of cell content area: <b>" + twoBytesToInt(arr, start + 5) + "</b>";
  det += "<br>Number of fragmented free bytes: <b>" + arr[start + 7] + "</b>";
  var pageId = obj.id;
  var hdrSize = 8;
  if (ptype === 2 || ptype === 5) {
    var rightPtr = fourBytesToInt(arr, start + 8);
    det += "<br>Right most pointer: <b>" + rightPtr + "</b>&nbsp;<input type='button' value='Open' onclick='openPage(\"" + pageId + "\"," + rightPtr + ", \"b\", false)'/>";
    hdrSize = 12;
  }
  det += "<br><br><b>Cells:</b><br/>";
  det += "<table cellspacing='1' cellpadding='1' border='1'>";
  det += "<thead><td>Page</td><td>Row ID</td><td>Len</td><td>Payload</td><td>Overflow</td></thead>";
  for (var cell = 0; cell < cellCount; cell++) {
    var cellPtr = twoBytesToInt(arr, cell * 2 + hdrSize + start);
    det += "<tr>";
    if (ptype === 2 || ptype === 5) {
      var pNo = fourBytesToInt(arr, cellPtr);
      det += "<td><input type='button' value='Page " + pNo + "' onclick='openPage(\"" + pageId + "\"," 
              + pNo + ", \"b\", false)'/></td>";
      cellPtr += 4;
    }
    var vInt = getVarInt(arr, cellPtr);
    cellPtr += vInt[1];
    switch (ptype) {
      case 2:
        det += "<td>-</td><td>" + vInt[0] + "</td>";
        break;
      case 5:
        det += "<td>" + vInt[0] + "</td><td>-</td><td>-</td><td>-</td>";
        break;
      case 10:
        det += "<td>-</td><td>-</td><td>" + vInt[0] + "</td>";
        break;
      case 13:
        var vInt1 = getVarInt(arr, cellPtr);
        det += "<td>-</td><td>" + vInt1[0] + "</td>";
        det += "<td>" + vInt[0] + "</td>";
        cellPtr += vInt1[1];
        break;
      default:
    }
    if (ptype === 2 || ptype === 10 || ptype === 13) {
      var X = (pageInfo.ptype === 13 ? maxLeaf : maxLocal);
      var P = vInt[0];
      pageNo = 0;
      var oarr;
      if (P > X) {
          var M = minLeaf;
          var ovflwMaxPageBytes = (usableSize - 4);
          var K = M + (P - M) % ovflwMaxPageBytes;
          var surplus = P - (K > X ? M : K);
          var dataEnd = cellPtr + P - surplus;
          pageNo = fourBytesToInt(arr, dataEnd);
          oarr = new Uint16Array(P);
          for (var k = cellPtr; k < dataEnd; k++)
            oarr[k - cellPtr] = arr[k];
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
      var hdrDtl = formColDataHtml((P > X ? oarr : arr), (P > X ? 0 : cellPtr), pageId);
      var hdr = hdrDtl[0];
      det += hdrDtl[1];
      var toFind = "<td>Payload</td>";
      var idx = det.indexOf(toFind);
      if (idx !== -1)
        det = det.substring(0, idx) + hdr + det.substring(idx + toFind.length);
      if (pageNo) {
          det += "<td><input type='button' value='Page " + pageNo + "' onclick='openPage(\"" + pageId + "\"," 
                  + pageNo + ", \"o\", false)'/></td>";
      } else
          det += "<td>-</td>";
    }
    det += "</tr>";
  }
  det += "</table>";
  $('#detailArea').empty().append(det);
  evt.stopPropagation();
}

export function showPage(obj, evt, start) {
  var pageNo = parseInt(obj.children.item(0).value);
  var arr = readPage(pageNo, pageSize);
  if (arr === null)
    return;
  showHex(arr, start, 0);
  $('#detailArea').empty();
  evt.stopPropagation();
  return arr;
}

export function showPage1(obj, evt) {
  showBTreePage(obj, evt, 100);
}

export function fileSelected(fileName) {
  if (fileName === undefined) {
    alert("No file selected");
  } else {
    if (myBinaryFileFD !== 0) {
        cr_fs.close(myBinaryFileFD);
        myBinaryFileFD = 0;
    }
    $('#dbName').empty().append(fileName);
    myBinaryFileFD = cr_fs.open(fileName, 'r');
    var buffer = cr_fs.read(myBinaryFileFD, 0, 100, 0);
    if (buffer[0] !== 83 || buffer[1] !== 81 || buffer[2] !== 76 || buffer[3] !== 105
           || buffer[4] !== 116 || buffer[5] !== 101 || buffer[6] !== 32 || buffer[7] !== 102
           || buffer[8] !== 111 || buffer[9] !== 114 || buffer[10] !== 109 || buffer[11] !== 97
           || buffer[12] !== 116 || buffer[13] !== 32 || buffer[14] !== 51 || buffer[15] !== 0) {
      cr_basic.lingeringMessage("Selected file is not SQLite database");
      return;
    }
    $('#mainOutline').empty().append('<li onclick="showHeader(this)">Header</li>');
    $('#detailArea').empty();
    $('#hexArea1').empty();
    $('#hexArea2').empty();
    $('#hexArea3').empty();
    pageSize = bytesToInt(buffer[16], buffer[17]);
    if (pageSize === 1)
      pageSize = 65536;
    usableSize = pageSize - buffer[20];
    maxLocal = Math.floor((usableSize - 12) * 64 / 255 - 23);
    minLocal = Math.floor((usableSize - 12) * 32 / 255 - 23);
    maxLeaf = Math.floor(usableSize - 35);
    minLeaf = Math.floor((usableSize - 12) * 32 / 255 - 23);
    buffer = cr_fs.read(myBinaryFileFD, 0, pageSize, 0);
    $('#mainOutline').append('<li id="r0" onclick="showPage1(this, event)">Root page<input type="hidden" value="1"/><ul></ul></li>');
    cr_basic.lingeringMessage("DB Loaded. Double click on Header or Pages to show details");
    $('.watermark').empty();
  }
}

export function selectFile() {
  try {
    var filesDir = cr_fs.getFolderPath("db");
    cr_fs.selectFileForRead(filesDir).then(function(params) {
      if (params["action"] === "selected")
        fileSelected(params["selectedFile"])
    });
  } catch (err) {
    cr_basic.lingeringMessage(err);
  }
}

export function showPageType(obj, evt, start) {
  return null;
}