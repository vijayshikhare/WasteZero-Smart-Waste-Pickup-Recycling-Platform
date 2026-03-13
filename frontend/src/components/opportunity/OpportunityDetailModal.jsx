// src/components/opportunity/OpportunityDetailModal.jsx
import { X, MapPin, Clock, AlertCircle, Users, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OpportunityDetailModal({
  opp, onClose, isOwner, applied, onApply, API_BASE, PLACEHOLDER_IMAGE
}) {
  if (!opp) return null;

  return (
    <div className="fixed inset-0 bg-black/65 flex items-center justify-center z-50 p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="p-7 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-3xl font-bold text-gray-900 line-clamp-2 pr-10">
            {opp.title}
          </h2>
          <button
            onClick={onClose}
            className="p-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={32} />
          </button>
        </div>

        <div className="p-8 space-y-10">
          <img
            src={opp.image ? `${API_BASE}${opp.image}` : PLACEHOLDER_IMAGE}
            alt={opp.title}
            className="w-full h-96 object-cover rounded-xl shadow-md"
            onError={e => e.target.src = PLACEHOLDER_IMAGE}
          />

          <div className="grid md:grid-cols-3 gap-10">
            <div className="md:col-span-2 space-y-10">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-5 flex items-center gap-4">
                  <AlertCircle size={26} className="text-green-600" />
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                  {opp.description}
                </p>
              </div>

              {opp.required_skills?.length > 0 && (
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-5 flex items-center gap-4">
                    <Users size={26} className="text-green-600" />
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {opp.required_skills.map(skill => (
                      <span
                        key={skill}
                        className="bg-green-100 text-green-800 px-6 py-2.5 rounded-full text-base font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-9 bg-gray-50 p-7 rounded-xl">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-4">
                  <MapPin size={24} className="text-green-600" />
                  Location
                </h3>
                <p className="text-gray-700 text-lg">{opp.location || 'Not specified'}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-4">
                  <Clock size={24} className="text-green-600" />
                  Duration
                </h3>
                <p className="text-gray-700 text-lg">{opp.duration || 'Flexible'}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-4">
                  <AlertCircle size={24} className="text-green-600" />
                  Status
                </h3>
                <span className="inline-block px-7 py-2.5 bg-green-100 text-green-800 rounded-full text-base font-medium">
                  {opp.status?.toUpperCase() || 'OPEN'}
                </span>
              </div>

              {isOwner && (
                <div className="pt-6 border-t flex flex-col gap-4">
                  <Link
                    to={`/dashboard/opportunities/edit/${opp._id}`}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-medium transition-colors"
                  >
                    <Edit size={18} />
                    Edit Opportunity
                  </Link>

                  <Link
                    to={`/dashboard/opportunity-applications/${opp._id}`}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-medium transition-colors"
                  >
                    <Users size={18} />
                    View Applications ({opp.applicationsCount || 0})
                  </Link>
                </div>
              )}
            </div>
          </div>

          {!isOwner && (
            <div className="pt-8 border-t flex justify-end">
              <button
                onClick={onApply}
                disabled={applied}
                className={`px-10 py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
                  applied
                    ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-xl'
                }`}
              >
                {applied ? 'Already Applied' : 'Apply Now'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}