import React, { useState, Component } from 'react';
import styles from './index.less';

class ChangeButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      btnTxt: 'Login'
    }
  }

  render() {
    const { btnTxt } = this.state;
    return (
      <div className={styles.buttonContainer} onClick={() => { this.setState({ btnTxt: btnTxt === 'Login' ? 'Logout' : 'Login' }) }}>
        <span>{btnTxt}</span>
      </div>
    )
  }
}

export default ChangeButton;