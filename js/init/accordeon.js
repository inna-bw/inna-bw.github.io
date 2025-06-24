// data-accordeon
document.addEventListener('DOMContentLoaded', function(){
	let ACCORDEON_ACTIVE_CLASS = 'active';

	let allAccordeons = document.querySelectorAll("[data-accordeon]");
	let allAccordeonsButtons = document.querySelectorAll(".accordeon-title");

	let closeAllAccordeons = function(){
		for (i = 0; i < allAccordeons.length; i++) {
			let accordeonInner = allAccordeons[i].querySelector('.accordeon-inner');
			allAccordeons[i].classList.remove(ACCORDEON_ACTIVE_CLASS);
		}
	};

	let openAllAccordeons = function(){
		for (i = 0; i < allAccordeons.length; i++) {
			let accordeonInner = allAccordeons[i].querySelector('.accordeon-inner');
			allAccordeons[i].classList.add(ACCORDEON_ACTIVE_CLASS);
		}
	};

	let accordeonToggle = function() {
		if (this.parentElement.classList.contains(ACCORDEON_ACTIVE_CLASS)) {
			closeAllAccordeons();
		} else {
			closeAllAccordeons();
			this.parentElement.classList.add(ACCORDEON_ACTIVE_CLASS);
		};
	}

	Array.prototype.forEach.call(document.querySelectorAll("[data-accordeon-open]"), function(button){
		button.addEventListener("click", function (e) {
			if (!button.dataset.accordeonOpen) return;
			let accordeonsCover = document.getElementById(button.dataset.accordeonOpen);
			let allAccordeons = accordeonsCover.querySelectorAll("[data-accordeon]");
			if (button.classList.contains(ACCORDEON_ACTIVE_CLASS)) {
				button.classList.remove(ACCORDEON_ACTIVE_CLASS);
				closeAllAccordeons();
			} else {
				button.classList.add(ACCORDEON_ACTIVE_CLASS);
				openAllAccordeons();
			};
		});
	});

	document.body.addEventListener('click', function(e){
		let accordeonButton = e.target.closest(".accordeon-title");
		if (accordeonButton){
			accordeonToggle.call(accordeonButton);
		};
	});



});