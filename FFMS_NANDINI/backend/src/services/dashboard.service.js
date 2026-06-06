const prisma = require('../config/prisma');
const { getLiveLocations } = require('./location.service');
const { NotFoundError } = require('../utils/errors');
const logger = require('../config/logger');

/**
 * Get Admin/Manager Dashboard stats
 */
const getAdminDashboard = async (organizationId, role, userId) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDate = new Date(`${todayStr}T00:00:00.000Z`);

  const taskFilter = {};
  if (role === 'ADMIN') {
    taskFilter.createdBy = {
      role: 'ADMIN'
    };
  } else if (role === 'MANAGER') {
    taskFilter.OR = [
      { createdById: userId },
      { assignments: { some: { userId } } }
    ];
  }

  // 1. todayStats
  const totalCheckedIn = await prisma.attendance.count({
    where: {
      user: { organizationId },
      date: todayDate
    }
  });

  const totalLate = await prisma.attendance.count({
    where: {
      user: { organizationId },
      date: todayDate,
      isLate: true
    }
  });

  const totalFieldStaff = await prisma.user.count({
    where: {
      organizationId,
      role: 'FIELD_STAFF',
      status: 'ACTIVE'
    }
  });

  const totalAbsent = Math.max(0, totalFieldStaff - totalCheckedIn);

  const tasksCompleted = await prisma.task.count({
    where: {
      organizationId,
      status: 'COMPLETED',
      updatedAt: { gte: todayDate },
      ...taskFilter
    }
  });

  const tasksOverdue = await prisma.task.count({
    where: {
      organizationId,
      status: { in: ['PENDING', 'IN_PROGRESS'] },
      dueDate: { lt: new Date() },
      ...taskFilter
    }
  });

  // 2. tasksByStatus
  const pending = await prisma.task.count({ where: { organizationId, status: 'PENDING', ...taskFilter } });
  const inProgress = await prisma.task.count({ where: { organizationId, status: 'IN_PROGRESS', ...taskFilter } });
  const completed = await prisma.task.count({ where: { organizationId, status: 'COMPLETED', ...taskFilter } });
  const cancelled = await prisma.task.count({ where: { organizationId, status: 'CANCELLED', ...taskFilter } });
  const overdue = await prisma.task.count({
    where: {
      organizationId,
      status: { in: ['PENDING', 'IN_PROGRESS'] },
      dueDate: { lt: new Date() },
      ...taskFilter
    }
  });

  // 3. liveFieldStaff
  const liveFieldStaff = await getLiveLocations(organizationId);

  // 4. weeklyActivity (last 7 days)
  const weeklyActivity = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const dateQuery = new Date(`${dStr}T00:00:00.000Z`);
    const dateQueryEnd = new Date(`${dStr}T23:59:59.999Z`);

    const checkInsCount = await prisma.attendance.count({
      where: {
        user: { organizationId },
        date: dateQuery
      }
    });

    const tasksCompletedCount = await prisma.task.count({
      where: {
        organizationId,
        status: 'COMPLETED',
        updatedAt: { gte: dateQuery, lte: dateQueryEnd },
        ...taskFilter
      }
    });

    const visitsCount = await prisma.visitReport.count({
      where: {
        user: { organizationId },
        createdAt: { gte: dateQuery, lte: dateQueryEnd }
      }
    });

    weeklyActivity.push({
      date: dStr,
      checkIns: checkInsCount,
      tasksCompleted: tasksCompletedCount,
      visits: visitsCount
    });
  }

  // 5. topPerformers (top 5 by completed assignments count)
  const staffAssignments = await prisma.user.findMany({
    where: {
      organizationId,
      role: 'FIELD_STAFF',
      status: 'ACTIVE'
    },
    select: {
      id: true,
      name: true,
      employeeId: true,
      taskAssignments: {
        where: { status: 'COMPLETED', task: taskFilter },
        select: { rating: true }
      },
      visitReports: {
        select: { id: true }
      }
    }
  });

  const topPerformers = staffAssignments
    .map(staff => {
      const completedCount = staff.taskAssignments.length;
      const visitsCount = staff.visitReports.length;
      const ratings = staff.taskAssignments.map(a => a.rating).filter(r => r !== null);
      const avgRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;

      return {
        user: { id: staff.id, name: staff.name, employeeId: staff.employeeId },
        tasksCompleted: completedCount,
        visits: visitsCount,
        rating: parseFloat(avgRating.toFixed(1))
      };
    })
    .sort((a, b) => b.tasksCompleted - a.tasksCompleted)
    .slice(0, 5);

  // 6. attendanceRate (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const totalAttendancesCount = await prisma.attendance.count({
    where: {
      user: { organizationId },
      date: { gte: thirtyDaysAgo }
    }
  });

  const totalPossibleDays = totalFieldStaff * 30;
  const attendanceRate = totalPossibleDays > 0 ? (totalAttendancesCount / totalPossibleDays) * 100 : 100;

  // 7. KPI Metrics and Managers (Real-time data)
  const totalManagers = await prisma.user.count({
    where: { organizationId, role: 'MANAGER', status: 'ACTIVE' }
  });

  const activeProjectsCount = await prisma.project.count({
    where: { organizationId, status: 'ACTIVE' }
  });

  const pendingLeaves = await prisma.leave.count({
    where: { status: 'PENDING', user: { organizationId } }
  });

  const pendingExpenses = await prisma.expense.count({
    where: { status: 'SUBMITTED', user: { organizationId } }
  });

  const pendingApprovals = pendingLeaves + pendingExpenses;

  // 8. Employee distribution by territory
  const territories = await prisma.territory.findMany({
    where: { organizationId },
    select: {
      id: true,
      name: true,
      users: {
        where: { role: 'FIELD_STAFF', status: 'ACTIVE' },
        select: { id: true }
      }
    }
  });

  const colors = ["#3b82f6", "#22c55e", "#f97316", "#8b5cf6", "#06b6d4", "#ec4899", "#eab308"];
  const employeeDistribution = territories.map((t, idx) => ({
    name: t.name,
    value: t.users.length,
    color: colors[idx % colors.length]
  })).filter(t => t.value > 0);

  // Fallback if empty
  if (employeeDistribution.length === 0) {
    employeeDistribution.push({ name: "General Operations", value: totalFieldStaff, color: "#3b82f6" });
  }

  // 9. Managers list & Performance Scores
  const managers = await prisma.user.findMany({
    where: { organizationId, role: 'MANAGER' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      status: true,
      subordinates: {
        select: {
          id: true,
          taskAssignments: {
            where: { status: 'COMPLETED' },
            select: { id: true, rating: true }
          }
        }
      },
      projectsManaged: {
        select: { id: true }
      }
    }
  });

  const managersList = managers.map(mgr => {
    const allRatings = mgr.subordinates.flatMap(sub => sub.taskAssignments.map(ta => ta.rating).filter(r => r !== null));
    const avgRating = allRatings.length > 0 ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length : 0;
    const score = Math.round(avgRating * 20);
    const teamSize = mgr.subordinates.length;
    const assignedProjects = mgr.projectsManaged.length;

    return {
      id: mgr.id,
      name: mgr.name,
      email: mgr.email,
      department: "Operations",
      assignedProjects,
      teamSize,
      status: mgr.status === 'ACTIVE' ? 'active' : 'inactive',
      avatar: mgr.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      phone: mgr.phone || '',
      joinedDate: mgr.createdAt.toISOString().split('T')[0],
      performanceScore: score
    };
  });

  return {
    todayStats: {
      totalCheckedIn,
      totalAbsent,
      totalLate,
      tasksCompleted,
      tasksOverdue
    },
    weeklyActivity,
    topPerformers,
    liveFieldStaff,
    tasksByStatus: {
      pending,
      inProgress,
      completed,
      cancelled,
      overdue
    },
    attendanceRate: parseFloat(attendanceRate.toFixed(2)),
    totalManagers,
    totalEmployees: totalFieldStaff,
    activeProjects: activeProjectsCount,
    pendingApprovals,
    employeeDistribution,
    managersList
  };
};

/**
 * Get Field Staff Dashboard metrics
 */
const getFieldStaffDashboard = async (userId, organizationId) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDate = new Date(`${todayStr}T00:00:00.000Z`);

  // 1. todayAttendance
  const todayAttendance = await prisma.attendance.findUnique({
    where: {
      userId_date: {
        userId,
        date: todayDate
      }
    }
  });

  // 2. assignedTasks (pending/in-progress, limit 10)
  const assignedTasks = await prisma.task.findMany({
    where: {
      organizationId,
      status: { in: ['PENDING', 'IN_PROGRESS'] },
      assignments: {
        some: { userId }
      }
    },
    orderBy: { dueDate: 'asc' },
    take: 10,
    include: {
      territory: { select: { name: true } }
    }
  });

  // 3. recentVisits (last 5)
  const recentVisits = await prisma.visitReport.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  // 4. thisMonthStats
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const daysPresent = await prisma.attendance.count({
    where: {
      userId,
      date: { gte: startOfMonth },
      status: { in: ['PRESENT', 'LATE'] }
    }
  });

  const tasksCompleted = await prisma.taskAssignment.count({
    where: {
      userId,
      status: 'COMPLETED',
      completedAt: { gte: startOfMonth }
    }
  });

  const visits = await prisma.visitReport.count({
    where: {
      userId,
      createdAt: { gte: startOfMonth }
    }
  });

  // 5. performance rating and ranking
  const completedAssignments = await prisma.taskAssignment.findMany({
    where: { userId, status: 'COMPLETED' },
    select: { rating: true }
  });
  const ratings = completedAssignments.map(a => a.rating).filter(r => r !== null);
  const avgRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;

  // Simple rank calculation within organization
  const allStaffPerformance = await prisma.user.findMany({
    where: { organizationId, role: 'FIELD_STAFF', status: 'ACTIVE' },
    select: {
      id: true,
      taskAssignments: {
        where: { status: 'COMPLETED' }
      }
    }
  });

  const rankedStaff = allStaffPerformance
    .map(staff => ({
      userId: staff.id,
      completed: staff.taskAssignments.length
    }))
    .sort((a, b) => b.completed - a.completed);

  const userIndex = rankedStaff.findIndex(s => s.userId === userId);
  const rank = userIndex !== -1 ? userIndex + 1 : 1;

  return {
    todayAttendance,
    assignedTasks,
    recentVisits,
    thisMonthStats: {
      daysPresent,
      tasksCompleted,
      visits
    },
    performance: {
      rating: parseFloat(avgRating.toFixed(2)),
      rank
    }
  };
};

module.exports = {
  getAdminDashboard,
  getFieldStaffDashboard
};
