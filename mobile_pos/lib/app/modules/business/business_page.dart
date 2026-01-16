import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/theme/app_colors.dart';
import 'business_controller.dart';
import '../../widgets/user_profile_menu.dart';

class BusinessPage extends GetView<BusinessController> {
  const BusinessPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Select Business'),
        actions: [
          const UserProfileMenu(),
        ],
      ),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }

        if (controller.businesses.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('No businesses found'),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: controller.createNewBusiness,
                  child: const Text('Create New Business'),
                ),
              ],
            ),
          );
        }

        return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: controller.businesses.length + 1, // +1 for "Create New"
            itemBuilder: (context, index) {
              if (index == controller.businesses.length) {
                return _buildCreateNewCard();
              }

              final business = controller.businesses[index];
              return Card(
                elevation: 2,
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: ListTile(
                  contentPadding: const EdgeInsets.all(16),
                  leading: CircleAvatar(
                    backgroundColor: AppColors.primary.withOpacity(0.1),
                    child: Text(
                      business.name.substring(0, 1).toUpperCase(),
                      style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold),
                    ),
                  ),
                  title: Text(business.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(business.slug),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () => controller.selectBusiness(business),
                ),
              );
            },
          );
      }),
    );
  }

  Widget _buildCreateNewCard() {
    return Card(
      elevation: 0,
      color: Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: AppColors.primary, width: 1, style: BorderStyle.solid), // Dashed border is hard in standard Flutter, solid is fine for now
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: const CircleAvatar(
          backgroundColor: Colors.transparent,
          child: Icon(Icons.add, color: AppColors.primary),
        ),
        title: const Text('Create New Business', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
        onTap: controller.createNewBusiness,
      ),
    );
  }
}
