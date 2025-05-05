const CARDS = document.getElementById('cards');
const LOADING_SCREEN = document.getElementById('loading');

document.getElementById('close').addEventListener('click', () => window.history.back());

window.onpopstate = e => {
	if (e.state) {
		if (document.getElementById('opened-article')) generateViewer(document.getElementById('opened-article'));
		else findCard(e.state.page);
	}
	else closeViewer();
}

window.onload = () => {
	if (history.state) findCard(history.state.page);
	LOADING_SCREEN.classList.add('hidden2');
	if (LOADING_SCREEN.classList.contains('hidden')) 
		setTimeout(() => document.body.removeChild(LOADING_SCREEN), 201);
}

function noLocation(err) {
	console.error(err);
	document.body.classList.add('no-location');

	locations.forEach(location => {

		const PARENT = document.createElement('div');
		PARENT.classList.add('card');
		PARENT.dataset.url = `texts/${CN ? 'cn/' : ''}${location.shortname}.txt`;
	
		const IMAGE = document.createElement('img');
		IMAGE.classList.add('card-image');
		IMAGE.src = `images/${location.shortname}.jpg`;
	
		const TITLE = document.createElement('h1');
		TITLE.appendChild(document.createTextNode(location.name));

		PARENT.appendChild(IMAGE);
		PARENT.appendChild(TITLE);
		CARDS.appendChild(PARENT);
	});

	LOADING_SCREEN.classList.add('hidden');
	setTimeout(() => document.body.removeChild(LOADING_SCREEN), 201);
}

function generateViewer(target) {
	document.body.style.overflow = 'hidden';

	if (document.getElementById('opened-article')) document.getElementById('opened-article').id = null;
	target.id = 'opened-article';

	const IMAGE = target.getElementsByTagName('img')[0];
	const IMAGE_RECT = IMAGE.getBoundingClientRect();
	const IMAGE_SCALE_FACTOR = Math.max(document.documentElement.clientWidth, window.innerWidth || 0) / IMAGE_RECT.width;
	IMAGE.style.setProperty('--scale-factor', IMAGE_SCALE_FACTOR);
	IMAGE.style.setProperty('--card-transform', `${-IMAGE_RECT.y + (IMAGE_SCALE_FACTOR * IMAGE_RECT.height - IMAGE_RECT.height) / 2}px`);

	const VIEWER = document.getElementById('viewer');
	VIEWER.style.paddingTop = `${IMAGE_SCALE_FACTOR * IMAGE_RECT.height + 4}px`;
	VIEWER.style.setProperty('--image-ratio', IMAGE_RECT.height / IMAGE_RECT.width);
	const VIEWER_TITLE = document.createElement('h1');
	VIEWER_TITLE.appendChild(document.createTextNode(target.getElementsByTagName('h1')[0].innerHTML));
	const VIEWER_TEXT = document.createElement('div');
	VIEWER_TEXT.id = 'viewer-text';
	VIEWER_TEXT.innerHTML = `<p>${CN ? '正在加载' : 'Loading content...'}</p>`;
	VIEWER.appendChild(VIEWER_TITLE);
	VIEWER.appendChild(VIEWER_TEXT);
	VIEWER_TEXT.style.marginTop = `-${VIEWER_TITLE.clientHeight}px`;

	fetch(target.dataset.url).then(res => res.text()).then(data => 
		document.getElementById('viewer-text').innerHTML = data
	);

	IMAGE.classList.add('open');
	VIEWER.classList.add('open');

	setTimeout(() => IMAGE.classList.add('openFixed'), 300);
}

function closeViewer() {
	let opened;
	if (opened = document.getElementById('opened-article')) {
		const VIEWER = document.getElementById('viewer');
		opened.id = '';
		opened.getElementsByTagName('img')[0].style.transition = '';
		opened.getElementsByTagName('img')[0].classList.remove('openFixed');
		opened.getElementsByTagName('img')[0].classList.remove('open');
		document.body.style.overflow = 'initial';
		VIEWER.classList.remove('open');
		setTimeout(() => {
			while (VIEWER.hasChildNodes()) VIEWER.removeChild(VIEWER.lastChild);
		}, 200);
	}
}

function findCard(page) {
	const ALL_CARDS = CARDS.getElementsByClassName('card');
	for (let i = ALL_CARDS.length - 1; i >= 0; i -= 1) {
		if (ALL_CARDS[i].dataset.url == page) {
			generateViewer(ALL_CARDS[i]);
			return;
		}
	}
}

if ('geolocation' in navigator) {
	const toRad = deg => deg * Math.PI / 180;

	let firstRun = true;
	navigator.geolocation.watchPosition(pos => {
		const LAT = pos.coords.latitude;
		const LONG = pos.coords.longitude;

		for (let i = locations.length - 1; i >= 0; i -= 1) {
			const DIST_LAT = toRad(LAT - locations[i].lat);
			const DIST_LONG = toRad(LONG - locations[i].long);
			const A = Math.sin(DIST_LAT / 2) * Math.sin(DIST_LAT / 2) + Math.sin(DIST_LONG / 2) * Math.sin(DIST_LONG / 2) * Math.cos(toRad(LAT)) * Math.cos(toRad(locations[i].lat));
			locations[i].distance = 12742000 * Math.atan2(Math.sqrt(A), Math.sqrt(1 - A));
		}

		if (firstRun) {

			if (CARDS.innerHTML) {
				while (CARDS.firstChild) CARDS.removeChild(CARDS.firstChild);
			}

			locations.sort((a, b) => a.distance - b.distance);

			locations.forEach(location => {
				
				const PARENT = document.createElement('div');
				PARENT.classList.add('card');
				PARENT.dataset.url = `texts/${CN ? 'cn/' : ''}${location.shortname}.txt`;
			
				const IMAGE = document.createElement('img');
				IMAGE.classList.add('card-image');
				IMAGE.src = `images/${location.shortname}.jpg`;
			
				const TITLE = document.createElement('h1');
				TITLE.appendChild(document.createTextNode(location.name));
	
				const DISTANCE = document.createElement('div');
				DISTANCE.appendChild(document.createTextNode(location.distance < 2000 ? `${Math.round(location.distance)}m` : `${(location.distance / 1000).toFixed(2)}km`));

				PARENT.appendChild(IMAGE);
				PARENT.appendChild(TITLE);
				PARENT.appendChild(DISTANCE);
				CARDS.appendChild(PARENT);
			});
	
			LOADING_SCREEN.classList.add('hidden');
			setTimeout(() => {
				console.log(LOADING_SCREEN);
				document.body.removeChild(LOADING_SCREEN);
			}, 201);

			firstRun = false;
			return;
		}

		console.log(locations);

		const ELEMENTS = document.getElementsByClassName('card');
		for (let i = ELEMENTS.length - 1; i >= 0; i -= 1)
			ELEMENTS[i].getElementsByTagName('div')[0].innerHTML = locations[i].distance < 2000 ? `${Math.round(locations[i].distance)}m` : `${(locations[i].distance / 1000).toFixed(2)}km`;
	}, noLocation);
}
else noLocation('Geolocation unsupported');

CARDS.addEventListener('click', e => {
	if (e.target != e.currentTarget) {
		let target = e.target;
		while (target.parentNode != CARDS) target = target.parentNode;

		generateViewer(target);

		history.pushState({
			page: target.dataset.url
		}, target.getElementsByTagName('h1')[0].innerHTML, `${window.location.href}#article`);
	}
	e.stopPropagation();
});


document.getElementById('more-fab').addEventListener('click', showFABMenu);
document.getElementById('more-dimmer').addEventListener('click', showFABMenu);

function showFABMenu() {
	document.getElementById('more-dimmer').classList.toggle('hidden');
	document.getElementById('change-language').classList.toggle('hidden');
	document.getElementById('view-map').classList.toggle('hidden');
	document.getElementById('view-tutorial').classList.toggle('hidden');
}