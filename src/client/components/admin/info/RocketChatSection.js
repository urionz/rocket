import { Skeleton, Subtitle } from '@rocket.chat/fuselage';
import React from 'react';

import { useTranslation } from '../../../contexts/TranslationContext';
import { formatDate, formatHumanReadableTime } from './formatters';
import { DescriptionList } from './DescriptionList';

export function RocketChatSection({ info, statistics, isLoading }) {
	const s = (fn) => (isLoading ? <Skeleton width='50%' /> : fn());
	const t = useTranslation();

	const appsEngineVersion = info && info.marketplaceApiVersion;

	return <>
		<Subtitle data-qa='rocket-chat-title'>{t('Rocket.Chat')}</Subtitle>
		<DescriptionList data-qa='rocket-chat-list'>
			<DescriptionList.Entry label={t('Version')}>{s(() => statistics.version)}</DescriptionList.Entry>
			{appsEngineVersion && <DescriptionList.Entry label={t('Apps_Engine_Version')}>{appsEngineVersion}</DescriptionList.Entry>}
			<DescriptionList.Entry label={t('DB_Migration')}>{s(() => statistics.migration.version)}</DescriptionList.Entry>
			<DescriptionList.Entry label={t('DB_Migration_Date')}>{s(() => formatDate(statistics.migration.lockedAt))}</DescriptionList.Entry>
			<DescriptionList.Entry label={t('Installed_at')}>{s(() => formatDate(statistics.installedAt))}</DescriptionList.Entry>
			<DescriptionList.Entry label={t('Uptime')}>{s(() => formatHumanReadableTime(statistics.process.uptime, t))}</DescriptionList.Entry>
			<DescriptionList.Entry label={t('Deployment_ID')}>{s(() => statistics.uniqueId)}</DescriptionList.Entry>
			<DescriptionList.Entry label={t('PID')}>{s(() => statistics.process.pid)}</DescriptionList.Entry>
			<DescriptionList.Entry label={t('Running_Instances')}>{s(() => statistics.instanceCount)}</DescriptionList.Entry>
			<DescriptionList.Entry label={t('OpLog')}>{s(() => (statistics.oplogEnabled ? t('Enabled') : t('Disabled')))}</DescriptionList.Entry>
		</DescriptionList>
	</>;
}
