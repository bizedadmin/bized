import 'package:get/get.dart';
import '../../data/services/current_business_service.dart';
import '../../data/services/auth_service.dart';
import '../../routes/app_routes.dart';

class HomeController extends GetxController {
  final CurrentBusinessService _businessService = Get.find<CurrentBusinessService>();
  final AuthService _authService = Get.find<AuthService>();

  get currentBusiness => _businessService.currentBusiness.value;
  get currentUser => _authService.currentUser.value;

  void navigateToSection(String section) {
    switch (section) {
      case 'Business':
        Get.toNamed(AppRoutes.businessSummary);
        break;
      case 'Products':
        Get.toNamed(AppRoutes.products);
        break;
      case 'Services':
        Get.toNamed(AppRoutes.services);
        break;
      default:
        Get.snackbar('Coming Soon', '$section page is under development');
    }
  }

  void logout() {
    _authService.signOut();
    _businessService.clearCurrentBusiness();
    Get.offAllNamed('/login');
  }
}
