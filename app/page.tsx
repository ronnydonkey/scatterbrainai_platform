import { Hero } from '@/components/landing/Hero'
import { TransformationDemo } from '@/components/landing/TransformationDemo'
import { SocialProof } from '@/components/landing/SocialProof'
import { TrustSignals } from '@/components/landing/TrustSignals'
import { Navigation } from '@/components/landing/Navigation'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      <Hero />
      <TransformationDemo />
      <SocialProof />
      <TrustSignals />
    </div>
  )
}
