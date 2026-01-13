'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Github, BookOpen, Send, Shield, Lock, EyeOff } from 'lucide-react';
import { Logotype } from '@/components/ui/logotype';
import { MysticalBranches } from '@/components/home/mystical-branches';

export default function LaunchingSoonPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-base">
      {/* Mystical Branches Background */}
      <MysticalBranches />

      {/* Logo - Fixed position top left */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-8 left-8 z-20"
      >
        <Logotype size="md" showSubheading={false} interactive={false} />
      </motion.div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-8 pt-32 md:pt-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-6xl"
        >
          {/* Main Hero Section */}
          <div className="grid lg:grid-cols-[1.2fr,1fr] gap-16 mb-16 items-start">
            {/* Left: Hero Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col justify-start space-y-8"
            >
              {/* Main Title */}
              <div className="space-y-6 mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px w-12 bg-primary/50" />
                  <span className="text-xs font-mono text-text-tertiary tracking-widest uppercase">
                    Protocol v0
                  </span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold leading-[0.9] tracking-tight">
                  <span className="block text-text-primary">Privacy-Native</span>
                  <span className="block text-primary">Stablecoins.</span>
                </h1>

                <p className="text-lg text-text-secondary leading-relaxed max-w-xl">
                  Where your financial privacy meets{' '}
                  <span className="text-text-primary">110% capital efficiency</span>.
                  Confidential positions, zero-knowledge transactions.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="gap-2 px-6 py-6 bg-primary hover:bg-primary-hover text-base"
                  onClick={() => window.open('https://t.me/v1ta_fi', '_blank')}
                >
                  <Send className="w-4 h-4" />
                  <span>Talk to us</span>
                </Button>

                <Button
                  variant="outline"
                  className="gap-2 px-6 py-6 text-base border-border hover:border-primary/50 hover:bg-primary/5"
                  onClick={() => window.open('https://docs.v1ta.xyz', '_blank')}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Documentation</span>
                </Button>
              </div>

              {/* Social links */}
              <div className="flex items-center gap-5 pt-2">
                <a
                  href="https://x.com/v1ta_fi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-tertiary hover:text-text-secondary transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://github.com/v1ta-labs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-tertiary hover:text-text-secondary transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
                <div className="h-4 w-px bg-border" />
                <span className="text-xs text-text-tertiary font-mono">DEVNET</span>
              </div>
            </motion.div>

            {/* Right: Feature Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8"
            >
              <div className="grid gap-4">
                {[
                  {
                    icon: Shield,
                    title: 'Confidential Positions',
                    description: 'Private collateral and debt with zero-knowledge proofs',
                  },
                  {
                    icon: EyeOff,
                    title: 'Privacy-First Design',
                    description: 'Built from ground up for financial privacy on Solana',
                  },
                  {
                    icon: Lock,
                    title: 'Uncompromising Security',
                    description: 'On-chain cryptography with zero-trust architecture',
                  },
                ].map((feature, i) => (
                  <Card
                    key={feature.title}
                    className="p-5 bg-surface/50 border-border/50 hover:border-border transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-lg bg-primary/10">
                        <feature.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-text-primary mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-text-tertiary leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Status Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center"
          >
            <a
              href="https://alpha.v1ta.xyz/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Card className="inline-flex items-center gap-4 px-6 py-3 bg-surface/30 border-border/50 hover:border-border transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-mono text-text-secondary">
                    Privacy Mode: <span className="text-text-tertiary">Coming Soon</span>
                  </span>
                </div>
                <div className="h-4 w-px bg-border/50" />
                <span className="text-xs text-text-tertiary font-mono hover:text-text-secondary transition-colors">
                  Try Alpha →
                </span>
              </Card>
            </a>
          </motion.div>

          {/* Footer Tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-12"
          >
            <p className="text-text-tertiary font-serif text-base italic">
              "Your financial position, your business"
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
