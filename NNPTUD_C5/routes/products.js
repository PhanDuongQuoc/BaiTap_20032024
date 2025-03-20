var express = require('express');
var router = express.Router();
let productModel = require('../schemas/product');
let CategoryModel = require('../schemas/category');
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
  let products = await productModel.find().populate("category");
  res.status(200).json({ success: true, data: products });
});

// ✅ POST: Chỉ MOD & ADMIN có quyền thêm sản phẩm
router.post('/', async function(req, res) {
  let user = verifyToken(req);
  if (!user || (user.role !== 'mod' && user.role !== 'admin')) {
    return res.status(403).json({ success: false, message: "Bạn không có quyền!" });
  }

  try {
    let cate = await CategoryModel.findOne({ name: req.body.category });
    if (!cate) return res.status(404).json({ success: false, message: "Danh mục không tồn tại!" });

    let newProduct = new productModel({ ...req.body, category: cate._id });
    await newProduct.save();
    res.status(200).json({ success: true, data: newProduct });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ✅ PUT: Chỉ MOD & ADMIN có quyền chỉnh sửa
router.put('/:id', async function(req, res) {
  let user = verifyToken(req);
  if (!user || (user.role !== 'mod' && user.role !== 'admin')) {
    return res.status(403).json({ success: false, message: "Bạn không có quyền!" });
  }

  try {
    let updateObj = { ...req.body };
    if (req.body.category) {
      let cate = await CategoryModel.findOne({ name: req.body.category });
      if (!cate) return res.status(404).json({ success: false, message: "Danh mục không tồn tại!" });
      updateObj.category = cate._id;
    }

    let updatedProduct = await productModel.findByIdAndUpdate(req.params.id, updateObj, { new: true });
    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ✅ DELETE: Chỉ ADMIN có quyền xóa
router.delete('/:id', async function(req, res) {
  let user = verifyToken(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ success: false, message: "Bạn không có quyền!" });
  }

  try {
    let product = await productModel.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm!" });

    let deletedProduct = await productModel.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    res.status(200).json({ success: true, data: deletedProduct });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
