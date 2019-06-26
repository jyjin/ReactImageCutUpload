import React from 'react'
import WithCutImageUpload from './WithCutImageUpload';

export default class extends React.Component {
  render() {
    return (
      <div style={{
        margin: '2% auto',
        padding: '20px 20px 20px ',
        boxShadow: '0px 10px 5px 5px #000',
        minHeight: 500,
        background: 'white',
        maxWidth: 'max-content',
        borderRadius: 3
      }}>
        <WithCutImageUpload
          config={{
            // tick: 0.2,
            // uploadbtnWidth: 800,
            // uploadbtnAspector: 4 / 1,
            // previewAspector: 3 / 1,
          }}
        />
      </div>
    )
  }
}