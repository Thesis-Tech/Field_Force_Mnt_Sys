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

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalCheckedIn,
    totalLate,
    totalFieldStaff,
    tasksCompleted,
    tasksOverdue,
    pending,
    inProgress,
    completed,
    cancelled,
    overdue,
    liveFieldStaff,
    totalManagers,
    activeProjectsCount,
    pendingLeaves,
    pendingExpenses,
    staffAssignments,
    totalAttendancesCount,
    territories,
    managers
  ] = await Promise.all([
    prisma.attendance.count({ where: { user: { organizationId }, date: todayDate } }),
    prisma.attendance.count({ where: { user: { organizationId }, date: todayDate, isLate: true } }),
    prisma.user.count({ where: { organizationId, role: 'FIELD_STAFF', status: 'ACTIVE' } }),
    prisma.task.count({ where: { organizationId, status: 'COMPLETED', updatedAt: { gte: todayDate }, ...taskFilter } }),
    prisma.task.count({ where: { organizationId, status: { in: ['PENDING', 'IN_PROGRESS'] }, dueDate: { lt: new Date() }, ...taskFilter } }),
    prisma.task.count({ where: { organizationId, status: 'PENDING', ...taskFilter } }),
    prisma.task.count({ where: { organizationId, status: 'IN_PROGRESS', ...taskFilter } }),
    prisma.task.count({ where: { organizationId, status: 'COMPLETED', ...taskFilter } }),
    prisma.task.count({ where: { organizationId, status: 'CANCELLED', ...taskFilter } }),
    prisma.task.count({ where: { organizationId, status: { in: ['PENDING', 'IN_PROGRESS'] }, dueDate: { lt: new Date() }, ...taskFilter } }),
    getLiveLocations(organizationId),
    prisma.user.count({ where: { organizationId, role: 'MANAGER', status: 'ACTIVE' } }),
    prisma.project.count({ where: { organizationId, status: 'ACTIVE' } }),
    prisma.leave.count({ where: { status: 'PENDING', user: { organizationId } } }),
    prisma.expense.count({ where: { status: 'SUBMITTED', user: { organizationId } } }),
    prisma.user.findMany({
      where: { organizationId, role: 'FIELD_STAFF', status: 'ACTIVE' },
      select: {
        id: true, name: true, employeeId: true,
        taskAssignments: { where: { status: 'COMPLETED', task: taskFilter }, select: { rating: true } },
        visitReports: { select: { id: true } }
      }
    }),
    prisma.attendance.count({ where: { user: { organizationId }, date: { gte: thirtyDaysAgo } } }),
    prisma.territory.findMany({
      where: { organizationId },
      select: {
        id: true, name: true,
        users: { where: { role: 'FIELD_STAFF', status: 'ACTIVE' }, select: { id: true } }
      }
    }),
    prisma.user.findMany({
      where: { organizationId, role: 'MANAGER' },
      select: {
        id: true, name: true, email: true, phone: true, createdAt: true, status: true, department: true,
        subordinates: { select: { id: true, name: true, email: true, phone: true, status: true, taskAssignments: { where: { status: 'COMPLETED' }, select: { id: true, rating: true } } } },
        projectsManaged: { select: { id: true } }
      }
    })
  ]);

  const totalAbsent = Math.max(0, totalFieldStaff - totalCheckedIn);

  // 4. weeklyActivity (last 7 days)
  const weeklyActivityPromises = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const dateQuery = new Date(`${dStr}T00:00:00.000Z`);
    const dateQueryEnd = new Date(`${dStr}T23:59:59.999Z`);

    weeklyActivityPromises.push(
      Promise.all([
        prisma.attendance.count({ where: { user: { organizationId }, date: dateQuery } }),
        prisma.task.count({ where: { organizationId, status: 'COMPLETED', updatedAt: { gte: dateQuery, lte: dateQueryEnd }, ...taskFilter } }),
        prisma.visitReport.count({ where: { user: { organizationId }, createdAt: { gte: dateQuery, lte: dateQueryEnd } } })
      ]).then(([checkIns, tasksCompleted, visits]) => ({
        date: dStr, checkIns, tasksCompleted, visits
      }))
    );
  }
  const weeklyActivity = await Promise.all(weeklyActivityPromises);

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

  const totalPossibleDays = totalFieldStaff * 30;
  const attendanceRate = totalPossibleDays > 0 ? (totalAttendancesCount / totalPossibleDays) * 100 : 100;

  const pendingApprovals = pendingLeaves + pendingExpenses;

  const colors = ["#3b82f6", "#22c55e", "#f97316", "#8b5cf6", "#06b6d4", "#ec4899", "#eab308"];
  const employeeDistribution = territories.map((t, idx) => ({
    name: t.name,
    value: t.users.length,
    color: colors[idx % colors.length]
  }));

  if (employeeDistribution.length === 0) {
    employeeDistribution.push({ name: "General Operations", value: totalFieldStaff, color: "#3b82f6" });
  }

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
      department: mgr.department || "Operations",
      assignedProjects,
      teamSize,
      status: mgr.status === 'ACTIVE' ? 'active' : 'inactive',
      avatar: mgr.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      phone: mgr.phone || '',
      joinedDate: mgr.createdAt.toISOString().split('T')[0],
      performanceScore: score,
      team: mgr.subordinates.map(sub => ({
        id: sub.id,
        name: sub.name,
        email: sub.email,
        phone: sub.phone || '',
        status: sub.status === 'ACTIVE' ? 'active' : 'inactive',
        avatar: sub.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
      }))
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
