const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2'); 
const app = express();
const _CONST = require('./app/config/constant')

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

require('./app/models/createTables');

// Thay đổi kết nối cơ sở dữ liệu
const db = mysql.createConnection({
    host: 'localhost', 
    user: 'root',
    password: 'root',
    database: 'trendywear'
});

db.connect((err) => {
    if (err) {
        console.error('MySQL connection error:', err);
    } else {
        console.log('Connected to MySQL.');
    }
});

const authRoute = require('./app/routers/auth');
const userRoute = require('./app/routers/user');
const paymentRoute = require('./app/routers/paypal');
const categoryRoute = require('./app/routers/category');
const newsRouter = require('./app/routers/newsRouter');
const productRoute = require('./app/routers/product');
const supplierRouter = require('./app/routers/supplier');
const productRouter = require('./app/routers/product');
const orderRoute = require('./app/routers/order');

app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/payment', paymentRoute);
app.use('/api/category', categoryRoute);
app.use('/api/news', newsRouter);
app.use('/api/product', productRoute);
app.use('/api/supplier', supplierRouter);
app.use('/api/products', productRouter);
app.use('/api/order', orderRoute);

const PORT = process.env.PORT || _CONST.PORT;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
