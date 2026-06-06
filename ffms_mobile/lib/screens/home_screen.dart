import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:geolocator/geolocator.dart';
import 'package:battery_plus/battery_plus.dart';
import 'package:image_picker/image_picker.dart';
import '../providers/auth_provider.dart';
import '../providers/task_provider.dart';
import '../providers/attendance_provider.dart';
import '../providers/notification_provider.dart';
import '../widgets/custom_button.dart';
import '../widgets/task_card.dart';
import '../widgets/task_skeleton.dart';
import '../core/theme/app_theme.dart';
import 'task_detail_screen.dart';
import 'permissions_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _isInit = true;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_isInit) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _loadData();
      });
      _isInit = false;
    }
  }

  Future<void> _loadData() async {
    final taskProvider = Provider.of<TaskProvider>(context, listen: false);
    final attendanceProvider = Provider.of<AttendanceProvider>(context, listen: false);
    final notificationProvider = Provider.of<NotificationProvider>(context, listen: false);

    await Future.wait([
      taskProvider.fetchMyTasks(),
      attendanceProvider.fetchTodayState(),
      notificationProvider.fetchNotifications(),
    ]);
  }

  Future<void> _handleAttendanceAction() async {
    final attendanceProvider = Provider.of<AttendanceProvider>(context, listen: false);
    
    // Check permission
    final geolocator = GeolocatorPlatform.instance;
    LocationPermission permission = await geolocator.checkPermission();
    if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
      if (mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => PermissionsScreen(
              onPermissionsGranted: () {
                Navigator.pop(context);
                _handleAttendanceAction();
              },
            ),
          ),
        );
      }
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Fetching current GPS coordinates...')),
    );

    try {
      if (!attendanceProvider.isCheckedIn) {
        final battery = Battery();
        final batteryLevel = await battery.batteryLevel;
        if (batteryLevel < 40) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Battery must be 40%+ to Check In. Current: $batteryLevel%'),
                backgroundColor: AppColors.error,
              ),
            );
          }
          return;
        }

        // Add photo requirement
        final picker = ImagePicker();
        final photo = await picker.pickImage(source: ImageSource.camera);
        if (photo == null) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Selfie photo is required to Check In.')),
            );
          }
          return;
        }
      }

      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      final bool wasCheckedIn = attendanceProvider.isCheckedIn;
      bool success;
      if (wasCheckedIn) {
        success = await attendanceProvider.checkOut(position);
      } else {
        success = await attendanceProvider.checkIn(position);
      }

      if (mounted) {
        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(wasCheckedIn ? 'Checked Out Successfully!' : 'Checked In Successfully!'),
              backgroundColor: AppColors.secondary,
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(attendanceProvider.errorMessage ?? 'Operation failed'),
              backgroundColor: AppColors.error,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to get GPS: $e'), backgroundColor: AppColors.error),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authUser = Provider.of<AuthProvider>(context).currentUser;
    final taskProvider = Provider.of<TaskProvider>(context);
    final attendanceProvider = Provider.of<AttendanceProvider>(context);
    final notifProvider = Provider.of<NotificationProvider>(context);

    final assignedCount = taskProvider.tasks.length;
    final completedCount = taskProvider.tasks
        .where((t) => t.assignments.isNotEmpty && t.assignments.first.status == 'COMPLETED')
        .length;

    final todayTasks = taskProvider.tasks.take(2).toList();
    final todayDate = DateFormat('EEEE, MMMM d').format(DateTime.now());

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'FieldTrack',
          style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary),
        ),
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_outlined),
                onPressed: () {
                  Navigator.pushNamed(context, '/notifications');
                },
              ),
              if (notifProvider.unreadCount > 0)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: AppColors.error,
                      shape: BoxShape.circle,
                    ),
                    constraints: const BoxConstraints(
                      minWidth: 16,
                      minHeight: 16,
                    ),
                    child: Text(
                      '${notifProvider.unreadCount}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 8,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 8),
        ],
        backgroundColor: AppColors.surface,
        elevation: 0.5,
      ),
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Segment
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Good Morning, ${authUser?.name ?? 'Employee'} 👋',
                          style: Theme.of(context).textTheme.headlineLarge,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          todayDate,
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ],
                    ),
                  ),
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: AppColors.primaryContainer.withOpacity(0.1),
                    child: Text(
                      authUser?.name.substring(0, 1).toUpperCase() ?? 'F',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                        fontSize: 18,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Attendance Check-in Box
              (() {
                final isCheckedIn = attendanceProvider.isCheckedIn;
                final isDayComplete = attendanceProvider.isDayComplete;
                final todaySessions = attendanceProvider.todaySessions;
                
                String buttonText;
                Color buttonColor;
                IconData buttonIcon;
                VoidCallback? onPressed;

                if (isDayComplete) {
                  buttonText = 'Day Complete';
                  buttonColor = AppColors.outline;
                  buttonIcon = Icons.check_circle_outline;
                  onPressed = null;
                } else if (isCheckedIn) {
                  final sessionNum = attendanceProvider.todayAttendance?.sessionNumber ?? 1;
                  buttonText = 'Check Out (Session $sessionNum)';
                  buttonColor = AppColors.error;
                  buttonIcon = Icons.logout;
                  onPressed = _handleAttendanceAction;
                } else {
                  final nextSessionNum = todaySessions.length + 1;
                  buttonText = 'Check In (Session $nextSessionNum)';
                  buttonColor = AppColors.secondary;
                  buttonIcon = Icons.how_to_reg;
                  onPressed = _handleAttendanceAction;
                }

                return CustomButton(
                  text: buttonText,
                  isLoading: attendanceProvider.isLoading,
                  backgroundColor: buttonColor,
                  textColor: Colors.white,
                  icon: buttonIcon,
                  onPressed: onPressed,
                  height: 56,
                );
              })(),
              const SizedBox(height: 24),

              // Stats Row
              Row(
                children: [
                  Expanded(
                    child: Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Row(
                              children: [
                                Icon(Icons.assignment_outlined, color: AppColors.primary, size: 20),
                                SizedBox(width: 8),
                                Text(
                                  'Assigned',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.onSurfaceVariant,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text(
                              '$assignedCount',
                              style: Theme.of(context).textTheme.headlineLarge,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Row(
                              children: [
                                Icon(Icons.task_alt_outlined, color: AppColors.secondary, size: 20),
                                SizedBox(width: 8),
                                Text(
                                  'Completed',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.onSurfaceVariant,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text(
                              '$completedCount',
                              style: Theme.of(context).textTheme.headlineLarge,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Tasks Title
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    "Today's Tasks",
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  TextButton(
                    onPressed: () {
                      // Navigate to Tasks tab by reloading main screen with index
                    },
                    child: const Text('View All'),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Tasks Preview list
              if (taskProvider.isLoading)
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: 2,
                  separatorBuilder: (context, index) => const SizedBox(height: 12),
                  itemBuilder: (context, index) => const TaskSkeletonCard(),
                )
              else if (todayTasks.isEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24.0),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.outlineVariant),
                  ),
                  child: const Center(
                    child: Text('No tasks assigned for today.'),
                  ),
                )
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: todayTasks.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final task = todayTasks[index];
                    return TaskCard(
                      task: task,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => TaskDetailScreen(taskId: task.id),
                          ),
                        );
                      },
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }
}
