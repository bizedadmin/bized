import 'package:get/get.dart';
import '../providers/api_provider.dart';
import '../models/service_model.dart';
import '../../core/utils/logger.dart';

class ServiceService extends GetxService {
  final ApiProvider _apiProvider = Get.find<ApiProvider>();

  Future<List<Service>> getServices(String businessId) async {
    try {
      final response = await _apiProvider.dio.get('/api/business/services?businessId=$businessId');
      
      if (response.statusCode == 200 && response.data != null) {
        Logger.info('ServiceService', 'Fetched ${(response.data as List).length} services');
        final List<dynamic> data = response.data is List ? response.data : [response.data];
        return data.map((json) {
          try {
            return Service.fromJson(json);
          } catch (e) {
            Logger.error('ServiceService', 'Failed to parse service: $json', error: e);
            rethrow;
          }
        }).toList();
      }
      return [];
    } catch (e) {
      Logger.error('ServiceService', 'Failed to fetch services', error: e);
      rethrow;
    }
  }
}
