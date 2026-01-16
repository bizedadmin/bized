import 'package:get/get.dart';
import '../../../data/services/auth_service.dart';
import '../../../data/models/user_model.dart';
import '../../../routes/app_routes.dart';

class CreateBusinessController extends GetxController {
  final AuthService _authService = Get.find<AuthService>();
  
  UserModel? get currentUser => _authService.currentUser.value;

  @override
  void onInit() {
    super.onInit();
    _checkAuthentication();
  }

  Future<void> _checkAuthentication() async {
    try {
      // Wait for auth service to load user
      await Future.delayed(const Duration(milliseconds: 500));
      
      if (_authService.currentUser.value == null) {
        // User not authenticated, redirect to login
        await _authService.signOut();
        Get.offAllNamed(AppRoutes.login);
      }
    } catch (e) {
      // Error loading user, redirect to login
      await _authService.signOut();
      Get.offAllNamed(AppRoutes.login);
    }
  }

  final RxInt currentStep = 0.obs;
  final RxBool isLoading = false.obs;
  
  // Form fields
  final RxString businessName = ''.obs;
  final RxString slug = ''.obs;
  final RxString email = ''.obs;
  final RxString selectedCategory = ''.obs;
  final RxString selectedBusinessType = ''.obs;
  final RxString phoneNumber = ''.obs;
  final RxString countryCode = '+254'.obs;

  void nextStep() {
    if (currentStep.value < 3) {
      currentStep.value++;
    }
  }

  void previousStep() {
    if (currentStep.value > 0) {
      currentStep.value--;
    }
  }

  void generateSlug(String name) {
    slug.value = name
        .toLowerCase()
        .replaceAll(RegExp(r'[^a-z0-9]+'), '-')
        .replaceAll(RegExp(r'^-|-$'), '');
  }

  Future<void> createBusiness() async {
    try {
      isLoading.value = true;
      
      // TODO: Call API to create business
      await Future.delayed(const Duration(seconds: 2)); // Simulate API call
      
      Get.snackbar(
        'Success',
        'Business created successfully!',
        snackPosition: SnackPosition.BOTTOM,
      );
      
      // Navigate to dashboard (for now, just show success)
    } catch (e) {
      Get.snackbar(
        'Error',
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> signOut() async {
    await _authService.signOut();
    Get.offAllNamed(AppRoutes.login);
  }
}
