import { Skeleton, Subtitle } from '@rocket.chat/fuselage';
import React from 'react';

import { useTranslation } from '../../../contexts/TranslationContext';
import { DescriptionList } from './DescriptionList';
import { formatMemorySize, formatHumanReadableTime, formatCPULoad } from './formatters';

export function RuntimeEnvironmentSection({ statistics, isLoading }) {
	const s = (fn) => (isLoading ? <Skeleton width='50%' /> : fn());
	const t = useTranslation();

	return <>
		<Subtitle data-qa='runtime-env-title'>{t('Runtime_Environment')}</Subtitle>
		<DescriptionList data-qa='runtime-env-list'>
			<DescriptionList.Entry label={t('OS_Type')}>{s(() => statistics.os.type)}</DescriptionList.Entry>
			<DescriptionList.Entry label={t('OS_Platform')}>{s(() => statistics.os.platform)}</DescriptionList.Entry>
			<DescriptionList.Entry label={t('OS_Arch')}>{s(() => statistics.os.arch)}</DescriptionList.Entry>
			<DescriptionList.Entry label={t('OS_Release')}>{s(() => statistics.os.release)}</DescriptionList.Entry>
			<DescriptionList.Entry label={t('Node_version')}>{s(() => statistics.process.nodeVersion)}</DescriptionList.Entry>
			<DescriptionList.Entry label={t('Mongo_version')}>{s(() => statistics.mongoVersion)}</DescriptionList.Entry>
			<DescriptionList.Entry label={t('Mongo_storageEngine')}>{s(() => statistics.mongoStorageEngine)}</DescriptionList.Entry>
			<DescriptionList.Entry label={t('OS_Uptime')}>{s(() => formatHumanReadableTime(statistics.os.uptime, t))}</DescriptionList.Entry>
			<DescriptionList.Entry label={t('OS_Loadavg')}>{s(() => formatCPULoad(statistics.os.loadavg))}</DescriptionList.Entry>
			<DescriptionList.Entry label={t('OS_Totalmem')}>{s(() => formatMemorySize(statistics.os.totalmem))}</DescriptionList.Entry>
			<DescriptionList.Entry label={t('OS_Freemem')}>{s(() => formatMemorySize(statistics.os.freemem))}</DescriptionList.Entry>
			<DescriptionList.Entry label={t('OS_Cpus')}>{s(() => statistics.os.cpus.length)}</DescriptionList.Entry>
		</DescriptionList>
	</>;
}
