import {
    Breadcrumb, Button, Card, Divider,
    Modal,
    Spin, Table, Tag,
    notification
} from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import axiosClient from "../../../apis/axiosClient";
import eventApi from "../../../apis/eventApi";
import productApi from "../../../apis/productApi";
import "./cartHistory.css";

const CartHistory = () => {
    const [orderList, setOrderList] = useState([]);
    const [loading, setLoading] = useState(true);
    let { id } = useParams();
    const history = useHistory();


    const handleCancelOrder = (order) => {
        console.log(order);
        Modal.confirm({
            title: 'Xác nhận hủy đơn hàng',
            content: 'Bạn có chắc muốn hủy đơn hàng này?',
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            onOk() {
                handleUpdateOrder(order._id);
            },
        });
    };


    const handleUpdateOrder = async (id) => {
        setLoading(true);
        try {
            const categoryList = {
                "description": "Khách hàng hủy đơn hàng!",
                "status": "rejected"
            }
            await axiosClient.put("/order/" + id, categoryList).then(response => {
                if (response === undefined) {
                    notification["error"]({
                        message: `Thông báo`,
                        description:
                            'Cập nhật thất bại',
                    });
                }
                else {
                    notification["success"]({
                        message: `Thông báo`,
                        description:
                            'Cập nhật thành công',
                    });
                }
            })

            handleList();
            setLoading(false);

        } catch (error) {
            throw error;
        }
    }

    const columns = [
        {
            title: "Thông tin sản phẩm",
            dataIndex: "products",
            key: "productInfo",
            render: (products) => (
                <div>
                    {products.map((item, index) => (
                        <div key={index} className="product-info">
                            
                            <h3 className="product-name-1">{item.product?.name}</h3>
                            <div className="product-price">
                                Giá gốc: {item?.price?.toLocaleString("vi", {
                                    style: "currency",
                                    currency: "VND",
                                })}
                            </div>
                            <div className="product-quantity">
                                Số lượng: {item?.quantity}
                            </div>
                            <div className="product-total">
                                Tổng tiền: {(item?.price * item.quantity).toLocaleString("vi", {
                                    style: "currency",
                                    currency: "VND",
                                })}
                            </div>
                            {index !== products.length - 1 && <Divider />}
                        </div>
                    ))}
                </div>
            ),
        },


        {
            title: "Tổng đơn hàng",
            dataIndex: "order_total",
            key: "order_total",
            render: (products) => (
                <div>
                    {products?.toLocaleString("vi", {
                        style: "currency",
                        currency: "VND",
                    })}
                </div>
            ),
        },
        {
            title: "Địa chỉ",
            dataIndex: "address",
            key: "address",
        },
        {
            title: "Hình thức thanh toán",
            dataIndex: "billing",
            key: "billing",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (slugs) => (
                <span>
                    {slugs === "rejected" ? (
                        <Tag style={{ width: 150, textAlign: "center" }} color="red">
                            Đã hủy
                        </Tag>
                    ) : slugs === "approved" ? (
                        <Tag
                            style={{ width: 150, textAlign: "center" }}
                            color="geekblue"
                            key={slugs}
                        >
                            Vận chuyển
                        </Tag>
                    ) : slugs === "final" ? (
                        <Tag color="green" style={{ width: 150, textAlign: "center" }}>
                            Đã giao - Đã thanh toán
                        </Tag>
                    ) : (
                        <Tag color="blue" style={{ width: 150, textAlign: "center" }}>
                            Đợi xác nhận
                        </Tag>
                    )}
                </span>
            ),
        },
        {
            title: "Ngày đặt",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (createdAt) => (
                <span>{moment(createdAt).format("DD/MM/YYYY HH:mm")}</span>
            ),
        },
        // {
        //     title: 'Hủy đơn hàng',
        //     dataIndex: 'order',
        //     key: 'order',
        //     render: (text, record) => (
        //         <Button
        //             type="danger"
        //             onClick={() => handleCancelOrder(record)}
        //             disabled={record.status !== 'pending'}
        //         >
        //             Hủy đơn hàng
        //         </Button>
        //     ),
        // },
    ];

    const handleList = () => {
        (async () => {
            try {
                const local = localStorage.getItem("client");
                const user = JSON.parse(local);
                await productApi.getOrderByUser(user.id).then((item) => {
                    console.log(item.data);
                    setOrderList(item.data);
                });
                setLoading(false);
            } catch (error) {
                console.log("Failed to fetch event detail:" + error);
            }
        })();
    }

    useEffect(() => {
        handleList();
        window.scrollTo(0, 0);
    }, []);

    // Thêm vào component của bạn
    const handleProductClick = (id) => {
        history.push("/product-detail/" + id);
    };

    return (
        <div>
            <Spin spinning={false}>
                <Card className="container_details">
                    <div className="product_detail">
                        <div style={{ marginLeft: 5, marginBottom: 10, marginTop: 10 }}>
                            <Breadcrumb>
                                <Breadcrumb.Item href="http://localhost:3500/home">
                                    <span>Trang chủ</span>
                                </Breadcrumb.Item>
                                <Breadcrumb.Item href="">
                                    <span>Quản lý đơn hàng </span>
                                </Breadcrumb.Item>
                            </Breadcrumb>
                        </div>
                        <hr></hr>
                        <div className="container" style={{ marginBottom: 30 }}>

                            <br></br>
                            <Card>
                                <Table
                                    columns={columns}
                                    dataSource={orderList}
                                    rowKey="_id"
                                    pagination={{ position: ["bottomCenter"] }}
                                />
                            </Card>
                        </div>
                    </div>
                </Card>
            </Spin>
        </div>
    );
};

export default CartHistory;
