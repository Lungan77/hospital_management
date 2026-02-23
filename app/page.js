"use client";
import Image from "next/image";
import Link from "next/link";
import {
  Stethoscope,
  Calendar,
  FileText,
  CreditCard,
  Users,
  Shield,
  Clock,
  Award,
  ArrowRight,
  CheckCircle,
  Star,
  Activity,
  Zap,
  Heart,
  Smartphone,
  Database,
  Lock,
  MessageCircle
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: <Calendar className="w-8 h-8 text-white" />,
      title: "Smart Appointment Scheduling",
      description: "Intelligent scheduling system that optimizes doctor availability and patient preferences.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <FileText className="w-8 h-8 text-white" />,
      title: "Digital Health Records",
      description: "Secure, comprehensive patient records accessible to authorized healthcare providers.",
      color: "from-emerald-500 to-emerald-600"
    },
    {
      icon: <CreditCard className="w-8 h-8 text-white" />,
      title: "Integrated Billing System",
      description: "Streamlined billing and payment processing with multiple payment options.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <Activity className="w-8 h-8 text-white" />,
      title: "Real-Time Patient Monitoring",
      description: "Track vital signs and patient status with instant alerts for critical changes.",
      color: "from-red-500 to-red-600"
    },
    {
      icon: <Database className="w-8 h-8 text-white" />,
      title: "Lab & Test Management",
      description: "Complete laboratory information system with automated result delivery.",
      color: "from-cyan-500 to-cyan-600"
    },
    {
      icon: <Heart className="w-8 h-8 text-white" />,
      title: "Emergency Services",
      description: "Integrated emergency response system with ambulance tracking and triage.",
      color: "from-pink-500 to-pink-600"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Patients Served", icon: <Users className="w-6 h-6" /> },
    { number: "50+", label: "Healthcare Providers", icon: <Stethoscope className="w-6 h-6" /> },
    { number: "99.9%", label: "System Uptime", icon: <Shield className="w-6 h-6" /> },
    { number: "24/7", label: "Support Available", icon: <Clock className="w-6 h-6" /> }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief Medical Officer",
      content: "This system has revolutionized how we manage patient care. The efficiency gains are remarkable.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Hospital Administrator",
      content: "The integrated approach to healthcare management has streamlined our operations significantly.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/1234567890"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-110 group animate-bounce-slow"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
      </a>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 h-screen flex items-center">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(59 130 246 / 0.3) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
              <div className="space-y-3 lg:space-y-5">
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium">
                  <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                  Best Healthcare Platform 2024
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                  Modern Healthcare
                  <span className="block mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Management System
                  </span>
                </h1>
                <p className="text-base sm:text-lg lg:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Streamline your healthcare operations with our comprehensive management platform designed for modern medical facilities. Empower your team with cutting-edge technology.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold text-base hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/30 transform hover:scale-105">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link href="/login" className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold text-base hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
                  Sign In
                </Link>
              </div>

              <div>
                <Link href="/emergency/report" className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold text-base hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-red-500/30 transform hover:scale-105 w-full sm:w-auto">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                  Report Emergency
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white rounded-xl p-3 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="flex justify-center mb-1 text-blue-600">
                      {stat.icon}
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-gray-900 text-center">{stat.number}</div>
                    <div className="text-xs text-gray-600 text-center">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mt-8 lg:mt-0">
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-5 lg:p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">HealthCare Dashboard</h3>
                    <p className="text-xs text-gray-600">Real-time overview</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                    <span className="text-xs font-medium text-green-800">Appointments Today</span>
                    <span className="text-xl font-bold text-green-600">24</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                    <span className="text-xs font-medium text-blue-800">Active Patients</span>
                    <span className="text-xl font-bold text-blue-600">156</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                    <span className="text-xs font-medium text-purple-800">Lab Results</span>
                    <span className="text-xl font-bold text-purple-600">12</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
                    <span className="text-xs font-medium text-orange-800">Staff Online</span>
                    <span className="text-xl font-bold text-orange-600">48</span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-2xl opacity-60 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full blur-2xl opacity-60 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium mb-4">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
              Powerful Features
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">Comprehensive Healthcare Solutions</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Our platform integrates all aspects of healthcare management into one seamless experience
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-2">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.description}</p>
                <div className="mt-4 flex items-center text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                  Learn more
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:ml-2 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-medium mb-4">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
              Testimonials
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">Trusted by Healthcare Professionals</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 px-4">See what our users have to say about their experience</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 sm:p-8 border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 text-base sm:text-lg mb-6 italic leading-relaxed">&quot;{testimonial.content}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{testimonial.name}</p>
                    <p className="text-gray-600 text-xs sm:text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
            Join Us Today
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">Ready to Transform Your Healthcare Management?</h2>
          <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto">
            Join thousands of healthcare professionals who trust our platform for their daily operations
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-lg mx-auto">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-50 transition-all duration-200 shadow-2xl transform hover:scale-105">
              Start Free Trial
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white rounded-xl font-semibold text-base sm:text-lg hover:bg-white hover:text-blue-600 transition-all duration-200">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">HealthCare System</h3>
              </div>
              <p className="text-gray-400 mb-4 max-w-md text-sm sm:text-base leading-relaxed">
                Empowering healthcare providers with modern technology solutions for better patient care and operational efficiency.
              </p>
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-3 py-2 rounded-lg">
                  <Shield className="w-4 h-4" />
                  <span className="text-xs sm:text-sm font-semibold">HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2 text-blue-400 bg-blue-400/10 px-3 py-2 rounded-lg">
                  <Lock className="w-4 h-4" />
                  <span className="text-xs sm:text-sm font-semibold">Secure</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li><Link href="/login" className="hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" />Sign In</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" />Register</Link></li>
                <li><Link href="/emergency/report" className="hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" />Emergency</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" />Support</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Contact</h4>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  +1 (555) 123-4567
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-400" />
                  24/7 Support
                </li>
                <li className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-green-400" />
                  WhatsApp Chat
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-400 text-xs sm:text-sm">
            <p className="text-center sm:text-left">&copy; {new Date().getFullYear()} HealthCare System. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <span className="text-gray-600">|</span>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}