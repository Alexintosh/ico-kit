import moment from 'moment';
import CONF from '../config';

export const GOAL_ETH = CONF.GOAL_ETH;

export const START_DATE = moment.utc(CONF.START_DATE_UTC);

export const PHASE_1_END_DURATION = moment.duration(CONF.PHASE_1_END_DURATION);
export const PHASE_1_END_DATE = START_DATE.clone().add(PHASE_1_END_DURATION);
