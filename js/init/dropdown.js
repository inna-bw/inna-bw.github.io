//dropdown
document.addEventListener('DOMContentLoaded', function(){

	class Dropdown {
		activeClassName = 'opened';
		allDropdowns = document.querySelectorAll("[data-dropdown]");
		dropdownButton = null;

		constructor(dropdownEl){
			this.dropdownEl = dropdownEl;
		}

		init(){
			this.dropdownButton = this.dropdownEl.querySelector('.dropdown-header');
			this.dropdownButton.addEventListener('click', this.dropdownToggle.bind(this), false);
			document.addEventListener("click", function (e) {
				if (!e.target.closest('[data-dropdown]')) {
					this.closeAllDropdowns();
				};
			}.bind(this));
		}

		closeAllDropdowns = function(){
			let allDropdowns = document.querySelectorAll("[data-dropdown]");
			for (let i = 0; i < allDropdowns.length; i++) {
				let dropdownInner = allDropdowns[i].querySelector('.dropdown-inner');
				allDropdowns[i].classList.remove(this.activeClassName);
				dropdownInner.style.maxHeight = null;
			}
		}

		dropdownToggle = function() {
			let button = this.dropdownButton;
			let dropdownInner = button.parentElement.querySelector('.dropdown-inner');
			if (button.parentElement.classList.contains(this.activeClassName)) {
				this.closeAllDropdowns();
			} else {
				this.closeAllDropdowns();
				button.parentElement.classList.add(this.activeClassName);
			};
		}
	};

	Array.prototype.forEach.call(document.querySelectorAll("[data-dropdown]"), function(dropdownEl){
		const dropdown = new Dropdown(dropdownEl);
		dropdown.init();
	});
});