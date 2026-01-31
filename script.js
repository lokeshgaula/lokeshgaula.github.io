// Main interactive script for the premium portfolio
// Initializes Vanta.js (matrix/particle background), Typed.js typing effect,
// AOS scroll animations, and adds small UI helpers (contact/copy email).

let vantaEffect = null;

function initVanta() {
	try {
		if (window.VANTA && window.VANTA.NET) {
			vantaEffect = VANTA.NET({
				el: '#hero',
				mouseControls: true,
				touchControls: true,
				gyroControls: false,
				minHeight: 200.00,
				minWidth: 200.00,
				scale: 1.0,
				scaleMobile: 1.0,
				color: 0x58a6ff,
				backgroundAlpha: 0.0,
				points: 12.00,
				maxDistance: 22.00,
				spacing: 17.00
			});
		}
	} catch (e) {
		console.warn('Vanta init failed', e);
	}
}

function initTyped() {
	if (window.Typed) {
		new Typed('#typed', {
			strings: [
				'Aspiring Cyber Security Engineer',
				'Software Developer',
				'Bug Bounty Enthusiast',
				'Secure Code Advocate'
			],
			typeSpeed: 55,
			backSpeed: 30,
			backDelay: 1500,
			loop: true,
			showCursor: true,
			cursorChar: '|'
		});
	}
}

function initAOS() {
	if (window.AOS) {
		// Allow animations to replay each time elements enter the viewport
		// and animate out when scrolling past (mirror) so they reset when you scroll back up.
		AOS.init({
			once: false,
			mirror: true,
			duration: 800,
			easing: 'ease-out-cubic'
		});
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
	const email = form.email.value || 'lokeshgaula@gmail.com';
	const message = form.message.value || '';

	// Open default mail client with prefilled values as a simple, reliable action
	const subject = encodeURIComponent('Portfolio contact from ' + name);
	const body = encodeURIComponent('From: ' + email + '\n\n' + message);
	const to = 'lokeshgaula@gmail.com';
	const mailto = `mailto:${to}?subject=${subject}&body=${body}`;

	// Try different ways to trigger the mail client (some browsers/OS combinations behave differently)
	try {
		// 1) navigation
		window.location.href = mailto;
	} catch (err) {
		// ignore
	}

	try {
		// 2) programmatic anchor click
		const a = document.createElement('a');
		a.href = mailto;
		a.style.display = 'none';
		document.body.appendChild(a);
		a.click();
		a.remove();
	} catch (err) { /* ignore */ }

	try {
		// 3) window.open (some setups open default app chooser)
		window.open(mailto, '_self');
	} catch (err) { /* ignore */ }

	// After attempting, show a small fallback with alternatives in case the OS has no default mail handler
	setTimeout(() => {
		showToast('If no mail app opened, you can copy the message or open Gmail.');
		showFallbackPanel(to, subject, body, mailto);
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
	const email = 'lokeshgaula@gmail.com';
	if (navigator.clipboard && window.isSecureContext) {
		navigator.clipboard.writeText(email).then(() => showToast('Email copied to clipboard'));
	} else {
		// fallback
		const el = document.createElement('textarea');
		el.value = email; document.body.appendChild(el); el.select();
		try { document.execCommand('copy'); showToast('Email copied to clipboard'); } catch (err) { showToast('Copy failed'); }
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
	initVanta();
	initTyped();
	initAOS();
	initGSAP();
	initSmoothScroll();
	initAssignments();
	initProjectPreviews();
	initKineticCursor();
});

// cleanup Vanta on unload to prevent leaks
window.addEventListener('beforeunload', () => {
	if (vantaEffect && typeof vantaEffect.destroy === 'function') vantaEffect.destroy();
});

// expose some helpers to inline HTML
window.submitContact = submitContact;
window.copyEmail = copyEmail;

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

/* -------------------- Assignments (IndexedDB-backed temporary storage) -------------------- */
const ASSIGN_DB = 'portfolio-db';
const ASSIGN_STORE = 'assignments';

/* Cloudinary / public manifest settings
	Replace the placeholders below with your Cloudinary cloud name and unsigned upload preset.
	To make uploaded assignments visible to all visitors, set up a small public endpoint
	(for example a Google Apps Script web app or other webhook) that accepts POST requests
	to append metadata to a publicly readable manifest. Set its URL to PUBLIC_MANIFEST_ENDPOINT.
	If you don't want immediate public exposure, leave PUBLIC_MANIFEST_ENDPOINT as null.
*/
const CLOUDINARY_CLOUD_NAME = 'YOUR_CLOUD_NAME'; // e.g. 'lokeshcloud'
const CLOUDINARY_UPLOAD_PRESET = 'YOUR_UNSIGNED_UPLOAD_PRESET';
const PUBLIC_MANIFEST_ENDPOINT = null; // e.g. 'https://script.google.com/macros/s/XXX/exec'

function openDB() {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(ASSIGN_DB, 1);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(ASSIGN_STORE)) {
				db.createObjectStore(ASSIGN_STORE, { keyPath: 'id', autoIncrement: true });
			}
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

async function saveFiles(files) {
	// Store File objects (Blobs) directly to IndexedDB — more efficient than data URLs
	const db = await openDB();
	const tx = db.transaction(ASSIGN_STORE, 'readwrite');
	const store = tx.objectStore(ASSIGN_STORE);
	for (const f of files) {
		await new Promise((res, rej) => {
			const item = { name: f.name, type: f.type, size: f.size, blob: f, ts: Date.now() };
			const r = store.add(item);
			r.onsuccess = () => res();
			r.onerror = () => rej(r.error);
		});
	}
	await new Promise(r => tx.oncomplete = r);
}

// Upload a single file to Cloudinary (unsigned). Returns secure_url on success.
async function uploadToCloudinary(file) {
	if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) throw new Error('Cloudinary not configured');
	const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;
	const fd = new FormData();
	fd.append('file', file);
	fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
	fd.append('context', `uploader:${encodeURIComponent('Lokesh Gaula')}`);
	const res = await fetch(url, { method: 'POST', body: fd });
	if (!res.ok) throw new Error('Upload failed');
	const data = await res.json();
	return data.secure_url || data.url;
}

async function postManifestEntry(entry) {
	if (!PUBLIC_MANIFEST_ENDPOINT) return null;
	try {
		const res = await fetch(PUBLIC_MANIFEST_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry) });
		if (!res.ok) throw new Error('Manifest post failed');
		return await res.json();
	} catch (err) {
		console.warn('Failed to post manifest', err);
		return null;
	}
}

async function fetchPublicAssignments() {
	if (!PUBLIC_MANIFEST_ENDPOINT) return [];
	try {
		const res = await fetch(PUBLIC_MANIFEST_ENDPOINT, { cache: 'no-store' });
		if (!res.ok) return [];
		const data = await res.json();
		// Expecting an array of {uploader, name, url, ts}
		return Array.isArray(data) ? data : [];
	} catch (err) {
		console.warn('Failed to fetch public manifest', err);
		return [];
	}
}

async function loadAssignments() {
	const db = await openDB();
	const tx = db.transaction(ASSIGN_STORE, 'readonly');
	const store = tx.objectStore(ASSIGN_STORE);
	return new Promise((resolve) => {
		const req = store.getAll();
		req.onsuccess = () => resolve(req.result || []);
		req.onerror = () => resolve([]);
	});
}

async function deleteAssignment(id) {
	const db = await openDB();
	const tx = db.transaction(ASSIGN_STORE, 'readwrite');
	tx.objectStore(ASSIGN_STORE).delete(id);
	return new Promise(r => tx.oncomplete = r);
}

async function clearAssignments() {
	const db = await openDB();
	const tx = db.transaction(ASSIGN_STORE, 'readwrite');
	tx.objectStore(ASSIGN_STORE).clear();
	return new Promise(r => tx.oncomplete = r);
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
			// Support both previous data-URL strings and Blob objects stored now.
			if (typeof it.blob === 'string' && it.blob.startsWith('data:')) {
				const a = document.createElement('a'); a.href = it.blob; a.download = it.name; document.body.appendChild(a); a.click(); a.remove();
				return;
			}
			// blob expected to be a File/Blob
			try {
				const url = URL.createObjectURL(it.blob);
				const a = document.createElement('a'); a.href = url; a.download = it.name; document.body.appendChild(a); a.click(); a.remove();
				setTimeout(() => URL.revokeObjectURL(url), 3000);
			} catch (err) {
				showToast('Download failed');
			}
		});
		const del = document.createElement('button'); del.className = 'btn'; del.textContent = 'Delete';
		del.addEventListener('click', async () => { await deleteAssignment(it.id); showToast('Deleted'); await refreshAssignments(); });
		actions.appendChild(dl); actions.appendChild(del);
		li.appendChild(meta); li.appendChild(actions); ul.appendChild(li);
	}
}

function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function formatBytes(bytes){ if (bytes<1024) return bytes+' B'; if(bytes<1048576) return (bytes/1024).toFixed(1)+' KB'; return (bytes/1048576).toFixed(2)+' MB'; }

async function refreshAssignments(){ const items = await loadAssignments(); renderAssignments(items); }

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

	saveBtn.addEventListener('click', async () => {
		const files = Array.from(input.files || []);
		if (!files.length) { showToast('No files selected'); return; }
		const makePublic = document.getElementById('make-public')?.checked;
		try {
			// Save locally (IndexedDB)
			await saveFiles(files);
			// If user requested public upload, upload to Cloudinary and optionally post metadata to manifest endpoint
			if (makePublic) {
				if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) { showToast('Cloudinary not configured'); }
				else {
					const publicEntries = [];
					for (const f of files) {
						try {
							const secureUrl = await uploadToCloudinary(f);
							publicEntries.push({ uploader: 'Lokesh Gaula', name: f.name, url: secureUrl, ts: Date.now() });
						} catch (err) { console.error('Upload failed', err); showToast('Upload failed for ' + f.name); }
					}
					if (publicEntries.length && PUBLIC_MANIFEST_ENDPOINT) {
						await postManifestEntry({ entries: publicEntries });
					}
					if (publicEntries.length) showToast('Uploaded publicly');
				}
			}
			input.value = '';
			await refreshAssignments();
			// Refresh public listing if endpoint exists
			if (PUBLIC_MANIFEST_ENDPOINT) renderPublicAssignments(await fetchPublicAssignments());
		} catch (err) { console.error(err); showToast('Save failed'); }
	});

	clearBtn.addEventListener('click', async () => { if (confirm('Clear all saved assignments?')) { await clearAssignments(); await refreshAssignments(); showToast('Cleared'); } });

	refreshAssignments();
}

function renderPublicAssignments(items) {
	const ul = document.getElementById('public-assignments');
	if (!ul) return;
	ul.innerHTML = '';
	if (!items || !items.length) { ul.innerHTML = '<li class="muted">No public assignments yet.</li>'; return; }
	for (const it of items) {
		const li = document.createElement('li'); li.className = 'file-item';
		const meta = document.createElement('div'); meta.className = 'meta';
		meta.innerHTML = `<div><strong>${escapeHtml(it.name || it.title || '(no name)')}</strong></div><div class="muted">Uploaded by ${escapeHtml(it.uploader||'unknown')} • ${new Date(it.ts||Date.now()).toLocaleString()}</div>`;
		const actions = document.createElement('div'); actions.className = 'actions';
		const open = document.createElement('a'); open.className = 'btn ghost'; open.textContent = 'Open'; open.href = it.url; open.target = '_blank'; open.rel = 'noopener';
		actions.appendChild(open);
		li.appendChild(meta); li.appendChild(actions); ul.appendChild(li);
	}
}

// If PUBLIC_MANIFEST_ENDPOINT is set, fetch public assignments on load
if (PUBLIC_MANIFEST_ENDPOINT) {
	(async () => { const items = await fetchPublicAssignments(); renderPublicAssignments(items); })();
}

function toFileList(files){
	const dataTransfer = new DataTransfer(); files.forEach(f => dataTransfer.items.add(f)); return dataTransfer.files;
}


console.log('Premium portfolio script initialized');
