
import AmazonNavbar from '@/components/AmazonNavbar';
import HeroSlider from '@/components/HeroSlider';
import ProductCard from '@/components/ProductCard';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

async function getProducts() {
  await connectToDatabase();
  const products = await Product.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(products));
}

const CATEGORIES = [
  { name: 'All', icon: '🍕' },
  { name: 'Burgers', icon: '🍔' },
  { name: 'Pizza', icon: '🍕' },
  { name: 'Sushi', icon: '🍣' },
  { name: 'Drinks', icon: '🥤' },
  { name: 'Desserts', icon: '🍰' },
];

export default async function Home() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-peca-bg-alt pb-20">
      <HeroSlider slides={products.filter((p: any) => p.showInSlider)} />

      <div className="container mx-auto px-4 mt-12 text-center">
        <div className="mb-14">
          <h1 className="text-4xl md:text-5xl font-black text-peca-text tracking-tighter mb-2">Welcome back!</h1>
          <p className="text-sm font-bold text-peca-text-light uppercase tracking-[0.2em]">Discover our curated collections</p>
        </div>

        <div id="products">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-peca-text tracking-tighter">Recommended for You</h2>
            <button className="text-[10px] font-black uppercase tracking-widest text-slate-900 bg-peca-purple px-4 py-2 rounded-xl shadow-lg shadow-peca-purple/20 hover:scale-105 transition-all">See All Products</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-32">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl shadow-sm">📦</div>
              <p className="text-lg font-black text-peca-text">No products found</p>
              <p className="text-sm text-peca-text-light italic">Check back later for new arrivals!</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
