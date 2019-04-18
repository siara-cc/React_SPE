import $ from 'jquery';
import cr_fs from 'cr_addon_file';
import cr_basic from 'cr_addon_basic';

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

export function readPage(myBinaryFileFD, pageSize, pageNo, len) {
  if (!myBinaryFileFD) {
    cr_basic.lingeringMessage("File not open");
    return;
  }
  var buffer = cr_fs.read(myBinaryFileFD, 0, len, (pageNo - 1) * pageSize);
  if (buffer.length < len) {
    cr_basic.lingeringMessage("Unable to read page from file. Read " + buffer.length + " bytes.");
    return null;
  }
  return buffer;
}

export function openPage(myBinaryFileFD, parentPageId, pageNo, typ, isRoot, 
                           parentState, updateState) {
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
        var pageItem = { pageId: pId, typName: typName, typDesc: typDesc, pageNo: pageNo, start: 0, pageList: [] }
        //$('#mainOutline').append('<li id="' + pId 
        //  + '" onclick="show' + typName + 'Page(this, event, 0)">' + typName + ' ' + typDesc + ' ' + pageNo 
        //  + '<input type="hidden" value="' + pageNo + '"/><ul></ul></li>');
      } else
        cr_basic.lingeringMessage("Already open");
    } else {
      var pageId = (isRoot ? "p" + parentPageId.substring(1) : parentPageId) + '_' + typ + pageNo;
      if (document.getElementById(pageId) === null) {
        $('#' + parentPageId).children("ul").append('<li id="' + pageId
          + '" onclick="show' + typName + 'Page(this, event, 0)">' + typName  + ' ' + typDesc + ' ' + pageNo 
          + '<input type="hidden" value="' + pageNo + '"/><ul></ul></li>');
      } else
        cr_basic.lingeringMessage("Already open");
    }
  } catch (err) {
    cr_basic.lingeringMessage(err);
      window.close();
  }
}

export function fileSelected(fileName, state, setStateOnOpen) {
  if (fileName === undefined) {
    alert("No file selected");
  } else {
    if (state.dbInfo.myBinaryFileFD !== 0) {
        cr_fs.close(state.dbInfo.myBinaryFileFD);
        state.dbInfo.myBinaryFileFD = 0;
    }
    var newState = {}
    newState.dbInfo = {}
    $('#dbName').empty().append(fileName);
    newState.dbInfo.myBinaryFileFD = cr_fs.open(fileName, 'r');
    var buffer = cr_fs.read(newState.dbInfo.myBinaryFileFD, 0, 100, 0);
    if (buffer[0] !== 83 || buffer[1] !== 81 || buffer[2] !== 76 || buffer[3] !== 105
           || buffer[4] !== 116 || buffer[5] !== 101 || buffer[6] !== 32 || buffer[7] !== 102
           || buffer[8] !== 111 || buffer[9] !== 114 || buffer[10] !== 109 || buffer[11] !== 97
           || buffer[12] !== 116 || buffer[13] !== 32 || buffer[14] !== 51 || buffer[15] !== 0) {
      cr_basic.lingeringMessage("Selected file is not SQLite database");
      return;
    }
    //$('#detailArea').empty();
    //$('#hexArea1').empty();
    //$('#hexArea2').empty();
    //$('#hexArea3').empty();
    $('.watermark').empty();
    newState.pageId = "r0";
    newState.typName = "Header";
    newState.start = 0;
    newState.pageList = [];
    newState.pageCount = 2;
    newState.pageList[0] = { pageId: 'r0', typName: 'Header', typDesc: 'Header', pageNo: 1, start: 0, pageList: [] }
    newState.dbInfo.pageSize = bytesToInt(buffer[16], buffer[17]);
    if (newState.dbInfo.pageSize === 1)
      newState.dbInfo.pageSize = 65536;
    newState.dbInfo.usableSize = newState.dbInfo.pageSize - buffer[20];
    newState.dbInfo.maxLocal = Math.floor((newState.dbInfo.usableSize - 12) * 64 / 255 - 23);
    newState.dbInfo.minLocal = Math.floor((newState.dbInfo.usableSize - 12) * 32 / 255 - 23);
    newState.dbInfo.maxLeaf = Math.floor(newState.dbInfo.usableSize - 35);
    newState.dbInfo.minLeaf = Math.floor((newState.dbInfo.usableSize - 12) * 32 / 255 - 23);
    buffer = cr_fs.read(newState.dbInfo.myBinaryFileFD, 0, newState.dbInfo.pageSize, 0);
    newState.pageList[1] = { pageId: 'r1', typName: 'BTree', typDesc: 'Page 1', pageNo: 1, start: 100, pageList: [] }
    cr_basic.lingeringMessage("DB Loaded. Double click on Header or Pages to show details");
    setStateOnOpen(newState);
  }
}

export function selectFile(state, setStateOnOpen) {
  try {
    var filesDir = cr_fs.getFolderPath("db");
    cr_fs.selectFileForRead(filesDir).then(function(params) {
      if (params["action"] === "selected")
        fileSelected(params["selectedFile"], state, setStateOnOpen)
    });
  } catch (err) {
    cr_basic.lingeringMessage(err);
  }
}
