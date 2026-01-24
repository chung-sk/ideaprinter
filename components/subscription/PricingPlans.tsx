'use client'

import { Check } from 'lucide-react'
import { useState } from 'react'
import { AuthModal } from '@/components/auth/AuthModal'
import { useAuth } from '@/components/auth/AuthProvider'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out IdeaPrinter',
    features: [
      '5 ideas per day',
      'Basic categories',
      'Local storage only',
      'Community support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$9',
    period: 'per month',
    description: 'For serious innovators and entrepreneurs',
    features: [
      'Unlimited ideas',
      'All categories',
      'Cloud sync across devices',
      'Priority support',
      'Advanced analytics',
      'Export to PDF/CSV',
      'Custom categories',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Team',
    price: '$29',
    period: 'per month',
    description: 'For teams and organizations',
    features: [
      'Everything in Pro',
      'Up to 10 team members',
      'Shared idea workspace',
      'Team analytics',
      'Priority support',
      'Admin controls',
      'API access',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

export function PricingPlans() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user } = useAuth()

  const handlePlanSelect = (planName: string) => {
    if (!user) {
      setShowAuthModal(true)
    } else {
      // TODO: Redirect to checkout/subscription page
      console.log('Selected plan:', planName)
      alert(`Subscription checkout coming soon! Selected: ${planName}`)
    }
  }

  return (
    <>
      <div className="grid gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border-2 p-8 ${
              plan.popular
                ? 'border-blue-600 shadow-xl'
                : 'border-gray-200 shadow-sm'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-sm font-semibold text-white">
                Most Popular
              </div>
            )}

            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
              <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
              <span className="text-gray-600">/{plan.period}</span>
            </div>

            <button
              onClick={() => handlePlanSelect(plan.name)}
              className={`mb-6 w-full rounded-lg px-6 py-3 font-semibold transition-colors ${
                plan.popular
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {plan.cta}
            </button>

            <ul className="space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start">
                  <Check className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode="signup"
      />
    </>
  )
}
