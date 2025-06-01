import React, { useEffect, useState } from 'react';
import { Avatar, Dropdown, Row } from 'antd';
import { Menu } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useHistory } from "react-router-dom";
import styles from '../layout/Header/header.module.css'

function DropdownAvatar() {

  const [userData, setUserData] = useState(null);
  const [isLogin, setIsLogin] = useState(false);

  let history = useHistory();

  const Logout = async () => {
    localStorage.clear();
    history.push("/");
    window.location.reload(false);
  }
  
  const Login = () => {
    history.push("/login");
  }

  const handleRouter = (link) => {
    history.push(link);
  }
  
  // Hàm để lấy dữ liệu người dùng từ localStorage
  const getUserDataFromLocalStorage = () => {
    try {
      const local = localStorage.getItem("client");
      if (local) {
        const user = JSON.parse(local);
        console.log('DropdownAvatar - User data from localStorage:', user);
        setUserData(user);
        setIsLogin(true);
      } else {
        setUserData(null);
        setIsLogin(false);
      }
    } catch (error) {
      console.error('Failed to fetch profile user:', error);
      setUserData(null);
      setIsLogin(false);
    }
  };

  // Sử dụng useEffect để lấy dữ liệu khi component mount
  useEffect(() => {
    getUserDataFromLocalStorage();
    
    // Thêm event listener để lắng nghe thay đổi trong localStorage
    const handleStorageChange = (e) => {
      if (e.key === "client") {
        console.log('localStorage changed, updating avatar...');
        getUserDataFromLocalStorage();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Thiết lập interval để kiểm tra localStorage định kỳ
    const intervalId = setInterval(() => {
      getUserDataFromLocalStorage();
    }, 2000); // Kiểm tra mỗi 2 giây
    
    // Cleanup function
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [])

  const avatarPrivate = (
    <Menu>
      <Menu.Item icon={<UserOutlined />}  >
        <a target="_blank" rel="noopener noreferrer" onClick={() => handleRouter("/profile")}>
          Trang cá nhân
        </a>
      </Menu.Item>
      <Menu.Item icon={<ShoppingCartOutlined />}  >
        <a target="_blank" rel="noopener noreferrer" onClick={() => handleRouter("/cart-history")}>
          Quản lý đơn hàng
        </a>
      </Menu.Item>
      <Menu.Item icon={<SettingOutlined />} >
      <a target="_blank" rel="noopener noreferrer" onClick={() => handleRouter("/change-password/"+ userData.id)}>
         Thay đổi mật khẩu
        </a>
      </Menu.Item>
      <Menu.Item key="3" icon={<LogoutOutlined />} onClick={Logout}  >
        <a target="_blank" rel="noopener noreferrer" >
          Đăng xuất
        </a>
      </Menu.Item>
    </Menu>
  );

  return (
    <div>
      {isLogin ?
        <Dropdown key="avatar" placement="bottomCenter" overlay={avatarPrivate} arrow>
          <Row
            style={{
              paddingLeft: 5, paddingRight: 8, cursor: 'pointer'
            }}
            className={styles.container}
          >

            <div style={{ display: 'flex', alignItems: "center", justifyContent: "center" }}>
              <div style={{ paddingRight: 10 }}>
                <Avatar
                  style={{
                    outline: 'none',
                  }}
                  src={userData ? userData.image : "https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png"}
                />
              </div>
              <p style={{ padding: 0, margin: 0, textTransform: 'capitalize', color: "#FFFFFF" }} >
                {userData?.username}
              </p>
            </div>
          </Row>
        </Dropdown>
        :
        <span
          className={styles.loginSpan}
          onClick={Login}
        >
          Đăng nhập
        </span>
      }
    </div>
  );
};

export default DropdownAvatar;