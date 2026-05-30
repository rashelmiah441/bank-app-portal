import Link from "next/link";

export default function InterestCalculationHome() {
  const calculators = [
    { name: "SME CC Loan", href: "/apps/interest-calculation/sme-cc" },
    { name: "Personal Loan", href: "/apps/interest-calculation/personal" },
    // Add more as needed
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Interest Calculation</h1>
        <p className="text-gray-500">Select a calculator or manage interest rate history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calculators Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Calculators</h2>
          <div className="grid gap-4">
            {calculators.map((calc) => (
              <Link
                key={calc.href}
                href={calc.href}
                className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-500 transition-all text-left"
              >
                <div className="font-bold text-gray-900">{calc.name}</div>
                <div className="text-sm text-gray-500">Calculate interest for {calc.name}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* History Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Management</h2>
          <Link
            href="/apps/interest-calculation/history"
            className="block p-6 bg-blue-600 rounded-xl text-white shadow-lg hover:bg-blue-700 transition-all text-center group"
          >
            <div className="text-2xl font-bold mb-2">Interest Rate History</div>
            <p className="text-blue-100 text-sm">Manage historical rates, periods, and circulars.</p>
            <div className="mt-4 inline-flex items-center text-sm font-semibold text-white bg-blue-500 px-4 py-2 rounded-lg group-hover:bg-blue-400">
              Manage History
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
