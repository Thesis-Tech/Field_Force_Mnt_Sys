class Organization {
  final String id;
  final String name;

  Organization({required this.id, required this.name});

  factory Organization.fromJson(Map<String, dynamic> json) {
    return Organization(
      id: json['id'] as String,
      name: json['name'] as String,
    );
  }
}

class Territory {
  final String id;
  final String name;

  Territory({required this.id, required this.name});

  factory Territory.fromJson(Map<String, dynamic> json) {
    return Territory(
      id: json['id'] as String,
      name: json['name'] as String,
    );
  }
}

class UserModel {
  final String id;
  final String name;
  final String email;
  final String role;
  final String status;
  final Organization? organization;
  final Territory? territory;
  final String? deviceToken;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.status,
    this.organization,
    this.territory,
    this.deviceToken,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: (json['id'] ?? '') as String,
      name: (json['name'] ?? '') as String,
      email: (json['email'] ?? '') as String,
      role: (json['role'] ?? '') as String,
      status: (json['status'] ?? 'ACTIVE') as String,
      organization: json['organization'] != null
          ? Organization.fromJson(json['organization'] as Map<String, dynamic>)
          : null,
      territory: json['territory'] != null
          ? Territory.fromJson(json['territory'] as Map<String, dynamic>)
          : null,
      deviceToken: json['deviceToken'] as String?,
    );
  }
}
