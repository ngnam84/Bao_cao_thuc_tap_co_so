import {
    LeftSquareOutlined
} from "@ant-design/icons";
import {
    Breadcrumb, Button, Card, Form,
    Input, Radio, Spin, Steps, Typography, notification
} from "antd";
import React, { useEffect, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import axiosClient from "../../../apis/axiosClient";
import productApi from "../../../apis/productApi";
import "./pay.css";

const Pay = () => {
  const [productDetail, setProductDetail] = useState([]);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderTotal, setOrderTotal] = useState([]);
  const [form] = Form.useForm();
  let { id } = useParams();
  const history = useHistory();

  // Không còn cần hàm hideModal

  const accountCreate = async (values) => {
    try {
      const formatData = {
        userId: userData.id,
        address: values.address,
        billing: "cod", // Mặc định là COD
        description: values.description,
        status: "pending",
        products: productDetail,
        orderTotal: orderTotal,
      };

      console.log(formatData);
      await axiosClient.post("/order", formatData).then((response) => {
        console.log(response);
        if (response.error === "Insufficient quantity for one or more products.") {
          return notification["error"]({
            message: `Thông báo`,
            description: "Sản phẩm đã hết hàng!",
          });
        }

        if (response == undefined) {
          notification["error"]({
            message: `Thông báo`,
            description: "Đặt hàng thất bại",
          });
        } else {
          notification["success"]({
            message: `Thông báo`,
            description: "Đặt hàng thành công",
          });
          form.resetFields();
          history.push("/final-pay");
          localStorage.removeItem("cart");
          localStorage.removeItem("cartLength");
        }
      });
    } catch (error) {
      throw error;
    }
    setTimeout(function () {
      setLoading(false);
    }, 1000);
  };

  // Không còn cần hàm handleModalConfirm
  
  const CancelPay = () => {
    form.resetFields();
    history.push("/cart");
  };

  useEffect(() => {
    (async () => {
      try {
        // Bắt đầu tải dữ liệu

        await productApi.getProductById(id).then((item) => {
          setProductDetail(item);
        });
        const local = localStorage.getItem("client");
        const user = JSON.parse(local);
        console.log(user);
        form.setFieldsValue({
          name: user.username,
          email: user.email,
          phone: user.phone,
        });
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        console.log(cart);

        const transformedData = cart.map(
          ({ _id: product, quantity, promotion, price, name }) => ({ product, quantity, promotion,price, name })
        );
        let totalPrice = 0;

        for (let i = 0; i < transformedData.length; i++) {
          let product = transformedData[i];
          console.log(product);
          let price = product.promotion * product.quantity;
          totalPrice += price;
        }

        setOrderTotal(totalPrice);
        setProductDetail(transformedData);
        console.log(transformedData);
        setUserData(user);
        setLoading(false);
      } catch (error) {
        console.log("Failed to fetch event detail:" + error);
      }
    })();
    window.scrollTo(0, 0);
  }, []);

  return (
    <div class="py-5">
      <Spin spinning={false}>
        <Card className="container">
          <div className="product_detail">
            <div style={{ marginLeft: 5, marginBottom: 10, marginTop: 10 }}>
              <Breadcrumb>
                <Breadcrumb.Item href="http://localhost:3500/cart">
                  <LeftSquareOutlined style={{ fontSize: "24px" }} />
                  <span> Quay lại giỏ hàng</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item href="">
                  <span>Thanh toán</span>
                </Breadcrumb.Item>
              </Breadcrumb>

              <div className="payment_progress">
                <Steps
                  current={1}
                  percent={60}
                  items={[
                    {
                      title: "Chọn sản phẩm",
                    },
                    {
                      title: "Thanh toán",
                    },
                    {
                      title: "Hoàn thành",
                    },
                  ]}
                />
              </div>

              <div className="information_pay">
                <Form
                  form={form}
                  onFinish={accountCreate}
                  name="eventCreate"
                  layout="vertical"
                  initialValues={{
                    residence: ["zhejiang", "hangzhou", "xihu"],
                    prefix: "86",
                  }}
                  scrollToFirstError
                >
                  <Form.Item
                    name="name"
                    label="Tên"
                    hasFeedback
                    style={{ marginBottom: 10 }}
                  >
                    <Input  placeholder="Tên" />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label="Email"
                    hasFeedback
                    style={{ marginBottom: 10 }}
                  >
                    <Input disabled placeholder="Email" />
                  </Form.Item>

                  <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    hasFeedback
                    style={{ marginBottom: 10 }}
                  >
                    <Input  placeholder="Số điện thoại" />
                  </Form.Item>

                  <Form.Item
                    name="address"
                    label="Địa chỉ"
                    hasFeedback
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập địa chỉ",
                      },
                    ]}
                    style={{ marginBottom: 15 }}
                  >
                    <Input placeholder="Địa chỉ" />
                  </Form.Item>

                  <Form.Item
                    name="description"
                    label="Lưu ý cho đơn hàng"
                    hasFeedback
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập lưu ý cho đơn hàng!",
                      },
                    ]}
                    style={{ marginBottom: 15 }}
                  >
                    <Input.TextArea rows={4} placeholder="Lưu ý" />
                  </Form.Item>

                  <Form.Item
                    name="billing"
                    label="Phương thức thanh toán"
                    hasFeedback
                    initialValue="cod"
                    style={{ marginBottom: 10 }}
                  >
                    <Radio.Group disabled>
                      <Radio value={"cod"}>Thanh toán khi nhận hàng (COD)</Radio>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item>
                    <Button
                      style={{
                        background: "#FF8000",
                        color: "#FFFFFF",
                        float: "right",
                        marginTop: 20,
                        marginLeft: 8,
                      }}
                      htmlType="submit"
                    >
                      Hoàn thành
                    </Button>
                    <Button
                      style={{
                        background: "#FF8000",
                        color: "#FFFFFF",
                        float: "right",
                        marginTop: 20,
                      }}
                      onClick={CancelPay}
                    >
                      Trở về
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </div>
          </div>
        </Card>
        {/* Kết thúc trang thanh toán */}
      </Spin>
    </div>
  );
};

export default Pay;
