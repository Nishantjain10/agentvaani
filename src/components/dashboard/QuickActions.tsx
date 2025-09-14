'use client';

import Link from 'next/link';

export default function QuickActions() {
  const actions = [
    {
      title: 'Create Agent',
      description: 'Set up a new voice agent',
      href: '/dashboard/agents/create',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      color: 'blue',
    },
    {
      title: 'Import Customers',
      description: 'Upload customer list',
      href: '/dashboard/customers',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'green',
    },
    {
      title: 'Upload Context',
      description: 'Add training documents',
      href: '/dashboard/uploads',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      color: 'purple',
    },
    {
      title: 'Start Call',
      description: 'Begin calling customers',
      href: '/dashboard/calls/start',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      color: 'orange',
    },
  ];

  return (
    <div className="rounded-lg bg-white shadow">
      <div className="border-b border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {actions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="group relative rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:border-gray-300 hover:shadow-md"
            >
              <div className="flex items-start space-x-3">
                <div className={`bg- h-10 w-10 flex-shrink-0${action.color}-100 text- flex items-center justify-center rounded-lg${action.color}-600 group-hover:bg-${action.color}-200 transition-colors`}>
                  {action.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                    {action.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {action.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-gray-400 group-hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
