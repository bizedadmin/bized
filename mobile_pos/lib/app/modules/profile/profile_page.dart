import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/theme/app_colors.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_card.dart';
import '../../widgets/user_profile_menu.dart';
import 'profile_controller.dart';

class ProfilePage extends GetView<ProfileController> {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Profile'),
        backgroundColor: AppColors.background,
        actions: [
          const UserProfileMenu(),
        ],
      ),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }

        return SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Account Settings',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Manage your personal account details.',
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.mutedForeground,
                ),
              ),
              const SizedBox(height: 24),

              CustomCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Public Profile',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'This information will be displayed publicly on your profile page.',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColors.mutedForeground,
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Full Name
                    const Text(
                      'Full Name',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: TextEditingController(text: controller.name.value)
                        ..selection = TextSelection.fromPosition(
                          TextPosition(offset: controller.name.value.length),
                        ),
                      decoration: const InputDecoration(
                        hintText: 'Enter your full name',
                      ),
                      onChanged: (value) => controller.name.value = value,
                    ),
                    const SizedBox(height: 16),

                    // Email (disabled)
                    const Text(
                      'Email',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: TextEditingController(text: controller.email.value),
                      decoration: InputDecoration(
                        hintText: 'Email',
                        fillColor: AppColors.muted,
                        filled: true,
                      ),
                      enabled: false,
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Email cannot be changed.',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.mutedForeground,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Job Title
                    const Text(
                      'Job Title',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: TextEditingController(text: controller.jobTitle.value)
                        ..selection = TextSelection.fromPosition(
                          TextPosition(offset: controller.jobTitle.value.length),
                        ),
                      decoration: const InputDecoration(
                        hintText: 'e.g. Software Engineer',
                      ),
                      onChanged: (value) => controller.jobTitle.value = value,
                    ),
                    const SizedBox(height: 16),

                    // Website
                    const Text(
                      'Website',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: TextEditingController(text: controller.website.value)
                        ..selection = TextSelection.fromPosition(
                          TextPosition(offset: controller.website.value.length),
                        ),
                      decoration: const InputDecoration(
                        hintText: 'https://your-website.com',
                      ),
                      keyboardType: TextInputType.url,
                      onChanged: (value) => controller.website.value = value,
                    ),
                    const SizedBox(height: 16),

                    // Bio
                    const Text(
                      'Bio',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: TextEditingController(text: controller.bio.value)
                        ..selection = TextSelection.fromPosition(
                          TextPosition(offset: controller.bio.value.length),
                        ),
                      decoration: const InputDecoration(
                        hintText: 'Tell us a little about yourself',
                      ),
                      maxLines: 4,
                      onChanged: (value) => controller.bio.value = value,
                    ),
                    const SizedBox(height: 24),

                    // Save Button
                    Align(
                      alignment: Alignment.centerRight,
                      child: CustomButton(
                        onPressed: controller.saveProfile,
                        isLoading: controller.isSaving.value,
                        child: const Text('Save Changes'),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      }),
    );
  }
}
