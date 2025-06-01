const db = require('../config/db');

const createTables = async () => {
    try {
        // Tạo bảng "users" nếu chưa tồn tại
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(255),
                username VARCHAR(255),
                password VARCHAR(255) NOT NULL,
                role VARCHAR(255),
                status VARCHAR(255) DEFAULT 'noactive',
                image VARCHAR(255) DEFAULT 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        console.log('Table "users" created or already exists.');

        // Tạo bảng "password_reset_tokens" nếu chưa tồn tại
        await db.execute(`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            token VARCHAR(255) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        `);

        console.log('Table "password_reset_tokens" created or already exists.');


        // Tạo bảng "categories" nếu chưa tồn tại
        await db.execute(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                description TEXT,
                slug VARCHAR(255) UNIQUE NOT NULL,
                image VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
            `);

        console.log('Table "categories" created or already exists.');

        // Tạo bảng "news" nếu chưa tồn tại
        await db.execute(`
               CREATE TABLE IF NOT EXISTS news (
                   id INT AUTO_INCREMENT PRIMARY KEY,
                   name VARCHAR(255) NOT NULL,
                   description TEXT,
                   image VARCHAR(255),
                   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
               )
           `);

        console.log('Table "news" created or already exists.');

        // Tạo bảng "suppliers" nếu chưa tồn tại
        await db.execute(`
         CREATE TABLE IF NOT EXISTS suppliers (
             id INT AUTO_INCREMENT PRIMARY KEY,
             name VARCHAR(255) NOT NULL,
             description TEXT,
             image VARCHAR(255),
             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
             updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
         )
     `);

        console.log('Table "suppliers" created or already exists.');

        // Tạo bảng "products" nếu chưa tồn tại
        await db.execute(`
        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            promotion DECIMAL(10, 2),
            quantity INT DEFAULT 0,
            description TEXT,
            image VARCHAR(255),
            category_id INT,
            supplier_id INT, -- Thêm trường supplier_id
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id),
            FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
        )
     `);
     console.log('Table "products" created or already exists.');

        // Tạo bảng "orders" nếu chưa tồn tại
        await db.execute(`
      CREATE TABLE IF NOT EXISTS orders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          address VARCHAR(255) NOT NULL,
          billing DECIMAL(10, 2) NOT NULL,
          description TEXT,
          status VARCHAR(255) DEFAULT 'pending',
          products JSON NOT NULL,
          order_total DECIMAL(10, 2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
      )
   `);

        console.log('Table "orders" created or already exists.');


    } catch (error) {
        console.error('Error creating tables:', error);
    }
};

createTables();
