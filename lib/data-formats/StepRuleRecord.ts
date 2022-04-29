import STEP_RECORD from './StepRecord';

export default interface STEP_RULE_RECORD {
  id?: number;
  name?: string;
  steps: Array<STEP_RECORD>;
}
