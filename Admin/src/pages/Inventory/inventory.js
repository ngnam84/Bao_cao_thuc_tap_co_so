import {
    DeleteOutlined,
    EditOutlined,
    FormOutlined,
    HomeOutlined,
    PlusOutlined
} from '@ant-design/icons';
import { PageHeader } from '@ant-design/pro-layout';
import {
    BackTop,
    Breadcrumb,
    Button,
    Col,
    Drawer,
    Form,
    Input,
    Popconfirm,
    Row,
    Select,
    Space,
    Spin,
    Table,
    Tag,
    notification
} from 'antd';
import React, { useEffect, useState } from 'react';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import axiosClient from '../../apis/axiosClient';
import categoryApi from '../../apis/categoryApi';
import productApi from "../../apis/productsApi";
import supplierApi from '../../apis/supplierApi';
import uploadFileApi from '../../apis/uploadFileApi';
import "./inventory.css";

const { Option } = Select;

const Inventory = () => {
    const [product, setProduct] = useState([]);
    const [category, setCategoryList] = useState([]);
    const [openModalCreate, setOpenModalCreate] = useState(false);
    const [openModalUpdate, setOpenModalUpdate] = useState(false);
    const [image, setImage] = useState();

    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();
    const [form2] = Form.useForm();
    const [file, setUploadFile] = useState();
    const [currentPage, setCurrentPage] = useState(1);
    const [description, setDescription] = useState();
    const [total, setTotalList] = useState(false);
    const [id, setId] = useState();
    const [visible, setVisible] = useState(false);
    const [supplier, SetSupplier] = useState(null);

    const handleChangeImage = async (e) => {
        setLoading(true);
        const response = await uploadFileApi.uploadFile(e);
        if (response) {
            setUploadFile(response);
        }
        setLoading(false);
    }

    const handleOkUser = async (values) => {
        setLoading(true);
        try {

            const categoryList = {
                "name": values.name,
                "description": description,
                "price": values.price,
                "category": values.category,
                "image": file,
                "promotion": values.promotion,
                "quantity": values.quantity,
                "supplier_id": values.supplier_id,

            };

            return axiosClient.post("/product", categoryList).then(response => {
                if (response === undefined) {
                    notification["error"]({
                        message: `Thông báo`,
                        description: 'Tạo sản phẩm thất bại',
                    });
                } else {
                    notification["success"]({
                        message: `Thông báo`,
                        description: 'Tạo sản phẩm thành công',
                    });
                    setOpenModalCreate(false);
                    handleProductList();
                }
            });
        } catch (error) {
            throw error;
        }
    };

    const handleUpdateProduct = async (values) => {
        setLoading(true);
        try {

            const categoryList = {
                "name": values.name,
                "description": description,
                "price": values.price,
                "category": values.category,
                "image": file,
                "promotion": values.promotion,
                "quantity": values.quantity,
                "supplier_id": values.supplier_id,

            };

            return axiosClient.put("/product/" + id, categoryList).then(response => {
                if (response === undefined) {
                    notification["error"]({
                        message: `Thông báo`,
                        description: 'Chỉnh sửa sản phẩm thất bại',
                    });
                    setLoading(false);
                } else {
                    notification["success"]({
                        message: `Thông báo`,
                        description: 'Chỉnh sửa sản phẩm thành công',
                    });
                    setOpenModalUpdate(false);
                    handleProductList();
                    setLoading(false);
                }
            });

        } catch (error) {
            throw error;
        }
    };


    const handleCancel = (type) => {
        if (type === "create") {
            setOpenModalCreate(false);
        } else {
            setOpenModalUpdate(false)
        }
        console.log('Clicked cancel button');
    };

    const handleProductList = async () => {
        try {
            await productApi.getAllProducts({ page: 1, limit: 10000 }).then((res) => {
                console.log(res);
                setProduct(res.data);
                setLoading(false);
            });
            ;
        } catch (error) {
            console.log('Failed to fetch product list:' + error);
        };
    };

    const handleDeleteCategory = async (id) => {
        setLoading(true);
        try {
            await productApi.deleteProduct(id).then(response => {
                if (response === undefined) {
                    notification["error"]({
                        message: `Thông báo`,
                        description:
                            'Xóa sản phẩm thất bại',

                    });
                    setLoading(false);
                }
                else {
                    notification["success"]({
                        message: `Thông báo`,
                        description:
                            'Xóa sản phẩm thành công',

                    });
                    setCurrentPage(1);
                    handleProductList();
                    setLoading(false);
                }
            }
            );

        } catch (error) {
            console.log('Failed to fetch event list:' + error);
        }
    }

    const handleProductEdit = (id) => {
        setOpenModalUpdate(true);
        (async () => {
            try {
                const response = await productApi.getProductById(id);
                console.log(response);
                setId(id);
                form2.setFieldsValue({
                    name: response.data.name,
                    price: response.data.price,
                    category: response?.data.category_id,
                    quantity: response.data.quantity,
                    promotion: response.data.promotion,
                    supplier_id: response?.data.supplier_id,

                });
                console.log(form2);
                setDescription(response.data.description);
                setLoading(false);
            } catch (error) {
                throw error;
            }
        })();
    }

    const handleFilter = async (name) => {
        try {
            const res = await productApi.searchProducts(name.target.value);
            setTotalList(res.totalDocs)
            setProduct(res.data);
        } catch (error) {
            console.log('search to fetch category list:' + error);
        }
    }
    const handleChange = (content) => {
        console.log(content);
        setDescription(content);
    }

    const columns = [
        {
            title: 'ID',
            key: 'index',
            render: (text, record, index) => index + 1,
        },
        {
            title: 'Ảnh',
            dataIndex: 'image',
            key: 'image',
            render: (image) => <img src={image} style={{ height: 80 }} />,
            width: '10%'
        },
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <a>{text}</a>,
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Giá gốc',
            key: 'price',
            dataIndex: 'price',
            render: (slugs) => (
                <span>
                    <div>{slugs?.toLocaleString('vi', { style: 'currency', currency: 'VND' })}</div>
                </span>
            ),
        },
        {
            title: 'Giá giảm',
            key: 'promotion',
            dataIndex: 'promotion',
            render: (promotion) => (
                <span>
                    <Tag color="geekblue" key={promotion}>
                        {promotion?.toLocaleString('vi', { style: 'currency', currency: 'VND' })}
                    </Tag>
                </span>
            ),
        },
        {
            title: 'Danh mục',
            dataIndex: 'category_name',
            key: 'category_name',
            render: (res) => (
                <span>
                    {res}
                </span>
            ),
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: 'supplier_name',
            key: 'supplier_name',
            render: (res) => (
                <span>
                    {res}
                </span>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <div>
                    <Row>
                        <div className='groupButton'>
                            <Button
                                size="small"
                                icon={<EditOutlined />}
                                style={{ width: 150, borderRadius: 15, height: 30, marginTop: 5 }}
                                onClick={() => handleProductEdit(record.id)}
                            >{"Chỉnh sửa"}
                            </Button>
                            <div
                                style={{ marginTop: 5 }}>
                                <Popconfirm
                                    title="Bạn có chắc chắn xóa sản phẩm này?"
                                    onConfirm={() => handleDeleteCategory(record.id)}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button
                                        size="small"
                                        icon={<DeleteOutlined />}
                                        style={{ width: 150, borderRadius: 15, height: 30 }}
                                    >{"Xóa"}
                                    </Button>
                                </Popconfirm>
                            </div>
                        </div>
                    </Row>
                </div >
            ),
        },
    ];

    const handleOpen = () => {
        setVisible(true);
    };

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            form.resetFields();
            handleOkUser(values);
            setVisible(false);
        });
    };


    useEffect(() => {
        (async () => {
            try {
                await productApi.getAllProducts({ page: 1, limit: 10000 }).then((res) => {
                    console.log(res);
                    setTotalList(res.totalDocs)
                    setProduct(res.data);
                    setLoading(false);
                });

                await categoryApi.getListCategory({ page: 1, limit: 10000 }).then((res) => {
                    console.log(res);
                    setCategoryList(res.categories);
                    setLoading(false);
                });

                await supplierApi.getListSuppliers({ page: 1, limit: 10000 }).then((res) => {
                    console.log(res);
                    SetSupplier(res);
                    setLoading(false);
                });

                ;
            } catch (error) {
                console.log('Failed to fetch event list:' + error);
            }
        })();
    }, [])
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
                                <FormOutlined />
                                <span>Quản lý kho hàng</span>
                            </Breadcrumb.Item>
                        </Breadcrumb>
                    </div>

                    <div style={{ marginTop: 20 }}>
                        <div id="my__event_container__list">
                            <PageHeader
                                subTitle=""
                                style={{ fontSize: 14 }}
                            >
                                <Row>
                                    <Col span="18">
                                        <Input
                                            placeholder="Tìm kiếm"
                                            allowClear
                                            onChange={handleFilter}
                                            style={{ width: 300 }}
                                        />
                                    </Col>
                                    <Col span="6">
                                        <Row justify="end">
                                            <Space>
                                                <Button onClick={handleOpen} icon={<PlusOutlined />} style={{ marginLeft: 10 }} >Tạo sản phẩm</Button>
                                            </Space>
                                        </Row>
                                    </Col>
                                </Row>

                            </PageHeader>
                        </div>
                    </div>

                    <div style={{ marginTop: 30 }}>
                        <Table columns={columns} dataSource={product} pagination={{ position: ['bottomCenter'] }} />
                    </div>
                </div>

                <Drawer
                    title="Tạo sản phẩm mới"
                    visible={visible}
                    onClose={() => setVisible(false)}
                    width={1000}
                    footer={
                        <div
                            style={{
                                textAlign: 'right',
                            }}
                        >
                            <Button onClick={() => setVisible(false)} style={{ marginRight: 8 }}>
                                Hủy
                            </Button>
                            <Button onClick={handleSubmit} type="primary">
                                Hoàn thành
                            </Button>
                        </div>
                    }
                >
                    <Form
                        form={form}
                        name="eventCreate"
                        layout="vertical"
                        initialValues={{
                            residence: ['zhejiang', 'hangzhou', 'xihu'],
                            prefix: '86',
                        }}
                        scrollToFirstError
                    >
                        <Form.Item
                            name="name"
                            label="Tên"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập tên!',
                                },
                            ]}
                            style={{ marginBottom: 10 }}
                        >
                            <Input placeholder="Tên" />
                        </Form.Item>

                        <Form.Item
                            name="quantity"
                            label="Số lượng"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập số lượng!',
                                },
                            ]}
                            style={{ marginBottom: 10 }}
                        >
                            <Input placeholder="Số lượng" type="number" />
                        </Form.Item>

                        <Form.Item
                            name="price"
                            label="Giá gốc"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập giá gốc!',
                                },
                            ]}
                            style={{ marginBottom: 10 }}
                        >
                            <Input placeholder="Giá gốc" type="number" />
                        </Form.Item>

                        <Form.Item
                            name="promotion"
                            label="Giá giảm"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập giá giảm!',
                                },
                            ]}
                            style={{ marginBottom: 10 }}
                        >
                            <Input placeholder="Giá giảm" type="number" />
                        </Form.Item>

                        <Form.Item
                            name="image"
                            label="Ảnh"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập chọn ảnh!',
                                },
                            ]}
                            style={{ marginBottom: 10 }}
                        >
                            <input type="file" onChange={handleChangeImage}
                                id="avatar" name="file"
                                accept="image/png, image/jpeg" />
                        </Form.Item>

                        <Form.Item
                            name="category"
                            label="Danh mục"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn danh mục!',
                                },
                            ]}
                            style={{ marginBottom: 10 }}
                        >
                            <Select style={{ width: '100%' }} tokenSeparators={[',']} placeholder="Danh mục" showSearch filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }>
                                {category.map((item, index) => {
                                    return (
                                        <Option value={item.id} key={index} >
                                            {item.name}
                                        </Option>
                                    )
                                })}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="supplier_id"
                            label="Nhà cung cấp"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn nhà cung cấp!',
                                },
                            ]}
                            style={{ marginBottom: 10 }}
                        >
                            <Select style={{ width: '100%' }} tokenSeparators={[',']} placeholder="Danh mục" showSearch filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }>
                                {supplier?.map((item, index) => {
                                    return (
                                        <Option value={item.id} key={index} >
                                            {item.name}
                                        </Option>
                                    )
                                })}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="Mô tả"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập mô tả!',
                                },
                            ]}
                            style={{ marginBottom: 10 }}
                        >

                            <SunEditor
                                lang="en"
                                placeholder="Content"
                                onChange={handleChange}
                                setOptions={{
                                    buttonList: [
                                        ["undo", "redo"],
                                        ["font", "fontSize"],
                                        // ['paragraphStyle', 'blockquote'],
                                        [
                                            "bold",
                                            "underline",
                                            "italic",
                                            "strike",
                                            "subscript",
                                            "superscript"
                                        ],
                                        ["fontColor", "hiliteColor"],
                                        ["align", "list", "lineHeight"],
                                        ["outdent", "indent"],

                                        ["table", "horizontalRule", "link", "image", "video"],
                                        // ['math'] //You must add the 'katex' library at options to use the 'math' plugin.
                                        // ['imageGallery'], // You must add the "imageGalleryUrl".
                                        // ["fullScreen", "showBlocks", "codeView"],
                                        ["preview", "print"],
                                        ["removeFormat"]

                                        // ['save', 'template'],
                                        // '/', Line break
                                    ],
                                    fontSize: [
                                        8, 10, 14, 18, 24,
                                    ], // Or Array of button list, eg. [['font', 'align'], ['image']]
                                    defaultTag: "div",
                                    minHeight: "500px",
                                    showPathLabel: false,
                                    attributesWhitelist: {
                                        all: "style",
                                        table: "cellpadding|width|cellspacing|height|style",
                                        tr: "valign|style",
                                        td: "styleinsert|height|style",
                                        img: "title|alt|src|style"
                                    }
                                }}
                            />
                        </Form.Item>

                    </Form>
                </Drawer>


                <Drawer
                    title="Chỉnh sửa sản phẩm"
                    visible={openModalUpdate}
                    onClose={() => handleCancel("update")}
                    width={1000}
                    footer={
                        <div
                            style={{
                                textAlign: 'right',
                            }}
                        >
                            <Button onClick={() => {
                                form2
                                    .validateFields()
                                    .then((values) => {
                                        form2.resetFields();
                                        handleUpdateProduct(values);
                                    })
                                    .catch((info) => {
                                        console.log('Validate Failed:', info);
                                    });
                            }} type="primary" style={{ marginRight: 8 }}>
                                Hoàn thành
                            </Button>
                            <Button onClick={() => handleCancel("update")}>
                                Hủy
                            </Button>
                        </div>
                    }
                >
                    <Form
                        form={form2}
                        name="eventCreate"
                        layout="vertical"
                        initialValues={{
                            residence: ['zhejiang', 'hangzhou', 'xihu'],
                            prefix: '86',
                        }}
                        scrollToFirstError
                    >
                        <Form.Item
                            name="name"
                            label="Tên"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập tên!',
                                },
                            ]}
                            style={{ marginBottom: 10 }}
                        >
                            <Input placeholder="Tên" />
                        </Form.Item>

                        <Form.Item
                            name="quantity"
                            label="Số lượng"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập số lượng!',
                                },
                            ]}
                            style={{ marginBottom: 10 }}
                        >
                            <Input placeholder="Số lượng" type="number" />
                        </Form.Item>

                        <Form.Item
                            name="price"
                            label="Giá gốc"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập giá gốc!',
                                },
                            ]}
                            style={{ marginBottom: 10 }}
                        >
                            <Input placeholder="Giá gốc" />
                        </Form.Item>

                        <Form.Item
                            name="promotion"
                            label="Giá giảm"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập giá giảm!',
                                },
                            ]}
                            style={{ marginBottom: 10 }}
                        >
                            <Input placeholder="Giá giảm" />
                        </Form.Item>

                        <Form.Item
                            name="image"
                            label="Ảnh sản phẩm"
                            style={{ marginBottom: 10 }}
                        >
                            <input type="file" onChange={handleChangeImage}
                                id="avatar" name="file"
                                accept="image/png, image/jpeg" />
                        </Form.Item>

                        <Form.Item
                            name="category"
                            label="Danh mục"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn danh mục!',
                                },
                            ]}
                            style={{ marginBottom: 10 }}
                        >
                            <Select style={{ width: '100%' }} tokenSeparators={[',']} placeholder="Danh mục" showSearch filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }>
                                {category.map((item, index) => {
                                    return (
                                        <Option value={item?.id} key={index} >
                                            {item?.name}
                                        </Option>
                                    )
                                })}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="supplier_id"
                            label="Nhà cung cấp"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn nhà cung cấp!',
                                },
                            ]}
                            style={{ marginBottom: 10 }}
                        >
                            <Select style={{ width: '100%' }} tokenSeparators={[',']} placeholder="Danh mục" showSearch filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }>
                                {supplier?.map((item, index) => {
                                    return (
                                        <Option value={item.id} key={index} >
                                            {item.name}
                                        </Option>
                                    )
                                })}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="Mô tả"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập mô tả!',
                                },
                            ]}
                            style={{ marginBottom: 10 }}
                        >

                            <SunEditor
                                lang="en"
                                placeholder="Content"
                                onChange={handleChange}
                                setContents={description}
                                setOptions={{
                                    buttonList: [
                                        ["undo", "redo"],
                                        ["font", "fontSize"],
                                        // ['paragraphStyle', 'blockquote'],
                                        [
                                            "bold",
                                            "underline",
                                            "italic",
                                            "strike",
                                            "subscript",
                                            "superscript"
                                        ],
                                        ["fontColor", "hiliteColor"],
                                        ["align", "list", "lineHeight"],
                                        ["outdent", "indent"],

                                        ["table", "horizontalRule", "link", "image", "video"],
                                        // ['math'] //You must add the 'katex' library at options to use the 'math' plugin.
                                        // ['imageGallery'], // You must add the "imageGalleryUrl".
                                        // ["fullScreen", "showBlocks", "codeView"],
                                        ["preview", "print"],
                                        ["removeFormat"]

                                        // ['save', 'template'],
                                        // '/', Line break
                                    ],
                                    fontSize: [
                                        8, 10, 14, 18, 24,
                                    ], // Or Array of button list, eg. [['font', 'align'], ['image']]
                                    defaultTag: "div",
                                    minHeight: "500px",
                                    showPathLabel: false,
                                    attributesWhitelist: {
                                        all: "style",
                                        table: "cellpadding|width|cellspacing|height|style",
                                        tr: "valign|style",
                                        td: "styleinsert|height|style",
                                        img: "title|alt|src|style"
                                    }
                                }}
                            />
                        </Form.Item>

                    </Form>
                </Drawer>

                <BackTop style={{ textAlign: 'right' }} />
            </Spin>
        </div >
    )
}

export default Inventory;