
import { useState } from 'react';
import { PlusCircle, Lightbulb, BookOpen, Users, TrendingUp, Search, Filter } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

interface ContentIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'idea' | 'planned' | 'draft' | 'published';
  tags: string[];
  createdAt: Date;
}

const Ideation = () => {
  const [ideas, setIdeas] = useState<ContentIdea[]>([
    {
      id: '1',
      title: 'AI in Content Marketing: Future Trends',
      description: 'Explore how AI is transforming content marketing and what trends to watch',
      category: 'Technology',
      priority: 'high',
      status: 'idea',
      tags: ['AI', 'Marketing', 'Trends'],
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      title: 'Social Media Algorithm Changes',
      description: 'Breaking down recent algorithm updates across major platforms',
      category: 'Social Media',
      priority: 'medium',
      status: 'planned',
      tags: ['Algorithms', 'Social Media', 'Updates'],
      createdAt: new Date('2024-01-14')
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [newIdea, setNewIdea] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as const,
    tags: ''
  });

  const categories = ['Technology', 'Marketing', 'Social Media', 'Business', 'Design', 'Other'];
  
  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  const statusColors = {
    idea: 'bg-blue-100 text-blue-800',
    planned: 'bg-orange-100 text-orange-800',
    draft: 'bg-purple-100 text-purple-800',
    published: 'bg-green-100 text-green-800'
  };

  const handleAddIdea = () => {
    if (newIdea.title.trim()) {
      const idea: ContentIdea = {
        id: Date.now().toString(),
        title: newIdea.title,
        description: newIdea.description,
        category: newIdea.category || 'Other',
        priority: newIdea.priority,
        status: 'idea',
        tags: newIdea.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        createdAt: new Date()
      };
      
      setIdeas(prev => [idea, ...prev]);
      setNewIdea({ title: '', description: '', category: '', priority: 'medium', tags: '' });
      setShowAddForm(false);
    }
  };

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || idea.status === filter;
    return matchesSearch && matchesFilter;
  });

  const ideaSuggestions = [
    'Industry trend analysis',
    'Behind-the-scenes content',
    'Customer success stories',
    'How-to tutorials',
    'Product comparisons',
    'Expert interviews'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
              Content Ideation
            </h1>
            <p className="text-sm sm:text-base text-neutral-600">
              Capture, organize, and develop your content ideas
            </p>
          </div>
          <Button 
            onClick={() => setShowAddForm(true)}
            icon={PlusCircle}
            className="hidden sm:flex"
          >
            New Idea
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <Input
              placeholder="Search ideas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-sage focus:border-sage"
          >
            <option value="all">All Status</option>
            <option value="idea">Ideas</option>
            <option value="planned">Planned</option>
            <option value="draft">Drafts</option>
            <option value="published">Published</option>
          </select>
        </div>

        <Button 
          onClick={() => setShowAddForm(true)}
          icon={PlusCircle}
          className="sm:hidden w-full mb-6"
        >
          New Idea
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Idea Suggestions */}
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <div className="flex items-center mb-4">
              <Lightbulb className="w-5 h-5 text-sage mr-2" />
              <h3 className="font-semibold text-neutral-900">Idea Starters</h3>
            </div>
            <div className="space-y-2">
              {ideaSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => setNewIdea(prev => ({ ...prev, title: suggestion }))}
                  className="p-2 text-sm text-neutral-600 hover:bg-neutral-50 rounded cursor-pointer transition-colors"
                >
                  {suggestion}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-neutral-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600">Total Ideas</span>
                <span className="font-medium">{ideas.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600">High Priority</span>
                <span className="font-medium text-red-600">
                  {ideas.filter(idea => idea.priority === 'high').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600">In Progress</span>
                <span className="font-medium text-orange-600">
                  {ideas.filter(idea => ['planned', 'draft'].includes(idea.status)).length}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Ideas List */}
        <div className="lg:col-span-3">
          {showAddForm && (
            <Card className="mb-6">
              <h3 className="font-semibold text-neutral-900 mb-4">Add New Idea</h3>
              <div className="space-y-4">
                <Input
                  placeholder="Idea title..."
                  value={newIdea.title}
                  onChange={(e) => setNewIdea(prev => ({ ...prev, title: e.target.value }))}
                />
                <textarea
                  placeholder="Describe your idea..."
                  value={newIdea.description}
                  onChange={(e) => setNewIdea(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-sage focus:border-sage"
                  rows={3}
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <select
                    value={newIdea.category}
                    onChange={(e) => setNewIdea(prev => ({ ...prev, category: e.target.value }))}
                    className="px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-sage focus:border-sage"
                  >
                    <option value="">Select category...</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <select
                    value={newIdea.priority}
                    onChange={(e) => setNewIdea(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                    className="px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-sage focus:border-sage"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <Input
                    placeholder="Tags (comma separated)"
                    value={newIdea.tags}
                    onChange={(e) => setNewIdea(prev => ({ ...prev, tags: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddIdea}>
                    Add Idea
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <div className="grid gap-4">
            {filteredIdeas.map((idea) => (
              <Card key={idea.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900 mb-1">{idea.title}</h3>
                    <p className="text-sm text-neutral-600 mb-3">{idea.description}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[idea.priority]}`}>
                      {idea.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[idea.status]}`}>
                      {idea.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    <span className="flex items-center">
                      <BookOpen className="w-3 h-3 mr-1" />
                      {idea.category}
                    </span>
                    <span>{idea.createdAt.toLocaleDateString()}</span>
                  </div>
                  
                  {idea.tags.length > 0 && (
                    <div className="flex gap-1">
                      {idea.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-neutral-100 text-neutral-600 rounded">
                          {tag}
                        </span>
                      ))}
                      {idea.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs text-neutral-500">
                          +{idea.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {filteredIdeas.length === 0 && (
            <Card>
              <div className="text-center py-12">
                <Lightbulb className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {searchTerm || filter !== 'all' ? 'No matching ideas found' : 'No ideas yet'}
                </h3>
                <p className="text-neutral-600 mb-4">
                  {searchTerm || filter !== 'all' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'Start capturing your content ideas to build your content strategy'
                  }
                </p>
                <Button onClick={() => setShowAddForm(true)}>
                  Add Your First Idea
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ideation;
