import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Clock3, Minus, Plus, Search, ShieldCheck, ShoppingBasket, Star, Trash2, Truck, Utensils } from 'lucide-react';
import { apiRequest } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

const Shop = ({ addToCart, updateQuantity, removeFromCart, cart }) => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [groceries, setGroceries] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [foodMode, setFoodMode] = useState('Delivery');
  const [message, setMessage] = useState('');
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [groceryLoading, setGroceryLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [groceryError, setGroceryError] = useState('');

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const cartHasItems = cart.length > 0;
  const cartMode = useMemo(() => {
    if (!cartHasItems) return 'Empty';
    return cart.every((item) => item.fulfillmentType === 'Dine-In') ? 'Dine-In' : 'Delivery';
  }, [cart, cartHasItems]);

  const loadMenu = async (restaurant) => {
    setSelectedRestaurant(restaurant);
    const data = await apiRequest(`/catalog/restaurants/${restaurant._id}/menu`);
    setMenu(data.items || []);
  };

  useEffect(() => {
    const loadCatalog = async () => {
      setCatalogLoading(true);
      setCatalogError('');
      try {
        const [restaurantData, categoryData] = await Promise.all([
          apiRequest('/catalog/restaurants'),
          apiRequest('/catalog/grocery-categories')
        ]);
        setRestaurants(restaurantData || []);
        setCategories((categoryData && categoryData.length > 0) ? categoryData : ['All']);
        if (restaurantData?.length > 0) {
          await loadMenu(restaurantData[0]);
        }
      } catch (error) {
        setCatalogError(error.message || 'Unable to load restaurants. Please check backend and seed data.');
      } finally {
        setCatalogLoading(false);
      }
    };

    loadCatalog();
  }, []);

  useEffect(() => {
    const loadGroceries = async () => {
      setGroceryLoading(true);
      setGroceryError('');
      try {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (search) params.set('search', search);
        const data = await apiRequest(`/catalog/groceries?${params.toString()}`);
        setGroceries(data || []);
      } catch (error) {
        setGroceryError(error.message || 'Unable to load grocery items.');
      } finally {
        setGroceryLoading(false);
      }
    };

    loadGroceries();
  }, [category, search]);

  const handleAdd = (item) => {
    if (!user || user.role !== 'customer') {
      setMessage('Please login as a customer to add items to cart.');
      return;
    }

    const hasDineIn = cart.some((cartItem) => cartItem.fulfillmentType === 'Dine-In');
    const hasDelivery = cart.some((cartItem) => cartItem.fulfillmentType === 'Delivery');

    if (item.fulfillmentType === 'Dine-In' && hasDelivery) {
      setMessage('Dine-in food cannot be mixed with delivery or grocery items. Checkout or clear delivery items first.');
      return;
    }
    if (item.fulfillmentType === 'Delivery' && hasDineIn) {
      setMessage('Delivery items cannot be mixed with dine-in food. Checkout or clear dine-in items first.');
      return;
    }

    const existing = cart.find((cartItem) => cartItem.cartId === item.cartId);
    if (existing && existing.quantity >= (existing.maxQuantity || item.maxQuantity || 99)) {
      setMessage(`Only ${existing.maxQuantity || item.maxQuantity || 99} ${item.name} available.`);
      return;
    }

    addToCart(item);
    setMessage(existing ? `${item.name} quantity updated in cart.` : `${item.name} added to cart for ${item.fulfillmentType}.`);
    setTimeout(() => setMessage(''), 2200);
  };

  const cartItemFor = (cartId) => cart.find((item) => item.cartId === cartId);

  const renderCartAction = (product) => {
    const currentItem = cartItemFor(product.cartId);

    if (!currentItem) {
      return (
        <button className="add-cart-btn" onClick={() => handleAdd(product)}>
          <Plus size={17} /> Add to Cart
        </button>
      );
    }

    const atMax = currentItem.quantity >= (currentItem.maxQuantity || product.maxQuantity || 99);

    return (
      <div className="cart-action-stack">
        <span className="in-cart-label">In cart</span>
        <div className="inline-cart-controls" aria-label={`${product.name} quantity controls`}>
          <button title="Decrease quantity" onClick={() => updateQuantity(product.cartId, currentItem.quantity - 1)}><Minus size={14} /></button>
          <input
            type="number"
            min="1"
            max={currentItem.maxQuantity || product.maxQuantity || 99}
            value={currentItem.quantity}
            onChange={(e) => updateQuantity(product.cartId, e.target.value)}
            aria-label={`${product.name} quantity`}
          />
          <button title="Increase quantity" disabled={atMax} onClick={() => handleAdd(product)}><Plus size={14} /></button>
          <button className="danger-icon" title="Remove from cart" onClick={() => removeFromCart(product.cartId)}><Trash2 size={14} /></button>
        </div>
      </div>
    );
  };

  const renderEmptyCatalog = (title, text) => (
    <div className="catalog-empty-state">
      <AlertCircle size={30} />
      <h3>{title}</h3>
      <p>{text}</p>
      <code>npm run seed</code>
    </div>
  );

  return (
    <div className="page shop-page">
      <section className="shop-hero">
        <div>
          <span className="eyebrow">Foodpanda style MERN workflow</span>
          <h1>Order food, shop groceries, or choose dine-in from one clean marketplace.</h1>
          <p>
            Restaurant items support both delivery and dine-in. Grocery orders are delivery only,
            then admin assigns an available rider and customer can track rider details.
          </p>
        </div>
        <div className="shop-hero-card">
          <div className="hero-metric"><Truck size={18} /><span>Delivery ETA</span><strong>30-55 mins</strong></div>
          <div className="hero-metric"><Utensils size={18} /><span>Dine-in wait</span><strong>15-40 mins</strong></div>
          <div className="hero-metric"><ShoppingBasket size={18} /><span>Cart mode</span><strong>{cartMode}</strong></div>
        </div>
      </section>

      {message && <div className="alert success floating-alert">{message}</div>}
      {catalogError && <div className="alert error">{catalogError}</div>}

      <div className="market-tabs">
        <button className={foodMode === 'Delivery' ? 'active' : ''} onClick={() => setFoodMode('Delivery')}><Truck size={17} /> Food Delivery</button>
        <button className={foodMode === 'Dine-In' ? 'active' : ''} onClick={() => setFoodMode('Dine-In')}><Utensils size={17} /> Dine-In</button>
        <a href="#grocery-mart"><ShoppingBasket size={17} /> Grocery Mart</a>
        {cart.length > 0 && <Link className="cart-tab-link" to="/cart">View Cart ({cartCount})</Link>}
      </div>

      <section className="panel glass-panel">
        <div className="section-title mode-title">
          <div>
            <h2>Restaurants</h2>
            <p>{foodMode === 'Delivery' ? 'Choose dishes for home delivery. Admin will assign rider after accepting the order.' : 'Choose dishes for dine-in. The checkout asks for arrival time and guests instead of delivery address.'}</p>
          </div>
          <div className="mode-toggle" aria-label="Restaurant order mode">
            <button className={foodMode === 'Delivery' ? 'active' : ''} onClick={() => setFoodMode('Delivery')}><Truck size={16} /> Delivery</button>
            <button className={foodMode === 'Dine-In' ? 'active' : ''} onClick={() => setFoodMode('Dine-In')}><Utensils size={16} /> Dine-In</button>
          </div>
        </div>

        {catalogLoading ? (
          <div className="catalog-empty-state"><h3>Loading restaurants...</h3><p>Please wait while DineMart loads catalog data.</p></div>
        ) : restaurants.length === 0 ? (
          renderEmptyCatalog('No restaurants found', 'Your database is connected but restaurant seed data is missing. Run seed once from the main project folder.')
        ) : (
          <div className="restaurant-grid featured-restaurants">
            {restaurants.map((restaurant) => (
              <button className={`restaurant-card ${selectedRestaurant?._id === restaurant._id ? 'active' : ''}`} key={restaurant._id} onClick={() => loadMenu(restaurant)}>
                <div className="restaurant-image-wrap">
                  <img src={restaurant.image} alt={restaurant.name} />
                  <span className="rating-badge"><Star size={14} fill="currentColor" /> {restaurant.rating}</span>
                </div>
                <div>
                  <h3>{restaurant.name}</h3>
                  <p>{restaurant.cuisine}</p>
                  <span><Clock3 size={14} /> {foodMode === 'Dine-In' ? 'Wait' : 'Delivery'} {restaurant.deliveryTime} mins • Rs. {restaurant.deliveryFee}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedRestaurant && (
          <div className="items-area">
            <div className="section-title compact-title">
              <div>
                <h2>{selectedRestaurant.name} Menu</h2>
                <p>{foodMode === 'Dine-In' ? 'Items will be prepared for restaurant arrival.' : 'Items will be prepared and handed to an assigned rider.'}</p>
              </div>
              <span className="fulfillment-pill">{foodMode === 'Dine-In' ? <Utensils size={16} /> : <Truck size={16} />} {foodMode}</span>
            </div>
            {menu.length === 0 ? (
              renderEmptyCatalog('No menu items found', 'This restaurant has no menu items yet. Seed data will create sample menu items.')
            ) : (
              <div className="product-grid premium-grid">
                {menu.map((item) => {
                  const product = {
                    cartId: `food-${foodMode}-${item._id}`,
                    itemType: 'food',
                    itemId: item._id,
                    name: item.name,
                    sourceName: selectedRestaurant.name,
                    price: item.price,
                    image: item.image,
                    fulfillmentType: foodMode,
                    prepTime: item.prepTime,
                    maxQuantity: 20
                  };

                  return (
                    <div className="product-card premium-card" key={item._id}>
                      <div className="product-image-wrap">
                        <img src={item.image} alt={item.name} />
                        <span className="image-badge">{item.category}</span>
                      </div>
                      <div className="product-content">
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                        <small>{foodMode === 'Dine-In' ? `Dine-in wait: ${Number(item.prepTime || 15) + 10} mins` : `Delivery estimate: ${selectedRestaurant.deliveryTime} mins`}</small>
                        <div className="price-row action-price-row">
                          <strong>Rs. {item.price}</strong>
                          {renderCartAction(product)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      <section className="panel glass-panel" id="grocery-mart">
        <div className="section-title with-search grocery-heading">
          <div>
            <span className="eyebrow">Delivery only</span>
            <h2>Grocery Mart</h2>
            <p>Add daily-use groceries to cart, checkout with delivery address, then admin assigns a rider.</p>
          </div>
          <div className="search-box"><Search size={16} /><input placeholder="Search milk, rice, eggs..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        </div>

        <div className="filter-row grocery-filters">
          {categories.map((cat) => <button key={cat} className={category === cat ? 'filter active' : 'filter'} onClick={() => setCategory(cat)}>{cat}</button>)}
        </div>

        {groceryError && <div className="alert error">{groceryError}</div>}
        {groceryLoading ? (
          <div className="catalog-empty-state"><h3>Loading grocery items...</h3><p>Please wait while grocery products load.</p></div>
        ) : groceries.length === 0 ? (
          <div className="catalog-empty-state">
            <ShoppingBasket size={30} />
            <h3>No grocery items showing</h3>
            <p>{search || category !== 'All' ? 'No item matched your search/filter. Clear the search or choose All.' : 'Your grocery collection is empty. Run seed once from the main project folder to add grocery products.'}</p>
            <div className="empty-actions">
              {(search || category !== 'All') && <button className="ghost-btn" onClick={() => { setSearch(''); setCategory('All'); }}>Clear Filters</button>}
              <code>npm run seed</code>
            </div>
          </div>
        ) : (
          <div className="product-grid premium-grid grocery-grid">
            {groceries.map((item) => {
              const product = {
                cartId: `grocery-${item._id}`,
                itemType: 'grocery',
                itemId: item._id,
                name: item.name,
                sourceName: 'DineMart Grocery',
                price: item.price,
                image: item.image,
                fulfillmentType: 'Delivery',
                maxQuantity: Math.max(1, Number(item.stock || 1))
              };

              return (
                <div className="product-card premium-card grocery-card" key={item._id}>
                  <div className="product-image-wrap grocery-image-wrap">
                    <img src={item.image} alt={item.name} />
                    <span className="image-badge"><ShieldCheck size={13} /> {item.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                  </div>
                  <div className="product-content">
                    <span className="chip">{item.category}</span>
                    <h3>{item.name}</h3>
                    <p>{item.unit} • {item.stock} available</p>
                    <small>Rider delivery to your address after checkout</small>
                    <div className="price-row action-price-row">
                      <strong>Rs. {item.price}</strong>
                      {item.stock > 0 ? renderCartAction(product) : <button className="add-cart-btn disabled" disabled>Unavailable</button>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {cart.length > 0 && (
        <div className="floating-cart-summary">
          <div>
            <strong>{cartCount} item{cartCount > 1 ? 's' : ''} in cart</strong>
            <span>Rs. {cartTotal} • {cartMode}</span>
          </div>
          <Link className="primary-btn" to="/cart">Manage Cart</Link>
        </div>
      )}
    </div>
  );
};

export default Shop;
