import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/theme/app_colors.dart';
import '../../widgets/user_profile_menu.dart';
import 'services_controller.dart';

class ServicesPage extends GetView<ServicesController> {
  const ServicesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Services'),
        backgroundColor: AppColors.background,
        actions: [
          const UserProfileMenu(),
        ],
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              onChanged: (value) => controller.searchQuery.value = value,
              decoration: InputDecoration(
                hintText: 'Search services...',
                prefixIcon: const Icon(Icons.search, color: AppColors.mutedForeground),
                filled: true,
                fillColor: AppColors.card,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
              ),
            ),
          ),

          // Services List
          Expanded(
            child: Obx(() {
              if (controller.isLoading.value) {
                return const Center(child: CircularProgressIndicator());
              }

              final filteredServices = controller.filteredServices;

              if (filteredServices.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.room_service_outlined, size: 64, color: AppColors.mutedForeground),
                      const SizedBox(height: 16),
                      const Text(
                        'No services found',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Add services to get started',
                        style: TextStyle(
                          color: AppColors.mutedForeground,
                        ),
                      ),
                    ],
                  ),
                );
              }

              return ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: filteredServices.length,
                itemBuilder: (context, index) {
                  final service = filteredServices[index];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    color: AppColors.card,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: const BorderSide(color: AppColors.border),
                    ),
                    child: ListTile(
                      contentPadding: const EdgeInsets.all(12),
                      leading: Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          color: AppColors.muted,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: service.image.isNotEmpty
                            ? ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: Image.network(
                                  service.image.first,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) {
                                    return const Icon(Icons.room_service, color: AppColors.mutedForeground);
                                  },
                                ),
                              )
                            : const Icon(Icons.room_service, color: AppColors.mutedForeground),
                      ),
                      title: Text(
                        service.name,
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 16,
                        ),
                      ),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 4),
                          Text(
                            service.serviceType ?? service.category ?? 'Service',
                            style: const TextStyle(
                              color: AppColors.mutedForeground,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              if (service.duration != null) ...[
                                Text(
                                  '${service.duration} mins • ',
                                  style: const TextStyle(
                                    color: AppColors.mutedForeground,
                                    fontSize: 13,
                                  ),
                                ),
                              ],
                              Text(
                                '${service.offers?.priceCurrency ?? 'USD'} ${service.offers?.price.toStringAsFixed(0) ?? '0'}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.w600,
                                  fontSize: 15,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      trailing: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: service.status == 'online' || service.status == 'active'
                              ? Colors.green.withOpacity(0.1)
                              : Colors.grey.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: service.status == 'online' || service.status == 'active'
                                ? Colors.green
                                : Colors.grey,
                          ),
                        ),
                        child: Text(
                          service.status == 'online' || service.status == 'active' ? 'Online' : 'Offline',
                          style: TextStyle(
                            color: service.status == 'online' || service.status == 'active'
                                ? Colors.green
                                : Colors.grey,
                            fontWeight: FontWeight.w600,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ),
                  );
                },
              );
            }),
          ),
        ],
      ),
    );
  }
}
