'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, Zap, History, Share2, Lock, ChevronRight, Printer } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Header */}
      <motion.header
        className="landing-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link href="/" className="logo-link">
          <div className="logo-container">
            <div className="logo-icon">
              <Printer size={28} strokeWidth={2} />
            </div>
            <div className="logo-text">
              <span className="logo-name">ideaprinter</span>
              <span className="logo-tagline">by rytix.tech</span>
            </div>
          </div>
        </Link>
        <Link href="/printer" className="header-cta">
          <Sparkles size={18} />
          Get Started
        </Link>
      </motion.header>

      {/* Hero Section */}
      <section className="hero-section">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Decorative printer icon */}
          <motion.div
            className="hero-icon"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <Printer size={64} strokeWidth={1.5} />
          </motion.div>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            Print Your Next
            <br />
            <span className="highlight">Million Dollar Idea</span>
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            AI-powered app idea generator with a retro printer twist.
            <br />
            Generate unique, market-driven concepts in seconds.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="hero-cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <Link href="/printer" className="btn-primary">
              <Sparkles size={20} />
              Try Free - No Login Required
              <ChevronRight size={20} />
            </Link>
            <p className="trial-notice">
              <Zap size={16} />3 free ideas to start • No credit card needed
            </p>
          </motion.div>
        </motion.div>

        {/* Decorative background elements */}
        <div className="hero-bg">
          <div className="grid-pattern"></div>
          <motion.div
            className="floating-shape shape-1"
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="floating-shape shape-2"
            animate={{
              y: [0, 20, 0],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Everything You Need to Generate Ideas
        </motion.h2>

        <div className="features-grid">
          <FeatureCard
            icon={<Sparkles size={32} />}
            title="AI-Powered Generation"
            description="Powered by Google Gemini 2.0 Flash. Get unique, market-driven app ideas with names, categories, and problem-solution pairs."
            delay={0.1}
          />
          <FeatureCard
            icon={<Printer size={32} />}
            title="Retro Printer Experience"
            description="Delightful paper-feed animations and authentic printer sounds. Watch your ideas print out in real-time."
            delay={0.2}
          />
          <FeatureCard
            icon={<History size={32} />}
            title="Idea History"
            description="Browse, search, and manage all your generated ideas. Never lose a brilliant concept again."
            delay={0.3}
          />
          <FeatureCard
            icon={<Share2 size={32} />}
            title="Easy Sharing"
            description="Generate QR codes and shareable links. Export your ideas to collaborate with your team."
            delay={0.4}
          />
          <FeatureCard
            icon={<Zap size={32} />}
            title="Trend-Based Ideas"
            description="Generate ideas based on trending topics from HackerNews, ProductHunt, and Reddit."
            delay={0.5}
          />
          <FeatureCard
            icon={<Lock size={32} />}
            title="Secure & Private"
            description="Your API keys are encrypted locally. Your ideas stay yours. Open source and transparent."
            delay={0.6}
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          How It Works
        </motion.h2>

        <div className="steps-container">
          <Step
            number="01"
            title="Try It Free"
            description="No signup required. Get 3 free idea generations to test the printer."
            delay={0.1}
          />
          <Step
            number="02"
            title="Generate Ideas"
            description="Pick a category or trend, hit print, and watch your idea appear."
            delay={0.2}
          />
          <Step
            number="03"
            title="Want More?"
            description="Create a free account for unlimited ideas and full history access."
            delay={0.3}
          />
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="social-proof">
        <motion.div
          className="proof-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="stat">
            <div className="stat-number">10K+</div>
            <div className="stat-label">Ideas Generated</div>
          </div>
          <div className="stat">
            <div className="stat-number">95%</div>
            <div className="stat-label">Unique Concepts</div>
          </div>
          <div className="stat">
            <div className="stat-number">⚡ Fast</div>
            <div className="stat-label">Sub-second generation</div>
          </div>
        </motion.div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta">
        <motion.div
          className="cta-box"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2>Ready to Print Your Next Big Idea?</h2>
          <p>Start generating unique app concepts in seconds. No credit card needed.</p>
          <Link href="/printer" className="btn-primary btn-large">
            <Sparkles size={24} />
            Start Generating Ideas
            <ChevronRight size={24} />
          </Link>
          <p className="cta-subtext">
            Free trial • 3 ideas included • Upgrade anytime for unlimited access
          </p>
        </motion.div>
      </section>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  return (
    <motion.div
      className="feature-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
    >
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </motion.div>
  );
}

interface StepProps {
  number: string;
  title: string;
  description: string;
  delay: number;
}

function Step({ number, title, description, delay }: StepProps) {
  return (
    <motion.div
      className="step"
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="step-number">{number}</div>
      <div className="step-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </motion.div>
  );
}
