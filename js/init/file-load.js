// fileLoader
window.addEventListener("DOMContentLoaded", function() {

	class FileLoader {
		loaderCover = null;
		acceptedFileTypes = [];

		inputLabel = null;
		inputFile = null;
		uploadBox = null;

		loadedSrc = {
			pdf: 'img/file-load.svg',
			error: 'img/picture-broken.svg'
		};

		classes = {
			error: 'error',
			success: 'success'
		};

		constructor(loaderCover) {
			this.loaderCover = loaderCover;
			if (loaderCover.dataset.loader) {
				this.acceptedFileTypes = loaderCover.dataset.loader.split(",");
				this.inputLabel = loaderCover.querySelector('[data-label]');
				this.inputFile = loaderCover.querySelector('[data-file]');
				this.uploadBox = loaderCover.querySelector('[data-upload]');
			}

			if (this.inputFile) {
				this.inputFile.addEventListener("change", this.handleFiles.bind(this), false)
			}
		};

		hasClass(element, className) {
			return (' ' + element.className + ' ').indexOf(' ' + className+ ' ') > -1;
		};

		handleFiles(){
			let files = this.inputFile.files;
			let uploadBox = this.uploadBox;

			if (!this.inputFile.getAttribute('multiple')) {
				this.removeOldFiles();
			};

			for (var i = 0; i < files.length; i++) {
				this.getBase64(files[i]);
			};
		};

		removeOldFiles(){
			let oldFiles = this.uploadBox.children;
			for (var i = 0; i < oldFiles.length; i++) {
				oldFiles[i].remove();
			};
		};

		removeFile(){
			let fileToRemove = this.file;
			let _this = this._this;
			let uploadBox = this._this.uploadBox;
			let loaderCover = this._this.loaderCover;

			let removedFileName = fileToRemove.querySelector('.file-name').innerHTML;
			fileToRemove.remove();
			if (window.tooltipHint) {
				window.tooltipHint.hide();
			};

			let files = Array.prototype.slice.call(_this.inputFile.files);
			if (files) {
				for (let i = 0; i < files.length; i++) {
					const file = files[i];
					if (removedFileName == file.name) {
						files.splice(i, 1);
					}
				}
				const newFileList = new DataTransfer();
				files.forEach(file => newFileList.items.add(file));
				_this.inputFile.files = newFileList.files;
			};

			this._this.removeError();
		};

		getBase64(file) {
			let reader = new FileReader();
					reader.readAsDataURL(file);
			let uploadBox = this.uploadBox;
			let fileType = file.name.split('.').pop();

			if (this.acceptedFileTypes.indexOf(fileType) >= 0) {
				this.appendFile(file.name, fileType, reader);
			} else {
				this.appendError(file.name, fileType, reader);
			};
		};

		appendFile(name, type, reader){
			if (!name || !type || !reader) return;
			let showPreview = type == 'jpg' || type == 'png' || type == 'mp4';
			reader.onload = function () {
				this.appendFileToBox(name, type, reader.result, showPreview);
			}.bind(this);
			reader.onerror = function (error) {
				this.loaderCover.classList.add(this.classes.error);
				console.error('Error: ', error);
			}.bind(this);

			this.removeError();
		};

		appendError(name, type, reader){
			if (!name || !type || !reader) return;
			this.loaderCover.classList.add(this.classes.error);
			this.appendFileToBox(name, type, reader.result, false);
			console.error('Error: ', type + ' type is not correct');
		};

		removeError(){
			if (!this.uploadBox.querySelectorAll(`.${this.classes.error}`).length) {
				this.loaderCover.classList.remove(this.classes.error);
			};
		};

		appendFileToBox(name, type, src, showPreview){
			let coverEl = document.createElement("div");
					coverEl.classList.add('files-cover');
					coverEl.setAttribute('data-tooltip', 'Click to delete')
			let innerCover = document.createElement("div");
					innerCover.classList.add('inner');

			if (this.acceptedFileTypes.indexOf(type) >= 0) {
				switch (type) {
					case "png":
					case "jpg":
						let imgEl = document.createElement('img');
								imgEl.src = src;
						innerCover.appendChild(imgEl);
						break;
					case "mp4":
						let videoEl = document.createElement('video');
								videoEl.src = src;
								videoEl.controls = true;
						break;
					case "pdf":
						let pdfEl = document.createElement('img');
								pdfEl.src = this.loadedSrc.pdf;
						innerCover.appendChild(pdfEl);
						break;
					default:
						let errorEl = document.createElement('img');
								errorEl.src = this.loadedSrc.error;
						innerCover.appendChild(errorEl);
						coverEl.classList.add('error');
				};
			} else {
				let errorEl = document.createElement('img');
						errorEl.src = this.loadedSrc.error;
				innerCover.appendChild(errorEl);
				coverEl.classList.add('error');
			};

			coverEl.appendChild(innerCover);
			let nameEl = document.createElement("div");
					nameEl.classList.add('file-name');
					nameEl.appendChild(document.createTextNode(name));
			coverEl.appendChild(nameEl);
			coverEl.addEventListener("click", this.removeFile.bind({file: coverEl, _this: this}), false);
			if (this.uploadBox) {
				this.uploadBox.appendChild(coverEl);
			}
		};

	};

	let fileLoaderCovers = document.querySelectorAll('[data-loader]');

	for (i = 0; i < fileLoaderCovers.length; i++) {
		const fileLoader = new FileLoader(fileLoaderCovers[i]);
	}

});