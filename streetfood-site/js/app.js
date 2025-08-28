
/* app.js - shared for all pages
   Demonstrates:
   - Cookies (theme)
   - localStorage (favorites)
   - sessionStorage (recently viewed)
   - jQuery AJAX load from /data/foods.json
   - Social share helpers
*/
$(function(){
  // Theme via cookie
  const themeCookie = getCookie('sfe-theme');
  if(themeCookie === 'dark') $('body').addClass('dark-theme');
  $('#themeToggle').on('click', function(){
    $('body').toggleClass('dark-theme');
    setCookie('sfe-theme', $('body').hasClass('dark-theme') ? 'dark' : 'light', 14);
  });

  // Load food data (for rankings / listings) via AJAX
  function loadFoods(cb){
    $.getJSON('data/foods.json').done(function(data){
      if(cb) cb(data);
    }).fail(function(){
      console.warn('Failed to load foods.json');
      if(cb) cb([]);
    });
  }

  // Render ranking list if container exists
  if($('#rankingList').length){
    loadFoods(function(data){
      // Example ranking: by salesScore * 0.6 + socialScore * 0.4 (simple composite)
      data.forEach(function(d){ d.composite = (d.salesScore||0)*0.6 + (d.socialScore||0)*0.4; });
      data.sort(function(a,b){ return b.composite - a.composite; });
      data.forEach(function(food, i){
        $('#rankingList').append(`
          <div class="card p-3 mb-3">
            <div class="d-flex align-items-center">
              <img src="${food.image}" alt="" style="width:96px;height:64px;object-fit:cover;border-radius:8px;margin-right:12px">
              <div>
                <h5 class="mb-0">${escapeHtml(food.name)}</h5>
                <small class="text-muted">${escapeHtml(food.region)} • Composite score: ${food.composite.toFixed(2)}</small>
                <div class="mt-2"><button class="btn btn-sm btn-outline-primary fav-btn" data-name="${escapeHtml(food.name)}">❤ Favorite</button>
                <button class="btn btn-sm btn-outline-secondary view-btn" data-name="${escapeHtml(food.name)}">View</button></div>
              </div>
            </div>
          </div>
        `);
      });
    });
  }

  // Favorites (localStorage)
  function renderFavsList(){
    const favs = JSON.parse(localStorage.getItem('sfe-favs')||'[]');
    const $list = $('#favList');
    if(!$list.length) return;
    $list.empty();
    if(!favs.length) $list.append('<li class="list-group-item small text-muted">No favorites</li>');
    favs.forEach(f => $list.append('<li class="list-group-item small">'+escapeHtml(f)+'</li>'));
  }
  renderFavsList();
  $(document).on('click', '.fav-btn', function(){
    const name = $(this).data('name');
    let favs = JSON.parse(localStorage.getItem('sfe-favs')||'[]');
    if(!favs.includes(name)) favs.push(name);
    localStorage.setItem('sfe-favs', JSON.stringify(favs));
    alert('Added to favorites: ' + name);
    renderFavsList();
  });

  // Session storage - recently viewed
  $(document).on('click', '.view-btn', function(){
    const name = $(this).data('name');
    let arr = JSON.parse(sessionStorage.getItem('sfe-recent')||'[]');
    arr.unshift(name);
    arr = Array.from(new Set(arr)).slice(0,5);
    sessionStorage.setItem('sfe-recent', JSON.stringify(arr));
    alert('Viewed: ' + name + ' (saved in sessionStorage)');
  });

  // Vendors demo AJAX load (uses foods.json for demo)
  $('#loadVendors').on('click', function(){
    $('#vendorsGrid').html('<div>Loading…</div>');
    loadFoods(function(data){
      $('#vendorsGrid').empty();
      data.slice(0,9).forEach(function(f){
        $('#vendorsGrid').append(`<div class="card p-2"><img src="${f.image}" style="width:100%;height:120px;object-fit:cover"/><div class="p-2"><strong>${escapeHtml(f.name)}</strong><p class="small text-muted">${escapeHtml(f.region)}</p></div></div>`);
      });
    });
  });

  // Contact form cookie storage
  $('#contactForm').on('submit', function(e){
    e.preventDefault();
    const name = $('#contactName').val(), email = $('#contactEmail').val();
    setCookie('sfe-contact-name', name, 30);
    setCookie('sfe-contact-email', email, 30);
    alert('Message submitted (demo). Name & email saved in cookies.');
    this.reset();
  });
  const savedName = getCookie('sfe-contact-name'), savedEmail = getCookie('sfe-contact-email');
  if(savedName) $('#contactName').val(savedName);
  if(savedEmail) $('#contactEmail').val(savedEmail);

  // Simple social share
  $('#shareTwitter').on('click', function(){ window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent(document.title + ' — check this out!')+'&url='+encodeURIComponent(location.href)); });
  $('#shareFacebook').on('click', function(){ window.open('https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(location.href)); });

  // Helpers
  function setCookie(n,v,d){ const t=new Date(); t.setTime(t.getTime()+d*24*60*60*1000); document.cookie = n+'='+encodeURIComponent(v)+';expires='+t.toUTCString()+';path=/';}
  function getCookie(n){ const m=document.cookie.match('(^|;)\s*'+n+'\s*=\s*([^;]+)'); return m?decodeURIComponent(m.pop()):''; }
  function escapeHtml(s){ return String(s).replace(/[&<>"'`=\/]/g,function(c){return'&#'+c.charCodeAt(0)+';';}); }
});
