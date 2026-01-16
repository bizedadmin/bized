import 'package:get/get.dart';
import '../../data/services/auth_service.dart';
import '../../data/models/user_model.dart';
import '../../core/utils/logger.dart';
import '../../data/providers/api_provider.dart';
import '../../routes/app_routes.dart';


class ProfileController extends GetxController {
  final AuthService _authService = Get.find<AuthService>();
  final ApiProvider _apiProvider = Get.find<ApiProvider>();

  final RxBool isLoading = true.obs;
  final RxBool isSaving = false.obs;

  final RxString name = ''.obs;
  final RxString email = ''.obs;
  final RxString jobTitle = ''.obs;
  final RxString bio = ''.obs;
  final RxString website = ''.obs;
  final RxString image = ''.obs;

  @override
  void onInit() {
    super.onInit();
    fetchProfile();
  }

  Future<void> fetchProfile() async {
    try {
      isLoading.value = true;
      final response = await _apiProvider.dio.get('/api/profile');

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        name.value = data['name'] ?? '';
        email.value = data['email'] ?? '';
        jobTitle.value = data['jobTitle'] ?? '';
        bio.value = data['bio'] ?? '';
        website.value = data['website'] ?? '';
        image.value = data['image'] ?? '';
      }
    } catch (e) {
      Logger.error('ProfileController', 'Failed to fetch profile', error: e);
      Get.snackbar('Error', 'Failed to load profile');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> saveProfile() async {
    try {
      isSaving.value = true;
      
      final response = await _apiProvider.dio.put(
        '/api/profile',
        data: {
          'name': name.value,
          'jobTitle': jobTitle.value,
          'bio': bio.value,
          'website': website.value,
          'image': image.value,
        },
      );


      if (response.statusCode == 200 && response.data != null) {
        // Update current user in AuthService
        final updatedUser = UserModel.fromJson(response.data);
        _authService.currentUser.value = updatedUser;
        
        // Only navigate if update was successful and user data is valid
        if (updatedUser.id.isNotEmpty) {
          Get.offNamed(
            AppRoutes.profileSummary,
            arguments: updatedUser, // Pass the freshly saved user data
          );
        } else {
          Get.snackbar(
            'Error',
            'Profile update succeeded but received invalid data',
            snackPosition: SnackPosition.BOTTOM,
          );
        }
      } else {
        Get.snackbar(
          'Error',
          'Failed to update profile (${response.statusCode})',
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (e) {
      Logger.error('ProfileController', 'Failed to save profile', error: e);
      Get.snackbar(
        'Error',
        'Failed to update profile',
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isSaving.value = false;
    }
  }
}
