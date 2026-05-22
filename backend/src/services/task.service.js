const prisma = require('../config/prisma');
const cloudinary = require('../config/cloudinary');
const { emitToUser, emitToOrgAdmins } = require('../config/socket');
const { sendPushNotification } = require('../utils/notification');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/errors');
const logger = require('../config/logger');

/**
 * Upload multiple task completion images to Cloudinary
 */
const uploadCompletionImages = async (imageBufferArray) => {
  const uploadedUrls = [];
  for (const imgBase64 of imageBufferArray) {
    try {
      const formattedStr = imgBase64.startsWith('data:image') 
        ? imgBase64 
        : `data:image/jpeg;base64,${imgBase64}`;

      const res = await cloudinary.uploader.upload(formattedStr, {
        folder: 'ffms/completions',
        resource_type: 'image'
      });
      uploadedUrls.push(res.secure_url);
    } catch (err) {
      logger.error('Failed to upload completion image:', err);
    }
  }
  return uploadedUrls;
};

/**
 * Create Task and Assignments inside transaction
 */
const createTask = async (createdById, taskData, organizationId) => {
  const { assigneeIds, ...restTaskData } = taskData;

  // Use database transaction for multi-table writes
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create task
    const task = await tx.task.create({
      data: {
        ...restTaskData,
        dueDate: restTaskData.dueDate ? new Date(restTaskData.dueDate) : null,
        scheduledDate: restTaskData.scheduledDate ? new Date(restTaskData.scheduledDate) : null,
        organizationId,
        createdById
      }
    });

    // 2. Create TaskAssignments
    const assignments = await Promise.all(
      assigneeIds.map(async (userId) => {
        return tx.taskAssignment.create({
          data: {
            taskId: task.id,
            userId,
            status: 'ASSIGNED'
          },
          include: {
            user: {
              select: { id: true, name: true, employeeId: true }
            }
          }
        });
      })
    );

    return { task, assignments };
  });

  // Emit socket event and push notifications asynchronously
  result.assignments.forEach((assignment) => {
    // 1. Socket notification
    emitToUser(assignment.userId, 'task:assigned', {
      taskId: result.task.id,
      title: result.task.title,
      assignmentId: assignment.id
    });

    // 2. Push Notification & persistent database alert
    sendPushNotification(
      assignment.userId,
      'New Task Assigned',
      `You have been assigned the task: "${result.task.title}"`,
      { type: 'TASK', referenceId: result.task.id }
    ).catch(err => logger.error('Push notification failed:', err));
  });

  return result;
};

/**
 * List tasks with filters and role restrictions
 */
const listTasks = async ({
  organizationId,
  role,
  requestingUserId,
  status,
  priority,
  assigneeId,
  territoryId,
  projectId,
  startDate,
  endDate,
  page = 1,
  limit = 20
}) => {
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);

  // Filters setup
  const where = {
    organizationId,
    ...(priority && { priority }),
    ...(status && { status }),
    ...(territoryId && { territoryId }),
    ...(projectId && { projectId }),
    ...((startDate || endDate) && {
      dueDate: {
        ...(startDate && { gte: new Date(`${startDate}T00:00:00.000Z`) }),
        ...(endDate && { lte: new Date(`${endDate}T23:59:59.999Z`) })
      }
    })
  };

  // Role-based restrictions
  if (role === 'FIELD_STAFF') {
    // Field staff only sees their assigned tasks
    where.assignments = {
      some: {
        userId: requestingUserId
      }
    };
  } else if (assigneeId) {
    // Manager+ filtering by specific staff
    where.assignments = {
      some: {
        userId: assigneeId
      }
    };
  }

  const total = await prisma.task.count({ where });

  const tasks = await prisma.task.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (parsedPage - 1) * parsedLimit,
    take: parsedLimit,
    include: {
      assignments: {
        include: {
          user: {
            select: { id: true, name: true, employeeId: true }
          }
        }
      },
      territory: {
        select: { id: true, name: true }
      },
      project: {
        select: { id: true, name: true }
      }
    }
  });

  return {
    tasks,
    meta: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      hasMore: parsedPage * parsedLimit < total
    }
  };
};

/**
 * Get Task by ID
 */
const getTaskById = async (id, organizationId) => {
  const task = await prisma.task.findFirst({
    where: { id, organizationId },
    include: {
      assignments: {
        include: {
          user: {
            select: { id: true, name: true, employeeId: true, phone: true }
          }
        }
      },
      createdBy: {
        select: { id: true, name: true, email: true }
      },
      territory: true,
      project: true,
      comments: {
        orderBy: { createdAt: 'asc' },
        include: {
          user: {
            select: { id: true, name: true }
          }
        }
      }
    }
  });

  if (!task) {
    throw new NotFoundError('Task not found');
  }

  return task;
};

/**
 * Update Task
 */
const updateTask = async (id, updateData, organizationId) => {
  const task = await prisma.task.findFirst({
    where: { id, organizationId }
  });

  if (!task) {
    throw new NotFoundError('Task not found');
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      ...updateData,
      dueDate: updateData.dueDate ? new Date(updateData.dueDate) : task.dueDate,
      scheduledDate: updateData.scheduledDate ? new Date(updateData.scheduledDate) : task.scheduledDate
    }
  });

  return updatedTask;
};

/**
 * Delete Task
 */
const deleteTask = async (id, organizationId) => {
  const task = await prisma.task.findFirst({
    where: { id, organizationId }
  });

  if (!task) {
    throw new NotFoundError('Task not found');
  }

  await prisma.task.delete({
    where: { id }
  });

  return true;
};

/**
 * Update assignment status / complete task (FIELD_STAFF or MANAGER+)
 */
const updateAssignmentStatus = async (
  assignmentId,
  taskId,
  userId,
  organizationId,
  { status, completionNote, completionImages = [] },
  isManager = false
) => {
  // Validate that the task and assignment exists in this organization
  const assignment = await prisma.taskAssignment.findFirst({
    where: {
      id: assignmentId,
      taskId,
      task: { organizationId },
      // If not manager, ensure they can only update their own assignment
      ...(!isManager && { userId })
    },
    include: {
      task: true,
      user: {
        select: { name: true }
      }
    }
  });

  if (!assignment) {
    throw new NotFoundError('Task assignment not found or access denied');
  }

  // Update status transitions timestamps
  const updates = { status };
  if (status === 'ACCEPTED') {
    updates.acceptedAt = new Date();
    // Update main task status to IN_PROGRESS on first assignment accept
    await prisma.task.update({
      where: { id: taskId },
      data: { status: 'IN_PROGRESS' }
    });
  } else if (status === 'COMPLETED') {
    updates.completedAt = new Date();
    updates.completionNote = completionNote || null;

    // Process base64 uploads to Cloudinary if provided
    if (completionImages.length > 0) {
      const urls = await uploadCompletionImages(completionImages);
      updates.completionImages = urls;
    }
  }

  // Perform Update
  const updatedAssignment = await prisma.taskAssignment.update({
    where: { id: assignmentId },
    data: updates
  });

  // Post completion checks
  if (status === 'COMPLETED') {
    // 1. Notify organization managers/creators
    const taskCreator = assignment.task.createdById;
    emitToUser(taskCreator, 'task:completed', {
      taskId,
      assignmentId,
      taskTitle: assignment.task.title,
      userName: assignment.user.name
    });

    sendPushNotification(
      taskCreator,
      'Task Completed',
      `${assignment.user.name} has completed the task: "${assignment.task.title}"`,
      { type: 'TASK', referenceId: taskId }
    ).catch(err => logger.error('Completion notification failed:', err));

    // 2. Check if ALL assignees have completed their assignments
    const pendingAssignments = await prisma.taskAssignment.count({
      where: {
        taskId,
        status: { not: 'COMPLETED' }
      }
    });

    if (pendingAssignments === 0) {
      // Set main Task status to COMPLETED
      await prisma.task.update({
        where: { id: taskId },
        data: { status: 'COMPLETED' }
      });
      logger.info(`Parent task ${taskId} marked as COMPLETED because all assignments are done.`);
    }
  }

  return updatedAssignment;
};

/**
 * Add Comment
 */
const addComment = async (taskId, userId, content, organizationId) => {
  // Check that the task exists in the organization
  const task = await prisma.task.findFirst({
    where: { id: taskId, organizationId }
  });

  if (!task) {
    throw new NotFoundError('Task not found');
  }

  // Create Comment
  const comment = await prisma.comment.create({
    data: {
      taskId,
      userId,
      content
    },
    include: {
      user: {
        select: { id: true, name: true }
      }
    }
  });

  return comment;
};

/**
 * List comments of a task
 */
const listComments = async (taskId, organizationId) => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, organizationId }
  });

  if (!task) {
    throw new NotFoundError('Task not found');
  }

  return prisma.comment.findMany({
    where: { taskId },
    orderBy: { createdAt: 'asc' },
    include: {
      user: {
        select: { id: true, name: true, profileImage: true }
      }
    }
  });
};

module.exports = {
  createTask,
  listTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateAssignmentStatus,
  addComment,
  listComments
};
