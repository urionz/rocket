import {
	Box,
	CheckBox,
	Field,
	Margins,
	RadioButton,
} from '@rocket.chat/fuselage';
import { useMergedRefs, useUniqueId } from '@rocket.chat/fuselage-hooks';
import React, { useRef, useState } from 'react';

import { useMethod } from '../../../contexts/ServerContext';
import { useBatchSettingsDispatch } from '../../../contexts/SettingsContext';
import { useToastMessageDispatch } from '../../../contexts/ToastMessagesContext';
import { useTranslation } from '../../../contexts/TranslationContext';
import { useFocus } from '../../../hooks/useFocus';
import { Icon } from '../../basic/Icon';
import { Pager } from '../Pager';
import { useSetupWizardContext } from '../SetupWizardState';
import { Step } from '../Step';
import { StepHeader } from '../StepHeader';
import './RegisterServerStep.css';

const Option = React.forwardRef(({ children, label, selected, disabled, ...props }, ref) => {
	const innerRef = useRef();
	const mergedRef = useMergedRefs(ref, innerRef);
	const id = useUniqueId();

	return <span
		className={[
			'SetupWizard__RegisterServerStep-option',
			selected && 'SetupWizard__RegisterServerStep-option--selected',
			disabled && 'SetupWizard__RegisterServerStep-option--disabled',
		].filter(Boolean).join(' ')}
		onClick={() => {
			innerRef.current.click();
		}}
	>
		<Field>
			<Field.Row>
				<RadioButton ref={mergedRef} id={id} checked={selected} disabled={disabled} {...props} />
				<Field.Label htmlFor={id}>{label}</Field.Label>
			</Field.Row>
		</Field>
		{children}
	</span>;
});

const Items = (props) => <ul className='SetupWizard__RegisterServerStep-items' {...props} />;

const Item = ({ children, icon, ...props }) =>
	<li className='SetupWizard__RegisterServerStep-item' {...props}>
		<Icon block='SetupWizard__RegisterServerStep-item-icon' icon={icon} />
		{children}
	</li>;

export function RegisterServerStep({ step, title, active }) {
	const { canDeclineServerRegistration, goToPreviousStep, goToFinalStep } = useSetupWizardContext();

	const [registerServer, setRegisterServer] = useState(true);
	const [optInMarketingEmails, setOptInMarketingEmails] = useState(true);
	const [agreeTermsAndPrivacy, setAgreeTermsAndPrivacy] = useState(false);

	const t = useTranslation();

	const [commiting, setComitting] = useState(false);

	const batchSetSettings = useBatchSettingsDispatch();

	const registerCloudWorkspace = useMethod('cloud:registerWorkspace');

	const dispatchToastMessage = useToastMessageDispatch();

	const handleBackClick = () => {
		goToPreviousStep();
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		setComitting(true);

		try {
			if (registerServer && !agreeTermsAndPrivacy) {
				throw new Object({ error: 'Register_Server_Terms_Alert' });
			}

			await batchSetSettings([
				{
					_id: 'Statistics_reporting',
					value: registerServer,
				},
				{
					_id: 'Apps_Framework_enabled',
					value: registerServer,
				},
				{
					_id: 'Register_Server',
					value: registerServer,
				},
				{
					_id: 'Allow_Marketing_Emails',
					value: optInMarketingEmails,
				},
				{
					_id: 'Cloud_Service_Agree_PrivacyTerms',
					value: agreeTermsAndPrivacy,
				},
			]);

			if (registerServer) {
				await registerCloudWorkspace();
			}

			setComitting(false);
			goToFinalStep();
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error });
			setComitting(false);
		}
	};

	const autoFocusRef = useFocus(active);

	const agreeTermsAndPrivacyId = useUniqueId();
	const optInMarketingEmailsId = useUniqueId();

	return <Step active={active} working={commiting} onSubmit={handleSubmit}>
		<StepHeader number={step} title={title} />

		<Margins blockEnd='x32'>
			<Box>
				<p className='SetupWizard__RegisterServerStep-text'>{t('Register_Server_Info')}</p>

				<div className='SetupWizard__RegisterServerStep-content'>
					<Option
						ref={autoFocusRef}
						data-qa='register-server'
						label={t('Register_Server_Registered')}
						name='registerServer'
						value='true'
						selected={registerServer}
						onChange={({ currentTarget: { checked } }) => {
							setRegisterServer(checked);
							setOptInMarketingEmails(checked);
						}}
					>
						<Items>
							<Item icon='check'>{t('Register_Server_Registered_Push_Notifications')}</Item>
							<Item icon='check'>{t('Register_Server_Registered_Livechat')}</Item>
							<Item icon='check'>{t('Register_Server_Registered_OAuth')}</Item>
							<Item icon='check'>{t('Register_Server_Registered_Marketplace')}</Item>
						</Items>
						<Field>
							<Field.Row>
								<CheckBox
									id={optInMarketingEmailsId}
									name='optInMarketingEmails'
									value='true'
									disabled={!registerServer}
									checked={optInMarketingEmails}
									onChange={({ currentTarget: { checked } }) => {
										setOptInMarketingEmails(checked);
									}}
								/>
								<Field.Label htmlFor={optInMarketingEmailsId}>{t('Register_Server_Opt_In')}</Field.Label>
							</Field.Row>
						</Field>
						<Field.Label text={t('Register_Server_Opt_In')} position='end' className='SetupWizard__RegisterServerStep__optIn'>

						</Field.Label>
					</Option>
					<Option
						data-qa='register-server-standalone'
						label={t('Register_Server_Standalone')}
						name='registerServer'
						value='false'
						disabled={!canDeclineServerRegistration}
						selected={!registerServer}
						onChange={({ currentTarget: { checked } }) => {
							setRegisterServer(!checked);
							setOptInMarketingEmails(!checked);
							setAgreeTermsAndPrivacy(!checked);
						}}
					>
						<Items>
							<Item icon='circle'>{t('Register_Server_Standalone_Service_Providers')}</Item>
							<Item icon='circle'>{t('Register_Server_Standalone_Update_Settings')}</Item>
							<Item icon='circle'>{t('Register_Server_Standalone_Own_Certificates')}</Item>
						</Items>
					</Option>

					<Margins all='x16'>
						<Field>
							<Field.Row>
								<CheckBox
									id={agreeTermsAndPrivacyId}
									name='agreeTermsAndPrivacy'
									data-qa='agree-terms-and-privacy'
									disabled={!registerServer}
									checked={agreeTermsAndPrivacy}
									onChange={({ currentTarget: { checked } }) => {
										setAgreeTermsAndPrivacy(checked);
									}}
								/>
								<Field.Label htmlFor={agreeTermsAndPrivacyId}>
									{t('Register_Server_Registered_I_Agree')} <a href='https://rocket.chat/terms'>{t('Terms')}</a> & <a href='https://rocket.chat/privacy'>{t('Privacy_Policy')}</a>
								</Field.Label>
							</Field.Row>
						</Field>
					</Margins>
				</div>
			</Box>
		</Margins>

		<Pager disabled={commiting} onBackClick={handleBackClick} />
	</Step>;
}
