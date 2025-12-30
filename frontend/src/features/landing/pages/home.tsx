import LandingLayout from '@/features/landing/pages/landinglayout';
import Hero from '@/features/landing/pages/hero';
import Features from '@/features/landing/pages/features';
import AboutUs from '@/features/landing/pages/about';
import Pricing from '@/features/landing/pages/pricing';
import Testimonials from '@/features/landing/pages/testimonials';
import ValueProp from '@/features/landing/pages/valueprop';
import FAQ from '@/features/landing/pages/faq';
import { useSEO } from '@/shared/hooks/useSEO';
import DynamicSEO from '@/shared/components/DynamicSEO';

export default function LandingPage() {
    const { data: seoData } = useSEO('landing');

    return (
        <>
            {/* Always render SEO - it will use data when available */}
            <DynamicSEO data={seoData} />
            <LandingLayout>
                <Hero />
                <Features />
                <AboutUs />
                <Pricing />
                <ValueProp />
                <Testimonials />
                <FAQ />
            </LandingLayout>
        </>
    );
}
