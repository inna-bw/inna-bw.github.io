window.addEventListener("DOMContentLoaded", function() {

	class FileLoader {
		constructor(loaderCover) {
			this.loaderCover = loaderCover;
			this.acceptedFileTypes = [];
			this.templateDirectory = '';
			this.inputLabel = null;
			this.inputFile = null;
			this.uploadBox = null;

			this.classes = {
				error: 'error',
				success: 'success'
			};

			if (window.themeData && themeData.templateUrl) {
				this.templateDirectory = String(themeData.templateUrl).replace(/\/$/, '');
			}

			if (!this.templateDirectory && loaderCover && loaderCover.dataset && loaderCover.dataset.templateDirectory) {
				this.templateDirectory = loaderCover.dataset.templateDirectory.replace(/\/$/, '');
			}

			if (!this.templateDirectory && window.FileLoaderData && window.FileLoaderData.templateDirectory) {
				this.templateDirectory = window.FileLoaderData.templateDirectory.replace(/\/$/, '');
			}
			if (!this.templateDirectory && window.templateDirectory) {
				this.templateDirectory = window.templateDirectory.replace(/\/$/, '');
			}

			if (!this.templateDirectory) {
				const themeScript = document.querySelector('script[src*="/wp-content/themes/"]');
				if (themeScript && themeScript.src) {
					const parts = themeScript.src.split('/wp-content/themes/');
					if (parts.length > 1) {
						const themePart = parts[1].split('/')[0];
						this.templateDirectory = location.origin + '/wp-content/themes/' + themePart;
					}
				}
			}

			if (!this.templateDirectory) this.templateDirectory = '';

			this.loadedSrc = {
				pdf: this.templateDirectory ? encodeURI(this.templateDirectory + '/img/file-load.svg') : '/wp-content/themes/bw_theme/img/file-load.svg',
				error: this.templateDirectory ? encodeURI(this.templateDirectory + '/img/picture-broken.svg') : '/wp-content/themes/bw_theme/img/picture-broken.svg'
			};

			console.log('FileLoader: templateDirectory ->', this.templateDirectory);
			console.log('FileLoader: loadedSrc.pdf ->', this.loadedSrc.pdf);

			if (loaderCover && loaderCover.dataset && loaderCover.dataset.loader) {
				this.acceptedFileTypes = loaderCover.dataset.loader.split(",").map(s => s.trim().toLowerCase());
				this.inputLabel = loaderCover.querySelector('[data-label]');
				this.inputFile = loaderCover.querySelector('[data-file]');
				this.uploadBox = loaderCover.querySelector('[data-upload]');
			}

			if (this.inputFile) {
				this.inputFile.addEventListener("change", this.handleFiles.bind(this), false);
			}
		}

		hasClass(element, className) {
			return (' ' + element.className + ' ').indexOf(' ' + className + ' ') > -1;
		}

		handleFiles() {
			if (!this.inputFile) return;
			const files = this.inputFile.files;

			if (!this.inputFile.getAttribute('multiple')) {
				this.removeOldFiles();
			}

			for (let i = 0; i < files.length; i++) {
				this.getBase64(files[i]);
			}
		}

		removeOldFiles() {
			if (!this.uploadBox) return;
			while (this.uploadBox.firstChild) {
				this.uploadBox.firstChild.remove();
			}
		}

		removeFile() {
			const fileToRemove = this.file;
			const _this = this._this;

			if (!fileToRemove || !_this) return;

			const removedFileName = fileToRemove.querySelector('.file-name') ? fileToRemove.querySelector('.file-name').textContent : '';
			fileToRemove.remove();
			if (window.tooltipHint && typeof window.tooltipHint.hide === 'function') {
				window.tooltipHint.hide();
			}

			let filesArr = Array.prototype.slice.call(_this.inputFile.files || []);
			for (let i = filesArr.length - 1; i >= 0; i--) {
				if (filesArr[i].name === removedFileName) {
					filesArr.splice(i, 1);
				}
			}
			const newFileList = new DataTransfer();
			filesArr.forEach(file => newFileList.items.add(file));
			_this.inputFile.files = newFileList.files;

			_this.removeError();
		}

		getBase64(file) {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			const fileType = file.name.split('.').pop().toLowerCase();

			reader.onload = () => {
				if (this.acceptedFileTypes.indexOf(fileType) >= 0) {
					this.appendFile(file.name, fileType, reader.result);
				} else {
					this.appendError(file.name, fileType);
				}
			};

			reader.onerror = (error) => {
				if (this.loaderCover) this.loaderCover.classList.add(this.classes.error);
				console.error('FileReader error: ', error);
				this.appendError(file.name, fileType);
			};
		}

		appendFile(name, type, src) {
			if (!name || !type) return;
			const showPreview = type === 'jpg' || type === 'jpeg' || type === 'png' || type === 'mp4';
			this.removeError();
			this.appendFileToBox(name, type, src, showPreview);
		}

		appendError(name, type) {
			if (!name || !type) return;
			if (this.loaderCover) this.loaderCover.classList.add(this.classes.error);
			this.appendFileToBox(name, type, null, false, true);
			console.error('Error: ', type + ' type is not correct or could not be read');
		}

		removeError() {
			if (!this.uploadBox) return;
			const hasErr = this.uploadBox.querySelectorAll('.' + this.classes.error).length > 0;
			if (!hasErr && this.loaderCover && this.loaderCover.classList.contains(this.classes.error)) {
				this.loaderCover.classList.remove(this.classes.error);
			}
		}

		appendFileToBox(name, type, src, showPreview, forceError = false) {
			const coverEl = document.createElement("div");
			coverEl.classList.add('files-cover');
			coverEl.setAttribute('data-tooltip', 'Click to delete');

			const innerCover = document.createElement("div");
			innerCover.classList.add('inner');

			if (!forceError && this.acceptedFileTypes.indexOf(type) >= 0) {
				switch (type) {
					case "png":
					case "jpg":
					case "jpeg": {
						const imgEl = document.createElement('img');
						imgEl.src = src || this.loadedSrc.error;
						innerCover.appendChild(imgEl);
						break;
					}
					case "mp4": {
						const videoEl = document.createElement('video');
						videoEl.src = src || '';
						videoEl.controls = true;
						innerCover.appendChild(videoEl);
						break;
					}
					case "pdf": {
						const pdfEl = document.createElement('img');
						pdfEl.src = this.loadedSrc.pdf;
						innerCover.appendChild(pdfEl);
						break;
					}
					default: {
						const errorEl = document.createElement('img');
						errorEl.src = this.loadedSrc.error;
						innerCover.appendChild(errorEl);
						coverEl.classList.add(this.classes.error);
					}
				}
			} else {
				const errorEl = document.createElement('img');
				errorEl.src = this.loadedSrc.error;
				innerCover.appendChild(errorEl);
				coverEl.classList.add(this.classes.error);
			}

			coverEl.appendChild(innerCover);

			const nameEl = document.createElement("div");
			nameEl.classList.add('file-name');
			nameEl.appendChild(document.createTextNode(name));
			coverEl.appendChild(nameEl);

			coverEl.addEventListener("click", this.removeFile.bind({ file: coverEl, _this: this }), false);

			if (this.uploadBox) {
				this.uploadBox.appendChild(coverEl);
			}
		}
	}

	const fileLoaderCovers = document.querySelectorAll('[data-loader]');
	for (let i = 0; i < fileLoaderCovers.length; i++) {
		new FileLoader(fileLoaderCovers[i]);
	}
});
