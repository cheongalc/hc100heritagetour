let Map = ol.Map,
	View = ol.View,
	GeoJSON = ol.format.GeoJSON,
	VectorImageLayer = ol.layer.VectorImage,
	VectorLayer = ol.layer.Vector,
	VectorSource = ol.source.Vector,
	Style = ol.style.Style, Fill = ol.style.Fill, Stroke = ol.style.Stroke, Text = ol.style.Text,
	OSM = ol.source.OSM,
	Tile = ol.layer.Tile,
	Select = ol.interaction.Select,
	click = ol.events.condition;

let blackFill = new Fill({color:'#000000'}),
	khakiFill = new Fill({color:'#F3F4EF'}),
	redHighlightFill = new Fill({color:'rgba(255,0,0,0.5)'});

let maroonStroke = new Stroke({color:'#B13735',width:2});

let originalMapTextStyle = new Text({
	rotateWithView: true,
	overflow: true,
	scale: 1,
	fill: blackFill,
	padding: [-10, -10, -10, -10]
});

let originalMapStyle = new Style({
	fill: khakiFill,
	stroke: maroonStroke,
	text: originalMapTextStyle
});

let mapSource = new VectorSource({
	url: 'mapdata/map.json',
	format: new GeoJSON()
});

let map = new Map({
	target: 'map',
	layers: [
		new Tile({
			source: new OSM({
				crossOrigin: 'anonymous'
			}),
			extent: [11554914.047659414, 147381.01230893776, 11555895.78574145, 148027.40553507162]
		}),
		new VectorImageLayer({
			imageRatio: 2,
			source: mapSource,
			opacity: 0.9,
			style: function(feature) {
				originalMapStyle.getText().setText(feature.get('name'));
				return originalMapStyle;
			}
		})
	],
	controls: [],
	view: new View({
		center: ol.proj.fromLonLat([103.80339, 1.32625]), // coordinates of hci
		maxZoom: 20,
		minZoom: 16,
		zoom: 18, // such that hci is visible
		extent: [11554914.047659414, 147381.01230893776, 11555895.78574145, 148027.40553507162], // minX, minY, maxX, maxY
		constrainOnlyCenter: true
	})
});

map.getView().on('propertychange', function(event) {
	originalMapTextStyle.setRotation(-this.getRotation());
	mapSource.changed();
});


let selectedFeatureOverlay = new VectorLayer({
  	source: new VectorSource(),
 	map: map,
  	style: new Style({
	    fill: redHighlightFill
  	})
});

let select = new Select({
	style: false
}); // by default, use Single Click which is a true single click, no dragging or double click
map.addInteraction(select);
let highlight;
select.on('select', (e) => {
	let feature = e.target.getFeatures().item(0); // gets the current building that got selected
	if (feature !== highlight) { // this is present so that overlay isnt regenerated when user clicks an already highlighted building
		if (highlight) selectedFeatureOverlay.getSource().removeFeature(highlight);
		if (feature) selectedFeatureOverlay.getSource().addFeature(feature);
		highlight = feature;
	}
	if (feature) {
		// all code below will only be executed when there is a SELECTION and not a DESELECTION
		let featureName = feature.get('name').replace(/\r?\n|\r/g, ' ');
		let featureShortName = feature.get('shortname');
		if (featureShortName != 'NIL') generateViewerMap(featureName, featureShortName);
		console.log(featureName);
	}
});


function generateViewerMap(name, shortname) {
	const viewer = document.getElementById('viewer');

	const viewerImg = document.createElement('img');
	viewerImg.classList.add('open');
	viewerImg.classList.add('openFixed');
	viewerImg.id = 'viewer-img';
	viewerImg.src = `images/${shortname}.jpg`;
	document.body.appendChild(viewerImg);
	// const imgRect = viewerImg.getBoundingClientRect();

	// const imgRatio = imgRect.height / imgRect.width;

	viewerImg.addEventListener('load', () => {
		const imgRatio = viewerImg.clientHeight / viewerImg.clientWidth;
		viewer.style.setProperty('--image-ratio', imgRatio);
		viewer.style.paddingTop = `${viewerImg.clientHeight}px`;
		viewer.classList.add('open');
	});

	const viewerTitle = document.createElement('h1');
	viewerTitle.innerHTML = name;

	const viewerText = document.createElement('div');
	viewerText.id = 'viewer-text';
	viewerText.innerHTML = '<p>Loading content...</p>';

	viewer.appendChild(viewerTitle);
	viewer.appendChild(viewerText);

	viewerText.style.marginTop = `-${viewerTitle.clientHeight}px`;

	fetch(`texts/${shortname}.txt`).then(res => res.text()).then(data => {
		document.getElementById('viewer-text').innerHTML = data
	});
}

document.getElementById('close').addEventListener('click', closeViewer);
function closeViewer() {
	// hide then destroy viewer
	const viewer = document.getElementById('viewer');
	document.body.style.overflow = 'initial';
	viewer.classList.remove('open');
	setTimeout(() => {
		while (viewer.hasChildNodes()) viewer.removeChild(viewer.lastChild);
	}, 200);
	// destroy img
	document.body.removeChild(document.getElementById('viewer-img'));
}

document.getElementById('back-fab').addEventListener('click', () => window.history.back());