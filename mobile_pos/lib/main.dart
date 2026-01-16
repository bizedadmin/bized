import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'app/core/theme/app_colors.dart';
import 'app/routes/app_routes.dart';
import 'app/data/providers/api_provider.dart';
import 'app/data/services/auth_service.dart';
import 'app/modules/splash/splash_controller.dart';
import 'app/modules/auth/login/login_page.dart';
import 'app/modules/auth/login/login_binding.dart';
import 'app/modules/auth/register/register_page.dart';
import 'app/modules/auth/register/register_binding.dart';
import 'app/modules/onboarding/create_business/create_business_page.dart';
import 'app/modules/onboarding/create_business/create_business_binding.dart';
import 'app/modules/business/business_page.dart';
import 'app/modules/business/business_binding.dart';
import 'app/data/services/business_service.dart';
import 'app/modules/profile/profile_page.dart';
import 'app/modules/profile/profile_binding.dart';
import 'app/modules/profile/profile_summary_page.dart';
import 'app/data/services/current_business_service.dart';
import 'app/modules/home/home_page.dart';
import 'app/modules/home/home_binding.dart';
import 'app/modules/business_summary/business_summary_page.dart';
import 'app/modules/business_summary/business_summary_binding.dart';

import 'dart:ui';
import 'app/core/utils/logger.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Set up global error handling
  FlutterError.onError = (FlutterErrorDetails details) {
    Logger.error('FlutterError', details.exceptionAsString(), stackTrace: details.stack);
  };
  
  PlatformDispatcher.instance.onError = (error, stack) {
    Logger.error('PlatformError', error.toString(), stackTrace: stack);
    return true;
  };

  try {
    // Load environment variables
    await dotenv.load(fileName: ".env");
    Logger.info('Env', 'Environment variables loaded');
  } catch (e) {
    Logger.error('Env', 'Error loading .env', error: e);
  }
  
  // Initialize GetX services immediately
  Get.put(ApiProvider());
  Get.put(AuthService());
  Get.put(BusinessService());
  Get.put(CurrentBusinessService());
  
  // Initialize Firebase in background (don't await)
  Firebase.initializeApp().then((_) {
    Logger.success('Firebase', 'Initialized as configured');
  }).catchError((e) {
    Logger.warning('Firebase', 'Initialization skipped/failed: $e');
  });
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'Bized POS',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.light(
          primary: AppColors.primary,
          onPrimary: AppColors.primaryForeground,
          secondary: AppColors.secondary,
          onSecondary: AppColors.secondaryForeground,
          error: AppColors.destructive,
          onError: AppColors.destructiveForeground,
          surface: AppColors.background,
          onSurface: AppColors.foreground,
        ),
        scaffoldBackgroundColor: AppColors.background,
        appBarTheme: const AppBarTheme(
          backgroundColor: AppColors.background,
          foregroundColor: AppColors.foreground,
          elevation: 0,
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: AppColors.background,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: AppColors.input),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: AppColors.input),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: AppColors.ring, width: 2),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: AppColors.destructive, width: 2),
          ),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
      ),
      debugShowCheckedModeBanner: false,
      initialRoute: AppRoutes.splash,
      getPages: [
        GetPage(
          name: AppRoutes.splash,
          page: () => const SplashScreen(),
          binding: BindingsBuilder(() {
            Get.put(SplashController());
          }),
        ),
        GetPage(
          name: AppRoutes.login,
          page: () => const LoginPage(),
          binding: LoginBinding(),
        ),
        GetPage(
          name: AppRoutes.register,
          page: () => const RegisterPage(),
          binding: RegisterBinding(),
        ),
        GetPage(
          name: AppRoutes.createBusiness,
          page: () => const CreateBusinessPage(),
          binding: CreateBusinessBinding(),
        ),
        GetPage(
          name: AppRoutes.businessSelector,
          page: () => const BusinessPage(),
          binding: BusinessBinding(),
        ),
        GetPage(
          name: AppRoutes.profile,
          page: () => const ProfilePage(),
          binding: ProfileBinding(),
        ),
        GetPage(
          name: AppRoutes.profileSummary,
          page: () => const ProfileSummaryPage(),
        ),
        GetPage(
          name: AppRoutes.home,
          page: () => const HomePage(),
          binding: HomeBinding(),
        ),
        GetPage(
          name: AppRoutes.businessSummary,
          page: () => const BusinessSummaryPage(),
          binding: BusinessSummaryBinding(),
        ),
      ],
    );
  }
}

class SplashScreen extends GetView<SplashController> {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primary,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset(
              'assets/images/logo.png',
              width: 120,
              height: 120,
            ),
            const SizedBox(height: 20),
            const Text(
              'Bized POS',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.w700,
                color: AppColors.primaryForeground,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Business Operating System',
              style: TextStyle(
                fontSize: 16,
                color: AppColors.primaryForeground,
              ),
            ),
            const SizedBox(height: 40),
            const CircularProgressIndicator(
              color: AppColors.primaryForeground,
            ),
          ],
        ),
      ),
    );
  }
}
