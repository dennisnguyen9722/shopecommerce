// routes/admin/rewards.ts
import express from 'express'
import Reward from '../../models/Reward'
import UserReward from '../../models/UserReward'
import { protect } from '../../middleware/auth'
import { requirePermissions } from '../../middleware/requirePermissions'

const router = express.Router()

const CAN_MANAGE = requirePermissions('manage_rewards')

// GET /admin/rewards - Danh sách rewards
router.get('/', protect, CAN_MANAGE, async (req, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      search = '',
      type,
      isActive,
      sort = 'order'
    } = req.query

    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 20
    const skip = (pageNum - 1) * limitNum

    const filter: any = {}

    // Fix: Type assertion cho search
    if (search && typeof search === 'string' && search.trim() !== '') {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ]
    }

    if (type) {
      filter.type = type
    }

    if (isActive !== undefined && isActive !== '') {
      filter.isActive = isActive === 'true'
    }

    const sortOption: any = {
      order: { order: 1 },
      points: { pointsRequired: 1 },
      newest: { createdAt: -1 }
    }[sort as string] || { order: 1 }

    const [items, total] = await Promise.all([
      Reward.find(filter).sort(sortOption).skip(skip).limit(limitNum).lean(),
      Reward.countDocuments(filter)
    ])

    // Get redemption stats for each reward
    const itemsWithStats = await Promise.all(
      items.map(async (item) => {
        const redemptionCount = await UserReward.countDocuments({
          rewardId: item._id
        })
        return { ...item, redemptionCount }
      })
    )

    res.json({
      items: itemsWithStats,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /admin/rewards/:id - Chi tiết reward
router.get('/:id', protect, CAN_MANAGE, async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id).lean()
    if (!reward) {
      return res.status(404).json({ error: 'Không tìm thấy reward' })
    }

    // Get redemption history
    const redemptions = await UserReward.find({ rewardId: req.params.id })
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    res.json({ reward, redemptions })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// POST /admin/rewards - Tạo reward mới
router.post('/', protect, CAN_MANAGE, async (req, res) => {
  try {
    const reward = await Reward.create(req.body)
    res.status(201).json(reward)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /admin/rewards/:id - Cập nhật reward
router.put('/:id', protect, CAN_MANAGE, async (req, res) => {
  try {
    const updated = await Reward.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

    if (!updated) {
      return res.status(404).json({ error: 'Không tìm thấy reward' })
    }

    res.json(updated)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /admin/rewards/:id - Xóa reward (soft delete)
router.delete('/:id', protect, CAN_MANAGE, async (req, res) => {
  try {
    const updated = await Reward.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    )

    if (!updated) {
      return res.status(404).json({ error: 'Không tìm thấy reward' })
    }

    res.json({ message: 'Đã vô hiệu hóa reward', reward: updated })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /admin/rewards/:id/toggle - Bật/tắt reward
router.put('/:id/toggle', protect, CAN_MANAGE, async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id)
    if (!reward) {
      return res.status(404).json({ error: 'Không tìm thấy reward' })
    }

    reward.isActive = !reward.isActive
    await reward.save()

    res.json(reward)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /admin/rewards/stats/overview - Thống kê tổng quan
router.get('/stats/overview', protect, CAN_MANAGE, async (_req, res) => {
  try {
    const [totalRewards, activeRewards, totalRedemptions, recentRedemptions] =
      await Promise.all([
        Reward.countDocuments(),
        Reward.countDocuments({ isActive: true }),
        UserReward.countDocuments(),
        UserReward.find()
          .populate('customerId', 'name email')
          .populate('rewardId', 'name pointsRequired')
          .sort({ createdAt: -1 })
          .limit(10)
          .lean()
      ])

    // Top redeemed rewards
    const topRewards = await UserReward.aggregate([
      {
        $group: {
          _id: '$rewardId',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'rewards',
          localField: '_id',
          foreignField: '_id',
          as: 'reward'
        }
      },
      { $unwind: '$reward' }
    ])

    res.json({
      totalRewards,
      activeRewards,
      totalRedemptions,
      topRewards,
      recentRedemptions
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
