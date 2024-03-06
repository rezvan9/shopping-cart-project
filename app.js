import { productsData } from "./products.js";

const productsDOM = document.querySelector(".products-center");
const backDrop = document.querySelector(".backdrop");
const cartModal = document.querySelector(".cart");
const cartBtn = document.querySelector(".cart-btn");

const cartTotal = document.querySelector(".cart-total");
const cartItems = document.querySelector(".cart-items");
const cartContent = document.querySelector(".cart-content");
const clearCart = document.querySelector(".clear-cart");

let cart = [];
let buttonsDOM = [];

//get products

class Products {
  getProducts() {
    return productsData;
  }
}

//display products

class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((item) => {
      result += `<div class="product">
          <div class="img-container">
            <img src=${item.imageUrl} class="product-img" />
          </div>
          <div class="product-desc">
            <p class="product-price">${item.price}$</p>
            <p class="product-title">${item.title}</p>
          </div>
          <button class="btn add-to-cart" data-id=${item.id}>add to cart</button>
        </div>`;
      productsDOM.innerHTML = result;
    });
  }

  getAddToCartBtns() {
    const addToCartBtns = [...document.querySelectorAll(".add-to-cart")];
    buttonsDOM = addToCartBtns;

    addToCartBtns.forEach((btn) => {
      const id = btn.dataset.id;
      //check if this product id is in cart
      const isInCart = cart.find((p) => p.id === parseInt(id));
      if (isInCart) {
        btn.innerText = "In Cart";
        btn.disabled = true;
      }

      btn.addEventListener("click", (e) => {
        e.target.innerText = "In Cart";
        e.target.disabled = true;

        //1.get product from local storage
        const addedProduct = { ...Storage.getProduct(id), quantity: 1 };
        console.log(addedProduct);

        //2.add to cart
        cart = [...cart, addedProduct];

        //3.save to local storage
        Storage.saveCart(cart);

        //4.update cart value
        this.setCartValue(cart);

        //5.add to cart item
        this.addToCart(addedProduct);

        //6.get cart from storage
      });
    });
  }

  setCartValue(cart) {
    //1.calculate cart items
    //2.cart total price
    let tempCartItems = 0;
    const totalPrice = cart.reduce((acc, curr) => {
      tempCartItems += curr.quantity;
      return acc + curr.quantity * curr.price;
    }, 0);
    cartTotal.innerText = `Total Price: ${totalPrice.toFixed(2)} $`;
    cartItems.innerText = tempCartItems;
  }

  addToCart(cartItem) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
    <img class="cart-item-img" src=${cartItem.imageUrl} />
              <div class="cart-item-desc">
                <h4>${cartItem.title}</h4>
                <h5>${cartItem.price} $</h5>
              </div>
              <div class="cart-item-controller">
                <i class="fas fa-chevron-up" data-id=${cartItem.id}></i>
                <p>1</p>
                <i class="fas fa-chevron-down" data-id=${cartItem.id}></i>
              </div>
              <i class="far fa-trash-alt" data-id=${cartItem.id}></i>
              `;
    cartContent.appendChild(div);
  }

  setupApp() {
    //get cart from storage
    cart = Storage.getCart() || [];
    //add cart item and show in modal
    cart.forEach((cartItem) => this.addToCart(cartItem));
    //set values: price + items
    this.setCartValue(cart);
  }

  cartLogic() {
    //all the operations like adding/removing/clearing products are here
    //clear cart
    clearCart.addEventListener("click", () => this.clearCart());

    //cart functionality
    cartContent.addEventListener("click", (e) => {
      console.log(e.target);
      if (e.target.classList.contains("fa-chevron-up")) {
        console.log(e.target.dataset.id);
        const addQuantity = e.target;

        //get item from cart
        const addedItem = cart.find(
          (cItem) => cItem.id == addQuantity.dataset.id
        );
        addedItem.quantity++;

        //update cart value
        this.setCartValue(cart);

        //save cart
        Storage.saveCart(cart);

        //update cart item in ui
        console.log(addQuantity.nextElementSibling);
        addQuantity.nextElementSibling.innerText = addedItem.quantity;
      } else if (e.target.classList.contains("fa-trash-alt")) {
        const removeItem = e.target;
        const _removedItem = cart.find((c) => c.id == removeItem.dataset.id);

        this.removeItem(_removedItem.id);
        Storage.saveCart(cart);
        cartContent.removeChild(removeItem.parentElement);
      } else if (e.target.classList.contains("fa-chevron-down")) {
        const subQuantity = e.target;
        const substractedItem = cart.find(
          (c) => c.id == subQuantity.dataset.id
        );

        if (substractedItem.quantity === 1) {
          this.removeItem(substractedItem.id);
          cartContent.removeChild(subQuantity.parentElement.parentElement);
          return;
        }

        substractedItem.quantity--;
        this.setCartValue(cart);

        //save cart
        Storage.saveCart(cart);

        //update cart item in ui
        subQuantity.previousElementSibling.innerText = substractedItem.quantity;
      }
    });
  }

  clearCart() {
    //remove
    cart.forEach((cItem) => this.removeItem(cItem.id));

    //remove cart content children
    while (cartContent.children.length) {
      cartContent.removeChild(cartContent.children[0]);
    }

    closeModal();
  }

  removeItem(id) {
    //update cart
    cart = cart.filter((cItem) => cItem.id !== id);

    //update total price and cart items
    this.setCartValue(cart);

    //update storage
    Storage.saveCart(cart);

    //get add to cart btns => update text and disable
    this.getSingleButton(id);
  }

  getSingleButton(id) {
    const button = buttonsDOM.find(
      (btn) => parseInt(btn.dataset.id) === parseInt(id)
    );
    button.innerText = "add to cart";
    button.disabled = false;
  }
}

//storage

class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    const _products = JSON.parse(localStorage.getItem("products"));
    return _products.find((p) => p.id === parseInt(id));
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return JSON.parse(localStorage.getItem("cart"));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const products = new Products();
  const productsData = products.getProducts();

  //get cart and set up app
  const ui = new UI();
  ui.setupApp();
  ui.displayProducts(productsData);
  ui.getAddToCartBtns();
  ui.cartLogic();
  Storage.saveProducts(productsData);
});

//cart items modal
function showModal() {
  backDrop.style.display = "block";
  cartModal.style.opacity = "1";
  cartModal.style.top = "20%";
}

function closeModal() {
  backDrop.style.display = "none";
  cartModal.style.opacity = "0";
  cartModal.style.top = "-100%";
}

cartBtn.addEventListener("click", showModal);
backDrop.addEventListener("click", closeModal);
