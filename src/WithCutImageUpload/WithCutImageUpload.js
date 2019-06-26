/**
 * WithCutImageUpload.js
 * 
 * 功能
 *    React 图片裁剪 （结合WithLanguage 可自备多语言）
 * 
 * 参数及默认值
 *    config: {
 *        uploadbtnWidth: 660,          // 上传背景框宽度
 *        uploadbtnAspector: 4 / 2,     // 上传背景框宽高比 宽：高
 *        previewAspector: 3 / 1,       // 预览背景框：上传背景框
 *        tick: 0.1,                    // 缩放倍数
 *        distance: 10,                 // 移动单位 
 *        fileMaxSize: 1,               // 图片大小限制 M
 *        title: '上传图片',             // 标题
 *        actionUrl: '',                // 上传地址
 *        accept: 'jpeg',               // 图片类型
 *        onComplete: (res)=>{}         // 结果回调函数
 *    }  
 * 
 * create byjyjin
 *    at 2019.6.14
 */
import React, { PureComponent } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import "./index.scss";

const config = {
  tick: 0.1,
  uploadbtnWidth: 660,
  uploadbtnAspector: 4 / 2,
  previewAspector: 3 / 1,
  distance: 10,
}

class WithCutImageUpload extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      top: 0,
      left: 0,
      src: null,
      ext: 'jpeg',
      crop: {
        unit: "px",
        width: 100,
        aspect: 16 / 9
      },
      config: Object.assign({}, config, this.props.config)
    };
  }


  onClickFile = e => {
    this.refs.cutImageUploadFile.click()
  }

  onreset = () => {
    const { crop, _width, _height } = this.state
    this.setState({
      top: 0,
      left: 0,
      width: _width,
      height: _height,
    }, () => {
      this.onCropComplete(crop)
    })
  }

  scaleImage = (isScaleToBig) => {
    let { width, height, crop, _width, _height } = this.state
    const { tick, } = this.state.config
    if (isScaleToBig) {
      width *= (1 + tick)
      height *= (1 + tick)
    } else {

      const { uploadbtn } = this.cauSize()
      let w = width || _width
      let h = height || _height
      if (w < uploadbtn.width) {
        // 宽度小于背景 不允许缩放
      } else if (h < uploadbtn.height) {
        // 高度小于背景 不允许缩放
      } else {
        width *= (1 - tick)
        height *= (1 - tick)
      }
    }

    this.setState({
      width,
      height
    }, () => {
      this.onCropComplete(crop)
    })
  }

  moveImage = (dr) => {
    let { top, left, config, crop, width, height } = this.state
    const { distance } = config

    if (dr === 'l') {
      left -= distance
    } else if (dr === 'r') {
      left += distance
    } else if (dr === 't') {
      top -= distance
    } else if (dr === 'b') {
      top += distance
    }

    // 边界禁止
    if (crop.x < left) {
      left = crop.x
    }
    if (crop.y < top) {
      top = crop.y
    }
    if (crop.x + crop.width > left + width) {
      left = crop.x + crop.width - width
    }
    if (crop.y + crop.height > top + height) {
      top = crop.y + crop.height - height
    }
    this.setState({ top, left }, () => this.onCropComplete(crop))
  }

  onSelectFile = e => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      const ext = e.target.files[0].name.split('.')[e.target.files[0].name.split('.').length - 1]
      reader.addEventListener("load", () => {
        debugger
        this.setState({
          src: reader.result,
          ext,
          // 为了重新读取宽高
          top: 0,
          left: 0,
          width: null,
          height: null
        })
      }

      );
      reader.readAsDataURL(e.target.files[0]);
    }
    // // 为了重新读取宽高
    // this.setState({
    //   width: null,
    //   height: null
    // })
  };

  // If you setState the crop in here you should return false.
  onImageLoaded = image => {

    this.imageRef = image;

    let { width, height } = image
    debugger

    const { uploadbtnWidth, uploadbtnAspector, previewAspector } = this.state.config
    const { uploadbtn, preview } = this.cauSize()
    const imageAspector = width / height

    // 超出宽高时 等比缩放到背景宽高
    if (imageAspector > uploadbtnAspector) {
      if (width > uploadbtn.width) {
        width = uploadbtn.width
        height = width / imageAspector
      }
    } else {
      if (height > uploadbtn.height) {
        height = uploadbtn.height
        width = height * imageAspector
      }
    }


    this.setState({
      width: image.width,
      height: image.height,
      _width: image.width,
      _height: image.height
    })
  };

  onCropComplete = crop => {
    this.makeClientCrop(crop);
  };

  onCropChange = (crop, percentCrop) => {
    // You could also use percentCrop:
    // this.setState({ crop: percentCrop });

    // 控制拖动不越界
    const { uploadbtn } = this.cauSize()

    console.log('width == ', uploadbtn.width, ' = ', crop.width, ' + ', crop.x, '?')
    console.log('heigh == ', uploadbtn.height, '=', crop.height, ' +', crop.y, '?')

    if (crop.x + crop.width > uploadbtn.width) {
      crop.x = uploadbtn.width - crop.width
    }
    if (crop.y + crop.height > uploadbtn.height) {
      crop.y = uploadbtn.height - crop.height
    }

    this.setState({ crop });
  };

  async makeClientCrop(crop) {
    if (this.imageRef && crop.width && crop.height) {
      const croppedImageUrl = await this.getCroppedImg(
        this.imageRef,
        crop,
        "newFile." + this.state.ext
      );
      this.setState({ croppedImageUrl });
    }
  }

  getCroppedImg(image, crop, fileName) {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");
    const { top, left } = this.state

    ctx.drawImage(
      image,
      (crop.x - left) * scaleX,
      (crop.y - top) * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob) {
          //reject(new Error('Canvas is empty'));
          console.error("Canvas is empty");
          return;
        }
        blob.name = fileName;
        window.URL.revokeObjectURL(this.fileUrl);
        this.fileUrl = window.URL.createObjectURL(blob);
        resolve(this.fileUrl);
      }, "image/" + this.state.ext);
    });
  }

  cauSize = () => {
    const { uploadbtnAspector, uploadbtnWidth, previewAspector } = this.state.config
    const uploadbtn = {
      width: uploadbtnWidth,
      height: uploadbtnWidth / uploadbtnAspector,
    }
    const preview = {
      width: uploadbtnWidth / previewAspector,
      height: uploadbtnWidth / previewAspector / uploadbtnAspector,
    }
    return {
      uploadbtn,
      preview,
    }
  }

  onDragStart = (e) => {
    console.log('start e == ', e)
    // e.clientX  // 距离浏览器左上角x值
    // e.clientY  // 距离浏览器左上角y值
  }

  onDragEnd = (e) => {
    console.log('end e == ', e)
  }

  renderCrop = () => {

    const { crop, src, width, height, top, left } = this.state;
    if (src) {
      let props = {
        ref: 'cropImage',
        src,
        crop,
        onImageLoaded: this.onImageLoaded,
        onComplete: this.onCropComplete,
        onChange: this.onCropChange,
        onDragStart: this.onDragStart,
        onDragEnd: this.onDragEnd,
        // renderSelectionAddon: () => <div style={{ width: '30px', height: "30px", border: '2px solid red' }}></div>,
      }

      // 解决重写选图片 size不会重写问题
      if (width && height) {
        props.imageStyle = { top, left, width: width, height: height, maxWidth: 'none', maxHeight: 'none' }
      }

      return <div className='jcut-crop-show-box'>
        <ReactCrop {...props} />
      </div>
    }

  }

  render() {
    const { crop, croppedImageUrl, src, width, height } = this.state;
    const size = this.cauSize();
    const cropElement = this.renderCrop()

    return (
      <div className="jui-cut-image-upload">
        <div className='none'>
          <input ref={'cutImageUploadFile'} type="file" onChange={this.onSelectFile} />
        </div>
        <div className='jcut-image-box jflex'>
          <div className='jcut-crop-box' >
            <div className='jcut-crop-box-title'>上传图片</div>
            <div className='jcut-crop-upload-box' style={{ width: size.uploadbtn.width, height: size.uploadbtn.height }}>
              <div className='jcut-crop-upload-btn' onClick={this.onClickFile} />
              {cropElement}
            </div>
            <div className='jcut-crop-box-footer '>
              {src && <div className='jflex-wrap'>
                <a className='jcut-upload-btn' href="##" onClick={this.onClickFile}>更换图片</a>
                <div className='jcut-upload-image-options jflex'>
                  {(width > size.uploadbtn.width || height > size.uploadbtn.height) && <div style={{ marginRight: 20 }}>
                    <a className='jcut-upload-btn' href="##" onClick={() => this.moveImage('l')}>向左</a>
                    <a className='jcut-upload-btn' href="##" onClick={() => this.moveImage('r')}>向右</a>
                    <a className='jcut-upload-btn' href="##" onClick={() => this.moveImage('t')}>向上</a>
                    <a className='jcut-upload-btn' href="##" onClick={() => this.moveImage('b')}>向下</a>
                  </div>}
                  <div style={{ marginRight: 20 }}>
                    <a className='jcut-upload-btn' href="##" onClick={() => this.scaleImage(1)}>放大</a>
                    <a className='jcut-upload-btn' href="##" onClick={() => this.scaleImage()}>缩小</a>
                  </div>
                  <div style={{ marginRight: -20 }}>
                    <a className='jcut-upload-btn' href="##" onClick={() => this.onreset()}>重置</a>
                  </div>
                </div>
              </div>}
            </div>
          </div>
          <div className='jcut-priview-box'>
            <div className='jcut-crop-box-title'>预览</div>
            <div className='jcut-preview-box' style={{ width: size.preview.width, height: size.preview.height }}>
              {croppedImageUrl && (
                <img alt="Crop" style={{ maxWidth: "100%" }} src={croppedImageUrl} />
              )}
            </div>
            <div className='jcut-crop-box-footer'>
              {/* 如果需要定位预览底部 */}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default WithCutImageUpload