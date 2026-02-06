import { useNavigate } from 'react-router-dom';
import {
  Hero,
  Features,
  Footer,
} from '../components/landing';
import { TopNav } from '../components/layout';

/**
 * Landing page for ProViso public demo.
 * Explains value proposition and lets users select a demo scenario.
 */
export function Landing() {
  const navigate = useNavigate();

  const handleSelectIndustry = (industryId: string) => {
    switch (industryId) {
      case 'abc-acquisition':
        navigate('/deals/abc-acquisition/negotiate');
        break;
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
      {/* Global navigation */}
      <TopNav />

      {/* Hero section with demo cards */}
      <Hero onSelectIndustry={handleSelectIndustry} />

      {/* Features section */}
      <Features />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Landing;
