
import Products from './product';

let products: any = [];
let loadingQuantity = 4;
let catalogLength: any = null;
let filteredProducts = [];
const catalogList = document.querySelector(".catalog-list");
const catalogLoadMore = document.querySelector(".catalog__more");


class Cart {
    public goods: any;
    constructor() {
        this.goods = [];
    }


    addProduct(id: number, name: string, quantity = 1) {
        this.goods.push({
            id,
            name,
            quantity,
        });
    }

    changeQuantity(id: number, newQuantity: number) {
        this.goods.find((item: any) => item.id === id).quantity = newQuantity;
    }

    removeProduct(id: number) {
        this.goods.splice(
            this.goods.findIndex((item: any) => item.id === id),
            1
        );
    }

    withdraw() {
        this.goods = [];
    }

    checkout() {
        if (this.goods.length && currentUser.money > this.totalSum) {
            currentUser.money -= this.totalSum;
            this.goods.forEach((item: any) => {
                const currentItem = products.find((product: any) => product.id === item.id);
                currentItem.substractAmount(item.quantity);
            });
            currentUser.addOrder();
            this.withdraw();
        }
    }

    get totalSum() {
        return this.goods.reduce((accumulator: any, current: any) => {
            return (
                accumulator +
                products.find((product: any) => product.id === current.id).price *
                current.quantity
            );
        }, 0);
    }

    get size() {
        return this.goods.length;
    }
}

class Order {
    public date: any;
    public sum: number;
    public products: any;
    constructor(products: any, totalSum: number) {
        this.date = new Date();
        this.sum = totalSum;
        this.products = products;
    }
}

class Product {
    public name: string | null;
    public year: number | null;
    public price: number | null;
    public amount: number | null;
    constructor(name: string | null, price: number | null, year: number | null, amount: number | null) {
        this.name = name;
        this.year = year;
        this.price = price;
        this.amount = amount;
    }

    substractAmount(quantity: number) {
        if (this.amount !== null) {
            this.amount -= quantity;
        }

    }
}

class User {
    public id: string;
    public name: string;
    public money: number;
    public orders: any;
    public cart: any;
    constructor(name?: string, money?: number) {
        this.id = `u${Date.now()}`;

        this.name = name ? name : '';

        this.money = money ? money : 0;


        this.orders = [];
        this.cart = this.getCart();
    }

    showOrderHistory(direction = 1, field = 'date') {
        return this.orders.sort((a: any, b: any) => {
            if (a[field] > b[field]) {
                return direction;
            }
            if (a[field] < b[field]) {
                return -direction;
            }

            return 0;
        });
    }

    getCart() {
        return new Cart();
    }

    addOrder() {
        this.orders.push(new Order(this.cart.goods, this.cart.totalSum));
    }
}

class Admin extends User {
    public obj: any;
    constructor(obj: any) {
        super(obj, 1);
    }

    createProduct(name: string, year: number, price: number, amount: number) {
        products.push(new Product(name, year, price, amount));
    }
}

const cartCount = document.querySelector(".cart__count");
const cartLink = document.querySelector(".cart__btn");
const makeOrder = document.querySelector(".make-order-btn");
const cartBody = document.querySelector(".cart-items tbody");
const errorMsg = document.querySelector('.make-order > .error');
const searchButton = document.querySelector('.button_for_search');
const searchInput = document.querySelector('.place_for_search');
const clearButton = document.querySelector('.button_for_turn_back');

const btnPhone = document.querySelector('.nav__link.phone');
const btnAll = document.querySelector('.nav__link.all');
const btnWatch = document.querySelector('.nav__link.watch');
const btnAir = document.querySelector('.nav__link.air');


let afterOrder = false;

function setCardCount() {
    if (currentUser) {
        (cartCount as Element).innerHTML = currentUser.cart.size;
        if (currentUser.cart.size) {
            (cartCount as HTMLElement).style.display = "inline-flex";
        } else {
            (cartCount as HTMLElement).style.display = "none";
        }
    }
}

function clearCart() {
    (cartBody as Element).innerHTML = "";
}

(cartLink as Element).addEventListener("click", renderCart);



(makeOrder as HTMLElement).onclick = function (event: any) {
    event.preventDefault();

    try {
        if (currentUser.name == undefined || currentUser.money == undefined) {
            throw new Error("You need to registrate!");
        }
        if (currentUser.money < currentUser.cart.totalSum) {
            throw new Error("Not enough money!");
        }
        currentUser.cart.checkout();
        afterOrder = true;
        setCardCount();
        renderCatalog(loadingQuantity);
        renderCart();
    } catch (error: any) {
        (errorMsg as Element).innerHTML = error.message
    }
};

function renderCart() {
    clearCart();
    if (currentUser && currentUser.cart.size) {
        (document.querySelector(".make-order") as HTMLElement).style.display = "flex";
        currentUser.cart.goods.forEach((item: any) => {
            const currentItem = findProduct(item.id);
            (cartBody as Element).innerHTML += `
            <tr>
              <td>
                <img class="cart-item__img" src="${currentItem.mainImg}" alt="${currentItem.name
                }">
              </td>
              <td><p>${currentItem.name}</p></td>
              <td><p>${currentItem.price
                }<span class="product__price-currency">BYN</span></p></td>
              <td>
                <div class="product__counter counter" style="display: flex" data-id="${currentItem.id
                }">
                <button class="btn-reset counter__btn counter__dcr" type="button">
                  <svg>
                    <use xlink:href="img/sprite.svg#dcr"></use>
                  </svg>
                </button>
                <input class="counter__input" type="text" value="${item.quantity
                }" />
                <button class="btn-reset counter__btn counter__incr" type="button" ${item.quantity < currentItem.amount || "disabled"
                }>
                  <svg>
                    <use xlink:href="img/sprite.svg#incr"></use>
                  </svg>
                </button>
              </div>
              </td>
              <td>
                <button class="btn-reset cart-item__delete" data-id="${item.id
                }" type="button">
                  <svg>
                    <use xlink:href="img/sprite.svg#trash"></use>
                  </svg>
                </button>
              </td>
            </tr>
          `;
        });

        (document.querySelector(".make-order .price") as Element).innerHTML =
            currentUser.cart.totalSum;
    } else {
        (cartBody as Element).innerHTML = afterOrder ?
            `
      <tr>
        <td class="fade"><p style="padding: 30px 14px 80px;
        font-size: 36px;">Thank you for your order</p></td>
      </tr>
        ` :
            `
        <tr>
          <td class="fade"><p style="padding: 30px 14px 80px;
          font-size: 36px;">Your cart is empty</p></td>
        </tr>
        `;
        afterOrder = false;
        const price = document.querySelector(".make-order .price");
        (price as Element).innerHTML = "";
        (document.querySelector(".make-order") as HTMLElement).style.display = "none";
    }

    const itemDelete = document.querySelectorAll(".cart-item__delete");

    itemDelete.forEach((item: any) => {
        item.addEventListener("click", (e: any) => {
            e.stopPropagation();
            currentUser.cart.removeProduct(item.dataset.id);
            setCardCount();
            renderCart();
        });
    });
    saveToLS(currentUser);
}

(cartBody as Element).addEventListener("click", counterControl);

function counterControl(e: any) {
    e.stopPropagation();
    const counter = e.target.closest(".counter");

    if (counter) {
        const productId = counter.dataset.id;
        const counterInput = counter.querySelector(".counter__input");
        const incr = counter.querySelector(".counter__incr");
        const dcr = counter.querySelector(".counter__dcr");
        const productStock = findProduct(productId).amount;

        if (dcr.contains(e.target)) {
            if (counterInput.value > 1 && counterInput.value <= productStock) {
                counterInput.value--;
                incr.disabled = false;
                currentUser.cart.changeQuantity(productId, counterInput.value);
            } else {
                currentUser.cart.removeProduct(productId);
            }
            renderCart();
        } else if (incr.contains(e.target)) {
            if (counterInput.value < productStock) {
                counterInput.value++;
                currentUser.cart.changeQuantity(productId, counterInput.value);
            }
            if (counterInput.value == productStock) {
                incr.disabled = true;
            }
            renderCart();
        }
        setCardCount();
    }
}

(cartBody as Element).addEventListener("keypress", (e) => {
    let target = e.target as HTMLElement;
    if (target.closest(".counter__input")) {
        isNumber(e);
    }
});

(cartBody as Element).addEventListener("change", (e) => {
    let target: any = e.target;
    if (target.closest(".counter__input")) {
        const counter: any = target.closest(".counter");
        const productId = counter.dataset.id;
        const incr: any = counter.querySelector(".counter__incr");
        const productStock = findProduct(productId).amount;

        if (target.value == 0) {
            currentUser.cart.removeProduct(productId);
            incr.disabled = false;
        } else if (target.value >= productStock) {
            incr.disabled = true;
            target.value = productStock;
            currentUser.cart.changeQuantity(productId, target.value);
        } else {
            incr.disabled = false;
            currentUser.cart.changeQuantity(productId, target.value);
        }

        setCardCount();
        renderCart();
    }
});


if (catalogList) {
    loadProducts();
    (catalogLoadMore as Element).addEventListener("click", (e) => {
        loadingQuantity += 4;

        renderCatalog(loadingQuantity);

        visibilityLoadMore();
    });
}

async function loadProducts() {
    await getProductsFromDB();

    renderCatalog(loadingQuantity);
}

function isProductInCart(id: string) {
    let searchElement = null;
    if (currentUser && currentUser.cart.goods.length) {
        searchElement = currentUser.cart.goods.find((e: any) => e.id === id);
    }

    return {
        isInCart: !!searchElement,
        inCartValue: searchElement ? searchElement.quantity : 0,
    };
}

function getFilters() {
    const fields = (document.forms as any).filters.elements;

    return {
        price: {
            min: fields.price__min.value,
            max: fields.price__max.value,
        },
        year: {
            min: fields.year__min.value,
            max: fields.year__max.value,
        },
        instock: fields.instock.checked ? 1 : 0,
        sort: fields.sort.value,
    };
}

const priceInput = document.querySelectorAll(".catalog-price__input");
const yearInput = document.querySelectorAll(".catalog-year__input");

priceInput.forEach((item) => {
    item.addEventListener("keypress", (e) => {
        isNumber(e);
    });
});

yearInput.forEach((item) => {
    item.addEventListener("keypress", (e) => {
        isNumber(e);
    });
});

const filters: any = (document.forms as any).filters;

filters.addEventListener("change", () => {
    loadingQuantity = 4;

    renderCatalog(loadingQuantity);
    visibilityLoadMore();
    console.log(getFilters());
});

function visibilityLoadMore() {
    if (loadingQuantity >= catalogLength) {
        (catalogLoadMore as HTMLElement).style.display = "none";
    } else {
        (catalogLoadMore as HTMLElement).style.display = "block";
    }
}

async function getProductsFromDB() {
    console.log(Products);
    const response = Products;
    products = response.map((e) => Object.assign(new Product(null, null, null, null), e));
}

function renderCatalog(loadingQuantity: any) {
    const filters: any = getFilters();
    filteredProducts = products.filter((item: any) => {
        return (
            item.price >= filters.price.min &&
            item.price <= filters.price.max &&
            item.year >= filters.year.min &&
            item.year <= filters.year.max &&
            item.amount >= filters.instock
        );
    });
    if (filters.sort === '1' || filters.sort === '-1') {
        filteredProducts.sort((a: any, b: any) => {
            if (a.name > b.name) {
                return filters.sort;
            }
            if (a.name < b.name) {
                return -filters.sort;
            }

            return 0;


        });
    } else if (filters.sort === '2' || filters.sort === '-2') {
        filteredProducts.sort((a: any, b: any) => {
            if (a.price > b.price) {
                return filters.sort > 0 ? 1 : -1;
            }
            if (a.price < b.price) {
                return filters.sort > 0 ? -1 : 1;
            }

            return 0;


        });
    }


    catalogLength = filteredProducts.length;

    (catalogList as Element).innerHTML = "";

    for (let i = 0; i < catalogLength; i++) {
        if (i < loadingQuantity) {
            let item = filteredProducts[i];
            let isAvailability = !!item.amount || false;

            const {
                isInCart,
                inCartValue
            } = isProductInCart(item.id);

            (catalogList as Element).innerHTML += `
        <li class="catalog-list__item">
          <article
            class="product ${isInCart ? "product--inCart" : ""} ${!isAvailability ? "product--disabled" : ""
                }">
            <div class="product__img">
              <img src="${item.mainImg}" alt="${item.name}" />
            </div>
            <div class="product__content">
              <h3 class="product__title">${item.name}</h3>
              <p class="product__description"></p>
              <div class="product__year">
                        <span class="product__year-value">${item.year}</span>
                      </div>
              <div class="product__price">
                <span class="product__price-value">${item.price}</span>
                <span class="product__price-currency">BYN</span>
              </div>
              <div class="product__availability">
              ${isAvailability ? "Available" : "Not avaliable"}
              </div>
              <div class="product__control" data-product-id="${item.id
                }" data-product-name="${item.name}">
                <div class="product__counter counter">
                  <button
                    class="btn-reset counter__btn counter__dcr"
                    type="button"
                  >
                    <svg>
                      <use xlink:href="img/sprite.svg#dcr"></use>
                    </svg>
                  </button>
                  <input class="counter__input" type="text" value="${inCartValue || 1
                }" />
                  <button
                    class="btn-reset counter__btn counter__incr"
                    type="button" ${inCartValue < item.amount || "disabled"}
                  >
                    <svg>
                      <use xlink:href="img/sprite.svg#incr"></use>
                    </svg>
                  </button>
                </div>
                <button class="btn-reset product__btn" type="button">Add to cart</button>
              </div>
            </div>
          </article>
        </li>
        `;
        }
    }
}


const modalLink = document.querySelectorAll(".modal-link"),
    modalClose = document.querySelectorAll(".modal__close"),
    body = document.querySelector("body"),
    header = document.querySelector(".header");

let unlock = true;

if (modalLink.length) {
    modalLink.forEach((item: any) => {
        item.addEventListener("click", function (event: any) {
            const targetPopup = document.querySelector(item.dataset.modal);
            event.preventDefault();
            openPopup(targetPopup);
        });
    });
}

if (modalClose.length) {
    modalClose.forEach((item) => {
        item.addEventListener("click", function (event) {
            closePopup(item.closest(".modal"));
        });
    });
}

function openPopup(target: any) {
    const lockPaddingRight =
        window.innerWidth - document.documentElement.clientWidth + "px";
    (body as HTMLBodyElement).classList.add("lock");
    (body as HTMLBodyElement).style.paddingRight = lockPaddingRight;
    (header as HTMLElement).style.paddingRight = lockPaddingRight;
    target.classList.add("active");
    target.addEventListener("click", closeFromLock);
}

function closePopup(target: any) {
    target.classList.remove("active");
    (body as HTMLBodyElement).classList.remove("lock");
    (body as HTMLBodyElement).style.paddingRight = "";
    (header as HTMLElement).style.paddingRight = "";
    if (target.closest("#cart")) {
        renderCatalog(loadingQuantity);

        const price = document.querySelector(".make-order .price");
        (price as Element).innerHTML = "";
        (document.querySelector(".make-order") as HTMLElement).style.display = "none";
        setTimeout(clearCart, 500);
        (errorMsg as Element).innerHTML = "";
    }
    if (target.closest("#new-user")) {
        (newUserName as any).value = "";
        (newUserMoney as any).value = "";
        (newUserName as HTMLElement).style.borderColor = "";
        (newUserMoney as HTMLElement).style.borderColor = "";
    }
    target.removeEventListener("click", closeFromLock);
}

function closeFromLock(e: any) {
    if (!e.target.closest(".modal__area")) {
        closePopup(e.target.closest(".modal"));
    }
}


const newUserName = document.querySelector(".new-user__name");
const newUserMoney = document.querySelector(".new-user__money");

// function newUser(name: string, money: number) {
//     if (currentUser.name == undefined || currentUser.money == undefined) {
//         //   delete currentUser.id;
//         currentUser = serializingUser(currentUser);
//         currentUser.name = name;
//         currentUser.money = money;
//         saveToLS(currentUser);
//     }
//     currentUser = new User(name, money);

// }

function saveToLS(user: any) {
    window.localStorage.setItem("last session", JSON.stringify(user));
}

const ordersLink = document.querySelector('.orders-link');
const ordersBody = document.querySelector('orders-items body');

function renderOrders() {

}

(catalogList as Element).addEventListener("click", (e) => {
    let target = e.target as HTMLElement;
    const productControl: any = target.closest(".product__control");

    if (productControl) {
        const productId = productControl.dataset.productId;
        const productName = productControl.dataset.productName;
        const counterInput = productControl.querySelector(".counter__input");
        const incr = productControl.querySelector(".counter__incr");
        const dcr = productControl.querySelector(".counter__dcr");
        const productStock = findProduct(productId).amount;

        if (target.classList.contains("product__btn")) {
            if (currentUser.cart.size === 10) {
                alert("Sorry, too much products!")
            } else {
                currentUser.cart.addProduct(productId, productName);
                (target.closest(".product") as Element).classList.add("product--inCart");
            }

        } else if (dcr.contains(target)) {
            if ((counterInput as any).value > 1 && (counterInput as any).value <= productStock) {
                (counterInput as any).value--;
                (incr as any).disabled = false;
                currentUser.cart.changeQuantity(productId, (counterInput as any).value);
            } else {
                currentUser.cart.removeProduct(productId);
                (target.closest(".product") as Element).classList.remove("product--inCart");
            }
        } else if ((incr as Element).contains(target)) {
            if ((counterInput as any).value < productStock) {
                (counterInput as any).value++;
                currentUser.cart.changeQuantity(productId, (counterInput as any).value);
            }
            if ((counterInput as any).value == productStock) {
                (incr as any).disabled = true;
            }
        }
        setCardCount();
        saveToLS(currentUser);
    }
});

(catalogList as HTMLElement).addEventListener("input", (e) => {
    let target = e.target as any;
    if (target.closest(".counter__input")) {
        const productControl = target.closest(".product__control");
        const productId: string | undefined = (productControl as HTMLElement).dataset.productId;
        const productName = (productControl as HTMLElement).dataset.productName;
        const incr = (productControl as Element).querySelector(".counter__incr");
        const productStock = findProduct(productId as string).amount;

        if (target.value == 0) {
            currentUser.cart.removeProduct(productId);
            (target.closest(".product") as HTMLElement).classList.remove("product--inCart");
            target.value = 1;
            (incr as any).disabled = false;
        } else if (target.value >= productStock) {
            (incr as any).disabled = true;
            target.value = productStock;
            currentUser.cart.changeQuantity(productId, target.value);
        } else {
            (incr as any).disabled = false;
            currentUser.cart.changeQuantity(productId, target.value);
        }

        setCardCount();
        saveToLS(currentUser);
    }
});

(catalogList as Element).addEventListener("keypress", (e) => {
    let target = e.target as HTMLElement;
    if (target.closest(".counter__input")) {
        isNumber(e);
    }
});

const lastSession = JSON.parse(window.localStorage.getItem("last session") as string);

let currentUser = serializingUser(lastSession) || new User();


setCardCount();


function isEmptyObject(obj: any) {
    return !Object.keys(obj).length;
}

function isNumber(e: any) {
    let charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        e.preventDefault();
    }
}

function findProduct(id: string) {
    return products.find((item: any) => item.id === id);
}

function serializingUser(user: string): User {
    let sUser = Object.assign(new User(), user);
    sUser.cart = Object.assign(new Cart(), sUser.cart);

    return sUser;
}

function changeStatusName() {
    const statusName = document.querySelector(".link__status-name");

    if (currentUser.name != undefined && currentUser.money != undefined) {
        console.log(currentUser.name);
        (statusName as Element).innerHTML = currentUser.name;
    } else {
        (statusName as Element).innerHTML = "Enter";
    }
}

var search, pr, result, result_arr, locale_HTML, result_store;

function func() {
    locale_HTML = document.body.innerHTML;
}
setTimeout(func, 1000);
(btnPhone as Element).addEventListener("click", () => showCategory('phone', true));
(btnWatch as Element).addEventListener("click", () => showCategory('watch', true));
(btnAir as Element).addEventListener("click", () => showCategory('air', true));
(btnAll as Element).addEventListener("click", () => showCategory('', true));

const showCategory = (input: any, action: any) => {

    if (action) {
        const response = Products;
        if (!input) {
            products = response.map((e) => Object.assign(new Product(null, null, null, null), e));
            renderCatalog(loadingQuantity);
            return;
        }
        products = response.filter(item => item.name.toLowerCase().includes(input.toLowerCase())).map((e) => Object.assign(new Product(null, null, null, null), e));
        renderCatalog(loadingQuantity);
    }
}

(searchButton as Element).addEventListener('click', () => {
    const input = (searchInput as any).value;
    const response = Products;
    if (!input) {
        products = response.map((e) => Object.assign(new Product(null, null, null, null), e));
        renderCatalog(loadingQuantity);
        return;
    }
    products = response.filter(item => item.name.toLowerCase().includes(input.toLowerCase())).map((e) => Object.assign(new Product(null, null, null, null), e));
    renderCatalog(loadingQuantity);
})

clearButton?.addEventListener('click', () => {
    const response = Products;
    (searchInput as any).value = '';
    products = response.map((e) => Object.assign(new Product(null, null, null, null), e));
    renderCatalog(loadingQuantity);
})
