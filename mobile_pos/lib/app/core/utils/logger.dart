import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:get/get.dart';

class Logger {
  static void info(String tag, String message) {
    if (kDebugMode) {
      print('ℹ️ [$tag] $message');
    }
  }

  static void error(String tag, String message, {dynamic error, StackTrace? stackTrace}) {
    if (kDebugMode) {
      print('🔴 [$tag] ERROR: $message');
      if (error != null) {
        print('   Details: $error');
      }
      if (stackTrace != null) {
        print('   StackTrace: $stackTrace');
      }
    }
    
    // Show snackbar for visible feedback during development
    if (Get.isSnackbarOpen != true) {
      Get.snackbar(
        'Error in $tag',
        message,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFfee2e2),
        colorText: const Color(0xFFef4444),
        duration: const Duration(seconds: 4),
        margin: const EdgeInsets.all(12),
        isDismissible: true,
      );
    }
  }

  static void warning(String tag, String message) {
    if (kDebugMode) {
      print('⚠️ [$tag] $message');
    }
  }
  
  static void success(String tag, String message) {
    if (kDebugMode) {
      print('✅ [$tag] $message');
    }
  }
}
