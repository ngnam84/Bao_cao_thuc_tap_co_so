import {
    ContactsTwoTone,
    DashboardOutlined,
    EnvironmentTwoTone,
    HomeOutlined,
    NotificationTwoTone,
    DollarCircleTwoTone,
    ShoppingTwoTone
} from '@ant-design/icons';
import {
    BackTop,
    Breadcrumb,
    Button,
    Card,
    Col,
    Row,
    Spin
} from 'antd';
import React, { useEffect, useState } from 'react';
import newsApi from '../../apis/newsApi';
import userApi from '../../apis/userApi';
import productApi from '../../apis/productsApi';
import supplierApi from '../../apis/supplierApi';
import orderApi from '../../apis/orderApi'; // Import orderApi
import "./dashBoard.css";
import ExcelJS from 'exceljs';

const DashBoard = () => {
    const [statisticList, setStatisticList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotalList] = useState();
    const [product, setProduct] = useState(null);
    const [supplier, setSupplier] = useState(null);
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [bestSellingProducts, setBestSellingProducts] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                await newsApi.getListNews().then((res) => {
                    console.log(res);
                    setTotalList(res);
                });

                await productApi.getAllProducts().then((res) => {
                    console.log(res);
                    setProduct(res);
                });

                await supplierApi.getListSuppliers().then((res) => {
                    console.log(res);
                    setSupplier(res);
                });

                await userApi.listUserByAdmin().then((res) => {
                    console.log(res);
                    setStatisticList(res.data);
                });

                // Gọi API lấy doanh thu theo tháng
                await orderApi.getMonthlyRevenue().then((res) => {
                    console.log('Monthly Revenue:', res);
                    setMonthlyRevenue(res.data);
                });

                // Gọi API lấy sản phẩm bán chạy theo tháng
                await orderApi.getBestSellingProducts().then((res) => {
                    console.log('Best Selling Products:', res);
                    setBestSellingProducts(res.data);
                });

                setLoading(false);
            } catch (error) {
                console.log('Failed to fetch data:', error);
                setLoading(false);
            }
        })();
    }, []);

    const formatCurrency = (amount) => {
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    // Function to export monthly revenue to Excel
    const exportMonthlyRevenueToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Monthly Revenue');

        // Add header row
        worksheet.addRow(['Tháng', 'Doanh thu']);

        // Add data rows
        monthlyRevenue.forEach(month => {
            worksheet.addRow([month.month, formatCurrency(Number(month.total_revenue) || 0)]);
        });

        // Generate Excel file and download
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'monthly_revenue.xlsx';
        a.click();
        URL.revokeObjectURL(url);
    };

     // Function to export best selling products to Excel
     const exportBestSellingProductsToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Best Selling Products');

        // Add header row
        worksheet.addRow(['Tháng', 'Tên sản phẩm', 'Số lượng bán']);

        // Add data rows
        bestSellingProducts.forEach(monthData => {
            monthData.products.forEach(product => {
                worksheet.addRow([monthData.month, product.name, product.total_quantity]);
            });
        });

        // Generate Excel file and download
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'best_selling_products.xlsx';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <Spin spinning={loading}>
                <div className='container'>
                    <div style={{ marginTop: 20 }}>
                        <Breadcrumb>
                            <Breadcrumb.Item href="">
                                <HomeOutlined />
                            </Breadcrumb.Item>
                            <Breadcrumb.Item href="">
                                <DashboardOutlined />
                                <span>DashBoard</span>
                            </Breadcrumb.Item>
                        </Breadcrumb>
                    </div>
                    <Row gutter={12} style={{ marginTop: 20 }}>
                        <Col span={6}>
                            <Card className="card_total" bordered={false}>
                                <div className='card_number'>
                                    <div>
                                        <div className='number_total'>{statisticList?.length}</div>
                                        <div className='title_total'>Số thành viên</div>
                                    </div>
                                    <div>
                                        <ContactsTwoTone style={{ fontSize: 48 }} />
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card className="card_total" bordered={false}>
                                <div className='card_number'>
                                    <div>
                                        <div className='number_total'>{total?.length}</div>
                                        <div className='title_total'>Tổng bài đăng</div>
                                    </div>
                                    <div>
                                        <NotificationTwoTone style={{ fontSize: 48 }} />
                                    </div>
                                </div>
                            </Card>
                        </Col>

                        <Col span={6}>
                            <Card className="card_total" bordered={false}>
                                <div className='card_number'>
                                    <div>
                                        <div className='number_total'>{product?.data?.length || 0} </div>
                                        <div className='title_total'>Tổng sản phẩm</div>
                                    </div>
                                    <div>
                                        <EnvironmentTwoTone style={{ fontSize: 48 }} />
                                    </div>
                                </div>
                            </Card>
                        </Col>

                        <Col span={6}>
                            <Card className="card_total" bordered={false}>
                                <div className='card_number'>
                                    <div>
                                        <div className='number_total'>{supplier?.length || 0} </div>
                                        <div className='title_total'>Tổng nhà cung cấp</div>
                                    </div>
                                    <div>
                                        <EnvironmentTwoTone style={{ fontSize: 48 }} />
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    {/* Hiển thị thống kê doanh thu theo tháng */}
                    <Row gutter={12} style={{ marginTop: 20 }}>
                        <Col span={12}>
                            <Card className="card_total" bordered={false}>
                                <div className='card_number'>
                                    <div>
                                        <div className='number_total'>
                                            {monthlyRevenue?.length ?
                                                `${formatCurrency(monthlyRevenue.reduce((acc, month) => {
                                                    const revenue = parseFloat(month.total_revenue) || 0; // Chuyển đổi thành số hoặc sử dụng 0 nếu không hợp lệ
                                                    return acc + revenue;
                                                }, 0))}`
                                                : '0'}
                                        </div>
                                        <div className='title_total'>Doanh thu theo tháng</div>
                                    </div>
                                    <div>
                                        <DollarCircleTwoTone style={{ fontSize: 48 }} />
                                    </div>
                                </div>
                                <div>
                                    <ul>
                                        {monthlyRevenue?.map((month) => (
                                            <li key={month?.month}>{`${month?.month}: ${formatCurrency(Number(month?.total_revenue) || 0)}`}</li>
                                        ))}
                                    </ul>
                                </div>
                                <Button type="primary" onClick={exportMonthlyRevenueToExcel}>Xuất Excel</Button>
                            </Card>
                        </Col>

                        {/* Hiển thị thống kê các mặt hàng bán chạy */}
                        <Col span={12}>
                            <Card className="card_total" bordered={false}>
                                <div className='card_number'>
                                    <div>
                                        <div className='number_total'>{bestSellingProducts?.length}</div>
                                        <div className='title_total'>Sản phẩm bán chạy</div>
                                    </div>
                                    <div>
                                        <ShoppingTwoTone style={{ fontSize: 48 }} />
                                    </div>
                                </div>
                                <div>
                                    <ul>
                                        {bestSellingProducts?.map((monthData) => (
                                            <li key={monthData.month}>
                                                <h3>{monthData.month}</h3>
                                                <ul>
                                                    {monthData.products.map((product) => (
                                                        <li key={product.name}>
                                                            {`${product.name}: ${product.total_quantity} sold`}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Button type="primary" onClick={exportBestSellingProductsToExcel}>Xuất Excel</Button>
                            </Card>
                        </Col>

                    </Row>
                </div>
                <BackTop style={{ textAlign: 'right' }} />
            </Spin>
        </div >
    );
}

export default DashBoard;
