var lang = 'zh';
var selectedSev = 'minor';
var ADMIN_KEY = 'yztgfchsuai';

function getBugs(){
  try{ return JSON.parse(localStorage.getItem('bugs')||'[]'); }
  catch(e){ return []; }
}
function saveBugs(b){ localStorage.setItem('bugs', JSON.stringify(b)); }
function getNextId(){ var b=getBugs(); return b.length+1; }
function isAdmin(){ return sessionStorage.getItem('admin_logged_in')==='1'; }

function showPage(p){
  if(p==='admin' && !isAdmin()){ openLogin(); return; }
  document.querySelectorAll('.page').forEach(function(el){el.classList.remove('active')});
  document.getElementById('page-'+p).classList.add('active');
  document.querySelectorAll('.nav a[data-page]').forEach(function(el){
    el.classList.toggle('active', el.getAttribute('data-page')===p);
  });
  if(p==='list') renderList();
  if(p==='home') updateStats();
  if(p==='admin'){ updateAdminStats(); renderAdminList(); }
  if(p==='submit') document.getElementById('next-id-display').textContent='W-'+getNextId();
  window.scrollTo(0,0);
}

function toggleLang(){
  lang = lang==='zh'?'en':'zh';
  document.getElementById('langBtn').textContent = lang==='zh'?'EN':'中文';
  document.documentElement.lang = lang==='zh'?'zh-CN':'en';
  document.querySelectorAll('[data-zh]').forEach(function(el){
    el.textContent = el.getAttribute('data-'+lang);
  });
  if(document.getElementById('page-list').classList.contains('active')) renderList();
  if(document.getElementById('page-admin').classList.contains('active')) renderAdminList();
  if(document.getElementById('page-home').classList.contains('active')) renderHomeBugList();
}

function selectSev(el){
  document.querySelectorAll('.sev-opt').forEach(function(o){o.classList.remove('sel')});
  el.classList.add('sel');
  selectedSev = el.getAttribute('data-val');
}

function submitBug(e){
  e.preventDefault();
  var bugs = getBugs();
  var newId = bugs.length + 1;
  var bug = {
    id: newId,
    title: document.getElementById('f-title').value,
    severity: selectedSev,
    module: document.getElementById('f-module').value,
    description: document.getElementById('f-desc').value,
    steps: document.getElementById('f-steps').value,
    submitter_name: document.getElementById('f-name').value,
    submitter_email: document.getElementById('f-email').value,
    status: 'pending',
    created_at: new Date().toLocaleString('zh-CN')
  };
  bugs.push(bug);
  saveBugs(bugs);
  document.getElementById('new-bug-id').textContent = 'W-'+newId;
  document.getElementById('form-area').style.display='none';
  document.getElementById('success-box').style.display='block';
  updateStats();
  return false;
}

function resetForm(){
  document.getElementById('bug-form').reset();
  selectedSev='minor';
  document.querySelectorAll('.sev-opt').forEach(function(o){o.classList.remove('sel')});
  document.querySelector('.sev-minor').classList.add('sel');
  document.getElementById('form-area').style.display='block';
  document.getElementById('success-box').style.display='none';
  document.getElementById('next-id-display').textContent='W-'+getNextId();
}

function updateStats(){
  var bugs=getBugs();
  document.getElementById('stat-total').textContent=bugs.length;
  document.getElementById('stat-processing').textContent=bugs.filter(function(b){return b.status==='processing'}).length;
  document.getElementById('stat-resolved').textContent=bugs.filter(function(b){return b.status==='resolved'}).length;
  renderHomeBugList();
}

function renderHomeBugList(){
  var bugs=getBugs().sort(function(a,b){return b.id-a.id}).slice(0,5);
  var c=document.getElementById('home-bug-list');
  if(!c) return;
  if(bugs.length===0){
    c.innerHTML='<div class="empty" style="padding:30px"><p>'+(lang==='zh'?'还没有提交的Bug，快来提交第一个吧！':'No bugs yet, submit the first one!')+'</p></div>';
    return;
  }
  c.innerHTML=bugs.map(function(b){
    return '<div class="bug-item" style="cursor:pointer" onclick="showPage(\'list\')">'+
      '<div class="bug-head"><span class="bug-id">W-'+b.id+'</span><span class="bug-status st-'+b.status+'">'+statusText(b.status)+'</span></div>'+
      '<div class="bug-title">'+esc(b.title)+'</div>'+
      '<div class="bug-meta">'+
        '<span class="bug-sev sev-'+b.severity+'">'+sevText(b.severity)+'</span>'+
        '<span>'+(lang==='zh'?'提交人：':'By: ')+esc(b.submitter_name)+'</span>'+
        '<span>'+esc(b.created_at)+'</span>'+
      '</div>'+
    '</div>';
  }).join('');
}

function updateAdminStats(){
  var bugs=getBugs();
  document.getElementById('admin-stat-total').textContent=bugs.length;
  document.getElementById('admin-stat-pending').textContent=bugs.filter(function(b){return b.status==='pending'}).length;
  document.getElementById('admin-stat-processing').textContent=bugs.filter(function(b){return b.status==='processing'}).length;
  document.getElementById('admin-stat-resolved').textContent=bugs.filter(function(b){return b.status==='resolved'}).length;
  document.getElementById('admin-status').textContent = lang==='zh' ? '已登录' : 'Logged in';
}

function sevText(s){
  var m={minor:['轻微','Minor'],moderate:['一般','Moderate'],severe:['严重','Severe'],critical:['致命','Critical'],improvement:['改进建议','Improvement']};
  return m[s]?m[s][lang==='zh'?0:1]:s;
}
function statusText(s){
  var m={pending:['待修复','Pending'],processing:['处理中','Processing'],resolved:['已修复','Resolved'],wontfix:['不予修复',"Won't Fix"],feature:['特性','Feature']};
  return m[s]?m[s][lang==='zh'?0:1]:s;
}

function renderList(){
  var bugs=getBugs();
  var fs=document.getElementById('filter-status').value;
  var fv=document.getElementById('filter-severity').value;
  if(fs!=='all') bugs=bugs.filter(function(b){return b.status===fs});
  if(fv!=='all') bugs=bugs.filter(function(b){return b.severity===fv});
  bugs.sort(function(a,b){return a.id-b.id});
  var c=document.getElementById('bug-list-container');
  if(bugs.length===0){
    c.innerHTML='<div class="empty"><div class="empty-icon">---</div><p>'+(lang==='zh'?'还没有提交的Bug':'No bugs submitted yet')+'</p><button class="btn btn-primary" style="margin-top:16px" onclick="showPage(\'submit\')">'+(lang==='zh'?'提交第一个Bug':'Submit First Bug')+'</button></div>';
    return;
  }
  c.innerHTML=bugs.map(function(b){
    return '<div class="bug-item">'+
      '<div class="bug-head"><span class="bug-id">W-'+b.id+'</span><span class="bug-status st-'+b.status+'">'+statusText(b.status)+'</span></div>'+
      '<div class="bug-title">'+esc(b.title)+'</div>'+
      '<div class="bug-meta">'+
        '<span class="bug-sev sev-'+b.severity+'">'+sevText(b.severity)+'</span>'+
        '<span>'+(lang==='zh'?'模块：':'Module: ')+esc(b.module||'-')+'</span>'+
        '<span>'+(lang==='zh'?'提交人：':'By: ')+esc(b.submitter_name)+'</span>'+
        '<span>'+esc(b.created_at)+'</span>'+
      '</div>'+
      '<div class="bug-desc">'+esc(b.description)+'</div>'+
      '<div class="bug-steps">'+(lang==='zh'?'复现步骤：\n':'Steps:\n')+esc(b.steps)+'</div>'+
    '</div>';
  }).join('');
}

function renderAdminList(){
  if(!isAdmin()) return;
  var bugs=getBugs();
  var fs=document.getElementById('admin-filter-status').value;
  if(fs!=='all') bugs=bugs.filter(function(b){return b.status===fs});
  bugs.sort(function(a,b){return a.id-b.id});
  var c=document.getElementById('admin-list-container');
  if(bugs.length===0){
    c.innerHTML='<div class="empty"><div class="empty-icon">---</div><p>'+(lang==='zh'?'没有Bug':'No bugs')+'</p></div>';
    return;
  }
  c.innerHTML=bugs.map(function(b){
    return '<div class="bug-item">'+
      '<div class="bug-head"><span class="bug-id">W-'+b.id+'</span>'+
        '<select class="filter-sel" onchange="changeStatus('+b.id+',this.value)" style="font-size:12px">'+
          '<option value="pending" '+(b.status==='pending'?'selected':'')+'>'+(lang==='zh'?'待修复':'Pending')+'</option>'+
          '<option value="processing" '+(b.status==='processing'?'selected':'')+'>'+(lang==='zh'?'处理中':'Processing')+'</option>'+
          '<option value="resolved" '+(b.status==='resolved'?'selected':'')+'>'+(lang==='zh'?'已修复':'Resolved')+'</option>'+
          '<option value="wontfix" '+(b.status==='wontfix'?'selected':'')+'>'+(lang==='zh'?'不予修复':"Won't Fix")+'</option>'+
          '<option value="feature" '+(b.status==='feature'?'selected':'')+'>'+(lang==='zh'?'特性':'Feature')+'</option>'+
        '</select>'+
      '</div>'+
      '<div class="bug-title">'+esc(b.title)+'</div>'+
      '<div class="bug-meta">'+
        '<span class="bug-sev sev-'+b.severity+'">'+sevText(b.severity)+'</span>'+
        '<span>'+(lang==='zh'?'模块：':'Module: ')+esc(b.module||'-')+'</span>'+
        '<span>'+(lang==='zh'?'提交人：':'By: ')+esc(b.submitter_name)+'</span>'+
        '<span>'+esc(b.created_at)+'</span>'+
      '</div>'+
      (b.submitter_email?'<div class="bug-email">'+(lang==='zh'?'邮箱：':'Email: ')+esc(b.submitter_email)+'</div>':'')+
      '<div class="bug-desc">'+esc(b.description)+'</div>'+
      '<div class="bug-steps">'+(lang==='zh'?'复现步骤：\n':'Steps:\n')+esc(b.steps)+'</div>'+
      '<div class="bug-actions">'+
        '<button class="btn btn-danger btn-small" onclick="deleteBug('+b.id+')">'+(lang==='zh'?'删除':'Delete')+'</button>'+
      '</div>'+
    '</div>';
  }).join('');
}

function changeStatus(id, status){
  var bugs=getBugs();
  for(var i=0;i<bugs.length;i++){
    if(bugs[i].id===id){ bugs[i].status=status; break; }
  }
  saveBugs(bugs);
  updateAdminStats();
  updateStats();
}

function deleteBug(id){
  if(!confirm(lang==='zh'?'确定要删除这个Bug吗？此操作不可恢复。':'Delete this bug? This cannot be undone.')) return;
  var bugs=getBugs().filter(function(b){return b.id!==id});
  saveBugs(bugs);
  renderAdminList();
  updateAdminStats();
  updateStats();
}

function openAdmin(){
  if(isAdmin()){ showPage('admin'); }
  else{ openLogin(); }
}

function openLogin(){
  document.getElementById('login-modal').classList.add('show');
  document.getElementById('admin-key-input').value='';
  document.getElementById('login-error').style.display='none';
  setTimeout(function(){document.getElementById('admin-key-input').focus()},100);
}

function closeLogin(){
  document.getElementById('login-modal').classList.remove('show');
}

function doLogin(){
  var key=document.getElementById('admin-key-input').value;
  if(key===ADMIN_KEY){
    sessionStorage.setItem('admin_logged_in','1');
    closeLogin();
    showPage('admin');
  }else{
    document.getElementById('login-error').style.display='block';
  }
}

function logout(){
  sessionStorage.removeItem('admin_logged_in');
  showPage('home');
}

function esc(s){
  var d=document.createElement('div');
  d.textContent=s||'';
  return d.innerHTML;
}

// 点击弹窗外部关闭
document.getElementById('login-modal').addEventListener('click',function(e){
  if(e.target===this) closeLogin();
});

updateStats();
