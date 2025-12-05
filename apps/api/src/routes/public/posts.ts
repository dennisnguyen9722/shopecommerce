import express, { Request, Response } from 'express'
// Import đúng 3 model bạn vừa gửi
import BlogPost from '../../models/BlogPost'
import BlogCategory from '../../models/BlogCategory'
import BlogTag from '../../models/BlogTag'
// Import model User để populate author (nếu chưa có file User thì bỏ dòng này và bỏ populate author)
import User from '../../models/User'

const router = express.Router()

// ======================================================
// 1. LẤY DANH SÁCH BÀI VIẾT (Filter, Pagination)
// ======================================================
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, tag, limit, exclude } = req.query

    // 1. Chỉ lấy bài đã 'published'
    const filter: any = { status: 'published' }

    // 2. Lọc theo danh mục (nếu có)
    if (category) {
      // Vì categories là mảng ObjectId, ta tìm bài viết có chứa category ID này
      filter.categories = category
    }

    // 3. Lọc theo tag (nếu có)
    if (tag) {
      filter.tags = tag
    }

    // 4. Loại trừ bài viết (dùng cho phần "Bài viết liên quan")
    if (exclude) {
      filter._id = { $ne: exclude }
    }

    const posts = await BlogPost.find(filter)
      .populate('categories', 'name slug') // Lấy tên danh mục
      .populate('tags', 'name slug') // Lấy tên tag
      .populate('author', 'name avatar') // Lấy tên tác giả (nếu có model User)
      .sort({ publishedAt: -1, createdAt: -1 }) // Ưu tiên ngày publish
      .limit(Number(limit) || 10)
      .lean()

    res.json(posts)
  } catch (err) {
    console.error('Error fetching posts:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ======================================================
// 2. LẤY CHI TIẾT BÀI VIẾT (Theo Slug)
// ======================================================
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params

    // Tìm bài viết theo slug và phải là 'published'
    const post = await BlogPost.findOne({
      slug,
      status: 'published'
    })
      .populate('categories', 'name slug')
      .populate('tags', 'name slug')
      .populate('author', 'name avatar')
      .lean()

    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    // (Optional) Tính toán sơ bộ thời gian đọc (giả sử 200 từ/phút)
    // Vì model bạn không có trường readTime nên ta tính "ké" ở đây trả về cho frontend
    const wordCount = post.content ? post.content.split(/\s+/).length : 0
    const readTime = Math.ceil(wordCount / 200)

    // Trả về dữ liệu kèm readTime tính toán
    res.json({ ...post, readTime })
  } catch (err) {
    console.error('Error fetching post detail:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
