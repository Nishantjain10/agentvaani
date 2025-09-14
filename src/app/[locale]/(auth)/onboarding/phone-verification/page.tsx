import { redirect } from 'next/navigation';
import PhoneVerificationForm from '@/components/auth/PhoneVerificationForm';
import { authService } from '@/libs/auth';

export default async function PhoneVerificationPage() {
  const user = await authService.getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  if (user.phoneVerification) {
    redirect('/onboarding/complete');
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900">
          AgentVaani
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Phone verification required for security
        </p>
      </div>
      <PhoneVerificationForm userId={user.$id} />
    </div>
  );
}
