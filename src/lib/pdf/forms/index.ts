import { registerForm } from '../form-registry';
import { unifiedApplicationForm } from './unified-application';
import { identityGuaranteeForm } from './identity-guarantee';
import { professionalRecForm } from './professional-rec';
import { occupationReportForm } from './occupation-report';
import { employmentReasonForm } from './employment-reason';
import { residenceConfirmForm } from './residence-confirm';

registerForm(unifiedApplicationForm);
registerForm(identityGuaranteeForm);
registerForm(professionalRecForm);
registerForm(occupationReportForm);
registerForm(employmentReasonForm);
registerForm(residenceConfirmForm);
