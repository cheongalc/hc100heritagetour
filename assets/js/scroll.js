let frameNumber = 0,
	playbackConst = 1000,
	vid = document.getElementById('v1'),
	container = document.getElementById('v1').parentNode;

vid.addEventListener('loadedmetadata', () => {
	container.style.height = `${Math.floor(vid.duration) * playbackConst}px`;
});

let itemsBefore = (window.pageYOffset + container.getBoundingClientRect().top - (screen.height - vid.offsetHeight)/2)/playbackConst;
function scrollPlay() {
	if (window.pageYOffset > itemsBefore) {
		vid.currentTime = window.pageYOffset/playbackConst - itemsBefore;
	}
	window.requestAnimationFrame(scrollPlay);
}

window.requestAnimationFrame(scrollPlay);

