import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../theme/apple_theme.dart';

/// Botón con física de resorte y feedback táctil instantáneo (Apple Design)
class AppleButton extends StatefulWidget {
  final String text;
  final VoidCallback? onPressed;
  final IconData? icon;
  final Color backgroundColor;
  final Color textColor;
  final bool isSecondary;
  final double height;
  final double? width;
  final EdgeInsetsGeometry? padding;
  final double? fontSize;
  final bool isLoading;

  const AppleButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.icon,
    this.backgroundColor = AppleTheme.accentBlue,
    this.textColor = AppleTheme.textPrimary,
    this.isSecondary = false,
    this.height = 50.0,
    this.width,
    this.padding,
    this.fontSize,
    this.isLoading = false,
  });

  @override
  State<AppleButton> createState() => _AppleButtonState();
}

class _AppleButtonState extends State<AppleButton> with SingleTickerProviderStateMixin {
  double _scale = 1.0;

  void _onTapDown(TapDownDetails details) {
    if (widget.onPressed == null || widget.isLoading) return;
    setState(() => _scale = 0.96);
  }

  void _onTapUp(TapUpDetails details) {
    if (widget.onPressed == null || widget.isLoading) return;
    setState(() => _scale = 1.0);
  }

  void _onTapCancel() {
    setState(() => _scale = 1.0);
  }

  @override
  Widget build(BuildContext context) {
    final effectiveBg = widget.isSecondary
        ? const Color(0x263C4A3F)
        : widget.backgroundColor;
    final effectiveText = widget.isSecondary ? AppleTheme.textPrimary : widget.textColor;

    return GestureDetector(
      onTapDown: _onTapDown,
      onTapUp: _onTapUp,
      onTapCancel: _onTapCancel,
      onTap: widget.isLoading ? null : widget.onPressed,
      child: AnimatedScale(
        scale: _scale,
        duration: const Duration(milliseconds: 120),
        curve: Curves.easeOutCubic,
        child: Container(
          height: widget.height,
          width: widget.width,
          padding: widget.padding ?? const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(
            color: effectiveBg,
            borderRadius: BorderRadius.circular(14),
            border: widget.isSecondary
                ? Border.all(color: AppleTheme.borderSubtle, width: 1)
                : Border.all(color: AppleTheme.borderSpecular, width: 1),
            boxShadow: widget.isSecondary
                ? null
                : [
                    BoxShadow(
                      color: effectiveBg.withValues(alpha: 0.40),
                      blurRadius: 14,
                      offset: const Offset(0, 4),
                    ),
                  ],
          ),
          child: Center(
            child: widget.isLoading
                ? const CupertinoActivityIndicator(color: Colors.white)
                : Row(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (widget.icon != null) ...[
                        Icon(widget.icon, size: 16, color: effectiveText),
                        const SizedBox(width: 6),
                      ],
                      Flexible(
                        child: Text(
                          widget.text,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: effectiveText,
                            fontSize: widget.fontSize ?? 14,
                            fontWeight: FontWeight.w600,
                            letterSpacing: -0.2,
                          ),
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}
