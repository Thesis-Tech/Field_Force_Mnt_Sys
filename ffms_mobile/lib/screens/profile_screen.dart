import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/custom_button.dart';
import '../core/theme/app_theme.dart';
import 'expenses_screen.dart';
import 'feedback_screen.dart';
import 'permissions_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  Future<void> _handleLogout(BuildContext context) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    await authProvider.logout();
    if (context.mounted) {
      Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authUser = Provider.of<AuthProvider>(context).currentUser;

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: AppColors.surface,
        elevation: 0.5,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Header panel card
            Container(
              color: AppColors.surface,
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 48,
                    backgroundColor: AppColors.primaryContainer.withOpacity(0.1),
                    child: Text(
                      authUser?.name.substring(0, 1).toUpperCase() ?? 'E',
                      style: const TextStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    authUser?.name ?? 'Employee Name',
                    style: Theme.of(context).textTheme.headlineLarge,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    authUser?.email ?? 'employee@example.com',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Profile info items list
            Container(
              color: AppColors.surface,
              child: Column(
                children: [
                  if (authUser?.employeeId != null)
                    _buildProfileTile(
                      Icons.perm_identity_outlined,
                      'Employee ID',
                      authUser!.employeeId!,
                    ),
                  _buildProfileTile(
                    Icons.badge_outlined,
                    'Employee Role',
                    authUser?.role.replaceAll('_', ' ').toUpperCase() ?? 'Staff',
                  ),
                  _buildProfileTile(
                    Icons.business_outlined,
                    'Organization',
                    authUser?.organization?.name ?? 'Not Assigned',
                  ),
                  _buildProfileTile(
                    Icons.location_on_outlined,
                    'Territory',
                    authUser?.territory?.name ?? 'Not Assigned',
                  ),
                  _buildProfileTile(
                    Icons.device_hub_outlined,
                    'System Status',
                    authUser?.status.toUpperCase() ?? 'ACTIVE',
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Navigation shortcuts
            Container(
              color: AppColors.surface,
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.time_to_leave, color: AppColors.primary),
                    title: const Text('My Leave History', style: TextStyle(fontWeight: FontWeight.w600)),
                    trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                    onTap: () {
                      Navigator.pushNamed(context, '/leave-status');
                    },
                  ),
                  const Divider(height: 1, indent: 16, endIndent: 16),
                  ListTile(
                    leading: const Icon(Icons.receipt_long, color: AppColors.primary),
                    title: const Text('Expenses & Travel Allowance Claims', style: TextStyle(fontWeight: FontWeight.w600)),
                    trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const ExpensesScreen()),
                      );
                    },
                  ),
                  const Divider(height: 1, indent: 16, endIndent: 16),
                  ListTile(
                    leading: const Icon(Icons.feedback_outlined, color: AppColors.primary),
                    title: const Text('Anonymous Feedback', style: TextStyle(fontWeight: FontWeight.w600)),
                    trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const FeedbackScreen()),
                      );
                    },
                  ),
                  const Divider(height: 1, indent: 16, endIndent: 16),
                  ListTile(
                    leading: const Icon(Icons.security_outlined, color: AppColors.primary),
                    title: const Text('System Permissions', style: TextStyle(fontWeight: FontWeight.w600)),
                    trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const PermissionsScreen()),
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Logout Button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: CustomButton(
                text: 'Log Out',
                backgroundColor: AppColors.errorContainer,
                textColor: AppColors.onErrorContainer,
                icon: Icons.logout,
                onPressed: () => _handleLogout(context),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileTile(IconData icon, String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppColors.outlineVariant, width: 0.5)),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppColors.outline),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(fontSize: 11, color: AppColors.outline, fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.onSurface),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}
