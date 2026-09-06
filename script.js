// Supabase配置
const SUPABASE_URL = 'https://fmumxkriynocaalyrmjc.supabase.co/rest/v1';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtdW14a3JpeW5vY2FhbHlybWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1Mjk4NjYsImV4cCI6MjEwNDEwNTg2Nn0.1LJ5U7Rzh4JeCKkPhN9SunS7e2o4-XDMF-ayUd4OymE';

var lang = 'zh';
var selectedSev = 'minor';
var ADMIN_KEY = 'yztgfchsuai';

// 通用请求头
function getHeaders(){
  return {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json'
  };
}

// 从Supabase获取所有Bug
async function getBugs(){
  try{
    const res = await fetch(SUPABASE_URL + '/bug?select=*&order=id.asc', {
      method: 'GET',
      headers: getHeaders()
    });
    if(!res.ok){
      console.error('获取Bug失败:', res.status, res.statusText);
      return [];
    }
    const data = await res.json();
    return data || [];
  }catch(e){
    console.error('获取Bug异常:', e);
    return [];
  }
}

// 获取下一个编号
async function getNextId(){
  const bugs = await getBugs();
  return bugs.length + 1;
}

function isAdmin(){ return sessionStorage.getItem('admin_logged_in')==='1'; }

async function showPage(p){
  if(p==='admin' && !isAdmin()){ openLogin(); return; }
  document.querySelectorAll('.page').forEach(function(el){el.classList.remove('active')});
  document.getElementById('page-'+p).classList.add('active');
  document.querySelectorAll('.nav a[data-page]').forEach(function(el){
    el.classList.toggle('active', el.getAttribute('data-page')===p);
  });
  if(p==='list') await renderList();
  if(p==='home') await updateStats();
  if(p==='admin'){ await updateAdminStats(); await renderAdminList(); }
  if(p==='submit'){
    var nextId = await getNextId();
    document.getElementById('next-id-display').textContent='W-'+nextId;
  }
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
  updateFormBySeverity();
}

function updateFormBySeverity(){
  var isImprovement = selectedSev === 'improvement';
  var fieldModule = document.getElementById('field-module');
  var fieldDesc = document.getElementById('field-desc');
  var labelSteps = document.getElementById('label-steps');
  var inputSteps = document.getElementById('f-steps');
  var inputDesc = document.getElementById('f-desc');

  if(isImprovement){
    fieldModule.style.display = 'none';
    fieldDesc.style.display = 'none';
    labelSteps.setAttribute('data-zh', '改进建议');
    labelSteps.setAttribute('data-en', 'Improvement Suggestion');
    labelSteps.childNodes[0].nodeValue = lang==='zh' ? '改进建议 ' : 'Improvement Suggestion ';
    inputSteps.placeholder = lang==='zh' ? '请详细描述您的改进建议...' : 'Please describe your improvement suggestion...';
    inputDesc.removeAttribute('required');
  }else{
    fieldModule.style.display = '';
    fieldDesc.style.display = '';
    labelSteps.setAttribute('data-zh', '复现步骤');
    labelSteps.setAttribute('data-en', 'Steps to Reproduce');
    labelSteps.childNodes[0].nodeValue = lang==='zh' ? '复现步骤 ' : 'Steps to Reproduce ';
    inputSteps.placeholder = '1. 第一步...\n2. 第二步...\n3. ...';
    inputDesc.setAttribute('required', 'required');
  }
}

async function submitBug(e){
  e.preventDefault();
  var bugData = {
    title: document.getElementById('f-title').value,
    severity: selectedSev,
    module: document.getElementById('f-module').value,
    description: document.getElementById('f-desc').value,
    steps: document.getElementById('f-steps').value,
    submitter_name: document.getElementById('f-name').value,
    submitter_email: document.getElementById('f-email').value,
    status: 'pending'
  };

  try{
    const res = await fetch(SUPABASE_URL + '/bug', {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(bugData)
    });
    if(!res.ok){
      const errText = await res.text();
      alert('提交失败：' + res.status + ' ' + res.statusText + '\n' + errText);
      return false;
    }
    const data = await res.json();
    var newId = data[0].id;
    document.getElementById('new-bug-id').textContent = 'W-'+newId;
    document.getElementById('form-area').style.display='none';
    document.getElementById('success-box').style.display='block';
    await updateStats();
  }catch(e){
    alert('提交异常：' + e.message);
  }
  return false;
}

async function resetForm(){
  document.getElementById('bug-form').reset();
  selectedSev='minor';
  document.querySelectorAll('.sev-opt').forEach(function(o){o.classList.remove('sel')});
  document.querySelector('.sev-minor').classList.add('sel');
  document.getElementById('form-area').style.display='block';
  document.getElementById('success-box').style.display='none';
  var nextId = await getNextId();
  document.getElementById('next-id-display').textContent='W-'+nextId;
  updateFormBySeverity();
}

async function updateStats(){
  var bugs = await getBugs();
  document.getElementById('stat-total').textContent=bugs.length;
  document.getElementById('stat-processing').textContent=bugs.filter(function(b){return b.status==='processing'}).length;
  document.getElementById('stat-resolved').textContent=bugs.filter(function(b){return b.status==='resolved'}).length;
  await renderHomeBugList();
}

async function renderHomeBugList(){
  var bugs = await getBugs();
  bugs = bugs.sort(function(a,b){return b.id-a.id}).slice(0,5);
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
        '<span>'+formatDate(b.created_at)+'</span>'+
      '</div>'+
    '</div>';
  }).join('');
}

async function updateAdminStats(){
  var bugs = await getBugs();
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

function formatDate(dateStr){
  if(!dateStr) return '';
  try{
    var d = new Date(dateStr);
    return d.toLocaleString('zh-CN');
  }catch(e){ return dateStr; }
}

async function renderList(){
  var bugs = await getBugs();
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
        '<span>'+formatDate(b.created_at)+'</span>'+
      '</div>'+
      '<div class="bug-desc">'+esc(b.description)+'</div>'+
      '<div class="bug-steps">'+(lang==='zh'?'复现步骤：\n':'Steps:\n')+esc(b.steps)+'</div>'+
    '</div>';
  }).join('');
}

async function renderAdminList(){
  if(!isAdmin()) return;
  var bugs = await getBugs();
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
        '<span>'+formatDate(b.created_at)+'</span>'+
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

async function changeStatus(id, status){
  try{
    const res = await fetch(SUPABASE_URL + '/bug?id=eq.' + id, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status: status })
    });
    if(!res.ok){
      alert('更新失败：' + res.status + ' ' + res.statusText);
      return;
    }
    await updateAdminStats();
    await updateStats();
  }catch(e){
    alert('更新异常：' + e.message);
  }
}

async function deleteBug(id){
  if(!confirm(lang==='zh'?'确定要删除这个Bug吗？此操作不可恢复。':'Delete this bug? This cannot be undone.')) return;
  try{
    const res = await fetch(SUPABASE_URL + '/bug?id=eq.' + id, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if(!res.ok){
      alert('删除失败：' + res.status + ' ' + res.statusText);
      return;
    }
    await renderAdminList();
    await updateAdminStats();
    await updateStats();
  }catch(e){
    alert('删除异常：' + e.message);
  }
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

// 页面初始化
updateStats();
updateFormBySeverity();
