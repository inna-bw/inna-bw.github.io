// popup
document.addEventListener('DOMContentLoaded', function(){

	class Popup {
		hidePopupButtonAttribute = 'data-popup-close';

		constructor(popupId) {
			this.popupId = popupId;
			this.called = document.querySelector(popupId);
			this.hidePopupButtons = this.called.querySelectorAll('['+this.hidePopupButtonAttribute+']');
		}

		hidePopup = function() {
			let called = this.called;

			document.body.classList.remove('overlayed');
			document.body.style.width = '';
			document.getElementById('mainHeader').style.width = '';

			called.classList.remove('active');
			// on close call back
			setTimeout(function() {
				called.classList.remove('showed');
				if (called.dataset.onclose && window[called.dataset.onclose]) {
					return window[called.dataset.onclose](called);
				}
			}, 300);
		};

		showPopup = function() {
			let called = this.called;
					called.classList.add('showed');

			document.body.style.width = window.getComputedStyle(document.body).width;
			document.getElementById('mainHeader').style.width = window.getComputedStyle(document.getElementById('mainHeader')).width;
			document.body.classList.add('overlayed');

			setTimeout(function() {
				called.classList.add('active');
				if (called.dataset.onopen && window[called.dataset.onopen]) {
					return window[called.dataset.onopen](called);
				};
			}, 300);
		};

		init() {
			let popup = this;
			popup.showPopup();
			popup.hidePopupButtons.forEach((button) =>{
				button.addEventListener("click", popup.hidePopup.bind(popup), false);
			});
			popup.called.addEventListener("click", function(e){
				if (!e.target.closest('.inner')) {
					popup.hidePopup();
				};
			}, false);
		};
	};

	Array.prototype.forEach.call(document.querySelectorAll("[data-popup-call]"), function(button){
		button.addEventListener("click", function (e) {
			if (!button.dataset.popupCall) return;
			const newPopup = new Popup(button.dataset.popupCall);
			newPopup.init();
		});
	});

});

