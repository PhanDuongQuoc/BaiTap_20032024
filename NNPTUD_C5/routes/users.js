var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
var { CreateSuccessRes, CreateErrorRes } = require('../utils/ResHandler');
let { check_authentication, check_authorization } = require('../utils/check_auth');
let constants = require('../utils/constants');

/* ✅ GET all users - Chỉ `mod` hoặc `admin` */
router.get('/', check_authentication, check_authorization(constants.MOD_PERMISSION), async function (req, res, next) {
  try {
    let users = await userController.GetAllUser();
    CreateSuccessRes(res, 200, users);
  } catch (error) {
    next(error);
  }
});

/* ✅ GET user by ID - Chỉ `mod` hoặc `admin` (Không lấy ID của chính mình) */
router.get('/:id', check_authentication, async function (req, res, next) {
  try {
    if (req.user.id === req.params.id) {
      return CreateErrorRes(res, 403, "Bạn không thể xem thông tin của chính mình!");
    }

    let user = await userController.GetUserById(req.params.id);
    CreateSuccessRes(res, 200, user);
  } catch (error) {
    CreateErrorRes(res, 404, error);
  }
});

/* ✅ POST (Create user) - Chỉ `admin` */
router.post('/', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
  try {
    let { username, password, email, role } = req.body;
    let newUser = await userController.CreateAnUser(username, password, email, role);
    CreateSuccessRes(res, 201, newUser);
  } catch (error) {
    next(error);
  }
});

/* ✅ PUT (Update user) - Chỉ `admin` */
router.put('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
  try {
    let updateUser = await userController.UpdateUser(req.params.id, req.body);
    CreateSuccessRes(res, 200, updateUser);
  } catch (error) {
    next(error);
  }
});

/* ✅ DELETE (Remove user) - Chỉ `admin` */
router.delete('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
  try {
    let deletedUser = await userController.DeleteUser(req.params.id);
    CreateSuccessRes(res, 200, { message: "User đã được xóa thành công!" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
