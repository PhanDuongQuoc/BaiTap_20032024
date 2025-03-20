var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
var { CreateSuccessRes, CreateErrorRes } = require('../utils/ResHandler');
let jwt = require('jsonwebtoken');
let constants = require('../utils/constants');
let { check_authentication } = require('../utils/check_auth');
let bcrypt = require('bcrypt');

/* Áp dụng middleware yêu cầu đăng nhập cho tất cả route */
router.use(check_authentication);

/* Đăng nhập (Không yêu cầu đăng nhập) */
router.post('/login', async function (req, res, next) {
    try {
        let { username, password } = req.body;
        let result = await userController.Login(username, password);
        let token = jwt.sign(
            { id: result._id, expire: new Date(Date.now() + 24 * 3600 * 1000) },
            constants.SECRET_KEY
        );
        CreateSuccessRes(res, 200, token);
    } catch (error) {
        next(error);
    }
});

/* Đăng ký (Không yêu cầu đăng nhập) */
router.post('/signup', async function (req, res, next) {
    try {
        let { username, password, email } = req.body;
        let result = await userController.CreateAnUser(username, password, email, 'user');
        let token = jwt.sign(
            { id: result._id, expire: new Date(Date.now() + 24 * 3600 * 1000) },
            constants.SECRET_KEY
        );
        CreateSuccessRes(res, 200, token);
    } catch (error) {
        next(error);
    }
});

/* Bỏ middleware auth cho /me và /changepassword */
router.get('/me', async function (req, res, next) {
    CreateSuccessRes(res, 200, req.user);
});

router.post('/changepassword', async function (req, res, next) {
    try {
        let { oldpassword, newpassword } = req.body;
        if (bcrypt.compareSync(oldpassword, req.user.password)) {
            req.user.password = bcrypt.hashSync(newpassword, 10); // Mã hóa mật khẩu mới
            await req.user.save();
            CreateSuccessRes(res, 200, { message: 'Password updated successfully' });
        } else {
            return res.status(400).json({ success: false, message: 'Old password is incorrect' });
        }
    } catch (error) {
        next(error);
    }
});

/* Các route khác yêu cầu đăng nhập */
module.exports = router;
