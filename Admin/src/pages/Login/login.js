import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Divider, Form, Input, Modal, notification, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { useHistory } from "react-router-dom";
import userApi from "../../apis/userApi";
import "./login.css";

const { Title, Text } = Typography;

const Login = () => {

  const [isLogin, setLogin] = useState(true);
  const [forgotPasswordModalVisible, setForgotPasswordModalVisible] = useState(false);
  const [forgotPasswordForm] = Form.useForm(); // Add this line

  let history = useHistory();

  const onFinish = values => {
    userApi.login(values.email, values.password)
      .then(function (response) {
        if (!response.status) {
          setLogin(false);
        }
        else {
          (async () => {
            try {
              console.log(response);
              if (response.user.status !== "noactive") {
                history.push("/dash-board");
              } else {
                notification["error"]({
                  message: `Thông báo`,
                  description:
                    'Bạn không có quyền truy cập vào hệ thống',

                });
              }
            } catch (error) {
              console.log('Failed to fetch ping role:' + error);
            }
          })();
        }
      })
      .catch(error => {
        console.log("email or password error" + error)
      });
  }

  const showForgotPasswordModal = () => {
    setForgotPasswordModalVisible(true);
  };

  const handleForgotPasswordCancel = () => {
    setForgotPasswordModalVisible(false);
  };

  const handleForgotPasswordSubmit = async () => {
    const values = await forgotPasswordForm.validateFields(); 
    console.log(values.email);

    try {
      const data = {
        "email": values.email
      }
      await userApi.forgotPassword(data);
      notification.success({
        message: 'Thông báo',
        description: 'Đã gửi đường dẫn đổi mật khẩu qua email.',
      });
      setForgotPasswordModalVisible(false);
    } catch (error) {
      notification.error({
        message: 'Lỗi',
        description: 'Đã có lỗi xảy ra khi gửi đường dẫn đổi mật khẩu.',
      });
      console.error('Forgot password error:', error);
    }
  };

  const handleLink = () => {
    history.push("/register");
  }

  useEffect(() => {

  }, [])

  return (
    <div className="imageBackground">
      <div id="formContainer">
        <div id="form-Login">
          <div className="formContentLeft">
            <img 
              className="formImg" 
              src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80"
              alt="fashion" 
            />
          </div>
          <Form
            name="normal_login"
            className="loginform"
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
          >
            <div className="form-header">
              <Title level={2}>TRENDY WEAR</Title>
              <Divider className="divider">Local Brand Fashion</Divider>
              <Text className="text">Đăng nhập để khám phá xu hướng thời trang mới nhất</Text>
            </div>

            {!isLogin && (
              <Form.Item style={{ marginBottom: 24 }}>
                <Alert
                  message="Email hoặc mật khẩu không chính xác"
                  type="error"
                  showIcon
                />
              </Form.Item>
            )}

            <Form.Item
              name="email"
              className="input-field"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập email!',
                },
                {
                  type: 'email',
                  message: 'Email không hợp lệ!',
                },
              ]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="Email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              className="input-field"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập mật khẩu!',
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="Mật khẩu"
              />
            </Form.Item>

            <Form.Item>
              <Button className="button" type="primary" htmlType="submit" block>
                Đăng Nhập
              </Button>
            </Form.Item>

            <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
              <a onClick={showForgotPasswordModal} className="forgot-password-link">
                Quên mật khẩu?
              </a>
            </Form.Item>
            
          </Form>
        </div>

        <Modal
          title="Quên mật khẩu"
          visible={forgotPasswordModalVisible}
          onCancel={handleForgotPasswordCancel}
          footer={[
            <Button key="back" onClick={handleForgotPasswordCancel}>
              Hủy
            </Button>,
            <Button key="submit" type="primary" onClick={handleForgotPasswordSubmit}>
              Gửi đường dẫn đổi mật khẩu
            </Button>,
          ]}
        >
          <Form
            name="forgot_password"
            onFinish={handleForgotPasswordSubmit}
            form={forgotPasswordForm}
          >
            <Form.Item
              name="email"
              rules={[
                {
                  type: 'email',
                  message: 'Email không hợp lệ',
                },
                {
                  required: true,
                  message: 'Vui lòng nhập email',
                },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Email" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default Login;


