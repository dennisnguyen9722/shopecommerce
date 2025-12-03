// utils/orderPointsHook.ts
import Customer, { ICustomer } from '../models/Customer'
import {
  calculatePointsFromOrder,
  awardPoints,
  calculateTier
} from './loyaltyUtils'

/**
 * Award loyalty points when order is completed
 * Call this function when order status changes to 'completed' or 'delivered'
 */
export async function awardPointsForOrder(
  orderId: string,
  customerEmail: string,
  orderTotal: number
): Promise<void> {
  try {
    // Find customer by email
    const customer = (await Customer.findOne({
      email: customerEmail.toLowerCase()
    })) as ICustomer | null

    if (!customer) {
      console.log(`Customer not found for order ${orderId}`)
      return
    }

    // Check if customer has a registered account (password is not null)
    if (!customer.password) {
      console.log(`Customer ${customerEmail} is guest, not awarding points`)
      return
    }

    // Calculate points based on tier
    const pointsToAward = calculatePointsFromOrder(
      orderTotal,
      customer.loyaltyTier
    )

    if (pointsToAward <= 0) {
      console.log(`No points to award for order ${orderId}`)
      return
    }

    // Award points
    // 🛠️ FIX: Ép kiểu (customer as any) để truy cập _id
    await awardPoints(
      (customer as any)._id.toString(),
      pointsToAward,
      'earn',
      `Mua hàng - Đơn #${orderId}`,
      {
        orderId,
        orderTotal,
        multiplier: customer.loyaltyTier
      }
    )

    console.log(
      `✅ Awarded ${pointsToAward} points to ${customerEmail} for order ${orderId}`
    )

    // Update customer stats
    customer.totalSpent += orderTotal
    customer.ordersCount += 1

    // Recalculate tier based on new total spent
    const newTier = calculateTier(customer.totalSpent)
    const oldTier = customer.loyaltyTier

    if (newTier !== oldTier) {
      customer.loyaltyTier = newTier
      console.log(
        `🎉 Customer ${customerEmail} upgraded from ${oldTier} to ${newTier}`
      )

      // TODO: Send email notification about tier upgrade
      // await sendTierUpgradeEmail(customer.email, oldTier, newTier)
    }

    await customer.save()
  } catch (error) {
    console.error('Error awarding points for order:', error)
    throw error
  }
}

/**
 * Refund loyalty points when order is cancelled or refunded
 */
export async function refundPointsForOrder(
  orderId: string,
  customerEmail: string,
  orderTotal: number
): Promise<void> {
  try {
    const customer = (await Customer.findOne({
      email: customerEmail.toLowerCase()
    })) as ICustomer | null

    if (!customer || !customer.password) {
      return
    }

    // Calculate points that were awarded
    const pointsToRefund = calculatePointsFromOrder(
      orderTotal,
      customer.loyaltyTier
    )

    if (pointsToRefund <= 0) {
      return
    }

    // Check if customer has enough points to refund
    if (customer.loyaltyPoints < pointsToRefund) {
      console.log(
        `Customer ${customerEmail} doesn't have enough points to refund`
      )
      // Set points to 0 instead of negative
      customer.loyaltyPoints = 0
    } else {
      customer.loyaltyPoints -= pointsToRefund
    }

    console.log(
      `♻️ Refunded ${pointsToRefund} points from ${customerEmail} for cancelled order ${orderId}`
    )

    // Update customer stats
    customer.totalSpent = Math.max(0, customer.totalSpent - orderTotal)
    customer.ordersCount = Math.max(0, customer.ordersCount - 1)

    // Recalculate tier
    customer.loyaltyTier = calculateTier(customer.totalSpent)

    await customer.save()
  } catch (error) {
    console.error('Error refunding points for order:', error)
    throw error
  }
}
