import React, { Component } from 'react';
import './w3.css';
import './Outline.css';

class Outline extends Component {
  render() {
    return (
        <div className="w3-row outln">
            <div className="w3-col m2 w3-container container"
                   style={{minWidth:'35%', padding: '5px'}}>
              <div className="watermark">Page outline</div>
              <ul className="outlineArea" id="mainOutline"></ul>
            </div>
            <div className="w3-col m2 w3-container container"
                   style={{minWidth:'65%', padding: '5px'}}>
              <div className="watermark">Page contents</div>
              <div className="detailArea" id="detailArea"></div>
            </div>
        </div>
    );
  }
}

export default Outline;
