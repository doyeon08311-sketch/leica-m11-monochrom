(() => {
  'use strict';

  /* =========================================================
     로컬 에셋 설정 — 파일 이름은 이 블록에서만 바꾸면 됩니다.
     images/ 폴더에 아래 이름 그대로 파일을 넣으면 자동으로 표시되고,
     파일이 없으면 해당 자리는 검은 빈 슬롯으로 남습니다.
     ========================================================= */
  const IMG_DIR = 'images/';

  // file : 구체 카드 · 라이트박스에 쓰는 이미지
  // full : (선택) 라이트박스에서 교체해 보여줄 고해상도 파일. 생략하면 file을 사용
  // tall : (선택) true면 세로 카드
  const SHOTS = [
    { file: 'photo-01.jpg' },
    { file: 'photo-02.jpg' },
    { file: 'photo-03.jpg' },
    { file: 'photo-04.jpg' },
    { file: 'photo-05.jpg' },
    { file: 'photo-06.jpg' },
    { file: 'photo-07.jpg' },
    { file: 'photo-08.jpg' },
    { file: 'photo-09.jpg' },
    { file: 'photo-10.jpg' },
    { file: 'photo-11.jpg' },
    { file: 'photo-12.jpg' },
    { file: 'photo-13.jpg' },
    { file: 'photo-14.jpg' },
    { file: 'photo-15.jpg' },
    { file: 'photo-16.jpg' },
    { file: 'photo-17.jpg' },
    { file: 'photo-18.jpg' },
    { file: 'photo-19.jpg' },
    { file: 'photo-20.jpg' },
    { file: 'photo-21.jpg' }
  ];

  /* ========================================================= */

  const $ = (s) => document.querySelector(s);
  const root = document.documentElement;
  const body = document.body;
  const stage = $('#stage');
  const scrolltrack = $('#scrolltrack');
  const vig = $('.vig');
  const sides = [...document.querySelectorAll('.side')];
  const product = $('#product');
  const pvs = [...product.querySelectorAll('.pv')];
  // 흑백 레이어는 같은 figure의 컬러 사진과 같은 파일을 씀
  pvs.forEach((f) => { f.querySelector('.pv-bw').src = f.querySelector('.pv-color').getAttribute('src'); });
  const steps = [...product.querySelectorAll('.step')];
  const productBody = product.querySelector('.product-body');
  const productFrame = product.querySelector('.product-frame');
  const pvCount = product.querySelector('.pv-count b');
  const bigNums = [...product.querySelectorAll('.product-bignum span')];
  const progBars = [...product.querySelectorAll('.product-progress i')];
  let pvMono = null;
  const featuresEl = $('#features');
  const feats = [...featuresEl.querySelectorAll('.feat')];
  const featState = feats.map(() => '');
  let featAct = -1;          // 스크롤로 정해진 단계(바뀔 때만 슬라이드를 움직임)
  /* 원형 3D 갤러리: HTML의 .slide(원본 n장)를 복제해 RING_MIN장 이상으로 원통 안쪽에 둘러 세움.
     ringAng(현재 회전)이 ringIdx * ringStep(목표)을 부드럽게 따라가고, 카드 i의 각도는 ringAng - i * ringStep */
  const slider = featuresEl.querySelector('.feat-slider');
  const ringStage = slider.querySelector('.ring-stage');
  const slideAnchor = slider.querySelector('.slide-anchor');
  const slideSrc = [...ringStage.querySelectorAll('.slide')];
  const RING_MIN = 8;
  const ringReps = Math.ceil(RING_MIN / slideSrc.length);
  for (let r = 1; r < ringReps; r++) slideSrc.forEach((s) => ringStage.appendChild(s.cloneNode(true)));
  const slides = [...ringStage.querySelectorAll('.slide')];
  const ringStep = 360 / slides.length;
  const slideNo = slider.querySelector('.slide-count b');
  slider.querySelector('.slide-total').textContent = String(slideSrc.length).padStart(2, '0');
  let slideIdx = 0, sliderR = '', lastFront = null, sliderIn = false;
  // 정면 카드 들썩임(.is-pop 애니메이션 재시작)
  function popFront() {
    slides.forEach((s) => s.classList.remove('is-pop'));
    if (!lastFront) return;
    void lastFront.offsetWidth;
    lastFront.classList.add('is-pop');
  }
  let ringAng = 0, ringR = 600, ringCw = 360, ringKey = '', ringDrag = null;
  const ringTarget = () => slideIdx * ringStep - (ringDrag ? ringDrag.dx * ringStep / ringCw : 0);
  function goSlide(n) {
    slideIdx = n;                      // 무한 회전이므로 범위를 자르지 않음
    const k = ((n % slides.length) + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('is-on', i === k));
    // 회전이 출발하는 순간 새 정면 카드가 들썩이며 테두리가 빛남
    const front = slides[k];
    if (front !== lastFront) { lastFront = front; if (sliderIn) popFront(); }
    const photo = k % slideSrc.length;
    slideNo.textContent = String(photo + 1).padStart(2, '0');
    // 정면 사진 번호와 같은 특징 항목을 강조, 진행 막대는 몇 번째인지 표시
    feats.forEach((el, i) => el.classList.toggle('is-on', i === photo % feats.length));
    slider.style.setProperty('--sp', ((photo + 1) / slideSrc.length).toFixed(3));
  }
  goSlide(0);
  slider.querySelector('.slide-prev').addEventListener('click', () => goSlide(slideIdx - 1));
  slider.querySelector('.slide-next').addEventListener('click', () => goSlide(slideIdx + 1));
  // 크기: 카드 폭은 슬라이드 폭의 46%(좁은 화면 56%), 세로 4:5. 반지름은 이웃 카드가 살짝 떨어지도록
  function layoutRing() {
    const sw = ringStage.clientWidth, sh = ringStage.clientHeight;
    ringCw = Math.min(sw * (W() <= 900 ? 0.56 : 0.46), sh * 0.88 / 1.25);
    ringR = (ringCw * 1.1 / 2) / Math.sin(ringStep / 2 * Math.PI / 180);
    slider.style.setProperty('--cw', Math.round(ringCw) + 'px');
    slider.style.setProperty('--ch', Math.round(ringCw * 1.25) + 'px');
    slider.style.setProperty('--persp', Math.round(ringR * 2.4) + 'px');
    ringKey = '';
  }
  function placeRing() {
    ringAng += (ringTarget() - ringAng) * (ringDrag ? 0.35 : 0.09);
    if (Math.abs(ringTarget() - ringAng) < 0.01) ringAng = ringTarget();
    const key = ringAng.toFixed(2);
    if (key === ringKey) return;
    ringKey = key;
    slides.forEach((s, i) => {
      let a = ((ringAng - i * ringStep) % 360 + 540) % 360 - 180;   // -180 ~ 180, 0이 정면
      const vis = Math.abs(a) < 75;
      s.style.visibility = vis ? 'visible' : 'hidden';
      if (!vis) return;
      s.style.transform = `translate(-50%, -50%) translateZ(${ringR}px) rotateY(${a}deg) translateZ(${-ringR}px)`;
      s.style.setProperty('--d', Math.min(0.75, Math.abs(a) / 70).toFixed(3));
    });
  }
  // 드래그로 돌리기, 옆 카드 클릭 시 그 카드로
  ringStage.addEventListener('pointerdown', (e) => {
    ringDrag = { x: e.clientX, dx: 0, id: e.pointerId };
    ringStage.setPointerCapture(e.pointerId);
    ringStage.classList.add('is-drag');
  });
  ringStage.addEventListener('pointermove', (e) => {
    if (ringDrag && e.pointerId === ringDrag.id) ringDrag.dx = e.clientX - ringDrag.x;
  });
  const endDrag = (e) => {
    if (!ringDrag || e.pointerId !== ringDrag.id) return;
    const { dx } = ringDrag;
    const target = ringTarget();
    ringDrag = null;
    ringStage.classList.remove('is-drag');
    if (Math.abs(dx) > 6) { goSlide(Math.round(target / ringStep)); return; }
    // 클릭: 누른 카드가 정면이 되도록
    const card = e.target.closest && e.target.closest('.slide');
    const i = slides.indexOf(card);
    if (i < 0) return;
    const a = ((ringAng - i * ringStep) % 360 + 540) % 360 - 180;
    goSlide(slideIdx - Math.round(a / ringStep));
  };
  ringStage.addEventListener('pointerup', endDrag);
  ringStage.addEventListener('pointercancel', endDrag);
  const isoNum = featuresEl.querySelector('.iso-num');
  let isoText = '';
  // 슬라이드 사진은 로드되면 표시, 없으면 자리 표시만 남음
  slider.querySelectorAll('.slide img').forEach((img) => {
    const on = () => { if (img.naturalWidth) img.classList.add('in'); };
    if (img.complete) on(); else img.addEventListener('load', on);
  });
  const world = $('#world');
  const orb = $('#orb');
  const headline = $('#headline');
  const heroImg = headline.querySelector('.hero');
  const menu = $('#menu');
  const menuBtn = $('#menuBtn');
  const lit = $('#lit');
  const plate = $('#plate');
  const litImg = $('#litImg');
  const splash = $('#splash');
  const bar = $('#bar');
  const dot = $('#dot');

  const N = SHOTS.length;
  const altOf = (i) => 'Leica M11 Monochrom sample photo ' + (i + 1);
  const coarse = matchMedia('(pointer:coarse)').matches;
  const fineCursor = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  // 로딩 화면 동안 페이지 스크롤 잠금
  root.style.overflow = 'hidden';
  root.classList.add('loading'); // 스크롤바 자리 배경도 로딩 화면 색으로

  /* ---------- 구체 카드 생성 ---------- */
  const GA = Math.PI * (3 - Math.sqrt(5));
  const cards = [];

  SHOTS.forEach((s, i) => {
    const y = 1 - (i / (N - 1)) * 2;
    const rad = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = i * GA;
    const x = Math.cos(theta) * rad;
    const z = Math.sin(theta) * rad;
    const lat = Math.asin(y) * 180 / Math.PI;
    const lon = Math.atan2(x, z) * 180 / Math.PI;

    const el = document.createElement('div');
    el.className = 'card' + (s.tall ? ' tall' : '');
    el.dataset.idx = i;
    const fig = document.createElement('figure');
    const img = document.createElement('img');
    img.alt = altOf(i);
    img.draggable = false;
    fig.appendChild(img);
    el.appendChild(fig);
    orb.appendChild(el);
    cards.push({ el, img, x, y, z, lat, lon, op: -1, d: -1, k: 0 }); // k: 펼침 진행도(0=중심, 1=제자리)
  });

  /* ---------- 레이아웃 ---------- */
  let R = 300;
  let persp = 1150;
  let lastW = 0, lastH = 0;

  function layout(force) {
    const w = W(), h = H();
    if (!force && Math.abs(w - lastW) < 20 && Math.abs(h - lastH) < 20) return;
    lastW = w; lastH = h;

    const hr = w <= 380 ? 0.38 : w <= 640 ? 0.42 : 0.46;
    const wr = w <= 380 ? 0.48 : w <= 640 ? 0.52 : 0.58;
    const floor = w <= 380 ? 108 : w <= 640 ? 120 : 155;
    const sc = w <= 380 ? 0.44 : w <= 640 ? 0.46 : 0.47;
    R = Math.max(floor, Math.min(480, h * hr, w * wr));
    const cw = Math.round(Math.max(72, R * sc));
    persp = w <= 380 ? 620 : w <= 640 ? 760 : w <= 900 ? 920 : 1150;

    root.style.setProperty('--persp', persp + 'px');
    orb.style.setProperty('--cw', cw + 'px');
    for (const c of cards) placeCard(c);

    // 회전 구간 높이 = 화면 1장 + 한 바퀴 도는 스크롤 거리
    scrolltrack.style.height = Math.round(h * (1 + ROT_VH)) + 'px';
    // 제품 소개 = 진입 화면 1장 + 단계 수 × STEP_VH 화면만큼 고정
    product.style.height = Math.round(h * (1 + PRODUCT_STEPS * STEP_VH)) + 'px';
    // 특징 = 화면 1장 + 항목 수 × FEAT_VH 화면만큼 고정 (좁은 화면은 고정하지 않음)
    featuresEl.style.height = w <= 900 ? '' : Math.round(h * (1 + feats.length * FEAT_VH)) + 'px';
    heroW = headline.offsetWidth;
    const pad = Math.min(34, Math.max(14, w * 0.026)); // CSS --pad와 같은 계산

    // 제품 소개 배치 — 이너 폭(최대 1600px)은 CSS .product-inner와 같은 계산
    const inner = Math.min(1600, w - pad * 2);
    const narrow = w <= 900;
    camTarget = narrow ? inner * 0.58 : inner * 0.36;   // 비켜난 카메라의 화면 폭
    if (narrow) {
      camX = 0;
    } else {
      // [카메라][간격][글·사진] 전체 폭의 가운데를 화면 중앙에 맞춤
      const gap = Math.min(96, Math.max(48, inner * 0.05));
      const bodyW = productBody.offsetWidth;
      const total = camTarget + gap + bodyW;
      camX = -total / 2 + camTarget / 2 - 40; // 카메라만 40px 더 왼쪽으로
      product.style.setProperty('--body-x', Math.round(-total / 2 + camTarget + gap) + 'px');
      product.style.setProperty('--cam-x', Math.round(camX) + 'px');   // 스포트라이트 위치
    }

    layoutRing();
    layoutStage();

    // 양옆 문구가 들어갈 빈 공간 폭 (구체 바깥 ~ 화면 가장자리)
    const gutter = Math.round(w / 2 - R * 1.1 - pad - 16);
    root.style.setProperty('--gutter', gutter + 'px');
    root.classList.toggle('side-stack', gutter < 240);
  }

  // k에 따라 구체 중심(카메라 뒤)에서 제자리로 펼쳐짐
  function placeCard(c) {
    const r = R * c.k;
    const s = 0.35 + 0.65 * c.k;
    c.el.style.transform =
      `translate3d(${c.x * r}px, ${-c.y * r}px, ${c.z * r}px) rotateY(${c.lon}deg) rotateX(${c.lat}deg) scale(${s})`;
  }

  /* ---------- 등장 순서: 카메라 → 카드 펼침 ---------- */
  const UNFOLD_DELAY = 850;    // revealed 이후 카드가 펼쳐지기 시작하는 시점(ms) — 카메라 등장(0.25s 지연 + 1.05s) 도중
  const UNFOLD_DUR = 1150;     // 카드 한 장이 펼쳐지는 시간(ms)
  const UNFOLD_STAGGER = 32;   // 카드 사이 시차(ms)
  let unfoldStart = -1;
  let unfolded = false;
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  function stepUnfold(now) {
    if (unfolded || unfoldStart < 0 || now < unfoldStart) return;
    let done = true;
    for (let i = 0; i < N; i++) {
      const c = cards[i];
      const t = clamp((now - unfoldStart - i * UNFOLD_STAGGER) / UNFOLD_DUR, 0, 1);
      const k = easeOut(t);
      if (k !== c.k) { c.k = k; placeCard(c); }
      if (t < 1) done = false;
    }
    unfolded = done;
  }

  function finishUnfold() {
    unfolded = true;
    for (const c of cards) { c.k = 1; placeCard(c); }
  }

  addEventListener('resize', () => layout(false));
  addEventListener('orientationchange', () => setTimeout(() => layout(true), 220));
  if (window.visualViewport) {
    visualViewport.addEventListener('resize', () => layout(false));
    visualViewport.addEventListener('scroll', () => layout(false));
  }

  /* ---------- 스크롤: 회전 구간 → 다음 섹션 ----------
     스크롤 ROT_VH 화면 높이만큼 내리면 구체가 한 바퀴(360°) 돌고,
     그 뒤로는 구체가 페이지와 함께 올라가며 다음 섹션이 나타난다. 카메라는 화면 중앙에 남는다. */
  const ROT_VH = 3.2;          // 한 바퀴에 필요한 스크롤 거리(화면 높이 배수)
  const PRODUCT_STEPS = 3;   // 제품 소개 단계 수
  const FEAT_VH = 0.9;       // 특징 항목 하나가 강조되는 스크롤 거리(화면 높이 배수)
  const STEP_VH = 3;           // 단계 하나에 필요한 스크롤 거리(화면 높이 배수) — 클수록 천천히 진행
  let heroW = 0;             // 카메라 이미지의 레이아웃 폭(px)
  let camTarget = 0;         // 제품 소개에서 카메라가 줄어든 뒤의 화면 폭(px)
  let camX = 0;              // 제품 소개에서 카메라 중심의 화면 중앙 기준 x(px)
  const SPIN_EASE = 0.12;    // 스크롤 → 회전 부드러움(작을수록 더 미끄러지듯 따라옴)
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);

  /* ---------- 카메라 루프 ---------- */
  let spin = 0;
  let sideV = '';
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const tilt = -4;
  const PITCH = 32;
  let dragX = 0, dragY = 0, velX = 0, velY = 0;
  let dragging = false;
  let focused = -1;

  let curX = -100, curY = -100, dotX = -100, dotY = -100;

  /* ---------- 제품 소개 3단계 ----------
     단계마다 사진 1장(.pv)과 문구(.step)가 짝을 이룬다. 단계 안 진행도 u(0~1)에 따라:
       3~58%  빛줄기가 사진을 왼쪽 → 오른쪽으로 지나가며 흑백으로 바꿈(--e 경계, --glint 빛줄기)
       55~72% 필름 입자가 올라옴(--dev). 72~100%는 완성된 흑백으로 머묾
     효과가 모두 끝난 뒤 다음 단계의 사진·문구로 넘어감 */
  let stepIdx = -1;
  const lastFx = pvs.map(() => '');
  function stepProduct(off, enter) {
    product.style.setProperty('--enter', Math.round(smooth(0.4, 1, enter) * 1000) / 1000);
    const t = clamp((off - H()) / (H() * STEP_VH * PRODUCT_STEPS), 0, 1);
    const idx = Math.min(PRODUCT_STEPS - 1, Math.floor(t * PRODUCT_STEPS));
    const u = clamp(t * PRODUCT_STEPS - idx, 0, 1);
    if (idx !== stepIdx) {
      stepIdx = idx;
      pvs.forEach((el, i) => el.classList.toggle('is-on', i === idx));
      steps.forEach((el, i) => el.classList.toggle('is-on', i === idx));
      bigNums.forEach((el, i) => el.classList.toggle('is-on', i === idx));
      pvCount.textContent = String(idx + 1).padStart(2, '0');
    }
    // 진행 막대: 칸마다 그 단계 진행도
    progBars.forEach((el, i) => el.style.setProperty('--f', clamp(t * PRODUCT_STEPS - i, 0, 1).toFixed(3)));
    // 상태 표시: 현재 사진의 빛줄기가 절반을 넘으면 Monochrom
    const mono = smooth(0.03, 0.58, u) > 0.5;
    if (mono !== pvMono) { pvMono = mono; productFrame.classList.toggle('is-mono', mono); }
    // 지나간 단계 사진은 끝 상태, 아직 안 온 단계 사진은 컬러 상태로 고정
    pvs.forEach((el, i) => {
      const k = idx > i ? 1 : idx < i ? 0 : u;
      const sweep = smooth(0.03, 0.58, k);   // 흑백 전환(빛줄기)
      const e = (-20 + 140 * sweep).toFixed(2);
      const glint = (sweep > 0 && sweep < 1 ? Math.sin(Math.PI * sweep) : 0).toFixed(3);
      const dev = smooth(0.55, 0.72, k).toFixed(3);
      const fx = e + '|' + glint + '|' + dev;
      if (fx === lastFx[i]) return;
      lastFx[i] = fx;
      el.style.setProperty('--e', e + '%');
      el.style.setProperty('--glint', glint);
      el.style.setProperty('--dev', dev);
    });
  }

  /* ---------- 특징 섹션 ----------
     항목·슬라이드마다 화면 진입도 --r(0~1)을 설정. 연출은 CSS가 이 값으로 계산.
     ISO 항목은 진입도에 맞춰 125 → 200.000 카운트업. 슬라이드는 화면에 있을 때만 자동 넘김(--sp 진행 막대) */
  function stepFeatures() {
    const h = H();
    const sec = featuresEl.getBoundingClientRect();
    if (sec.top > h * 1.2 || sec.bottom < -h * 0.2) return;

    // 강조 항목: 고정 구간에서 FEAT_VH 화면 스크롤마다 다음 항목으로. 좁은 화면은 화면 55% 선을 지난 마지막 항목
    let act = 0;
    if (W() > 900) act = clamp(Math.floor(-sec.top / (h * FEAT_VH)), 0, feats.length - 1);
    else feats.forEach((el, i) => { if (el.getBoundingClientRect().top < h * 0.55) act = i; });
    // 단계가 바뀌면 그 번호의 사진이 정면에 오도록 가장 가까운 방향으로 회전 (제목 강조는 goSlide가 맞춤)
    if (act !== featAct) {
      featAct = act;
      const n = slideSrc.length;
      const cur = ((slideIdx % n) + n) % n;
      let d = act % n - cur;
      if (d > n / 2) d -= n;
      if (d < -n / 2) d += n;
      goSlide(slideIdx + d);
    }

    placeRing();
    const sr = smooth(h * 0.95, h * 0.3, slider.getBoundingClientRect().top);
    const srKey = sr.toFixed(3);
    if (srKey !== sliderR) { sliderR = srKey; slider.style.setProperty('--r', srKey); }
    // 위 섹션에서 내려와 슬라이드가 다 드러나면 첫 카드가 한 번 들썩임 (벗어났다 다시 오면 또)
    const inNow = sr > 0.98;
    if (inNow && !sliderIn) { sliderIn = true; popFront(); }
    else if (sr < 0.5 && sliderIn) sliderIn = false;

    feats.forEach((el, i) => {
      const b = el.getBoundingClientRect();
      // 화면 아래쪽에 놓인 항목도 섹션이 화면에 고정될 때(sec.top → 0)까지는 다 드러나도록
      const r = Math.max(smooth(h * 0.95, h * 0.45, b.top), smooth(h * 0.5, 0, sec.top));
      const key = r.toFixed(3);
      if (key === featState[i]) return;
      featState[i] = key;
      el.style.setProperty('--r', key);
      if (isoNum && el.contains(isoNum)) {
        const to = +isoNum.dataset.to;
        const v = Math.round(125 + (to - 125) * easeOut(smooth(0.35, 0.95, r)));
        const txt = v.toLocaleString('de-DE'); // 200.000 형식
        if (txt !== isoText) { isoText = txt; isoNum.textContent = txt; }
      }
    });
  }

  /* ---------- 제품 소개 배경 영상 ----------
     images/video.mp4 전체를 소리 없이 반복(loop 속성). 제품 소개 근처에서만 재생하고,
     실제로 재생되기 시작한 뒤에만 보이게 해서(.is-playing) 재생 전 정지 화면·재생 버튼이 드러나지 않게 함.
     파일이 없으면 어두운 배경만 남음 */
  const filmBg = product.querySelector('.product-bg');
  const filmVideo = filmBg.querySelector('.film-video');
  let filmWant = false;
  filmVideo.addEventListener('playing', () => filmBg.classList.add('is-playing'));
  filmVideo.addEventListener('error', () => filmVideo.remove(), { once: true });

  function stepFilm() {
    const h = H();
    // 섹션이 화면에 들어오기 전부터 미리 재생하고, 충분히 멀어진 뒤 정지
    const ahead = scrollY - h * ROT_VH;               // 음수면 아직 구체 회전 중
    const want = ahead > -h * 1.2 && ahead < h * (2.5 + PRODUCT_STEPS * STEP_VH);
    if (want !== filmWant) {
      filmWant = want;
      if (!filmVideo.isConnected) return;
      want ? filmVideo.play().catch(() => {}) : filmVideo.pause();
    }
  }

  /* ---------- 제품 스펙 ----------
     분류 탭 전환, 화면에 들어오면 .in(등장).
     갤러리 뷰어: 썸네일을 누르면 그 사진이 큰 화면에 새 레이어로 걷히며 들어오고(.is-enter), 원래 큰 사진은 그 썸네일 자리로 감 */
  const specsEl = $('#specs');
  // 고정 섹션(제품 소개·특징·제품 스펙)의 마지막 단계가 끝난 뒤 아래로 스크롤하면, 섹션이 빠져나가는 중간 구간에 걸리지 않고
  // 다음 섹션 윗변으로 한 번에 부드럽게 이동 (데스크톱만. 이동 중에는 다시 걸지 않음)
  let lastY = scrollY, autoTo = -1;
  addEventListener('scroll', () => {
    const y = scrollY, down = y > lastY;
    lastY = y;
    if (autoTo >= 0) { if (Math.abs(y - autoTo) < 4) autoTo = -1; return; }
    if (!down || W() <= 900) return;
    // [고정이 풀리는 지점, 이동할 다음 섹션 윗변] — 제품 소개 → 특징, 특징 → 제품 스펙, 제품 스펙 → 갤러리, 갤러리 → 액세서리
    const jumps = [
      [product.offsetTop + PRODUCT_STEPS * STEP_VH * H(), featuresEl.offsetTop],
      [featuresEl.offsetTop + feats.length * FEAT_VH * H(), specsEl.offsetTop],
      [specsEl.offsetTop + specsEl.offsetHeight - H(), galleryEl.offsetTop],   // 제품 스펙 → 갤러리
      [galleryEl.offsetTop + galleryEl.offsetHeight - H(), accEl.offsetTop],    // 갤러리(화면 한 장) → 액세서리
      [accEl.offsetTop + accEl.offsetHeight - H(), bkEl.offsetTop],             // 액세서리(화면 한 장) → 상담 예약
    ];
    for (const [pinEnd, target] of jumps) {
      if (y > pinEnd + 8 && y < target - 8) {
        autoTo = target;
        scrollTo({ top: target, behavior: 'smooth' });
        setTimeout(() => { autoTo = -1; }, 1500);   // 혹시 도착 판정을 놓쳐도 풀림
        break;
      }
    }
  }, { passive: true });
  const specTabs = [...specsEl.querySelectorAll('.spec-tab')];
  const specPanels = [...specsEl.querySelectorAll('.spec-panel')];
  specTabs.forEach((tab, i) => tab.addEventListener('click', () => {
    specTabs.forEach((t, j) => { t.classList.toggle('is-on', j === i); t.setAttribute('aria-selected', j === i); });
    specPanels.forEach((p, j) => { p.classList.toggle('is-on', j === i); p.hidden = j !== i; });
  }));
  // 섹션 도착 연출을 들어올 때마다 재생: 20% 보이면 .in, arrivedMs 뒤 .arrived(연출 끝), 화면에서 완전히 벗어나면 둘 다 뺌
  function replayIn(el, arrivedMs) {
    let t = 0;
    new IntersectionObserver((list) => {
      const en = list[list.length - 1];
      if (en.intersectionRatio >= 0.2 && !el.classList.contains('in')) {
        el.classList.add('in');
        t = setTimeout(() => el.classList.add('arrived'), arrivedMs);
      } else if (en.intersectionRatio === 0 && el.classList.contains('in')) {
        clearTimeout(t);
        el.classList.remove('in', 'arrived');
      }
    }, { threshold: [0, 0.2] }).observe(el);
  }
  // 차례로 나타날 순서(--i): 탭, 표마다 줄, 썸네일
  specsEl.querySelectorAll('.spec-tab, .thumb').forEach((el) => {
    el.style.setProperty('--i', [...el.closest('.spec-tabs, .viewer-thumbs').querySelectorAll('.spec-tab, .thumb')].indexOf(el));
  });
  specsEl.querySelectorAll('.spec-panel').forEach((p) => p.querySelectorAll('.spec-row').forEach((r, i) => r.style.setProperty('--i', i)));
  replayIn(specsEl, 2400);

  const viewerFrame = specsEl.querySelector('.viewer-frame');
  const viewerNo = specsEl.querySelector('.viewer-no b');
  const viewerThumbs = [...specsEl.querySelectorAll('.thumb')];
  const galSrc = (i) => viewerThumbs[i].querySelector('img').getAttribute('src');
  const showWhenLoaded = (img) => {
    const on = () => { if (img.naturalWidth) img.classList.add('in'); };
    if (img.complete) on(); else img.addEventListener('load', on, { once: true });
  };
  specsEl.querySelectorAll('.spec-viewer img').forEach(showWhenLoaded);
  let viewerCur = 0;
  // i번 사진을 큰 화면에: 새 레이어를 얹어 걷어 내고(앞으로 가면 왼→오, 뒤로 가면 오→왼), 끝나면 아래 레이어 정리
  function showPhoto(i) {
    const n = viewerThumbs.length;
    i = (i + n) % n;
    if (i === viewerCur) return;
    const back = i < viewerCur;
    viewerCur = i;
    viewerThumbs.forEach((t, j) => {
      t.classList.toggle('is-on', j === i);
      if (j === i) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current');
    });
    viewerNo.textContent = String(i + 1).padStart(2, '0');
    const layer = document.createElement('div');
    layer.className = 'vw-layer is-enter' + (back ? ' is-back' : '');
    layer.innerHTML = `<span class="gal-ph">${galSrc(i)}</span><img src="${galSrc(i)}" alt="" decoding="async">`;
    showWhenLoaded(layer.querySelector('img'));
    viewerFrame.insertBefore(layer, viewerFrame.querySelector('.vw-arrow'));   // 화살표는 항상 위에
    layer.addEventListener('animationend', (e) => {
      if (e.target !== layer) return;
      viewerFrame.querySelectorAll('.vw-layer').forEach((el) => { if (el !== layer && !el.classList.contains('is-enter')) el.remove(); });
      layer.classList.remove('is-enter', 'is-back');
    });
  }
  viewerThumbs.forEach((t, i) => t.addEventListener('click', () => showPhoto(i)));
  specsEl.querySelector('.vw-prev').addEventListener('click', () => showPhoto(viewerCur - 1));
  specsEl.querySelector('.vw-next').addEventListener('click', () => showPhoto(viewerCur + 1));
  // 뷰어가 화면에 보일 때는 키보드 ←/→로도 넘김 (입력 중·메뉴·라이트박스 열림 때는 제외)
  addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (/INPUT|TEXTAREA/.test(document.activeElement.tagName) || root.classList.contains('menu-open') || focused >= 0 || gview.classList.contains('open')) return;
    const b = viewerFrame.getBoundingClientRect();
    if (b.bottom < 0 || b.top > H()) return;
    showPhoto(viewerCur + (e.key === 'ArrowRight' ? 1 : -1));
  });

  /* ---------- 갤러리 ----------
     카드 위치는 상태에 따라 JS가 계산(transform·width·height), 움직임은 CSS 전환이 맡음
       전체(galSel = -1): 왼쪽 아래(앞)에서 오른쪽 위(뒤)로 비스듬히 겹쳐 선 판들
       사진가(galSel = 0~2): 그 사람 사진만 실제 비율로 줄 맞춰 평면에 펼치고, 나머지는 뒤로 사라짐
     처음 화면에 들어오면 카드들이 깊은 곳에서 차례로 날아 들어옴 */
  const galleryEl = $('#gallery');
  const galStage = galleryEl.querySelector('.g-stage');
  const galDetail = galleryEl.querySelector('.g-detail');
  const galBgName = galStage.querySelector('.g-bgname');
  const galSrcArts = [...galleryEl.querySelectorAll('.g-src article')];
  const galBtns = [...galleryEl.querySelectorAll('.g-index [data-ch], .g-back')];
  const galCards = [...galStage.querySelectorAll('.g-card')].map((el, i) => ({ el, i, ch: +el.dataset.ch, ar: +el.dataset.ar || 0.7 }));
  const galPhotos = galCards;   // 크게 보기에서 넘기는 순서
  let galSel = -1, galShown = false;
  galCards.forEach((c) => {
    const img = c.el.querySelector('img');
    const on = () => {
      if (!img.naturalWidth) return;
      img.classList.add('in');
      c.ar = img.naturalWidth / img.naturalHeight;   // 펼칠 때 실제 비율로
      if (galSel === c.ch) layoutStage();
    };
    if (img.complete) on(); else img.addEventListener('load', on, { once: true });
  });

  function placeCard3(c, p, z, ry, op, delay, rz = 0) {
    const s = c.el.style;
    s.width = p.w.toFixed(1) + 'px';
    s.height = p.h.toFixed(1) + 'px';
    s.transform = `translate3d(${(p.x - p.w / 2).toFixed(1)}px, ${(p.y - p.h / 2).toFixed(1)}px, ${z}px) rotateY(${ry}deg) rotateZ(${rz}deg)`;
    s.opacity = op;
    s.transitionDelay = delay + 'ms';
    c.el.classList.toggle('is-off', op === 0);
  }
  // 겹친 상태의 자리: i가 커질수록 오른쪽 위·뒤로
  function stackPos(c, sw, sh) {
    const t = c.i / (galCards.length - 1);
    const w = Math.min(sw * 0.36, sh * 0.5);
    return { x: (-0.26 + 0.54 * t) * sw, y: (0.1 - 0.36 * t) * sh, w, h: w * 1.2, z: Math.round(140 - 560 * t) };
  }
  // 펼친 상태의 자리: 1~3줄로 나눠 본 뒤 사진이 가장 크게 보이는 배치를 고름
  function spreadPos(items, sw, sh) {
    const gap = Math.max(12, sw * 0.022);
    const W0 = sw * 0.94, H0 = sh * 0.86;
    let best = null;
    for (let r = 1; r <= Math.min(3, items.length); r++) {
      const per = Math.ceil(items.length / r);
      const rows = [];
      for (let k = 0; k < items.length; k += per) rows.push(items.slice(k, k + per));
      const hs = rows.map((row) => (W0 - gap * (row.length - 1)) / row.reduce((a, c) => a + c.ar, 0));
      const total = hs.reduce((a, b) => a + b, 0) + gap * (rows.length - 1);
      const f = Math.min(1, H0 / total);
      const area = rows.reduce((a, row, ri) => a + row.reduce((s, c) => s + c.ar * (hs[ri] * f) ** 2, 0), 0);
      if (!best || area > best.area) best = { rows, hs, f, total, area };
    }
    const out = new Map();
    const { rows, hs, f } = best;
    let y = -best.total * f / 2;
    rows.forEach((row, ri) => {
      const h = hs[ri] * f;
      let x = -W0 * f / 2;
      row.forEach((c) => { const w = c.ar * h; out.set(c, { x: x + w / 2, y: y + h / 2, w, h }); x += w + gap * f; });
      y += h + gap * f;
    });
    return out;
  }
  function layoutStage() {
    const sw = galStage.clientWidth, sh = galStage.clientHeight;
    if (!sw || !sh) return;
    const n = galCards.length;
    if (!galShown) {   // 등장 전: 무대 곳곳에 흩어져 기울어진 채 떠 있음 (카드마다 고정된 무작위 값)
      galCards.forEach((c) => {
        const rnd = (k) => { const v = Math.sin((c.i + 1) * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
        const p = stackPos(c, sw, sh);
        const sp = { x: (rnd(1) - 0.5) * sw * 1.25, y: (rnd(2) - 0.5) * sh * 1.1, w: p.w * 0.8, h: p.h * 0.8 };
        placeCard3(c, sp, Math.round(-500 + rnd(3) * 700), Math.round((rnd(4) - 0.5) * 70), 0.55, 0, Math.round((rnd(5) - 0.5) * 50));
      });
      return;
    }
    if (galSel < 0) {
      galCards.forEach((c) => { const p = stackPos(c, sw, sh); placeCard3(c, p, p.z, 40, 1, (n - 1 - c.i) * 70); });
      return;
    }
    const mine = galCards.filter((c) => c.ch === galSel);
    const pos = spreadPos(mine, sw, sh);
    galCards.forEach((c) => {
      const p = pos.get(c);
      if (p) placeCard3(c, p, 0, 0, 1, 120 + mine.indexOf(c) * 90);
      else placeCard3(c, stackPos(c, sw, sh), -1300, 40, 0, c.i * 15);
    });
  }
  function fillDetail(ch) {
    const src = galSrcArts[ch];
    const name = src.querySelector('h3').textContent;
    galDetail.querySelector('.g-idx').innerHTML = `<i aria-hidden="true"></i>${String(ch + 1).padStart(2, '0')} / ${String(galSrcArts.length).padStart(2, '0')}`;
    galDetail.querySelector('.g-name').textContent = name;
    galDetail.querySelector('.g-quote').innerHTML = src.querySelector('blockquote').textContent.trim().split(/\s+/)
      .map((w, i) => `<span class="w" style="--d:${i}">${w}</span>`).join(' ');
    galDetail.querySelector('.g-note').textContent = src.querySelector('p').textContent;
    galBgName.textContent = name;
    galDetail.classList.remove('show');
    void galDetail.offsetWidth;
    galDetail.classList.add('show');
  }
  function selectArtist(ch) {
    galSel = ch;
    galShown = true;
    if (ch >= 0) galleryEl.classList.add('is-used');   // 한 번 고르면 클릭 유도 표시는 끝
    galleryEl.classList.toggle('is-artist', ch >= 0);
    galStage.classList.toggle('is-overview', ch < 0);
    delete galStage.dataset.peek;
    galBtns.forEach((b) => b.classList.toggle('is-on', +b.dataset.ch === ch && ch >= 0));
    if (ch >= 0) fillDetail(ch);
    layoutStage();
  }
  // 메뉴로 갤러리에 올 때: 첫 화면으로 되돌림(전체 보기, 클릭 유도 문구·점 다시 표시, 인트로 글 숨김, 카드는 전환 없이 즉시 흩어 둠)
  // → 화면에 들어오면 평소처럼 인트로 글이 나타나고 카드가 모임
  function galResetIntro() {
    galSel = -1;
    galShown = false;
    galleryEl.classList.remove('is-artist', 'is-used', 'g-in');
    galStage.classList.add('is-overview');
    delete galStage.dataset.peek;
    galBtns.forEach((b) => b.classList.remove('is-on'));
    galCards.forEach((c) => { c.el.style.transition = 'none'; });
    layoutStage();
    void galStage.offsetWidth;
    galCards.forEach((c) => { c.el.style.transition = ''; });
  }
  function galPlayIntro() {
    galleryEl.classList.add('g-in');
    if (!galShown) { galShown = true; layoutStage(); }
  }
  galBtns.forEach((b) => {
    b.addEventListener('click', () => selectArtist(+b.dataset.ch === galSel ? -1 : +b.dataset.ch));
    if (b.classList.contains('g-back')) return;
    b.addEventListener('pointerenter', () => { if (galSel < 0) galStage.dataset.peek = b.dataset.ch; });
    b.addEventListener('pointerleave', () => { delete galStage.dataset.peek; });
  });
  // 겹친 상태에서 사진을 누르면 그 사진가로 펼치고, 펼친 상태에서 누르면 크게 보기
  galCards.forEach((c) => c.el.querySelector('.g-open').addEventListener('click', () => {
    if (galSel === c.ch) gvOpen(c.i); else selectArtist(c.ch);
  }));
  // 섹션이 30% 이상 보이면 흩어진 카드가 차라락 모이고, 화면에서 완전히 벗어나면(전체 보기 상태일 때) 다시 흩어져 다음에 또 모임
  const galIO = new IntersectionObserver((list) => {
    const en = list[list.length - 1];
    if (en.intersectionRatio >= 0.3) galleryEl.classList.add('g-in');            // 인트로 글 등장
    else if (en.intersectionRatio === 0 && galSel < 0) galleryEl.classList.remove('g-in');
    if (en.intersectionRatio >= 0.3 && !galShown) { galShown = true; layoutStage(); }
    else if (en.intersectionRatio === 0 && galShown && galSel < 0) { galShown = false; layoutStage(); }
  }, { threshold: [0, 0.3] });
  galIO.observe(galleryEl);

  /* 사진 크게 보기: 갤러리 사진 전체를 ←/→로 넘김, Esc·바깥 클릭으로 닫힘 */
  const gview = $('#gview');
  const gvImg = gview.querySelector('.gv-img');
  const gvName = gview.querySelector('.gv-name');
  const gvNo = gview.querySelector('.gv-no');
  let gvCur = -1, gvBack = null;
  function gvShow(i) {
    const n = galPhotos.length;
    gvCur = (i + n) % n;
    const el = galPhotos[gvCur].el;
    gvImg.src = el.querySelector('img').getAttribute('src');
    gvImg.alt = el.querySelector('img').alt;
    gvName.textContent = el.dataset.name;
    gvNo.textContent = el.dataset.no;
    gvImg.classList.remove('swap');
    void gvImg.offsetWidth;
    gvImg.classList.add('swap');
  }
  function gvOpen(i) {
    gvBack = document.activeElement;
    gvShow(i);
    gview.classList.add('open');
    gview.setAttribute('aria-hidden', 'false');
    gview.querySelector('.gv-close').focus({ preventScroll: true });
  }
  function gvClose() {
    gview.classList.remove('open');
    gview.setAttribute('aria-hidden', 'true');
    gvCur = -1;
    if (gvBack) gvBack.focus({ preventScroll: true });
  }
  gview.querySelector('.gv-prev').addEventListener('click', () => gvShow(gvCur - 1));
  gview.querySelector('.gv-next').addEventListener('click', () => gvShow(gvCur + 1));
  gview.querySelector('.gv-close').addEventListener('click', gvClose);
  gview.addEventListener('click', (e) => { if (e.target === gview) gvClose(); });
  // 열려 있는 동안 뒤 페이지가 스크롤되지 않게
  const gvBlock = (e) => { if (gvCur >= 0) e.preventDefault(); };
  gview.addEventListener('wheel', gvBlock, { passive: false });
  gview.addEventListener('touchmove', gvBlock, { passive: false });
  addEventListener('keydown', (e) => {
    if (gvCur < 0) {
      // 펼친 상태에서 Esc → 모든 사진으로
      if (e.key === 'Escape' && galSel >= 0 && focused < 0 && !root.classList.contains('menu-open')) selectArtist(-1);
      return;
    }
    if (e.key === 'Escape') gvClose();
    else if (e.key === 'ArrowLeft') gvShow(gvCur - 1);
    else if (e.key === 'ArrowRight') gvShow(gvCur + 1);
  });

  /* ---------- 액세서리 ----------
     accessories.json을 불러와 분류 필터·제품 타일·상세를 채움. 타일을 누르면 오른쪽 상세가 그 제품으로 바뀌고,
     사진이 여러 장이면 점·화살표·사진 클릭으로 넘김. 구매는 모두 라이카 공식몰(MALL_URL)로 보냄 */
  // 공식몰로 가는 버튼(.mall-link: 헤더 구매하기·메뉴 라이카 공식몰·액세서리 구매/전체 보기)은 바로 이동하지 않고
  // 비공식 포트폴리오라는 안내 모달(#mallModal)을 먼저 띄움. 모달 안 버튼에서 실제 공식몰(새 탭)·포트폴리오로 이동
  const MALL_URL = 'https://www.leica-store.co.kr';
  const PORTFOLIO_URL = '#';   // '포트폴리오 더보기' 주소가 정해지면 여기만 바꾸면 됨 ('#'이면 모달만 닫힘)
  const mm = $('#mallModal');
  const mmPortfolio = $('#mmPortfolio');
  $('#mmMall').href = MALL_URL;
  mmPortfolio.href = PORTFOLIO_URL;
  if (/^https?:/.test(PORTFOLIO_URL)) { mmPortfolio.target = '_blank'; mmPortfolio.rel = 'noopener'; }
  let mmBack = null;
  function mmOpen(from) {
    mmBack = from || document.activeElement;
    mm.classList.add('open');
    mm.setAttribute('aria-hidden', 'false');
    root.classList.add('mm-lock');
    setTimeout(() => $('#mmMall').focus({ preventScroll: true }), 60);
  }
  function mmClose() {
    if (!mm.classList.contains('open')) return;
    mm.classList.remove('open');
    mm.setAttribute('aria-hidden', 'true');
    root.classList.remove('mm-lock');
    if (mmBack && mmBack.isConnected) mmBack.focus({ preventScroll: true });
  }
  document.querySelectorAll('.mall-link').forEach((a) => {
    a.setAttribute('href', MALL_URL);
    a.addEventListener('click', (e) => { e.preventDefault(); mmOpen(a); });
  });
  mm.querySelectorAll('[data-mm-close]').forEach((el) => el.addEventListener('click', mmClose));
  // 공식몰로 나가면 모달은 닫아 둠, 포트폴리오 주소가 없으면 그냥 닫힘
  $('#mmMall').addEventListener('click', () => setTimeout(mmClose, 100));
  mmPortfolio.addEventListener('click', (e) => { if (PORTFOLIO_URL === '#') e.preventDefault(); mmClose(); });
  addEventListener('keydown', (e) => {
    if (!mm.classList.contains('open')) return;
    if (e.key === 'Escape') { e.stopImmediatePropagation(); mmClose(); }
    else if (e.key === 'Tab') {   // 포커스가 모달 밖으로 나가지 않게
      const f = [...mm.querySelectorAll('button, a')];
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  }, true);
  const mmBlock = (e) => e.preventDefault();
  mm.addEventListener('wheel', mmBlock, { passive: false });
  mm.addEventListener('touchmove', mmBlock, { passive: false });
  const accEl = $('#accessories');
  const accFilter = accEl.querySelector('.acc-filter');
  const accGrid = accEl.querySelector('.acc-grid');
  const accDetail = accEl.querySelector('.acc-detail');
  const accMedia = accEl.querySelector('.acc-media');
  const accImg = accEl.querySelector('.acc-img');
  const accDots = accEl.querySelector('.acc-dots');
  const accQ = (s) => accDetail.querySelector(s);
  // 색상 이름 → 견본 색 (없는 이름은 투명 체크무늬)
  const ACC_SWATCH = { 블랙: '#1d1d1d', 실버: '#c9c9c6', 올리브: '#5f6137', 코냑: '#8e4f24', 버건디: '#6a1f2b', 오렌지: '#e2771d', 그린: '#3d7046' };
  let acc = null, accSel = -1, accPic = 0;

  function accSetImg(i) {
    const it = acc.items[accSel];
    const n = it.images.length;
    accPic = (i + n) % n;
    // 바꿀 때 효과 없음: 이전 사진이 그대로 있다가 새 사진으로 바로 교체 (처음 한 번만 로드되면 .in으로 보이게)
    accImg.onload = () => accImg.classList.add('in');
    accImg.src = acc.imageDir + it.images[accPic];
    accImg.alt = `${it.name} ${it.nameKo} 이미지 ${accPic + 1}`;
    [...accDots.children].forEach((d, j) => d.setAttribute('aria-current', String(j === accPic)));
  }
  // 타일 강조를 현재 제품에 맞춤
  function accMark() {
    accGrid.querySelectorAll('.acc-tile').forEach((t) => {
      const on = +t.dataset.i === accSel;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-pressed', String(on));
    });
  }
  function accSelect(i) {
    if (i === accSel) return;
    accSel = i;
    accMark();
    const it = acc.items[i];
    const cat = acc.categories.find((c) => c.id === it.category);
    accQ('.acc-cat').textContent = cat ? cat.name : '';
    accQ('.acc-name').textContent = it.name;
    accQ('.acc-ko').textContent = it.nameKo;
    accQ('.acc-price').innerHTML = `${it.price.toLocaleString('ko-KR')}<small>원</small>`;
    accQ('.acc-desc').textContent = it.desc;
    accQ('.acc-colors').innerHTML = it.colors.map((c, k) =>
      `<span class="acc-color" style="--k:${k}"><i${ACC_SWATCH[c] ? ` style="--c:${ACC_SWATCH[c]}"` : ' class="is-clear"'}></i>${c}</span>`).join('');
    accQ('.acc-uses').innerHTML = it.uses.map((u, k) => `<span class="acc-use" style="--k:${k + it.colors.length}">${u}</span>`).join('');
    accQ('.acc-buy').setAttribute('aria-label', `${it.name} 라이카 공식몰에서 구매하기`);
    accMedia.classList.toggle('is-single', it.images.length < 2);
    accDots.innerHTML = it.images.map((_, j) => `<button type="button" class="acc-dot" aria-label="${j + 1}번 이미지"></button>`).join('');
    accSetImg(0);
  }
  // 분류를 고르면 타일을 다시 그림. 보고 있던 제품이 빠지면 그 분류의 첫 제품으로
  function accFilterBy(id) {
    accFilter.querySelectorAll('.acc-chip').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === id)));
    const list = acc.items.map((it, i) => ({ it, i })).filter(({ it }) => id === 'all' || it.category === id);
    accGrid.innerHTML = list.map(({ it, i }, k) =>
      `<li style="--i:${k}"><button type="button" class="acc-tile" data-i="${i}" aria-pressed="false" aria-label="${it.name} ${it.nameKo}">` +
      `<span class="acc-thumb"><img src="${acc.imageDir}${it.images[0]}" alt="" decoding="async" loading="lazy"></span>` +
      `<span class="acc-tile-name">${it.name}</span></button></li>`).join('');
    accGrid.querySelectorAll('img').forEach(showWhenLoaded);
    accGrid.scrollTop = 0;
    accGrid.scrollLeft = 0;
    if (list.some(({ i }) => i === accSel)) accMark(); else accSelect(list[0].i);
  }
  fetch('accessories.json').then((r) => r.json()).then((data) => {
    acc = data;
    const n = data.notice;
    accQ('.acc-notice dl').innerHTML = [
      ['수입자', n.importer],
      ['품질보증기준', n.warranty],
      ['A/S 책임자', `${n.service} <a href="tel:${n.tel}">${n.tel}</a>`],
    ].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
    accFilter.innerHTML = [{ id: 'all', short: '전체' }, ...data.categories].map((c, i) => {
      const count = c.id === 'all' ? data.items.length : data.items.filter((it) => it.category === c.id).length;
      return `<button type="button" class="acc-chip" data-cat="${c.id}" aria-pressed="false" style="--i:${i}">${c.short}<small>${count}</small></button>`;
    }).join('');
    accFilterBy('all');
  }).catch(() => {
    accGrid.innerHTML = '<li class="acc-empty">accessories.json을 불러오지 못했습니다. Live Server 같은 로컬 서버로 열어 주세요.</li>';
    accDetail.hidden = true;
  });
  accFilter.addEventListener('click', (e) => {
    const b = e.target.closest('.acc-chip');
    if (b) accFilterBy(b.dataset.cat);
  });
  accGrid.addEventListener('click', (e) => {
    const t = e.target.closest('.acc-tile');
    if (t) accSelect(+t.dataset.i);
  });
  accDots.addEventListener('click', (e) => {
    const d = e.target.closest('.acc-dot');
    if (d) accSetImg([...accDots.children].indexOf(d));
  });
  accEl.querySelector('.acc-prev').addEventListener('click', () => accSetImg(accPic - 1));
  accEl.querySelector('.acc-next').addEventListener('click', () => accSetImg(accPic + 1));
  accEl.querySelector('.acc-plinth').addEventListener('click', () => { if (acc) accSetImg(accPic + 1); });

  // 액세서리 도착 연출: 들어올 때마다 다시 재생.
  // 20% 보이면 .in(연출 시작) → 연출이 끝나면 .arrived.
  // 화면에서 완전히 벗어나면 처음 상태로 되돌려(.in·.arrived 제거, 끝난 애니메이션 되감기) 다음에 또 재생
  let accTimer = 0;
  const accReplay = () => {
    accEl.querySelectorAll('.acc-chip, .acc-grid li, .acc-meta dd > *').forEach((el) => {
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = '';
    });
  };
  const accIO = new IntersectionObserver((list) => {
    const en = list[list.length - 1];
    if (en.intersectionRatio >= 0.2 && !accEl.classList.contains('in')) {
      accEl.classList.add('in');
      accTimer = setTimeout(() => accEl.classList.add('arrived'), 2600);
    } else if (en.intersectionRatio === 0 && accEl.classList.contains('in')) {
      clearTimeout(accTimer);
      accEl.classList.remove('in', 'arrived');
      accReplay();
    }
  }, { threshold: [0, 0.2] });
  accIO.observe(accEl);

  /* ---------- 상담 예약 ----------
     서버가 없어서 제출하면 입력 검사만 하고 화면에서 '접수 완료'로 바꿈(실제 전송 없음).
     한 번 걸린 칸은 고치는 즉시 다시 검사. 매장 선택은 직접 만든 드롭다운(↑/↓·Enter·Esc, 바깥 클릭으로 닫힘) */
  const bkEl = $('#booking');
  const bkForm = bkEl.querySelector('.bk-form');
  const bkDone = bkEl.querySelector('.bk-done');
  const bkSel = bkEl.querySelector('.bk-select');
  const bkSelBtn = bkSel.querySelector('.bk-select-btn');
  const bkSelVal = bkSel.querySelector('.bk-select-val');
  const bkList = bkSel.querySelector('.bk-options');
  const bkOpts = [...bkList.querySelectorAll('[role="option"]')];
  const bkStore = bkForm.elements.store;
  const bkSelHint = bkSelVal.textContent;
  let bkActive = -1;
  replayIn(bkEl, 2400);   // 도착 연출(들어올 때마다)
  // 반반 버전(is-split): 밝은 면이 헤더(메뉴 버튼 높이) 아래에 오면 body.head-light로 메뉴 아이콘을 어둡게.
  // 넓은 화면은 섹션 전체 높이, 1100px 이하는 폼 칸(.bk-panel)만 밝은 면
  const bkPanel = bkEl.querySelector('.bk-panel');
  const bkHeadCheck = () => {
    const r = (W() > 1100 ? bkEl : bkPanel).getBoundingClientRect();
    body.classList.toggle('head-light', bkEl.classList.contains('is-split') && r.top < 50 && r.bottom > 50);
  };
  addEventListener('scroll', bkHeadCheck, { passive: true });
  addEventListener('resize', bkHeadCheck);
  bkHeadCheck();

  function bkSetActive(i) {
    bkActive = (i + bkOpts.length) % bkOpts.length;
    bkOpts.forEach((o, j) => o.classList.toggle('is-active', j === bkActive));
    bkList.setAttribute('aria-activedescendant', bkOpts[bkActive].id);
  }
  function bkOpen(on) {
    if (on) {
      // 버튼 아래 공간이 목록보다 좁으면 위로 펼침
      const r = bkSelBtn.getBoundingClientRect();
      bkSel.classList.toggle('is-up', innerHeight - r.bottom < 320 && r.top > innerHeight - r.bottom);
    }
    bkSel.classList.toggle('is-open', on);
    bkSelBtn.setAttribute('aria-expanded', String(on));
    bkList.hidden = !on;
    if (on) {
      bkSetActive(Math.max(0, bkOpts.findIndex((o) => o.getAttribute('aria-selected') === 'true')));
      bkList.focus({ preventScroll: true });
    }
  }
  function bkPick(i) {
    bkOpts.forEach((o, j) => o.setAttribute('aria-selected', String(j === i)));
    bkStore.value = bkOpts[i].textContent;
    bkSelVal.textContent = bkOpts[i].textContent;
    bkSel.classList.add('has-value');
    bkOpen(false);
    bkSelBtn.focus({ preventScroll: true });
    if (bkSel.classList.contains('is-invalid')) bkCheck('store');
  }
  bkSelBtn.addEventListener('click', () => bkOpen(bkList.hidden));
  bkSelBtn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); bkOpen(true); }
  });
  bkList.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); bkSetActive(bkActive + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); bkSetActive(bkActive - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); bkPick(bkActive); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); bkOpen(false); bkSelBtn.focus({ preventScroll: true }); }
    else if (e.key === 'Tab') bkOpen(false);
  });
  bkOpts.forEach((o, i) => {
    o.addEventListener('click', () => bkPick(i));
    o.addEventListener('pointermove', () => { if (bkActive !== i) bkSetActive(i); });
  });
  document.addEventListener('pointerdown', (e) => {
    if (!bkList.hidden && !bkSel.contains(e.target)) bkOpen(false);
  });

  const bkRules = {
    given: () => bkForm.elements.given.value.trim() !== '',
    family: () => bkForm.elements.family.value.trim() !== '',
    email: () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bkForm.elements.email.value.trim()),
    topic: () => !!bkForm.elements.topic.value,
    mode: () => !!bkForm.elements.mode.value,
    store: () => !!bkStore.value,
    agree: () => bkForm.elements.agree.checked,
  };
  const bkField = (k) => bkForm.querySelector(`[data-field="${k}"]`);
  function bkCheck(k) {
    const ok = bkRules[k]();
    bkField(k).classList.toggle('is-invalid', !ok);
    return ok;
  }
  const bkRecheck = (e) => {
    const f = e.target.closest('[data-field]');
    if (f && f.classList.contains('is-invalid')) bkCheck(f.dataset.field);
  };
  bkForm.addEventListener('input', bkRecheck);
  bkForm.addEventListener('change', bkRecheck);
  bkForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = Object.keys(bkRules).filter((k) => !bkCheck(k));
    if (bad.length) {
      // 첫 번째로 걸린 칸으로 포커스 + 살짝 흔듦
      const f = bkField(bad[0]);
      f.classList.remove('shake');
      void f.offsetWidth;
      f.classList.add('shake');
      f.querySelector('input:not([type="hidden"]), button').focus({ preventScroll: true });
      return;
    }
    const el = bkForm.elements;
    bkDone.querySelector('.bk-done-name').textContent = el.family.value.trim() + el.given.value.trim();
    const sum = bkDone.querySelector('.bk-summary');
    sum.textContent = '';
    [['상담 내용', el.topic.value], ['희망 매장', bkStore.value], ['상담 방식', el.mode.value], ['이메일', el.email.value.trim()]].forEach(([k, v]) => {
      const row = document.createElement('div');
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = k;
      dd.textContent = v;
      row.append(dt, dd);
      sum.append(row);
    });
    bkForm.hidden = true;
    bkDone.hidden = false;
    bkDone.focus({ preventScroll: true });
  });
  bkDone.querySelector('.bk-again').addEventListener('click', () => {
    bkForm.reset();
    bkStore.value = '';
    bkOpts.forEach((o) => o.setAttribute('aria-selected', 'false'));
    bkSelVal.textContent = bkSelHint;
    bkSel.classList.remove('has-value');
    bkForm.querySelectorAll('.is-invalid').forEach((f) => f.classList.remove('is-invalid'));
    bkDone.hidden = true;
    bkForm.hidden = false;
    bkForm.elements.given.focus({ preventScroll: true });
  });

  function frame() {
    if (!dragging && focused < 0) {
      dragX += velX;
      dragY += velY;
      velX *= 0.94;
      velY *= 0.94;
      if (Math.abs(velX) < 0.002) velX = 0;
      if (Math.abs(velY) < 0.002) velY = 0;
    }
    dragY = clamp(dragY, -PITCH - tilt, PITCH - tilt);

    const rotDist = H() * ROT_VH;
    const p = clamp(scrollY / rotDist, 0, 1);       // 회전 진행도 0~1
    const off = Math.max(0, scrollY - rotDist);      // 한 바퀴 이후 내려간 거리(px)
    spin += (-360 * p - spin) * SPIN_EASE;

    const sx = tilt + dragY;
    const sy = spin + dragX;
    // 구체는 off만큼 위로 올라가고, 카메라는 같은 만큼 되돌려 화면 중앙에 남김
    world.style.transform = `translateY(${-off}px) rotateY(${sy}deg) rotateX(${sx}deg)`;
    // 제품 소개로 들어오면 카메라가 한쪽으로 비켜나며 작아짐(데스크톱은 왼쪽, 좁은 화면은 위쪽)
    const z0 = R * 0.62;
    const mag = persp / (persp - z0);   // 원근 확대율: 화면 px = 월드 px × mag
    stepFilm();
    const move = smooth(H() * 0.3, H() * 0.95, off);
    let tx = 0, ty = 0, ts = 1;
    if (move > 0 && heroW) {
      ts = 1 + (camTarget / (heroW * mag) - 1) * move;
      if (W() <= 900) ty = -H() * 0.31 * move;
      else tx = camX * move;
    }
    // 제품 소개가 끝나면 카메라가 특징 섹션으로 따라 내려와 슬라이드 오른쪽 아래 모서리에 작게 걸림.
    // 도착한 뒤에는 슬라이드 위치를 그대로 따라가므로 페이지와 함께 스크롤됨
    let rz = 0;
    const offF = off - H() * (1 + PRODUCT_STEPS * STEP_VH);   // 제품 소개 고정이 풀린 뒤 내려간 거리
    if (offF > 0 && heroW) {
      const f = smooth(0, H() * 0.9, offF);
      const sb = slideAnchor.getBoundingClientRect();   // 정면 카드 자리
      const decoW = clamp(sb.width * 0.5, 120, 240);   // 장식 카메라의 화면 폭
      const decoH = decoW * (headline.offsetHeight ? heroImg.offsetHeight / heroImg.offsetWidth : 0.6);
      const ax = (sb.left + sb.right) / 2 - W() / 2;     // 정면 카드 가로 중앙, 아래 가장자리에 걸침
      const ay = sb.bottom - decoH * 0.3 - H() / 2;
      tx += (ax - tx) * f;
      ty += (ay - ty) * f;
      const w = camTarget + (decoW - camTarget) * f;
      ts = w / (heroW * mag);
      rz = -6 * f;
    }
    headline.style.transform = `rotateX(${-sx}deg) rotateY(${-sy}deg) translateY(${off}px) translate(${tx / mag}px, ${ty / mag}px) translateZ(${z0}px) rotate(${rz}deg) scale(${ts})`;
    stepProduct(off, move);
    stepFeatures();

    body.classList.toggle('deep', scrollY > 4);
    body.classList.toggle('past', off > 1);
    body.classList.toggle('arrived', off >= H() - 2);   // 제품 소개가 화면을 완전히 채운 뒤 — 구매하기 버튼 등장

    stepUnfold(performance.now());

    // 포스터 문구: 영문(왼쪽 위) 3~16% 등장 → 국문(오른쪽 아래) 30~44% 등장 → 둘이 함께 84~96% 퇴장 (부드럽게 따라오는 spin 기준)
    // 각 문구는 카메라·사진 앞에서 등장했다가 잠시 뒤(영문 24%, 국문 54%) 구체 뒤로 물러남(.is-back)
    const ps = clamp(-spin / 360, 0, 1);
    const out = 1 - smooth(0.84, 0.96, ps);
    const sv1 = (smooth(0.03, 0.16, ps) * out).toFixed(3);
    const sv2 = (smooth(0.3, 0.44, ps) * out).toFixed(3);
    if (sv1 + sv2 !== sideV) { sideV = sv1 + sv2; sides[0].style.setProperty('--v', sv1); sides[1].style.setProperty('--v', sv2); }
    sides[0].classList.toggle('is-back', ps > 0.24);
    sides[1].classList.toggle('is-back', ps > 0.54);

    // 카드별 깊이 음영
    const rx = sx * Math.PI / 180, ry = sy * Math.PI / 180;
    const cX = Math.cos(rx), sX = Math.sin(rx), cY = Math.cos(ry), sY = Math.sin(ry);
    const shade = 1;
    const near = persp * 0.66;
    // 다음 섹션으로 넘어가는 동안 카드는 위로 올라가며 사라짐 (화면 높이의 35% 안에)
    const leave = clamp(1 - off / (H() * 0.35), 0, 1);
    vig.style.setProperty('--leave', leave);
    // 다크 섹션이 헤더 높이(약 80px)까지 올라오면 헤더 메뉴를 밝은 색으로
    const onDark = off > H() - 80;
    body.classList.toggle('on-dark', onDark);
    root.classList.toggle('on-dark', onDark); // 스크롤바 자리 배경도 맞춤
    for (let i = 0; i < N; i++) {
      const c = cards[i];
      const z1 = -c.y * sX + c.z * cX;
      const zf = -c.x * sY + z1 * cY;
      const base = 0.14 + 0.86 * Math.pow((zf + 1) / 2, 0.85);
      let dim = shade * (1 - base);
      if (focused >= 0) dim = Math.min(1, dim + 0.78);
      const absZ = zf * R;
      let fade = absZ > near ? Math.max(0, 1 - (absZ - near) / 190) : 1;
      if (i === focused) fade = 0;
      fade *= Math.min(1, c.k * 2); // 펼쳐지기 전에는 숨김
      fade *= leave;

      const d = Math.round(dim * 1000) / 1000;
      const op = Math.round(fade * 1000) / 1000;
      if (d !== c.d) { c.d = d; c.el.style.setProperty('--d', d); }
      if (op !== c.op) { c.op = op; c.el.style.opacity = op; }
    }

    if (fineCursor) {
      dotX += (curX - dotX) * 0.2;
      dotY += (curY - dotY) * 0.2;
      dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
    }

    requestAnimationFrame(frame);
  }

  /* ---------- 드래그 ---------- */
  let ptr = null;
  const DEG_PER_PX = 0.13;

  stage.addEventListener('pointerdown', (e) => {
    if (focused >= 0) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const card = e.target.closest('.card'); // 캡처로 타깃이 바뀌기 전에 기록
    const immediate = e.pointerType !== 'touch';
    ptr = {
      id: e.pointerId, x0: e.clientX, y0: e.clientY, lx: e.clientX, ly: e.clientY,
      card, decided: immediate, active: immediate, dist: 0, t: performance.now()
    };
    if (immediate) {
      try { stage.setPointerCapture(e.pointerId); } catch (_) {}
      dragging = true;
      velX = velY = 0;
    }
  });

  stage.addEventListener('pointermove', (e) => {
    if (!ptr || e.pointerId !== ptr.id) return;
    const dx = e.clientX - ptr.x0, dy = e.clientY - ptr.y0;
    ptr.dist = Math.max(ptr.dist, Math.hypot(dx, dy));

    if (!ptr.decided) {
      if (Math.hypot(dx, dy) < 10) return;
      ptr.decided = true;
      if (Math.abs(dy) > Math.abs(dx) * 1.15) { ptr = null; return; } // 세로 스와이프 → 페이지 스크롤
      try { stage.setPointerCapture(e.pointerId); } catch (_) {}
      ptr.active = true;
      dragging = true;
      velX = velY = 0;
      ptr.lx = e.clientX; ptr.ly = e.clientY;
    }
    if (!ptr.active) return;

    const mx = (e.clientX - ptr.lx) * DEG_PER_PX;
    const my = -(e.clientY - ptr.ly) * DEG_PER_PX;
    ptr.lx = e.clientX; ptr.ly = e.clientY;
    ptr.t = performance.now();
    dragX += mx;
    dragY = clamp(dragY + my, -PITCH - tilt, PITCH - tilt);
    velX = mx;
    velY = my;
  });

  function endPointer(e, cancelled) {
    if (!ptr || e.pointerId !== ptr.id) return;
    const slop = coarse ? 14 : 6;
    if (!cancelled && ptr.dist < slop && ptr.card) {
      velX = velY = 0;
      openShot(+ptr.card.dataset.idx, ptr.card);
    } else if (performance.now() - ptr.t > 90) {
      velX = velY = 0; // 멈춘 뒤 놓으면 관성 없음
    }
    dragging = false;
    ptr = null;
  }
  stage.addEventListener('pointerup', (e) => endPointer(e, false));
  stage.addEventListener('pointercancel', (e) => endPointer(e, true));

  /* ---------- 라이트박스 ---------- */
  let litToken = 0;
  let litSource = null;
  let closeTimer = 0;

  function flipFrom(el) {
    const cr = el.getBoundingClientRect();
    const pr = plate.getBoundingClientRect();
    const s = Math.max(0.04, cr.width / (pr.width || 1));
    return `translate(${cr.left - pr.left}px, ${cr.top - pr.top}px) scale(${s})`;
  }

  function openShot(i, srcEl) {
    if (focused >= 0 || !SHOTS[i]) return;
    const s = SHOTS[i];
    const token = ++litToken;
    focused = i;
    litSource = srcEl;
    clearTimeout(closeTimer);

    // 이미 디코드된 카드 이미지를 먼저 보여주고, 원본은 로드 완료 후 교체
    litImg.classList.remove('in');
    litImg.removeAttribute('src');
    litImg.alt = altOf(i);
    if (cardSrc[i]) {
      litImg.src = cardSrc[i];
      litImg.classList.add('in');
      const fullUrl = IMG_DIR + (s.full || s.file);
      const im = new Image();
      im.onload = () => {
        if (token !== litToken || focused !== i) return;
        litImg.src = fullUrl;
        litImg.classList.add('in');
      };
      im.src = fullUrl;
    }

    root.style.overflow = 'hidden';
    lit.scrollTop = 0;
    body.classList.add('lit');
    lit.setAttribute('aria-hidden', 'false');

    plate.style.transition = 'none';
    plate.style.transform = 'none';
    plate.style.opacity = '';
    const t = flipFrom(srcEl);
    plate.style.transform = t;
    plate.style.opacity = '0';
    void plate.offsetWidth;
    plate.style.transition = '';
    plate.style.transform = '';
    plate.style.opacity = '';
  }

  function closeShot() {
    if (focused < 0) return;
    const i = focused;
    focused = -1;
    litToken++;
    body.classList.remove('lit');
    lit.setAttribute('aria-hidden', 'true');
    root.style.overflow = '';

    const target = litSource || cards[i].el;
    plate.style.transition = 'none';
    plate.style.transform = 'none';
    const t = flipFrom(target);
    void plate.offsetWidth;
    plate.style.transition = '';
    plate.style.transform = t;
    plate.style.opacity = '0';

    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      if (focused >= 0) return;
      plate.style.transition = 'none';
      plate.style.transform = '';
      plate.style.opacity = '';
      void plate.offsetWidth;
      plate.style.transition = '';
    }, 640);
  }

  lit.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) closeShot();
  });

  /* ---------- 메뉴 ---------- */
  function setMenu(on) {
    body.classList.toggle('menu-open', on);
    root.classList.toggle('menu-open', on); // 스크롤바 자리 배경도 메뉴 색으로
    menuBtn.setAttribute('aria-expanded', String(on));
    menuBtn.setAttribute('aria-label', on ? 'Close menu' : 'Open menu');
    // 아이콘(선 세 개 ↔ X)은 CSS가 body.menu-open을 보고 바꿈
    menu.setAttribute('aria-hidden', String(!on));
  }
  menuBtn.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  // 메뉴 링크: 부드러운 스크롤로 무거운 섹션(구체·고정 섹션)을 지나가면 버벅여서,
  // 불투명한 메뉴가 화면을 덮고 있는 동안 목적지로 즉시 이동한 뒤 메뉴를 걷어 냄(막이 올라가듯 새 섹션이 드러남)
  let menuJumpT = 0;
  menu.querySelectorAll('a[data-close-menu]').forEach((a) => {
    a.addEventListener('click', (e) => {
      if (a.classList.contains('mall-link')) { setMenu(false); return; }   // 공식몰: 메뉴를 닫고 안내 모달(위 .mall-link 처리)
      e.preventDefault();
      const target = a.dataset.scroll && document.getElementById(a.dataset.scroll);
      if (!target) { setMenu(false); return; }
      const isGallery = target === galleryEl;
      if (isGallery) galResetIntro();
      // 이동하는 동안 섹션 사이 자동 이동이 끼어들지 않게(autoTo: 도착하면 풀림)
      autoTo = target.offsetTop;
      scrollTo({ top: autoTo, behavior: 'instant' });
      clearTimeout(menuJumpT);
      // 구체·고정 섹션이 새 위치로 한두 프레임 그려질 시간을 준 뒤 메뉴를 걷음
      menuJumpT = setTimeout(() => {
        autoTo = -1;
        setMenu(false);
        if (isGallery) galPlayIntro();
      }, 160);
    });
  });

  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (focused >= 0) closeShot();
    else if (body.classList.contains('menu-open')) setMenu(false);
  });

  /* ---------- 커스텀 커서 ---------- */
  if (fineCursor) {
    addEventListener('pointermove', (e) => {
      curX = e.clientX;
      curY = e.clientY;
      if (!dot.classList.contains('on')) {
        dotX = curX; dotY = curY;
        dot.classList.add('on');
      }
    }, { passive: true });
    addEventListener('pointerover', (e) => {
      const t = e.target instanceof Element ? e.target : null;
      const view = !!(t && t.closest('.g-open'));   // 갤러리 사진 위: VIEW 커서
      dot.classList.toggle('view', view);
      dot.classList.toggle('wide', !view && !!(t && t.closest('.card, a, button, .bk-chip, .bk-mode, .bk-agree label')));
      // 상담 예약의 밝은 면 위(반반 버전은 폼 칸 전체 — 밝은 면은 .bk-panel::before라 대상이 .bk-panel로 잡힘)
      dot.classList.toggle('soft', !!(t && t.closest('.bk.is-split .bk-panel, .bk.is-light .bk-form, .bk.is-light .bk-done')));
    });
    document.addEventListener('pointerleave', () => dot.classList.remove('on'));
  }

  /* ---------- 이미지 로딩 ---------- */
  // file:// 에서는 canvas가 오염(tainted)되므로 축소 없이 원본 경로를 그대로 사용
  const canCanvas = location.protocol !== 'file:';
  const cardSrc = new Array(N).fill(null);

  function decodeMax() {
    const w = W();
    return w <= 380 ? 420 : w <= 640 ? 520 : w <= 900 ? 640 : 760;
  }

  function probe(url) {
    return new Promise((resolve, reject) => {
      const im = new Image();
      if (canCanvas) im.crossOrigin = 'anonymous';
      im.decoding = 'async';
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = url;
    });
  }

  async function prepare(url, cap) {
    const im = await probe(url); // 파일이 없으면 reject → 빈 슬롯 유지
    if (!canCanvas || im.naturalWidth <= cap) return url;
    try {
      const c = document.createElement('canvas');
      c.width = cap;
      c.height = Math.max(1, Math.round(im.naturalHeight * (cap / im.naturalWidth)));
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      const blob = await new Promise((r) => c.toBlob(r, 'image/webp', 0.88));
      return blob ? URL.createObjectURL(blob) : url;
    } catch (_) {
      return url;
    }
  }

  function show(img, src) {
    img.onload = () => img.classList.add('in');
    img.src = src;
  }

  /* ---------- 스플래시 진행률 (사진 21장) ---------- */
  const TOTAL = N;
  const SPLASH_MIN = 1440; // 로딩 화면 최소 노출 시간(ms) — 로고·문구 등장 애니메이션이 끝날 때까지
  const born = performance.now();
  let reported = 0;
  let splashDone = false;

  function report() {
    reported++;
    bar.style.transform = `scaleX(${Math.min(1, reported / TOTAL)})`;
    if (reported >= TOTAL) {
      setTimeout(endSplash, Math.max(0, SPLASH_MIN - (performance.now() - born)));
    }
  }
  setTimeout(endSplash, 9000);

  function endSplash() {
    if (splashDone) return;
    splashDone = true;
    bar.style.transform = 'scaleX(1)';
    setTimeout(() => {
      splash.classList.add('out');
      reveal();
      setTimeout(() => splash.remove(), 700);
    }, 450);   // 막대가 끝까지 찬 뒤 잠깐 멈췄다가 페이드아웃
  }

  const cap = decodeMax();
  SHOTS.forEach((s, i) => {
    prepare(IMG_DIR + s.file, cap)
      .then((src) => {
        cardSrc[i] = src;
        show(cards[i].img, src);
      })
      .catch(() => {})
      .finally(report);
  });

  /* ---------- 공개: 스플래시가 걷히면 바로 메인 화면 ---------- */
  let revealed = false;

  function reveal() {
    if (revealed) return;
    revealed = true;
    body.classList.remove('locked');
    root.style.overflow = '';
    root.classList.remove('loading');
    layout(true);
    requestAnimationFrame(() => layout(true));
    body.classList.add('revealed');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) finishUnfold();
    else unfoldStart = performance.now() + UNFOLD_DELAY;
  }

  /* ---------- 시작: 스플래시 동안 구체는 이미 완성된 상태로 돌아감 ---------- */
  layout(true);
  frame();
})();
