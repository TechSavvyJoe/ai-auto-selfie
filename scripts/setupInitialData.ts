/**
 * Setup Script: Initialize Admin User, Dealership, and Default User
 *
 * This script sets up the initial data for the AI Auto Selfie application:
 * 1. Creates an admin user
 * 2. Creates the "Golden Car Co." dealership
 * 3. Creates a default user for that dealership
 * 4. Assigns appropriate roles
 *
 * Usage:
 *   npx ts-node scripts/setupInitialData.ts
 *
 * The script will prompt you for:
 * - Admin email and password
 * - Default user email and password
 * - Dealership contact information (optional)
 */

import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

// For admin operations, we'll use the anon key but note that createUser requires RLS to be disabled
// or proper JWT claims. This script should be run with SUPABASE_SERVICE_ROLE_KEY for production.
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are required');
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('\n🚀 AI Auto Selfie - Initial Setup\n');
  console.log('This script will set up:');
  console.log('1. Admin user account');
  console.log('2. "Golden Car Co." dealership');
  console.log('3. Default user for the dealership\n');

  try {
    // Collect user input
    const adminEmail = await question('Admin email: ');
    const adminPassword = await question('Admin password (min 6 chars): ');

    if (adminPassword.length < 6) {
      console.error('Error: Password must be at least 6 characters');
      rl.close();
      process.exit(1);
    }

    const adminFullName = await question('Admin full name (e.g., "John Administrator"): ');

    const defaultUserEmail = await question('\nDefault user email: ');
    const defaultUserPassword = await question('Default user password (min 6 chars): ');

    if (defaultUserPassword.length < 6) {
      console.error('Error: Password must be at least 6 characters');
      rl.close();
      process.exit(1);
    }

    const defaultUserFullName = await question('Default user full name (e.g., "Jane Salesperson"): ');
    const defaultUserPhone = await question('Default user phone (optional): ');

    const dealershipPhone = await question('\nDealership phone (optional): ');
    const dealershipEmail = await question('Dealership email (optional): ');
    const dealershipAddress = await question('Dealership address (optional): ');

    rl.close();

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    console.log('\n⏳ Setting up initial data...\n');

    // Step 1: Create admin user
    console.log('📝 Creating admin user...');
    const { data: adminUserData, error: adminUserError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: adminFullName,
      },
    });

    if (adminUserError) {
      console.error('❌ Failed to create admin user:', adminUserError.message);
      process.exit(1);
    }

    if (!adminUserData.user) {
      console.error('❌ Failed to create admin user: No user data returned');
      process.exit(1);
    }

    const adminUserId = adminUserData.user.id;
    console.log(`✅ Admin user created: ${adminEmail} (${adminUserId})`);

    // Step 2: Create dealership
    console.log('\n📝 Creating "Golden Car Co." dealership...');
    const { data: dealershipData, error: dealershipError } = await supabase
      .from('dealerships')
      .insert({
        name: 'Golden Car Co.',
        phone: dealershipPhone || null,
        email: dealershipEmail || null,
        address: dealershipAddress || null,
        settings: {
          created_by: adminEmail,
          created_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (dealershipError) {
      console.error('❌ Failed to create dealership:', dealershipError.message);
      // Clean up: delete admin user
      await supabase.auth.admin.deleteUser(adminUserId);
      process.exit(1);
    }

    const dealershipId = dealershipData.id;
    console.log(`✅ Dealership created: Golden Car Co. (${dealershipId})`);

    // Step 3: Update admin user profile to admin role and assign to dealership
    console.log('\n📝 Assigning admin user to dealership with admin role...');
    const { error: adminProfileError } = await supabase
      .from('user_profiles')
      .update({
        dealership_id: dealershipId,
        role: 'admin',
        full_name: adminFullName,
      })
      .eq('id', adminUserId);

    if (adminProfileError) {
      console.error('❌ Failed to update admin profile:', adminProfileError.message);
      process.exit(1);
    }

    console.log(`✅ Admin profile updated`);

    // Step 4: Create default user
    console.log('\n📝 Creating default user for dealership...');
    const { data: defaultUserData, error: defaultUserError } = await supabase.auth.admin.createUser({
      email: defaultUserEmail,
      password: defaultUserPassword,
      email_confirm: true,
      user_metadata: {
        full_name: defaultUserFullName,
      },
    });

    if (defaultUserError) {
      console.error('❌ Failed to create default user:', defaultUserError.message);
      process.exit(1);
    }

    if (!defaultUserData.user) {
      console.error('❌ Failed to create default user: No user data returned');
      process.exit(1);
    }

    const defaultUserId = defaultUserData.user.id;
    console.log(`✅ Default user created: ${defaultUserEmail} (${defaultUserId})`);

    // Step 5: Update default user profile
    console.log('\n📝 Assigning default user to dealership with salesperson role...');
    const { error: defaultProfileError } = await supabase
      .from('user_profiles')
      .update({
        dealership_id: dealershipId,
        role: 'salesperson',
        full_name: defaultUserFullName,
        phone: defaultUserPhone || null,
      })
      .eq('id', defaultUserId);

    if (defaultProfileError) {
      console.error('❌ Failed to update default user profile:', defaultProfileError.message);
      process.exit(1);
    }

    console.log(`✅ Default user profile updated`);

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('✨ SETUP COMPLETE!\n');
    console.log('📊 Created Resources:');
    console.log(`   • Dealership: Golden Car Co. (${dealershipId})`);
    console.log(`   • Admin User: ${adminEmail}`);
    console.log(`   • Default User: ${defaultUserEmail}\n`);
    console.log('🔐 Credentials:');
    console.log(`   Admin:`);
    console.log(`     Email: ${adminEmail}`);
    console.log(`     Password: (as entered)`);
    console.log(`   Default User:`);
    console.log(`     Email: ${defaultUserEmail}`);
    console.log(`     Password: (as entered)\n`);
    console.log('📝 Next Steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Log in with the admin or default user account');
    console.log('3. Admin can manage dealerships and users via Admin Dashboard');
    console.log('4. Begin taking customer photos!\n');
    console.log('=' + '='.repeat(59));

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

main();
