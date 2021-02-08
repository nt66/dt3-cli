import React from 'react';
import ReactDOM from 'react-dom';
import { Radar } from '../src';
import mock from './data/mock';

const { radarData } = mock;
const trendIssueOpt = {
  width: 385,
  height: 303,
};

const App = () => {
  return (
    <div>
      <Radar data={radarData} opts={trendIssueOpt} />
    </div>
  )
}

//要实现局部热更新，必须要添加此句
if (module.hot) 
  module.hot.accept()

ReactDOM.render(<App />, document.getElementById('root'));