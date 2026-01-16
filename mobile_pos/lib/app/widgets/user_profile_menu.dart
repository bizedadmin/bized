import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../core/theme/app_colors.dart';
import '../data/services/auth_service.dart';
import '../routes/app_routes.dart';

class UserProfileMenu extends StatelessWidget {
  const UserProfileMenu({super.key});

  @override
  Widget build(BuildContext context) {
    final authService = Get.find<AuthService>();

    return Obx(() {
      final user = authService.currentUser.value;
      if (user == null) return const SizedBox();

      return PopupMenuButton<String>(
        onSelected: (value) {
          if (value == 'logout') {
            authService.signOut();
            Get.offAllNamed(AppRoutes.login);
          } else if (value == 'profile') {
            Get.toNamed(AppRoutes.profile);
          } else if (value == 'settings') {
            // TODO: Navigate to settings page
            Get.snackbar('Info', 'Settings page coming soon');
          }
        },
        itemBuilder: (context) => [
          PopupMenuItem(
            enabled: false,
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    user.name,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: AppColors.foreground,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    user.email,
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppColors.mutedForeground,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const PopupMenuDivider(),
          const PopupMenuItem(
            value: 'profile',
            child: Row(
              children: [
                Icon(Icons.person_outline, color: AppColors.foreground, size: 20),
                SizedBox(width: 12),
                Text('My Profile', style: TextStyle(fontSize: 15)),
              ],
            ),
          ),
          const PopupMenuItem(
            value: 'settings',
            child: Row(
              children: [
                Icon(Icons.settings_outlined, color: AppColors.foreground, size: 20),
                SizedBox(width: 12),
                Text('Account Settings', style: TextStyle(fontSize: 15)),
              ],
            ),
          ),
          const PopupMenuDivider(),
          const PopupMenuItem(
            value: 'logout',
            child: Row(
              children: [
                Icon(Icons.logout, color: AppColors.destructive, size: 20),
                SizedBox(width: 12),
                Text('Log out', style: TextStyle(color: AppColors.destructive, fontSize: 15)),
              ],
            ),
          ),
        ],
        child: Padding(
          padding: const EdgeInsets.only(right: 16),
          child: CircleAvatar(
            radius: 18,
            backgroundColor: AppColors.primary.withOpacity(0.1),
            backgroundImage: user.image != null && user.image!.isNotEmpty
                ? CachedNetworkImageProvider(user.image!)
                : null,
            child: user.image == null || user.image!.isEmpty
                ? Text(
                    user.name.isNotEmpty ? user.name[0].toUpperCase() : 'U',
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  )
                : null,
          ),
        ),
      );
    });
  }
}
