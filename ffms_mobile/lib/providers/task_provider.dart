import 'dart:io';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../services/api_service.dart';
import '../models/task_model.dart';

class TaskProvider extends ChangeNotifier {
  List<TaskModel> _tasks = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<TaskModel> get tasks => _tasks;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Fetch field staff tasks
  Future<void> fetchMyTasks({String? status}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final queryParams = <String, dynamic>{};
      if (status != null && status != 'ALL') {
        queryParams['status'] = status;
      }

      final response = await ApiService.client.get(
        '/tasks/my',
        queryParameters: queryParams,
      );

      if (response.data['success'] == true) {
        final list = response.data['data']['tasks'] as List? ?? [];
        _tasks = list.map((t) => TaskModel.fromJson(t as Map<String, dynamic>)).toList();
      }
    } on DioException catch (e) {
      _errorMessage = e.response?.data?['error']?['message'] ?? 'Failed to load tasks';
    } catch (e) {
      _errorMessage = 'An error occurred: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Update Assignment Status (e.g. START_TASK, COMPLETE_TASK)
  Future<bool> updateAssignmentStatus(String taskId, String assignmentId, String status) async {
    try {
      final response = await ApiService.client.patch(
        '/tasks/$taskId/assignments/$assignmentId',
        data: {'status': status},
      );

      if (response.data['success'] == true) {
        // Refresh local tasks
        await fetchMyTasks();
        return true;
      }
    } catch (e) {
      // Catch silently or propagate error
    }
    return false;
  }

  // Submit Visit Report (with optional attachment file upload)
  Future<bool> submitVisitReport({
    required String assignmentId,
    required String visitType,
    required String notes,
    required String customerName,
    String? customerPhone,
    String? customerAddress,
    File? attachment,
  }) async {
    try {
      List<String> base64Images = [];
      if (attachment != null) {
        final bytes = await attachment.readAsBytes();
        final base64Str = base64.encode(bytes);
        base64Images.add(base64Str);
      }

      final response = await ApiService.client.post(
        '/visits',
        data: {
          'taskAssignmentId': assignmentId,
          'visitType': visitType,
          'notes': notes,
          'customerName': customerName,
          'customerPhone': customerPhone ?? '',
          'customerAddress': customerAddress ?? '',
          'images': base64Images,
        },
      );

      if (response.data['success'] == true) {
        await fetchMyTasks();
        return true;
      }
    } catch (e) {
      // Catch errors
    }
    return false;
  }

  // Get Task Comments
  Future<List<CommentModel>> getComments(String taskId) async {
    try {
      final response = await ApiService.client.get('/tasks/$taskId/comments');
      if (response.data['success'] == true) {
        final list = response.data['data']['comments'] as List? ?? [];
        return list.map((c) => CommentModel.fromJson(c as Map<String, dynamic>)).toList();
      }
    } catch (e) {
      // Catch
    }
    return [];
  }

  // Add Comment
  Future<bool> addComment(String taskId, String content) async {
    try {
      final response = await ApiService.client.post(
        '/tasks/$taskId/comments',
        data: {'content': content},
      );
      return response.data['success'] == true;
    } catch (e) {
      return false;
    }
  }
}
