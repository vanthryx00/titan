import React from 'react';
import { Hero } from '../components/Hero';
import { FlashGallery } from '../components/FlashGallery';
import { BodyMapEstimator } from '../components/BodyMapEstimator';
import { ArtistRoster } from '../components/ArtistRoster';
import { AIConceptStudio } from '../components/AIConceptStudio';
import { CoverUpSlider } from '../components/CoverUpSlider';
import { AftercareGuide } from '../components/AftercareGuide';
import { WalkInKiosk } from '../components/WalkInKiosk';
import { MerchStore } from '../components/MerchStore';
import { ReviewsSection } from '../components/ReviewsSection';

export const LandingPage = ({
  artists = [],
  flashDesigns = [],
  products = [],
  reviews = [],
  cart = [],
  onAddToCart,
  onUpdateCartQty,
  onRemoveFromCart,
  onClearCart,
  isCartOpen,
  onCloseCart,
  onOpenBookingWithSpec,
  onClaimFlash,
  onSelectArtistForBooking,
  onBookWithConcept
}) => {
  const handleScrollTo = (elementId) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-0">
      {/* 1. Hero Section */}
      <Hero
        onOpenBooking={() => onOpenBookingWithSpec(null)}
        onScrollTo={handleScrollTo}
      />

      {/* 2. Flash Gallery */}
      <FlashGallery
        flashDesigns={flashDesigns}
        onClaimFlash={onClaimFlash}
      />

      {/* 3. Interactive Body Map, Pain & Cost Estimator */}
      <BodyMapEstimator
        onBookWithEstimate={onOpenBookingWithSpec}
      />

      {/* 4. Resident Artists Roster */}
      <ArtistRoster
        artists={artists}
        onSelectArtistForBooking={onSelectArtistForBooking}
      />

      {/* 5. AI Concept Studio */}
      <AIConceptStudio
        onBookWithConcept={onBookWithConcept}
      />

      {/* 6. Interactive Before / After Cover-Up Slider */}
      <CoverUpSlider
        onBookCoverUp={() => onOpenBookingWithSpec({ service: 'Cover-Up Consultation' })}
      />

      {/* 7. Step-by-Step Aftercare Guide & Printable Sheet */}
      <AftercareGuide />

      {/* 8. Live Walk-In Board & SMS Waitlist */}
      <WalkInKiosk />

      {/* 9. Merch & Pro Care Store */}
      <MerchStore
        products={products}
        cart={cart}
        onAddToCart={onAddToCart}
        onUpdateCartQty={onUpdateCartQty}
        onRemoveFromCart={onRemoveFromCart}
        onClearCart={onClearCart}
        isCartOpen={isCartOpen}
        onCloseCart={onCloseCart}
      />

      {/* 10. Reviews & Testimonials */}
      <ReviewsSection reviews={reviews} />
    </div>
  );
};
