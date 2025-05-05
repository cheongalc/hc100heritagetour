function ripple(event) {
	let elem = event.currentTarget;
	let rippleElem = document.querySelector('span.ripple');
	if (!rippleElem) rippleElem = document.createElement('span');
	elem.appendChild(rippleElem);
	let max = Math.max(elem.offsetWidth, elem.offsetHeight);
	rippleElem.style.width = rippleElem.style.height = max + 'px';
	let rect = elem.getBoundingClientRect();
	rippleElem.style.left = event.clientX - rect.left - (max/2) + 'px';
	rippleElem.style.top = event.clientY - rect.top - (max/2) + 'px';
	rippleElem.classList.add('ripple');
}

document.getElementById('more-fab').addEventListener('click', ripple);
document.getElementById('change-language-fab').addEventListener('click', ripple);
document.getElementById('view-map-fab').addEventListener('click', ripple);
document.getElementById('view-about-fab').addEventListener('click', ripple);
