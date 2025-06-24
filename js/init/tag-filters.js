document.addEventListener('DOMContentLoaded', function(){

	class TagFilter {
		filterAttribute = 'data-tag-filter';
		filteredTagAttribute = 'data-tag';

		filteredTagsCover = null;
		filterButtons = [];

		tagsParent = null;

		constructor(filterGroup) {
			this.tagsParent = document.getElementById(filterGroup.dataset.filter);
			this.filterButtons = Array.prototype.slice.call(filterGroup.querySelectorAll(`[${this.filterAttribute}]`));
			this.filterButtons.forEach((filterButton) => {
				filterButton.addEventListener('click', this.applyFilter.bind({button: filterButton, _this: this}), false);
			})
		};

		applyFilter() {
			let tagsParent = this._this.tagsParent;
			let tag = this.button.dataset.tagFilter;
			let attr = this._this.filteredTagAttribute;
			let tagsCover = Array.prototype.slice.call(tagsParent.querySelectorAll('.simple-tags'));
			tagsCover.forEach((cover) => {
				if (tag === 'all') {
					cover.closest('.news-cover').classList.add('visible');
				} else {
					if (cover.querySelectorAll(`[${attr}=${tag}]`) && cover.querySelectorAll(`[${attr}=${tag}]`).length) {
						cover.closest('.news-cover').classList.add('visible');
					} else {
						cover.closest('.news-cover').classList.remove('visible');
					}
				}
			});
			this._this.toggleButtonClass(this.button);
		};

		toggleButtonClass(button){
			this.filterButtons.forEach((btn) => {
				btn.classList.remove('active');
			})
			button.classList.add('active');
		};

	};

	Array.prototype.forEach.call(document.querySelectorAll("[data-filter]"), function(filterGroup){
		if (!filterGroup || !filterGroup.dataset.filter) return;
		const tagFilter = new TagFilter(filterGroup);
	});

});