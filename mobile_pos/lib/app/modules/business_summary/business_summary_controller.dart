import 'package:get/get.dart';
import '../../data/services/current_business_service.dart';

class BusinessSummaryController extends GetxController {
  final CurrentBusinessService _currentBusinessService = Get.find<CurrentBusinessService>();

  get business => _currentBusinessService.currentBusiness.value;
}
