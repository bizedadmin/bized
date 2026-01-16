import 'package:get/get.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user_model.dart';
import '../providers/api_provider.dart';
import '../../core/utils/logger.dart';

class AuthService extends GetxService {
  FirebaseAuth get _auth => FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();
  final _storage = const FlutterSecureStorage();
  final _apiProvider = Get.find<ApiProvider>();
  
  final Rx<UserModel?> currentUser = Rx<UserModel?>(null);

  @override
  void onInit() {
    super.onInit();
    loadUserFromStorage();
  }

  Future<void> loadUserFromStorage() async {
    try {
      final token = await _storage.read(key: 'session_token');
      if (token == null) {
        Logger.info('Auth', 'No session token found');
        return;
      }
      
      final session = await _getUserSession();
      if (session['user'] != null) {
        currentUser.value = UserModel.fromJson(session['user']);
        Logger.success('Auth', 'User loaded: ${currentUser.value?.email}');
      } else {
        Logger.warning('Auth', 'Empty session returned, clearing storage');
        await _storage.delete(key: 'session_token');
        await _storage.delete(key: 'user_data');
      }
    } catch (e) {
      Logger.error('Auth', 'Failed to load user from storage', error: e);
      // Clear invalid session
      await _storage.delete(key: 'session_token');
      await _storage.delete(key: 'user_data');
    }
  }

  Future<UserModel?> signInWithGoogle() async {
    try {
      Logger.info('Auth', 'Starting Google Sign-In...');
      
      // 1. Google Sign-In
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        Logger.warning('Auth', 'Google Sign-In cancelled by user');
        throw Exception('Sign in cancelled');
      }
      Logger.success('Auth', 'Google Sign-In successful: ${googleUser.email}');

      // 2. Get auth details
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;

      // 3. Create Firebase credential
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      // 4. Sign in to Firebase
      Logger.info('Auth', 'Signing in to Firebase...');
      final UserCredential userCredential = await _auth.signInWithCredential(credential);
      final String? firebaseToken = await userCredential.user?.getIdToken();

      if (firebaseToken == null) throw Exception('Failed to get Firebase token');
      Logger.success('Auth', 'Firebase Sign-In successful. UID: ${userCredential.user?.uid}');

      Logger.success('Auth', 'Firebase Sign-In successful. UID: ${userCredential.user?.uid}');

      // 5. Get CSRF Token
      final csrfToken = await _getCsrfToken();
      if (csrfToken == null) throw Exception('Failed to get CSRF token');

      // 6. Create session with backend
      Logger.info('Auth', 'Creating session with backend at ${_apiProvider.dio.options.baseUrl}...');
      final response = await _apiProvider.dio.post(
        '/api/auth/callback/firebase-google',
        data: {
          'idToken': firebaseToken,
          'csrfToken': csrfToken,
        },
      );
      Logger.success('Auth', 'Backend session created. Status: ${response.statusCode}');
      Logger.info('Auth', 'Headers: ${response.headers}');

      Logger.success('Auth', 'Backend session created. Status: ${response.statusCode}');
      Logger.info('Auth', 'Headers: ${response.headers}');

      dynamic userData;
      String? token;

      // Handle Redirect (302) or Success (200)
      if (response.statusCode == 302 || response.statusCode == 200) {
        // If we got a redirect (or even 200 OK from NextAuth maybe), we need to fetch the session
        // because the callback usually just sets the cookie and redirects.
        Logger.info('Auth', 'Login successful (Code ${response.statusCode}). Fetching user session...');
        
        final sessionData = await _getUserSession();
        userData = sessionData['user'];
        token = sessionData['expires']; // NextAuth session doesn't typically give a raw JWT token in the body, but we can treat the expiration or something else as an indicator, or just rely on cookies.
        // For existing app compatibility, we might need to fake a token or extract one if available.
        // If the app relies on 'session_token' for local logic (outside of cookies), we might need to adjust.
        // But for now, let's assume valid session data is enough.
        token = token ?? "session_cookie_active"; 
      } else {
         throw Exception('Login failed with status: ${response.statusCode}');
      }

      if (userData == null) throw Exception('Failed to retrieve user data');

      // 7. Store session
      await _storage.write(key: 'session_token', value: token);
      await _storage.write(key: 'user_data', value: userData.toString());


      final user = UserModel.fromJson(userData);
      currentUser.value = user;
      return user;
    } catch (e, stack) {
      Logger.error('Auth', 'Sign in failed', error: e, stackTrace: stack);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> _getUserSession() async {
    try {
      final response = await _apiProvider.dio.get('/api/auth/session');
      Logger.info('Auth', 'Session Response: ${response.data}');
      if (response.data != null && response.data is Map && response.data['user'] != null) {
        return response.data;
      }
      throw Exception('Invalid session data');
    } catch (e) {
      Logger.error('Auth', 'Failed to fetch user session', error: e);
      throw Exception('Failed to fetch user session');
    }
  }

  Future<String?> _getCsrfToken() async {
    try {
      Logger.info('Auth', 'Fetching CSRF token...');
      final response = await _apiProvider.dio.get('/api/auth/csrf');
      Logger.info('Auth', 'CSRF Response: ${response.data}');
      if (response.data != null && response.data is Map && response.data.containsKey('csrfToken')) {
         return response.data['csrfToken'];
      }
      return null;
    } catch (e) {
      Logger.error('Auth', 'Failed to fetch CSRF token', error: e);
      return null;
    }
  }

  Future<void> signOut() async {
    await _googleSignIn.signOut();
    await _auth.signOut();
    await _storage.delete(key: 'session_token');
    await _storage.delete(key: 'user_data');
  }

  Future<bool> isAuthenticated() async {
    final token = await _storage.read(key: 'session_token');
    return token != null;
  }
}
