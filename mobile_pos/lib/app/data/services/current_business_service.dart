import 'package:get/get.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/business_model.dart';
import 'dart:convert';

class CurrentBusinessService extends GetxService {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  final Rx<Business?> currentBusiness = Rx<Business?>(null);

  Future<void> setCurrentBusiness(Business business) async {
    currentBusiness.value = business;
    // Save to secure storage
    await _storage.write(
      key: 'current_business',
      value: jsonEncode(business.toJson()),
    );
  }

  Future<void> loadCurrentBusiness() async {
    final businessJson = await _storage.read(key: 'current_business');
    if (businessJson != null) {
      currentBusiness.value = Business.fromJson(jsonDecode(businessJson));
    }
  }

  Future<void> clearCurrentBusiness() async {
    currentBusiness.value = null;
    await _storage.delete(key: 'current_business');
  }
}
