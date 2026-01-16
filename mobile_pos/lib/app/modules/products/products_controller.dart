import 'package:get/get.dart';
import '../../data/services/current_business_service.dart';
import '../../data/services/product_service.dart';
import '../../data/models/product_model.dart';
import '../../core/utils/logger.dart';

class ProductsController extends GetxController {
  final CurrentBusinessService _businessService = Get.find<CurrentBusinessService>();
  final ProductService _productService = Get.find<ProductService>();

  final RxList<Product> products = <Product>[].obs;
  final RxBool isLoading = true.obs;
  final RxString searchQuery = ''.obs;

  @override
  void onInit() {
    super.onInit();
    fetchProducts();
  }

  Future<void> fetchProducts() async {
    final business = _businessService.currentBusiness.value;
    if (business == null) {
      Logger.error('ProductsController', 'No business selected');
      isLoading.value = false;
      return;
    }

    try {
      isLoading.value = true;
      products.value = await _productService.getProducts(business.id!);
    } catch (e) {
      Logger.error('ProductsController', 'Failed to fetch products', error: e);
      Get.snackbar('Error', 'Failed to load products');
    } finally {
      isLoading.value = false;
    }
  }

  List<Product> get filteredProducts {
    if (searchQuery.value.isEmpty) return products;
    return products.where((product) {
      return product.name.toLowerCase().contains(searchQuery.value.toLowerCase()) ||
          (product.category?.toLowerCase().contains(searchQuery.value.toLowerCase()) ?? false);
    }).toList();
  }
}
