function handleFiles(){
	let files = this.files;
	let loaderMainWrap = null;
	let uploadBox = this.parentElement.querySelectorAll('[data-upload]')[0];
	if (uploadBox.classList.contains('single-load')) {
		oldPhoto = uploadBox.children;
		for (var i = 0; i < oldPhoto.length; i++) {
			oldPhoto[i].remove();
		}
	}
	for (var i = 0; i < files.length; i++) {
		getBase64(files[i], uploadBox);
	}
}

function removeFiles(){
	this.remove();
	window.tooltipHint.hide();
}

function hasClass(element, className) {
	return (' ' + element.className + ' ').indexOf(' ' + className+ ' ') > -1;
}

function getBase64(file, loaderMainWrap) {
	var reader = new FileReader();
	reader.readAsDataURL(file);
	if (file.type.startsWith("image/")) {
		reader.onload = function () {
			appendImage(file.name, reader.result, loaderMainWrap);
		};
		reader.onerror = function (error) {
			console.error('Error: ', error);
		};
	} else if (file.type.startsWith("video/")) {
		reader.onload = function () {
			appendVideo(file.name, reader.result, loaderMainWrap);
		};
		reader.onerror = function (error) {
			appendError(file.name,'load', loaderMainWrap);
		};
	} else {
		appendError(file.name, 'type', loaderMainWrap);
	};
};

function appendImage(name, src, loaderMainWrap){
	let coverEl = document.createElement("div");
			coverEl.classList.add('files-cover');
			coverEl.setAttribute('data-tooltip', 'Click to delete')
	let innerCover = document.createElement("div");
			innerCover.classList.add('inner');
	let imgEl = document.createElement('img');
			imgEl.src = src;
	innerCover.appendChild(imgEl);
	coverEl.appendChild(innerCover);
	let nameEl = document.createElement("div");
			nameEl.classList.add('file-name');
			nameEl.appendChild(document.createTextNode(name));
	coverEl.appendChild(nameEl);
	coverEl.addEventListener("click", removeFiles, false);
	if (loaderMainWrap) {
		loaderMainWrap.appendChild(coverEl);
	}
};

function appendVideo(name, src, loaderMainWrap){
	let coverEl = document.createElement("div");
			coverEl.classList.add('files-cover');
			coverEl.setAttribute('data-tooltip', 'Click to delete')
	let innerCover = document.createElement("div");
			innerCover.classList.add('inner');
	let videoEl = document.createElement('video')
			videoEl.src = src
			videoEl.controls = true;
	innerCover.appendChild(videoEl);
	coverEl.appendChild(innerCover);
	let nameEl = document.createElement("div");
			nameEl.classList.add('file-name');
			nameEl.appendChild(document.createTextNode(name));
	coverEl.appendChild(nameEl);
	coverEl.addEventListener("click", removeFiles, false);
	if (loaderMainWrap) {
		loaderMainWrap.appendChild(coverEl);
	}
};

function appendError(name, type, loaderMainWrap){
	let errorStatus = {
		load: 'Loadind error',
		type: 'Only for .png, .jpg, .mp4'
	}
	let coverEl = document.createElement("div");
			coverEl.classList.add('error-cover');
			coverEl.classList.add('files-cover');
			coverEl.setAttribute('data-tooltip', 'Click to delete')
	let textEl = document.createElement("div");
			textEl.classList.add('error-text');
			textEl.appendChild(document.createTextNode(errorStatus[type]));
	coverEl.appendChild(textEl);
	let nameEl = document.createElement("div");
			nameEl.classList.add('file-name');
			nameEl.appendChild(document.createTextNode(name));
	coverEl.appendChild(nameEl);
	coverEl.addEventListener("click", removeFiles, false);
	if (loaderMainWrap) {
		loaderMainWrap.appendChild(coverEl);
	}
};

document.querySelectorAll('[data-loader]').forEach(function(loaderCover, i){
	let uploadBox = loaderCover.querySelectorAll('[data-upload]')[0];
	coverChildren = loaderCover.children;
	for (var i = 0; i < coverChildren.length; i++) {
		if (coverChildren[i].hasAttribute('data-label')) {
			let fileLoader = coverChildren[i];
					fileLoader.ondragover = function (e) {
						e.preventDefault();
						fileLoader.classList.add('hover')
					};
					fileLoader.ondragend = function (e) {
						e.preventDefault();
						fileLoader.classList.remove('hover');
					};
					fileLoader.ondrop = function (e) {
						e.preventDefault();
						fileLoader.classList.remove('hover');
						for (var i = 0; i < e.dataTransfer.files.length; i++) {
							getBase64(e.dataTransfer.files[i], uploadBox);
						}
					}
		} else if (coverChildren[i].hasAttribute('data-file')) {
			let inputElement = coverChildren[i];
					inputElement.addEventListener("change", handleFiles, false);
		} else {
			appendError('type', uploadBox);
		}
	}
})

// delete loaded files
document.querySelectorAll('.files-cover').forEach(function(loaderCover, i){
	loaderCover.addEventListener("click", removeFiles, false);
})













