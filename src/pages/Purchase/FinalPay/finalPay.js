import { AuditOutlined, HomeOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Card, Form, Result, Spin, Steps } from "antd";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import productApi from "../../../apis/productApi";
import userApi from "../../../apis/userApi";

const FinalPay = () => {

    const [productDetail, setProductDetail] = useState([]);
    const [userData, setUserData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [orderTotal, setOrderTotal] = useState([]);
    const [form] = Form.useForm();
    let { id } = useParams();
    const history = useHistory();


    const handleFinal = () => {
        history.push("/")
    }

    useEffect(() => {
        (async () => {
            try {
                await productApi.getDetailProduct(id).then((item) => {
                    setProductDetail(item);
                });
                const response = await userApi.getProfile();
                console.log(response);
                form.setFieldsValue({
                    name: response.user.username,
                    email: response.user.email,
                    phone: response.user.phone,
                });
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const transformedData = cart.map(({ _id: product, quantity, price }) => ({ product, quantity, price }));
                let totalPrice = 0;

                for (let i = 0; i < transformedData.length; i++) {
                    let product = transformedData[i];
                    let price = product.price * product.quantity;
                    totalPrice += price;
                }

                setOrderTotal(totalPrice);
                setProductDetail(transformedData)
                console.log(transformedData);
                setUserData(response.user);
                setLoading(false);


            } catch (error) {
                console.log('Failed to fetch event detail:' + error);
            }
        })();
        window.scrollTo(0, 0);
    }, [])

    return (
        <div class="py-5">
            <Spin spinning={false} >
                <Card className="container" >
                    <div className="product_detail">

                        <div style={{ marginLeft: 5, marginBottom: 10, marginTop: 10 }}>
                            <Breadcrumb>
                                <Breadcrumb.Item href="">
                                    <HomeOutlined />
                                </Breadcrumb.Item>
                                <Breadcrumb.Item href="">
                                    <AuditOutlined />
                                    <span>Thanh toán</span>
                                </Breadcrumb.Item>
                            </Breadcrumb>

                            <div className="payment_progress">
                                <Steps
                                    current={2}
                                    percent={100}
                                    items={[
                                        {
                                            title: 'Chọn sản phẩm',
                                        },
                                        {
                                            title: 'Thanh toán',
                                        },
                                        {
                                            title: 'Hoàn thành',
                                        },
                                    ]}
                                />
                            </div>
                            <Result
                                status="success"
                                title="Đặt hàng thành công!"
                                subTitle="Bạn có thể xem lịch sử đặt hàng ở quản lý đơn hàng."
                                extra={[
                                    <Button type="primary" key="console" onClick={() => handleFinal()}>
                                        Hoàn thành
                                    </Button>,
                                ]}
                            />
                        </div>
                    </div>
                </Card>
            </Spin>
        </div >
    );
};

export default FinalPay;
