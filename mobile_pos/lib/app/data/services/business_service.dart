import 'package:get/get.dart';
import '../providers/api_provider.dart';
import '../models/business_model.dart';
import '../../core/utils/logger.dart';

class BusinessService extends GetxService {
  final ApiProvider _apiProvider = Get.find<ApiProvider>();

  Future<List<Business>> getBusinesses() async {
    try {
      final response = await _apiProvider.dio.get('/api/businesses');
      
      if (response.statusCode == 200 && response.data != null) {
        Logger.info('BusinessService', 'Raw response: ${response.data}');
        final List<dynamic> data = response.data is List ? response.data : [response.data];
        return data.map((json) {
          try {
            return Business.fromJson(json);
          } catch (e) {
            Logger.error('BusinessService', 'Failed to parse business: $json', error: e);
            rethrow;
          }
        }).toList();
      }
      return [];
    } catch (e) {
      Logger.error('BusinessService', 'Failed to fetch businesses', error: e);
      rethrow;
    }
  }
}
