import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../services/location_service.dart';
import '../widgets/custom_button.dart';
import '../core/theme/app_theme.dart';

class PermissionsScreen extends StatefulWidget {
  final VoidCallback? onPermissionsGranted;

  const PermissionsScreen({super.key, this.onPermissionsGranted});

  @override
  State<PermissionsScreen> createState() => _PermissionsScreenState();
}

class _PermissionsScreenState extends State<PermissionsScreen> with WidgetsBindingObserver {
  final LocationService _locationService = LocationService();
  bool _isRequesting = false;
  
  bool _serviceEnabled = false;
  LocationPermission _permissionStatus = LocationPermission.denied;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _checkCurrentStatus();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _checkCurrentStatus();
    }
  }

  Future<void> _checkCurrentStatus() async {
    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      final permission = await Geolocator.checkPermission();
      if (mounted) {
        setState(() {
          _serviceEnabled = serviceEnabled;
          _permissionStatus = permission;
        });
      }
    } catch (_) {}
  }

  Future<void> _requestPermissions() async {
    setState(() => _isRequesting = true);
    
    // Request permission using the service
    final granted = await _locationService.requestPermission();
    await _checkCurrentStatus();
    
    setState(() => _isRequesting = false);

    if (granted) {
      if (widget.onPermissionsGranted != null) {
        widget.onPermissionsGranted!();
      } else {
        if (mounted) Navigator.pop(context);
      }
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

  Widget _buildStatusTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required Widget statusWidget,
    required VoidCallback onTap,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.outlineVariant, width: 0.5),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.primaryContainer.withOpacity(0.08),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: AppColors.primary, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.onSurface),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: const TextStyle(fontSize: 12, color: AppColors.outline),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(8),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
              child: statusWidget,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isFullyGranted = _serviceEnabled && 
        (_permissionStatus == LocationPermission.always || _permissionStatus == LocationPermission.whileInUse);

    return Scaffold(
      appBar: AppBar(
        title: const Text('System Permissions', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: AppColors.surface,
        elevation: 0.5,
      ),
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 16),
              const Center(
                child: Icon(
                  Icons.security_outlined,
                  size: 72,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Location Diagnostics',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.onSurface),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              const Text(
                'FieldTrack relies on device telemetry to automate your duty operations, verify site attendance, and calculate your travel distance benefits.',
                style: TextStyle(fontSize: 13, color: AppColors.onSurfaceVariant, height: 1.5),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              
              // Diagnostic Tiles
              _buildStatusTile(
                icon: Icons.gps_fixed,
                title: 'Location Services (GPS)',
                subtitle: 'Enable GPS device sensor',
                onTap: () => Geolocator.openLocationSettings(),
                statusWidget: _serviceEnabled 
                    ? const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('ACTIVE ', style: TextStyle(fontSize: 12, color: Color(0xFF007230), fontWeight: FontWeight.bold)),
                          Icon(Icons.check_circle, color: Color(0xFF007230), size: 16),
                        ],
                      )
                    : const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('DISABLED ', style: TextStyle(fontSize: 12, color: AppColors.error, fontWeight: FontWeight.bold)),
                          Icon(Icons.warning_amber_rounded, color: AppColors.error, size: 16),
                        ],
                      ),
              ),
              const SizedBox(height: 16),
              _buildStatusTile(
                icon: Icons.my_location_outlined,
                title: 'Location Permissions',
                subtitle: _permissionStatus == LocationPermission.always 
                    ? 'Always Allow (Recommended)' 
                    : _permissionStatus == LocationPermission.whileInUse
                        ? 'While Using (Background limited)'
                        : 'Access Denied',
                onTap: () => Geolocator.openAppSettings(),
                statusWidget: _permissionStatus == LocationPermission.always
                    ? const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('ALWAYS ', style: TextStyle(fontSize: 12, color: Color(0xFF007230), fontWeight: FontWeight.bold)),
                          Icon(Icons.check_circle, color: Color(0xFF007230), size: 16),
                        ],
                      )
                    : _permissionStatus == LocationPermission.whileInUse
                        ? const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text('WHILE IN USE ', style: TextStyle(fontSize: 12, color: Colors.orange, fontWeight: FontWeight.bold)),
                              Icon(Icons.info_outline, color: Colors.orange, size: 16),
                            ],
                          )
                        : const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text('DENIED ', style: TextStyle(fontSize: 12, color: AppColors.error, fontWeight: FontWeight.bold)),
                              Icon(Icons.cancel, color: AppColors.error, size: 16),
                            ],
                          ),
              ),
              
              if (_permissionStatus == LocationPermission.whileInUse) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.orange.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.orange.withOpacity(0.3)),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.info_outline, color: Colors.orange, size: 18),
                      SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Background tracking works best when Location Permission is set to "Allow all the time" in your device settings.',
                          style: TextStyle(fontSize: 11, color: Colors.orange, height: 1.4),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              
              const Spacer(),
              
              CustomButton(
                text: isFullyGranted ? 'Settings Configured' : 'Grant Permissions',
                isLoading: _isRequesting,
                onPressed: isFullyGranted 
                    ? () {
                        if (widget.onPermissionsGranted != null) {
                          widget.onPermissionsGranted!();
                        } else {
                          Navigator.pop(context);
                        }
                      }
                    : _requestPermissions,
              ),
              const SizedBox(height: 8),
              if (widget.onPermissionsGranted == null)
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Back to Profile', style: TextStyle(color: AppColors.outline)),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
