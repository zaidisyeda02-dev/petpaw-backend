
(function(){
"use strict";
/* Guarded storage helpers: never throw, fall back to memory */
var memStore={};
var safeStore={
  get:function(k){ try{ var v=window.sessionStorage.getItem(k); return v===null?(memStore[k]||null):v; }catch(e){ return memStore[k]||null; } },
  set:function(k,v){ memStore[k]=v; try{ window.sessionStorage.setItem(k,v); }catch(e){} },
  remove:function(k){ delete memStore[k]; try{ window.sessionStorage.removeItem(k); }catch(e){} }
};

var LEAF='<svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21c-4 0-7-3.2-7-8 0-5 4-9 12-10-0.3 8-1 12-3 14.5C13.3 18.5 12.7 19 12 21z" fill="#4c9a4c"/><path d="M5 20c1-5 4-9 9-12" stroke="#1d4a2a" stroke-width="1.6" stroke-linecap="round"/></svg>';
var LEAF_LIGHT='<svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21c-4 0-7-3.2-7-8 0-5 4-9 12-10-0.3 8-1 12-3 14.5C13.3 18.5 12.7 19 12 21z" fill="#8fce7a"/><path d="M5 20c1-5 4-9 9-12" stroke="#ede1cb" stroke-width="1.6" stroke-linecap="round"/></svg>';
var ICON_SEARCH='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.8-3.8"/></svg>';
var ICON_BAG='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1.2 12.1a1.5 1.5 0 0 1-1.5 1.4H7.7a1.5 1.5 0 0 1-1.5-1.4L5 8z"/><path d="M8.5 10V6.5a3.5 3.5 0 0 1 7 0V10"/></svg>';
var ICON_MENU='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
var ICON_CHECK='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4c9a4c" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>';
var ICON_LEAF_SM='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21c-4 0-7-3.2-7-8 0-5 4-9 12-10-0.3 8-1 12-3 14.5C13.3 18.5 12.7 19 12 21z" fill="#4c9a4c"/></svg>';

var CATEGORIES={
  "pet-food":{slug:"pet-food",name:"Pet Food",img:"/images/category-pet-food.jpg",alt:"Dog eating from a bowl of food",
    desc:"Everyday food for dogs and cats, from chicken kibble and salmon recipes to puppy and kitten food. Each product lists its weight on its detail page, so you can pick the right bag for your pet.",
    points:["Food for dogs, puppies, cats and kittens","Bag weights listed on every product","Chicken, salmon and lamb recipes"]},
  "pet-accessories":{slug:"pet-accessories",name:"Pet Accessories",img:"/images/category-pet-accessories.jpg",alt:"Cat resting among green leaves",
    desc:"Useful everyday accessories for dogs and cats, including a chew toy, a soft bed, a collar and leash set, a ceramic bowl, a scratching post and a grooming brush set.",
    points:["Accessories for dogs and cats","Beds, bowls, collars, toys and grooming","Clear prices on every product"]}
};

var PRODUCTS=[
 {id:1,slug:"natural-chicken-kibble",name:"Natural Chicken Kibble for Dogs",cat:"pet-food",price:4850,img:"/images/natural-chicken-kibble.jpg",alt:"Bowl of dry chicken kibble for dogs",size:"3 kg",
  desc:"A complete dry kibble for adult dogs with chicken as the main ingredient, in a 3 kg bag for everyday feeding at home.",
  points:["Weight: 3 kg","For adult dogs","Chicken recipe dry kibble","Store in a cool, dry place"]},
 {id:2,slug:"salmon-rice-dog-food",name:"Salmon and Rice Dog Food",cat:"pet-food",price:5400,img:"/images/salmon-rice-dog-food.png",alt:"Bag of salmon dog food",size:"2 kg",
  desc:"A dry dog food made with salmon and rice, packed in a 2 kg bag for adult dogs.",
  points:["Weight: 2 kg","For adult dogs","Salmon and rice recipe","Reseal the bag after opening"]},
 {id:3,slug:"kitten-chicken-tuna",name:"Kitten Chicken and Tuna Food",cat:"pet-food",price:3200,img:"/images/kitten-chicken-tuna.jpg",alt:"Kitten eating dry food from a bowl",size:"1.5 kg",
  desc:"A dry food for kittens made with chicken and tuna, in a 1.5 kg bag sized for young cats.",
  points:["Weight: 1.5 kg","For kittens","Chicken and tuna recipe","Small kibble pieces for kittens"]},
 {id:4,slug:"adult-cat-salmon-kibble",name:"Adult Cat Salmon Kibble",cat:"pet-food",price:3850,img:"/images/adult-cat-salmon-kibble.jpg",alt:"Cat eating kibble from a bowl",size:"2 kg",
  desc:"A salmon kibble for adult cats, in a 2 kg bag for daily feeding.",
  points:["Weight: 2 kg","For adult cats","Salmon recipe dry kibble","Store in a cool, dry place"]},
 {id:5,slug:"puppy-growth-formula",name:"Puppy Growth Formula",cat:"pet-food",price:4200,img:"/images/puppy-growth-formula.jpg",alt:"Puppy eating food from a bowl",size:"3 kg",
  desc:"A dry food made for growing puppies, in a 3 kg bag for the first year of feeding.",
  points:["Weight: 3 kg","For puppies","Dry food for growing dogs","Follow the feeding guide on the bag"]},
 {id:6,slug:"grain-free-lamb-dog-food",name:"Grain Free Lamb Dog Food",cat:"pet-food",price:5900,img:"/images/grain-free-lamb-dog-food.jpg",alt:"Bag of lamb dog food",size:"2.5 kg",
  desc:"A grain free dry dog food made with lamb, in a 2.5 kg bag for adult dogs.",
  points:["Weight: 2.5 kg","For adult dogs","Grain free lamb recipe","Reseal the bag after opening"]},
 {id:7,slug:"wooden-chew-bone",name:"Wooden Chew Bone Toy",cat:"pet-accessories",price:850,img:"/images/wooden-chew-bone-toy.jpg",alt:"Puppy chewing a wooden bone toy",size:"",
  desc:"A wooden chew toy in a bone shape, made for dogs that like to chew during play.",
  points:["Wooden bone shape","For chewing and play","Supervise your dog during play","Replace if pieces break off"]},
 {id:8,slug:"soft-pet-bed",name:"Soft Pet Bed, Leaf Green",cat:"pet-accessories",price:4500,img:"/images/soft-pet-bed.jpg",alt:"Soft leaf green round pet bed",size:"",
  desc:"A soft round pet bed in leaf green, with a cushioned middle for dogs and cats to rest on.",
  points:["Colour: Leaf Green","Soft cushioned middle","For dogs and cats","Fits a corner or crate space"]},
 {id:9,slug:"collar-leash-set",name:"Adjustable Dog Collar and Leash Set",cat:"pet-accessories",price:1650,img:"/images/adjustable-dog-collar-leash-set.jpg",alt:"Dog collar and matching leash set",size:"",
  desc:"A matching collar and leash set for dogs. The collar adjusts to fit, and the leash clips on for daily walks.",
  points:["Collar and leash included","Adjustable collar fit","Metal clip on the leash","For daily walks"]},
 {id:10,slug:"ceramic-pet-bowl",name:"Ceramic Pet Food Bowl",cat:"pet-accessories",price:1250,img:"/images/ceramic-pet-food-bowl.jpg",alt:"Ceramic pet food bowl",size:"",
  desc:"A ceramic bowl for pet food or water, with a solid weight that stays in place at feeding time.",
  points:["Ceramic bowl","For food or water","Easy to wash by hand","For dogs and cats"]},
 {id:11,slug:"cat-scratching-post",name:"Cat Scratching Post",cat:"pet-accessories",price:3400,img:"/images/cat-scratching-post.jpg",alt:"Cat using a tall scratching post",size:"",
  desc:"A tall scratching post for cats, wrapped for scratching, with a soft base and a hanging ball toy.",
  points:["Tall post for scratching","Soft square base","Hanging ball toy included","For indoor cats and kittens"]},
 {id:12,slug:"grooming-brush-set",name:"Pet Grooming Brush Set",cat:"pet-accessories",price:1450,img:"/images/pet-grooming-brush-set.jpg",alt:"Dog being groomed with a brush",size:"",
  desc:"A grooming brush set for regular brushing at home, for dogs and cats with short or long coats.",
  points:["Brush set for home grooming","For dogs and cats","For short and long coats","Brush gently in the direction of the coat"]}
];

var ASSET_BASE=(function(){ var p=window.location.pathname||"/"; return p.substring(0,p.lastIndexOf("/")+1); })();
function abs(u){ return u.indexOf("assets/")===0?ASSET_BASE+u:u; }
function fmt(n){ return "PKR "+n.toLocaleString("en-US"); }
function byId(id){ for(var i=0;i<PRODUCTS.length;i++){ if(PRODUCTS[i].id===id) return PRODUCTS[i]; } return null; }
function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

/* Cart state */
var cart=[];
try{ var saved=safeStore.get("petpaw_cart"); if(saved){ var parsed=JSON.parse(saved); if(parsed&&parsed.length) cart=parsed; } }catch(e){ cart=[]; }
var lastOrder=null;

function saveCart(){ try{ safeStore.set("petpaw_cart",JSON.stringify(cart)); }catch(e){} }
function cartCount(){ var c=0; cart.forEach(function(l){ c+=l.qty; }); return c; }
function cartSubtotal(){ var s=0; cart.forEach(function(l){ var p=byId(l.id); if(p) s+=p.price*l.qty; }); return s; }


/* Products load from the API when it is available, so the shop always
   shows the prices stored in the database. The inline list below stays
   as a fallback if the API cannot be reached. */
function loadProducts(){
  return fetch("/api/products").then(function(r){ return r.json(); }).then(function(list){
    if(!Array.isArray(list)||!list.length) return;
    list.forEach(function(api){
      for(var i=0;i<PRODUCTS.length;i++){
        if(PRODUCTS[i].slug===api.id){
          PRODUCTS[i].name=api.name; PRODUCTS[i].price=api.price;
          PRODUCTS[i].size=api.weight||""; PRODUCTS[i].desc=api.description;
          PRODUCTS[i].points=api.details||PRODUCTS[i].points;
          PRODUCTS[i].img=api.img||PRODUCTS[i].img;
        }
      }
    });
  }).catch(function(){});
}

var app=document.getElementById("app");
var toastTimer=null;
function toast(msg){
  var t=document.getElementById("toast"); t.textContent=msg; t.classList.add("show");
  clearTimeout(toastTimer); toastTimer=setTimeout(function(){ t.classList.remove("show"); },2600);
}
function updateBag(bounce){
  var btn=document.getElementById("bagBtn");
  var badge=btn.querySelector(".bag-count");
  var c=cartCount();
  if(!badge){ badge=document.createElement("span"); badge.className="bag-count"; btn.appendChild(badge); }
  badge.textContent=c; badge.style.display=c>0?"flex":"none";
  if(bounce&&c>0){ badge.classList.remove("bounce"); void badge.offsetWidth; badge.classList.add("bounce"); }
}
function addToCart(id,qty){
  qty=qty||1;
  var found=null;
  cart.forEach(function(l){ if(l.id===id) found=l; });
  if(found) found.qty+=qty; else cart.push({id:id,qty:qty});
  saveCart(); updateBag(true);
  var p=byId(id); toast("Added to bag: "+(p?p.name:"Item"));
}

/* Routing */
var currentPath="/";
function parseRoute(){
  var p=window.location.pathname||"/";
  if(ASSET_BASE!=="/"&&p.indexOf(ASSET_BASE)===0) p="/"+p.slice(ASSET_BASE.length);
  else if(ASSET_BASE==="/"&&p.indexOf("/")===0) p=p;
  if(p===""||p==="/index.html") p="/";
  return p;
}
function navigate(path){
  if(path===currentPath){ render(); window.scrollTo(0,0); return; }
  currentPath=path;
  try{ window.history.pushState({path:path},"",ASSET_BASE+path.replace(/^\//,"")); }catch(e){}
  render(); window.scrollTo(0,0);
}
window.addEventListener("popstate",function(){
  currentPath=parseRoute();
  render();
});
document.addEventListener("click",function(ev){
  var a=ev.target.closest("[data-nav]");
  if(a){ ev.preventDefault(); closeMenu(); hideSearch(); navigate(a.getAttribute("data-nav")); }
});

function cardHTML(p,i){
  var cat=CATEGORIES[p.cat];
  return '<article class="card" style="animation-delay:'+((i%8)*0.07)+'s">'
    +'<a href="/product/'+p.id+'" data-nav="/product/'+p.id+'" aria-label="View details of '+esc(p.name)+'"><img src="'+p.img+'" alt="'+esc(p.alt)+'"></a>'
    +'<div class="card-body"><span class="cat-tag">'+cat.name+'</span>'
    +'<h3>'+esc(p.name)+(p.size?' <span style="color:var(--muted);font-weight:700">('+p.size+')</span>':"")+'</h3>'
    +'<div class="price">'+fmt(p.price)+'</div>'
    +'<div class="card-actions"><button class="btn small" type="button" data-add="'+p.id+'">Add to Cart</button>'
    +'<a class="btn small ghost" href="/product/'+p.id+'" data-nav="/product/'+p.id+'">View Details</a></div>'
    +'</div></article>';
}
function gridHTML(list){ return '<div class="grid">'+list.map(cardHTML).join("")+'</div>'; }

function newsletterHTML(){
  return '<section class="block" style="padding-top:0"><div class="wrap"><div class="newsletter anim">'
   +'<div><h2>Pet news, once in a while</h2><p>Join the PetPaw newsletter for new products and simple pet care notes. No spam, just useful updates.</p></div>'
   +'<div><form id="newsForm" novalidate><input type="email" id="newsEmail" placeholder="Your email address" aria-label="Email address for newsletter"><button class="btn leaf" type="submit">Sign Up</button></form>'
   +'<div class="err" id="newsErr" style="color:#ffb3a7"></div><div class="ok" id="newsOk">Thank you, you are signed up for the PetPaw newsletter.</div></div>'
   +'</div></div></section>';
}
function bindNewsletter(){
  var f=document.getElementById("newsForm"); if(!f) return;
  f.addEventListener("submit",function(ev){
    ev.preventDefault();
    var em=document.getElementById("newsEmail").value.trim();
    var err=document.getElementById("newsErr"), ok=document.getElementById("newsOk");
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){ err.textContent="Please enter a valid email address."; err.classList.add("show"); ok.classList.remove("show"); return; }
    fetch("/api/newsletter",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:em})})
      .then(function(r){ return r.json().then(function(b){ if(!r.ok) throw new Error(b.error||"Signup failed"); return b; }); })
      .then(function(){ err.classList.remove("show"); ok.classList.add("show"); f.reset(); toast("Newsletter signup confirmed"); })
      .catch(function(e2){ err.textContent=e2.message||"Could not sign up. Please try again."; err.classList.add("show"); ok.classList.remove("show"); });
  });
}
function bindCards(){
  app.querySelectorAll("[data-add]").forEach(function(b){
    b.addEventListener("click",function(){ addToCart(parseInt(b.getAttribute("data-add"),10),1); });
  });
}

/* Pages */
function homePage(){
  var featured=PRODUCTS.slice(0,4);
  return '<div class="page">'
  +'<section class="hero"><div class="wrap hero-in"><div class="hero-copy">'
  +'<span class="kicker"><span class="leafmark">'+ICON_LEAF_SM+'</span> Fresh Nature Eco</span>'
  +'<h1>Natural goodness for your best friend</h1>'
  +'<p>Honest food and simple, useful accessories for dogs and cats, chosen with care and priced clearly in PKR.</p>'
  +'<div class="hero-ctas"><a class="btn" href="/shop" data-nav="/shop">Shop All Products</a><a class="btn ghost" href="/about" data-nav="/about">About PetPaw</a></div>'
  +'<div class="hero-points"><span>'+ICON_CHECK+' 12 products, clear prices</span><span>'+ICON_CHECK+' Food and accessories</span><span>'+ICON_CHECK+' Cash on delivery</span></div>'
  +'</div><div class="hero-photo"><img src="/images/hero.jpg" alt="Happy dog running through green grass"></div></div></section>'
  +'<section class="block"><div class="wrap"><div class="sec-head anim"><div><h2>Shop by category</h2><p>Two simple categories, six products in each.</p></div></div>'
  +'<div class="cat-grid">'
  +Object.keys(CATEGORIES).map(function(k,i){ var c=CATEGORIES[k]; return '<a class="cat-card anim" style="animation-delay:'+(i*0.12)+'s" href="/category/'+c.slug+'" data-nav="/category/'+c.slug+'"><img src="'+c.img+'" alt="'+esc(c.alt)+'"><span class="cat-body"><h3>'+c.name+'</h3><p>6 products</p><span class="btn small leaf">View Details</span></span></a>'; }).join("")
  +'</div></div></section>'
  +'<section class="block" style="padding-top:0"><div class="wrap"><div class="sec-head anim"><div><h2>Featured products</h2><p>A few favourites from the shelf to start with.</p></div><a class="btn ghost small" href="/shop" data-nav="/shop">See all 12 products</a></div>'
  +gridHTML(featured)+'</div></section>'
  +'<section class="block" style="padding-top:0"><div class="wrap"><div class="sec-head anim"><div><h2>Simple and natural, every day</h2></div></div><div class="why-grid">'
  +'<div class="why-card anim"><span class="leafmark">'+ICON_LEAF_SM+'</span><h3>Clear ingredients</h3><p>Every food lists its main recipe and bag weight, so you know what you are buying.</p></div>'
  +'<div class="why-card anim" style="animation-delay:.1s"><span class="leafmark">'+ICON_LEAF_SM+'</span><h3>Useful accessories</h3><p>Beds, bowls, collars and grooming basics that a pet home actually uses.</p></div>'
  +'<div class="why-card anim" style="animation-delay:.2s"><span class="leafmark">'+ICON_LEAF_SM+'</span><h3>Honest prices</h3><p>Prices are shown in PKR on every product, with no hidden charges at checkout.</p></div>'
  +'</div></div></section>'
  +newsletterHTML()+'</div>';
}

var shopState={cat:"all",q:""};
function shopPage(){
  return '<div class="page"><div class="wrap"><div class="page-head anim"><h1>Shop</h1><p>All 12 PetPaw products. Filter by category or search by name, recipe or detail.</p></div>'
  +'<div class="shop-tools"><button class="chip" type="button" data-chip="all">All Products (12)</button>'
  +'<button class="chip" type="button" data-chip="pet-food">Pet Food (6)</button>'
  +'<button class="chip" type="button" data-chip="pet-accessories">Pet Accessories (6)</button>'
  +'<div class="shop-search"><input type="search" id="shopSearch" placeholder="Search products" aria-label="Search products in shop"></div></div>'
  +'<div style="margin-bottom:6px"><a href="/category/pet-food" data-nav="/category/pet-food" style="font-weight:800;margin-right:18px">Pet Food category page</a><a href="/category/pet-accessories" data-nav="/category/pet-accessories" style="font-weight:800">Pet Accessories category page</a></div>'
  +'<p class="count-line" id="shopCount"></p><div id="shopGrid"></div></div>'
  +'<div style="height:30px"></div>'+newsletterHTML()+'</div>';
}
function shopList(){
  var q=shopState.q.trim().toLowerCase();
  return PRODUCTS.filter(function(p){
    if(shopState.cat!=="all"&&p.cat!==shopState.cat) return false;
    if(!q) return true;
    var hay=(p.name+" "+CATEGORIES[p.cat].name+" "+p.desc+" "+p.points.join(" ")+" "+p.size).toLowerCase();
    return hay.indexOf(q)>-1;
  });
}
function renderShopGrid(){
  var list=shopList();
  var grid=document.getElementById("shopGrid"), count=document.getElementById("shopCount");
  if(!grid) return;
  count.textContent="Showing "+list.length+" of 12 products";
  grid.innerHTML=list.length?gridHTML(list):'<div class="empty-box"><h3 style="margin-bottom:6px">No products found</h3><p>Try a different search word or category.</p></div>';
  bindCards();
}
function bindShop(){
  document.querySelectorAll("[data-chip]").forEach(function(ch){
    if(ch.getAttribute("data-chip")===shopState.cat) ch.classList.add("active");
    ch.addEventListener("click",function(){
      shopState.cat=ch.getAttribute("data-chip");
      document.querySelectorAll("[data-chip]").forEach(function(x){ x.classList.toggle("active",x===ch); });
      renderShopGrid();
    });
  });
  var inp=document.getElementById("shopSearch");
  inp.value=shopState.q;
  inp.addEventListener("input",function(){ shopState.q=inp.value; renderShopGrid(); });
  renderShopGrid();
}

function categoryPage(slug){
  var c=CATEGORIES[slug]; if(!c) return homePage();
  var list=PRODUCTS.filter(function(p){ return p.cat===slug; });
  return '<div class="page"><div class="wrap">'
  +'<nav class="crumb"><a href="/" data-nav="/">Home</a> / <a href="/shop" data-nav="/shop">Shop</a> / <span>'+c.name+'</span></nav>'
  +'<a class="back-link" href="/shop" data-nav="/shop">← Back to Shop</a>'
  +'<div class="page-head anim" style="padding-top:10px"><h1>'+c.name+'</h1><p>'+esc(c.desc)+'</p></div>'
  +'<img src="'+c.img+'" alt="'+esc(c.alt)+'" style="width:100%;height:300px;object-fit:cover;border-radius:22px;box-shadow:var(--shadow)">'
  +'<ul style="list-style:none;padding:0;margin:22px 0;display:grid;gap:9px">'+c.points.map(function(pt){ return '<li style="display:flex;gap:10px;font-weight:700">'+ICON_CHECK+' '+esc(pt)+'</li>'; }).join("")+'</ul>'
  +'<p class="count-line">Showing '+list.length+' of 6 products in '+c.name+'</p>'
  +gridHTML(list)+'<div style="height:40px"></div></div></div>';
}

function productPage(id){
  var p=byId(id); if(!p) return homePage();
  var cat=CATEGORIES[p.cat];
  var related=PRODUCTS.filter(function(x){ return x.cat===p.cat&&x.id!==p.id; }).slice(0,4);
  return '<div class="page"><div class="wrap">'
  +'<nav class="crumb"><a href="/" data-nav="/">Home</a> / <a href="/shop" data-nav="/shop">Shop</a> / <a href="/category/'+cat.slug+'" data-nav="/category/'+cat.slug+'">'+cat.name+'</a> / <span>'+esc(p.name)+'</span></nav>'
  +'<a class="back-link" href="/category/'+cat.slug+'" data-nav="/category/'+cat.slug+'">← Back to '+cat.name+'</a>'
  +'<div class="detail"><div class="anim"><img class="main-photo" src="'+p.img+'" alt="'+esc(p.alt)+'"></div>'
  +'<div class="anim" style="animation-delay:.1s"><span class="cat-tag" style="font-size:.78rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:var(--leaf)">'+cat.name+'</span>'
  +'<h1>'+esc(p.name)+(p.size?' ('+p.size+')':"")+'</h1>'
  +'<div class="d-price">'+fmt(p.price)+'</div>'
  +'<p class="d-desc">'+esc(p.desc)+'</p>'
  +'<ul class="points">'+p.points.map(function(pt){ return '<li>'+ICON_CHECK+'<span>'+esc(pt)+'</span></li>'; }).join("")+'</ul>'
  +'<div class="qty-row"><span style="font-weight:900">Quantity</span><span class="qty-ctrl"><button type="button" id="qMinus" aria-label="Decrease quantity">−</button><output id="qOut">1</output><button type="button" id="qPlus" aria-label="Increase quantity">+</button></span>'
  +'<button class="btn" type="button" id="detailAdd">Add to Cart</button></div>'
  +'<p style="color:var(--muted);font-weight:700;margin-top:16px">Payment options at checkout: cash on delivery or card.</p>'
  +'</div></div>'
  +'<div class="sec-head anim"><div><h2>More in '+cat.name+'</h2></div><a class="btn ghost small" href="/category/'+cat.slug+'" data-nav="/category/'+cat.slug+'">View category</a></div>'
  +gridHTML(related)+'<div style="height:40px"></div></div></div>';
}
function bindProduct(id){
  var qty=1, out=document.getElementById("qOut");
  document.getElementById("qMinus").addEventListener("click",function(){ if(qty>1) qty--; out.textContent=qty; });
  document.getElementById("qPlus").addEventListener("click",function(){ if(qty<99) qty++; out.textContent=qty; });
  document.getElementById("detailAdd").addEventListener("click",function(){ addToCart(id,qty); });
}

function cartPage(){
  if(!cart.length){
    return '<div class="page"><div class="wrap"><div class="page-head anim"><h1>Shopping Bag</h1></div>'
    +'<div class="empty-box"><h3 style="margin-bottom:6px">Your bag is empty</h3><p>Add some natural goodness for your pet from the shop.</p><p style="margin-top:16px"><a class="btn" href="/shop" data-nav="/shop">Go to Shop</a></p></div><div style="height:50px"></div></div></div>';
  }
  var lines=cart.map(function(l){ var p=byId(l.id); if(!p) return "";
    return '<div class="cart-line"><img src="'+p.img+'" alt="'+esc(p.alt)+'"><div style="flex:1;min-width:160px"><h3>'+esc(p.name)+'</h3><div class="l-price">'+fmt(p.price)+'</div>'
    +'<button class="remove-btn" type="button" data-remove="'+p.id+'">Remove</button></div>'
    +'<span class="qty-ctrl"><button type="button" data-dec="'+p.id+'" aria-label="Decrease quantity">−</button><output>'+l.qty+'</output><button type="button" data-inc="'+p.id+'" aria-label="Increase quantity">+</button></span>'
    +'<div style="font-weight:900;min-width:96px;text-align:right">'+fmt(p.price*l.qty)+'</div></div>';
  }).join("");
  return '<div class="page"><div class="wrap"><div class="page-head anim"><h1>Shopping Bag</h1><p>Check your items, change quantities, then go to checkout.</p></div>'
  +'<div class="cart-layout"><div>'+lines+'</div>'
  +'<div class="summary"><h3>Order summary</h3><div class="sum-row"><span>Items</span><span>'+cartCount()+'</span></div>'
  +'<div class="sum-row total"><span>Subtotal</span><span>'+fmt(cartSubtotal())+'</span></div>'
  +'<p style="color:var(--muted);font-size:.92rem">Delivery details are collected at checkout. Payment is cash on delivery or card.</p>'
  +'<a class="btn" href="/checkout" data-nav="/checkout" style="width:100%">Go to Checkout</a>'
  +'<a class="btn ghost" href="/shop" data-nav="/shop" style="width:100%;margin-top:10px">Continue Shopping</a></div></div></div></div>';
}
function bindCart(){
  app.querySelectorAll("[data-inc]").forEach(function(b){ b.addEventListener("click",function(){ var id=+b.getAttribute("data-inc"); cart.forEach(function(l){ if(l.id===id) l.qty++; }); saveCart(); updateBag(false); render(); }); });
  app.querySelectorAll("[data-dec]").forEach(function(b){ b.addEventListener("click",function(){ var id=+b.getAttribute("data-dec"); cart.forEach(function(l){ if(l.id===id&&l.qty>1) l.qty--; }); saveCart(); updateBag(false); render(); }); });
  app.querySelectorAll("[data-remove]").forEach(function(b){ b.addEventListener("click",function(){ var id=+b.getAttribute("data-remove"); cart=cart.filter(function(l){ return l.id!==id; }); saveCart(); updateBag(false); render(); toast("Item removed from bag"); }); });
}

function checkoutPage(){
  if(lastOrder){
    var o=lastOrder;
    return '<div class="page"><div class="wrap"><div style="height:36px"></div><div class="success-box anim">'
    +'<span class="leafmark">'+ICON_LEAF_SM+'</span><h2>Order confirmed</h2>'
    +'<p>Thank you, '+esc(o.name)+'. Your order number is <strong>'+o.number+'</strong>.</p>'
    +'<p>Payment method: <strong>'+esc(o.payment)+'</strong> &nbsp;|&nbsp; Total: <strong>'+fmt(o.total)+'</strong></p>'
    +'<p style="color:var(--muted)">Delivery to '+esc(o.address)+', '+esc(o.city)+'. Your order has been saved. We will contact you soon.</p>'
    +'<p style="margin-top:18px"><a class="btn" href="/shop" data-nav="/shop">Continue Shopping</a></p></div><div style="height:50px"></div></div></div>';
  }
  if(!cart.length){
    return '<div class="page"><div class="wrap"><div class="page-head anim"><h1>Checkout</h1></div><div class="empty-box"><h3 style="margin-bottom:6px">Your bag is empty</h3><p>Add products first, then come back to checkout.</p><p style="margin-top:16px"><a class="btn" href="/shop" data-nav="/shop">Go to Shop</a></p></div><div style="height:50px"></div></div></div>';
  }
  var lines=cart.map(function(l){ var p=byId(l.id); return '<div class="sum-row"><span>'+esc(p.name)+' × '+l.qty+'</span><span>'+fmt(p.price*l.qty)+'</span></div>'; }).join("");
  return '<div class="page"><div class="wrap"><div class="page-head anim"><h1>Checkout</h1><p>Fill in your delivery details and choose how you would like to pay.</p></div>'
  +'<div class="cart-layout"><form id="checkoutForm" novalidate><div class="field"><label for="coName">Full name</label><input type="text" id="coName" placeholder="Your full name"><div class="err" id="eName"></div></div>'
  +'<div class="field"><label for="coPhone">Phone number</label><input type="tel" id="coPhone" placeholder="03XX XXXXXXX"><div class="err" id="ePhone"></div></div>'
  +'<div class="field"><label for="coEmail">Email address</label><input type="email" id="coEmail" placeholder="you@example.com"><div class="err" id="eEmail"></div></div>'
  +'<div class="field"><label for="coAddress">Address</label><input type="text" id="coAddress" placeholder="House, street, area"><div class="err" id="eAddress"></div></div>'
  +'<div class="field"><label for="coCity">City</label><input type="text" id="coCity" placeholder="Your city"><div class="err" id="eCity"></div></div>'
  +'<div class="field"><label>Payment method</label>'
  +'<label class="radio-card"><input type="radio" name="pay" value="Cash on Delivery" checked><span><strong>Cash on Delivery</strong><small>Pay in cash when your order arrives.</small></span></label>'
  +'<label class="radio-card"><input type="radio" name="pay" value="Card"><span><strong>Card</strong><small>Pay by debit or credit card.</small></span></label></div>'
  +'<button class="btn" type="submit" style="width:100%">Place Order</button></form>'
  +'<div class="summary"><h3>Your order</h3>'+lines+'<div class="sum-row total"><span>Subtotal</span><span>'+fmt(cartSubtotal())+'</span></div></div>'
  +'</div></div></div>';
}
function bindCheckout(){
  var f=document.getElementById("checkoutForm"); if(!f) return;
  function setErr(id,msg){ var e=document.getElementById(id); e.textContent=msg; e.classList.toggle("show",!!msg); return !msg; }
  f.addEventListener("submit",function(ev){
    ev.preventDefault();
    var name=document.getElementById("coName").value.trim();
    var phone=document.getElementById("coPhone").value.trim();
    var email=document.getElementById("coEmail").value.trim();
    var address=document.getElementById("coAddress").value.trim();
    var city=document.getElementById("coCity").value.trim();
    var ok=true;
    ok=setErr("eName",name.length>=3?"":"Please enter your full name.")&&ok;
    ok=setErr("ePhone",/^[0-9+\s-]{10,15}$/.test(phone)?"":"Please enter a valid phone number.")&&ok;
    ok=setErr("eEmail",/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)?"":"Please enter a valid email address.")&&ok;
    ok=setErr("eAddress",address.length>=8?"":"Please enter your full address.")&&ok;
    ok=setErr("eCity",city.length>=2?"":"Please enter your city.")&&ok;
    if(!ok) return;
    var pay=f.querySelector('input[name="pay"]:checked');
    var items=cart.map(function(l){ var p=byId(l.id); return {productId:p.slug,qty:l.qty}; });
    fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({customerName:name,email:email,phone:phone,address:address,city:city,payment:pay&&pay.value==="Card"?"card":"cash",items:items})})
      .then(function(r){ return r.json().then(function(b){ if(!r.ok) throw new Error(b.error||"Order failed"); return b; }); })
      .then(function(saved){
        lastOrder={number:saved.orderNumber,name:name,phone:phone,email:email,address:address,city:city,payment:pay?pay.value:"Cash on Delivery",total:saved.total};
        cart=[]; saveCart(); updateBag(false);
        render(); window.scrollTo(0,0); toast("Order confirmed: "+lastOrder.number);
      })
      .catch(function(err){ toast(err.message||"Could not place your order. Please try again."); });
  });
}

function aboutPage(){
  return '<div class="page"><div class="wrap"><div class="page-head anim"><h1>About PetPaw</h1>'
  +'<p>PetPaw is a small pet shop with a simple idea: natural goodness for your best friend, with honest products and clear prices.</p></div>'
  +'<img src="/images/about.jpg" alt="Happy dog running through green grass" style="width:100%;height:320px;object-fit:cover;border-radius:22px;box-shadow:var(--shadow)">'
  +'<section class="block"><h2 style="margin-bottom:12px">What we sell</h2><p style="color:var(--muted);max-width:68ch">Our shop has two categories. Pet Food covers everyday food for dogs, puppies, cats and kittens, in bags from 1.5 kg to 3 kg. Pet Accessories covers the basics a pet home needs: a chew toy, a soft bed, a collar and leash set, a ceramic bowl, a scratching post and a grooming brush set.</p>'
  +'<h2 style="margin:26px 0 12px">Who is behind PetPaw</h2><p style="color:var(--muted);max-width:68ch">PetPaw is by Interlinkz. The Interlinkz name appears on this page, in our footer and on our opening screen, because PetPaw is one of the shops built and cared for by Interlinkz.</p>'
  +'<h2 style="margin:26px 0 12px">How we work</h2><div class="why-grid">'
  +'<div class="why-card"><span class="leafmark">'+ICON_LEAF_SM+'</span><h3>Clear information</h3><p>Every product page lists the price, weight where it applies, a plain description and the key details.</p></div>'
  +'<div class="why-card"><span class="leafmark">'+ICON_LEAF_SM+'</span><h3>No false claims</h3><p>We do not publish invented ratings, reviews or offers. What you see is what the product is.</p></div>'
  +'<div class="why-card"><span class="leafmark">'+ICON_LEAF_SM+'</span><h3>Simple ordering</h3><p>Add to bag, check out with your delivery details, and pay cash on delivery or by card.</p></div>'
  +'</div></section></div>'+newsletterHTML()+'</div>';
}

function contactPage(){
  return '<div class="page"><div class="wrap"><div class="page-head anim"><h1>Contact</h1><p>Send us a message with the form, and we will reply as soon as we can.</p></div>'
  +'<div class="contact-grid"><div>'
  +'<div class="info-card"><h3>Phone</h3><p class="not-provided">Not provided yet</p></div>'
  +'<div class="info-card"><h3>Email</h3><p class="not-provided">Not provided yet</p></div>'
  +'<div class="info-card"><h3>Address</h3><p class="not-provided">Not provided yet</p></div>'
  +'</div>'
  +'<form id="contactForm" class="summary" novalidate><h3 style="margin-bottom:16px">Send a message</h3>'
  +'<div class="field"><label for="ctName">Your name</label><input type="text" id="ctName" placeholder="Your full name"><div class="err" id="ceName"></div></div>'
  +'<div class="field"><label for="ctEmail">Email address</label><input type="email" id="ctEmail" placeholder="you@example.com"><div class="err" id="ceEmail"></div></div>'
  +'<div class="field"><label for="ctSubject">Subject</label><input type="text" id="ctSubject" placeholder="What is this about"><div class="err" id="ceSubject"></div></div>'
  +'<div class="field"><label for="ctMsg">Message</label><textarea id="ctMsg" placeholder="Write your message"></textarea><div class="err" id="ceMsg"></div></div>'
  +'<button class="btn" type="submit" style="width:100%">Send Message</button>'
  +'<div class="ok" id="ctOk" style="display:none;color:var(--forest);font-weight:800;margin-top:12px">Thank you, your message has been received. We will reply soon.</div>'
  +'</form></div></div>'+newsletterHTML()+'</div>';
}
function bindContact(){
  var f=document.getElementById("contactForm"); if(!f) return;
  function setErr(id,msg){ var e=document.getElementById(id); e.textContent=msg; e.classList.toggle("show",!!msg); return !msg; }
  f.addEventListener("submit",function(ev){
    ev.preventDefault();
    var ok=true;
    ok=setErr("ceName",document.getElementById("ctName").value.trim().length>=3?"":"Please enter your name.")&&ok;
    ok=setErr("ceEmail",/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(document.getElementById("ctEmail").value.trim())?"":"Please enter a valid email address.")&&ok;
    ok=setErr("ceSubject",document.getElementById("ctSubject").value.trim().length>=3?"":"Please enter a subject.")&&ok;
    ok=setErr("ceMsg",document.getElementById("ctMsg").value.trim().length>=10?"":"Please write a message of at least 10 characters.")&&ok;
    if(!ok) return;
    fetch("/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:document.getElementById("ctName").value.trim(),email:document.getElementById("ctEmail").value.trim(),subject:document.getElementById("ctSubject").value.trim(),message:document.getElementById("ctMsg").value.trim()})})
      .then(function(r){ return r.json().then(function(b){ if(!r.ok) throw new Error(b.error||"Message failed"); return b; }); })
      .then(function(){ document.getElementById("ctOk").style.display="block"; f.querySelectorAll("input,textarea").forEach(function(x){ x.value=""; }); toast("Message sent"); })
      .catch(function(e2){ toast(e2.message||"Could not send your message. Please try again."); });
  });
}

function render(){
  var path=currentPath;
  var html, bind=null;
  document.querySelectorAll("nav.main a").forEach(function(a){
    var p=a.getAttribute("data-nav");
    a.classList.toggle("active",p===path||(p==="/shop"&&(path.indexOf("/product/")===0||path.indexOf("/category/")===0)));
  });
  if(path==="/"||path===""){ html=homePage(); }
  else if(path==="/shop"){ html=shopPage(); bind=bindShop; }
  else if(path.indexOf("/category/")===0){ html=categoryPage(path.split("/")[2]); }
  else if(path.indexOf("/product/")===0){ var id=parseInt(path.split("/")[2],10); html=productPage(id); bind=function(){ bindProduct(id); bindCards(); }; }
  else if(path==="/cart"){ html=cartPage(); bind=bindCart; }
  else if(path==="/checkout"){ html=checkoutPage(); bind=bindCheckout; }
  else if(path==="/about"){ html=aboutPage(); }
  else if(path==="/contact"){ html=contactPage(); bind=bindContact; }
  else { html=homePage(); }
  app.innerHTML=html.split('src="assets/').join('src="'+ASSET_BASE+'assets/');
  bindCards(); bindNewsletter();
  if(bind) bind();
  updateBag(false);
}

/* Header wiring */
function hideSearch(){ document.getElementById("searchPanel").classList.remove("open"); document.getElementById("suggest").classList.remove("show"); }
function closeMenu(){ document.getElementById("mobileMenu").classList.remove("open"); document.getElementById("scrim").classList.remove("show"); }
function searchMatches(q){
  q=q.trim().toLowerCase(); if(!q) return [];
  return PRODUCTS.filter(function(p){
    var hay=(p.name+" "+CATEGORIES[p.cat].name+" "+p.desc+" "+p.points.join(" ")+" "+p.size).toLowerCase();
    return hay.indexOf(q)>-1;
  }).slice(0,6);
}
function init(){
  document.querySelectorAll("[data-leaf]").forEach(function(el){ el.innerHTML=LEAF; });
  document.querySelectorAll("[data-leaf-light]").forEach(function(el){ el.innerHTML=LEAF_LIGHT; });
  document.getElementById("introLeaf").innerHTML=LEAF_LIGHT;
  document.getElementById("searchBtn").innerHTML=ICON_SEARCH;
  document.getElementById("bagBtn").innerHTML=ICON_BAG+'<span class="bag-count" style="display:none">0</span>';
  document.getElementById("menuBtn").innerHTML=ICON_MENU;
  document.getElementById("bagBtn").addEventListener("click",function(){ hideSearch(); navigate("/cart"); });
  document.getElementById("searchBtn").addEventListener("click",function(){
    var panel=document.getElementById("searchPanel");
    panel.classList.toggle("open");
    if(panel.classList.contains("open")) document.getElementById("searchInput").focus();
  });
  var sInput=document.getElementById("searchInput"), suggest=document.getElementById("suggest");
  sInput.addEventListener("input",function(){
    var list=searchMatches(sInput.value);
    if(!sInput.value.trim()||!list.length){ suggest.classList.remove("show"); suggest.innerHTML=""; return; }
    suggest.innerHTML=list.map(function(p){ return '<button type="button" class="suggest-item" data-sug="'+p.id+'"><img src="'+abs(p.img)+'" alt=""><span class="s-name">'+esc(p.name)+'</span><span class="s-price">'+fmt(p.price)+'</span></button>'; }).join("");
    suggest.classList.add("show");
    suggest.querySelectorAll("[data-sug]").forEach(function(b){ b.addEventListener("click",function(){ hideSearch(); navigate("/product/"+b.getAttribute("data-sug")); }); });
  });
  document.getElementById("searchForm").addEventListener("submit",function(ev){
    ev.preventDefault();
    shopState.q=sInput.value.trim(); shopState.cat="all";
    hideSearch(); navigate("/shop");
  });
  document.addEventListener("click",function(ev){ if(!ev.target.closest(".search-in")) suggest.classList.remove("show"); });
  document.getElementById("menuBtn").addEventListener("click",function(){ document.getElementById("mobileMenu").classList.add("open"); document.getElementById("scrim").classList.add("show"); });
  document.getElementById("menuClose").addEventListener("click",closeMenu);
  document.getElementById("scrim").addEventListener("click",closeMenu);
  /* Intro */
  var intro=document.getElementById("intro");
  var dismiss=function(){ intro.classList.add("done"); setTimeout(function(){ intro.style.display="none"; },700); };
  document.getElementById("skipIntro").addEventListener("click",dismiss);
  setTimeout(dismiss,2400);
  /* Initial route */
  var p=parseRoute();
  var known=["/","/shop","/about","/contact","/cart","/checkout"];
  if(known.indexOf(p)>-1||p.indexOf("/product/")===0||p.indexOf("/category/")===0) currentPath=p;
  var params=new URLSearchParams(window.location.search);
  if(params.get("q")){ shopState.q=params.get("q"); }
  if(params.get("cat")&&CATEGORIES[params.get("cat")]){ shopState.cat=params.get("cat"); }
  loadProducts().then(function(){ render(); });
}
try{ init(); }catch(e){ document.getElementById("fatal").classList.add("show"); }
window.addEventListener("error",function(){ if(!app.innerHTML) document.getElementById("fatal").classList.add("show"); });
})();
