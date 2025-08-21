import { useState, useEffect } from 'react';
import { Calendar, Users, BarChart3, Zap, Globe, Bell } from 'lucide-react';

const FeatureShowcase = () => {
  const [activeTab, setActiveTab] = useState(0);

  const features = [
    {
      id: 'planning',
      icon: Calendar,
      title: 'Smart Planning',
      description: 'AI-powered content calendar with intelligent scheduling',
      preview: (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 h-64 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Content Calendar</h3>
            <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">AI Optimized</div>
          </div>
          <div className="grid grid-cols-7 gap-1 flex-1">
            {Array.from({ length: 21 }, (_, i) => (
              <div
                key={i}
                className={`aspect-square rounded text-xs flex items-center justify-center ${
                  [2, 5, 8, 12, 15, 18].includes(i)
                    ? 'bg-sage text-white font-medium'
                    : i % 7 === 0 || i % 7 === 6
                    ? 'bg-gray-100 text-gray-400'
                    : 'bg-white border border-gray-200 text-gray-600'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'collaboration',
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work seamlessly with your team in real-time',
      preview: (
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 h-64">
          <h3 className="font-semibold text-gray-800 mb-4">Team Activity</h3>
          <div className="space-y-3">
            {[
              { name: 'Sarah', action: 'Created new campaign', time: '2m ago', avatar: 'S' },
              { name: 'Mike', action: 'Reviewed content', time: '5m ago', avatar: 'M' },
              { name: 'Emma', action: 'Published to Instagram', time: '8m ago', avatar: 'E' },
              { name: 'Alex', action: 'Added to calendar', time: '12m ago', avatar: 'A' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-sage rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {activity.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{activity.name}</p>
                  <p className="text-xs text-gray-600">{activity.action}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'analytics',
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Deep insights into your content performance',
      preview: (
        <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-6 h-64">
          <h3 className="font-semibold text-gray-800 mb-4">Performance Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Engagement Rate</span>
              <span className="font-bold text-lg text-purple-600">8.2%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '82%' }}></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Reach</span>
              <span className="font-bold text-lg text-pink-600">24.5K</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-pink-500 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="text-center p-2 bg-white rounded-lg">
                <div className="text-lg font-bold text-gray-800">2.1K</div>
                <div className="text-xs text-gray-600">Likes</div>
              </div>
              <div className="text-center p-2 bg-white rounded-lg">
                <div className="text-lg font-bold text-gray-800">458</div>
                <div className="text-xs text-gray-600">Comments</div>
              </div>
              <div className="text-center p-2 bg-white rounded-lg">
                <div className="text-lg font-bold text-gray-800">89</div>
                <div className="text-xs text-gray-600">Shares</div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % features.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Everything you need in one platform
          </h2>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                  activeTab === index
                    ? 'bg-sage/10 border-2 border-sage shadow-md'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab(index)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${
                    activeTab === index ? 'bg-sage text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:pl-8">
          <div className="relative">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className={`transition-all duration-500 ${
                  activeTab === index
                    ? 'opacity-100 transform translate-x-0'
                    : 'opacity-0 transform translate-x-4 absolute inset-0'
                }`}
              >
                {feature.preview}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureShowcase;