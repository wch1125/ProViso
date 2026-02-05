import { useNavigate } from 'react-router-dom';
import {
  Hero,
  Features,
  IndustrySelector,
  Footer,
  ThemeToggle,
} from '../components/landing';

/**
 * Landing page for ProViso public demo.
 * Explains value proposition and lets users select a demo scenario.
 */
export function Landing() {
  const navigate = useNavigate();

  const handleTryDemo = () => {
    // Default to solar demo (most feature-rich)
    navigate('/deals/solar-demo/monitor');
  };

  const handleSelectIndustry = (industryId: string) => {
    // Navigate to appropriate demo based on industry
    switch (industryId) {
      case 'solar':
        navigate('/deals/solar-demo/monitor');
        break;
      case 'wind':
        navigate('/deals/wind-demo/monitor');
        break;
      case 'corporate':
        navigate('/deals/corporate-demo/monitor');
        break;
      default:
        navigate('/deals');
    }
  };

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Theme toggle */}
      <ThemeToggle />

      {/* Hero section */}
      <Hero onTryDemo={handleTryDemo} />

      {/* Features section */}
      <Features />

      {/* Industry selector */}
      <IndustrySelector onSelect={handleSelectIndustry} />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Landing;
