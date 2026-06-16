import ProductCard from './ProductCard';
import './ProductGrid.css';

export default function ProductGrid({ products = [], isPageContext = false }) {
  // If no products from API, show demo products
  const displayProducts = products.length > 0 ? products : demoProducts;

  const gridContent = (
    <div className="product-grid">
      {displayProducts.map((product, index) => {
        // Editorial masonry: every 5th item is large, every 3rd is medium
        let size = 'normal';
        if (index % 5 === 0) size = 'large';
        else if (index % 3 === 0) size = 'medium';

        return (
          <div
            key={product._id || product.id || index}
            className={`product-grid__item product-grid__item--${size}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <ProductCard product={product} size={size} />
          </div>
        );
      })}
    </div>
  );

  if (isPageContext) {
    return gridContent;
  }

  return (
    <section className="product-grid-section section-spacing">
      <div className="container">
        <div className="product-grid__header">
          <h2 className="product-grid__title">The Collection</h2>
          <p className="product-grid__subtitle">
            Curated pieces for the modern wardrobe
          </p>
        </div>
        {gridContent}
      </div>
    </section>
  );
}

const demoProducts = [
  {
    id: '1',
    name: 'Noir Oversized Tee',
    price: 2999,
    images: [],
    totalStock: 12,
  },
  {
    id: '2',
    name: 'Essential Hoodie',
    price: 4999,
    images: [],
    totalStock: 8,
  },
  {
    id: '3',
    name: 'Structured Blazer',
    price: 8999,
    images: [],
    totalStock: 2,
  },
  {
    id: '4',
    name: 'Slim Cargo Pants',
    price: 3999,
    images: [],
    totalStock: 15,
  },
  {
    id: '5',
    name: 'Ribbed Tank',
    price: 1999,
    images: [],
    totalStock: 20,
  },
  {
    id: '6',
    name: 'Drop Shoulder Crewneck',
    price: 3499,
    images: [],
    totalStock: 1,
  },
  {
    id: '7',
    name: 'Tailored Shorts',
    price: 2499,
    images: [],
    totalStock: 10,
  },
  {
    id: '8',
    name: 'Heavyweight Jacket',
    price: 7999,
    images: [],
    totalStock: 5,
  },
];
