const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

let products = [];
let cart = JSON.parse(localStorage.getItem("stepluxe_cart") || "[]");
let currentProduct = null;
let currentImages = [];

const DELIVERY = 680;

$("#year").textContent = new Date().getFullYear();

$("#contactBtn").href = "https://instagram.com/";

const money = n =>
  new Intl.NumberFormat("sr-RS").format(Number(n) || 0) + " RSD";

const esc = s =>
  String(s ?? "").replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[m]));

function productPrice(product) {
  return Number(product.price) + DELIVERY;
}

/* =========================
   KORPA
========================= */

function saveCart() {
  localStorage.setItem("stepluxe_cart", JSON.stringify(cart));
  renderCart();
}

function cartCount() {
  return cart.reduce((a, x) => a + x.qty, 0);
}

function renderCart() {
  $("#cartCount").textContent = cartCount();

  const total = cart.reduce(
    (a, x) => a + Number(x.price) * x.qty,
    0
  );

  $("#cartTotal").textContent = money(total);

  $("#cartItems").innerHTML = cart.length
    ? cart.map((x, i) => `
        <div class="cart-row">
          <img src="${x.image || "logo.png"}">

          <div>
            <b>${esc(x.name)}</b>
            <div class="muted">
              Veličina ${esc(x.size)}
            </div>
            <div class="price">
              ${money(x.price)}
            </div>
          </div>

          <div class="qty">
            <button onclick="changeQty(${i},-1)">−</button>
            <span>${x.qty}</span>
            <button onclick="changeQty(${i},1)">+</button>
          </div>
        </div>
      `).join("")
    : `<p class="muted">Korpa je prazna.</p>`;
}

window.changeQty = (i, d) => {
  if (!cart[i]) return;

  cart[i].qty += d;

  if (cart[i].qty <= 0) {
    cart.splice(i, 1);
  }

  saveCart();
};

/* =========================
   PROIZVODI
========================= */

async function loadProducts() {
  try {
    const r = await fetch("/api/products");

    products = r.ok ? await r.json() : [];
  } catch {
    products = [];
  }

  buildSizeFilter();
  renderProducts();
}

function buildSizeFilter() {
  const sizes = [
    ...new Set(
      products.flatMap(p => p.sizes || [])
    )
  ].sort((a, b) => Number(a) - Number(b));

  $("#sizeFilter").innerHTML =
    '<option value="">Sve veličine</option>' +
    sizes.map(s =>
      `<option value="${esc(s)}">${esc(s)}</option>`
    ).join("");
}

function renderProducts() {
  const q = $("#searchInput").value.toLowerCase();
  const size = $("#sizeFilter").value;

  const list = products.filter(p =>
    (
      p.name +
      " " +
      (p.description || "")
    ).toLowerCase().includes(q) &&
    (
      !size ||
      (p.sizes || []).includes(size)
    )
  );

  $("#productsGrid").innerHTML = list.length
    ? list.map(p => `
        <article
          class="product-card"
          onclick="openProduct('${esc(p.id)}')"
        >

          <div class="product-image">
            <img
              src="${p.image || "logo.png"}"
              alt="${esc(p.name)}"
              loading="lazy"
            >
          </div>

          <div class="product-info">

            <h3>${esc(p.name)}</h3>

            <div class="muted">
              ${(p.sizes || []).join(" · ") ||
              "Veličine po dogovoru"}
            </div>

            <div class="price">
              ${money(productPrice(p))}
            </div>

            <div class="ship">
              ✓ Dostava 680 RSD uključena
            </div>

          </div>

        </article>
      `).join("")
    : `
        <div class="loading">
          Trenutno nema modela koji odgovaraju pretrazi.
        </div>
      `;
}

/* =========================
   OTVARANJE PROIZVODA
========================= */

window.openProduct = id => {
  currentProduct = products.find(
    p => String(p.id) === String(id)
  );

  if (!currentProduct) return;

  currentImages =
    currentProduct.images?.length
      ? currentProduct.images
      : [currentProduct.image || "logo.png"];

  const price = productPrice(currentProduct);

  $("#productModalBody").innerHTML = `

    <div class="product-detail">

      <!-- VELIKA SLIKA -->
      <div class="pd-image">

        <img
          id="mainProductImage"
          src="${currentImages[0]}"
          alt="${esc(currentProduct.name)}"
          style="
            width:100%;
            height:100%;
            object-fit:contain;
            display:block;
          "
        >

      </div>


      <!-- INFORMACIJE -->
      <div class="pd-copy">

        <div class="eyebrow">
          STEPLUXE
        </div>

        <h2>
          ${esc(currentProduct.name)}
        </h2>

        <p class="muted">
          ${esc(
            currentProduct.description ||
            "Premium model iz StepLuxe kolekcije."
          )}
        </p>

        <div class="price">
          ${money(price)}
        </div>

        <div class="ship">
          Dostava 680 RSD uračunata u cenu.
        </div>


        <!-- JEDINI RED MALIH SLIKA -->
        ${
          currentImages.length > 1
            ? `
              <div
                class="product-thumbs"
                style="
                  display:flex;
                  flex-wrap:nowrap;
                  gap:10px;
                  width:100%;
                  overflow-x:auto;
                  overflow-y:hidden;
                  padding:12px 0;
                  margin:10px 0 20px 0;
                  box-sizing:border-box;
                "
              >

                ${currentImages.map((img, i) => `
                  <button
                    type="button"
                    class="product-thumb ${i === 0 ? "selected" : ""}"
                    onclick="changeProductImage(${i}, this)"
                    style="
                      flex:0 0 92px;
                      width:92px;
                      height:92px;
                      min-width:92px;
                      padding:5px;
                      border-radius:14px;
                      overflow:hidden;
                      cursor:pointer;
                      box-sizing:border-box;
                    "
                  >

                    <img
                      src="${img}"
                      alt="Slika ${i + 1}"
                      style="
                        width:100%;
                        height:100%;
                        object-fit:contain;
                        display:block;
                      "
                    >

                  </button>
                `).join("")}

              </div>
            `
            : ""
        }


        <h4>
          Izaberi veličinu
        </h4>

        <div class="sizes">

          ${(currentProduct.sizes || []).map(s => `
            <button
              class="size"
              data-size="${esc(s)}"
            >
              ${esc(s)}
            </button>
          `).join("")}

        </div>


        <button
          class="btn primary full"
          id="addToCart"
        >
          Dodaj u korpu
        </button>

        <p class="tiny">
          Moguća je zamena veličine uz prethodni dogovor.
        </p>

      </div>

    </div>
  `;


  /* VELIČINE */

  $$(".size").forEach(button => {

    button.onclick = () => {

      $$(".size").forEach(x =>
        x.classList.remove("selected")
      );

      button.classList.add("selected");

    };

  });


  /* DODAVANJE U KORPU */

  $("#addToCart").onclick = () => {

    const selected =
      $(".size.selected");

    const size =
      selected?.dataset.size;

    if (!size) {
      alert("Izaberi veličinu.");
      return;
    }

    const price =
      productPrice(currentProduct);

    const old = cart.find(
      x =>
        String(x.id) === String(currentProduct.id) &&
        String(x.size) === String(size)
    );

    if (old) {

      old.qty++;

    } else {

      cart.push({
        id: currentProduct.id,
        name: currentProduct.name,
        size: size,
        price: price,
        image: currentImages[0],
        qty: 1
      });

    }

    saveCart();

    closeModal($("#productModal"));

    openCart();
  };


  openModal($("#productModal"));
};


/* =========================
   PROMENA GLAVNE SLIKE
========================= */

window.changeProductImage = (index, element) => {

  const image =
    currentImages[index];

  if (!image) return;

  const main =
    $("#mainProductImage");

  if (main) {
    main.src = image;
  }

  $$(".product-thumb").forEach(
    x => x.classList.remove("selected")
  );

  if (element) {
    element.classList.add("selected");
  }

};


/* =========================
   MODALI
========================= */

function openModal(modal) {
  modal?.classList.add("open");
}

function closeModal(modal) {
  modal?.classList.remove("open");
}

$$("[data-close]").forEach(button => {

  button.onclick = () => {
    closeModal(
      button.closest(".modal")
    );
  };

});


/* =========================
   KORPA OTVARANJE
========================= */

$("#cartOpen").onclick = openCart;

$("#cartClose").onclick = closeCart;

$("#backdrop").onclick = closeCart;

function openCart() {

  $("#cart").classList.add("open");

  $("#backdrop").classList.add("open");

  renderCart();
}

function closeCart() {

  $("#cart").classList.remove("open");

  $("#backdrop").classList.remove("open");
}


/* =========================
   PRETRAGA
========================= */

$("#searchInput").oninput =
  renderProducts;

$("#sizeFilter").onchange =
  renderProducts;


/* =========================
   CHECKOUT
========================= */

$("#checkoutBtn").onclick = () => {

  if (!cart.length) {
    alert("Korpa je prazna.");
    return;
  }

  closeCart();

  openModal(
    $("#checkoutModal")
  );

};


$("#checkoutForm").onsubmit =
  async e => {

    e.preventDefault();

    const fd =
      new FormData(e.target);

    const total =
      cart.reduce(
        (a, x) =>
          a +
          Number(x.price) *
          x.qty,
        0
      );

    const payload = {

      customer_name:
        fd.get("name"),

      phone:
        fd.get("phone"),

      city:
        fd.get("city"),

      address:
        fd.get("address"),

      note:
        fd.get("note"),

      items:
        cart,

      total:
        total
    };


    try {

      const r =
        await fetch(
          "/api/orders",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body:
              JSON.stringify(payload)
          }
        );


      const data =
        await r
          .json()
          .catch(() => ({}));


      $("#checkoutMsg").textContent =
        r.ok
          ? "Porudžbina je poslata! Javićemo ti se za potvrdu."
          : (
              data.error ||
              "Došlo je do greške."
            );


      if (r.ok) {

        cart = [];

        saveCart();

        e.target.reset();

      }

    } catch {

      $("#checkoutMsg").textContent =
        "Došlo je do greške.";

    }

  };


/* =========================
   API
========================= */

async function api(
  path,
  options = {}
) {

  const r =
    await fetch(
      path,
      {
        headers: {
          "Content-Type":
            "application/json",
          ...(options.headers || {})
        },
        ...options
      }
    );


  const data =
    await r
      .json()
      .catch(() => ({}));


  if (!r.ok) {

    throw new Error(
      data.error ||
      "Greška"
    );

  }

  return data;
}


/* =========================
   ADMIN LOGIN
========================= */

function adminLogin() {

  $("#adminMount").innerHTML = `

    <div class="eyebrow">
      STEPLUXE ADMIN
    </div>

    <h2>
      Admin panel
    </h2>

    <p class="muted">
      Unesi admin lozinku.
    </p>

    <form id="loginForm">

      <input
        type="password"
        name="password"
        placeholder="Lozinka"
        required
      >

      <button class="btn primary">
        Prijava
      </button>

      <p
        id="loginMsg"
        class="form-msg"
      ></p>

    </form>
  `;


  $("#loginForm").onsubmit =
    async e => {

      e.preventDefault();

      try {

        await api(
          "/api/login",
          {
            method: "POST",
            body: JSON.stringify({
              password:
                new FormData(e.target)
                  .get("password")
            })
          }
        );

        adminPanel();

      } catch (err) {

        $("#loginMsg").textContent =
          err.message;

      }

    };

}


/* =========================
   ADMIN OTVARANJE
========================= */

async function openAdmin() {

  openModal(
    $("#adminModal")
  );

  try {

    const me =
      await api("/api/me");

    if (me.authenticated) {

      adminPanel();

    } else {

      adminLogin();

    }

  } catch {

    adminLogin();

  }

}


/* =========================
   ADMIN PANEL
========================= */

async function adminPanel() {

  $("#adminMount").innerHTML = `

    <div class="eyebrow">
      STEPLUXE ADMIN
    </div>

    <div
      style="
        display:flex;
        justify-content:space-between;
        gap:15px;
        align-items:center;
      "
    >

      <h2>
        Kontrolni panel
      </h2>

      <button
        class="btn ghost"
        id="logout"
      >
        Odjava
      </button>

    </div>

    <div class="tabs">

      <button
        class="tab active"
        data-tab="products"
      >
        Proizvodi
      </button>

      <button
        class="tab"
        data-tab="orders"
      >
        Porudžbine
      </button>

    </div>

    <div id="adminContent"></div>
  `;


  $("#logout").onclick =
    async () => {

      await api(
        "/api/logout",
        {
          method: "POST"
        }
      );

      adminLogin();

    };


  $$(".tab").forEach(tab => {

    tab.onclick = () => {

      $$(".tab").forEach(x =>
        x.classList.remove("active")
      );

      tab.classList.add("active");

      if (
        tab.dataset.tab ===
        "products"
      ) {

        adminProducts();

      } else {

        adminOrders();

      }

    };

  });


  adminProducts();

}


/* =========================
   KOMPRESIJA SLIKA
========================= */

function compressImage(file) {

  return new Promise(
    (resolve, reject) => {

      const img =
        new Image();

      const reader =
        new FileReader();


      reader.onload = () => {

        img.onload = () => {

          const max = 700;

          const scale =
            Math.min(
              1,
              max /
              Math.max(
                img.width,
                img.height
              )
            );


          const canvas =
            document.createElement(
              "canvas"
            );


          canvas.width =
            Math.round(
              img.width *
              scale
            );

          canvas.height =
            Math.round(
              img.height *
              scale
            );


          const ctx =
            canvas.getContext(
              "2d"
            );


          ctx.drawImage(
            img,
            0,
            0,
            canvas.width,
            canvas.height
          );


          resolve(
            canvas.toDataURL(
              "image/jpeg",
              0.65
            )
          );

        };


        img.onerror = () =>
          reject(
            new Error(
              "Slika nije mogla da se obradi."
            )
          );


        img.src =
          reader.result;

      };


      reader.onerror = () =>
        reject(
          new Error(
            "Slika nije mogla da se učita."
          )
        );


      reader.readAsDataURL(file);

    }
  );

}


/* =========================
   ADMIN PROIZVODI
========================= */

async function adminProducts() {

  let list = [];

  try {

    list =
      await api(
        "/api/admin-products"
      );

  } catch (err) {

    $("#adminContent").textContent =
      err.message;

    return;

  }


  $("#adminContent").innerHTML = `

    <div class="admin-grid">

      <div>

        <h3>
          Dodaj proizvod
        </h3>

        <form id="productForm">

          <input
            name="name"
            placeholder="Naziv modela"
            required
          >

          <input
            name="price"
            type="number"
            min="0"
            placeholder="Osnovna cena u RSD"
            required
          >

          <input
            name="sizes"
            placeholder="Veličine, npr. 40,41,42,43"
            required
          >

          <textarea
            name="description"
            placeholder="Opis"
          ></textarea>

          <input
            name="images"
            type="file"
            accept="image/*"
            multiple
            required
          >

          <button
            class="btn primary"
          >
            Dodaj proizvod
          </button>

          <p
            id="productMsg"
            class="form-msg"
          ></p>

        </form>

      </div>


      <div>

        <h3>
          Proizvodi (${list.length})
        </h3>

        <div class="admin-list">

          ${list.map(p => `

            <div class="admin-item">

              <img
                src="${p.image || "logo.png"}"
              >

              <div class="admin-item-main">

                <b>
                  ${esc(p.name)}
                </b>

                <div class="muted">
                  ${money(productPrice(p))}
                  ·
                  ${(p.sizes || []).join(", ")}
                </div>

              </div>


              <div class="admin-actions">

                <button
                  class="btn ghost"
                  onclick="
                    toggleProduct(
                      '${esc(p.id)}',
                      ${!p.active}
                    )
                  "
                >
                  ${p.active
                    ? "Sakrij"
                    : "Prikaži"}
                </button>


                <button
                  class="btn danger"
                  onclick="
                    deleteProduct(
                      '${esc(p.id)}'
                    )
                  "
                >
                  Obriši
                </button>

              </div>

            </div>

          `).join("")}

        </div>

      </div>

    </div>
  `;


  $("#productForm").onsubmit =
    addProduct;

}


/* =========================
   DODAVANJE PROIZVODA
========================= */

async function addProduct(e) {

  e.preventDefault();

  const fd =
    new FormData(e.target);

  const msg =
    $("#productMsg");

  msg.textContent =
    "Dodavanje…";


  try {

    const files =
      [...fd.getAll("images")];

    const images =
      await Promise.all(
        files.map(
          file =>
            compressImage(file)
        )
      );


    await api(
      "/api/products",
      {
        method: "POST",

        body:
          JSON.stringify({

            name:
              fd.get("name"),

            price:
              Number(
                fd.get("price")
              ),

            sizes:
              fd
                .get("sizes")
                .split(",")
                .map(
                  x => x.trim()
                )
                .filter(Boolean),

            description:
              fd.get(
                "description"
              ),

            images:
              images,

            image:
              images[0] || ""

          })

      }
    );


    msg.textContent =
      "Proizvod dodat!";


    e.target.reset();

    await loadProducts();

    adminProducts();

  } catch (err) {

    msg.textContent =
      err.message;

  }

}


/* =========================
   ADMIN PROIZVOD STATUS
========================= */

window.toggleProduct =
  async (id, active) => {

    try {

      await api(
        "/api/products",
        {
          method: "PUT",

          body:
            JSON.stringify({
              id,
              active
            })
        }
      );


      await loadProducts();

      adminProducts();

    } catch (e) {

      alert(
        e.message
      );

    }

  };


/* =========================
   BRISANJE PROIZVODA
========================= */

window.deleteProduct =
  async id => {

    if (
      !confirm(
        "Obrisati proizvod?"
      )
    ) {
      return;
    }


    try {

      await api(
        "/api/products?id=" +
        encodeURIComponent(id),
        {
          method: "DELETE"
        }
      );


      await loadProducts();

      adminProducts();

    } catch (e) {

      alert(
        e.message
      );

    }

  };


/* =========================
   ADMIN PORUDŽBINE
========================= */

async function adminOrders() {

  let data = [];

  try {

    data =
      await api(
        "/api/orders"
      );

  } catch (err) {

    $("#adminContent").textContent =
      err.message;

    return;

  }


  $("#adminContent").innerHTML = `

    <h3>
      Porudžbine (${data.length})
    </h3>

    ${
      data.map(o => `

        <div class="order">

          <div class="order-head">

            <b>
              #${o.id.slice(0, 8)}
            </b>

            <span class="status">
              ${esc(o.status)}
            </span>

          </div>


          <p>

            <b>
              ${esc(o.customer_name)}
            </b>

            ·
            ${esc(o.phone)}

            <br>

            ${esc(o.city)},
            ${esc(o.address)}

          </p>


          <div class="muted">

            ${(o.items || [])
              .map(
                x =>
                  `${esc(x.name)} — ${esc(x.size)} × ${x.qty}`
              )
              .join("<br>")}

          </div>


          <div
            style="
              margin-top:10px;
              display:flex;
              gap:8px;
              align-items:center;
            "
          >

            <b>
              ${money(o.total)}
            </b>


            <select
              onchange="
                setOrderStatus(
                  '${esc(o.id)}',
                  this.value
                )
              "
            >

              <option
                ${o.status === "new"
                  ? "selected"
                  : ""}
              >
                new
              </option>

              <option
                ${o.status === "confirmed"
                  ? "selected"
                  : ""}
              >
                confirmed
              </option>

              <option
                ${o.status === "sent"
                  ? "selected"
                  : ""}
              >
                sent
              </option>

              <option
                ${o.status === "completed"
                  ? "selected"
                  : ""}
              >
                completed
              </option>

              <option
                ${o.status === "cancelled"
                  ? "selected"
                  : ""}
              >
                cancelled
              </option>

            </select>

          </div>

        </div>

      `).join("")
      ||
      `
        <p class="muted">
          Nema porudžbina.
        </p>
      `
    }

  `;

}


/* =========================
   STATUS PORUDŽBINE
========================= */

window.setOrderStatus =
  async (id, status) => {

    try {

      await api(
        "/api/orders",
        {
          method: "PUT",

          body:
            JSON.stringify({
              id,
              status
            })
        }
      );

      adminOrders();

    } catch (e) {

      alert(
        e.message
      );

    }

  };


/* =========================
   ADMIN HASH
========================= */

window.addEventListener(
  "hashchange",
  () => {

    if (
      location.hash === "#admin"
    ) {

      openAdmin();

    }

  }
);


/* =========================
   START
========================= */

loadProducts();

renderCart();

if (
  location.hash === "#admin"
) {
  openAdmin();
}
