import 'package:flutter/material.dart';
import '../theme/apple_theme.dart';

/// Contenedor Obsidian Glass con borde especular superior y sombras profundas
class AppleGlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final EdgeInsetsGeometry? margin;
  final double borderRadius;
  final Color? backgroundColor;
  final VoidCallback? onTap;
  final bool isHighlighted;

  const AppleGlassCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16.0),
    this.margin,
    this.borderRadius = 18.0,
    this.backgroundColor,
    this.onTap,
    this.isHighlighted = false,
  });

  @override
  Widget build(BuildContext context) {
    Widget cardContent = Container(
      margin: margin,
      padding: padding,
      decoration: BoxDecoration(
        color: backgroundColor ?? AppleTheme.cardBg,
        borderRadius: BorderRadius.circular(borderRadius),
        border: Border.all(
          color: isHighlighted
              ? AppleTheme.accentBlue
              : AppleTheme.borderSubtle,
          width: isHighlighted ? 1.5 : 1.0,
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x66141C15),
            blurRadius: 28,
            offset: Offset(0, 8),
          ),
        ],
      ),
      child: child,
    );

    if (onTap != null) {
      return GestureDetector(
        onTap: onTap,
        child: cardContent,
      );
    }

    return cardContent;
  }
}
