import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../core/theme/app_colors.dart';
import '../../../widgets/custom_button.dart';
import '../../../widgets/custom_card.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'create_business_controller.dart';
import '../../../widgets/user_profile_menu.dart';

class CreateBusinessPage extends GetView<CreateBusinessController> {
  const CreateBusinessPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Create Business'),
        backgroundColor: AppColors.background,
        actions: [
          const UserProfileMenu(),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Step indicator
            Obx(() => _buildStepIndicator()),
            
            // Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Obx(() {
                  switch (controller.currentStep.value) {
                    case 0:
                      return _buildStep1();
                    case 1:
                      return _buildStep2();
                    case 2:
                      return _buildStep3();
                    case 3:
                      return _buildStep4();
                    default:
                      return _buildStep1();
                  }
                }),
              ),
            ),
            
            // Navigation buttons
            Obx(() => _buildNavigationButtons()),
          ],
        ),
      ),
    );
  }

  Widget _buildStepIndicator() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(4, (index) {
          final isActive = index == controller.currentStep.value;
          final isCompleted = index < controller.currentStep.value;
          
          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 4),
            width: isActive ? 32 : 8,
            height: 8,
            decoration: BoxDecoration(
              color: isActive || isCompleted 
                  ? AppColors.primary 
                  : AppColors.muted,
              borderRadius: BorderRadius.circular(4),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildStep1() {
    return CustomCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Business Basics',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Tell us about your business',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.mutedForeground,
            ),
          ),
          const SizedBox(height: 24),
          
          // Business name
          TextField(
            decoration: const InputDecoration(
              labelText: 'Business Name',
              hintText: 'Enter your business name',
            ),
            onChanged: (value) {
              controller.businessName.value = value;
              controller.generateSlug(value);
            },
          ),
          const SizedBox(height: 16),
          
          // Slug
          Obx(() => TextField(
            decoration: InputDecoration(
              labelText: 'Business URL',
              hintText: 'your-business-url',
              prefix: const Text('bized.app/'),
            ),
            controller: TextEditingController(text: controller.slug.value),
            onChanged: (value) => controller.slug.value = value,
          )),
          const SizedBox(height: 16),
          
          // Email
          TextField(
            decoration: const InputDecoration(
              labelText: 'Business Email',
              hintText: 'business@example.com',
            ),
            keyboardType: TextInputType.emailAddress,
            onChanged: (value) => controller.email.value = value,
          ),
        ],
      ),
    );
  }

  Widget _buildStep2() {
    final categories = [
      {'name': 'Retail', 'icon': '🏪'},
      {'name': 'Restaurant', 'icon': '🍽️'},
      {'name': 'Services', 'icon': '🔧'},
      {'name': 'Healthcare', 'icon': '🏥'},
      {'name': 'Education', 'icon': '📚'},
      {'name': 'Other', 'icon': '📦'},
    ];

    return CustomCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Business Category',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Select your business category',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.mutedForeground,
            ),
          ),
          const SizedBox(height: 24),
          
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.5,
            ),
            itemCount: categories.length,
            itemBuilder: (context, index) {
              final category = categories[index];
              final isSelected = controller.selectedCategory.value == category['name'];
              
              return Obx(() => GestureDetector(
                onTap: () => controller.selectedCategory.value = category['name']!,
                child: Container(
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.primary.withOpacity(0.1) : AppColors.muted,
                    border: Border.all(
                      color: isSelected ? AppColors.primary : AppColors.border,
                      width: 2,
                    ),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        category['icon']!,
                        style: const TextStyle(fontSize: 32),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        category['name']!,
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          color: isSelected ? AppColors.primary : AppColors.foreground,
                        ),
                      ),
                    ],
                  ),
                ),
              ));
            },
          ),
        ],
      ),
    );
  }

  Widget _buildStep3() {
    final types = [
      {'name': 'Retailer', 'desc': 'Sell directly to consumers'},
      {'name': 'Distributor', 'desc': 'Supply goods to businesses'},
      {'name': 'Manufacturer', 'desc': 'Produce goods'},
      {'name': 'Service Provider', 'desc': 'Offer services'},
    ];

    return CustomCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Business Type',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'How does your business operate?',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.mutedForeground,
            ),
          ),
          const SizedBox(height: 24),
          
          ...types.map((type) {
            final isSelected = controller.selectedBusinessType.value == type['name'];
            
            return Obx(() => GestureDetector(
              onTap: () => controller.selectedBusinessType.value = type['name']!,
              child: Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primary.withOpacity(0.1) : AppColors.muted,
                  border: Border.all(
                    color: isSelected ? AppColors.primary : AppColors.border,
                    width: 2,
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      type['name']!,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: isSelected ? AppColors.primary : AppColors.foreground,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      type['desc']!,
                      style: const TextStyle(
                        fontSize: 14,
                        color: AppColors.mutedForeground,
                      ),
                    ),
                  ],
                ),
              ),
            ));
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildStep4() {
    return CustomCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Contact Information',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'How can customers reach you?',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.mutedForeground,
            ),
          ),
          const SizedBox(height: 24),
          
          // Phone number
          Row(
            children: [
              // Country code
              Container(
                width: 100,
                margin: const EdgeInsets.only(right: 12),
                child: TextField(
                  decoration: const InputDecoration(
                    labelText: 'Code',
                  ),
                  controller: TextEditingController(text: controller.countryCode.value),
                  onChanged: (value) => controller.countryCode.value = value,
                ),
              ),
              // Phone number
              Expanded(
                child: TextField(
                  decoration: const InputDecoration(
                    labelText: 'Phone Number',
                    hintText: '712345678',
                  ),
                  keyboardType: TextInputType.phone,
                  onChanged: (value) => controller.phoneNumber.value = value,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildNavigationButtons() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.background,
        border: Border(
          top: BorderSide(color: AppColors.border),
        ),
      ),
      child: Row(
        children: [
          if (controller.currentStep.value > 0)
            Expanded(
              child: CustomButton(
                onPressed: controller.previousStep,
                variant: ButtonVariant.outline,
                child: const Text('Back'),
              ),
            ),
          if (controller.currentStep.value > 0)
            const SizedBox(width: 12),
          Expanded(
            child: CustomButton(
              onPressed: controller.currentStep.value < 3
                  ? controller.nextStep
                  : controller.createBusiness,
              isLoading: controller.isLoading.value,
              child: Text(
                controller.currentStep.value < 3 ? 'Next' : 'Create Business',
              ),
            ),
          ),
        ],
      ),
    );
  }
}
