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
    if (section == 'Business') {
      Get.toNamed(AppRoutes.businessSummary);
    } else {
      Get.snackbar('Coming Soon', '$section page is under development');
    }
  }

  void logout() {
    _authService.signOut();
    _businessService.clearCurrentBusiness();
    Get.offAllNamed('/login');
  }
}
