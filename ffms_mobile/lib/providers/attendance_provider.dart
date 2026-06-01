import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:geolocator/geolocator.dart';
import '../services/api_service.dart';
import '../services/location_service.dart';
import '../models/attendance_model.dart';

class AttendanceProvider extends ChangeNotifier {
  AttendanceModel? _todayAttendance;
  List<AttendanceModel> _attendanceHistory = [];
  bool _isLoading = false;
  String? _errorMessage;

  AttendanceModel? get todayAttendance => _todayAttendance;
  List<AttendanceModel> get attendanceHistory => _attendanceHistory;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  bool get isCheckedIn => _todayAttendance != null && _todayAttendance!.checkOutTime == null;

  // Check In handler
  Future<bool> checkIn(Position position) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiService.client.post(
        '/attendance/check-in',
        data: {
          'latitude': position.latitude,
          'longitude': position.longitude,
        },
      );

      if (response.data['success'] == true) {
        _todayAttendance = AttendanceModel.fromJson(response.data['data']);
        await fetchHistory();
        
        // Start background location tracking upon check-in
        await LocationService().startTracking();
        
        return true;
      }
    } on DioException catch (e) {
      _errorMessage = e.response?.data?['error']?['message'] ?? 'Check-in failed';
    } catch (e) {
      _errorMessage = 'An error occurred: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
    return false;
  }

  // Check Out handler
  Future<bool> checkOut(Position position) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiService.client.post(
        '/attendance/check-out',
        data: {
          'latitude': position.latitude,
          'longitude': position.longitude,
        },
      );

      if (response.data['success'] == true) {
        _todayAttendance = AttendanceModel.fromJson(response.data['data']);
        await fetchHistory();
        
        // Stop location tracking upon check-out
        await LocationService().stopTracking();
        
        return true;
      }
    } on DioException catch (e) {
      _errorMessage = e.response?.data?['error']?['message'] ?? 'Check-out failed';
    } catch (e) {
      _errorMessage = 'An error occurred: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
    return false;
  }

  // Fetch today's current check-in state
  Future<void> fetchTodayState() async {
    try {
      final response = await ApiService.client.get('/attendance');
      if (response.data['success'] == true) {
        final list = response.data['data'] as List? ?? [];
        final todayStr = DateTime.now().toIso8601String().substring(0, 10);
        
        // Find if checkin exists for today
        final todayLogs = list.where((item) {
          final dateStr = item['date'] as String;
          return dateStr.startsWith(todayStr);
        }).toList();

        if (todayLogs.isNotEmpty) {
          _todayAttendance = AttendanceModel.fromJson(todayLogs.first as Map<String, dynamic>);
          
          // Auto start location tracking if already checked in
          if (isCheckedIn) {
            LocationService().startTracking();
          }
        } else {
          _todayAttendance = null;
        }
      }
    } catch (e) {
      // Catch silently
    }
    notifyListeners();
  }

  // Fetch personal history
  Future<void> fetchHistory() async {
    try {
      final response = await ApiService.client.get('/attendance');
      if (response.data['success'] == true) {
        final list = response.data['data'] as List? ?? [];
        _attendanceHistory = list
            .map((item) => AttendanceModel.fromJson(item as Map<String, dynamic>))
            .toList();
      }
    } catch (e) {
      // Catch silently
    }
    notifyListeners();
  }
}
