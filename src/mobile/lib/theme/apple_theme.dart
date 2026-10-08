import 'package:flutter/material.dart';

/// Tokens de diseño oficial Apple Design System — Arquitectura Botánica
/// Paleta Oficial (CERO Degradados):
/// #2D3A2E (Forest Dark Base)
/// #556B2F (Olive Moss Primary Accent)
/// #A7B38B (Sage Green Accent & Specular Borders)
/// #F5F4EE (Warm Ivory Silk Canvas)
/// #3C4A3F (Slate Olive Forest)
/// #FFFFFF (Crisp Pure White Cards)
class AppleTheme {
  // Paleta de Fondos Sólidos de Alto Contraste
  static const Color bgPrimary = Color(0xFFF5F4EE);      // #F5F4EE Lienzo Marfil Cálido
  static const Color bgSecondary = Color(0xFFFFFFFF);    // #FFFFFF Lienzo Secundario Blanco Puro
  static const Color cardBg = Color(0xFFFFFFFF);         // #FFFFFF Tarjetas Sólidas Blanco Puro
  static const Color cardBgLight = Color(0xFFF7F6F1);    // Superficie Clara Elevada

  // Acentos de Color Sólidos
  static const Color accentBlue = Color(0xFF556B2F);     // #556B2F Verde Oliva Musgo (Primario de Acción)
  static const Color accentCyan = Color(0xFFA7B38B);     // #A7B38B Verde Salvia (Telemetría & GPS)
  static const Color accentPurple = Color(0xFF556B2F);   // #556B2F Identidad Institucional
  static const Color accentOrange = Color(0xFFC47D2B);   // Ocre Cálido (Repartos & Tránsito)
  static const Color accentGreen = Color(0xFF556B2F);    // #556B2F Éxito & Ahorro CO2
  static const Color accentRed = Color(0xFFD64541);      // Terracota Cálido (Alertas & Errores)

  // Tipografía & Jerarquía (Alto Contraste y Nitidez)
  static const Color textPrimary = Color(0xFF2D3A2E);    // #2D3A2E Carbón Bosque Alta Legibilidad
  static const Color textSecondary = Color(0xFF556B2F);  // #556B2F Verde Oliva Secundario
  static const Color textTertiary = Color(0xFF6E7E5A);   // Salvia Neutro Terciario

  // Bordes Nítidos
  static const Color borderSubtle = Color(0xFFCAD3BD);   // Borde Salvia Delicado
  static const Color borderSpecular = Color(0xFFA7B38B); // Acento Borde Salvia

  static BoxDecoration glassCardDecoration({
    Color? background,
    double borderRadius = 16.0,
    bool highlighted = false,
  }) {
    return BoxDecoration(
      color: background ?? cardBg,
      borderRadius: BorderRadius.circular(borderRadius),
      border: Border.all(
        color: highlighted ? accentBlue : borderSubtle,
        width: highlighted ? 1.5 : 1.0,
      ),
      boxShadow: const [
        BoxShadow(
          color: Color(0x102D3A2E),
          blurRadius: 14,
          offset: Offset(0, 4),
        ),
      ],
    );
  }

  static ThemeData get lightTheme {
    return ThemeData(
      brightness: Brightness.light,
      scaffoldBackgroundColor: bgPrimary,
      primaryColor: accentBlue,
      colorScheme: const ColorScheme.light(
        primary: accentBlue,
        secondary: accentCyan,
        surface: cardBg,
        error: accentRed,
      ),
      fontFamily: '.SF Pro Text',
      appBarTheme: const AppBarTheme(
        backgroundColor: bgSecondary,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.4,
        ),
      ),
    );
  }

  // Alias para mantener compatibilidad con imports anteriores
  static ThemeData get darkTheme => lightTheme;
}
