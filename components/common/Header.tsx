'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Lightbulb, Menu, X, User, LogOut } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { AuthModal } from '@/components/auth/AuthModal'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    setIsMenuOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Lightbulb className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">IdeaPrinter</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-6 md:flex">
            <Link
              href="/"
              className={`transition-colors hover:text-blue-600 ${
                pathname === '/' ? 'font-semibold text-blue-600' : 'text-gray-700'
              }`}
            >
              Generate
            </Link>
            <Link
              href="/history"
              className={`transition-colors hover:text-blue-600 ${
                pathname === '/history' ? 'font-semibold text-blue-600' : 'text-gray-700'
              }`}
            >
              History
            </Link>
            <Link
              href="/subscribe"
              className={`transition-colors hover:text-blue-600 ${
                pathname === '/subscribe' ? 'font-semibold text-blue-600' : 'text-gray-700'
              }`}
            >
              Pricing
            </Link>
          </nav>

          {/* User Menu */}
          <div className="hidden items-center space-x-4 md:flex">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <User className="h-5 w-5" />
                  <span>{user.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 rounded-lg px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-t border-gray-200 bg-white md:hidden">
            <nav className="flex flex-col space-y-4 px-4 py-4">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className={`transition-colors hover:text-blue-600 ${
                  pathname === '/' ? 'font-semibold text-blue-600' : 'text-gray-700'
                }`}
              >
                Generate
              </Link>
              <Link
                href="/history"
                onClick={() => setIsMenuOpen(false)}
                className={`transition-colors hover:text-blue-600 ${
                  pathname === '/history' ? 'font-semibold text-blue-600' : 'text-gray-700'
                }`}
              >
                History
              </Link>
              <Link
                href="/subscribe"
                onClick={() => setIsMenuOpen(false)}
                className={`transition-colors hover:text-blue-600 ${
                  pathname === '/subscribe' ? 'font-semibold text-blue-600' : 'text-gray-700'
                }`}
              >
                Pricing
              </Link>
              <div className="border-t border-gray-200 pt-4">
                {user ? (
                  <>
                    <div className="mb-4 flex items-center space-x-2 text-sm text-gray-700">
                      <User className="h-5 w-5" />
                      <span>{user.email}</span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center justify-center space-x-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowAuthModal(true)
                      setIsMenuOpen(false)
                    }}
                    className="w-full rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode="signin"
      />
    </>
  )
}
