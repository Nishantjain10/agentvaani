'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authService } from '@/libs/auth';

type PhoneVerificationFormProps = {
  userId: string;
};

export default function PhoneVerificationForm({ userId }: PhoneVerificationFormProps) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First update the phone number
      await authService.updatePhone(phone, ''); // Password not needed for phone update in some cases
      // Then send verification
      await authService.sendPhoneVerification();
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.confirmPhoneVerification(userId, otp);
      router.push('/onboarding/complete');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-8 max-w-md rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 text-center text-2xl font-bold">Verify Phone Number</h2>

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      {step === 'phone'
        ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number (with country code)
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91XXXXXXXXXX"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter your phone number with country code (e.g., +91 for India)
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )
        : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Enter OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  required
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter the 6-digit code sent to
                  {' '}
                  {phone}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-sm text-blue-600 hover:text-blue-500"
              >
                Change phone number
              </button>
            </form>
          )}
    </div>
  );
}
