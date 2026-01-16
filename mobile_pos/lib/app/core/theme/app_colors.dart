import 'package:flutter/material.dart';

/// App colors extracted from web app's globals.css
/// Using HSL values converted to RGB
class AppColors {
  // Primary - hsl(142.1 76.2% 36.3%) = #10b981
  static const Color primary = Color(0xFF10b981);
  static const Color primaryForeground = Color(0xFFfef2f2); // hsl(355.7 100% 97.3%)
  
  // Background - hsl(0 0% 100%) = white
  static const Color background = Color(0xFFFFFFFF);
  static const Color foreground = Color(0xFF0f172a); // hsl(240 10% 3.9%)
  
  // Card - hsl(0 0% 100%) = white
  static const Color card = Color(0xFFFFFFFF);
  static const Color cardForeground = Color(0xFF0f172a);
  
  // Muted - hsl(240 4.8% 95.9%)
  static const Color muted = Color(0xFFf1f5f9);
  static const Color mutedForeground = Color(0xFF64748b); // hsl(240 3.8% 46.1%)
  
  // Border and input - hsl(240 5.9% 90%)
  static const Color border = Color(0xFFe2e8f0);
  static const Color input = Color(0xFFe2e8f0);
  static const Color ring = Color(0xFF10b981); // Same as primary
  
  // Secondary - hsl(240 4.8% 95.9%)
  static const Color secondary = Color(0xFFf1f5f9);
  static const Color secondaryForeground = Color(0xFF0f172a); // hsl(240 5.9% 10%)
  
  // Destructive - hsl(0 84.2% 60.2%)
  static const Color destructive = Color(0xFFef4444);
  static const Color destructiveForeground = Color(0xFFfafafa); // hsl(0 0% 98%)
  
  // Accent - hsl(240 4.8% 95.9%)
  static const Color accent = Color(0xFFf1f5f9);
  static const Color accentForeground = Color(0xFF0f172a);
}
