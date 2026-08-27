const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let products=[], cart=JSON.parse(localStorage.getItem("stepluxe_cart")||"[]"), currentProduct=null;
$("#year").textContent=new Date().getFullYear(); $("#contactBtn").href="https://instagram.com/";
const money=n=>new Intl.NumberFormat("sr-RS").format(n)+" RSD";
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
function saveCart(){localStorage.setItem("stepluxe_cart",JSON.stringify(cart));renderCart()} function cartCount(){return cart.reduce((a,x)=>a+x.qty,0)}
function renderCart(){$("#cartCount").textContent=cartCount();$("#cartTotal").textContent=money(cart.reduce((a,x)=>a+x.price*x.qty,0));$("#cartItems").innerHTML=cart.length?cart.map((x,i)=>`<div class="cart-row"><img src="${x.image||'logo.png'}"><div><b>${esc(x.name)}</b><div class="muted">Veličina ${esc(x.size)}</div><div class="price">${money(x.price)}</div></div><div class="qty"><button onclick="changeQty(${i},-1)">−</button><span>${x.qty}</span><button onclick="changeQty(${i},1)">+</button></div></div>`).join(""):`<p class="muted">Korpa je prazna.</p>`}
window.changeQty=(i,d)=>{cart[i].qty+=d;if(cart[i].qty<=0)cart.splice(i,1);saveCart()};
async function loadProducts(){try{const r=await fetch('/api/products');products=r.ok?await r.json():[]}catch{products=[]}buildSizeFilter();renderProducts()}
function buildSizeFilter(){const sizes=[...new Set(products.flatMap(p=>p.sizes||[]))].sort((a,b)=>Number(a)-Number(b));$("#sizeFilter").innerHTML='<option value="">Sve veličine</option>'+sizes.map(s=>`<option>${esc(s)}</option>`).join("")}
function renderProducts(){const q=$("#searchInput").value.toLowerCase(),size=$("#sizeFilter").value;const list=products.filter(p=>(p.name+" "+(p.description||"")).toLowerCase().includes(q)&&(!size||(p.sizes||[]).includes(size)));$("#productsGrid").innerHTML=list.length?list.map(p=>`<article class="product-card" onclick="openProduct('${p.id}')"><div class="product-image"><img src="${p.image||'logo.png'}" alt="${esc(p.name)}" loading="lazy"></div><div class="product-info"><h3>${esc(p.name)}</h3><div class="muted">${(p.sizes||[]).join(" · ")||"Veličine po dogovoru"}</div><div class="price">${money(p.price)}</div><div class="ship">✓ Dostava 680 RSD uključena</div></div></article>`).join(""):`<div class="loading">Trenutno nema modela koji odgovaraju pretrazi.</div>`}
window.openProduct=id=>{
  currentProduct=products.find(p=>p.id===id);
  if(!currentProduct)return;

  const images=currentProduct.images?.length
    ? currentProduct.images
    : [currentProduct.image||'logo.png'];

  $("#productModalBody").innerHTML=`
    <div class="product-detail">
      <div class="pd-image">
        <img id="mainProductImage" src="${images[0]}" alt="${esc(currentProduct.name)}">
      </div>

      <div class="pd-copy">
        <div class="eyebrow">STEPLUXE</div>
        <h2>${esc(currentProduct.name)}</h2>
        <p class="muted">${esc(currentProduct.description||"Premium model iz StepLuxe kolekcije.")}</p>
        <div class="price">${money(currentProduct.price)}</div>
        <div class="ship">Dostava 680 RSD uračunata u cenu.</div>

        ${images.length>1?`
          <div class="product-thumbs">
            ${images.map((img,i)=>`
              <img class="product-thumb ${i===0?'selected':''}"
                   src="${img}"
                   onclick="changeProductImage('${img}',this)">
            `).join("")}
          </div>
        `:''}

        <h4>Izaberi veličinu</h4>
        <div class="sizes">
          ${(currentProduct.sizes||[]).map(s=>
            `<button class="size" data-size="${esc(s)}">${esc(s)}</button>`
          ).join("")}
        </div>

        <button class="btn primary full" id="addToCart">Dodaj u korpu</button>
        <p class="tiny">Moguća je zamena veličine uz prethodni dogovor.</p>
      </div>
    </div>
  `;

  $$('.size').forEach(b=>b.onclick=()=>{
    $$('.size').forEach(x=>x.classList.remove('selected'));
    b.classList.add('selected');
  });

  $("#addToCart").onclick=()=>{
    const size=$(".size.selected")?.dataset.size;
    if(!size)return alert("Izaberi veličinu.");

    const old=cart.find(x=>x.id===currentProduct.id&&x.size===size);

    if(old)old.qty++;
    else cart.push({
      id:currentProduct.id,
      name:currentProduct.name,
      size,
      price:currentProduct.price,
      image:images[0],
      qty:1
    });

    saveCart();
    closeModal($("#productModal"));
    openCart();
  };

  openModal($("#productModal"));
};

window.changeProductImage=(src,el)=>{
  $("#mainProductImage").src=src;
  $$('.product-thumb').forEach(x=>x.classList.remove('selected'));
  el.classList.add('selected');
};
function openModal(m){m.classList.add("open")} function closeModal(m){m?.classList.remove("open")} $$('[data-close]').forEach(b=>b.onclick=()=>closeModal(b.closest('.modal')));
$("#cartOpen").onclick=openCart;$("#cartClose").onclick=closeCart;$("#backdrop").onclick=closeCart;function openCart(){$("#cart").classList.add("open");$("#backdrop").classList.add("open");renderCart()}function closeCart(){$("#cart").classList.remove("open");$("#backdrop").classList.remove("open")}
$("#searchInput").oninput=renderProducts;$("#sizeFilter").onchange=renderProducts;
$("#checkoutBtn").onclick=()=>{if(!cart.length)return alert("Korpa je prazna.");closeCart();openModal($("#checkoutModal"))};
$("#checkoutForm").onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.target);const total=cart.reduce((a,x)=>a+x.price*x.qty,0)+680;const payload={customer_name:fd.get('name'),phone:fd.get('phone'),city:fd.get('city'),address:fd.get('address'),note:fd.get('note'),items:cart,total};const r=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const data=await r.json().catch(()=>({}));$("#checkoutMsg").textContent=r.ok?'Porudžbina je poslata! Javićemo ti se za potvrdu.':(data.error||'Došlo je do greške.');if(r.ok){cart=[];saveCart();e.target.reset()}};
async function api(path,options={}){const r=await fetch(path,{headers:{'Content-Type':'application/json',...(options.headers||{})},...options});const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||'Greška');return data}
function adminLogin(){$("#adminMount").innerHTML=`<div class="eyebrow">STEPLUXE ADMIN</div><h2>Admin panel</h2><p class="muted">Unesi admin lozinku.</p><form id="loginForm"><input type="password" name="password" placeholder="Lozinka" required><button class="btn primary">Prijava</button><p id="loginMsg" class="form-msg"></p></form>`;$("#loginForm").onsubmit=async e=>{e.preventDefault();try{await api('/api/login',{method:'POST',body:JSON.stringify({password:new FormData(e.target).get('password')})});adminPanel()}catch(err){$("#loginMsg").textContent=err.message}}}
async function openAdmin(){openModal($("#adminModal"));try{const me=await api('/api/me');me.authenticated?adminPanel():adminLogin()}catch{adminLogin()}}
async function adminPanel(){$("#adminMount").innerHTML=`<div class="eyebrow">STEPLUXE ADMIN</div><div style="display:flex;justify-content:space-between;gap:15px;align-items:center"><h2>Kontrolni panel</h2><button class="btn ghost" id="logout">Odjava</button></div><div class="tabs"><button class="tab active" data-tab="products">Proizvodi</button><button class="tab" data-tab="orders">Porudžbine</button></div><div id="adminContent"></div>`;$("#logout").onclick=async()=>{await api('/api/logout',{method:'POST'});adminLogin()};$$('.tab').forEach(t=>t.onclick=()=>{$$('.tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');t.dataset.tab==='products'?adminProducts():adminOrders()});adminProducts()}
function compressImage(file){
  return new Promise((resolve,reject)=>{
    const img=new Image();
    const reader=new FileReader();

    reader.onload=()=>{
      img.onload=()=>{
        const max=700;
        const scale=Math.min(1,max/Math.max(img.width,img.height));

        const c=document.createElement('canvas');
        c.width=Math.round(img.width*scale);
        c.height=Math.round(img.height*scale);

        const ctx=c.getContext('2d');
        ctx.drawImage(img,0,0,c.width,c.height);

        resolve(c.toDataURL('image/jpeg',0.65));
      };

      img.onerror=()=>reject(new Error('Slika nije mogla da se obradi.'));
      img.src=reader.result;
    };

    reader.onerror=()=>reject(new Error('Slika nije mogla da se učita.'));
    reader.readAsDataURL(file);
  });
}
async function adminProducts(){let list=[];try{list=await api('/api/admin-products')}catch(err){$("#adminContent").textContent=err.message;return}$("#adminContent").innerHTML=`<div class="admin-grid"><div><h3>Dodaj proizvod</h3><form id="productForm"><input name="name" placeholder="Naziv modela" required><input name="price" type="number" min="0" placeholder="Cena u RSD (sa dostavom)" required><input name="sizes" placeholder="Veličine, npr. 40,41,42,43" required><textarea name="description" placeholder="Opis"></textarea><input name="images" type="file" accept="image/*" multiple required><button class="btn primary">Dodaj proizvod</button><p id="productMsg" class="form-msg"></p></form></div><div><h3>Proizvodi (${list.length})</h3><div class="admin-list">${list.map(p=>`<div class="admin-item"><img src="${p.image||'logo.png'}"><div class="admin-item-main"><b>${esc(p.name)}</b><div class="muted">${money(p.price)} · ${(p.sizes||[]).join(', ')}</div></div><div class="admin-actions"><button class="btn ghost" onclick="toggleProduct('${p.id}',${!p.active})">${p.active?'Sakrij':'Prikaži'}</button><button class="btn danger" onclick="deleteProduct('${p.id}')">Obriši</button></div></div>`).join('')}</div></div></div>`;$("#productForm").onsubmit=addProduct}
async function addProduct(e){
  e.preventDefault();
  const fd=new FormData(e.target),msg=$("#productMsg");
  msg.textContent='Dodavanje…';

  try{
    const files=[...fd.getAll('images')];
    const images=await Promise.all(files.map(file=>compressImage(file)));

    await api('/api/products',{
      method:'POST',
      body:JSON.stringify({
        name:fd.get('name'),
        price:Number(fd.get('price')),
        sizes:fd.get('sizes').split(',').map(x=>x.trim()).filter(Boolean),
        description:fd.get('description'),
        images:images,
        image:images[0]||''
      })
    });

    msg.textContent='Proizvod dodat!';
    e.target.reset();
    await loadProducts();
    adminProducts();
  }catch(err){
    msg.textContent=err.message;
  }
}
window.toggleProduct=async(id,active)=>{try{await api('/api/products',{method:'PUT',body:JSON.stringify({id,active})});await loadProducts();adminProducts()}catch(e){alert(e.message)}};
window.deleteProduct=async id=>{if(!confirm('Obrisati proizvod?'))return;try{await api('/api/products?id='+encodeURIComponent(id),{method:'DELETE'});await loadProducts();adminProducts()}catch(e){alert(e.message)}};
async function adminOrders(){let data=[];try{data=await api('/api/orders')}catch(err){$("#adminContent").textContent=err.message;return}$("#adminContent").innerHTML=`<h3>Porudžbine (${data.length})</h3>${data.map(o=>`<div class="order"><div class="order-head"><b>#${o.id.slice(0,8)}</b><span class="status">${esc(o.status)}</span></div><p><b>${esc(o.customer_name)}</b> · ${esc(o.phone)}<br>${esc(o.city)}, ${esc(o.address)}</p><div class="muted">${(o.items||[]).map(x=>`${esc(x.name)} — ${esc(x.size)} × ${x.qty}`).join('<br>')}</div><div style="margin-top:10px;display:flex;gap:8px;align-items:center"><b>${money(o.total)}</b><select onchange="setOrderStatus('${o.id}',this.value)"><option ${o.status==='new'?'selected':''}>new</option><option ${o.status==='confirmed'?'selected':''}>confirmed</option><option ${o.status==='sent'?'selected':''}>sent</option><option ${o.status==='completed'?'selected':''}>completed</option><option ${o.status==='cancelled'?'selected':''}>cancelled</option></select></div></div>`).join('')||'<p class="muted">Nema porudžbina.</p>'}`}
window.setOrderStatus=async(id,status)=>{try{await api('/api/orders',{method:'PUT',body:JSON.stringify({id,status})});adminOrders()}catch(e){alert(e.message)}};
window.addEventListener('hashchange',()=>{if(location.hash==='#admin')openAdmin()});loadProducts();renderCart();if(location.hash==='#admin')openAdmin();
