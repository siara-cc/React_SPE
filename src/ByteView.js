import React, { Component } from 'react';
import './w3.css';
import './ByteView.css';

class ByteView extends Component {
  render() {
    return (
      <div style={{height:'35%', maxHeight:'35%', width:'100%'}}>
        <div className="w3-row" style={{height:'100%', width:'100%'}}>
          <div className="w3-col m3 w3-container container"
                 style={{minWidth:'37%', padding: '5px'}}>
            <div className="watermark">Hex view</div>
            <div className="hexArea" id="hexArea1" onScroll={() => { alert('syncScroll'); }}></div>
          </div>
          <div className="w3-col m4 w3-container container"
                 style={{minWidth:'44%', padding: '5px'}}>
            <div className="watermark">Decimal view</div>
            <div className="hexArea" id="hexArea2" onScroll={() => { alert('syncScroll'); }}></div>
          </div>
          <div className="w3-col m2 w3-container container"
                 style={{minWidth:'19%', padding: '5px'}}>
            <div className="watermark">Text view</div>
            <div className="hexArea" id="hexArea3" onScroll={() => { alert('syncScroll'); }}></div>
          </div>
        </div>
      </div>
    );
  }
}

export default ByteView;
