class CommentModel {
  final String id;
  final String content;
  final String taskId;
  final String userId;
  final String userName;
  final DateTime createdAt;

  CommentModel({
    required this.id,
    required this.content,
    required this.taskId,
    required this.userId,
    required this.userName,
    required this.createdAt,
  });

  factory CommentModel.fromJson(Map<String, dynamic> json) {
    return CommentModel(
      id: json['id'] as String,
      content: json['content'] as String,
      taskId: json['taskId'] as String,
      userId: json['userId'] as String,
      userName: json['user'] != null ? json['user']['name'] as String : 'Unknown',
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}

class TaskAssignmentModel {
  final String id;
  final String taskId;
  final String userId;
  final String status;
  final DateTime? startedAt;
  final DateTime? completedAt;

  TaskAssignmentModel({
    required this.id,
    required this.taskId,
    required this.userId,
    required this.status,
    this.startedAt,
    this.completedAt,
  });

  factory TaskAssignmentModel.fromJson(Map<String, dynamic> json) {
    return TaskAssignmentModel(
      id: (json['id'] as String?) ?? '',
      taskId: (json['taskId'] as String?) ?? '',
      userId: (json['userId'] as String?) ?? '',
      status: (json['status'] as String?) ?? 'ASSIGNED',
      startedAt: json['acceptedAt'] != null
          ? DateTime.parse(json['acceptedAt'] as String)
          : (json['startedAt'] != null ? DateTime.parse(json['startedAt'] as String) : null),
      completedAt: json['completedAt'] != null ? DateTime.parse(json['completedAt'] as String) : null,
    );
  }
}

class TaskModel {
  final String id;
  final String title;
  final String? description;
  final String priority;
  final String status;
  final String? territoryId;
  final String? projectId;
  final String? projectName;
  final DateTime? dueDate;
  final DateTime createdAt;
  final List<TaskAssignmentModel> assignments;

  TaskModel({
    required this.id,
    required this.title,
    this.description,
    required this.priority,
    required this.status,
    this.territoryId,
    this.projectId,
    this.projectName,
    this.dueDate,
    required this.createdAt,
    required this.assignments,
  });

  factory TaskModel.fromJson(Map<String, dynamic> json) {
    var assignmentsList = json['assignments'] as List? ?? [];
    List<TaskAssignmentModel> mappedAssignments =
        assignmentsList.map((a) => TaskAssignmentModel.fromJson(a as Map<String, dynamic>)).toList();

    return TaskModel(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      priority: json['priority'] as String,
      status: json['status'] as String,
      territoryId: json['territoryId'] as String?,
      projectId: json['projectId'] as String?,
      projectName: json['project'] != null ? json['project']['name'] as String? : null,
      dueDate: json['dueDate'] != null ? DateTime.parse(json['dueDate'] as String) : null,
      createdAt: DateTime.parse(json['createdAt'] as String),
      assignments: mappedAssignments,
    );
  }
}
