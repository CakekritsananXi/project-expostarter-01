import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  Smartphone, 
  Download, 
  Star, 
  Users, 
  Zap, 
  Shield, 
  PlayCircle,
  ArrowRight,
  CheckCircle,
  Globe,
  Bell,
  Calendar,
  TrendingUp,
  Award,
  Rocket
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import FeatureShowcase from '../components/ui/FeatureShowcase';

const Landing = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    // Auto-rotate features
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 3);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Calendar,
      title: "Smart Planning",
      description: "AI-powered content planning that adapts to your audience and goals.",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Publish and schedule content across all major social platforms.",
      gradient: "from-green-500 to-blue-500"
    },
    {
      icon: Bell,
      title: "Real-time Analytics",
      description: "Track performance and engagement with detailed insights.",
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Content Creator",
      content: "ContentFlow transformed how I plan and publish content. My engagement increased by 300%!",
      avatar: "SJ",
      rating: 5
    },
    {
      name: "Marcus Chen",
      role: "Marketing Director",
      content: "The AI suggestions are incredibly smart. It's like having a content strategist in your pocket.",
      avatar: "MC",
      rating: 5
    },
    {
      name: "Emma Williams",
      role: "Social Media Manager",
      content: "Finally, a tool that understands my workflow. The mobile app is absolutely perfect.",
      avatar: "EW",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-sage/5">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-sage rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-neutral-900">ContentFlow</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-neutral-600 hover:text-sage transition-colors">Features</a>
              <a href="#download" className="text-neutral-600 hover:text-sage transition-colors">Download</a>
              <a href="#testimonials" className="text-neutral-600 hover:text-sage transition-colors">Reviews</a>
              <Link href="/login">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="inline-flex items-center px-4 py-2 bg-sage/10 rounded-full text-sage text-sm font-medium mb-6">
                <Star className="w-4 h-4 mr-2" />
                #1 Content Planning App
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
                Plan. Create. 
                <span className="bg-gradient-to-r from-sage to-warm-blue bg-clip-text text-transparent">
                  Succeed.
                </span>
              </h1>
              <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
                The ultimate content planning platform that helps creators, marketers, and teams build engaging content strategies with AI-powered insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="group">
                  Download for Free
                  <Download className="w-5 h-5 ml-2 group-hover:translate-y-0.5 transition-transform" />
                </Button>
                <Button variant="outline" size="lg" className="group">
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center space-x-8 text-sm text-neutral-600">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-8 h-8 bg-sage rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium">
                        {i}
                      </div>
                    ))}
                  </div>
                  <span>10K+ creators</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-2">4.9 rating</span>
                </div>
              </div>
            </div>

            {/* Mobile Mockup */}
            <div className={`relative transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="relative mx-auto w-80 h-96">
                {/* Phone Frame */}
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-[3rem] p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl"></div>
                    
                    {/* Screen Content */}
                    <div className="p-6 pt-10 h-full bg-gradient-to-br from-sage/5 to-warm-blue/5">
                      <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-sage rounded-2xl mx-auto mb-3 flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-neutral-900">Today's Plan</h3>
                        <p className="text-sm text-neutral-600">5 posts scheduled</p>
                      </div>
                      
                      <div className="space-y-3">
                        {[1,2,3].map(i => (
                          <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-neutral-100">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-sage/20 rounded-lg"></div>
                              <div className="flex-1">
                                <div className="h-2 bg-sage/30 rounded w-3/4 mb-1"></div>
                                <div className="h-2 bg-neutral-200 rounded w-1/2"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="bg-sage rounded-2xl p-3 text-white text-center">
                          <span className="text-sm font-medium">Create New Post</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-green-500 text-white rounded-full p-3 shadow-lg animate-bounce">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white rounded-full p-3 shadow-lg animate-pulse">
                  <Bell className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-sage text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sage to-warm-blue opacity-90"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/10 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by creators worldwide
            </h2>
            <p className="text-xl text-white/90">
              Join thousands of successful content creators and teams
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">
                <AnimatedCounter end={50000} suffix="+" />
              </div>
              <p className="text-white/80">Active Users</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">
                <AnimatedCounter end={2500000} suffix="+" />
              </div>
              <p className="text-white/80">Posts Created</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">
                <AnimatedCounter end={95} suffix="%" />
              </div>
              <p className="text-white/80">Success Rate</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">
                <AnimatedCounter end={150} suffix="+" />
              </div>
              <p className="text-white/80">Countries</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Powerful features designed to streamline your content creation workflow
            </p>
          </div>

          <FeatureShowcase />
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-sage/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`text-center cursor-pointer transition-all duration-300 hover:scale-105 ${
                  activeFeature === index ? 'ring-2 ring-sage shadow-xl rounded-2xl' : ''
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <Card className="h-full border-0 shadow-lg p-8">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">{feature.title}</h3>
                  <p className="text-neutral-600">{feature.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-20 bg-gradient-to-br from-sage/5 to-warm-blue/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Download ContentFlow
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Available on all your favorite devices. Start planning better content today.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-sage/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-sage" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">Lightning Fast</h3>
                    <p className="text-neutral-600">Optimized for performance on all devices</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-sage/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-sage" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">Secure & Private</h3>
                    <p className="text-neutral-600">Your content and data are always protected</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-sage/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-sage" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">Team Collaboration</h3>
                    <p className="text-neutral-600">Work together seamlessly with your team</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="flex items-center justify-center bg-black text-white px-6 py-3 rounded-xl hover:bg-neutral-800 transition-colors group">
                    <div className="mr-3">
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-xs">Download on the</div>
                      <div className="text-lg font-semibold">App Store</div>
                    </div>
                  </button>
                  
                  <button className="flex items-center justify-center bg-black text-white px-6 py-3 rounded-xl hover:bg-neutral-800 transition-colors group">
                    <div className="mr-3">
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-xs">Get it on</div>
                      <div className="text-lg font-semibold">Google Play</div>
                    </div>
                  </button>
                </div>
                <p className="text-sm text-neutral-500 text-center sm:text-left">
                  Free download • No credit card required
                </p>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <div className="relative">
                {/* Multiple Device Mockup */}
                <div className="flex justify-center items-end space-x-4">
                  {/* Tablet */}
                  <div className="transform rotate-12 scale-75">
                    <div className="w-48 h-64 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-3xl p-3 shadow-2xl">
                      <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
                        <div className="p-4 h-full bg-gradient-to-br from-sage/5 to-warm-blue/5">
                          <div className="grid grid-cols-2 gap-2 h-full">
                            {[1,2,3,4].map(i => (
                              <div key={i} className="bg-white rounded-lg p-2 shadow-sm">
                                <div className="w-full h-4 bg-sage/20 rounded mb-1"></div>
                                <div className="w-2/3 h-3 bg-neutral-200 rounded"></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="z-10">
                    <div className="w-32 h-56 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-3xl p-2 shadow-2xl">
                      <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
                        <div className="p-3 h-full bg-gradient-to-br from-sage/5 to-warm-blue/5">
                          <div className="space-y-2">
                            {[1,2,3,4,5].map(i => (
                              <div key={i} className="bg-white rounded-lg p-2 shadow-sm">
                                <div className="w-full h-2 bg-sage/30 rounded mb-1"></div>
                                <div className="w-1/2 h-2 bg-neutral-200 rounded"></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Laptop */}
                  <div className="transform -rotate-12 scale-75">
                    <div className="w-56 h-36 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-t-2xl p-2">
                      <div className="w-full h-full bg-white rounded-t-xl overflow-hidden">
                        <div className="p-3 h-full bg-gradient-to-br from-sage/5 to-warm-blue/5">
                          <div className="grid grid-cols-3 gap-1 h-full">
                            {[1,2,3,4,5,6].map(i => (
                              <div key={i} className="bg-white rounded p-1 shadow-sm">
                                <div className="w-full h-2 bg-sage/20 rounded"></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-56 h-2 bg-neutral-300 rounded-b-2xl"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Loved by creators worldwide
            </h2>
            <p className="text-xl text-neutral-600">
              Join thousands of successful content creators
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-neutral-700 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-sage rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900">{testimonial.name}</h4>
                    <p className="text-sm text-neutral-600">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-sage to-warm-blue">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to transform your content strategy?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of creators who are already planning better content with ContentFlow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="group">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-sage">
              Schedule Demo
            </Button>
          </div>
          <p className="text-sm text-white/70 mt-4">
            No credit card required • 14-day free trial
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-sage rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">ContentFlow</span>
              </div>
              <p className="text-neutral-400 mb-6 max-w-md">
                The ultimate content planning platform for creators, marketers, and teams.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-sage transition-colors">
                  <span className="text-sm font-bold">tw</span>
                </div>
                <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-sage transition-colors">
                  <span className="text-sm font-bold">ig</span>
                </div>
                <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-sage transition-colors">
                  <span className="text-sm font-bold">li</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-400">
            <p>&copy; 2025 ContentFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;