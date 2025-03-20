var express = require('express');
var router = express.Router();
let roleController = require('../controllers/roles');
var { CreateSuccessRes, CreateErrorRes } = require('../utils/ResHandler');
const { isAdmin } = require('../middlewares/authMiddleware'); // Thêm middleware kiểm tra quyền

/* GET roles - Không yêu cầu quyền */
router.get('/', async function (req, res, next) {
    let users = await roleController.GetAllRole();
    CreateSuccessRes(res, 200, users);
});

router.get('/:id', async function (req, res, next) {
    try {
        let user = await roleController.GetRoleById(req.params.id);
        CreateSuccessRes(res, 200, user);
    } catch (error) {
        next(error);
    }
});

/* POST (Create) - Yêu cầu quyền admin */
router.post('/', isAdmin, async function (req, res, next) {
    try {
        let newRole = await roleController.CreateRole(req.body.name);
        CreateSuccessRes(res, 200, newRole);
    } catch (error) {
        next(error);
    }
});

/* PUT (Update) - Yêu cầu quyền admin */
router.put('/:id', isAdmin, async function (req, res, next) {
    try {
        let updatedRole = await roleController.UpdateRole(req.params.id, req.body.name);
        CreateSuccessRes(res, 200, updatedRole);
    } catch (error) {
        next(error);
    }
});

/* DELETE - Yêu cầu quyền admin */
router.delete('/:id', isAdmin, async function (req, res, next) {
    try {
        await roleController.DeleteRole(req.params.id);
        CreateSuccessRes(res, 200, { message: 'Role deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
