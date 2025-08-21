import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  Smartphone, 
  Download, 
  Star, 
  ArrowRight,
  Play,
  Apple,
  Zap,
  Shield,
  Users,
  TrendingUp,
  Calendar,
  Bell,
  Globe
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import AnimatedCounter from '../components/ui/AnimatedCounter';

const MobileLanding = () => {
  const [activeScreenshot, setActiveScreenshot] = useState(0);

  const screenshots = [
    {
      title: "Dashboard",
      description: "Your content overview at a glance",
      mockup: (
        <div className="bg-gradient-to-br from-sage/10 to-warm-blue/10 h-full p-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-sage rounded-2xl mx-auto mb-3 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-neutral-900">Today's Plan</h3>
            <p className="text-sm text-neutral-600">5 posts scheduled</p>
          </div>
          
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-neutral-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-sage/20 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-2 bg-sage/30 rounded w-3/4 mb-1"></div>
                    <div className="h-2 bg-neutral-200 rounded w-1/2"></div>
                  </div>
                  <div className="text-xs text-sage font-medium">
                    {['2:00 PM', '4:30 PM', '6:00 PM', '8:15 PM'][i-1]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Content Editor",
      description: "Create and edit with powerful tools",
      mockup: (
        <div className="bg-gradient-to-br from-purple-50 to-pink-100 h-full p-6">
          <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">New Post</h3>
              <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Draft</div>
            </div>
            <div className="space-y-3">
              <div className="h-3 bg-neutral-200 rounded w-full"></div>
              <div className="h-3 bg-neutral-200 rounded w-4/5"></div>
              <div className="h-3 bg-neutral-200 rounded w-3/5"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="aspect-square bg-sage/20 rounded-lg"></div>
            <div className="aspect-square bg-warm-blue/20 rounded-lg"></div>
            <div className="aspect-square bg-warm-amber/20 rounded-lg"></div>
          </div>
          
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Schedule for:</span>
              <span className="text-sm font-medium text-sage">Tomorrow 3:00 PM</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Analytics",
      description: "Track performance and insights",
      mockup: (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 h-full p-6">
          <div className="text-center mb-6">
            <h3 className="font-bold text-neutral-900 mb-2">This Week</h3>
            <div className="text-2xl font-bold text-blue-600">+24% growth</div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-neutral-600">Engagement</span>
                <span className="text-sm font-bold text-green-600">↗ 8.2%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-neutral-600">Reach</span>
                <span className="text-sm font-bold text-blue-600">24.5K</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white rounded-lg p-2 text-center shadow-sm">
                <div className="text-lg font-bold text-neutral-800">2.1K</div>
                <div className="text-xs text-neutral-600">Likes</div>
              </div>
              <div className="bg-white rounded-lg p-2 text-center shadow-sm">
                <div className="text-lg font-bold text-neutral-800">458</div>
                <div className="text-xs text-neutral-600">Comments</div>
              </div>
              <div className="bg-white rounded-lg p-2 text-center shadow-sm">
                <div className="text-lg font-bold text-neutral-800">89</div>
                <div className="text-xs text-neutral-600">Shares</div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScreenshot(prev => (prev + 1) % screenshots.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [screenshots.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-sage/20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-sage rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">ContentFlow</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-neutral-300 hover:text-white transition-colors">Features</a>
              <a href="#download" className="text-neutral-300 hover:text-white transition-colors">Download</a>
              <Link href="/login">
                <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-neutral-900">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center px-4 py-2 bg-sage/20 rounded-full text-sage text-sm font-medium mb-6 border border-sage/30">
                <Star className="w-4 h-4 mr-2" />
                Featured on App Store
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Content Planning
                <span className="block bg-gradient-to-r from-sage to-warm-blue bg-clip-text text-transparent">
                  On The Go
                </span>
              </h1>
              <p className="text-xl text-neutral-300 mb-8 leading-relaxed">
                Take your content strategy everywhere with our powerful mobile app. Plan, create, and publish from anywhere.
              </p>
              
              {/* App Store Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button className="flex items-center justify-center bg-black text-white px-6 py-3 rounded-xl hover:bg-neutral-800 transition-colors group">
                  <Apple className="w-8 h-8 mr-3" />
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

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-white mb-1">
                    <AnimatedCounter end={4.9} suffix="/5" />
                  </div>
                  <p className="text-sm text-neutral-400">App Store Rating</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white mb-1">
                    <AnimatedCounter end={500000} suffix="+" />
                  </div>
                  <p className="text-sm text-neutral-400">Downloads</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white mb-1">
                    <AnimatedCounter end={98} suffix="%" />
                  </div>
                  <p className="text-sm text-neutral-400">User Satisfaction</p>
                </div>
              </div>
            </div>

            {/* Mobile Mockup Carousel */}
            <div className="relative">
              <div className="relative mx-auto w-80 h-[600px]">
                {/* Phone Frame */}
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-[3rem] p-3 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>
                    
                    {/* Screen Content */}
                    <div className="w-full h-full pt-8">
                      {screenshots.map((screenshot, index) => (
                        <div
                          key={index}
                          className={`absolute inset-0 pt-8 transition-all duration-500 ${
                            activeScreenshot === index
                              ? 'opacity-100 transform translate-x-0'
                              : 'opacity-0 transform translate-x-4'
                          }`}
                        >
                          {screenshot.mockup}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-green-500 text-white rounded-full p-3 shadow-lg animate-float">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white rounded-full p-3 shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              {/* Screenshot Navigation */}
              <div className="flex justify-center mt-8 space-x-2">
                {screenshots.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveScreenshot(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      activeScreenshot === index ? 'bg-sage scale-125' : 'bg-neutral-600 hover:bg-neutral-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-gradient-to-br from-neutral-800 to-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Mobile-First Experience
            </h2>
            <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
              Designed specifically for mobile content creators who need power and simplicity
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Optimized for mobile performance with instant sync across devices",
                gradient: "from-yellow-500 to-orange-500"
              },
              {
                icon: Shield,
                title: "Secure & Private",
                description: "Enterprise-grade security with end-to-end encryption",
                gradient: "from-green-500 to-emerald-500"
              },
              {
                icon: Globe,
                title: "Global Publishing",
                description: "Publish to all major social platforms with one tap",
                gradient: "from-blue-500 to-purple-500"
              }
            ].map((feature, index) => (
              <Card key={index} className="bg-neutral-700/50 border-neutral-600 text-center p-8 hover:bg-neutral-700/70 transition-colors">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-neutral-300">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshot Showcase */}
      <section className="py-20 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              See ContentFlow in Action
            </h2>
            <p className="text-xl text-neutral-300">
              Explore the app screens and discover powerful features
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {screenshots.map((screenshot, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                    activeScreenshot === index
                      ? 'bg-sage/20 border-2 border-sage'
                      : 'bg-neutral-800/50 border-2 border-transparent hover:bg-neutral-800'
                  }`}
                  onClick={() => setActiveScreenshot(index)}
                >
                  <h3 className="text-xl font-bold text-white mb-2">{screenshot.title}</h3>
                  <p className="text-neutral-300">{screenshot.description}</p>
                </div>
              ))}
            </div>

            <div className="lg:pl-8">
              <div className="relative mx-auto w-64 h-[500px]">
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-700 to-neutral-800 rounded-[2.5rem] p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-5 bg-black rounded-b-xl z-10"></div>
                    <div className="w-full h-full pt-6">
                      {screenshots.map((screenshot, index) => (
                        <div
                          key={index}
                          className={`absolute inset-0 pt-6 transition-all duration-500 ${
                            activeScreenshot === index
                              ? 'opacity-100 transform translate-x-0'
                              : 'opacity-0 transform translate-x-4'
                          }`}
                        >
                          {screenshot.mockup}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-sage to-warm-blue">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to revolutionize your content strategy?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Download ContentFlow today and join millions of successful creators.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button className="flex items-center justify-center bg-black text-white px-8 py-4 rounded-xl hover:bg-neutral-800 transition-colors text-lg font-semibold">
              <Apple className="w-6 h-6 mr-3" />
              Download for iOS
            </button>
            
            <button className="flex items-center justify-center bg-black text-white px-8 py-4 rounded-xl hover:bg-neutral-800 transition-colors text-lg font-semibold">
              <div className="mr-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
              </div>
              Download for Android
            </button>
          </div>
          
          <p className="text-sm text-white/70">
            Free download • No credit card required • Available worldwide
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12 border-t border-neutral-800">
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
                The mobile-first content planning platform for the modern creator.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Download</h3>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">iOS App</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Android App</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Web App</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
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

export default MobileLanding;