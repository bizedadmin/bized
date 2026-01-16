import 'package:get/get.dart';
import 'business_summary_controller.dart';

class BusinessSummaryBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<BusinessSummaryController>(() => BusinessSummaryController());
  }
}
