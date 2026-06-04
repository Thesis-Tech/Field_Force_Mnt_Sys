import 'dart:async';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'package:battery_plus/battery_plus.dart';
import '../core/utils/offline_cache.dart';
import '../core/utils/notification_helper.dart';
import 'api_service.dart';

/// `LocationService` is a Singleton that manages high-precision GPS tracking for Field Agents.
/// It integrates with `Geolocator` to spawn native foreground services (Android) or
/// fitness trackers (iOS) to ensure continuous background execution.
/// 
/// Key Features:
/// 1. 15-Minute Periodic Photo Prompts via local notifications.
/// 2. Automatic Stop-Point Detection (tags locations where user pauses for >30s).
/// 3. Offline queuing and batch uploading via `OfflineLocationCache`.
class LocationService {
  static final LocationService _instance = LocationService._internal();
  factory LocationService() => _instance;
  LocationService._internal();

  StreamSubscription<Position>? _positionStreamSubscription;
  Timer? _stopTimer;
  Timer? _photoPromptTimer;
  bool _isTracking = false;
  Position? _lastPosition;
  
  // Stream controller to notify UI elements of location updates
  final StreamController<Position> _locationStreamController = StreamController<Position>.broadcast();

  bool get isTracking => _isTracking;
  Position? get lastPosition => _lastPosition;
  Stream<Position> get onLocationChanged => _locationStreamController.stream;

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
  Future<void> startTracking({Function(Position)? onLocationUpdated}) async {
    if (_isTracking) return;

    final hasPermission = await requestPermission();
    if (!hasPermission) return;

    _isTracking = true;

    // Start 2-minute periodic timer for forced ping
    _photoPromptTimer = Timer.periodic(const Duration(minutes: 2), (timer) async {
      final position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.best);
      _pingServer(position);
    });

    LocationSettings locationSettings = const LocationSettings(
      accuracy: LocationAccuracy.best,
      distanceFilter: 5,
    );

    if (!kIsWeb) {
      if (Platform.isAndroid) {
        locationSettings = AndroidSettings(
            accuracy: LocationAccuracy.best,
            distanceFilter: 10,
            forceLocationManager: true,
            intervalDuration: const Duration(minutes: 2),
            foregroundNotificationConfig: const ForegroundNotificationConfig(
                notificationText:
                "Tracking your location in background for territory management.",
                notificationTitle: "FieldTrack Active",
                enableWakeLock: true,
            )
        );
      } else if (Platform.isIOS || Platform.isMacOS) {
        locationSettings = AppleSettings(
          accuracy: LocationAccuracy.best,
          activityType: ActivityType.fitness,
          distanceFilter: 5,
          pauseLocationUpdatesAutomatically: false,
          showBackgroundLocationIndicator: true,
        );
      }
    }

    _positionStreamSubscription = Geolocator.getPositionStream(
      locationSettings: locationSettings,
    ).listen((Position position) {
      _lastPosition = position;
      _locationStreamController.add(position);
      if (onLocationUpdated != null) {
        onLocationUpdated(position);
      }
      
      if (position.speed < 0.5) {
        if (_stopTimer == null || !_stopTimer!.isActive) {
          _stopTimer = Timer(const Duration(seconds: 30), () {
            _pingServer(position, isStopPoint: true);
          });
        }
      } else {
        _stopTimer?.cancel();
      }

      _pingServer(position);
    });
  }

  // Stop tracking
  Future<void> stopTracking() async {
    if (!_isTracking) return;
    await _positionStreamSubscription?.cancel();
    _stopTimer?.cancel();
    _photoPromptTimer?.cancel();
    _lastPosition = null;
    _isTracking = false;
  }

  // ----------------------------------------------------------------
  // PING SERVER & OFFLINE QUEUE BATCHING
  // ----------------------------------------------------------------
  /// Constructs the standard ping payload, merges it with any accumulated offline pings,
  /// and chunks the array into blocks of 50 to avoid HTTP Payload Too Large errors.
  /// If the API succeeds, the offline cache is flushed. If it fails (no internet),
  /// the current ping is pushed to the secure disk cache.
  Future<void> _pingServer(Position position, {bool isStopPoint = false}) async {
    final battery = Battery();
    final batteryLevel = await battery.batteryLevel;

    final currentPing = {
      'latitude': position.latitude,
      'longitude': position.longitude,
      'accuracy': position.accuracy,
      'speed': position.speed,
      'isMoving': !isStopPoint && position.speed > 0.5,
      'isStopPoint': isStopPoint,
      'batteryLevel': batteryLevel,
      'recordedAt': DateTime.now().toUtc().toIso8601String(),
    };

    try {
      // Load offline pings
      final cachedPings = await OfflineLocationCache.getAllLocations();
      final allPings = [...cachedPings, currentPing];

      // Send location log to server batch endpoint in chunks to avoid payload limits
      const int chunkSize = 50;
      for (var i = 0; i < allPings.length; i += chunkSize) {
        final chunk = allPings.sublist(i, i + chunkSize > allPings.length ? allPings.length : i + chunkSize);
        await ApiService.client.post(
          '/location/batch',
          data: {
            'locations': chunk
          },
        );
      }
      
      // If batch upload successful, wipe the local cache
      if (cachedPings.isNotEmpty) {
        await OfflineLocationCache.clearLocations();
      }

      // Also ping geofence check engine
      await ApiService.client.post(
        '/geofence/ping',
        data: currentPing,
      );
    } catch (e) {
      // Offline fallback: Save current ping to cache to sync later when connection is restored
      await OfflineLocationCache.saveLocation(currentPing);
    }
  }
}
