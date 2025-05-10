import React, { useState, useEffect, useRef } from "react";
import "../Home/home.css";
import Texty from 'rc-texty';
import TweenOne from 'rc-tween-one';
import QueueAnim from 'rc-queue-anim';
import eventApi from "../../apis/eventApi";
import productApi from "../../apis/productApi";
import { OverPack } from 'rc-scroll-anim';
import { DateTime } from "../../utils/dateTime";
import handshake from "../../assets/icon/handshake.svg";
import promotion1 from "../../assets/home/banner-1.png";
import banner from "../../assets/image/banner/banner.png";
import banner2 from "../../assets/image/banner/banner2.png";
import service6 from "../../assets/image/service/service6.png";
import service7 from "../../assets/image/service/service7.png";
import service8 from "../../assets/image/service/service8.png";
import service9 from "../../assets/image/service/service9.png";
import service10 from "../../assets/image/service/service10.png";
import TawkMessengerReact from '@tawk.to/tawk-messenger-react';
import triangleTopRight from "../../assets/icon/Triangle-Top-Right.svg"

import { useHistory } from 'react-router-dom';
import { RightOutlined, QrcodeOutlined } from '@ant-design/icons';
import { Col, Row, Button, Pagination, Spin, Carousel, Card, List, BackTop, Affix, Avatar, Badge, Rate } from "antd";
import Paragraph from "antd/lib/typography/Paragraph";
import { numberWithCommas } from "../../utils/common";
import categoryApi from "../../apis/categoryApi";

const DATE_TIME_FORMAT = "DD - MM - YYYY";
const gridStyle = {
    width: '25%',
    textAlign: 'center',
};

const Home = () => {

    const [event, setEvent] = useState([]);
    const [productList, setProductList] = useState([]);
    const [eventListHome, setEventListHome] = useState([]);
    const [totalEvent, setTotalEvent] = useState(Number);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [categories, setCategories] = useState([]);
    const [productsPhone, setProductsPhone] = useState([]);
    const [productsPC, setProductsPC] = useState([]);
    const [productsTablet, setProductsTablet] = useState([]);
    const [visible, setVisible] = useState(true);
    const tawkMessengerRef = useRef();
    const initialCountdownDate = new Date().getTime() + 24 * 60 * 60 * 1000;
    const [countdownDate, setCountdownDate] = useState(
      localStorage.getItem('countdownDate') || initialCountdownDate
    );
  
    const [timeLeft, setTimeLeft] = useState(countdownDate - new Date().getTime());

    const history = useHistory();

    const handlePage = async (page, size) => {
        try {
            const response = await eventApi.getListEvents(page, 8);
            setEventListHome(response.data)
            setTotalEvent(response.total_count);
            setCurrentPage(page);

        } catch (error) {
            console.log('Failed to fetch event list:' + error);
        }
    }

    const handleReadMore = (id) => {
        console.log(id);
        history.push("product-detail/" + id)
    }

    const handleCategoryDetails = (id) => {
        console.log(id);
        history.push("product-list/" + id)
    }

    const onLoad = () => {
        setVisible(false);
    };

    useEffect(() => {
        (async () => {
            try {
                const response = await productApi.getAllProducts({ page: 1, limit: 10 })
                setProductList(response.data)
                setTotalEvent(response);
                setLoading(false);
            } catch (error) {
                console.log('Failed to fetch event list:' + error);
            }

            try {
                const response = await productApi.getListEvents(1, 6)
                setEventListHome(response.data)
                setTotalEvent(response.total_count);
            } catch (error) {
                console.log('Failed to fetch event list:' + error);
            }
            try {
                const response = await categoryApi.getListCategory({ limit: 10, page: 1 });
                console.log(response);
                setCategories(response.categories);
            } catch (error) {
                console.log(error);
            }
            try {
                const data = { limit: 10, page: 1 };
                const response = await productApi.getProductsByCategory("1");
                console.log(response);
                setProductsPhone(response.data);
                const response2 = await productApi.getProductsByCategory("2");
                console.log(response2);
                setProductsPC(response2.data);
                const response3 = await productApi.getProductsByCategory("3");
                console.log(response3);
                setProductsTablet(response3.data);
            } catch (error) {
                console.log(error);
            }

            localStorage.setItem('countdownDate', countdownDate);

            const interval = setInterval(() => {
                const newTimeLeft = countdownDate - new Date().getTime();
                setTimeLeft(newTimeLeft);

                if (newTimeLeft <= 0) {
                    clearInterval(interval);
                }
            }, 1000);

            return () => clearInterval(interval);
        })();
    }, [countdownDate])

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return (
        
        <Spin spinning={false}>

            <div style={{ background: "#FFFFFF", overflowX: "hidden", overflowY: "hidden", paddingTop: 15, }} className="home">
                <div style={{ background: "#FFFFFF" }} className="container-home container banner-promotion">
                    <Row justify="center" align="top" key="1" >
                        <Col span={4} >
                            <ul className="menu-tree">
                                {categories.map((category) => (
                                    <li key={category.id} onClick={() => handleCategoryDetails(category.id)}>
                                        <div className="menu-category">
                                            {category.name}
                                            <RightOutlined />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </Col>
                        <Col span={15}>
                            <Carousel autoplay className="carousel-image">
                                <div className="img">
                                    <img style={{ width: '100%', height: 250 }} src="https://pos.nvncdn.com/d0f3ca-7136/bn/20250304_Pgm3LPnY.gif" alt="" />

                                </div>
                                <div className="img">
                                    <img style={{ width: '100%', height: 250 }} src="https://pos.nvncdn.com/d0f3ca-7136/bn/20250217_VdqHBV28.gif" alt="" />

                                </div>
                                <div className="img">
                                    <img style={{ width: '100%', height: 250 }} src="https://pos.nvncdn.com/d0f3ca-7136/bn/20250113_aO4mbpcA.gif" alt="" />

                                </div>
                                <div className="img">
                                        <img style={{ width: '100%', height: 250 }} src="https://pos.nvncdn.com/d0f3ca-7136/bn/20241126_13hzQ65z.gif" alt="" />
                                    </div>
                            </Carousel>
                            <div className="product-promotion">
                                <div class="product-card">
                                    <div class="product-image">
                                        <img src="https://pos.nvncdn.com/d0f3ca-7136/bn/20230914_gr6SoMhu.png" alt="Sản phẩm 1" />
                                    </div>
                                    <div class="product-name">Sản phẩm cao cấp</div>
                                </div>
                                <div class="product-card">
                                    <div class="product-image">
                                        <img src="https://pos.nvncdn.com/d0f3ca-7136/bn/20230914_hKWhLfJd.png" alt="Sản phẩm 2" />
                                    </div>
                                    <div class="product-name">Sản phẩm từ 1.000 đồng</div>
                                </div>
                                <div class="product-card">
                                    <div class="product-image">
                                        <img src="https://pos.nvncdn.com/d0f3ca-7136/bn/20230914_xupJgWi0.png" alt="Sản phẩm 3" />
                                    </div>
                                    <div class="product-name">Phụ kiện giảm đến 50% </div>
                                </div>
                            </div>
                        </Col>
                        <Col span={5} >
                            <div class="right-banner image-promotion">
                                <a href="http://grasso.com.vn/" class="right-banner__item">
                                    <img src="https://pos.nvncdn.com/d0f3ca-7136/bn/20230915_PfrXVbI7.jpeg" alt="test" loading="lazy" class="right-banner__img" />
                                </a>
                             
                                <a href="http://grasso.com.vn/" class="right-banner__item">
                                    <img src="https://pos.nvncdn.com/d0f3ca-7136/art/20250207_T4dLptF1.jpeg" alt="test" loading="lazy" class="right-banner__img" />
                                </a>
                                <a href="http://grasso.com.vn/" class="right-banner__item">
                                    <img src="https://pos.nvncdn.com/d0f3ca-7136/art/20250116_6OeqYEnb.jpeg" alt="test" loading="lazy" class="right-banner__img" />
                                </a>
                            </div>
                        </Col>
                    </Row>
                </div >

                <div className="container-home container">
                    <img src={promotion1} className="promotion1"></img>
                </div>

                <div className="image-one" >
                    <div className="texty-demo">
                        <Texty>Giờ Vàng</Texty>
                    </div>
                    <div className="texty-title">
                        <p>Sản Phẩm <strong style={{ color: "#3b1d82" }}>Giảm Sốc</strong></p>
                    </div>

                    <div class="item" key="0">
                        <div class="event-item">
                            <div class="countdown-timer">
                                <ul class="countdown-list" data-countdown="2020/08/08">
                                    <li className="timer-item days">
                                        <strong style={{ fontSize: 18 }}>01</strong><br />
                                        <small>Ngày</small>
                                    </li>
                                    <li className="timer-item hours">
                                        <strong style={{ fontSize: 18 }}>{hours.toString().padStart(2, '0')}</strong><br />
                                        <small>Giờ</small>
                                    </li>
                                    
                                    <li className="timer-item mins">
                                        <strong style={{ fontSize: 18 }}>{minutes.toString().padStart(2, '0')}</strong><br />
                                        <small>Phút</small>
                                    </li>
                                    <li className="timer-item seco">
                                        <strong style={{ fontSize: 18 }}>{seconds.toString().padStart(2, '0')}</strong><br />
                                        <small>Giây</small>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="list-products container" key="1">
                        <Row>
                            <Col>
                                <div className="title-category">
                                    <a href="" class="title">
                                        <h3>SẢN PHẨM NỔI BẬT NHẤT</h3>
                                    </a>
                                </div>
                            </Col>
                        </Row>
                        <Row
                            gutter={{ xs: 8, sm: 16, md: 24, lg: 48 }}
                            className="row-product"
                        >
                            {productsPhone.map((item) => (
                                <Col
                                    xl={{ span: 6 }}
                                    lg={{ span: 8 }}
                                    md={{ span: 12 }}
                                    sm={{ span: 12 }}
                                    xs={{ span: 24 }}
                                    className='col-product'
                                    onClick={() => handleReadMore(item.id)}
                                    key={item.id}
                                >
                                    <div className="show-product">
                                        {item.image ? (
                                            <img
                                                className='image-product'
                                                src={item.image}
                                            />
                                        ) : (
                                            <img
                                                className='image-product'
                                                src={require('../../assets/image/NoImageAvailable.jpg')}
                                            />
                                        )}
                                        <div className='wrapper-products'>
                                            <Paragraph
                                                className='title-product'
                                                ellipsis={{ rows: 2 }}
                                            >
                                                {item.name}
                                            </Paragraph>
                                            <div className="price-amount">
                                                <Paragraph className='price-product'>
                                                    {numberWithCommas(item.promotion)} đ
                                                </Paragraph>
                                                {item.promotion !== 0 &&
                                                    <Paragraph className='price-cross'>
                                                        {numberWithCommas(item.price)} đ
                                                    </Paragraph>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <Paragraph className='badge' style={{ position: 'absolute', top: 10, left: 9 }}>
                                        <span>Giảm giá</span>
                                        <img src={triangleTopRight} />
                                    </Paragraph>
                                </Col>
                            ))}
                        </Row>
                    </div>
                </div>
                <div>

                </div>
                <div className="heading_slogan">
                    <div>Tại sao</div>
                    <div>Nên chọn chúng tôi</div>
                </div>
                <div className="card_wrap container-home container">
                    <div>
                        <Card bordered={false} className="card_suggest card_why card_slogan">
                            <img src={service6}></img>
                            <p class="card-text mt-3 fw-bold text-center">Nhanh chóng & Bảo mật <br />Vận chuyển</p>
                        </Card>
                    </div>
                    <div>
                        <Card bordered={false} className="card_suggest card_why card_slogan">
                            <img src={service7}></img>
                            <p class="card-text mt-3 fw-bold text-center">Đảm bảo 100% <br />Chính Hãng</p>
                        </Card>
                    </div>
                    <div>
                        <Card bordered={false} className="card_suggest card_why card_slogan">
                            <img src={service8}></img>
                            <p class="card-text mt-3 fw-bold text-center">24 Giờ <br /> Đổi Trả</p>
                        </Card>
                    </div>
                    <div>
                        <Card bordered={false} className="card_suggest card_why card_slogan">
                            <img src={service9}></img>
                            <p class="card-text mt-3 fw-bold text-center">Giao hàng <br /> Nhanh nhất</p>
                        </Card>
                    </div>
                    <div>
                        <Card bordered={false} className="card_suggest card_why card_slogan">
                            <img src={service10}></img>
                            <p class="card-text mt-3 fw-bold text-center">Hỗ trợ <br /> Nhanh chóng</p>
                        </Card>
                    </div>
                </div>

                <div className="image-one" >
                    <div className="texty-demo">
                        <Texty>Giờ Vàng</Texty>
                    </div>
                    <div className="texty-title">
                        <p>Sản Phẩm <strong style={{ color: "#3b1d82" }}>Giảm Sốc</strong></p>
                    </div>

                    <div className="list-products container" key="1">
                        <Row>
                            <Col>
                                <div className="title-category">
                                    <a href="" class="title">
                                        <h3>SẢN PHẨM KHUYẾN MÃI</h3>
                                    </a>
                                </div>
                            </Col>
                        </Row>
                        <Row
                            gutter={{ xs: 8, sm: 16, md: 24, lg: 48 }}
                            className="row-product"
                        >
                            {productsPC.map((item) => (
                                <Col
                                    xl={{ span: 6 }}
                                    lg={{ span: 8 }}
                                    md={{ span: 12 }}
                                    sm={{ span: 12 }}
                                    xs={{ span: 24 }}
                                    className='col-product'
                                    onClick={() => handleReadMore(item.id)}
                                    key={item.id}
                                >
                                    <div className="show-product">
                                        {item.image ? (
                                            <img
                                                className='image-product'
                                                src={item.image}
                                            />
                                        ) : (
                                            <img
                                                className='image-product'
                                                src={require('../../assets/image/NoImageAvailable.jpg')}
                                            />
                                        )}
                                        <div className='wrapper-products'>
                                            <Paragraph
                                                className='title-product'
                                                ellipsis={{ rows: 2 }}
                                            >
                                                {item.name}
                                            </Paragraph>
                                            <div className="price-amount">
                                                <Paragraph className='price-product'>
                                                    {numberWithCommas(item.promotion)} đ
                                                </Paragraph>
                                                {item.promotion !== 0 &&
                                                    <Paragraph className='price-cross'>
                                                        {numberWithCommas(item.price)} đ
                                                    </Paragraph>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <Paragraph className='badge' style={{ position: 'absolute', top: 10, left: 9 }}>
                                        <span>Giảm giá</span>
                                        <img src={triangleTopRight} />
                                    </Paragraph>
                                </Col>
                            ))}
                        </Row>
                    </div>
                </div>

                <div className="image-one" >
                    <div className="texty-demo">
                        <Texty>Giờ Vàng</Texty>
                    </div>
                    <div className="texty-title">
                        <p>Nhãn Hàng <strong style={{ color: "#3b1d82" }}>Nỗi Bật</strong></p>
                    </div>

                    <div className="list-products container" key="1">
                        <Row>
                            <Col>
                                <div className="title-category">
                                    <a href="" class="title">
                                        <h3></h3>
                                    </a>
                                </div>
                            </Col>
                        </Row>
                        <Row
                            gutter={{ xs: 8, sm: 16, md: 24, lg: 48 }}
                            className="row-product"
                        >
                            {productsTablet.map((item) => (
                                <Col
                                    xl={{ span: 6 }}
                                    lg={{ span: 8 }}
                                    md={{ span: 12 }}
                                    sm={{ span: 12 }}
                                    xs={{ span: 24 }}
                                    className='col-product'
                                    onClick={() => handleReadMore(item.id)}
                                    key={item.id}
                                >
                                    <div className="show-product">
                                        {item.image ? (
                                            <img
                                                className='image-product'
                                                src={item.image}
                                            />
                                        ) : (
                                            <img
                                                className='image-product'
                                                src={require('../../assets/image/NoImageAvailable.jpg')}
                                            />
                                        )}
                                        <div className='wrapper-products'>
                                            <Paragraph
                                                className='title-product'
                                                ellipsis={{ rows: 2 }}
                                            >
                                                {item.name}
                                            </Paragraph>
                                            <div className="price-amount">
                                                <Paragraph className='price-product'>
                                                    {numberWithCommas(item.promotion)} đ
                                                </Paragraph>
                                                {item.promotion !== 0 &&
                                                    <Paragraph className='price-cross'>
                                                        {numberWithCommas(item.price)} đ
                                                    </Paragraph>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <Paragraph className='badge' style={{ position: 'absolute', top: 10, left: 9 }}>
                                        <span>Giảm giá</span>
                                        <img src={triangleTopRight} />
                                    </Paragraph>
                                </Col>
                            ))}
                        </Row>
                    </div>
                </div>

               

                <div className="image-footer">
                    <OverPack style={{ overflow: 'hidden', height: 800, marginTop: 20 }} >
                        <TweenOne key="0" animation={{ opacity: 1 }}
                            className="code-box-shape"
                            style={{ opacity: 0 }}
                        />
                        <QueueAnim key="queue"
                            animConfig={[
                                { opacity: [1, 0], translateY: [0, 50] },
                                { opacity: [1, 0], translateY: [0, -50] }
                            ]}
                        >
                            <div className="texty-demo-footer">
                                <Texty>NHANH LÊN! </Texty>
                            </div>
                            <div className="texty-title-footer">
                                <p>Tham Dự Buổi <strong>Sản Phẩm Mới</strong></p>
                            </div>
                            <Row justify="center" style={{ marginBottom: 40, fill: "#FFFFFF" }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="71px" height="11px"> <path fill-rule="evenodd" d="M59.669,10.710 L49.164,3.306 L39.428,10.681 L29.714,3.322 L20.006,10.682 L10.295,3.322 L1.185,10.228 L-0.010,8.578 L10.295,0.765 L20.006,8.125 L29.714,0.765 L39.428,8.125 L49.122,0.781 L59.680,8.223 L69.858,1.192 L70.982,2.895 L59.669,10.710 Z"></path></svg>
                            </Row>
                            <Row justify="center">
                                <a href="#" class="footer-button" role="button">
                                    <span>ĐĂNG KÝ NGAY</span>
                                </a>
                            </Row>
                        </QueueAnim>
                    </OverPack>
                </div>
            </div>
      
            <BackTop style={{ textAlign: 'right' }} />
        </Spin >
    );
};

export default Home;
