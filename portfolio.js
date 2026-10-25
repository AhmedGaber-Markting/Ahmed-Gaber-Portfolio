'use strict';
(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const e = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl = u => {
    if (!u) return '#';
    const s = String(u).trim();
    if (/^(?:https?:\/\/|\/|\.\/|assets\/|mailto:|tel:)/i.test(s)) return e(s);
    return '#';
  };
  const n = (value, digits=0) => Number(value || 0).toLocaleString('en-US',{minimumFractionDigits:digits,maximumFractionDigits:digits});
  let data;
  let socialFilter='all', socialAll=false;
  const state = {lang:'ar',work:'all',workAll:false,video:'all',videoAll:false,plansAll:false,evidence:'meta',evidenceAll:false,account:'vex'};
  try { if(localStorage.getItem('ahmed-gaber-lang')==='en') state.lang='en'; } catch {}
  const tr = (ar,en) => state.lang==='ar' ? ar : en;
  const loc = obj => typeof obj==='string' ? obj : (obj?.[state.lang] || obj?.ar || obj?.en || '');
  const en = {
    downloadPortfolio:'Download portfolio PDF',skip:'Skip to content',navSocial:'Social design',navWork:"My work",navLandingPages:'Landing pages',navReports:'Campaign results',navMarkets:'Markets',navServices:"Services",navAbout:"About Ahmed",navFaq:'FAQ',talk:'Let’s talk',hero1:"Ahmed Gaber",hero2:"Media buyer<br>AI creative specialist",heroDesc:"I connect business understanding, paid media and AI creative production. My work brings strategy, testing and analysis together to move each idea toward a clear business objective",explore:"Explore my work",seeResults:'See the results',markets:"Assiut, Egypt · Projects across Egypt & the Gulf",heroBottom:'An idea starts it. Testing makes the difference',brandsLabel:'Work across different industries',clientsTitle:"Clients and projects along the way",clientsDesc:"Experience built with brands and projects across Egypt and the Gulf",workTitle:'Every project has its own story',workDesc:"Work I have helped plan, manage or produce, alongside project teams as each brief required. Spanning property, professional services, education, food and ecommerce",allWork:'Show all projects',reportsTitle:'The numbers behind the work',reportsDesc:'Separate reports for Vex Agency 1, Vex Agency 2 and Vex Agency 3, with spend, leads, conversations and campaign detail',snapshot:'Verified data snapshot',period:'1 April — 22 October 2026',accountReport:'AD ACCOUNT REPORT',export:'Download campaign CSV',monthlyTitle:'Monthly performance',spend:'Ad spend',impressions:'Impressions',leads:'Leads',messages:'Conversation starts',clicks:'All clicks',octoberPartial:'October covers 1–22 October only. Zero values are shown as supplied by the source',numbersContext:'Every metric has a meaning',reportMeaning:'Leads and conversation starts are separate events and may overlap. They are not sales or a count of unique customers',messageDefinition:'A conversation start follows at least seven days of inactivity, as defined by Meta',monthlyTable:'View the monthly numbers',campaignsTitle:'Campaign details',compare:'Three accounts. One clear view',samePeriod:'Same period and currency',sourceNote:'Source: Meta Ads via Windsor.ai, extracted 23 October 2026. This is a fixed snapshot with no automatic refresh. Historical examples below retain their original periods and definitions',platformTitle:'Results across platforms',platformSubtitle:'Verified performance across Meta, Google, Snapchat and TikTok',allEvidence:'Show every platform sample',servicesTitle:"How I can help<br>your next project",servicesDesc:"I shape the scope around your business, audience and objective, connecting strategy, creative work, paid media and the landing-page experience",videoTitle:'Ideas worth watching',videoDesc:'Product ads, service reels and motion graphics. Open any video to watch the complete sample with sound',allVideos:'Show all videos',plansTitle:'Before the ad, there’s a plan',plansDesc:'Content calendars, strategies and scripts from actual working files. Browse the original-page previews and read the full detail on the site',allPlans:'Show all plans',planNote:'Examples of previous planning work. Offers and prices inside the files belong to the context in which they were prepared',aboutTitle:"Focused on performance<br>Attentive to the creative",aboutDesc:"I’m Ahmed Gaber, a media buyer and AI creative specialist working on projects in Egypt and the Gulf. My experience spans property, professional services, education and ecommerce. I connect market understanding, messaging, creative production and campaign management, using the results to inform the next step",profile:"Explore my experience on LinkedIn",contactTitle:"Your next project<br>Let’s give it direction",contactDesc:"Tell me about your business and the outcome you want. We can discuss the scope and the next step for your project",whatsapp:'Start a WhatsApp conversation',whatsappFloating:'Chat on WhatsApp',yourName:'Your name',business:'Business name',need:'What do you need?',fullService:'Full-service marketing',paidMedia:'Paid media management',creativeProduction:'Creative & video production',strategy:'Strategy & content',website:'Website or landing page',projectBrief:'Tell me about the project',sendBrief:'Prepare your WhatsApp inquiry',formNote:'Opens WhatsApp with a message ready for you to review and send',rights:'All rights reserved',top:'Back to top ↑',loadError:'The portfolio could not load. Please refresh the page',sharePortfolio:'Share portfolio',viewLinkedinCV:'Executive CV (LinkedIn) ↗',
    sysOnline:'SYSTEM ONLINE · READY TO SCALE',
    landingTitle:'High-converting landing pages for brands',landingDesc:'Custom advertising landing pages engineered to convert every paid click into a verified sale or lead, eliminating friction and maximizing ROAS',
    marketsTitle:'Markets & regions I operate in',marketsDesc:'Cross-border execution across Egypt and the Gulf with deep understanding of localized buyer psychology and high-converting channels',
    pipelineTitle:'The growth pipeline',pipelineDesc:'From deep research to compound scale: how ideas turn into measurable market momentum',
    faqTitle:'Frequently asked questions',faqDesc:'Everything brand owners ask about media buying, CRO landing pages, and AI-driven scale',
    previewFull:'Inspect full design ↗',requestSimilarLp:'Request similar page ↗',seeTheWall:'Explore market work →'
  };
  $$('[data-t]').forEach(el => el.dataset.ar=el.innerHTML);
  const labels={spend:()=>tr('الإنفاق الإعلاني','Ad spend'),impressions:()=>tr('مرات الظهور','Impressions'),clicks:()=>tr('جميع النقرات','All clicks'),actions_lead:()=>tr('عملاء محتملون','Leads'),actions_onsite_conversion_messaging_conversation_started_7d:()=>tr('بدايات المحادثات','Conversation starts')};
  const fields=Object.keys(labels);
  const month = value => new Intl.DateTimeFormat(state.lang==='ar'?'ar-EG':'en-GB',{month:'short',timeZone:'UTC'}).format(new Date(value+'-01T00:00:00Z'));
  const countCopy = (shown,total,ar,en) => tr(`عرض ${n(shown)} من ${n(total)} ${ar}`,`Showing ${n(shown)} of ${n(total)} ${en}`);
  const toggleLabel=(all,ar,en)=>all?tr('عرض أقل','Show less'):tr(ar,en);

  function renderFilters(id,items,selected,callback){
    $(id).innerHTML=items.map(([key,ar,en])=>`<button type="button" class="${key===selected?'active':''}" aria-pressed="${key===selected}" data-filter="${e(key)}">${e(tr(ar,en))}</button>`).join('');
    $$('button',$(id)).forEach(btn=>btn.addEventListener('click',()=>callback(btn.dataset.filter)));
  }
  function renderWork(){
    const filters=[['all','الكل','All work'],['creative','الإنتاج والتصميم','Creative & design'],['video','فيديوهات AI','AI video'],['performance','الحملات والنتائج','Paid media'],['content','المحتوى والخطط','Content & strategy'],['web','المواقع','Websites']];
    renderFilters('#work-filters',filters,state.work,key=>{state.work=key;state.workAll=false;renderWork();});
    const projects=Object.values(data.projects).filter(p=>state.work==='all'||p.filters.includes(state.work));
    const shown=state.workAll?projects:projects.slice(0,9);
    $('#work-grid').innerHTML=shown.map(p=>`<button class="project-card" type="button" data-project="${e(p.id)}" aria-label="${e(tr('استعرض مشروع ','Explore ')+loc(p.title))}"><div class="project-image ${p.filters.every(f=>f==='performance'||f==='content')?'contain':''}"><span class="project-index">${String(Object.keys(data.projects).indexOf(p.id)+1).padStart(2,'0')} / AG</span><img src="${e(p.thumbnail)}" alt="${e(loc(p.title))}" loading="lazy" width="600" height="480"><span class="project-arrow" aria-hidden="true">↗</span></div><div class="project-info"><div><h3>${e(loc(p.title))}</h3><p class="project-category">${e(loc(p.category))}</p></div><span class="project-tag" dir="ltr">${e(p.tags?.[0]||'CREATIVE WORK')}</span></div></button>`).join('');
    $$('[data-project]',$('#work-grid')).forEach(btn=>btn.addEventListener('click',()=>openProject(btn.dataset.project)));
    $('#work-count').textContent=countCopy(shown.length,projects.length,'مشروعًا','projects');
    $('#work-more').hidden=projects.length<=9;
    $('#work-more').firstElementChild.textContent=toggleLabel(state.workAll,'عرض كل الأعمال','Show all projects');
  }
  function selectedAccount(){return data.reports.accounts.find(a=>a.id===state.account);}
  function table(head, rows){return `<table><thead><tr>${head.map(x=>`<th scope="col">${e(x)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>`;}
  function tableRow(label, values){return `<tr><td>${e(label)}</td>${values.map((v,i)=>`<td class="num">${n(v,i===0?2:0)}</td>`).join('')}</tr>`;}
  function renderReport(){
    const a=selectedAccount(),t=a.totals;
    $('#account-tabs').innerHTML=data.reports.accounts.map(acc=>`<button id="tab-${acc.id}" class="account-tab ${acc.id===a.id?'active':''}" type="button" role="tab" aria-selected="${acc.id===a.id}" aria-controls="report-panel" tabindex="${acc.id===a.id?0:-1}" data-account="${acc.id}"><strong dir="ltr">${e(acc.name)}</strong><small dir="ltr">${n(acc.totals.spend,2)} EGP</small></button>`).join('');
    $$('[data-account]').forEach(btn=>{
      btn.addEventListener('click',()=>{state.account=btn.dataset.account;$('#campaign-search').value='';renderReport();$(`#tab-${state.account}`).focus({preventScroll:true});});
      btn.addEventListener('keydown',evt=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(evt.key))return;evt.preventDefault();const keys=data.reports.accounts.map(x=>x.id),idx=keys.indexOf(state.account);state.account=evt.key==='Home'?keys[0]:evt.key==='End'?keys.at(-1):keys[(idx+(evt.key==='ArrowRight'?1:-1)+keys.length)%keys.length];renderReport();$(`#tab-${state.account}`).focus({preventScroll:true});});
    });
    $('#report-panel').setAttribute('aria-labelledby','tab-'+a.id);
    $('#account-name').textContent=a.name;
    $('#report-kpis').innerHTML=fields.map((f,i)=>`<div class="kpi"><span class="kpi-label">${e(labels[f]())}</span><strong dir="ltr">${n(t[f],f==='spend'?2:0)}</strong><small>${i===0?'EGP':f==='actions_lead'?tr('بحسب حقل Leads في Meta','Meta-reported leads'):f.includes('messaging')?tr('بعد 7 أيام خمول','After 7 days of inactivity'):f==='clicks'?'All Clicks':tr('إجمالي الفترة','Period total')}</small></div>`).join('');
    const ratios=[['CTR · '+tr('جميع النقرات','All clicks'),t.impressions? n(t.clicks/t.impressions*100,2)+'%':'—'],['CPC · '+tr('تكلفة النقرة','Cost per click'),t.clicks?n(t.spend/t.clicks,2)+' EGP':'—'],['CPM · '+tr('تكلفة الألف ظهور','Cost per 1,000 impressions'),t.impressions?n(t.spend/t.impressions*1000,2)+' EGP':'—']];
    $('#report-ratios').innerHTML=ratios.map(([k,v])=>`<div class="ratio"><span>${e(k)}</span><strong dir="ltr">${e(v)}</strong></div>`).join('');
    renderChart();
    $('#monthly-table').innerHTML=table([tr('الشهر','Month'),...fields.map(f=>labels[f]())],a.monthly.map(x=>tableRow(month(x.month)+(x.month.endsWith('10')?tr(' (حتى 22)',' (to 22)'):''),fields.map(f=>x[f]))));
    renderCampaigns();
    $('#account-comparison').innerHTML=table([tr('الحساب','Account'),...fields.map(f=>labels[f]())],data.reports.accounts.map(acc=>tableRow(acc.name,fields.map(f=>acc.totals[f]))));
  }
  function renderChart(){
    const a=selectedAccount(),f=$('#chart-metric').value,max=Math.max(1,...a.monthly.map(m=>m[f]));
    $('#monthly-chart').setAttribute('aria-label',labels[f]()+' — '+a.name);
    $('#monthly-chart').innerHTML=a.monthly.map(m=>`<div class="bar-column" title="${e(month(m.month)+': '+n(m[f],f==='spend'?2:0))}"><span class="bar-value" dir="ltr">${n(m[f],f==='spend'?0:0)}</span><div class="bar" style="height:${Math.max(m[f]>0?3:0,m[f]/max*170)}px" aria-hidden="true"></div><span class="bar-label">${e(month(m.month))}</span></div>`).join('');
  }
  function renderCampaigns(){
    const a=selectedAccount(),term=$('#campaign-search').value.trim().toLocaleLowerCase();
    const rows=a.campaigns.filter(r=>r.campaign.toLocaleLowerCase().includes(term));
    $('#campaign-table').innerHTML=rows.length?table([tr('الحملة','Campaign'),...fields.map(f=>labels[f]())],rows.map(r=>tableRow(r.campaign,fields.map(f=>r[f])))):`<p class="empty">${tr('لا توجد حملات تطابق البحث','No campaigns match your search')}</p>`;
    let note=tr(`${n(rows.length)} من ${n(a.campaigns.length)} حملة — أسماء الحملات وتعريفات النتائج كما وردت من المصدر`,`${n(rows.length)} of ${n(a.campaigns.length)} campaigns. Names and metric definitions are retained from the source`);
    if(a.id==='vex')note+=' '+tr('توجد فروق بين استعلام تفاصيل الحملات وإجمالي الحساب مقدارها 0.11 ج.م و5 مرات ظهور؛ اعتمدنا إجمالي الحساب في الملخص', 'The campaign query differs from the account query by EGP 0.11 and 5 impressions; the account summary is the reference');
    $('#campaign-note').textContent=note;
  }
  function exportCSV(){
    const a=selectedAccount();
    const quote=v=>'"'+String(v??'').replace(/^[=+@-]/,"'$&").replace(/"/g,'""')+'"';
    const rows=[['Account','Period','Currency'],[a.name,data.reports.from+' to '+data.reports.to,'EGP'],[],['Campaign',...fields],...a.campaigns.map(r=>[r.campaign,...fields.map(f=>r[f])]),[],['ACCOUNT TOTAL',...fields.map(f=>a.totals[f])],['Note','Account totals come from a separate snapshot; leads and conversation starts may overlap.']];
    const blob=new Blob(['\uFEFF'+rows.map(r=>r.map(quote).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`Ahmed_Gaber_${a.name.replace(/\s+/g,'_')}_2026-04-01_2026-10-22.csv`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  function allEvidence(){
    return [...data.results.map(r=>({...r,platform:'meta',image:r.src,metrics:[{value:n(r.value),label:r.metric},...(r.cost!=null?[{value:n(r.cost,2)+' '+r.currency,label:{ar:'تكلفة النتيجة',en:'Cost per result'}}]:[]),...(r.extra||[])],note:r.context})),...data.platformResults.map(r=>({...r,image:r.images[0].src}))];
  }
  function periodText(r){return r.period?.length?`${r.period[0]} → ${r.period[1]}`:tr('الفترة الكاملة غير ظاهرة في المصدر','Complete period not visible in the source');}
  const platformBadges = {
    meta: { label: 'Meta Ads', class: 'badge-meta' },
    google: { label: 'Google Ads', class: 'badge-google' },
    snapchat: { label: 'Snapchat', class: 'badge-snapchat' },
    tiktok: { label: 'TikTok', class: 'badge-tiktok' }
  };
  function renderEvidence(){
    renderFilters('#evidence-filters',[['meta','Meta Ads','Meta Ads'],['google','Google Ads','Google Ads'],['snapchat','Snapchat','Snapchat'],['tiktok','TikTok','TikTok']],state.evidence,key=>{state.evidence=key;state.evidenceAll=false;renderEvidence();});
    const rows=allEvidence().filter(r=>r.platform===state.evidence),shown=state.evidenceAll?rows:rows.slice(0,3);
    $('#evidence-grid').innerHTML=shown.map(r=>{
      const pInfo = platformBadges[r.platform] || { label: r.platform.toUpperCase(), class: 'badge-default' };
      const secMetric = r.metrics[1] ? `<div class="proof-sec-metric"><span dir="ltr">${e(r.metrics[1].value)}</span><small>${e(loc(r.metrics[1].label))}</small></div>` : '';
      return `
        <article class="evidence-card reveal" data-proof="${e(r.id)}" role="button" tabindex="0" aria-label="${e(tr('استعراض نتيجة ','View proof: ')+loc(r.title))}">
          <div class="evidence-thumb-frame">
            <img src="${e(r.image)}" alt="${e(loc(r.title))}" width="600" height="320" loading="lazy">
            <span class="evidence-platform-tag ${pInfo.class}"><span class="tag-dot"></span>${pInfo.label}</span>
            <span class="evidence-zoom-hint">${tr('معاينة التقرير ↗','Inspect ↗')}</span>
          </div>
          <div class="evidence-copy">
            <h4 class="evidence-title">${e(loc(r.title))}</h4>
            <div class="evidence-kpis">
              <div class="proof-metric">
                <strong dir="ltr">${e(r.metrics[0].value)}</strong>
                <span>${e(loc(r.metrics[0].label))}</span>
              </div>
              ${secMetric}
            </div>
            <div class="evidence-period">
              <span class="p-clock" aria-hidden="true">⏱</span>
              <span>${e(periodText(r))}</span>
            </div>
          </div>
        </article>
      `;
    }).join('');
    $$('[data-proof]',$('#evidence-grid')).forEach(btn=>{
      btn.addEventListener('click',()=>openEvidence(btn.dataset.proof));
      btn.addEventListener('keydown',evt=>{if(evt.key==='Enter'||evt.key===' '){evt.preventDefault();openEvidence(btn.dataset.proof);}});
    });
    $('#evidence-more').hidden=rows.length<=3;
    $('#evidence-more').firstElementChild.textContent=toggleLabel(state.evidenceAll,'عرض كل عينات المنصة','Show every platform sample');
  }
  function renderVideos(){
    renderFilters('#video-filters',[['all','كل الفيديوهات','All videos'],['engineering','قلاع الهندسة','Qelaa Engineering'],['telecom','الاتصالات','Telecom'],['doctor','دكتور بلس','Doctor Plus'],['other','المنتجات والعقارات','Products & property']],state.video,key=>{state.video=key;state.videoAll=false;renderVideos();});
    const rows=data.videoSamples.filter(v=>state.video==='all'||(state.video==='telecom'?v.sector==='telecom':state.video==='other'?['loop','qelaa'].includes(v.project):v.project===state.video));
    const shown=state.videoAll?rows:rows.slice(0,5);
    $('#video-grid').innerHTML=shown.map(v=>`<button type="button" class="video-card" data-video="${e(v.id)}" aria-label="${e(tr('شاهد ','Watch ')+loc(v.title))}"><div class="video-poster"><img src="${e(v.poster)}" alt="${e(loc(v.title))}" width="360" height="560" loading="lazy"><span class="play" aria-hidden="true">▶</span><span class="duration" dir="ltr">${Math.floor(v.duration/60)}:${String(Math.floor(v.duration%60)).padStart(2,'0')}</span></div><h3>${e(loc(v.title))}</h3><p>AI CREATIVE / AG</p></button>`).join('');
    $$('[data-video]',$('#video-grid')).forEach(btn=>btn.addEventListener('click',()=>openVideo(btn.dataset.video)));
    $('#video-count').textContent=countCopy(shown.length,rows.length,'فيديو','videos');
    $('#video-more').hidden=rows.length<=5;
    $('#video-more').firstElementChild.textContent=toggleLabel(state.videoAll,'عرض كل الفيديوهات','Show all videos');
  }
  function renderPlans(){
    const shown=state.plansAll?data.documents:data.documents.slice(0,4);
    $('#plan-grid').innerHTML=shown.map(doc=>`<button type="button" class="plan-card" data-doc="${e(doc.id)}"><div class="plan-preview ${doc.previewLayout==='landscape'?'landscape':''}"><img src="${e(doc.coverPreview||doc.previews?.[0]||'assets/brand/ahmed-mark.png')}" alt="${e(loc(doc.title))}" loading="lazy" width="500" height="700"><span class="file-badge" dir="ltr">${e(doc.format)} / ${doc.pages||'PLAN'}</span></div><h3>${e(loc(doc.title))}</h3><p>${e(doc.brand||'CONTENT STRATEGY')} · ${tr('معاينة الملف','Open the preview')} ↗</p></button>`).join('');
    $$('[data-doc]',$('#plan-grid')).forEach(btn=>btn.addEventListener('click',()=>openPlan(btn.dataset.doc)));
    $('#plan-count').textContent=countCopy(shown.length,data.documents.length,'خطة وملفًا','plans & files');
    $('#plan-more').hidden=data.documents.length<=4;
    $('#plan-more').firstElementChild.textContent=toggleLabel(state.plansAll,'عرض كل الخطط','Show all plans');
  }
  function renderSocial(){
    const root=$('#social-content');
    if(!root)return;
    const samples=data.socialSamples||[];
    root.innerHTML=`<div class="section-top"><div><p class="eyebrow" dir="ltr">SOCIAL CONTENT / SELECTED PROJECTS</p><h2>${tr('تصاميم منشورة وشغل يتشاف','Published creative — work you can see')}</h2></div><p class="section-description">${tr('عينات منشورة من تصاميم ومحتوى المشاريع التي عملت عليها مع فرق العمل، افتح التصميم لمشاهدته كاملًا وقراءة نص المنشور والوصول إلى أصله','Published visuals and content from projects I worked on with creative teams. Open a design to see it in full, read its caption and visit the source')}</p></div><div id="social-filters" class="filter-row" aria-label="${tr('تصنيف عينات السوشيال','Filter social samples')}"></div><div id="social-grid" class="social-grid"></div><div class="more-row"><p id="social-count"></p><button id="social-more" type="button" class="text-link"><span>${toggleLabel(socialAll,'عرض كل التصاميم','Show all designs')}</span><span aria-hidden="true">↓</span></button></div><div class="social-pages"><span>${tr('صفحات العملاء','Client pages')}</span>${(data.socialPages||[]).map(page=>`<a href="${safeUrl(page.url)}" target="_blank" rel="noopener noreferrer">${e(loc(page.name))} ↗</a>`).join('')}</div><p class="small-note">${tr('العينات معروضة كأعمال سابقة؛ العروض والأسعار داخل التصاميم تخص وقت نشرها','These are portfolio samples. Offers and prices within the creative belong to its original publication context')}</p>`;
    renderFilters('#social-filters',[['all','الكل','All designs'],['qelaa','قلاع للتطوير العقاري','Qelaa Developments'],['boulevard','بوليفارد','Boulevard'],['gizawy','الجيزاوي','El Gezawy'],['doctor','دكتور بلس','Doctor Plus']],socialFilter,key=>{socialFilter=key;socialAll=false;renderSocial();});
    const filtered=samples.filter(sample=>socialFilter==='all'||sample.project===socialFilter);
    const shown=socialAll?filtered:filtered.slice(0,8);
    $('#social-grid').innerHTML=shown.map(sample=>`<button class="social-card" type="button" data-social="${e(sample.id)}" aria-label="${e(tr('اعرض تصميم ','View design: ')+loc(sample.title))}"><div class="social-image"><img src="${e(sample.src)}" alt="${e(loc(sample.title))}" width="720" height="900" loading="lazy"><span class="project-arrow" aria-hidden="true">↗</span></div><div class="social-card-copy"><span>${e(loc(sample.brand))}</span><h3>${e(loc(sample.title))}</h3><small>${tr('التصميم + نص المنشور','Creative + caption')} ↗</small></div></button>`).join('');
    $$('[data-social]',$('#social-grid')).forEach(btn=>btn.addEventListener('click',()=>openSocial(btn.dataset.social)));
    $('#social-count').textContent=countCopy(shown.length,filtered.length,'تصميمًا أصليًا','original designs');
    $('#social-more').hidden=filtered.length<=8;
    $('#social-more').addEventListener('click',()=>{socialAll=!socialAll;renderSocial();});
  }
  function openSocial(id){
    const sample=(data.socialSamples||[]).find(x=>x.id===id);if(!sample)return;
    showViewer(loc(sample.title),loc(sample.brand)+' / SOCIAL CREATIVE',`<div id="viewer-media"></div><div class="social-source-actions"><a class="source-link" href="${safeUrl(sample.postUrl)}" target="_blank" rel="noopener noreferrer">${tr('المنشور الأصلي على فيسبوك','Original Facebook post')} ↗</a><a class="source-link" href="${safeUrl(sample.pageUrl)}" target="_blank" rel="noopener noreferrer">${tr('صفحة العميل','Client page')} ↗</a></div><h3 class="caption-heading">${tr('نص المنشور','Original caption')}</h3><p class="original-caption" dir="auto">${e(sample.caption)}</p>`);
    setupMedia([{type:'image',src:sample.src,alt:sample.title}]);
  }
  function renderServices(){
    const items=[['STRATEGY & CONTENT','الاستراتيجية والمحتوى','Strategy & content','دراسة الجمهور والمنافسين، بناء الرسائل وخطط المحتوى وكتابة السيناريوهات','Audience and competitor research, messaging, content calendars and scripts'],['AI CREATIVE PRODUCTION','الإنتاج الإبداعي بالـAI','AI creative production','ريلز وإعلانات منتجات وموشن جرافيك، مع مراجعة الهوية والنصوص وتفاصيل المنتج','Reels, product ads and motion graphics, with attention to identity, copy and product detail'],['PERFORMANCE MARKETING','إدارة الحملات الإعلانية','Performance marketing','Meta وGoogle وTikTok وSnapchat، من الإعداد واختبار الكرياتيف إلى التحليل والتطوير','Meta, Google, TikTok and Snapchat: setup, creative testing, analysis and optimization'],['VISUAL DESIGN','التصميم والهوية البصرية','Visual design','تصاميم حملات وسوشيال ميديا، وتطبيقات هوية متسقة عبر المقاسات والمنصات','Campaign and social visuals with a consistent identity across formats and platforms'],['SOCIAL MEDIA','إدارة الحضور الرقمي','Social media','تنظيم النشر والمحتوى، تطوير زوايا التواصل ومتابعة استجابة الجمهور','Content and publishing plans, messaging angles and audience-response monitoring'],['WEB & CONVERSION','المواقع وصفحات الهبوط','Websites & landing pages','مواقع ومتاجر وصفحات حملات تعرض الخدمة بوضوح وتسهّل التواصل أو الشراء','Websites, storefronts and campaign pages that explain the offer and make the next step clear']];
    $('#service-grid').innerHTML=items.map(([label,ar,en,desc,descEn],i)=>`<article class="service-item"><div class="service-top"><span>${String(i+1).padStart(2,'0')} / ${label}</span><span aria-hidden="true">↗</span></div><h3>${e(tr(ar,en))}</h3><p>${e(tr(desc,descEn))}</p></article>`).join('');
    const steps=[['CREATE','أفهم النشاط والجمهور وأطوّر الفكرة والرسالة','Understand the business and audience; develop the idea and message'],['TEST','أختبر الزوايا والكرياتيف وأقرأ استجابة الجمهور','Test angles and assets, then read the audience response'],['SCALE','أطوّر ما يثبت أداءه وأوسّع الاستثمار تدريجيًا','Refine what performs and expand investment progressively']];
    $('#process').innerHTML=steps.map(([title,ar,en])=>`<div class="process-item"><strong>${title}</strong><span>${e(tr(ar,en))}</span></div>`).join('');
    $('#about-stats').innerHTML=[[data.stats.projects,tr('مشروعًا ودراسة عمل','Projects & case studies')],[data.stats.videos,tr('فيديو في المعرض','Videos in the portfolio')],[data.stats.plans,tr('خطة وملف محتوى','Plans & content files')]].map(([num,label])=>`<div><strong dir="ltr">${num}</strong><span>${e(label)}</span></div>`).join('');
  }

  function renderLandingPages(){
    const root = $('#landing-grid');
    if(!root || !data.landingPages) return;
    root.innerHTML = data.landingPages.map(lp => `
      <article class="landing-card reveal">
        <div class="landing-media" data-landing="${e(lp.id)}" role="button" tabindex="0" aria-label="${e(tr('معاينة صفحة هبوط ','Preview landing page ')+loc(lp.title))}">
          <img src="${e(lp.thumbnail)}" alt="${e(loc(lp.title))}" loading="lazy" width="640" height="360">
          <span class="landing-badge">${e(lp.tags?.[0]||'LANDING PAGE')}</span>
          <span class="landing-flag">${e(lp.flag)}</span>
          <span class="landing-zoom-hint">${tr('انقر للتكبير ↗','Click to expand ↗')}</span>
        </div>
        <div class="landing-content">
          <span class="landing-category">${e(loc(lp.category))}</span>
          <h3 class="landing-title">${e(loc(lp.title))}</h3>
          <p class="landing-objective">${e(loc(lp.objective))}</p>
          <div class="landing-kpis">
            ${(lp.metrics||[]).map(m=>`<div class="landing-kpi"><strong dir="ltr">${e(m.value)}</strong><span>${e(loc(m.label))}</span></div>`).join('')}
          </div>
          <ul class="landing-feature-list">
            ${(lp.features||[]).map(f=>`<li>${e(loc(f))}</li>`).join('')}
          </ul>
          <div class="landing-actions">
            <button type="button" class="landing-btn-preview" data-landing="${e(lp.id)}">${tr('معاينة بدقة كاملة ↗','Inspect full design ↗')}</button>
            <a href="https://wa.me/201020969108?text=${encodeURIComponent(tr('مرحبًا أحمد، أود طلب صفحة هبوط لبراندي مشابهة لـ ','Hello Ahmed, I would like to request a landing page similar to ')+loc(lp.title))}" target="_blank" rel="noopener noreferrer" class="landing-btn-cta">${tr('اطلب صفحة مماثلة ↗','Request similar page ↗')}</a>
          </div>
        </div>
      </article>
    `).join('');
    $$('[data-landing]', root).forEach(el => el.addEventListener('click', () => openLandingPage(el.dataset.landing)));
  }

  function openLandingPage(id){
    const lp = (data.landingPages||[]).find(x => x.id === id);
    if(!lp) return;
    showViewer(
      loc(lp.title),
      loc(lp.category) + ' / CRO LANDING PAGE',
      `<div id="viewer-media"></div>
       <div class="tag-list">${(lp.tags||[]).map(x=>`<span>${e(x)}</span>`).join('')}</div>
       <div class="project-description">
         <div>
           <h3>${tr('الهدف التحويلي','Conversion objective')}</h3>
           <p>${e(loc(lp.objective))}</p>
         </div>
         <div>
           <h3>${tr('أهم عناصر ومحفزات الإقناع (CRO)','Key CRO & persuasion elements')}</h3>
           <ul>${(lp.features||[]).map(f=>`<li>${e(loc(f))}</li>`).join('')}</ul>
         </div>
       </div>
       <section class="related-plans">
         <h3>${tr('مؤشرات الأداء المحققة','Demonstrated performance metrics')}</h3>
         ${chips(lp.metrics)}
       </section>
       <a class="source-link" href="https://wa.me/201020969108?text=${encodeURIComponent(tr('مرحبًا أحمد، أود تصميم صفحة هبوط لبراندي مشابهة لـ ','Hello Ahmed, I would like to build a landing page for my brand like ')+loc(lp.title))}" target="_blank" rel="noopener noreferrer">${tr('طلب صفحة هبوط لبراندك على واتساب','Order your custom landing page via WhatsApp')} ↗</a>`
    );
    setupMedia([{ type: 'image', src: lp.image, alt: lp.title }]);
  }

  function renderMarkets(){
    const root = $('#markets-rows');
    if(!root || !data.marketsData) return;
    root.innerHTML = data.marketsData.map((m, idx) => `
      <div class="market-row-item reveal ${idx % 2 === 1 ? 'reverse' : ''}">
        <div class="market-orbit">
          <div class="orbit-ring-outer">
            <div class="orbit-spin">
              <div class="orbit-item" style="--x:72px;--y:0px"><div class="orbit-logo">GROWTH</div></div>
              <div class="orbit-item" style="--x:36px;--y:62px"><div class="orbit-logo">ADS</div></div>
              <div class="orbit-item" style="--x:-36px;--y:62px"><div class="orbit-logo">CRO</div></div>
              <div class="orbit-item" style="--x:-72px;--y:0px"><div class="orbit-logo">ROAS</div></div>
              <div class="orbit-item" style="--x:-36px;--y:-62px"><div class="orbit-logo">SCALE</div></div>
              <div class="orbit-item" style="--x:36px;--y:-62px"><div class="orbit-logo">LEADS</div></div>
            </div>
          </div>
          <div class="orbit-ring-inner">
            <div class="orbit-spin-rev">
              <div class="orbit-item small" style="--x:36px;--y:0px"><div class="orbit-logo">AI</div></div>
              <div class="orbit-item small" style="--x:-18px;--y:31px"><div class="orbit-logo">ROI</div></div>
              <div class="orbit-item small" style="--x:-18px;--y:-31px"><div class="orbit-logo">META</div></div>
            </div>
          </div>
          <div class="market-orbit-center" aria-label="${e(loc(m.name))}">${e(m.flag)}</div>
        </div>
        <div class="market-info">
          <h3>${e(loc(m.name))}</h3>
          <span class="market-tag">${e(loc(m.tag))}</span>
          <p>${e(loc(m.description))}</p>
          <div class="market-tokens">
            ${(m.tokens||[]).map(t => `<span class="m-token">${e(t)}</span>`).join('')}
          </div>
        </div>
      </div>
    `).join('');
  }

  function renderFaqs(){
    const root = $('#faq-accordion');
    if(!root || !data.faqs) return;
    root.innerHTML = data.faqs.map(f => `
      <details class="faq-item reveal">
        <summary class="faq-question">
          <span>${e(loc(f.q))}</span>
          <span class="faq-chevron" aria-hidden="true">▾</span>
        </summary>
        <div class="faq-answer">
          <p>${e(loc(f.a))}</p>
        </div>
      </details>
    `).join('');
  }


  const viewer=$('#viewer');
  let media=[],mediaIndex=0;
  function showViewer(title,label,html){
    $$('video',viewer).forEach(v=>v.pause());
    $('#viewer-title').textContent=title;
    $('#viewer-label').textContent=label;
    $('#viewer-body').innerHTML=html;
    if(!viewer.open)viewer.showModal();
    viewer.scrollTop=0;document.body.classList.add('modal-open');
  }
  function setupMedia(list){
    media=list;mediaIndex=0;
    $('#viewer-media').innerHTML='<div class="viewer-stage" id="media-stage"></div><div class="media-toolbar"><button type="button" id="media-prev" aria-label="'+tr('السابق','Previous')+'">←</button><span id="media-position"></span><button type="button" id="media-next" aria-label="'+tr('التالي','Next')+'">→</button></div><div class="media-thumbs" id="media-thumbs"></div>';
    $('#media-prev').addEventListener('click',()=>{mediaIndex=(mediaIndex-1+media.length)%media.length;renderMedia();});
    $('#media-next').addEventListener('click',()=>{mediaIndex=(mediaIndex+1)%media.length;renderMedia();});
    renderMedia();
  }
  function renderMedia(){
    if(!media.length)return;
    $$('video',$('#media-stage')).forEach(v=>v.pause());
    const m=media[mediaIndex];
    $('#media-stage').innerHTML=m.type==='video'?`<video controls playsinline preload="metadata" ${m.poster?`poster="${e(m.poster)}"`:''} aria-label="${e(loc(m.alt)||tr('فيديو المشروع','Project video'))}"><source src="${e(m.src)}" type="video/mp4">${tr('متصفحك لا يدعم تشغيل الفيديو','Your browser does not support this video')}</video>`:`<img src="${e(m.src)}" alt="${e(loc(m.alt)||$('#viewer-title').textContent)}">`;
    $('#media-position').textContent=`${mediaIndex+1} / ${media.length}`;
    $('#media-prev').disabled=$('#media-next').disabled=media.length===1;
    $('#media-thumbs').innerHTML=media.map((x,i)=>`<button type="button" class="${i===mediaIndex?'active':''}" data-media="${i}" aria-label="${e(tr('عينة ','Sample ')+(i+1))}" aria-pressed="${i===mediaIndex}"><img src="${e(x.poster||x.src)}" alt="" loading="lazy">${x.type==='video'?'<span aria-hidden="true">▶</span>':''}</button>`).join('');
    $$('[data-media]',$('#media-thumbs')).forEach(btn=>btn.addEventListener('click',()=>{mediaIndex=Number(btn.dataset.media);renderMedia();}));
  }
  const chips = metrics => `<div class="metric-chips">${metrics.map(m=>`<div class="metric-chip"><strong dir="ltr">${e(m.value)}</strong><span>${e(loc(m.label))}</span></div>`).join('')}</div>`;
  function openProject(id){
    const p=data.projects[id];if(!p)return;
    const cases=data.performanceCases.filter(c=>c.project===id);
    const related=data.documents.filter(d=>(p.documents||[]).includes(d.id));
    showViewer(loc(p.title),loc(p.category),`<div id="viewer-media"></div><div class="tag-list">${p.tags.map(x=>`<span>${e(x)}</span>`).join('')}</div><div class="project-description"><div><h3>${tr('فكرة المشروع','The project')}</h3><p>${e(loc(p.scope))}</p></div><div><h3>${tr('نطاق العمل','Scope of work')}</h3><ul>${(loc(p.contribution)||[]).map(x=>`<li>${e(x)}</li>`).join('')}</ul></div></div>${cases.map(c=>`<section class="related-plans"><h3>${e(loc(c.title))}</h3>${chips(c.metrics)}<p class="source-note">${e(loc(c.note))}</p></section>`).join('')}${related.length?`<section class="related-plans"><h3>${tr('خطط مرتبطة بالمشروع','Related plans')}</h3>${related.map(d=>`<button type="button" data-plan="${e(d.id)}">${e(loc(d.title))} ↗</button>`).join('')}</section>`:''}<a class="source-link" href="https://wa.me/201020969108?text=${encodeURIComponent(tr('أرغب في مناقشة مشروع مشابه لـ ','I’d like to discuss a project similar to ')+loc(p.title))}" target="_blank" rel="noopener noreferrer">${tr('نناقش مشروعك؟','Let’s discuss your project')} ↗</a>`);
    setupMedia(p.media);
    if(p.socialPage)$('#viewer-body').insertAdjacentHTML('beforeend',`<a class="source-link" href="${safeUrl(p.socialPage)}" target="_blank" rel="noopener noreferrer">${tr('استعرض أعمال الصفحة','Explore the Facebook page')} ↗</a>`);
    $$('[data-plan]',viewer).forEach(btn=>btn.addEventListener('click',()=>openPlan(btn.dataset.plan)));
  }
  function openVideo(id){const v=data.videoSamples.find(v=>v.id===id);if(!v)return;showViewer(loc(v.title),'AI VIDEO / AG',`<div id="viewer-media"></div><a class="source-link" href="#work" id="related-project">${tr('استعرض المشروع كاملًا','Explore the full project')} ↗</a>`);setupMedia([{type:'video',src:v.src,poster:v.poster,alt:v.title}]);$('#related-project').addEventListener('click',evt=>{evt.preventDefault();openProject(v.project);});}
  function openEvidence(id){
    const r=allEvidence().find(r=>r.id===id);if(!r)return;
    showViewer(loc(r.title),r.platform.toUpperCase()+' / PERFORMANCE EVIDENCE',`<div id="viewer-media"></div>${chips(r.metrics)}<p class="source-note">${e(loc(r.note))}</p><p class="source-note evidence-period" dir="${r.period?.length?'ltr':'auto'}">${e(periodText(r))}</p>`);
    setupMedia((r.images||[{src:r.src}]).map(i=>({type:'image',src:i.src,alt:r.title})));
  }
  function openPlan(id){
    const doc=data.documents.find(d=>d.id===id);if(!doc)return;
    const blocks=(doc.blocks||[]).map(b=>b.type==='heading'?`<h3>${e(b.text)}</h3>`:b.type==='table'?`<div class="table-wrap"><table><tbody>${b.rows.map((row,i)=>`<tr>${row.map(cell=>`<${i?'td':'th'}>${e(cell)}</${i?'td':'th'}>`).join('')}</tr>`).join('')}</tbody></table></div>`:`<p>${e(b.text)}</p>`).join('');
    showViewer(loc(doc.title),`${doc.brand||'CONTENT STRATEGY'} / ${doc.format}`,`<p class="source-note">${e(loc(doc.description))}</p><a class="source-link" href="${safeUrl(doc.viewPdf||doc.src)}" target="_blank" rel="noopener noreferrer">${tr('افتح الملف كاملًا','Open the complete file')} ↗</a> <a class="source-link" href="${safeUrl(doc.src)}" download>${tr('تنزيل الأصل','Download original')} ↙</a><div class="document-pages">${(doc.previews||[]).map((src,i)=>`<img src="${e(src)}" loading="lazy" alt="${e(loc(doc.title)+' — '+tr('صفحة ','page ')+(doc.previewSourcePages?.[i]||i+1))}">`).join('')}</div>${blocks?`<details class="monthly-details"><summary>${tr('قراءة محتوى الخطة بالكامل داخل الموقع','Read the complete plan on this site')}</summary><article class="document-text" dir="rtl" lang="ar">${blocks}</article></details>`:''}<p class="source-note">${tr('تخص العروض والأسعار سياق إعداد الملف','Offers and prices belong to the file’s original preparation context')}</p>`);
  }
  function closeViewer(){viewer.close();}
  $('#viewer-close').addEventListener('click',closeViewer);
  viewer.addEventListener('close',()=>{$$('video',viewer).forEach(v=>v.pause());document.body.classList.remove('modal-open');$('#viewer-body').innerHTML='';media=[];});
  viewer.addEventListener('click',evt=>{if(evt.target===viewer){const r=viewer.getBoundingClientRect();if(evt.clientX<r.left||evt.clientX>r.right||evt.clientY<r.top||evt.clientY>r.bottom)closeViewer();}});

  // The client reel has a single accessible list and one visual loop copy.
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let clientsPaused = motionPreference.matches;
  function updateClientsMotion(){
    const paused=clientsPaused;
    $('#clients-carousel').dataset.paused=String(paused);
    $('#clients-motion').setAttribute('aria-pressed',String(paused));
    $('#clients-motion').disabled=false;
    $('#clients-motion-icon').textContent=paused?'▷':'Ⅱ';
    $('#clients-motion-label').textContent=paused?tr('تشغيل الحركة','Play motion'):tr('إيقاف الحركة','Pause motion');
  }
  function renderClients(){
    const items=(data.clients||[]).map(client=>`<li class="client-name"><bdi>${e(loc(client))}</bdi><span aria-hidden="true">✦</span></li>`).join('');
    $('#clients-track').innerHTML=`<ul class="clients-group">${items}</ul><ul class="clients-group clients-copy" aria-hidden="true">${items}</ul>`;
    $('#clients-carousel').setAttribute('aria-label',tr('العملاء والمشاريع التي شاركت فيها','Clients we have worked with'));
    $('#about-visual').setAttribute('aria-label',tr('أحمد جابر — استراتيجية وإبداع وأداء','Ahmed Gaber — strategy, creative and performance'));
    updateClientsMotion();
  }
  $('#clients-motion').addEventListener('click',()=>{clientsPaused=!clientsPaused;updateClientsMotion();});
  motionPreference.addEventListener('change',()=>{clientsPaused=motionPreference.matches;updateClientsMotion();observeReveals();});
  const revealObserver='IntersectionObserver' in window?new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}});
  },{threshold:0.05,rootMargin:'0px 0px 30px 0px'}):null;
  function observeReveals(){
    if(!revealObserver || motionPreference.matches){
      document.documentElement.classList.remove('motion-ready');
      return;
    }
    document.documentElement.classList.add('motion-ready');
    $$('.section-top,.service-item,.project-card,.landing-card,.market-row-item,.p-step,.faq-item,.social-card,.video-card,.plan-card,.about-copy,.about-brand,.contact-layout>div,.contact form').forEach((el,i)=>{
      if(el.classList.contains('reveal'))return;
      el.classList.add('reveal');
      el.style.setProperty('--reveal-delay',`${i%3*45}ms`);
      revealObserver.observe(el);
    });
  }
  let scrollQueued=false;
  function updateScrollProgress(){
    const available=document.documentElement.scrollHeight-window.innerHeight;
    const progress=available>0?Math.min(1,Math.max(0,window.scrollY/available)):0;
    $('.scroll-progress').style.transform=`scaleX(${progress})`;
    const header=$('.site-header');
    if(header){
      if(window.scrollY>20){
        header.classList.add('scrolled');
      }else{
        header.classList.remove('scrolled');
      }
    }
    const fabTop=$('#fab-back-top');
    if(fabTop){
      if(window.scrollY>350){
        fabTop.classList.add('visible');
      }else{
        fabTop.classList.remove('visible');
      }
    }
    const navLinks=$$('#navigation a');
    if(navLinks.length){
      const sections=['work','landing-pages','markets','social','reports','services','about','faq'];
      const scrollPos=window.scrollY+140;
      let currentSection='';
      for(const id of sections){
        const sec=document.getElementById(id);
        if(sec && sec.offsetTop<=scrollPos){
          currentSection=id;
        }
      }
      navLinks.forEach(link=>{
        const href=link.getAttribute('href');
        if(href==='#'+currentSection){
          link.classList.add('active');
        }else{
          link.classList.remove('active');
        }
      });
    }
    scrollQueued=false;
  }
  window.addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateScrollProgress);}},{passive:true});
  window.addEventListener('resize',updateScrollProgress);

  function renderAll(){
    if(!data)return;
    document.documentElement.lang=state.lang;document.documentElement.dir=state.lang==='ar'?'rtl':'ltr';
    $$('[data-t]').forEach(el=>el.innerHTML=state.lang==='ar'?el.dataset.ar:(en[el.dataset.t]||el.dataset.ar));
    $('#language').textContent=state.lang==='ar'?'EN':'عربي';$('#language').setAttribute('aria-label',tr('Switch to English','التبديل إلى العربية'));
    $('#viewer-close').setAttribute('aria-label',tr('إغلاق','Close'));
    $('#campaign-search').placeholder=tr('ابحث باسم الحملة','Search campaign names');$('#campaign-search').setAttribute('aria-label',$('#campaign-search').placeholder);
    const isAr = state.lang === 'ar';
    const heroImg = $('#hero-portrait-img') || $('.personal-portrait img');
    if(heroImg){
      heroImg.src = isAr ? 'assets/brand/ahmed-gaber-hero-ar.jpg' : 'assets/brand/ahmed-gaber-hero-en.jpg';
      heroImg.alt = isAr ? 'أحمد جابر' : 'Ahmed Gaber';
    }
    const aboutImg = $('#about-portrait-img') || $('.about-portrait img');
    if(aboutImg){
      aboutImg.src = isAr ? 'assets/brand/ahmed-gaber-about-ar.jpg' : 'assets/brand/ahmed-gaber-about-en.jpg';
      aboutImg.alt = isAr ? 'صورة أحمد جابر' : 'Photo of Ahmed Gaber';
    }
    const fabWa = $('#fab-whatsapp');
    if(fabWa){
      const waMsg = state.lang==='ar'
        ? 'مرحبًا أحمد، أرغب في مناقشة مشروع'
        : 'Hello Ahmed, I would like to discuss a project';
      fabWa.href = 'https://wa.me/201020969108?text=' + encodeURIComponent(waMsg);
      fabWa.setAttribute('aria-label', tr('تواصل فوري عبر واتساب','Chat on WhatsApp'));
      fabWa.title = tr('تواصل فوري عبر واتساب','Chat on WhatsApp');
    }
    const fabTopBtn = $('#fab-back-top');
    if(fabTopBtn){
      fabTopBtn.setAttribute('aria-label', tr('العودة للأعلى','Back to top'));
      fabTopBtn.title = tr('العودة للأعلى','Back to top');
    }
    renderWork();renderLandingPages();renderMarkets();renderReport();renderEvidence();renderVideos();renderPlans();renderServices();renderFaqs();renderSocial();renderClients();observeReveals();
  }
  $('#language').addEventListener('click',()=>{state.lang=state.lang==='ar'?'en':'ar';try{localStorage.setItem('ahmed-gaber-lang',state.lang);}catch{}renderAll();});
  $('#menu').addEventListener('click',()=>{const open=$('#navigation').classList.toggle('open');$('#menu').setAttribute('aria-expanded',String(open));});
  $$('a',$('#navigation')).forEach(a=>a.addEventListener('click',()=>{$('#navigation').classList.remove('open');$('#menu').setAttribute('aria-expanded','false');}));
  $('#work-more').addEventListener('click',()=>{state.workAll=!state.workAll;renderWork();});
  $('#video-more').addEventListener('click',()=>{state.videoAll=!state.videoAll;renderVideos();});
  $('#plan-more').addEventListener('click',()=>{state.plansAll=!state.plansAll;renderPlans();});
  $('#evidence-more').addEventListener('click',()=>{state.evidenceAll=!state.evidenceAll;renderEvidence();});
  $('#chart-metric').addEventListener('change',renderChart);
  $('#campaign-search').addEventListener('input',renderCampaigns);
  $('#report-export').addEventListener('click',exportCSV);
  $('#fab-back-top')?.addEventListener('click',()=>{window.scrollTo({top:0,behavior:'smooth'});});
  $('#brief-form').addEventListener('submit',evt=>{evt.preventDefault();const values=new FormData(evt.currentTarget),service=$('select[name=service] option:checked',evt.currentTarget).textContent;const message=tr('مرحبًا أحمد،\n','Hello Ahmed,\n')+[tr('الاسم: ','Name: ')+values.get('name'),tr('النشاط: ','Business: ')+values.get('business'),tr('الخدمة المطلوبة: ','Service: ')+service,tr('نبذة عن المشروع: ','Project brief: ')+values.get('brief')].join('\n');window.open('https://wa.me/201020969108?text='+encodeURIComponent(message),'_blank','noopener,noreferrer');});
  $('#year').textContent=new Date().getFullYear();

  function showToast(message){
    let toast=$('#portfolio-toast');
    if(!toast){
      toast=document.createElement('div');
      toast.id='portfolio-toast';
      toast.className='portfolio-toast';
      toast.setAttribute('role','status');
      toast.setAttribute('aria-live','polite');
      document.body.appendChild(toast);
    }
    toast.textContent=message;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer=setTimeout(()=>toast.classList.remove('show'),2800);
  }

  $$('[data-copy]').forEach(btn=>{
    btn.addEventListener('click',async()=>{
      const val=btn.dataset.copy;
      try{
        await navigator.clipboard.writeText(val);
        const msg=val.includes('@')?tr('تم نسخ البريد الإلكتروني بنجاح ✓','Email copied to clipboard ✓'):tr('تم نسخ رقم الهاتف بنجاح ✓','Phone number copied ✓');
        showToast(msg);
        btn.classList.add('copied');
        setTimeout(()=>btn.classList.remove('copied'),1800);
      }catch{
        showToast(val);
      }
    });
  });

  $$('.share-trigger').forEach(btn=>{
    btn.addEventListener('click',async()=>{
      const shareData={
        title:'أحمد جابر | Media Buyer & AI Creative Specialist',
        text:tr('أحمد جابر — ميديا باير وأخصائي إنتاج إبداعي بالذكاء الاصطناعي','Ahmed Gaber — Media Buyer & AI Creative Specialist'),
        url:window.location.href.split('#')[0]
      };
      if(navigator.share){
        try{await navigator.share(shareData);}catch{}
      }else{
        try{
          await navigator.clipboard.writeText(shareData.url);
          showToast(tr('تم نسخ رابط الموقع بنجاح ✓','Portfolio link copied to clipboard ✓'));
        }catch{
          showToast(shareData.url);
        }
      }
    });
  });
  // A bundled copy keeps the portfolio usable from a folder and during a JSON loading failure.
  const bundledData=window.AHMED_PORTFOLIO_DATA;
  const validContent=value=>value && value.projects && Array.isArray(value.documents) && Array.isArray(value.reports?.accounts);
  async function loadContent(){
    if(location.protocol==='file:' && validContent(bundledData))return bundledData;
    try{
      const response=await fetch('content.json',{cache:'no-cache'});
      if(!response.ok)throw new Error('Content unavailable');
      const value=await response.json();
      if(!validContent(value))throw new Error('Invalid portfolio content');
      return value;
    }catch(error){
      if(validContent(bundledData))return bundledData;
      throw error;
    }
  }
  loadContent().then(value=>{
    data=value;renderAll();window.PORTFOLIO_READY=true;
    $('#load-error').hidden=true;
    const anchor=document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if(anchor)requestAnimationFrame(()=>anchor.scrollIntoView({behavior:'instant',block:'start'}));
  }).catch(err=>{console.error('Portfolio content:',err);$('#load-error').hidden=false;});
})();
