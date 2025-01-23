// /client/src/components/BackgroundCheckStatus.js
import React from 'react';

function BackgroundCheckStatus({ searchResults }) {
  const checkPresence = (type) => {
    const results = searchResults?.organic_results || [];
    const domains = results.map(r => r.link?.toLowerCase());
    
    switch(type) {
      case 'professional':
        return domains.some(d => d?.includes('linkedin.com'));
      case 'news':
        return domains.some(d => 
          d?.includes('inquirer.com') || 
          d?.includes('fox29.com') ||
          d?.includes('news')
        );
      case 'social':
        return domains.some(d => 
          d?.includes('instagram.com') || 
          d?.includes('facebook.com') ||
          d?.includes('linkedin.com')
        );
      case 'achievements':
        return results.some(r => 
          r.snippet?.toLowerCase().includes('invention') ||
          r.snippet?.toLowerCase().includes('award') ||
          r.snippet?.toLowerCase().includes('achievement')
        );
      case 'portfolio':
        return domains.some(d => 
          d?.includes('github.com') || 
          d?.includes('devpost.com')
        );
      default:
        return false;
    }
  };

  const categories = [
    {
      name: 'Professional Presence',
      description: 'LinkedIn or professional profile found',
      type: 'professional'
    },
    {
      name: 'News Coverage',
      description: 'Mentions in news outlets',
      type: 'news'
    },
    {
      name: 'Social Media Presence',
      description: 'Active on social platforms',
      type: 'social'
    },
    {
      name: 'Public Achievements',
      description: 'Notable accomplishments or recognition',
      type: 'achievements'
    },
    {
      name: 'Professional Portfolio',
      description: 'GitHub, Devpost, or other portfolio sites',
      type: 'portfolio'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Verification Categories</h3>
      <div className="space-y-3">
        {categories.map((category) => {
          const isPresent = checkPresence(category.type);
          return (
            <div key={category.type} className="flex items-start space-x-3">
              <div className={`text-2xl font-bold mt-0.5 ${isPresent ? 'text-green-500' : 'text-red-500'}`}>
                {isPresent ? '✓' : '✗'}
              </div>
              <div>
                <h4 className="font-medium">{category.name}</h4>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BackgroundCheckStatus;