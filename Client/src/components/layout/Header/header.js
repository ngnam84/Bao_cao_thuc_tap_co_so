
import React, { useEffect, useState } from 'react';
import styles from './header.module.css';
import userApi from "../../../apis/userApi";
import logo from "../../../assets/image/logo-dtu.png";
import DropdownAvatar from "../../DropdownMenu/dropdownMenu";
import { useHistory, NavLink } from "react-router-dom";
import { Layout, Avatar, Badge, Row, Col, List, Popover, Modal, Drawer, Select } from 'antd';
import { BellOutlined, NotificationTwoTone, BarsOutlined, ShoppingOutlined } from '@ant-design/icons';
import axiosClient from "../../../apis/axiosClient";

const { Option } = Select;

const { Header } = Layout;

function Topbar() {

  const [countNotification, setCountNotification] = useState(0);
  const [notification, setNotification] = useState([]);
  const [visible, setVisible] = useState(false);
  const [visiblePopover, setVisiblePopover] = useState(false);
  const [titleNotification, setTitleNotification] = useState('');
  const [contentNotification, setContentNotification] = useState('');
  const [visibleDrawer, setVisibleDrawer] = useState(false);
  const [userData, setUserData] = useState([]);
  const [cart, setCart] = useState();

  const history = useHistory();

  const handleLink = (link) => {
    setVisibleDrawer(false);
    history.push(link);
  }

  const content = (
    <div>
      {notification.map((values, index) => {
        return (
          <div>
            <List.Item style={{ padding: 0, margin: 0 }}>
              <List.Item.Meta
                style={{ width: 250, margin: 0 }}
                avatar={<NotificationTwoTone style={{ fontSize: '20px', color: '#08c' }} />}
                title={<a onClick={() => handleNotification(values.content, values.title)}>{values.title}</a>}
                description={<p className={styles.fixLine} dangerouslySetInnerHTML={{ __html: values.content }}></p>}
              />
            </List.Item>
          </div>
        )
      })}
    </div>
  );

  const handleNotification = (valuesContent, valuesTitile) => {
    setVisible(true);
    setVisiblePopover(visible !== visible)
    setContentNotification(valuesContent);
    setTitleNotification(valuesTitile);
  }

  const handleVisibleChange = (visible) => {
    setVisiblePopover(visible);
  };

  const handleOk = () => {
    setVisible(false);
  }

  const showDrawer = () => {
    setVisibleDrawer(true);
  };

  const onClose = () => {
    setVisibleDrawer(false);
  };

  const [selectedOption, setSelectedOption] = useState(null);
  const [selectOptions, setSelectOptions] = useState([
    
  ]);

  const handleSelectChange = async (value) => {
    setSelectedOption(value);
    console.log(value);
    history.push("/product-detail/"+value);
    window.location.reload();
  };

  const updateSelectOptions = (newOptions) => {
    const updatedOptions = newOptions.map((option) => ({
      value: option.id,
      label: option.name + " - " + option?.promotion,
    }));

    setSelectOptions(updatedOptions);
  };

  const handleSearch = async (value) => {
    try {
      const response = await axiosClient.get(`/products/search?query=${value}`);

      updateSelectOptions(response.data);
    } catch (error) {
      console.error('Lỗi khi gọi API:', error);
    }

  };

  useEffect(() => {
    (async () => {
      try {
        const local = localStorage.getItem("user");
        const user = JSON.parse(local);
        const cart = localStorage.getItem('cartLength');
        console.log(cart);
        setCart(cart);
        setUserData(user);
      } catch (error) {
        console.log('Failed to fetch profile user:' + error);
      }
    })();
  }, [])

  return (
    <Header
      style={{ background: "#DB2323" }}
      className={styles.header}
    >
      <div className="">
      <NavLink className={styles.navlink} to="/home" activeStyle>
      <div style={{ display: 'flex', alignItems: 'center', height: 55, cursor: 'pointer' }} onClick={() => handleLink("/home")}>
            <span style={{ color: 'white', fontSize: 24, fontWeight: 'bold', letterSpacing: '1px' }}>TRENDY</span>
            <span style={{ color: '#FFD700', fontSize: 24, fontWeight: 'bold', letterSpacing: '1px' }}>WEAR</span>
          </div>  
        </NavLink>    
      </div>
      <BarsOutlined className={styles.bars} onClick={showDrawer} />
      <div className={styles.navmenu} style={{ marginLeft: 15 }}>
        <NavLink className={styles.navlink} to="/home" activeStyle>
          Trang chủ
        </NavLink>
        <NavLink className={styles.navlink} to="/product-list/1" activeStyle>
          Sản phẩm
        </NavLink>
        <NavLink className={styles.navlink} to="/news" activeStyle>
          Tin tức
        </NavLink>
        <NavLink className={styles.navlink} to="/contact" activeStyle>
          Liên hệ
        </NavLink>
        <Select
          showSearch
          style={{ width: 270 }}
          placeholder="Bạn tìm gì..."
          optionFilterProp="children"
          filterOption={(input, option) => (option?.label ?? '').includes(input)}
          filterSort={(optionA, optionB) =>
            (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
          }
          options={selectOptions}
          onChange={handleSelectChange}
          onSearch={handleSearch}

        />
      </div>
      <div className={styles.logBtn}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer', justifyContent: 'center' }}>
      <Row style={{ display: 'flex', alignItems: 'center' }}>
        <Col style={{ display: 'flex', alignItems: 'center' }} onClick={() => handleLink("/cart")}>
        <ShoppingOutlined style={{ fontSize: '16px', color: '#FFFFFF', marginRight: 4 }} />
          <span style={{ padding: 0,marginTop: 2, margin: 0, color: '#FFFFFF', marginRight: 6 }}>
             {cart} Giỏ hàng
          </span>
        </Col>
        <Col>
          <Badge style={{ marginLeft: 10 }} overflowCount={9999} count={userData?.score > 0 ? userData?.score : 0} />
        </Col>
      </Row>
      <Row style={{ display: 'flex', alignItems: 'center' }}>
        <span className={styles.container} style={{ marginRight: 15 }}>
          <Popover
            placement="bottomRight"
            title="Thông Báo"
            content={content}
            visible={visiblePopover}
            onVisibleChange={handleVisibleChange}
            trigger="click"
          >
            <Badge count={countNotification}>
              <Avatar
                style={{ backgroundColor: "#FFFFFF", marginLeft: 5, marginRight: 5, cursor: "pointer" }}
                icon={<BellOutlined style={{ fontSize: '20px', color: '#000000' }} />}
              />
            </Badge>
          </Popover>
        </span>
      </Row>
      <Row style={{ display: 'flex', alignItems: 'center' }}>
        <DropdownAvatar key="avatar" />
      </Row>
      <Modal
        title={titleNotification}
        visible={visible}
        onOk={handleOk}
        onCancel={handleOk}
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        <p dangerouslySetInnerHTML={{ __html: contentNotification }}></p>
      </Modal>
    </div>
      </div>
      <Drawer title="Menu" placement="right" onClose={onClose} open={visibleDrawer}>
        <div className={styles.navmenu2}>
          <NavLink className={styles.navlink2} to="/home" activeStyle>
            Trang chủ
          </NavLink>
          <NavLink className={styles.navlink2} to="/event" activeStyle>
            Sản phẩm
          </NavLink>
          <NavLink className={styles.navlink2} to="/about" activeStyle>
            Về chúng tôi
          </NavLink>
          <NavLink className={styles.navlink2} to="/contact" activeStyle>
            Liên hệ
          </NavLink>
          <div className={styles.navlink2}>
            <div style={{ display: 'flex', cursor: 'pointer' }} onClick={() => handleLink("/cart")}>
              <span style={{ marginRight: 10, padding: 0, margin: 0, color: 'black' }}>
                <ShoppingOutlined style={{ fontSize: '18px', color: 'black' }} /> 
                {cart} Giỏ hàng
                </span>
              <Badge style={{ marginLeft: 10 }} overflowCount={9999} count={userData?.score > 0 ? userData?.score : 0} />
            </div>
          </div>
          <div className={styles.navlink2}>
            <DropdownAvatar key="avatar" />
          </div>
        </div>
      </Drawer>
    </Header >
  );
}

export default Topbar;