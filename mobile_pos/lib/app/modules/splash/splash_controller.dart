import 'package:get/get.dart';
import '../../data/services/auth_service.dart';
import '../../data/services/business_service.dart';
import '../../routes/app_routes.dart';

class SplashController extends GetxController {
  final AuthService _authService = Get.find<AuthService>();

  @override
  void onInit() {
    super.onInit();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    // Show splash for 2 seconds
    await Future.delayed(const Duration(seconds: 2));

    try {
      final isAuthenticated = await _authService.isAuthenticated();
      
      if (isAuthenticated) {
        // User is logged in, check for businesses
        final businessService = Get.find<BusinessService>();
        final businesses = await businessService.getBusinesses();

        if (businesses.isNotEmpty) {
          Get.offNamed(AppRoutes.businessSelector);
        } else {
          Get.offNamed(AppRoutes.createBusiness);
        }
      } else {
        // User not logged in, go to login
        Get.offNamed(AppRoutes.login);
      }
    } catch (e) {
      // On error, go to login
      await _authService.signOut();
      Get.offNamed(AppRoutes.login);
    }
  }
}
