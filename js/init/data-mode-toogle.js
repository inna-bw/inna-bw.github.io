document.addEventListener('DOMContentLoaded', function(){

	class PageModeToggle {
		darkModeName = 'dark';
		lightModeName = 'light';
		animationTime = 550;

		modeButton = null;
		allModeButtons = document.querySelectorAll("[data-mode-toggle]");
		animationBlock = document.querySelector(".fake-mode");

		activeMode = null;

		constructor(modeButton){
			this.modeButton = modeButton;
			let storageSavedMode = this.getSavedMode();
			if (this.getSavedMode() && storageSavedMode != this.modeButton.dataset.modeToggle) {
				this.activeMode = this.getSavedMode();
			} else {
				this.activeMode = this.modeButton.dataset.modeToggle;
				this.saveMode(this.activeMode);
			};

		}

		init(){
			this.modeButton.addEventListener('click', this.toggleMode.bind(this), false);
			this.setBodyModeClass(this.activeMode);
			this.setButtonsMode(this.activeMode);
		};

		toggleMode(){
			switch (this.activeMode) {
				case this.darkModeName:
					this.activeMode = this.lightModeName;
					break;
				case this.lightModeName:
					this.activeMode = this.darkModeName;
					break;
			};

			this.setButtonsMode(this.activeMode);
			this.saveMode(this.activeMode);
			this.setAnimation();
			setTimeout(()=> {
				this.setBodyModeClass(this.activeMode);
			}, this.animationTime)
		};


		setButtonsMode(mode) {
			switch (mode) {
				case this.darkModeName:
					this.modeButton.classList.add(this.darkModeName);
					this.modeButton.classList.remove(this.lightModeName);
					break;
				case this.lightModeName:
					this.modeButton.classList.add(this.lightModeName);
					this.modeButton.classList.remove(this.darkModeName);
					break;
			};
			this.setButtonMode(mode);
		};

		setAnimation() {
			let leftPosition = this.modeButton.offsetLeft;
			let topPosition = this.modeButton.offsetTop;

			let banner = document.querySelector(".banner");

			this.animationBlock.style.top = topPosition + 'px';
			this.animationBlock.style.left = leftPosition + 'px';
			this.animationBlock.classList.add('animated');
			if (banner) {
				banner.classList.add('animated-mode');
			};
			setTimeout(()=>{
				this.animationBlock.classList.remove('animated');
				if (banner) {
					banner.classList.remove('animated-mode');
				};
			}, this.animationTime)
		}

		setButtonMode(mode){
			for (let i = 0; i <= this.allModeButtons.length-1; i++) {
				this.allModeButtons[i].dataset.modeToggle = mode;
			};
		};

		setBodyModeClass(mode){
			document.body.classList = "";
			document.body.classList.add(mode);
		};

		getSavedMode(){
			return localStorage.getItem('bw-site-mode');
		};

		saveMode(mode){
			localStorage.setItem('bw-site-mode', mode);
		};

	};

	Array.prototype.forEach.call(document.querySelectorAll("[data-mode-toggle]"), function(modeButton){
		const pageModeToggle = new PageModeToggle(modeButton);
		pageModeToggle.init();
	});
});