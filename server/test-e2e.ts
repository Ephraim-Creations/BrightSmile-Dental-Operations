import { initDatabase, db } from './src/db.js';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './src/routes/auth.js';
import appointmentRoutes from './src/routes/appointments.js';
import serviceRoutes from './src/routes/services.js';
import settingRoutes from './src/routes/settings.js';

async function runTests() {
  console.log('🧪 Starting Dental Clinic System End-to-End Test Suite...\n');

  initDatabase();

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  app.use('/api/auth', authRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/settings', settingRoutes);

  const server = app.listen(5001, async () => {
    try {
      const BASE = 'http://localhost:5001';

      // 1. Test Public Services
      console.log('1️⃣ Testing GET /api/services...');
      const resServices = await fetch(`${BASE}/api/services`);
      const dataServices = await resServices.json();
      console.log(`   Status: ${resServices.status} | Services count: ${dataServices.services?.length}`);
      if (resServices.status !== 200 || !dataServices.services?.length) throw new Error('Services test failed');

      // 2. Test Public Settings
      console.log('2️⃣ Testing GET /api/settings...');
      const resSettings = await fetch(`${BASE}/api/settings`);
      const dataSettings = await resSettings.json();
      console.log(`   Status: ${resSettings.status} | Clinic: ${dataSettings.settings?.clinic_name}`);
      if (resSettings.status !== 200) throw new Error('Settings test failed');

      // 3. Test Public Appointment Booking
      console.log('3️⃣ Testing POST /api/appointments (Public Booking)...');
      const resBook = await fetch(`${BASE}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: 'Alexander Wright',
          phone: '(310) 555-7890',
          email: 'alex.wright@example.com',
          service_requested: 'General Dentistry',
          preferred_date: '2026-11-20',
          preferred_time: '10:00 AM',
          notes: 'Routine checkup and dental cleaning.',
        }),
      });
      const dataBook = await resBook.json();
      console.log(`   Status: ${resBook.status} | Created Appt ID: ${dataBook.appointment?.id}`);
      if (resBook.status !== 201 || !dataBook.appointment?.id) throw new Error('Appointment booking failed');

      // 4. Test Strict Security Rejection on unauthorized email
      console.log('4️⃣ Testing Strict Rejection on Unauthorized Email...');
      const resUnauth = await fetch(`${BASE}/api/auth/request-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'hacker@malicious-domain.com' }),
      });
      console.log(`   Status: ${resUnauth.status} (Expected 403 Forbidden)`);
      if (resUnauth.status !== 403) throw new Error('Security flaw: unauthorized email was not physically rejected with 403!');
      console.log('   ✅ Unauthorized email successfully physically rejected.');

      // 5. Test Authorized Admin OTP Request
      console.log('5️⃣ Testing Authorized Admin OTP Request (ephraimcreations254@gmail.com)...');
      const resAuth = await fetch(`${BASE}/api/auth/request-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'ephraimcreations254@gmail.com' }),
      });
      const dataAuth = await resAuth.json();
      console.log(`   Status: ${resAuth.status} | OTP Generated: ${dataAuth.debugOtp}`);
      if (resAuth.status !== 200 || !dataAuth.debugOtp) throw new Error('Admin OTP request failed');

      // 6. Test OTP Verification & JWT Issuance
      console.log('6️⃣ Testing OTP Verification & Token Issuance...');
      const resVerify = await fetch(`${BASE}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'ephraimcreations254@gmail.com', otp: dataAuth.debugOtp }),
      });
      const dataVerify = await resVerify.json();
      console.log(`   Status: ${resVerify.status} | Token: ${dataVerify.token ? 'JWT Issued ✅' : 'Missing'}`);
      if (resVerify.status !== 200 || !dataVerify.token) throw new Error('OTP verification failed');

      const adminToken = dataVerify.token;

      // 7. Test Protected GET /api/appointments
      console.log('7️⃣ Testing Protected GET /api/appointments...');
      const resProtectedAppts = await fetch(`${BASE}/api/appointments`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const dataProtectedAppts = await resProtectedAppts.json();
      console.log(`   Status: ${resProtectedAppts.status} | Appointments found: ${dataProtectedAppts.appointments?.length}`);
      if (resProtectedAppts.status !== 200) throw new Error('Protected appointments fetch failed');

      // 8. Test Protected PUT /api/appointments/:id (Confirm status)
      console.log('8️⃣ Testing Protected PUT /api/appointments/:id (Confirm)...');
      const resUpdateAppt = await fetch(`${BASE}/api/appointments/${dataBook.appointment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: 'confirmed' }),
      });
      const dataUpdateAppt = await resUpdateAppt.json();
      console.log(`   Status: ${resUpdateAppt.status} | Updated Status: ${dataUpdateAppt.appointment?.status}`);
      if (resUpdateAppt.status !== 200 || dataUpdateAppt.appointment?.status !== 'confirmed') {
        throw new Error('Appointment status update failed');
      }

      // 9. Test Protected PUT /api/settings
      console.log('9️⃣ Testing Protected PUT /api/settings...');
      const resUpdateSettings = await fetch(`${BASE}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          clinic_name: 'BrightSmile Dental Clinic & Implant Center',
          phone: '(555) 123-4567',
        }),
      });
      const dataUpdateSettings = await resUpdateSettings.json();
      console.log(`   Status: ${resUpdateSettings.status} | Clinic Name: ${dataUpdateSettings.settings?.clinic_name}`);
      if (resUpdateSettings.status !== 200) throw new Error('Settings update failed');

      console.log('\n🎉 ALL 9 SYSTEM VERIFICATION TESTS PASSED SUCCESSFULLY! 🚀');
    } catch (err) {
      console.error('\n❌ Test failed:', err);
      process.exitCode = 1;
    } finally {
      server.close();
      process.exit(process.exitCode || 0);
    }
  });
}

runTests();
