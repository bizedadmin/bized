import 'package:dio/dio.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get/get.dart' hide Response;
import 'package:cookie_jar/cookie_jar.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import '../../core/utils/logger.dart';

class ApiProvider extends GetxService {
  late Dio dio;
  final _storage = const FlutterSecureStorage();

  @override
  void onInit() {
    super.onInit();
    final baseUrl = dotenv.env['API_URL'] ?? 'http://localhost:3000';
    Logger.info('ApiProvider', 'Initializing with Base URL: $baseUrl');
    
    dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      validateStatus: (status) {
        return status != null && status < 500;
      },
      followRedirects: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    
    // Cookie JAR
    final cookieJar = CookieJar();
    dio.interceptors.add(CookieManager(cookieJar));

    // Add interceptor for auth token and logging
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        Logger.info('API Request', '${options.method} ${options.path}');
        final token = await _storage.read(key: 'session_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onResponse: (response, handler) {
        Logger.success('API Response', '${response.statusCode} ${response.requestOptions.path}');
        return handler.next(response);
      },
      onError: (error, handler) async {
        Logger.error(
          'API Error', 
          '${error.response?.statusCode} ${error.type}',
          error: error.message,
          stackTrace: error.stackTrace,
        );
        
        if (error.response?.statusCode == 401) {
          Logger.warning('API Auth', 'Token expired or invalid. Clearing session.');
          await _storage.delete(key: 'session_token');
          await _storage.delete(key: 'user_data');
        }
        return handler.next(error);
      },
    ));
  }
}
