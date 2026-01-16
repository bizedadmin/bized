import 'package:get/get.dart';
import '../providers/api_provider.dart';
import '../models/product_model.dart';
import '../../core/utils/logger.dart';

class ProductService extends GetxService {
  final ApiProvider _apiProvider = Get.find<ApiProvider>();

  Future<List<Product>> getProducts(String businessId) async {
    try {
      final response = await _apiProvider.dio.get('/api/products?businessId=$businessId');
      
      if (response.statusCode == 200 && response.data != null) {
        Logger.info('ProductService', 'Fetched ${(response.data as List).length} products');
        final List<dynamic> data = response.data is List ? response.data : [response.data];
        return data.map((json) {
          try {
            return Product.fromJson(json);
          } catch (e) {
            Logger.error('ProductService', 'Failed to parse product: $json', error: e);
            rethrow;
          }
        }).toList();
      }
      return [];
    } catch (e) {
      Logger.error('ProductService', 'Failed to fetch products', error: e);
      rethrow;
    }
  }
}
