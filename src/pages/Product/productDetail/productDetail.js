import { AuditOutlined, HomeOutlined } from '@ant-design/icons';
import { Avatar, Breadcrumb, Button, Card, Carousel, Col, Form, Input, List, Modal, Rate, Row, Select, Spin, Typography, message, notification } from "antd";
import Paragraph from "antd/lib/typography/Paragraph";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import axiosClient from "../../../apis/axiosClient";
import eventApi from "../../../apis/eventApi";
import productApi from "../../../apis/productApi";
import triangleTopRight from "../../../assets/icon/Triangle-Top-Right.svg";
import { numberWithCommas } from "../../../utils/common";

const { Meta } = Card;
const { Option } = Select;

const { Title } = Typography;
const DATE_TIME_FORMAT = "DD/MM/YYYY HH:mm";
const { TextArea } = Input;

const ProductDetail = () => {

    const [productDetail, setProductDetail] = useState([]);
    const [recommend, setRecommend] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartLength, setCartLength] = useState();
    const [form] = Form.useForm();
    let { id } = useParams();
    const history = useHistory();
    const [visible2, setVisible2] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [colorProduct, setColorProduct] = useState('');
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);

    const addCart = (product) => {
        console.log(product);
        const existingItems = JSON.parse(localStorage.getItem('cart')) || [];
        let updatedItems;
        const existingItemIndex = existingItems.findIndex((item) => item.id === product.id);
        if (existingItemIndex !== -1) {
            // If product already exists in the cart, increase its quantity
            updatedItems = existingItems.map((item, index) => {
                if (index === existingItemIndex) {
                    return {
                        ...item,
                        quantity: item.quantity + 1,
                    };
                }
                return item;
            });
        } else {
            // If product does not exist in the cart, add it to the cart
            updatedItems = [...existingItems, { ...product, quantity: 1 }];
        }
        console.log(updatedItems.length);
        setCartLength(updatedItems.length);
        localStorage.setItem('cart', JSON.stringify(updatedItems));
        localStorage.setItem('cartLength', updatedItems.length);
        window.location.reload(true)
    };

    const paymentCard = (product) => {
        console.log(product);
        const existingItems = JSON.parse(localStorage.getItem('cart')) || [];
        let updatedItems;
        const existingItemIndex = existingItems.findIndex((item) => item.id === product.id);
        if (existingItemIndex !== -1) {
            // If product already exists in the cart, increase its quantity
            updatedItems = existingItems.map((item, index) => {
                if (index === existingItemIndex) {
                    return {
                        ...item,
                        quantity: item.quantity + 1,
                    };
                }
                return item;
            });
        } else {
            // If product does not exist in the cart, add it to the cart
            updatedItems = [...existingItems, { ...product, quantity: 1 }];
        }
        console.log(updatedItems.length);
        setCartLength(updatedItems.length);
        localStorage.setItem('cart', JSON.stringify(updatedItems));
        localStorage.setItem('cartLength', updatedItems.length);
        history.push("/cart");
    }

    const handleReadMore = (id) => {
        console.log(id);
        history.push("/product-detail/" + id);
        window.location.reload();
    }

    const handleOpenModal = () => {
        setVisible2(true);
    };

    const handleCloseModal = () => {
        setVisible2(false);
    };

    const handleRateChange = (value) => {
        setRating(value);
    };

    const handleCommentChange = (e) => {
        setComment(e.target.value);
    };

    function handleClick(color) {
        // Xử lý logic khi click vào điểm màu
        console.log('Selected color:', color);
        setColorProduct(color);
        setSelectedColor(color);
    }

    const handleReviewSubmit = async () => {
        // Tạo payload để gửi đến API
        const local = localStorage.getItem("client");
        const user = JSON.parse(local);

        const payload = {
            comment,
            rating,
            userId: user.id
        };

        // Gọi API đánh giá và bình luận
        await axiosClient
            .post(`/products/${id}/comment-rating`, payload)
            .then((response => {
                console.log(response);
                // Xử lý khi gọi API thành công
                console.log('Review created');
                // Đóng modal và thực hiện các hành động khác nếu cần
                message.success('Thông báo: Bình luận thành công');
                handleList();

                handleCloseModal();
            }))
            .catch((error) => {
                // Xử lý khi gọi API thất bại
                console.error('Error creating review:', error);
                // Hiển thị thông báo lỗi cho người dùng nếu cần
                message.error('Đánh giá thất bại: ' + error);

            });
    };

    const [reviews, setProductReview] = useState([]);
    const [user, setUser] = useState(null);
    const [reviewsCount, setProductReviewCount] = useState({
        oneStar: 0,
        twoStars: 0,
        threeStars: 0,
        fourStars: 0,
        fiveStars: 0
    });
    const [avgRating, setAvgRating] = useState(null);

    const handleList = () => {
        (async () => {
            try {
                const local = localStorage.getItem("client");
                const user = JSON.parse(local);
                setUser(user);

                await productApi.getProductById(id).then((item) => {
                    setProductDetail(item.data);
                    // setProductReview(item.reviews);
                    // setProductReviewCount(item.reviewStats);
                    // setAvgRating(item.avgRating);
                    // console.log(((reviewsCount[4] || 0) / reviews.length) * 100);

                });

                await productApi.getCommentAndRatingByProductId2(id).then((item) => {
                    const uniqueComments = {};
                    const uniqueRatings = {};
                    let totalRating = 0;
                    let ratingCounts = {
                        oneStar: 0,
                        twoStars: 0,
                        threeStars: 0,
                        fourStars: 0,
                        fiveStars: 0
                    };

                    // Lọc dữ liệu để chỉ lấy một bản ghi duy nhất cho mỗi comment có thông tin giống nhau
                    item.comments.forEach((record) => {
                        const { comment_id, comment, username } = record;
                        if (!uniqueComments[comment_id]) {
                            uniqueComments[comment_id] = { comment_id, comment, username };
                        }
                    });

                    // Lọc dữ liệu để chỉ lấy một bản ghi duy nhất cho mỗi rating có thông tin giống nhau
                    item.ratings.forEach((record) => {
                        const { rating_id, rating, username } = record;
                        if (!uniqueRatings[rating_id]) {
                            uniqueRatings[rating_id] = { rating_id, rating, username };
                            totalRating += rating;

                            // Increment the count for the respective rating
                            if (rating === 1) ratingCounts.oneStar++;
                            else if (rating === 2) ratingCounts.twoStars++;
                            else if (rating === 3) ratingCounts.threeStars++;
                            else if (rating === 4) ratingCounts.fourStars++;
                            else if (rating === 5) ratingCounts.fiveStars++;
                        }
                    });

                    // Chuyển đổi objects thành mảng các bản ghi duy nhất
                    const uniqueCommentRecords = Object.values(uniqueComments);
                    const uniqueRatingRecords = Object.values(uniqueRatings);

                    // Tính toán số sao trung bình
                    const avgRating = (uniqueRatingRecords.length > 0)
                        ? (totalRating / uniqueRatingRecords.length).toFixed(1)
                        : 0;

                    // Debugging outputs
                    console.log('Rating Counts:', ratingCounts);
                    console.log('Unique Comments:', uniqueCommentRecords);
                    console.log('Unique Ratings:', uniqueRatingRecords);
                    console.log('Average Rating:', avgRating);

                    // Set state with the processed data
                    setProductReview({ comments: uniqueCommentRecords, ratings: uniqueRatingRecords });
                    setProductReviewCount(ratingCounts);
                    setAvgRating(avgRating);
                });


                await productApi.getAllProducts().then((item) => {
                    setRecommend(item.data);
                });
                setLoading(false);

            } catch (error) {
                console.log('Failed to fetch event detail:' + error);
            }
        })();
    }

    useEffect(() => {
        handleList();
        window.scrollTo(0, 0);
    }, [cartLength])

    // Assuming `reviews` is an object containing both comments and ratings
    const { comments, ratings } = reviews;

    // Merge ratings into comments based on username
    const commentsWithRatings = comments?.map((comment, index) => {
        // Get the corresponding rating by index
        const rating = ratings[index] ? ratings[index].rating : 0;
        return {
            ...comment,
            rating // Add the rating to the comment object
        };
    });
    
    console.log(commentsWithRatings)

    return (
        <div>
            <Spin spinning={false}>
                <Card className="container_details" >
                    <div className="product_detail">

                        <div style={{ marginLeft: 5, marginBottom: 10, marginTop: 10 }}>
                            <Breadcrumb>
                                <Breadcrumb.Item href="">
                                    <HomeOutlined />
                                </Breadcrumb.Item>
                                <Breadcrumb.Item href="">
                                    <AuditOutlined />
                                    <span>Sản phẩm</span>
                                </Breadcrumb.Item>
                            </Breadcrumb>
                        </div>
                        <hr></hr>
                        <div className="price">
                            <h1 className="product_name">{productDetail.name}</h1>
                            <Rate disabled value={avgRating} className="rate" />
                        </div>
                        <Row gutter={12} style={{ marginTop: 20 }}>
                            <Col span={8}>
                                {productDetail?.slide?.length > 0 ? (
                                    <Carousel autoplay className="carousel-image">
                                        {productDetail.slide.map((item) => (
                                            <div className="img" key={item}>
                                                <img style={{ width: '100%', maxHeight: 320, height: '100%' }} src={item} alt="" />
                                            </div>
                                        ))}
                                    </Carousel>
                                ) : (
                                    <Card className="card_image" bordered={false}>
                                        <img src={productDetail.image} />
                                        <div className="promotion"></div>
                                    </Card>
                                )}
                            </Col>
                            <Col span={8}>
                                <Card className="card_total" bordered={false}>
                                    <div className="price_product">{productDetail?.promotion?.toLocaleString('vi', { style: 'currency', currency: 'VND' })}</div>
                                    <div className="promotion_product">{productDetail?.price?.toLocaleString('vi', { style: 'currency', currency: 'VND' })}</div>
                                    <div class="box-product-promotion">
                                        <div class="box-product-promotion-header">
                                            <p>Ưu đãi & Khuyến mãi</p>
                                        </div>
                                        <div class="box-content-promotion">
                                            <p class="box-product-promotion-number"></p>
                                            <a>
                                                Giảm thêm 10% cho thành viên VIP
                                                <br/>
                                                Tặng voucher 100k cho đơn hàng tiếp theo
                                                <br/>
                                                Freeship cho đơn hàng từ 500k
                                                <span>(Xem chi tiết)</span>
                                            </a>
                                        </div>
                                    </div>

                                    <div className="box_cart_1">
                                        <Button type="primary" className="by" size={'large'} onClick={() => paymentCard(productDetail)}>
                                            Mua ngay
                                        </Button>
                                        <Button type="primary" className="cart" size={'large'} onClick={() => addCart(productDetail)}>
                                            Thêm vào giỏ
                                        </Button>
                                    </div>
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card className="card_total" bordered={false}>
                                    <div className='card_number'>
                                        <div>
                                            <div className='number_total'>{productDetail.categoryTotal}</div>
                                            <div className='title_total'>Chính sách mua hàng</div>
                                            <div class="policy_intuitive">
                                                <div class="policy">
                                                    <ul class="policy__list">
                                                        <li>
                                                            <div class="iconl">
                                                                <i class="icondetail-doimoi"></i>
                                                            </div>
                                                            <p>
                                                                Đổi trả miễn phí trong <b>30 ngày</b> nếu sản phẩm lỗi hoặc không vừa size
                                                                <a title="Chính sách đổi trả">
                                                                    Xem chi tiết
                                                                </a>
                                                            </p>
                                                        </li>
                                                        <li>
                                                            <div class="iconl">
                                                                <i class="icondetail-baohanh"></i>
                                                            </div>
                                                            <p>
                                                                <b>Bảo hành trọn đời</b> với các lỗi từ nhà sản xuất
                                                                <a href="/bao-hanh" target="_blank" title="Chính sách bảo hành">
                                                                    Xem chi tiết
                                                                </a>
                                                            </p>
                                                        </li>
                                                        <li>
                                                            <div class="iconl">
                                                                <i class="icondetail-sachhd"></i>
                                                            </div>
                                                            <p>
                                                                Sản phẩm bao gồm: Túi đựng cao cấp, Tem chính hãng, Hóa đơn VAT
                                                                <a href="#" >Xem hình</a>
                                                            </p>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </Card>
                            </Col>
                        </Row>
                        <div>
                            <div className='box_detail_description'>
                                <h3>Thông tin sản phẩm</h3>
                            
                                <div className="product-description" dangerouslySetInnerHTML={{ __html: productDetail.description }}></div>
                              
                            </div>
                        </div>

                        <Row gutter={12} style={{ marginTop: 20 }}>
                            <Col span={16}>
                                <Card className="card_total" bordered={false}>
                                    <div className='card_number'>
                                        <div>
                                            <div className='number_total'>{productDetail.categoryTotal}</div>
                                            <div className='title_total'>Đánh giá & nhận xét {productDetail.name}</div>
                                            <div class="review">
                                                <div class="policy-review">
                                                    <div class="policy__list">
                                                        <Row gutter={12}>
                                                            <Col span={8}>
                                                                <div className="comment_total">
                                                                    <p class="title">{avgRating}/5</p>
                                                                    <Rate disabled value={avgRating} />
                                                                    <p><strong>{reviews.length}</strong> đánh giá và nhận xét</p>
                                                                </div>
                                                            </Col>
                                                            <Col span={16}>
                                                                <div className="progress_comment">
                                                                    <div class="is-active">
                                                                        <div>5</div>
                                                                        <div>
                                                                            <svg height="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M381.2 150.3L524.9 171.5C536.8 173.2 546.8 181.6 550.6 193.1C554.4 204.7 551.3 217.3 542.7 225.9L438.5 328.1L463.1 474.7C465.1 486.7 460.2 498.9 450.2 506C440.3 513.1 427.2 514 416.5 508.3L288.1 439.8L159.8 508.3C149 514 135.9 513.1 126 506C116.1 498.9 111.1 486.7 113.2 474.7L137.8 328.1L33.58 225.9C24.97 217.3 21.91 204.7 25.69 193.1C29.46 181.6 39.43 173.2 51.42 171.5L195 150.3L259.4 17.97C264.7 6.954 275.9-.0391 288.1-.0391C300.4-.0391 311.6 6.954 316.9 17.97L381.2 150.3z"></path>
                                                                            </svg>
                                                                        </div>
                                                                    </div>
                                                                    Đánh giá 5 sao gồm có:
                                                                    <span className="review-count">{reviewsCount?.fiveStars || 0}</span>
                                                                    {/* <div class="total_comment">16 đánh giá</div> */}
                                                                </div>
                                                                <div className="progress_comment">
                                                                    <div class="is-active">
                                                                        <div>4</div>
                                                                        <div>
                                                                            <svg height="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M381.2 150.3L524.9 171.5C536.8 173.2 546.8 181.6 550.6 193.1C554.4 204.7 551.3 217.3 542.7 225.9L438.5 328.1L463.1 474.7C465.1 486.7 460.2 498.9 450.2 506C440.3 513.1 427.2 514 416.5 508.3L288.1 439.8L159.8 508.3C149 514 135.9 513.1 126 506C116.1 498.9 111.1 486.7 113.2 474.7L137.8 328.1L33.58 225.9C24.97 217.3 21.91 204.7 25.69 193.1C29.46 181.6 39.43 173.2 51.42 171.5L195 150.3L259.4 17.97C264.7 6.954 275.9-.0391 288.1-.0391C300.4-.0391 311.6 6.954 316.9 17.97L381.2 150.3z"></path>
                                                                            </svg>
                                                                        </div>
                                                                    </div>
                                                                    Đánh giá 4 sao gồm có:

                                                                    <span className="review-count">{reviewsCount?.fourStars || 0}</span>
                                                                    {/* <div class="total_comment">16 đánh giá</div> */}
                                                                </div>
                                                                <div className="progress_comment">
                                                                    <div class="is-active">
                                                                        <div>3</div>
                                                                        <div>
                                                                            <svg height="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M381.2 150.3L524.9 171.5C536.8 173.2 546.8 181.6 550.6 193.1C554.4 204.7 551.3 217.3 542.7 225.9L438.5 328.1L463.1 474.7C465.1 486.7 460.2 498.9 450.2 506C440.3 513.1 427.2 514 416.5 508.3L288.1 439.8L159.8 508.3C149 514 135.9 513.1 126 506C116.1 498.9 111.1 486.7 113.2 474.7L137.8 328.1L33.58 225.9C24.97 217.3 21.91 204.7 25.69 193.1C29.46 181.6 39.43 173.2 51.42 171.5L195 150.3L259.4 17.97C264.7 6.954 275.9-.0391 288.1-.0391C300.4-.0391 311.6 6.954 316.9 17.97L381.2 150.3z"></path>
                                                                            </svg>
                                                                        </div>
                                                                    </div>
                                                                    Đánh giá 3 sao gồm có:

                                                                    <span className="review-count">{reviewsCount?.threeStars || 0}</span>
                                                                    {/* <div class="total_comment">16 đánh giá</div> */}
                                                                </div>
                                                                <div className="progress_comment">
                                                                    <div class="is-active">
                                                                        <div>2</div>
                                                                        <div>
                                                                            <svg height="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M381.2 150.3L524.9 171.5C536.8 173.2 546.8 181.6 550.6 193.1C554.4 204.7 551.3 217.3 542.7 225.9L438.5 328.1L463.1 474.7C465.1 486.7 460.2 498.9 450.2 506C440.3 513.1 427.2 514 416.5 508.3L288.1 439.8L159.8 508.3C149 514 135.9 513.1 126 506C116.1 498.9 111.1 486.7 113.2 474.7L137.8 328.1L33.58 225.9C24.97 217.3 21.91 204.7 25.69 193.1C29.46 181.6 39.43 173.2 51.42 171.5L195 150.3L259.4 17.97C264.7 6.954 275.9-.0391 288.1-.0391C300.4-.0391 311.6 6.954 316.9 17.97L381.2 150.3z"></path>
                                                                            </svg>
                                                                        </div>
                                                                    </div>
                                                                    Đánh giá 2 sao gồm có:

                                                                    <span className="review-count">{reviewsCount?.twoStars || 0}</span>
                                                                    {/* <div class="total_comment">16 đánh giá</div> */}
                                                                </div>
                                                                <div className="progress_comment">
                                                                    <div class="is-active">
                                                                        <div>1</div>
                                                                        <div>
                                                                            <svg height="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M381.2 150.3L524.9 171.5C536.8 173.2 546.8 181.6 550.6 193.1C554.4 204.7 551.3 217.3 542.7 225.9L438.5 328.1L463.1 474.7C465.1 486.7 460.2 498.9 450.2 506C440.3 513.1 427.2 514 416.5 508.3L288.1 439.8L159.8 508.3C149 514 135.9 513.1 126 506C116.1 498.9 111.1 486.7 113.2 474.7L137.8 328.1L33.58 225.9C24.97 217.3 21.91 204.7 25.69 193.1C29.46 181.6 39.43 173.2 51.42 171.5L195 150.3L259.4 17.97C264.7 6.954 275.9-.0391 288.1-.0391C300.4-.0391 311.6 6.954 316.9 17.97L381.2 150.3z"></path>
                                                                            </svg>
                                                                        </div>
                                                                    </div>
                                                                    Đánh giá 1 sao gồm có:

                                                                    <span className="review-count">{reviewsCount?.oneStar || 0}</span>
                                                                    {/* <div class="total_comment">16 đánh giá</div> */}
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                </div>
                                            </div>
                                            <p class="subtitle">Bạn đánh giá sao sản phẩm này</p>
                                            <div class="group_comment">
                                                <Button type="primary" className="button_comment" size={'large'} onClick={handleOpenModal} disabled={!user}>
                                                    Đánh giá ngay
                                                </Button>
                                            </div>
                                            <Modal
                                                visible={visible2}
                                                onCancel={handleCloseModal}
                                                onOk={handleReviewSubmit}
                                                okText="Gửi đánh giá"
                                                cancelText="Hủy"
                                            >
                                                <h2>Đánh giá và bình luận</h2>
                                                <Rate value={rating} onChange={handleRateChange} style={{ marginBottom: 10 }} />
                                                <TextArea
                                                    placeholder="Nhập bình luận của bạn"
                                                    value={comment}
                                                    onChange={handleCommentChange}
                                                ></TextArea>
                                            </Modal>
                                        </div>
                                        <div style={{ marginTop: 40 }}>
                                            <Card>
                                                <div style={{ padding: 20 }}>
                                                    <List
                                                        itemLayout="horizontal"
                                                        dataSource={commentsWithRatings}
                                                        renderItem={(item, index) => (
                                                            <List.Item>
                                                                <List.Item.Meta
                                                                    avatar={<Avatar src={`https://xsgames.co/randomusers/avatar.php?g=pixel&key=1`} />}
                                                                    title={
                                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                            <a href="https://ant.design" style={{ marginRight: '8px' }}>
                                                                                {item?.username}
                                                                            </a>
                                                                            <Rate allowHalf disabled defaultValue={item.rating} />
                                                                        </div>

                                                                    }
                                                                    description={item?.comment}
                                                                />
                                                            </List.Item>
                                                        )}
                                                    />
                                                </div>
                                            </Card>
                                        </div>
                                    </div>

                                </Card>
                            </Col>
                        </Row>
                        <div></div>


                        <div className="price" style={{ marginTop: 40 }}>
                            <h1 className="product_name">Sản phẩm bạn có thể quan tâm</h1>
                        </div>
                        <Row
                            style={{ marginTop: 40 }}
                            gutter={{ xs: 8, sm: 16, md: 24, lg: 48 }}
                            className="row-product"
                        >
                            {recommend.slice(0, 4)?.map((item) => (
                                <Col
                                    xl={{ span: 6 }}
                                    lg={{ span: 6 }}
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
                                                src={require('../../../assets/image/NoImageAvailable.jpg')}
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
                </Card>
            </Spin>
        </div >
    );
};

export default ProductDetail;
