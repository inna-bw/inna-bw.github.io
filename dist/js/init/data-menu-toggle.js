// data-menu-toggle
document.addEventListener('DOMContentLoaded', function(){

	const PAGE_HEADER = document.getElementById('mainHeader');

	class MenuToggle {
		activeButtonClassName = 'active';
		activeMenuClassName = 'active';
		animatedMenuClassName = 'animated';
		toggleButton = null;
		menuEl = null;

		constructor(toggleButton){
			this.toggleButton = toggleButton;
		}

		init(){
			this.toggleButton.addEventListener('click', this.menuToggle.bind(this), false);
			let menuId = this.toggleButton.dataset.menuToggle;
			this.menuEl = document.getElementById(menuId);

			document.addEventListener("click", function (e) {
				if (!e.target.closest('[data-menu-toggle]') && !e.target.closest('#'+menuId)) {
					this.closeMenu();
				};
			}.bind(this));

			document.addEventListener("click", function (e) {
				if (e.target.closest('[data-scrollto]')) {
					this.closeMenu();
				};
			}.bind(this));

		}

		closeMenu = function(){
			this.toggleButton.classList.remove(this.activeButtonClassName);
			this.menuEl.classList.remove(this.animatedMenuClassName);
			setTimeout(()=>{
				this.menuEl.classList.remove(this.activeMenuClassName);
			},50);
		};

		openMenu = function(){
			this.toggleButton.classList.add(this.activeButtonClassName);
			this.menuEl.classList.add(this.activeMenuClassName);
			setTimeout(()=>{
				this.menuEl.classList.add(this.animatedMenuClassName);
			},50);
		}

		menuToggle = function() {
			if (this.toggleButton.classList.contains(this.activeButtonClassName)) {
				this.closeMenu();
			} else {
				this.openMenu();
			};
		}
	};

	Array.prototype.forEach.call(document.querySelectorAll("[data-menu-toggle]"), function(toggleButton){
		const menuToggle = new MenuToggle(toggleButton);
		menuToggle.init();
	});
});

