import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import '../../core/theme/app_colors.dart';
import '../../widgets/user_profile_menu.dart';
import 'home_controller.dart';

class HomePage extends GetView<HomeController> {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final items = [
      {'title': 'Business', 'icon': Icons.business, 'color': Colors.blue},
      {'title': 'Bookings', 'icon': Icons.event, 'color': Colors.purple},
      {'title': 'Quotes', 'icon': Icons.receipt_long, 'color': Colors.orange},
      {'title': 'Store', 'icon': Icons.store, 'color': Colors.green},
      {'title': 'Services', 'icon': Icons.room_service, 'color': Colors.teal},
      {'title': 'Products', 'icon': Icons.inventory, 'color': Colors.indigo},
      {'title': 'Customers', 'icon': Icons.people, 'color': Colors.pink},
      {'title': 'Chats', 'icon': Icons.chat, 'color': Colors.cyan},
    ];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Obx(() => Text(controller.currentBusiness?.name ?? 'Dashboard')),
        backgroundColor: AppColors.background,
        actions: [
          const UserProfileMenu(),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: MasonryGridView.count(
          crossAxisCount: 2,
          mainAxisSpacing: 16,
          crossAxisSpacing: 16,
          itemCount: items.length,
          itemBuilder: (context, index) {
            final item = items[index];
            return _buildDashboardCard(
              title: item['title'] as String,
              icon: item['icon'] as IconData,
              color: item['color'] as Color,
              onTap: () => controller.navigateToSection(item['title'] as String),
            );
          },
        ),
      ),
    );
  }

  Widget _buildDashboardCard({
    required String title,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                size: 40,
                color: color,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
