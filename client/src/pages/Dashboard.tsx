import { Calendar, Lightbulb, Target, TrendingUp, Plus, FileText, Clock, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Post, Campaign, ContentIdea, CalendarEvent } from '../types';

const Dashboard = () => {
  const [, setLocation] = useLocation();

  // Fetch dashboard data
  const { data: posts = [], isLoading: postsLoading } = useQuery<{ posts: Post[] }>({
    queryKey: ['/api/posts'],
  });

  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<{ campaigns: Campaign[] }>({
    queryKey: ['/api/campaigns'],
  });

  const { data: contentIdeas = [], isLoading: ideasLoading } = useQuery<{ contentIdeas: ContentIdea[] }>({
    queryKey: ['/api/content-ideas'],
  });

  const { data: calendarEvents = [], isLoading: eventsLoading } = useQuery<{ calendarEvents: CalendarEvent[] }>({
    queryKey: ['/api/calendar-events'],
  });

  // Calculate metrics
  const thisMonth = new Date();
  thisMonth.setDate(1);
  
  const postsThisMonth = posts?.posts?.filter(post => 
    new Date(post.createdAt) >= thisMonth
  ).length || 0;

  const draftPosts = posts?.posts?.filter(post => post.status === 'draft').length || 0;
  const publishedPosts = posts?.posts?.filter(post => post.status === 'published').length || 0;
  const scheduledPosts = posts?.posts?.filter(post => post.status === 'scheduled').length || 0;

  const activeCampaigns = campaigns?.campaigns?.filter(campaign => 
    campaign.status === 'active'
  ).length || 0;

  const ideasReady = contentIdeas?.contentIdeas?.filter(idea => 
    idea.status === 'outlined' || idea.status === 'researching'
  ).length || 0;

  const upcomingEvents = calendarEvents?.calendarEvents?.filter(event => 
    new Date(event.eventDate) >= new Date() && 
    new Date(event.eventDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ).length || 0;

  const stats = [
    {
      icon: Calendar,
      label: 'Content This Month',
      value: postsThisMonth.toString(),
      subtitle: `${publishedPosts} published`,
      color: 'text-sage',
      bgColor: 'bg-sage/10',
    },
    {
      icon: Lightbulb,
      label: 'Ideas Ready',
      value: ideasReady.toString(),
      subtitle: 'To develop',
      color: 'text-warm-blue',
      bgColor: 'bg-warm-blue/10',
    },
    {
      icon: Target,
      label: 'Active Campaigns',
      value: activeCampaigns.toString(),
      subtitle: 'In progress',
      color: 'text-warm-amber',
      bgColor: 'bg-warm-amber/10',
    },
    {
      icon: Clock,
      label: 'Upcoming Events',
      value: upcomingEvents.toString(),
      subtitle: 'Next 7 days',
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
          <Button 
            variant="primary" 
            icon={Plus} 
            className="justify-start"
            onClick={() => setLocation('/ideation')}
          >
            New Content Idea
          </Button>
          <Button 
            variant="secondary" 
            icon={Calendar} 
            className="justify-start"
            onClick={() => setLocation('/calendar')}
          >
            Schedule Content
          </Button>
          <Button 
            variant="outline" 
            icon={FileText} 
            className="justify-start"
            onClick={() => setLocation('/library')}
          >
            Create Post
          </Button>
          <Button 
            variant="ghost" 
            icon={TrendingUp} 
            className="justify-start"
            onClick={() => setLocation('/analytics')}
          >
            View Analytics
          </Button>
        </div>
      </Card>

      {/* Content Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Posts */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">Recent Posts</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/library')}
            >
              View All
            </Button>
          </div>
          {postsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : posts?.posts?.length > 0 ? (
            <div className="space-y-4">
              {posts.posts.slice(0, 5).map((post) => (
                <div key={post.id} className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-neutral-900 text-sm">{post.title}</h3>
                    <p className="text-xs text-neutral-500 capitalize">{post.status} • {post.type}</p>
                  </div>
                  <div className="flex items-center">
                    {post.status === 'published' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {post.status === 'scheduled' && (
                      <Clock className="w-4 h-4 text-blue-500" />
                    )}
                    {post.status === 'draft' && (
                      <FileText className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">No posts yet. Create your first post!</p>
              <Button 
                variant="primary" 
                size="sm" 
                className="mt-4"
                onClick={() => setLocation('/library')}
              >
                Create Post
              </Button>
            </div>
          )}
        </Card>

        {/* Upcoming Content */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">Upcoming Content</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/calendar')}
            >
              View Calendar
            </Button>
          </div>
          {eventsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : calendarEvents?.calendarEvents?.length > 0 ? (
            <div className="space-y-4">
              {calendarEvents.calendarEvents
                .filter(event => new Date(event.eventDate) >= new Date())
                .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
                .slice(0, 5)
                .map((event) => (
                <div key={event.id} className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-neutral-900 text-sm">{event.title}</h3>
                    <p className="text-xs text-neutral-500">
                      {new Date(event.eventDate).toLocaleDateString()} • {event.eventType}
                    </p>
                  </div>
                  <div className="text-xs text-neutral-400">
                    {Math.ceil((new Date(event.eventDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">No upcoming events. Schedule your content!</p>
              <Button 
                variant="primary" 
                size="sm" 
                className="mt-4"
                onClick={() => setLocation('/calendar')}
              >
                Schedule Content
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Content Ideas */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-neutral-900">Latest Content Ideas</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation('/ideation')}
          >
            View All Ideas
          </Button>
        </div>
        {ideasLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse p-4 bg-neutral-50 rounded-lg">
                <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : contentIdeas?.contentIdeas?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contentIdeas.contentIdeas.slice(0, 6).map((idea) => (
              <div key={idea.id} className="p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    idea.priority === 'high' ? 'bg-red-100 text-red-700' :
                    idea.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {idea.priority}
                  </span>
                  <span className="text-xs text-neutral-500 capitalize">{idea.status}</span>
                </div>
                <h3 className="font-medium text-neutral-900 text-sm mb-1">{idea.title}</h3>
                <p className="text-xs text-neutral-600">{idea.description?.slice(0, 100)}...</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">No content ideas yet. Start brainstorming!</p>
            <Button 
              variant="primary" 
              size="sm" 
              className="mt-4"
              onClick={() => setLocation('/ideation')}
            >
              Add First Idea
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;