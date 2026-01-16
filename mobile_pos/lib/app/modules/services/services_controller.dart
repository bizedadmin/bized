import 'package:get/get.dart';
import '../../data/services/current_business_service.dart';
import '../../data/services/service_service.dart';
import '../../data/models/service_model.dart';
import '../../core/utils/logger.dart';

class ServicesController extends GetxController {
  final CurrentBusinessService _businessService = Get.find<CurrentBusinessService>();
  final ServiceService _serviceService = Get.find<ServiceService>();

  final RxList<Service> services = <Service>[].obs;
  final RxBool isLoading = true.obs;
  final RxString searchQuery = ''.obs;

  @override
  void onInit() {
    super.onInit();
    fetchServices();
  }

  Future<void> fetchServices() async {
    final business = _businessService.currentBusiness.value;
    if (business == null) {
      Logger.error('ServicesController', 'No business selected');
      isLoading.value = false;
      return;
    }

    try {
      isLoading.value = true;
      services.value = await _serviceService.getServices(business.id!);
    } catch (e) {
      Logger.error('ServicesController', 'Failed to fetch services', error: e);
      Get.snackbar('Error', 'Failed to load services');
    } finally {
      isLoading.value = false;
    }
  }

  List<Service> get filteredServices {
    if (searchQuery.value.isEmpty) return services;
    return services.where((service) {
      return service.name.toLowerCase().contains(searchQuery.value.toLowerCase()) ||
          (service.serviceType?.toLowerCase().contains(searchQuery.value.toLowerCase()) ?? false);
    }).toList();
  }
}
