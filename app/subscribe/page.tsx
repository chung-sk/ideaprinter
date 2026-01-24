'use client'

import { useState } from 'react'
import { Lightbulb, Zap, Cloud, TrendingUp, Users, Lock, ArrowRight } from 'lucide-react'
import { PricingPlans } from '@/components/subscription/PricingPlans'
import { AuthModal } from '@/components/auth/AuthModal'
import { useAuth } from '@/components/auth/AuthProvider'
import { Header } from '@/components/common/Header'
import Link from 'next/link'

export default function SubscribePage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user } = useAuth()

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Hero Section */}
      <section className="px-4 py-20 text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-5xl font-bold text-gray-900 md:text-6xl">
            Transform Your Ideas Into Reality
          </h1>
          <p className="mb-8 text-xl text-gray-600">
            AI-powered idea generation that helps you discover gaps in the market
            and create innovative solutions
          </p>
          {!user ? (
            <button
              onClick={() => setShowAuthModal(true)}
              className="inline-flex items-center rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2" size={20} />
            </button>
          ) : (
            <Link
              href="/"
              className="inline-flex items-center rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Go to IdeaPrinter
              <ArrowRight className="ml-2" size={20} />
            </Link>
          )}
        </div>
      </section>

      {/* Demo Video/GIF Section */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
            See IdeaPrinter in Action
          </h2>
          <div className="overflow-hidden rounded-2xl shadow-2xl">
            {/* Placeholder for demo - replace with actual video/gif */}
            <div className="relative aspect-video bg-gradient-to-br from-blue-100 to-purple-100">
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <Lightbulb className="mx-auto mb-4 h-24 w-24 text-blue-600" />
                  <p className="text-xl font-semibold text-gray-700">
                    Interactive Demo Coming Soon
                  </p>
                  <p className="mt-2 text-gray-600">
                    Watch how IdeaPrinter generates innovative app ideas in seconds
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-4xl font-bold text-gray-900">
            Why Choose IdeaPrinter?
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Zap className="h-8 w-8 text-blue-600" />}
              title="AI-Powered Generation"
              description="Leverages Google's Gemini AI to generate unique, market-ready app ideas in seconds"
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8 text-blue-600" />}
              title="Gap Analysis"
              description="Identifies market gaps and provides solutions to fill them with your new app idea"
            />
            <FeatureCard
              icon={<Cloud className="h-8 w-8 text-blue-600" />}
              title="Cloud Sync"
              description="Access your ideas from any device with automatic cloud synchronization (Pro plan)"
            />
            <FeatureCard
              icon={<Users className="h-8 w-8 text-blue-600" />}
              title="Team Collaboration"
              description="Share and collaborate on ideas with your team members (Team plan)"
            />
            <FeatureCard
              icon={<Lock className="h-8 w-8 text-blue-600" />}
              title="Secure & Private"
              description="Your ideas are encrypted and stored securely with enterprise-grade security"
            />
            <FeatureCard
              icon={<Lightbulb className="h-8 w-8 text-blue-600" />}
              title="Multiple Categories"
              description="Generate ideas across various categories: productivity, health, education, and more"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-4xl font-bold text-gray-900">
            Choose Your Plan
          </h2>
          <p className="mb-12 text-center text-xl text-gray-600">
            Start free and upgrade as you grow
          </p>
          <PricingPlans />
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="bg-blue-600 px-4 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-8 text-3xl font-bold">
            Join Thousands of Innovators
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <StatCard number="10,000+" label="Ideas Generated" />
            <StatCard number="2,500+" label="Active Users" />
            <StatCard number="50+" label="Categories" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-4xl font-bold text-gray-900">
            Ready to Start Generating Ideas?
          </h2>
          <p className="mb-8 text-xl text-gray-600">
            Join IdeaPrinter today and discover your next big opportunity
          </p>
          {!user ? (
            <button
              onClick={() => setShowAuthModal(true)}
              className="inline-flex items-center rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Get Started Free
              <ArrowRight className="ml-2" size={20} />
            </button>
          ) : (
            <Link
              href="/"
              className="inline-flex items-center rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Start Generating Ideas
              <ArrowRight className="ml-2" size={20} />
            </Link>
          )}
        </div>
      </section>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode="signup"
      />
      </div>
    </>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-lg">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="mb-2 text-4xl font-bold">{number}</div>
      <div className="text-blue-100">{label}</div>
    </div>
  )
}
