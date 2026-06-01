const leaveService = require('../services/leave.service')
const { sendSuccess, sendError } = require('../utils/response')

const apply = async (req, res, next) => {
  try {
    const leave = await leaveService.applyLeave(req.user.id, req.body)
    return sendSuccess(res, leave, 'Leave request submitted', 201)
  } catch (err) { next(err) }
}

const approve = async (req, res, next) => {
  try {
    const leave = await leaveService.approveLeave(req.params.id, req.user.id, req.body.approvalNote)
    return sendSuccess(res, leave, 'Leave approved')
  } catch (err) { next(err) }
}

const reject = async (req, res, next) => {
  try {
    const leave = await leaveService.rejectLeave(req.params.id, req.user.id, req.body.approvalNote)
    return sendSuccess(res, leave, 'Leave rejected')
  } catch (err) { next(err) }
}

const cancel = async (req, res, next) => {
  try {
    await leaveService.cancelLeave(req.params.id, req.user.id)
    return sendSuccess(res, null, 'Leave cancelled')
  } catch (err) { next(err) }
}

const myLeaves = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query
    const data = await leaveService.getMyLeaves(req.user.id, {
      page: +page || 1,
      limit: +limit || 10,
      status,
    })
    return sendSuccess(res, data)
  } catch (err) { next(err) }
}

const teamLeaves = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query
    const data = await leaveService.getTeamLeaves(req.user.id, {
      page: +page || 1,
      limit: +limit || 10,
      status,
    })
    return sendSuccess(res, data)
  } catch (err) { next(err) }
}

const allLeaves = async (req, res, next) => {
  try {
    const { page, limit, status, userId } = req.query
    const data = await leaveService.getAllLeaves({ page: +page || 1, limit: +limit || 10, status, userId })
    return sendSuccess(res, data)
  } catch (err) { next(err) }
}

const balance = async (req, res, next) => {
  try {
    const data = await leaveService.getLeaveBalance(req.user.id)
    return sendSuccess(res, data)
  } catch (err) { next(err) }
}

module.exports = { apply, approve, reject, cancel, myLeaves, teamLeaves, allLeaves, balance }