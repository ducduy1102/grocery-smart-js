const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

/**
 * Hàm tải template
 *
 * Cách dùng:
 * <div id="parent"></div>
 * <script>
 *  load("#parent", "./path-to-template.html");
 * </script>
 */
function load(selector, path) {
  const cached = localStorage.getItem(path);
  if (cached) {
    $(selector).innerHTML = cached;
  }

  fetch(path)
    .then((res) => res.text())
    .then((html) => {
      if (html !== cached) {
        $(selector).innerHTML = html;
        localStorage.setItem(path, html);
      }
    })
    .finally(() => {
      window.dispatchEvent(new Event("template-loaded"));
    });
}

/**
 * Hàm kiểm tra một phần tử
 * có bị ẩn bởi display: none không
 */
function isHidden(element) {
  if (!element) return true;

  if (window.getComputedStyle(element).display === "none") {
    return true;
  }

  let parent = element.parentElement;
  while (parent) {
    if (window.getComputedStyle(parent).display === "none") {
      return true;
    }
    parent = parent.parentElement;
  }

  return false;
}

/**
 * Hàm buộc một hành động phải đợi
 * sau một khoảng thời gian mới được thực thi
 */
function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

/**
 * Hàm tính toán vị trí arrow cho dropdown
 *
 * Cách dùng:
 * 1. Thêm class "js-dropdown-list" vào thẻ ul cấp 1
 * 2. CSS "left" cho arrow qua biến "--arrow-left-pos"
 */
const calArrowPos = debounce(() => {
  if (isHidden($(".js-dropdown-list"))) return;

  const items = $$(".js-dropdown-list > li");

  items.forEach((item) => {
    const arrowPos = item.offsetLeft + item.offsetWidth / 2;
    item.style.setProperty("--arrow-left-pos", `${arrowPos}px`);
  });
});

// Tính toán lại vị trí arrow khi resize trình duyệt
window.addEventListener("resize", calArrowPos);

// Tính toán lại vị trí arrow sau khi tải template
window.addEventListener("template-loaded", calArrowPos);

/**
 * Giữ active menu khi hover
 *
 * Cách dùng:
 * 1. Thêm class "js-menu-list" vào thẻ ul menu chính
 * 2. Thêm class "js-dropdown" vào class "dropdown" hiện tại
 *  nếu muốn reset lại item active khi ẩn menu
 */
window.addEventListener("template-loaded", handleActiveMenu);

function handleActiveMenu() {
  const dropdowns = $$(".js-dropdown");
  const menus = $$(".js-menu-list");
  const activeClass = "menu-column__item--active";

  const removeActive = (menu) => {
    menu.querySelector(`.${activeClass}`)?.classList.remove(activeClass);
  };

  const init = () => {
    menus.forEach((menu) => {
      const items = menu.children;
      if (!items.length) return;

      removeActive(menu);
      if (window.innerWidth > 991) items[0].classList.add(activeClass);

      Array.from(items).forEach((item) => {
        item.onmouseenter = () => {
          if (window.innerWidth <= 991) return;
          removeActive(menu);
          item.classList.add(activeClass);
        };
        item.onclick = () => {
          if (window.innerWidth > 991) return;
          removeActive(menu);
          item.classList.add(activeClass);
          item.scrollIntoView();
        };
      });
    });
  };

  init();

  dropdowns.forEach((dropdown) => {
    dropdown.onmouseleave = () => init();
  });
}

/**
 * JS toggle
 *
 * Cách dùng:
 * <button class="js-toggle" toggle-target="#box">Click</button>
 * <div id="box">Content show/hide</div>
 */
window.addEventListener("template-loaded", initJsToggle);

function initJsToggle() {
  $$(".js-toggle").forEach((button) => {
    const target = button.getAttribute("toggle-target");
    if (!target) {
      document.body.innerText = `Cần thêm toggle-target cho: ${button.outerHTML}`;
    }
    button.onclick = (e) => {
      e.preventDefault();

      if (!$(target)) {
        return (document.body.innerText = `Không tìm thấy phần tử "${target}"`);
      }
      const isHidden = $(target).classList.contains("hide");

      requestAnimationFrame(() => {
        $(target).classList.toggle("hide", !isHidden);
        $(target).classList.toggle("show", isHidden);
      });
    };
    document.onclick = function (e) {
      if (!e.target.closest(target)) {
        const isHidden = $(target).classList.contains("hide");
        if (!isHidden) {
          button.click();
        }
      }
    };
  });
}

window.addEventListener("template-loaded", () => {
  const links = $$(".js-dropdown-list > li > a");

  links.forEach((link) => {
    link.onclick = () => {
      if (window.innerWidth > 991) return;
      const item = link.closest("li");
      item.classList.toggle("navbar__item--active");
    };
  });
});

window.addEventListener("template-loaded", () => {
  const tabsSelector = "prod-tab__item";
  const contentsSelector = "prod-tab__content";

  const tabActive = `${tabsSelector}--current`;
  const contentActive = `${contentsSelector}--current`;

  const tabContainers = $$(".js-tabs");
  tabContainers.forEach((tabContainer) => {
    const tabs = tabContainer.querySelectorAll(`.${tabsSelector}`);
    const contents = tabContainer.querySelectorAll(`.${contentsSelector}`);
    tabs.forEach((tab, index) => {
      tab.onclick = () => {
        tabContainer.querySelector(`.${tabActive}`)?.classList.remove(tabActive);
        tabContainer.querySelector(`.${contentActive}`)?.classList.remove(contentActive);
        tab.classList.add(tabActive);
        contents[index].classList.add(contentActive);
      };
    });
  });
});

window.addEventListener("template-loaded", () => {
  const switchBtn = document.querySelector("#switch-theme-btn");
  if (switchBtn) {
    switchBtn.onclick = function () {
      const isDark = localStorage.dark === "true";
      document.querySelector("html").classList.toggle("dark", !isDark);
      localStorage.setItem("dark", !isDark);
      switchBtn.querySelector("span").textContent = isDark ? "Dark mode" : "Light mode";
    };
    const isDark = localStorage.dark === "true";
    switchBtn.querySelector("span").textContent = isDark ? "Light mode" : "Dark mode";
  }
});

const isDark = localStorage.dark === "true";
document.querySelector("html").classList.toggle("dark", isDark);

// Button increament and decrement total price
window.addEventListener("load", function () {
  // const increment = document.querySelector(".btn-increment");
  // const decrement = document.querySelector(".btn-decrement");
  // const quantity = document.querySelector(".quantity");
  // let countValue = parseInt(quantity.textContent);
  // // let totalPrice = document.querySelector(".priceItem");
  // let totalPrice = document.querySelector(".price");
  // const price = parseInt(totalPrice.textContent);
  // let priceValue = price;

  // increment.addEventListener("click", () => {
  //   let add = ++countValue;
  //   quantity.textContent = add;
  //   priceValue = price * add;
  //   totalPrice.textContent = `${priceValue}.00`;
  // });

  // decrement.addEventListener("click", () => {
  //   if (countValue <= 1) {
  //     quantity.textContent = 1;
  //   } else {
  //     countValue--;
  //     quantity.textContent = countValue;
  //   }
  //   console.log("count", countValue);
  //   console.log("\n price", priceValue);
  //   priceValue = price * countValue;
  //   totalPrice.textContent = `${priceValue}.00`;
  // });

  const increment = document.querySelectorAll(".btn-increment");
  const decrement = document.querySelectorAll(".btn-decrement");
  // let totalPrice = parseFloat(document.querySelector(".price").textContent).toFixed(2);
  for (let i = 0; i < increment.length; i++) {
    let button = increment[i];
    button.addEventListener("click", (e) => {
      let buttonClick = e.target;
      let quantity = buttonClick.parentElement.parentElement.children[1]; // quay về cha sau đó vào lại quantity
      let countValue = parseInt(quantity.textContent);
      const price =
        buttonClick.parentElement.parentElement.parentElement.parentElement.parentElement.children[1].children[0]
          .children[0];
      const priceValue = parseFloat(price.textContent);
      let newPriceValue = priceValue;
      console.log(priceValue);
      console.log(newPriceValue);
      console.log(countValue);
      ++countValue;
      quantity.textContent = countValue;
      newPriceValue = parseFloat((priceValue * countValue) / (countValue - 1)).toFixed(2);
      price.textContent = `${newPriceValue}`;
      let totalPrice =
        buttonClick.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement
          .parentElement.children[1].children[0].children[1].children[0].children[1].children[0];
      let totalPriceValue = parseFloat(totalPrice.textContent);
      console.log(totalPriceValue);
      // totalPriceValue =
    });
  }

  for (let i = 0; i < decrement.length; i++) {
    let button = decrement[i];
    button.addEventListener("click", (e) => {
      let buttonClick = e.target;
      let quantity = buttonClick.parentElement.parentElement.children[1]; // quay về cha sau đó vào lại quantity
      // console.log(quantity);
      let countValue = parseInt(quantity.textContent);
      let price =
        buttonClick.parentElement.parentElement.parentElement.parentElement.parentElement.children[1].children[0]
          .children[0];
      let priceValue = parseFloat(price.textContent);
      let newPriceValue = priceValue;

      if (countValue <= 1) {
        quantity.textContent = 1;
        newPriceValue = parseFloat((priceValue / (countValue + 1)) * countValue).toFixed(2);
        if (!priceValue.toString().match(".00")) price.textContent = `${priceValue}`;
        price.textContent = `${priceValue}.00`;
      } else {
        --countValue;
        quantity.textContent = countValue;
        newPriceValue = parseFloat((priceValue / (countValue + 1)) * countValue).toFixed(2);
        price.textContent = `${newPriceValue}`;
      }
    });
  }
});

// Call API product
window.addEventListener("load", function () {
  const endpoint = "http://localhost:3456/products";
  const productList = document.querySelector(".product-list");
  console.log(productList);

  function renderItem(item) {
    const template = `<div class="col">
    <article class="product-card">
      <div class="product-card__img-wrap">
        <a href="./product-detail.html">
          <img src="${item.img}" alt="" class="product-card__thumb" />
        </a>
        ${
          item.like == 1
            ? `<button class="like-btn like-btn--liked product-card__like-btn">
          <img src="./assets/icons/heart.svg" alt="" class="like-btn__icon icon" />
          <img src="./assets/icons/heart-red.svg" alt="" class="like-btn__icon--liked" />
        </button>`
            : `<button class="like-btn product-card__like-btn">
        <img src="./assets/icons/heart.svg" alt="" class="like-btn__icon icon" />
        <img src="./assets/icons/heart-red.svg" alt="" class="like-btn__icon--liked" />
      </button>`
        }
      </div>
      <h3 class="product-card__title">
        <a href="./product-detail.html">${item.title}</a>
      </h3>
      <p class="product-card__brand">${item.brand}</p>
      <div class="product-card__row">
        <span class="product-card__price">${item.price}</span>
        <img src="./assets/icons/star.svg" alt="" class="product-card__star" />
        <span class="product-card__score">${item.rating}</span>
      </div>
    </article>
  </div>`;
    productList.insertAdjacentHTML("beforeend", template);
  }

  async function getProducts(link = endpoint) {
    const response = await fetch(link);
    console.log(response);
    const data = await response.json();
    // reset xong render lại để tránh nó lắp những cái đã có sẵn trước đó
    productList.innerHTML = "";
    console.log(data);
    if (data.length > 0 && Array.isArray(data)) {
      data.forEach((item) => renderItem(item));
    }
  }
  getProducts();

  // Filter
  const filterBrand = document.querySelector(".filter__form-input");
  function debounceFn(func, wait, immediate) {
    let timeout;
    return function () {
      let context = this,
        args = arguments;
      let later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      let callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

  filterBrand.addEventListener(
    "keydown",
    debounceFn(function (e) {
      let path = endpoint;
      if (e.target.value !== "") {
        path = `${endpoint}?title_like=${e.target.value}`;
      }
      // getCourses(path);
      getProducts(path);

      // console.log(e.key;
      // console.log(e.target.value);
      // const response = await fetch(`${endpoint}?title_like=${e.target.value}`);
      // const data = await response.json();
      // console.log(data);
    }, 500)
  );
});
