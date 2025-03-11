#!/usr/bin/env node

/**
 * Pre-build script to check for required environment variables
 * Run this before building the application
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_APP_URL'
];

const warnings = [];
const errors = [];

// Check for required environment variables
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    errors.push(`Missing required environment variable: ${envVar}`);
  }
});

// Check for Supabase service role key
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  warnings.push('SUPABASE_SERVICE_ROLE_KEY is not set. Some admin features may not work properly.');
}

// Print warnings and errors
if (warnings.length > 0) {
  console.warn('\n⚠️ WARNINGS:');
  warnings.forEach(warning => console.warn(`  - ${warning}`));
  console.warn('\n');
}

if (errors.length > 0) {
  console.error('\n❌ ERRORS:');
  errors.forEach(error => console.error(`  - ${error}`));
  console.error('\nPlease set the required environment variables before building the application.');
  process.exit(1);
}

console.log('✅ Environment variables check passed. Proceeding with build...'); 