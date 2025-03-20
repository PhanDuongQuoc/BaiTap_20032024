var express = require('express');
var router = express.Router();
let categoryModel = require('../schemas/category');
const jwt = require('jsonwebtoken');

function verifyToken(req) {
  const token = req.headers.authorization;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    return decoded; // Trả về user nếu token hợp lệ
  } catch (error) {
    return null;
  }
}

// ✅ GET: Không yêu cầu đăng nhập
router.get('/', async function(req, res) {
  let categories = await categoryModel.find({});
  res.status(200).json({ success: true, data: categories });
});

router.get('/:id', async function(req, res) {
  try {
    let category = await categoryModel.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Không tìm thấy danh mục!" });

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ✅ POST: Chỉ MOD & ADMIN có quyền thêm danh mục
router.post('/', async function(req, res) {
  let user = verifyToken(req);
  if (!user || (user.role !== 'mod' && user.role !== 'admin')) {
    return res.status(403).json({ success: false, message: "Bạn không có quyền!" });
  }

  try {
    let newCategory = new categoryModel({ name: req.body.name });
    await newCategory.save();
    res.status(200).json({ success: true, data: newCategory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ✅ PUT: Chỉ MOD & ADMIN có quyền chỉnh sửa danh mục
router.put('/:id', async function(req, res) {
  let user = verifyToken(req);
  if (!user || (user.role !== 'mod' && user.role !== 'admin')) {
    return res.status(403).json({ success: false, message: "Bạn không có quyền!" });
  }

  try {
    let updatedCategory = await categoryModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCategory) return res.status(404).json({ success: false, message: "Không tìm thấy danh mục!" });

    res.status(200).json({ success: true, data: updatedCategory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ✅ DELETE: Chỉ ADMIN có quyền xóa danh mục
router.delete('/:id', async function(req, res) {
  let user = verifyToken(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ success: false, message: "Bạn không có quyền!" });
  }

  try {
    let deletedCategory = await categoryModel.findByIdAndDelete(req.params.id);
    if (!deletedCategory) return res.status(404).json({ success: false, message: "Không tìm thấy danh mục!" });

    res.status(200).json({ success: true, message: "Đã xóa danh mục thành công!" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
