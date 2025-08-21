import React from 'react';
import Card from '../components/ui/Card';

const Strategy = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
          Content Strategy
        </h1>
        <p className="text-sm sm:text-base text-neutral-600">
          Define your strategic approach and create comprehensive content plans
        </p>
      </div>

      <Card>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Strategy Coming Soon
          </h3>
          <p className="text-neutral-600">
            The content strategy feature is under development.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Strategy;