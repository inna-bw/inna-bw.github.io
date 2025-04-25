// data-menu-toggle
document.addEventListener('DOMContentLoaded', function(){

	class MenuToggle {
		activeClassName = 'active';
		toggleButton = null;

		constructor(toggleButton){
			this.toggleButton = toggleButton;
		}

		init(){
			this.toggleButton.addEventListener('click', this.menuToggle.bind(this), false);
			// document.addEventListener("click", function (e) {
			// 	if (!e.target.closest('[data-dropdown]')) {
			// 		this.closeAllDropdowns();
			// 	};
			// }.bind(this));
		}

		// closeAllDropdowns = function(){
		// 	let allDropdowns = document.querySelectorAll("[data-dropdown]");
		// 	for (let i = 0; i < allDropdowns.length; i++) {
		// 		let dropdownInner = allDropdowns[i].querySelector('.dropdown-inner');
		// 		allDropdowns[i].classList.remove(this.activeClassName);
		// 		dropdownInner.style.maxHeight = null;
		// 	}
		// }

		menuToggle = function() {
			let button = this.toggleButton;
			console.log(this)
			// let dropdownInner = button.parentElement.querySelector('.dropdown-inner');
			// if (button.parentElement.classList.contains(this.activeClassName)) {
			// 	this.closeAllDropdowns();
			// } else {
			// 	this.closeAllDropdowns();
			// 	button.parentElement.classList.add(this.activeClassName);
			// };
		}
	};

	Array.prototype.forEach.call(document.querySelectorAll("[data-menu-toggle]"), function(toggleButton){
		const menuToggle = new MenuToggle(toggleButton);
		menuToggle.init();
	});
});

