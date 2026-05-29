import 'dart:io';
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../services/api_service.dart';
import '../models/expense_model.dart';

class ExpenseProvider extends ChangeNotifier {
  List<ExpenseModel> _expenses = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<ExpenseModel> get expenses => _expenses;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Fetch my expenses
  Future<void> fetchMyExpenses() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiService.client.get('/expenses/my');
      if (response.data['success'] == true) {
        final list = response.data['data']['expenses'] as List? ?? [];
        _expenses = list.map((item) => ExpenseModel.fromJson(item as Map<String, dynamic>)).toList();
      }
    } on DioException catch (e) {
      _errorMessage = e.response?.data?['error']?['message'] ?? 'Failed to load expenses';
    } catch (e) {
      _errorMessage = 'An error occurred: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Create or Submit Expense Claim (multipart form for receipt attachment)
  Future<bool> createExpense({
    required String title,
    required double amount,
    required String category,
    required DateTime date,
    String? description,
    File? receipt,
    bool submitDirectly = false,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      FormData formData = FormData.fromMap({
        'title': title,
        'amount': amount,
        'category': category,
        'date': date.toIso8601String().substring(0, 10),
        'description': description ?? '',
      });

      if (receipt != null) {
        formData.files.add(MapEntry(
          'receipt',
          await MultipartFile.fromFile(
            receipt.path,
            filename: receipt.path.split('/').last,
          ),
        ));
      }

      // 1. Create the expense (creates as DRAFT)
      var response = await ApiService.client.post('/expenses', data: formData);

      if (response.data['success'] == true) {
        final createdExpense = ExpenseModel.fromJson(response.data['data']);

        // 2. Submit if requested
        if (submitDirectly) {
          final submitResponse = await ApiService.client.put('/expenses/${createdExpense.id}/submit');
          if (submitResponse.data['success'] != true) {
            _errorMessage = 'Expense saved as draft, but submission failed.';
            await fetchMyExpenses();
            return false;
          }
        }
        await fetchMyExpenses();
        return true;
      }
    } on DioException catch (e) {
      _errorMessage = e.response?.data?['error']?['message'] ?? 'Failed to submit expense';
    } catch (e) {
      _errorMessage = 'An error occurred: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
    return false;
  }

  // Submit existing draft expense
  Future<bool> submitExpense(String expenseId) async {
    try {
      final response = await ApiService.client.put('/expenses/$expenseId/submit');
      if (response.data['success'] == true) {
        await fetchMyExpenses();
        return true;
      }
    } catch (e) {
      // Catch
    }
    return false;
  }
}
