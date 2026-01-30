document.addEventListener('DOMContentLoaded', function(){
	document.addEventListener('click', function(e) {
		const item = e.target.closest('.career-preview');
		if (!item) return;

		const titleEl = item.querySelector('.title');
		if (!titleEl) return;

		const titleText = titleEl.textContent.trim();
		localStorage.setItem('bw-career-title', titleText);
	});
})