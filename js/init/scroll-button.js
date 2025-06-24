// scrollButton
document.addEventListener('DOMContentLoaded', function(){

	class scrollButtonAnimationComponent {
		pageAnchors = [];
		scrollButton = null;
		anchorIndex = 0;
		lastScroll = 0;
		scrollDirection = null;

		buttonBottomClassName = 'to-bottom';
		buttonTopClassName = 'to-top';

		constructor(button) {
			this.scrollButton = button;
			this.pageAnchors = this.setAnchors();
		}

		scrollToSection(section) {
			if (!section) return;
			section.scrollIntoView({
				behavior: 'smooth' 
			});
		};

		scrollDetect(){
			let currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
			if (currentScroll > 0 && this.lastScroll <= currentScroll){
				this.lastScroll = currentScroll;
				this.scrollDirection = "down";

			} else {
				this.lastScroll = currentScroll;
				this.scrollDirection = "up";
			}
		};

		resetAnchor(){
			this.anchorIndex = 0;
		};

		setAnchors(){
			let anchorsArray = [];
			Array.prototype.forEach.call(document.querySelectorAll('section'), function(section, i){
				let obj = {
					anchor: section,
					top: section.offsetTop
				}
				anchorsArray.push(obj)
			});
			return anchorsArray;
		};

		detectPagePosition(){
			let scrollBottomPosition = window.pageYOffset + window.innerHeight;
			let footerHeight = document.getElementById('mainFooter').clientHeight;
			let bottomOffset = footerHeight;

			if (scrollBottomPosition >= document.body.clientHeight - bottomOffset) {
				this.scrollDirection = 'up';
				this.resetAnchor();
				this.scrollButton.classList.add(this.buttonTopClassName);
				this.scrollButton.classList.remove(this.buttonBottomClassName);
			} else {
				this.scrollDirection = 'down'
				this.scrollButton.classList.add(this.buttonBottomClassName);
				this.scrollButton.classList.remove(this.buttonTopClassName);
			}
		}

		detectActiveAnchor(){
			if (this.scrollDirection == 'down') {
				let pageTop = window.pageYOffset + window.innerHeight/2;
				this.pageAnchors.forEach((anchor, i) => {
					if (pageTop > anchor.top && this.anchorIndex == i) {
						if (this.anchorIndex < this.pageAnchors.length - 1) {
							this.anchorIndex++
						};
					};
				});
			};
		};

		init() {
			this.detectActiveAnchor();
			this.detectPagePosition();
			this.scrollButton.addEventListener("click", (event) => {
				if (this.scrollDirection == 'up') {
					this.scrollToSection(document.getElementById('pageMain'))
				} else {
					if (this.pageAnchors[this.anchorIndex] && this.anchorIndex <= this.pageAnchors.length) {
						this.scrollToSection(this.pageAnchors[this.anchorIndex].anchor)
						if (this.anchorIndex < this.pageAnchors.length - 1) {
							this.anchorIndex++
						};
					};
				};
			});
			// on scroll
			document.addEventListener("scroll", (event) => {
				this.scrollDetect();
				this.detectActiveAnchor();
				this.detectPagePosition();
			}, {passive: true})
		};
	};

	let scrollButton = document.getElementById("scrollButton");
	const scrollButtonAnimation = new scrollButtonAnimationComponent(scrollButton);
	scrollButtonAnimation.init();
});