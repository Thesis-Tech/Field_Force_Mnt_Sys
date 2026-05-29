import 'package:flutter/material.dart';
import '../services/location_service.dart';
import '../widgets/custom_button.dart';
import '../core/theme/app_theme.dart';

class PermissionsScreen extends StatefulWidget {
  final VoidCallback onPermissionsGranted;

  const PermissionsScreen({super.key, required this.onPermissionsGranted});

  @override
  State<PermissionsScreen> createState() => _PermissionsScreenState();
}

class _PermissionsScreenState extends State<PermissionsScreen> {
  final LocationService _locationService = LocationService();
  bool _isRequesting = false;

  Future<void> _requestPermissions() async {
    setState(() => _isRequesting = true);
    final granted = await _locationService.requestPermission();
    setState(() => _isRequesting = false);

    if (granted) {
      widget.onPermissionsGranted();
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Location permission is required to use this app.'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.location_on,
                size: 80,
                color: AppColors.primary,
              ),
              const SizedBox(height: 24),
              Text(
                'Location Permission Required',
                style: Theme.of(context).textTheme.headlineMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Text(
                'FieldTrack needs access to your location in the background to log your attendance, calculate travel allowances, and monitor geofence boundaries during your duty hours.',
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 48),
              CustomButton(
                text: 'Grant Permission',
                isLoading: _isRequesting,
                onPressed: _requestPermissions,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
