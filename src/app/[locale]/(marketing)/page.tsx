import Link from 'next/link';

export async function generateMetadata() {
  return {
    title: 'AgentVaani - Consent-First Voice Agent Platform',
    description: 'Create AI voice agents that call only opted-in customers with high-quality Hindi voice, collect consent, and maintain compliance.',
  };
}

const Index = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    {/* Hero Section */}
    <div className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="relative z-10 bg-gradient-to-br from-blue-50 to-indigo-100 pb-8 sm:pb-16 md:pb-20 lg:w-full lg:max-w-2xl lg:pb-28 xl:pb-32">
          <main className="mx-auto mt-10 max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block xl:inline">AgentVaani</span>
                {' '}
                <span className="block text-blue-600 xl:inline">Voice Agent Platform</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mx-auto sm:mt-5 sm:max-w-xl sm:text-lg md:mt-5 md:text-xl lg:mx-0">
                Create AI voice agents that call only opted-in customers with high-quality Hindi voice,
                collect consent, and maintain full compliance with Indian regulations.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <Link
                    href="/sign-up"
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700 md:px-10 md:py-4 md:text-lg"
                  >
                    Get Started
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link
                    href="/sign-in"
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-100 px-8 py-3 text-base font-medium text-blue-700 hover:bg-blue-200 md:px-10 md:py-4 md:text-lg"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <div className="flex h-56 w-full items-center justify-center bg-gradient-to-r from-blue-400 to-blue-600 sm:h-72 md:h-96 lg:h-full lg:w-full">
          <div className="text-center text-white">
            <svg className="mx-auto mb-4 h-24 w-24" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            <h3 className="text-2xl font-bold">Consent-First Calling</h3>
          </div>
        </div>
      </div>
    </div>

    {/* Features Section */}
    <div className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base font-semibold tracking-wide text-blue-600 uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need for compliant voice campaigns
          </p>
        </div>

        <div className="mt-10">
          <div className="space-y-10 md:grid md:grid-cols-2 md:space-y-0 md:gap-x-8 md:gap-y-10">
            <div className="relative">
              <div className="absolute flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-white">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Consent Management</p>
              <p className="mt-2 ml-16 text-base text-gray-500">
                Collect explicit consent via SMS or verification calls before any automated outreach.
              </p>
            </div>

            <div className="relative">
              <div className="absolute flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-white">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Hindi Voice Agents</p>
              <p className="mt-2 ml-16 text-base text-gray-500">
                High-quality Hindi TTS with natural conversation flow and context awareness.
              </p>
            </div>

            <div className="relative">
              <div className="absolute flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-white">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Call Analytics</p>
              <p className="mt-2 ml-16 text-base text-gray-500">
                Complete call recordings, transcripts, and outcome tracking for compliance.
              </p>
            </div>

            <div className="relative">
              <div className="absolute flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-white">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Compliance First</p>
              <p className="mt-2 ml-16 text-base text-gray-500">
                Built-in suppression lists, opt-out handling, and regulatory compliance features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* CTA Section */}
    <div className="bg-blue-600">
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          <span className="block">Ready to start?</span>
          <span className="block">Create your first voice agent today.</span>
        </h2>
        <p className="mt-4 text-lg leading-6 text-blue-200">
          Join verified insurance workers using AgentVaani for compliant customer outreach.
        </p>
        <Link
          href="/sign-up"
          className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-blue-600 hover:bg-blue-50 sm:w-auto"
        >
          Get Started Now
        </Link>
      </div>
    </div>
  </div>
);

export default Index;
