import Hero from "@/components/modules/Hero";
import TrustBadges from "@/components/modules/TrustBadges";
import PromoBanner from "@/components/modules/PromoBanner";
import CategoryGrid from "@/components/modules/CategoryGrid";
import FeaturedProducts from "@/components/modules/FeaturedProducts";
import CTABanner from "@/components/modules/CTABanner";
import Newsletter from "@/components/modules/Newsletter";
import { getFeaturedProducts, getPromoProducts, getProducts } from "@/lib/products";
import { getCategories } from "@/lib/categories";

export default async function HomePage() {
  const [featured, promo, categories, products] = await Promise.all([
    getFeaturedProducts(),
    getPromoProducts(),
    getCategories(),
    getProducts(),
  ]);

  return (
    <>
      <Hero
        stats={{
          productCount: products.length,
          categoryCount: categories.length,
        }}
      />
      <TrustBadges />
      <PromoBanner products={promo} />
      <CategoryGrid categories={categories} />
      <FeaturedProducts products={featured} />
      <CTABanner />
      <Newsletter />
    </>
  );
}
