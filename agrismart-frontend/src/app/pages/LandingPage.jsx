import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Leaf, TrendingUp, Cloud, AlertCircle, MessageSquare, ShieldCheck, ArrowRight, } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
export const LandingPage = () => {
    const features = [
        {
            icon: Leaf,
            title: 'Crop Management',
            description: 'Track and manage your crops with ease. Monitor growth stages and harvest schedules.',
            color: 'from-green-500 to-green-600',
        },
        {
            icon: TrendingUp,
            title: 'Price Analytics',
            description: 'Real-time market prices and trends to help you make informed selling decisions.',
            color: 'from-blue-500 to-blue-600',
        },
        {
            icon: Cloud,
            title: 'Weather Forecasts',
            description: 'Accurate weather predictions tailored for agricultural planning.',
            color: 'from-sky-500 to-sky-600',
        },
        {
            icon: AlertCircle,
            title: 'Disease Detection',
            description: 'AI-powered disease detection to protect your crops and maximize yields.',
            color: 'from-red-500 to-red-600',
        },
        {
            icon: MessageSquare,
            title: 'AI Assistant',
            description: 'Get instant answers to farming questions from our intelligent chatbot.',
            color: 'from-purple-500 to-purple-600',
        },
        {
            icon: ShieldCheck,
            title: 'Secure Trading',
            description: 'Safe and transparent marketplace for farmers and buyers.',
            color: 'from-amber-500 to-amber-600',
        },
    ];
    const stats = [
        { value: '10K+', label: 'Active Farmers' },
        { value: '5K+', label: 'Buyers' },
        { value: '50K+', label: 'Crops Traded' },
        { value: '₹100M+', label: 'Revenue Generated' },
    ];
    return (<div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white"/>
              </div>
              <span className="text-xl font-bold text-primary">AgriSmart</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-white to-lime-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Smart Agriculture
                <span className="text-primary block mt-2">Powered by AI</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Revolutionize your farming with AI-driven insights, real-time market data,
                and seamless crop management. Join thousands of farmers growing smarter.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup">
                  <Button size="lg" className="gap-2">
                    Start Free Trial <ArrowRight className="w-5 h-5"/>
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="gap-2">
                  Watch Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12">
                {stats.map((stat, index) => (<motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                    <div className="text-3xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                  </motion.div>))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1614533811170-b8bb30e39f7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHdoZWF0JTIwZmllbGQlMjBzdW5zZXR8ZW58MXx8fHwxNzczOTI5NjM4fDA&ixlib=rb-4.1.0&q=80&w=1080" alt="Agriculture field" className="w-full h-auto"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"/>
              </div>
              {/* Floating Cards */}
              <motion.div className="absolute -left-4 top-20 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4" animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400"/>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Price Alert</div>
                    <div className="font-bold text-green-600">+15% Wheat</div>
                  </div>
                </div>
              </motion.div>
              <motion.div className="absolute -right-4 bottom-20 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4" animate={{ y: [0, 10, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Cloud className="w-6 h-6 text-blue-600 dark:text-blue-400"/>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Weather</div>
                    <div className="font-bold">28°C Sunny</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Grow
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-xl text-gray-600 dark:text-gray-300">
              Powerful features designed for modern agriculture
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (<motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-primary">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                      <feature.icon className="w-7 h-7 text-white"/>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How AgriSmart Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
            {
                step: '01',
                title: 'Create Account',
                description: 'Sign up as a farmer or buyer in less than 2 minutes',
            },
            {
                step: '02',
                title: 'Add Your Crops',
                description: 'List your crops or browse available produce',
            },
            {
                step: '03',
                title: 'Start Trading',
                description: 'Connect with buyers, track shipments, and grow your business',
            },
        ].map((item, index) => (<motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.2 }} className="text-center">
                <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
              </motion.div>))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-600 to-green-700">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Farming?
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-xl text-green-100 mb-8">
            Join thousands of farmers already using AgriSmart to grow smarter and sell better.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="gap-2">
                Get Started Free <ArrowRight className="w-5 h-5"/>
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-8 h-8 text-primary"/>
                <span className="text-xl font-bold">AgriSmart</span>
              </div>
              <p className="text-gray-400">
                Empowering farmers with technology for a sustainable future.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
                <li>Roadmap</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Privacy</li>
                <li>Terms</li>
                <li>Cookie Policy</li>
                <li>Licenses</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 AgriSmart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>);
};
