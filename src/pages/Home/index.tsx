import { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();

  const cartItemsAmount = cart.reduce((sumAmount, product) => {
    sumAmount[product.id] = product.amount
    return sumAmount
  }, {} as CartItemsAmount)

  useEffect(() => {
    async function loadProducts() {
      const resp = await api.get('/products')
      setProducts(resp.data)
    }

    loadProducts();
  }, []);

  function handleAddProduct(id: number) {
    addProduct(id)
  }

  function renderProducts() {
    return products.map(product => {
      return (
        <li key={product.id}>
          <img src={product.image} alt="imagem do produto"/>
          <strong>{product.title}</strong>
          <span>{formatPrice(product.price)}</span>
          <button
            type="button"
            data-testid="add-product-button"
            onClick={() => handleAddProduct(product.id)}
          >
            <div data-testid="cart-product-quantity">
              <MdAddShoppingCart size={16} color="#FFF" />
              {cartItemsAmount[product.id] || 0}
            </div>

            <span>ADICIONAR AO CARRINHO</span>
          </button>
        </li>
      )
    })
  }

  return (
    <ProductList>
      {renderProducts()}
    </ProductList>
  );
};

export default Home;
