import 'package:get/get.dart';
import 'business_controller.dart';

class BusinessBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<BusinessController>(() => BusinessController());
  }
}
