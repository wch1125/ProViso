import { Link } from 'react-router-dom';
import {
  ArrowRight,
  FileText,
  Scale,
  Activity,
  Clock,
  DollarSign,
  CheckCircle,
  Users,
  Briefcase,
  HardHat,
  Building2,
  Gavel,
  Calculator,
  TrendingUp,
  Shield,
  Zap,
  Sun,
  Wind,
} from 'lucide-react';
import { Footer } from '../components/landing';
import { TopNav } from '../components/layout';

/**
 * About page - comprehensive value proposition for ProViso.
 * Target audience: LinkedIn visitors, potential clients, curious developers.
 */
export function About() {
  return (
    <div className="min-h-screen bg-surface-0">
      <TopNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-600 via-navy-700 to-navy-800 py-12 sm:py-20 px-4 sm:px-6">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-3 mb-8 opacity-0 animate-fade-up"
            style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
          >
            <span className="font-display text-3xl font-medium text-white tracking-tight">
              Pro<span className="text-blue-500 font-bold">V</span>iso
            </span>
          </Link>

          <h1
            className="font-display text-4xl md:text-5xl font-medium text-white tracking-tight leading-tight mb-6 opacity-0 animate-fade-up"
            style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
          >
            Credit Agreements as Executable Code
          </h1>

          <p
            className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8 opacity-0 animate-fade-up"
            style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}
          >
            A domain-specific language that reads like legal documents but runs like programs.
            Instant compliance checking, basket tracking, and pro forma simulation.
          </p>

          <div
            className="flex flex-wrap justify-center gap-4 opacity-0 animate-fade-up"
            style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}
          >
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold-600 hover:bg-gold-500 text-navy-900 font-medium rounded-lg transition-colors"
            >
              Explore the Demo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-surface-0">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-sm font-semibold text-gold-500 uppercase tracking-[0.15em] mb-4">
              The Problem
            </h2>
            <p className="text-2xl md:text-3xl font-display text-text-primary max-w-3xl mx-auto">
              Credit agreements are dense, complex documents. Getting answers is slow and expensive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Clock,
                question: '"Can we make this acquisition?"',
                traditional: '2 weeks + $50K outside counsel memo',
              },
              {
                icon: Calculator,
                question: '"How much RP basket capacity remains?"',
                traditional: '2 days of Excel reconciliation',
              },
              {
                icon: FileText,
                question: '"Are we compliant this quarter?"',
                traditional: '1 week quarterly scramble + $25K',
              },
              {
                icon: DollarSign,
                question: '"What\'s the pro forma impact?"',
                traditional: '1 week model + legal review + $30K',
              },
            ].map((item, index) => (
              <div
                key={item.question}
                className="bg-surface-1 border border-border-subtle rounded-xl p-6 opacity-0 animate-fade-up"
                style={{ animationDelay: `${0.1 + index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <item.icon className="w-8 h-8 text-red-400 mb-4" />
                <p className="text-lg font-medium text-text-primary mb-2">{item.question}</p>
                <p className="text-text-tertiary">{item.traditional}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Solution Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-surface-1">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-sm font-semibold text-gold-500 uppercase tracking-[0.15em] mb-4">
              The Solution
            </h2>
            <p className="text-2xl md:text-3xl font-display text-text-primary max-w-3xl mx-auto">
              ProViso turns your credit agreement into a working program.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Code example */}
            <div
              className="bg-navy-800 rounded-xl p-6 font-mono text-sm opacity-0 animate-fade-up"
              style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
            >
              <div className="flex items-center gap-2 mb-4 text-slate-400 text-xs">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2">corporate_revolver.proviso</span>
              </div>
              <pre className="text-slate-300 overflow-x-auto">
{`DEFINE EBITDA AS
  net_income + interest_expense
  + tax_expense + depreciation
  EXCLUDING extraordinary_items

COVENANT MaxLeverage
  REQUIRES TotalDebt / EBITDA <= 4.50
  TESTED QUARTERLY
  CURE EquityCure MAX_USES 3

BASKET PermittedAcquisitions
  CAPACITY GreaterOf($50M, 15% * EBITDA)
  FLOOR $30_000_000
  SUBJECT TO NoDefault`}
              </pre>
            </div>

            {/* Benefits list */}
            <div className="space-y-4">
              {[
                { icon: Zap, text: 'Instant compliance answers with citations' },
                { icon: TrendingUp, text: 'Automatic basket tracking and audit trail' },
                { icon: Shield, text: 'Built-in cure rights and amendment handling' },
                { icon: FileText, text: 'Lawyers can read it without coding knowledge' },
              ].map((item, index) => (
                <div
                  key={item.text}
                  className="flex items-start gap-4 opacity-0 animate-fade-up"
                  style={{ animationDelay: `${0.2 + index * 0.1}s`, animationFillMode: 'forwards' }}
                >
                  <div className="w-10 h-10 bg-gold-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-gold-400" />
                  </div>
                  <p className="text-lg text-text-primary pt-2">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Three Workflows Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-surface-0">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-sm font-semibold text-gold-500 uppercase tracking-[0.15em] mb-4">
              Three Workflows, One Platform
            </h2>
            <p className="text-2xl md:text-3xl font-display text-text-primary max-w-3xl mx-auto">
              ProViso supports the entire deal lifecycle
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Negotiation */}
            <div
              className="bg-surface-1 border border-border-subtle rounded-xl p-6 opacity-0 animate-fade-up"
              style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
            >
              <div className="w-12 h-12 bg-accent-600/20 rounded-xl flex items-center justify-center mb-4">
                <Scale className="w-6 h-6 text-accent-400" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">Negotiation</h3>
              <p className="text-text-secondary mb-4">
                Track term sheet changes across drafts. Side-by-side comparison with change classification.
              </p>
              <ul className="space-y-2 text-sm text-text-tertiary">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Version control with full history
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Form-based covenant/basket editing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Word document generation
                </li>
              </ul>
              <Link
                to="/deals"
                className="inline-flex items-center gap-2 mt-4 text-accent-400 hover:text-accent-300 text-sm font-medium"
              >
                Try Negotiation Studio <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Closing */}
            <div
              className="bg-surface-1 border border-border-subtle rounded-xl p-6 opacity-0 animate-fade-up"
              style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
            >
              <div className="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">Closing</h3>
              <p className="text-text-secondary mb-4">
                Never miss a condition precedent. Track documents and signatures in real-time.
              </p>
              <ul className="space-y-2 text-sm text-text-tertiary">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  CP checklist by category
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Document and signature tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Readiness meter and countdown
                </li>
              </ul>
              <Link
                to="/deals"
                className="inline-flex items-center gap-2 mt-4 text-emerald-400 hover:text-emerald-300 text-sm font-medium"
              >
                Try Closing Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Monitoring */}
            <div
              className="bg-surface-1 border border-border-subtle rounded-xl p-6 opacity-0 animate-fade-up"
              style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}
            >
              <div className="w-12 h-12 bg-gold-600/20 rounded-xl flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-gold-400" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">Monitoring</h3>
              <p className="text-text-secondary mb-4">
                Ongoing compliance monitoring with early warning indicators and scenario analysis.
              </p>
              <ul className="space-y-2 text-sm text-text-tertiary">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Real-time covenant compliance
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Waterfall and reserve tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  "What if" scenario simulator
                </li>
              </ul>
              <Link
                to="/deals/solar-demo/monitor"
                className="inline-flex items-center gap-2 mt-4 text-gold-400 hover:text-gold-300 text-sm font-medium"
              >
                Try Monitoring Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-surface-1">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-sm font-semibold text-gold-500 uppercase tracking-[0.15em] mb-4">
              Who It's For
            </h2>
            <p className="text-2xl md:text-3xl font-display text-text-primary max-w-3xl mx-auto">
              Built for everyone involved in credit facilities
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: Gavel, label: 'Lawyers' },
              { icon: Briefcase, label: 'Agents' },
              { icon: Building2, label: 'Lenders' },
              { icon: Users, label: 'Borrowers' },
              { icon: HardHat, label: 'Engineers' },
              { icon: Calculator, label: 'Treasury' },
            ].map((item, index) => (
              <div
                key={item.label}
                className="bg-surface-0 border border-border-subtle rounded-xl p-4 text-center opacity-0 animate-fade-up"
                style={{ animationDelay: `${0.1 + index * 0.05}s`, animationFillMode: 'forwards' }}
              >
                <item.icon className="w-8 h-8 text-gold-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-text-primary">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Support Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-surface-0">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-sm font-semibold text-gold-500 uppercase tracking-[0.15em] mb-4">
              Industry Support
            </h2>
            <p className="text-2xl md:text-3xl font-display text-text-primary max-w-3xl mx-auto">
              Corporate lending and project finance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Building2,
                title: 'Corporate Revolver',
                description: 'Traditional leveraged finance with covenants, baskets, and cure rights',
                demo: '/deals/corporate-demo/monitor',
              },
              {
                icon: Sun,
                title: 'Solar Project Finance',
                description: 'Construction phases, milestones, waterfalls, ITC tax equity',
                demo: '/deals/solar-demo/monitor',
              },
              {
                icon: Wind,
                title: 'Wind Project Finance',
                description: 'PTC credits, performance guarantees, reserve accounts',
                demo: '/deals/wind-demo/monitor',
              },
            ].map((item, index) => (
              <Link
                key={item.title}
                to={item.demo}
                className="group bg-surface-1 border border-border-subtle hover:border-gold-500/50 rounded-xl p-6 transition-all opacity-0 animate-fade-up"
                style={{ animationDelay: `${0.1 + index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <item.icon className="w-10 h-10 text-gold-400 mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-gold-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-text-secondary text-sm mb-4">{item.description}</p>
                <span className="inline-flex items-center gap-1 text-sm text-gold-400 group-hover:gap-2 transition-all">
                  View Demo <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-navy-600 via-navy-700 to-navy-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-medium text-white mb-4">
            Ready to explore?
          </h2>
          <p className="text-lg text-white/70 mb-8">
            Try the interactive demo with realistic project finance and corporate lending scenarios.
          </p>
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gold-600 hover:bg-gold-500 text-navy-900 font-medium rounded-lg transition-colors text-lg"
          >
            Launch Demo
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default About;
