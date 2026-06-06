import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/task_model.dart';
import '../widgets/status_badge.dart';
import '../core/theme/app_theme.dart';

class TaskCard extends StatelessWidget {
  final TaskModel task;
  final VoidCallback onTap;

  const TaskCard({
    super.key,
    required this.task,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    Color indicatorColor;
    switch (task.priority.toUpperCase()) {
      case 'HIGH':
      case 'URGENT':
        indicatorColor = AppColors.error;
        break;
      case 'MEDIUM':
        indicatorColor = AppColors.tertiary;
        break;
      case 'LOW':
      default:
        indicatorColor = AppColors.primary;
    }

    // Find the user assignment to get the current assignment status
    final String status = task.assignments.isNotEmpty
        ? task.assignments.first.status
        : task.status;

    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Stack(
            children: [
              Positioned(
                left: 0,
                top: 0,
                bottom: 0,
                width: 4,
                child: Container(color: indicatorColor),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            task.title,
                            style: Theme.of(context).textTheme.headlineSmall,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 8),
                        StatusBadge(status: status),
                      ],
                    ),
                    const SizedBox(height: 12),
                    if (task.projectName != null) ...[
                      Row(
                        children: [
                          const Icon(Icons.folder_open, size: 16, color: AppColors.outline),
                          const SizedBox(width: 8),
                          Text(
                            task.projectName!,
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                    ],
                    Row(
                      children: [
                        const Icon(Icons.location_on_outlined, size: 16, color: AppColors.outline),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            task.territoryName ?? 'No Location',
                            style: Theme.of(context).textTheme.bodyMedium,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(Icons.calendar_today_outlined, size: 16, color: AppColors.outline),
                        const SizedBox(width: 8),
                        Text(
                          task.dueDate != null
                              ? DateFormat('dd MMM yyyy, hh:mm a').format(task.dueDate!.toLocal())
                              : 'No Due Date',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
