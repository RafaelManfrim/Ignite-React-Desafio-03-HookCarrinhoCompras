import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const { data: productStock } = await api.get(`/stock/${productId}`)

      if(productStock.amount === 0) {
        toast.error('Quantidade solicitada fora de estoque')
        return
      }

      const updatedCart = [ ...cart]

      const productAlreadyExists = updatedCart.find(product => product.id === productId)

      const currentAmount = productAlreadyExists ? productAlreadyExists.amount : 0

      const amount = currentAmount + 1

      if(amount > productStock.amount) {
        toast.error('Quantidade solicitada fora de estoque')
        return
      }

      if(productAlreadyExists) {
        productAlreadyExists.amount = amount
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
        setCart(updatedCart)
      } else {
        const { data: newCartProduct } = await api.get(`/products/${productId}`)
        newCartProduct.amount = amount
        const newCart: Product[] = [ ...cart, newCartProduct ]
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
        setCart(newCart)
      }
    } catch {
      toast.error('Erro na adição do produto')
    }
  }

  const removeProduct = (productId: number) => {
    try {
      if(cart.find(product => product.id === productId)){
        const newList = cart.filter(item => item.id !== productId)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newList))
        setCart(newList)
      } else {
        throw new Error()
      }
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({ productId, amount }: UpdateProductAmount) => {
    try {
      if(amount <= 0) {
        return
      }

      const { data: productStock } = await api.get(`/stock/${productId}`)

      if(productStock.amount < amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return
      }

      const updatedCart = [...cart]
      const updatedProduct = updatedCart.find(product => product.id === productId)

      if(updatedProduct) {
        updatedProduct.amount = amount
        setCart(updatedCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
      } else {
        throw new Error()
      }
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider value={{ cart, addProduct, removeProduct, updateProductAmount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
