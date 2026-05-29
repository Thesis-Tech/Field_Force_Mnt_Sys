const notificationService = require('../services/notification.service')
const { sendSuccess }      = require('../utils/response')

const getMy = async (req, res, next) => {
  try {
    const { page, limit } = req.query
    const data = await notificationService.getMyNotifications(req.user.id, {
      page: +page || 1, limit: +limit || 20
    })
    return sendSuccess(res, data)
  } catch (err) { next(err) }
}

const unreadCount = async (req, res, next) => {
  try {
    const data = await notificationService.getUnreadCount(req.user.id)
    return sendSuccess(res, data)
  } catch (err) { next(err) }
}

const markRead = async (req, res, next) => {
  try {
    const notif = await notificationService.markAsRead(req.params.id, req.user.id)
    return sendSuccess(res, notif, 'Marked as read')
  } catch (err) { next(err) }
}

const markAllRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.id)
    return sendSuccess(res, result, 'All marked as read')
  } catch (err) { next(err) }
}

const remove = async (req, res, next) => {
  try {
    await notificationService.deleteNotification(req.params.id, req.user.id)
    return sendSuccess(res, null, 'Notification deleted')
  } catch (err) { next(err) }
}

module.exports = { getMy, unreadCount, markRead, markAllRead, remove }