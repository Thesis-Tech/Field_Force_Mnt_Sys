class AttendanceModel {
  final String id;
  final String userId;
  final DateTime date;
  final DateTime checkInTime;
  final double checkInLat;
  final double checkInLng;
  final DateTime? checkOutTime;
  final double? checkOutLat;
  final double? checkOutLng;
  final String status;
  final double? totalWorkingHours;

  AttendanceModel({
    required this.id,
    required this.userId,
    required this.date,
    required this.checkInTime,
    required this.checkInLat,
    required this.checkInLng,
    this.checkOutTime,
    this.checkOutLat,
    this.checkOutLng,
    required this.status,
    this.totalWorkingHours,
  });

  factory AttendanceModel.fromJson(Map<String, dynamic> json) {
    return AttendanceModel(
      id: json['id'] as String,
      userId: json['userId'] as String,
      date: DateTime.parse(json['date'] as String),
      checkInTime: DateTime.parse(json['checkInTime'] as String),
      checkInLat: ((json['checkInLatitude'] ?? json['checkInLat']) as num).toDouble(),
      checkInLng: ((json['checkInLongitude'] ?? json['checkInLng']) as num).toDouble(),
      checkOutTime: json['checkOutTime'] != null ? DateTime.parse(json['checkOutTime'] as String) : null,
      checkOutLat: (json['checkOutLatitude'] ?? json['checkOutLat']) != null
          ? ((json['checkOutLatitude'] ?? json['checkOutLat']) as num).toDouble()
          : null,
      checkOutLng: (json['checkOutLongitude'] ?? json['checkOutLng']) != null
          ? ((json['checkOutLongitude'] ?? json['checkOutLng']) as num).toDouble()
          : null,
      status: json['status'] as String,
      totalWorkingHours: json['workingMinutes'] != null
          ? (json['workingMinutes'] as num).toDouble() / 60.0
          : (json['totalWorkingHours'] != null ? (json['totalWorkingHours'] as num).toDouble() : null),
    );
  }
}
