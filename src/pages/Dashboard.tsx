import React from 'react';
import { Calendar, Lightbulb, Target, TrendingUp } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Dashboard = () => {
  const stats = [
    {
      icon: Calendar,
      label: 'Content Planned',
      value: '23',
      subtitle: 'This month',
      color: 'text-sage',
      bgColor: 'bg-sage/10',
    },
    {
      icon: Lightbulb,
      label: 'Ideas Captured',
      value: '47',
      subtitle: 'Ready to develop',
      color: 'text-warm-blue',
      bgColor: 'bg-warm-blue/10',
    },
    {
      icon: Target,
      label: 'Goal Progress',
      value: '89%',
      subtitle: 'Content strategy',
      color: 'text-warm-amber',
      bgColor: 'bg-warm-amber/10',
    },
    {
      icon: TrendingUp,
      label: 'Engagement',
      value: '+12%',
      subtitle: 'vs last month',
      color: 'text-soft-emerald',
      bgColor: 'bg-soft-emerald/10',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
          Good morning, Sarah
        </h1>
        <p className="text-sm sm:text-base text-neutral-600">
          Let's make today's content planning productive and strategic.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} hover className="text-center">
            <div className={`w-10 h-10 ${stat.bgColor} rounded-xl flex items-center justify-center mx-auto mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-neutral-900 mb-1">{stat.value}</div>
            <div className="text-xs sm:text-sm font-medium text-neutral-600 mb-1">{stat.label}</div>
            <div className="text-xs text-neutral-500">{stat.subtitle}</div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <h2 className="text-lg font-semibold text-neutral-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="primary" icon={Lightbulb} className="justify-start">
            New Content Idea
          </Button>
          <Button variant="secondary" icon={Calendar} className="justify-start">
            Schedule Content
          </Button>
          <Button variant="outline" icon={Target} className="justify-start">
            Create Brief
          </Button>
          <Button variant="ghost" icon={TrendingUp} className="justify-start">
            View Analytics
          </Button>
        </div>
      </Card>

      {/* Welcome Message */}
      <Card>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-sage/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-sage" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
            Welcome to ContentFlow
          </h3>
          <p className="text-neutral-600 max-w-md mx-auto">
            Your modern content planning platform is ready. Start by exploring the navigation 
            or use the quick actions above to begin planning your content strategy.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;