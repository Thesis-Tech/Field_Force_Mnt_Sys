import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/attendance_provider.dart';
import '../widgets/status_badge.dart';
import '../core/theme/app_theme.dart';
import 'apply_leave_screen.dart';

class AttendanceScreen extends StatefulWidget {
  const AttendanceScreen({super.key});

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<AttendanceProvider>(context, listen: false).fetchHistory();
    });
  }

  @override
  Widget build(BuildContext context) {
    final attendanceProvider = Provider.of<AttendanceProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Attendance', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: AppColors.surface,
        elevation: 0.5,
        actions: [
          TextButton.icon(
            icon: const Icon(Icons.time_to_leave_outlined, size: 18),
            label: const Text('Apply Leave'),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const ApplyLeaveScreen()),
              );
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async => attendanceProvider.fetchHistory(),
        child: attendanceProvider.isLoading
            ? const Center(child: CircularProgressIndicator())
            : attendanceProvider.attendanceHistory.isEmpty
                ? ListView(
                    children: [
                      SizedBox(height: MediaQuery.of(context).size.height * 0.25),
                      const Center(
                        child: Text(
                          'No attendance logs recorded yet.',
                          style: TextStyle(color: AppColors.outline),
                        ),
                      ),
                    ],
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: attendanceProvider.attendanceHistory.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final log = attendanceProvider.attendanceHistory[index];
                      final dateStr = DateFormat('EEE, dd MMM yyyy').format(log.date);
                      final checkInStr = DateFormat('hh:mm a').format(log.checkInTime.toLocal());
                      final checkOutStr = log.checkOutTime != null
                          ? DateFormat('hh:mm a').format(log.checkOutTime!.toLocal())
                          : '--:--';

                      return Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    dateStr,
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                  ),
                                  StatusBadge(status: log.status),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Text(
                                          'Check In',
                                          style: TextStyle(fontSize: 11, color: AppColors.outline),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          checkInStr,
                                          style: const TextStyle(
                                            fontSize: 13,
                                            fontWeight: FontWeight.w600,
                                            color: AppColors.onSurface,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Container(
                                    width: 1,
                                    height: 30,
                                    color: AppColors.outlineVariant,
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Text(
                                          'Check Out',
                                          style: TextStyle(fontSize: 11, color: AppColors.outline),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          checkOutStr,
                                          style: const TextStyle(
                                            fontSize: 13,
                                            fontWeight: FontWeight.w600,
                                            color: AppColors.onSurface,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  if (log.totalWorkingHours != null) ...[
                                    Container(
                                      width: 1,
                                      height: 30,
                                      color: AppColors.outlineVariant,
                                    ),
                                    const SizedBox(width: 16),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          const Text(
                                            'Hours',
                                            style: TextStyle(fontSize: 11, color: AppColors.outline),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            '${log.totalWorkingHours!.toStringAsFixed(1)}h',
                                            style: const TextStyle(
                                              fontSize: 13,
                                              fontWeight: FontWeight.w600,
                                              color: AppColors.onSurface,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
      ),
    );
  }
}
