import React from 'react';
import {
    Form,
    Select,
    InputNumber,
    Switch,
    Modal,
    Upload,
    Icon,
    Input,
    Button,
    message
  } from 'antd';
import 'antd/dist/antd.css';
import {upload} from '../../api/userAPI'
import {showNotificationTransaction, showNotificationLoading, showNotificationFail} from '../../utils/common'
import config from '../../config';
import {getUserUpload} from '../../actions/page'
import { connect} from 'react-redux'

// function beforeUpload(file, kind) {
//   if(kind === "Image"){
//     const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
//     if (!isJpgOrPng) {
//       message.error('You can only upload JPG/PNG file!');
//     }
//     const isLt2M = file.size / 1024 / 1024 < 2;
//     if (!isLt2M) {
//       message.error('Image must smaller than 2MB!');
//     }
//     return isJpgOrPng && isLt2M;
//   }
//   else if(kind === "Music"){
//     const isMp3 = file.type === 'audio/mp3';
//     if (!isMp3) {
//       message.error('You can only upload Mp3 file!');
//     }
//     return isMp3;
//   }
// }

const CollectionCreateForm = Form.create({ name: 'form_in_modal' })(
  // eslint-disable-next-line
class extends React.Component {
    state = {
        USD: 0,
        costUSD: 23000,
      }
    componentDidMount() {
    this.props.onRef(this)
    }
    componentWillUnmount() {
    this.props.onRef(undefined)
    }
    resetUSD = () => {
        this.setState({ USD: 0 });
    }

    normFileMusic =  e => {
      // console.log('Upload event:', e);
      if (Array.isArray(e)) {
          return e;
      }
      if(e.fileList.length === 2) {
          e.fileList = e.fileList.slice(-1);
      }
      return e && e.fileList;
    }

    normFileImage =  e => {
      // console.log('Upload event:', e);
      if (Array.isArray(e)) {
          return e;
      }
      if(e.fileList.length === 2) {
          e.fileList = e.fileList.slice(-1);
      }
      return e && e.fileList;
    }

    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form;
      const { Option } = Select;
      return (
        <Modal
          visible={visible}
          title="Upload dataset"
          okText="Submit"
          onCancel={onCancel}
          onOk={onCreate}
        >
        <Form layout="vertical">
          <Form.Item label="Dataset's name">
            {getFieldDecorator('SongName', {
              rules: [{ required: true, message: 'Please input the name of this dataset!' }],
            })(<Input placeholder="Please select dataset's name" />)}
          </Form.Item>

        <Form.Item label="Provider's name">
          {getFieldDecorator('ArtistsName', {
            rules: [{ required: true, message: "Please input provider's name!" }],
          })(<Input placeholder="Please select provider's name" />)}
        </Form.Item>

        <Form.Item label="Description">
            {getFieldDecorator('Description', {
              rules: [{ required: true, message: 'Please input some description of this dataset!' }],
            })(<Input placeholder="Please input some description of this dataset!" />)}
          </Form.Item>

        <Form.Item label="Tags">
          {getFieldDecorator('Tags', {
            rules: [
              { message: 'Please select dataset\'s tag ', type: 'array' },
            ],
          })(
            <Select mode="multiple" placeholder="Please select dataset's tag">
              <Option value="personaldata">Personal Data</Option>
              <Option value="sport">Sport</Option>
              <Option value="medical">Medical</Option>
              <Option value="realestate">Real-Estate</Option>
              <Option value="Hospitality">Hospitality</Option>
              <Option value="Economy">Economy</Option>
              <Option value="Weather">Weather</Option>
            </Select>,
          )}
        </Form.Item>

        <Form.Item label="Price DIV">
          {getFieldDecorator('Price', {rules: [{ required: true, message: 'Please input cost of this Dataset!'}], initialValue: 0, onChange: (e) => {
            // e = Math.ceil(e)
            this.setState({USD: e/this.state.costUSD})
            }})(<InputNumber min={0} max={10000000000} />)}
          <span className="ant-form-text"> DIV</span>
          <span className="ant-form-text">➜   {this.state.USD} USD</span>
        </Form.Item>

        {/* <Form.Item label="Price USD">
          <span className="ant-form-text">{this.state.USD} USD</span>
        </Form.Item> */}

        <Form.Item label="Contract permission">
          {getFieldDecorator('ContractPermission', { initialValue: true, valuePropName: 'checked' })(<Switch />)}
        </Form.Item>

        <Form.Item label="Upload Image">
          {getFieldDecorator('Image', {
            valuePropName: 'fileList',
            getValueFromEvent: this.normFileImage,
          })(
            <Upload
            name="file"
            action={config.api_url + "/users/upload"}
            listType="picture"
            >
              <Button>
                <Icon type="upload" /> Click to upload image
              </Button>
            </Upload>,
          )}
        </Form.Item>

        <Form.Item label="Upload Dataset">
          {getFieldDecorator('Music', {
            valuePropName: 'fileList',
            getValueFromEvent: this.normFileMusic,
            rules: [{ required: true}],
          })(
            <Upload.Dragger action={config.api_url + "/users/upload"}>
              <p className="ant-upload-drag-icon" >
                <Icon type="inbox" />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload dataset</p>
            </Upload.Dragger>,
          )}
        </Form.Item>
          </Form>
        </Modal>
      );
    }
  },
);

class UploadModal extends React.Component {
  state = {
    visible: false,
  };

  showModal = () => {
    this.setState({ visible: true });
  };

  handleCancel = () => {
    this.setState({ visible: false });
  };

  handleCreate = () => {
    const { form } = this.formRef.props;
    form.validateFields((err, values) => {
      if(err){
        return message.error('please fill out all fields');
      }
      if(values.Music[0].status == "uploading" || values.Image[0].status == "uploading" )
        return Modal.error({
          title: 'Please waiting for dataset or image upload!',
      })
      form.resetFields();
      this.child.resetUSD();
      this.setState({ visible: false });
      this.openUploadNotification(values)
    });
  };

  saveFormRef = formRef => {
    this.formRef = formRef;
  };

  openUploadNotification = (values) => {
    showNotificationLoading("Uploading ...")
    // console.log(values)
    let data = {
      ether: {
        hash: values.Music[0].response.result,
        price: values.Price,
      },
      server: {
        description: values.Description,
        hash: values.Music[0].response.result,
        image: values.Image[0].response.result,
        name: values.SongName,
        artist: values.ArtistsName,
        tags: values.Tags,
        contractPermission: values.ContractPermission,
      }
    }
    upload(data)  
    .then((txHash) => {
      showNotificationTransaction(txHash);
      config.provider.waitForTransaction(txHash)
      .then(()=>{
        this.props.getUserUpload(this.props.userReducer.user.addressEthereum)
        return Modal.success({
          title: 'Upload dataset success!',
        })
      })
    })
    .catch((error) => {
      showNotificationFail("Please check your balance and upload again!")
      return Modal.error({
        title: `Error: "Please check your balance and upload again!"`,
      })
    })
  }
  render() {
    return (
      <div>
        <Button type="danger" onClick={this.showModal}>
          Upload
        </Button>
        <CollectionCreateForm
          wrappedComponentRef={this.saveFormRef}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
          onRef={ref => (this.child = ref)}
        />
      </div>
    );
  }
}


const mapStateToProps = (state) => ({
  userReducer: state.userReducer,
})

const mapDispatchToProps = (dispatch) => ({
  getUserUpload: (address)=>dispatch(getUserUpload(address))
})
export default connect(mapStateToProps, mapDispatchToProps)(UploadModal);
