const { Queue } = require('bullmq')
const connection = require('../config/redis')

const geofenceAlertQueue = new Queue('geofence-alerts', { connection })
const notificationQueue  = new Queue('notifications',   { connection })

module.exports = { geofenceAlertQueue, notificationQueue }