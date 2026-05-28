const prisma = require('../config/prisma')

// ─── Create a notification record ─────────────────────────────────
const createNotification = async ({ userId, title, body, type, referenceId }) => {
  return prisma.notification.create({
    data: { userId, title, body, type, referenceId }
  })
}

// ─── Create notification for multiple users at once ───────────────
const createBulkNotifications = async (userIds, { title, body, type, referenceId }) => {
  const data = userIds.map(userId => ({ userId, title, body, type, referenceId }))
  return prisma.notification.createMany({ data })
}

// ─── Get my notifications ──────────────────────────────────────────
const getMyNotifications = async (userId, { page = 1, limit = 20 } = {}) => {
  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where:   { userId },
      orderBy: { createdAt: 'desc' },
      skip:    (page - 1) * limit,
      take:    limit,
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ])
  return { notifications, total, unreadCount, page, limit }
}

// ─── Get unread count only ────────────────────────────────────────
const getUnreadCount = async (userId) => {
  const count = await prisma.notification.count({
    where: { userId, isRead: false }
  })
  return { unreadCount: count }
}

// ─── Mark one as read ─────────────────────────────────────────────
const markAsRead = async (notificationId, userId) => {
  const notif = await prisma.notification.findUnique({
    where: { id: notificationId }
  })
  if (!notif) {
    const err = new Error('Notification not found'); err.statusCode = 404; throw err
  }
  if (notif.userId !== userId) {
    const err = new Error('Not authorised'); err.statusCode = 403; throw err
  }
  return prisma.notification.update({
    where: { id: notificationId },
    data:  { isRead: true }
  })
}

// ─── Mark all as read ─────────────────────────────────────────────
const markAllAsRead = async (userId) => {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data:  { isRead: true },
  })
  return { updated: result.count }
}

// ─── Delete one ───────────────────────────────────────────────────
const deleteNotification = async (notificationId, userId) => {
  const notif = await prisma.notification.findUnique({
    where: { id: notificationId }
  })
  if (!notif) {
    const err = new Error('Notification not found'); err.statusCode = 404; throw err
  }
  if (notif.userId !== userId) {
    const err = new Error('Not authorised'); err.statusCode = 403; throw err
  }
  return prisma.notification.delete({ where: { id: notificationId } })
}

module.exports = {
  createNotification,
  createBulkNotifications,
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
}