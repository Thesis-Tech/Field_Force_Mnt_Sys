import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'api_service.dart';

class LocationService {
  StreamSubscription<Position>? _positionStreamSubscription;
  bool _isTracking = false;

  bool get isTracking => _isTracking;

  // Request permissions
  Future<bool> requestPermission() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return false;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return false;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      return false;
    }

    return true;
  }

  // Start background or active tracking
  Future<void> startTracking(Function(Position) onLocationChanged) async {
    if (_isTracking) return;

    final hasPermission = await requestPermission();
    if (!hasPermission) return;

    _isTracking = true;

    // Track active position changes
    _positionStreamSubscription = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10, // 10 meters
      ),
    ).listen((Position position) {
      onLocationChanged(position);
      _pingServer(position);
    });
  }

  // Stop tracking
  Future<void> stopTracking() async {
    if (!_isTracking) return;
    await _positionStreamSubscription?.cancel();
    _isTracking = false;
  }

  // Ping coordinates to the backend
  Future<void> _pingServer(Position position) async {
    try {
      // Send location log to server batch endpoint
      await ApiService.client.post(
        '/location/batch',
        data: {
          'logs': [
            {
              'latitude': position.latitude,
              'longitude': position.longitude,
              'speed': position.speed,
              'batteryLevel': 100.0, // Mock or fetch actual battery level
              'timestamp': DateTime.now().toIso8601String(),
            }
          ]
        },
      );
      
      // Also ping geofence check engine
      await ApiService.client.post(
        '/geofence/ping',
        data: {
          'latitude': position.latitude,
          'longitude': position.longitude,
          'timestamp': DateTime.now().toIso8601String(),
        },
      );
    } catch (e) {
      // Offline fallback: silenty catch network issues during location updates
    }
  }
}
