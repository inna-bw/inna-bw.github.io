// Discord Widget plugin (updated)
// v3.1 — with init guard
// - Читає атрибути з data-*
// - Показує activity (legacy user.game або user.activities[0].name)
// - Join disabled, якщо немає instant_invite
// - Захист від повторної ініціалізації через data-initialized

'use strict';

function LDColor(color, percent) {
	let num = parseInt(color, 16);
	let amt = Math.round(2.55 * percent);
	let R = (num >> 16) + amt;
	let G = ((num >> 8) & 0x00ff) + amt;
	let B = (num & 0x0000ff) + amt;
	return (
		0x1000000 +
		(R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
		(G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
		(B < 255 ? (B < 1 ? 0 : B) : 255)
	).toString(16).slice(1);
}

window.addEventListener('load', () => {
	for (const widget of document.getElementsByTagName('discord-widget')) {
		// ---- guard: already initialized? ----
		if (widget.dataset.initialized === '1') continue;
		widget.dataset.initialized = '1';

		// --- read attributes strictly from data-* ---
		const id               = widget.dataset.id;             // ОБОВ'ЯЗКОВО
		const width            = widget.dataset.width  || '350px';
		const height           = widget.dataset.height || '400px';
		const footerText       = widget.dataset.footertext || '';
		const color            = widget.dataset.color  || '#2c2f34';
		const backgroundColor  = widget.dataset.backgroundcolor || '#23272a';
		const textColor        = widget.dataset.textcolor || '#fff';
		const statusColor      = widget.dataset.statuscolor || '#858585';

		// Якщо немає ID — показуємо одне повідомлення і все
		if (!id) {
			const body = document.createElement('widget-body');
			body.textContent = 'No Discord server ID was specified.';
			widget.append(body);
			continue;
		}

		// header
		const head  = document.createElement('widget-header');
		const logo  = document.createElement('widget-logo');
		const count = document.createElement('widget-header-count');
		head.append(logo, count);

		// body
		const body = document.createElement('widget-body');

		// footer
		const footer     = document.createElement('widget-footer');
		const footerInfo = document.createElement('widget-footer-info');
		const joinButton = document.createElement('widget-button-join');
		footerInfo.innerText = footerText || '';
		joinButton.innerText = 'Join';
		joinButton.addEventListener('click', (e) => {
			if (joinButton.classList.contains('is-disabled')) {
				e.preventDefault();
				return;
			}
			const href = joinButton.getAttribute('href');
			if (href) window.open(href, '_blank', '');
		});
		footer.append(footerInfo, joinButton);

		// styles
		widget.style.height = height;
		widget.style.width = width;
		widget.style.setProperty('--color', color);
		widget.style.setProperty('--bgColor', backgroundColor);
		widget.style.setProperty('--textColor', textColor);
		widget.style.setProperty('--buttonColor', `#${LDColor(color.replace('#', ''), -10)}`);
		widget.style.setProperty('--statusColor', statusColor);

		// mount
		widget.append(head, body, footer);

		// data
		fetch(`https://discord.com/api/guilds/${id}/widget.json`)
			.then((resp) => {
				if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
				return resp.json();
			})
			.then((data) => {
				// member count
				count.innerHTML = `<strong>${data.presence_count || 0}</strong> Members Online`;

				// join button
				if (data.instant_invite) {
					joinButton.setAttribute('href', data.instant_invite);
				} else {
					joinButton.classList.add('is-disabled');
					joinButton.title = 'Invite is not configured for this server';
				}

				// members
				body.innerHTML = '';
				(Array.isArray(data.members) ? data.members : []).forEach((user) => {
					const member = document.createElement('widget-member');

					const avatar = document.createElement('widget-member-avatar');
					const avatarIMG = document.createElement('img');
					avatarIMG.src = user.avatar_url || '';
					const status = document.createElement(`widget-member-status-${user.status || 'offline'}`);
					status.classList.add('widget-member-status');
					avatar.append(avatarIMG, status);

					const name = document.createElement('widget-member-name');
					name.innerText = user.username || '';

					// activity/status text
					let activityName = '';
					if (user && user.game && user.game.name) {
						activityName = user.game.name;
					} else if (Array.isArray(user.activities) && user.activities.length) {
						activityName = user.activities[0]?.name || '';
					}

					member.append(avatar, name);

					if (activityName) {
						const statusText = document.createElement('widget-member-status-text');
						statusText.innerText = activityName;
						member.append(statusText);
					}

					body.append(member);
				});
			})
			.catch((err) => {
				console.error('Discord widget error:', err);
				count.innerHTML = `<strong>0</strong> Members Online`;
				const note = document.createElement('widget-error');
				note.textContent = 'Discord widget is unavailable.';
				body.append(note);
				joinButton.classList.add('is-disabled');
			});
	}
});
