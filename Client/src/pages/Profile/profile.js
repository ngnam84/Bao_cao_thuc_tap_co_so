import {
    FormOutlined,
    HomeOutlined
} from '@ant-design/icons';
import {
    Breadcrumb,
    Button,
    Card,
    Col,
    Divider,
    Form, Input,
    Modal,
    Row,
    Spin,
    notification
} from 'antd';
import React, { useEffect, useState } from 'react';
import ReactWeather, { useOpenWeather } from 'react-open-weather';
import uploadFileApi from '../../apis/uploadFileApi';
import userApi from "../../apis/userApi";
import "./profile.css";


const Profile = () => {

    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState([]);
    const [isVisibleModal, setVisibleModal] = useState(false);
    const [file, setUploadFile] = useState();

    const { data, isLoading, errorMessage } = useOpenWeather({
        key: '03b81b9c18944e6495d890b189357388',
        lat: '16.060094749570567',
        lon: '108.2097695823264',
        lang: 'en',
        unit: 'metric',
    });
    const handleList = () => {
        (async () => {
            try {
                const local = localStorage.getItem("client");
                if (local) {
                    const user = JSON.parse(local);
                    console.log('Loaded user data from localStorage:', user);
                    setUserData(user);
                } else {
                    console.log('No user data found in localStorage');
                }
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch profile user:', error);
                setLoading(false);
            }
        })();
    }

    useEffect(() => {
        (async () => {
            handleList();
        })();
        window.scrollTo(0, 0);
    }, [])

    const handleFormSubmit = async (values) => {
        try {
            setLoading(true);
            // Đảm bảo chúng ta có ID người dùng
            if (!userData || !userData.id) {
                notification.error({
                    message: 'Lỗi',
                    description: 'Không tìm thấy thông tin người dùng',
                });
                return;
            }

            // Log dữ liệu trước khi gửi
            console.log('User ID:', userData.id);
            console.log('Current user data:', userData);
            console.log('Form values:', values);
            console.log('Image URL:', file);

            // Chuẩn bị dữ liệu cập nhật
            const formatData = {
                "email": values.email,
                "phone": values.phone,
                "username": values.username,
                "image": file, // URL ảnh đã upload
            };

            // Gửi request cập nhật
            const response = await userApi.updateProfile(formatData, userData.id);
            console.log('Update response:', response);

            if (!response || response === '' || response === undefined) {
                notification.error({
                    message: 'Thông báo',
                    description: 'Cập nhật tài khoản thất bại',
                });
            } else {
                notification.success({
                    message: 'Thông báo',
                    description: 'Cập nhật tài khoản thành công',
                });

                // Cập nhật localStorage với dữ liệu mới
                const updatedUserData = {
                    ...userData,
                    email: values.email,
                    phone: values.phone,
                    username: values.username,
                    image: file
                };
                localStorage.setItem("client", JSON.stringify(updatedUserData));
                
                // Cập nhật state với dữ liệu mới
                setUserData(updatedUserData);
                
                // Đóng modal
                setVisibleModal(false);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            notification.error({
                message: 'Lỗi',
                description: 'Đã xảy ra lỗi khi cập nhật thông tin: ' + (error.message || 'Vui lòng thử lại'),
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChangeImage = async (e) => {
        try {
            setLoading(true);
            console.log('File selected:', e.target.files[0]);
            const response = await uploadFileApi.uploadFile(e);
            console.log('Upload response:', response);
            if (response) {
                setUploadFile(response);
                // Không cần cập nhật form vì chúng ta đang sử dụng biến state
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            notification.error({
                message: 'Lỗi',
                description: 'Không thể tải lên hình ảnh. Vui lòng thử lại.'
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <Spin spinning={loading}>
                <div style={{ marginTop: 20, marginLeft: 24 }}>
                    <Breadcrumb>
                        <Breadcrumb.Item href="">
                            <HomeOutlined />
                        </Breadcrumb.Item>
                        <Breadcrumb.Item href="">
                            <FormOutlined />
                            <span>Trang cá nhân</span>
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </div>

                <div>
                    <div>
                        <Row justify="center">
                            <Col span="9" style={{ marginTop: 20, marginLeft: 20, marginRight: 20 }}>
                                <Card hoverable={true} className="profile-card" style={{ padding: 0, margin: 0 }}>
                                    <Row justify="center">
                                        <img
                                            src={userData?.image}
                                            style={{
                                                width: 150,
                                                height: 150,
                                                borderRadius: '50%', 
                                            }}
                                        />
                                    </Row>
                                    <Row justify="center">
                                        <Col span="24">
                                            <Row justify="center">
                                                <strong style={{ fontSize: 18 }}>{userData?.username}</strong>
                                            </Row>
                                            <Row justify="center">
                                                <p style={{ padding: 0, margin: 0, marginBottom: 5 }}>{userData?.email}</p>
                                            </Row>
                                            <Row justify="center">
                                                <p style={{ padding: 0, margin: 0, marginBottom: 0 }}>{userData?.birthday}</p>
                                            </Row>
                                            <Row justify="center">
                                                <p style={{ padding: 0, margin: 0, marginBottom: 5 }}>{userData?.phone}</p>
                                            </Row>
                                            <Divider style={{ padding: 0, margin: 0 }} ></Divider>
                                        </Col>
                                        <Button type="primary" style={{ marginTop: 15 }} onClick={() => setVisibleModal(true)}>Cập nhật Profile</Button>

                                    </Row>

                                </Card>
                            </Col>

                            <Col span="6" style={{ marginTop: 20 }}>
                                <ReactWeather
                                    isLoading={isLoading}
                                    errorMessage={errorMessage}
                                    data={data}
                                    lang="en"
                                    locationLabel="Đà Nẵng"
                                    unitsLabels={{ temperature: 'C', windSpeed: 'Km/h' }}
                                    showForecast
                                />
                            </Col>
                        </Row>
                    </div>
                </div>

                <div>
                    <Modal
                        title="Cập nhật thông tin cá nhân"
                        visible={isVisibleModal}
                        onCancel={() => setVisibleModal(false)}
                        footer={null}
                    >
                        <Form
                            initialValues={{
                                username: userData?.username,
                                email: userData?.email,
                                phone: userData?.phone,
                            }}
                            onFinish={handleFormSubmit}
                        >
                            <Spin spinning={loading}>
                                <Form.Item
                                    label="Tên"
                                    name="username"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng nhập username!',
                                        },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Email" name="email" rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập email!',
                                    },
                                    {
                                        type: 'email',
                                        message: 'Email không hợp lệ!',
                                    },
                                ]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Số điện thoại" name="phone" rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập số điện thoại!',
                                    },
                                    {
                                        pattern: /^[0-9]{10}$/,
                                        message: "Số điện thoại phải có 10 chữ số và chỉ chứa số",
                                    },
                                ]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="image"
                                    label="Chọn ảnh"
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                        {file && (
                                            <div style={{ marginBottom: 10 }}>
                                                <img 
                                                    src={file} 
                                                    alt="Preview" 
                                                    style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '1px solid #d9d9d9' }} 
                                                />
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleChangeImage}
                                            id="avatar"
                                            name="file"
                                        />
                                    </div>
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit">
                                        Cập nhật
                                    </Button>
                                </Form.Item>
                            </Spin>
                        </Form>
                    </Modal>
                </div>
            </Spin>
        </div >
    )
}

export default Profile;