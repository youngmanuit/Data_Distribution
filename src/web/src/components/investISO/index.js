import React from 'react';
import {
    Form,
    InputNumber,
    Modal,
    Button,
    message,
    Tooltip,
    Typography,
    Input
  } from 'antd';
import 'antd/dist/antd.css';
import {connect} from 'react-redux';
import {investISO, labelFile} from '../../api/userAPI'
import {showNotificationTransaction, showNotificationLoading, showNotificationFail} from '../../utils/common'

const { Text } = Typography;
const CollectionCreateForm = Form.create({ name: 'form_in_modal' })(
  // eslint-disable-next-line
  class extends React.Component {
      render() {
        const { visible, onCancel, onCreate, form } = this.props;
        const { getFieldDecorator } = form;
        return (
          <Modal
            visible={visible}
            title="Labeling"
            okText="Submit"
            onCancel={onCancel}
            onOk={onCreate}
          >
            <Form layout="horizontal">
              <Form.Item label="Labeled File">
                {getFieldDecorator('investAmount', {
                  rules: [{ required: true, message: 'Please input a string!'}],
                  initialValue: "",
                })(
                  <Input
                    // min={0}
                    style={{width: 150}}
                    // formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    // parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                )}
              </Form.Item>
            </Form>
          </Modal>
        );
      }
    },
);

class InvestISO extends React.Component {
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
    console.log('Test labell function ssjsjdksjdksjdkskdkjsk')
    console.log(this.props.record)
    showNotificationLoading("Labeling file ...")
    const { form } = this.formRef.props;
    form.validateFields((err, values) => {
      if(err){
        return message.error('Please fill your IPFS hash');
      }
      let data = {
        idUnlabelFile: this.props.record.idFile,
        hashFile: values.investAmount
      }
      console.log(data)
      labelFile(data)
        .then((txHash) => {
            showNotificationTransaction(txHash);
            form.resetFields();
            this.setState({ visible: false });
        })
        .catch((error) => {
            showNotificationFail("Error find labeler")
        })
    });
  };

  saveFormRef = formRef => {
    this.formRef = formRef;
  };
  
  render() {
    const {record} = this.props
    return (
      <div>
        {
          record.isLabeled ?
          <Tooltip title="this dataset is Labeled" placement="leftTop">
            <Button disabled={true} type="primary" ghost icon="bg-colors" onClick={this.showModal}>
              <Text>Labeled</Text>
            </Button>
          </Tooltip>
          : !record.locked ?
              <Tooltip title="Label this dataset" placement="leftTop">
                <Button type="primary" ghost icon="bg-colors" onClick={this.showModal}>
                  <Text>Label</Text>
                </Button>
              </Tooltip>
              : record.user.addressEthereum === this.props.userReducer.user.addressEthereum ?
                <Tooltip title="Aprrove this dataset" placement="leftTop">
                  <Button type="primary" ghost icon="bg-colors" onClick={this.showModal}>
                    <Text>Aprrove</Text>
                  </Button>
                </Tooltip>
                : <Tooltip title="this dataset is Locked" placement="leftTop">
                    <Button disabled={true} type="primary" ghost icon="bg-colors" onClick={this.showModal}>
                      <Text>Locked</Text>
                    </Button>
                  </Tooltip>
          }
        
          <CollectionCreateForm
            wrappedComponentRef={this.saveFormRef}
            visible={this.state.visible}
            onCancel={this.handleCancel}
            onCreate={this.handleCreate}
          />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userReducer: state.userReducer,
})

const mapDispatchToProps = (dispatch) => ({
  
})
export default connect(mapStateToProps, mapDispatchToProps)(InvestISO);
