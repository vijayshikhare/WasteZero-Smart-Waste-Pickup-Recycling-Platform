// src/pages/NGOs.jsx
export default function NGOs() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">NGO Partners</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <p className="text-xl text-gray-600 mb-4">No NGOs connected yet</p>
        <p className="text-gray-500">
          Partner with local NGOs to amplify your waste collection impact.
        </p>
        <button className="mt-6 bg-green-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-green-700">
          Connect New NGO
        </button>
      </div>
    </div>
  );
}