import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class StorageHelper {
  static const _secureStorage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );
  static SharedPreferences? _prefs;

  static const String _accessTokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';
  static const String _userIdKey = 'user_id';
  static const String _userRoleKey = 'user_role';
  static const String _userOrgIdKey = 'user_org_id';
  static const String _userNameKey = 'user_name';
  static const String _userEmailKey = 'user_email';
  static const String _userEmployeeIdKey = 'user_employee_id';

  static Future<void> initialize() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // Tokens (Secure)
  static Future<void> saveAccessToken(String token) async {
    await _secureStorage.write(key: _accessTokenKey, value: token);
  }

  static Future<String?> getAccessToken() async {
    try {
      return await _secureStorage.read(key: _accessTokenKey);
    } catch (e) {
      return null;
    }
  }

  static Future<void> saveRefreshToken(String token) async {
    await _secureStorage.write(key: _refreshTokenKey, value: token);
  }

  static Future<String?> getRefreshToken() async {
    try {
      return await _secureStorage.read(key: _refreshTokenKey);
    } catch (e) {
      return null;
    }
  }

  // User Info (SharedPreferences for fast sync read)
  static Future<void> saveUserInfo({
    required String id,
    required String role,
    required String orgId,
    required String name,
    required String email,
    String? employeeId,
  }) async {
    if (_prefs == null) await initialize();
    await _prefs!.setString(_userIdKey, id);
    await _prefs!.setString(_userRoleKey, role);
    await _prefs!.setString(_userOrgIdKey, orgId);
    await _prefs!.setString(_userNameKey, name);
    await _prefs!.setString(_userEmailKey, email);
    if (employeeId != null) {
      await _prefs!.setString(_userEmployeeIdKey, employeeId);
    } else {
      await _prefs!.remove(_userEmployeeIdKey);
    }
  }

  static String? getUserId() => _prefs?.getString(_userIdKey);
  static String? getUserRole() => _prefs?.getString(_userRoleKey);
  static String? getUserOrgId() => _prefs?.getString(_userOrgIdKey);
  static String? getUserName() => _prefs?.getString(_userNameKey);
  static String? getUserEmail() => _prefs?.getString(_userEmailKey);
  static String? getEmployeeId() => _prefs?.getString(_userEmployeeIdKey);

  // Clear Storage
  static Future<void> clearAll() async {
    try {
      await _secureStorage.deleteAll();
    } catch (e) {
      // Ignore secure storage deletion error
    }
    if (_prefs == null) await initialize();
    await _prefs!.clear();
  }
}
