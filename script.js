// Main interactive script for the premium portfolio
// Initializes Vanta.js (matrix/particle background), Typed.js typing effect,
// AOS scroll animations, and adds small UI helpers (contact/copy email).

/* ============ CONFIG (constants & settings) ============ */
const CONFIG = {
	contact: { email: 'lokeshgaula@gmail.com' },
	typed: {
		strings: ['Aspiring Cyber Security Engineer', 'Software Developer', 'Bug Bounty Enthusiast', 'Secure Code Advocate'],
		typeSpeed: 55,
		backSpeed: 30,
		backDelay: 1500
	},
	aos: { once: false, mirror: true, duration: 800, easing: 'ease-out-cubic' },
	vanta: {
		color: 0x58a6ff,
		backgroundAlpha: 0.0,
		points: 12.00,
		maxDistance: 22.00,
		spacing: 17.00,
		scale: 1.0,
		scaleMobile: 1.0,
		minHeight: 200,
		minWidth: 200,
		mouseControls: true,
		touchControls: true,
		gyroControls: false
	},
	storage: { key: 'portfolio-assignments' }
};

let vantaEffect = null;

function initVanta() {
	const heroEl = document.querySelector('#hero');
	if (!heroEl) return;

	const startVanta = () => {
		if (vantaEffect) return;
		
		const loadScript = (src) => new Promise((resolve, reject) => {
			const s = document.createElement('script');
			s.src = src; s.async = true; s.onload = resolve; s.onerror = reject;
			document.head.appendChild(s);
		});

		const init = () => {
			try {
				if (window.VANTA?.NET) {
					vantaEffect = VANTA.NET({ el: '#hero', ...CONFIG.vanta });
				}
			} catch (e) {
				console.warn('Vanta init failed', e);
			}
		};

		if (window.VANTA?.NET) return init();

		loadScript('https://cdn.jsdelivr.net/npm/three@0.124.0/build/three.min.js')
			.then(() => loadScript('https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js'))
			.then(init)
			.catch(err => console.warn('Failed to load Vanta', err));
	};

	// Lazy load on visibility
	if ('IntersectionObserver' in window) {
		const io = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting) { startVanta(); io.disconnect(); }
		}, { rootMargin: '300px' });
		io.observe(heroEl);
		setTimeout(() => { if (!vantaEffect) startVanta(); }, 2000);
	} else {
		setTimeout(startVanta, 1500);
	}
}

function initTyped() {
	if (window.Typed) {
		new Typed('#typed', {
			...CONFIG.typed,
			loop: true,
			showCursor: true,
			cursorChar: '|'
		});
	}
}

function initAOS() {
	if (window.AOS) {
		AOS.init(CONFIG.aos);
	}
}

function initGSAP() {
	if (window.gsap) {
		const hero = document.querySelector('.hero-content');
		if (hero) {
			gsap.from(hero, { y: 20, autoAlpha: 0, duration: 1, ease: 'power3.out' });
		}

		// small hover tilt on project cards
		document.querySelectorAll('.project-card').forEach(card => {
			card.addEventListener('mousemove', (e) => {
				const rect = card.getBoundingClientRect();
				const x = e.clientX - rect.left - rect.width / 2;
				const y = e.clientY - rect.top - rect.height / 2;
				gsap.to(card, { rotationY: x / 40, rotationX: -y / 40, duration: 0.4, transformPerspective: 500 });
			});
			card.addEventListener('mouseleave', () => {
				gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.6 });
			});
		});
	}
}

function submitContact(e) {
	e.preventDefault();
	const form = e.target;
	const name = form.name.value || 'No name';
	const email = form.email.value || CONFIG.contact.email;
	const message = form.message.value || '';

	const subject = encodeURIComponent('Portfolio contact from ' + name);
	const body = encodeURIComponent('From: ' + email + '\n\n' + message);
	const mailto = `mailto:${CONFIG.contact.email}?subject=${subject}&body=${body}`;

	try { window.location.href = mailto; } catch (err) { }
	try { 
		const a = document.createElement('a');
		a.href = mailto; a.style.display = 'none'; document.body.appendChild(a); a.click(); a.remove();
	} catch (err) { }
	try { window.open(mailto, '_self'); } catch (err) { }

	setTimeout(() => {
		showToast('If no mail app opened, you can copy the message or open Gmail.');
		showFallbackPanel(CONFIG.contact.email, subject, body, mailto);
	}, 900);

	return false;
}

function showFallbackPanel(to, subject, body, mailto) {
	// remove existing panel if any
	const existing = document.getElementById('fallback-panel');
	if (existing) return;

	const panel = document.createElement('div');
	panel.id = 'fallback-panel';
	panel.className = 'fallback-panel glass';
	panel.innerHTML = `
		<div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
			<div style="flex:1">
				<strong>No mail app opened?</strong>
				<div style="color:var(--muted);font-size:13px;margin-top:6px">Choose an action: open Gmail compose or copy the message to clipboard.</div>
			</div>
			<div style="display:flex;gap:8px">
				<button class="btn primary" id="open-gmail">Open Gmail</button>
				<button class="btn ghost" id="copy-msg">Copy Message</button>
				<button class="btn" id="close-panel">Close</button>
			</div>
		</div>
	`;
	document.body.appendChild(panel);

	document.getElementById('open-gmail').addEventListener('click', () => {
		const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${subject}&body=${body}`;
		window.open(gmail, '_blank');
	});

	document.getElementById('copy-msg').addEventListener('click', () => {
		const text = `To: ${to}\nSubject: ${decodeURIComponent(subject)}\n\n${decodeURIComponent(body)}`;
		if (navigator.clipboard && window.isSecureContext) {
			navigator.clipboard.writeText(text).then(() => showToast('Message copied to clipboard'));
		} else {
			const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
			try { document.execCommand('copy'); showToast('Message copied to clipboard'); } catch (err) { showToast('Copy failed'); }
			ta.remove();
		}
	});

	document.getElementById('close-panel').addEventListener('click', () => {
		panel.remove();
	});
}

function copyEmail() {
	if (navigator.clipboard && window.isSecureContext) {
		navigator.clipboard.writeText(CONFIG.contact.email).then(() => showToast('Email copied'));
	} else {
		const el = document.createElement('textarea');
		el.value = CONFIG.contact.email; document.body.appendChild(el); el.select();
		try { document.execCommand('copy'); showToast('Email copied'); } catch (err) { showToast('Copy failed'); }
		el.remove();
	}
}

function showToast(msg) {
	const t = document.createElement('div');
	t.textContent = msg; t.style.position = 'fixed'; t.style.right = '20px'; t.style.bottom = '20px';
	t.style.background = 'linear-gradient(90deg, rgba(88,166,255,0.12), rgba(123,97,255,0.12))';
	t.style.padding = '10px 14px'; t.style.borderRadius = '10px'; t.style.color = '#bfeaff';
	t.style.backdropFilter = 'blur(6px)'; t.style.zIndex = 99999; document.body.appendChild(t);
	setTimeout(() => { t.style.opacity = '0'; setTimeout(()=>t.remove(),300); }, 1800);
}

// Smooth anchor scroll for internal links
function initSmoothScroll() {
	document.querySelectorAll('a[href^="#"]').forEach(a => {
		a.addEventListener('click', (e) => {
			const href = a.getAttribute('href');
			if (href.length > 1) {
				e.preventDefault();
				const el = document.querySelector(href);
				if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		});
	});
}

// Initialize everything once DOM is ready (script is deferred)
document.addEventListener('DOMContentLoaded', () => {
	// Attach contact form and copy email handlers
	const contactForm = document.getElementById('contact-form');
	const copyEmailBtn = document.getElementById('copy-email-btn');
	if (contactForm) contactForm.addEventListener('submit', submitContact);
	if (copyEmailBtn) copyEmailBtn.addEventListener('click', copyEmail);

	initVanta();
	initTyped();
	initAOS();
	initGSAP();
	initSmoothScroll();
	initAssignments();
	initProjectPreviews();
	initKineticCursor();
	initHeroButtonEffects();
	initSkillBarAnimations();
	initViewToggle();
});

// cleanup Vanta on unload to prevent leaks
window.addEventListener('beforeunload', () => {
	if (vantaEffect && typeof vantaEffect.destroy === 'function') vantaEffect.destroy();
});

/* Project preview handlers (open modal showing preview content) */
function initProjectPreviews(){
	const modal = document.getElementById('preview-modal');
	const content = document.getElementById('preview-content');
	const meta = document.getElementById('preview-meta');
	const close = document.getElementById('preview-close');
	if (!modal) return;

	document.querySelectorAll('.project-card').forEach(card => {
		const title = card.dataset.previewTitle || card.querySelector('h4')?.textContent || 'Preview';
		const btn = card.querySelector('[data-action="open-preview"]');
		if (btn) btn.addEventListener('click', (e) => { e.preventDefault(); openPreview(card); });
		card.addEventListener('click', (e) => { if (e.target.closest('[data-action]')) return; openPreview(card); });
	});

	close.addEventListener('click', () => { modal.classList.remove('show'); modal.setAttribute('aria-hidden', 'true'); });
	modal.addEventListener('click', (e) => { if (e.target === modal) { modal.classList.remove('show'); modal.setAttribute('aria-hidden', 'true'); } });

	function openPreview(card){
		const type = card.dataset.previewType || 'image';
		const src = card.dataset.previewSrc || '';
		const title = card.dataset.previewTitle || card.querySelector('h4')?.textContent || '';
		content.innerHTML = '';
		meta.textContent = title;
		// If a preview src isn't provided, show a simulated terminal/code snapshot for effect
		if (!src) {
			content.innerHTML = `<pre style="white-space:pre-wrap;color:#bfeaff">// ${escapeHtml(title)}\n// This is a preview placeholder. Replace data-preview-src on the card with an image or video URL to show a real preview.</pre>`;
		} else if (type === 'video') {
			const v = document.createElement('video'); v.src = src; v.autoplay = true; v.muted = true; v.loop = true; v.controls = true; v.style.width='100%'; content.appendChild(v);
		} else {
			const img = document.createElement('img'); img.src = src; img.alt = title; img.style.width='100%'; img.style.borderRadius='8px'; content.appendChild(img);
		}
		modal.classList.add('show'); modal.setAttribute('aria-hidden', 'false');
	}
}

/* Kinetic cursor implementation */
function initKineticCursor(){
	const dot = document.createElement('div'); dot.className = 'cursor-dot'; document.body.appendChild(dot);
	let mouseX = 0, mouseY = 0, dotX = 0, dotY = 0;
	window.addEventListener('mousemove', (e)=>{ mouseX = e.clientX; mouseY = e.clientY; dot.style.left = mouseX + 'px'; dot.style.top = mouseY + 'px'; });

	// enlarge on interactive elements
	document.querySelectorAll('a, button, .project-card').forEach(el => {
		el.addEventListener('mouseenter', () => dot.classList.add('big'));
		el.addEventListener('mouseleave', () => dot.classList.remove('big'));
	});

	// gentle trailing effect
	function animate(){ dotX += (mouseX - dotX) * 0.2; dotY += (mouseY - dotY) * 0.18; dot.style.transform = `translate(${dotX - mouseX}px, ${dotY - mouseY}px)`; requestAnimationFrame(animate); }
	requestAnimationFrame(animate);

	// Hero parallax: move hero-foreground slightly with mouse
	const fg = document.querySelector('.hero-foreground');
	if (fg && window.gsap) {
		window.addEventListener('mousemove', (e) => {
			const x = (e.clientX / window.innerWidth - 0.5) * 30;
			const y = (e.clientY / window.innerHeight - 0.5) * 20;
			gsap.to(fg, { x: x, y: y, duration: 0.9, ease: 'power3.out' });
		});
		// small scroll parallax
		window.addEventListener('scroll', () => { const s = window.scrollY; gsap.to(fg, { y: s * -0.02, duration: 0.6, ease: 'power3.out' }); });
	}
}

/* Resume generation using jsPDF (client-side) */
/* Resume feature removed — initResumeButton() deleted */

/* Skill bar animation: animate span width when visible */
function initSkillBarAnimations(){
	const bars = document.querySelectorAll('.skill-bar');
	if (!bars.length) return;

	// Add visible percentage labels to each skill card (keeps UI consistent)
	document.querySelectorAll('.skill').forEach(s => {
		const level = s.querySelector('.skill-bar')?.dataset.level;
		if (level && !s.querySelector('.level')){
			const lbl = document.createElement('div'); lbl.className = 'level'; lbl.textContent = level + '%';
			s.appendChild(lbl);
		}
	});
	const io = new IntersectionObserver(entries => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				const el = entry.target;
				const level = parseInt(el.dataset.level || '0',10);
				const span = el.querySelector('span');
				if (span) span.style.width = level + '%';
				// unobserve if you want single-run, else leave to animate each time
				io.unobserve(el);
			}
		});
	}, { threshold: 0.25 });
	bars.forEach(b => io.observe(b));
}

/* Hero button dynamic effects: add sheen element and particle burst on hover */
function initHeroButtonEffects(){
	const buttons = document.querySelectorAll('.hero .btn');
	if (!buttons || !window.gsap) return;

	buttons.forEach(btn => {
		// Add sheen element if missing
		if (!btn.querySelector('.sheen')){
			const s = document.createElement('span'); s.className = 'sheen'; btn.appendChild(s);
		}

		// Hover particle burst
		btn.addEventListener('mouseenter', (e) => {
			// small scale pop
			gsap.to(btn, { scale: 1.03, duration: 0.18, ease: 'power2.out' });
			// create multiple particles
			for (let i=0;i<8;i++){
				const p = document.createElement('div'); p.className='particle';
				btn.appendChild(p);
				const rect = btn.getBoundingClientRect();
				const x = e.clientX - rect.left; const y = e.clientY - rect.top;
				p.style.left = (x - 4) + 'px'; p.style.top = (y - 4) + 'px';
				const angle = Math.random()*Math.PI*2; const dist = 40 + Math.random()*40;
				const dx = Math.cos(angle)*dist; const dy = Math.sin(angle)*dist;
				gsap.to(p, { x: dx, y: dy, scale: 0.3 + Math.random()*0.8, opacity:0, duration: 0.9+Math.random()*0.6, ease:'power3.out', onComplete: ()=>p.remove() });
			}
		});

		btn.addEventListener('mouseleave', () => {
			gsap.to(btn, { scale: 1, duration: 0.32, ease: 'power3.out' });
		});
	});
}

/* View actions for video and presentation (embedded vs new tab) */
function initViewToggle(){
	// Handle embedded view buttons
	document.querySelectorAll('[data-action="watch-embedded"], [data-action="view-embedded"]').forEach(btn => {
		btn.addEventListener('click', () => {
			const target = btn.dataset.target;
			const section = document.getElementById(target);
			if (!section) return;

			// Get the embedded view and actions container
			const embeddedView = section.querySelector('.embedded-view');
			const actionsDiv = section.querySelector('.view-actions');
			const prompt = section.querySelector('.container-prompt');

			// Hide actions and prompt, show embedded view
			if (actionsDiv) actionsDiv.classList.add('hidden');
			if (prompt) prompt.classList.add('hidden');
			if (embeddedView) embeddedView.classList.remove('hidden');
		});
	});

	// Handle new tab view buttons
	document.querySelectorAll('[data-action="watch-newtab"], [data-action="view-newtab"]').forEach(btn => {
		btn.addEventListener('click', () => {
			const videoUrl = 'https://drive.google.com/file/d/1E8ZXCY-qeCePOB9ibjWykqNmSVNkGCo1/view?usp=drivesdk';
			const presentationUrl = 'https://docs.google.com/presentation/d/1P_JjrDrlDfJfoyyHZSXI4VeVfYrtIoFH/edit?usp=drivesdk';
			
			const target = btn.dataset.target;
			const url = target === 'video-intro' ? videoUrl : presentationUrl;
			
			window.open(url, '_blank');
		});
	});

	// Handle back button clicks
	document.querySelectorAll('.btn-back').forEach(btn => {
		btn.addEventListener('click', () => {
			const target = btn.dataset.target;
			const section = document.getElementById(target);
			if (!section) return;

			// Get the embedded view and actions container
			const embeddedView = section.querySelector('.embedded-view');
			const actionsDiv = section.querySelector('.view-actions');
			const prompt = section.querySelector('.container-prompt');

			// Show actions and prompt, hide embedded view
			if (actionsDiv) actionsDiv.classList.remove('hidden');
			if (prompt) prompt.classList.remove('hidden');
			if (embeddedView) embeddedView.classList.add('hidden');
		});
	});
}
/* ============ Assignments (localStorage-backed storage) ============ */
/* Using localStorage instead of IndexedDB - simpler, sufficient for file metadata */

function getAssignments() {
	try {
		const data = localStorage.getItem(CONFIG.storage.key);
		return data ? JSON.parse(data) : [];
	} catch (e) {
		console.warn('Failed to load assignments', e);
		return [];
	}
}

function saveAssignments(items) {
	try {
		localStorage.setItem(CONFIG.storage.key, JSON.stringify(items));
		return true;
	} catch (e) {
		console.warn('Failed to save assignments', e);
		return false;
	}
}

function addAssignment(file) {
	const items = getAssignments();
	const reader = new FileReader();
	reader.onload = (e) => {
		items.push({
			id: Date.now(),
			name: file.name,
			type: file.type,
			size: file.size,
			data: e.target.result,
			ts: Date.now()
		});
		if (saveAssignments(items)) {
			renderAssignments(items);
			showToast('File added');
		}
	};
	reader.readAsDataURL(file);
}

function deleteAssignment(id) {
	const items = getAssignments();
	const filtered = items.filter(it => it.id !== id);
	if (saveAssignments(filtered)) {
		renderAssignments(filtered);
		showToast('Deleted');
	}
}

function clearAllAssignments() {
	if (saveAssignments([])) {
		renderAssignments([]);
		showToast('Cleared');
	}
}

function renderAssignments(items) {
	const ul = document.getElementById('assignments-list');
	if (!ul) return;
	ul.innerHTML = '';
	if (!items.length) {
		ul.innerHTML = '<li class="muted">No assignments saved.</li>';
		return;
	}
	for (const it of items) {
		const li = document.createElement('li'); li.className = 'file-item';
		const meta = document.createElement('div'); meta.className = 'meta';
		meta.innerHTML = `<div><strong>${escapeHtml(it.name)}</strong></div><div class="muted">${formatBytes(it.size)} • ${new Date(it.ts).toLocaleString()}</div>`;
		const actions = document.createElement('div'); actions.className = 'actions';
		const dl = document.createElement('button'); dl.className = 'btn ghost'; dl.textContent = 'Download';
		dl.addEventListener('click', () => {
			try {
				const a = document.createElement('a');
				a.href = it.data;
				a.download = it.name;
				document.body.appendChild(a);
				a.click();
				a.remove();
			} catch (err) {
				showToast('Download failed');
			}
		});
		const del = document.createElement('button'); del.className = 'btn'; del.textContent = 'Delete';
		del.addEventListener('click', () => deleteAssignment(it.id));
		actions.appendChild(dl); actions.appendChild(del);
		li.appendChild(meta); li.appendChild(actions); ul.appendChild(li);
	}
}

function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function formatBytes(bytes){ 
	if (bytes < 1024) return bytes + ' B';
	if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
	return (bytes / 1048576).toFixed(2) + ' MB';
}

function initAssignments(){
	const input = document.getElementById('assignment-input');
	const choose = document.getElementById('choose-files');
	const uploadArea = document.getElementById('upload-area');
	const saveBtn = document.getElementById('save-files');
	const clearBtn = document.getElementById('clear-assignments');

	if (!input || !choose || !uploadArea) return;

	choose.addEventListener('click', () => input.click());
	uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
	uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
	uploadArea.addEventListener('drop', (e) => {
		e.preventDefault(); uploadArea.classList.remove('dragover');
		const files = Array.from(e.dataTransfer.files || []);
		if (files.length) input.files = toFileList(files);
	});

	input.addEventListener('change', () => {
		showToast(input.files.length + ' file(s) selected');
	});

	saveBtn?.addEventListener('click', () => {
		const files = Array.from(input.files || []);
		if (!files.length) { showToast('No files selected'); return; }
		files.forEach(f => addAssignment(f));
		input.value = '';
	});

	clearBtn?.addEventListener('click', () => {
		if (confirm('Clear all saved assignments?')) clearAllAssignments();
	});

	renderAssignments(getAssignments());
}

function toFileList(files){
	const dataTransfer = new DataTransfer(); files.forEach(f => dataTransfer.items.add(f)); return dataTransfer.files;
}


console.log('Premium portfolio script initialized');
