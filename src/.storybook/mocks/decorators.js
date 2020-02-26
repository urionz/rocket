import React from 'react';

import { MeteorProviderMock } from './providers';

export const rocketChatDecorator = (fn) => {
	const linkElement = document.getElementById('theme-styles') || document.createElement('link');
	if (linkElement.id !== 'theme-styles') {
		require('../../app/theme/client/main.css');
		require('../../app/theme/client/vendor/fontello/css/fontello.css');
		require('../../client/rocketchat.font.css');
		linkElement.setAttribute('id', 'theme-styles');
		linkElement.setAttribute('rel', 'stylesheet');
		linkElement.setAttribute('href', 'https://open.rocket.chat/theme.css');
		document.head.appendChild(linkElement);
	}

	// eslint-disable-next-line import/no-unresolved
	const { default: icons } = require('!!raw-loader!../../private/public/icons.svg');

	return <MeteorProviderMock>
		<style>{`
			body {
				background-color: white;
			}
		`}</style>
		<div dangerouslySetInnerHTML={{ __html: icons }} />
		<div className='global-font-family color-primary-font-color'>
			{fn()}
		</div>
	</MeteorProviderMock>;
};
