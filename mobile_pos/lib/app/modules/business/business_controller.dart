import 'package:get/get.dart';
import '../../data/services/business_service.dart';
import '../../data/models/business_model.dart';
import '../../routes/app_routes.dart';
import '../../core/utils/logger.dart';
import '../../data/services/auth_service.dart';
import '../../data/services/current_business_service.dart'; // Added import

class BusinessController extends GetxController {
  final BusinessService _businessService = Get.find<BusinessService>();
  final CurrentBusinessService _currentBusinessService = Get.find<CurrentBusinessService>(); // Added service instance
  
  final RxList<Business> businesses = <Business>[].obs;
  final RxBool isLoading = true.obs;

  @override
  void onInit() {
    super.onInit();
    fetchBusinesses();
  }

  Future<void> fetchBusinesses() async {
    try {
      isLoading.value = true;
      businesses.value = await _businessService.getBusinesses();
    } catch (e) {
      Logger.error('BusinessController', 'Error fetching businesses', error: e);
      
      // Check if it's an authentication error
      if (e.toString().contains('401') || e.toString().contains('Unauthorized')) {
        // User is not authenticated, redirect to login
        Get.find<AuthService>().signOut();
        Get.offAllNamed(AppRoutes.login);
      } else {
        Get.snackbar('Error', 'Failed to load businesses');
      }
    } finally {
      isLoading.value = false;
    }
  }

  void selectBusiness(Business business) async { // Modified method signature and body
    await _currentBusinessService.setCurrentBusiness(business);
    Get.offAllNamed(AppRoutes.home);
  }

  void createNewBusiness() {
    Get.toNamed(AppRoutes.createBusiness);
  }
  
  void logout() {
    Get.find<AuthService>().signOut();
    Get.offAllNamed(AppRoutes.login);
  }
}
