export const getCart = () => {
  const cart = sessionStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
};

export const setCart = (cart) => {
  sessionStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('storage'));
};

export const addToCart = (product) => {
  const cart = getCart();
  cart.push(product);
  setCart(cart);
};

export const removeFromCart = (productId) => {
  let cart = getCart();
  cart = cart.filter(item => item.gameId !== productId);
  setCart(cart);
};