import SignUpForm from '@/components/auth/SignUpForm';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900">
          AgentVaani
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Consent-first voice agent platform
        </p>
      </div>
      <SignUpForm />
    </div>
  );
}
