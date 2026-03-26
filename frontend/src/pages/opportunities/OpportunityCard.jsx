// src/components/opportunity/OpportunityCard.jsx
import { Eye, Edit, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OpportunityCard({
  opp,
  isOwner,
  applied,
  onApply,
  onView,
  API_BASE,
  PLACEHOLDER_IMAGE
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border overflow-hidden hover:shadow-2xl transition-all duration-300 group flex flex-col">
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-green-500 to-emerald-700">
        <img
          src={opp.image ? `${API_BASE}${opp.image}` : PLACEHOLDER_IMAGE}
          alt={opp.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => (e.target.src = PLACEHOLDER_IMAGE)}
        />
        <div className="absolute top-5 right-5">
          <span className="px-5 py-2 bg-green-800/90 text-white text-sm font-semibold rounded-full backdrop-blur-md shadow">
            {opp.status?.toUpperCase() || 'OPEN'}
          </span>
        </div>
      </div>

      <div className="p-7 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-green-700 transition-colors">
          {opp.title || 'Untitled Opportunity'}
        </h3>

        <p className="text-gray-700 mb-6 line-clamp-4 flex-grow leading-relaxed">
          {opp.description || 'No description provided.'}
        </p>

        <div className="space-y-3 text-gray-700 mb-6">
          {opp.location && (
            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-green-600 flex-shrink-0" />
              <span className="truncate">{opp.location}</span>
            </div>
          )}
          {opp.duration && (
            <div className="flex items-center gap-3">
              <Clock size={20} className="text-green-600 flex-shrink-0" />
              <span>{opp.duration}</span>
            </div>
          )}
        </div>

        {opp.required_skills?.length > 0 && (
          <div className="flex flex-wrap gap-2.5">
            {opp.required_skills.slice(0, 5).map((skill) => (
              <span
                key={skill}
                className="bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
            {opp.required_skills.length > 5 && (
              <span className="text-sm text-gray-500 self-center">
                +{opp.required_skills.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="px-7 py-6 bg-gray-50 border-t flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onView}
          className="flex items-center gap-3 text-green-700 hover:text-green-900 font-semibold transition-colors"
        >
          <Eye size={20} />
          View Details
        </button>

        <div className="flex flex-wrap gap-5 items-center">
          {!isOwner && (
            <button
              onClick={onApply}
              disabled={applied}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm min-w-[120px] ${
                applied
                  ? 'bg-gray-200 text-gray-700 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-md'
              }`}
            >
              {applied ? 'Applied' : 'Apply Now'}
            </button>
          )}

          {isOwner && (
            <div className="flex gap-5 text-sm font-medium">
              <Link
                to={`/dashboard/opportunities/edit/${opp._id}`}
                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Edit size={16} />
                Edit
              </Link>

              <Link
                to={`/dashboard/opportunity-applications/${opp._id}`}
                className="flex items-center gap-1.5 text-green-600 hover:text-green-800 transition-colors"
              >
                <Users size={16} />
                Applications ({opp.applicationsCount || 0})
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}