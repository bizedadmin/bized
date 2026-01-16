import 'package:get/get.dart';
import '../../../data/services/auth_service.dart';
import '../../../data/services/business_service.dart';
import '../../../routes/app_routes.dart';

class LoginController extends GetxController {
  final AuthService _authService = Get.find<AuthService>();
  
  final RxBool isLoading = false.obs;

  Future<void> signInWithGoogle() async {
    try {
      isLoading.value = true;
      
      await _authService.signInWithGoogle();
      
      // Check for existing businesses
      final businessService = Get.find<BusinessService>();
      final businesses = await businessService.getBusinesses();

      if (businesses.isNotEmpty) {
        Get.offAllNamed(AppRoutes.businessSelector);
      } else {
        Get.offAllNamed(AppRoutes.createBusiness);
      }
    } catch (e) {
      Get.snackbar(
        'Login Failed',
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isLoading.value = false;
    }
  }

  void goToRegister() {
    Get.toNamed(AppRoutes.register);
  }

  void debugSkipLogin() {
    Get.offAllNamed(AppRoutes.createBusiness);
  }
}
