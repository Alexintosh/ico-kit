import React from 'react';

import commonStyles from 'Components.module.less';

import styles from './StaticStats.module.less';
import CONF from '../../config'

export default function({ isClosed }) {
  return (
    <dl className={styles.root}>
      <div>
        <dt>Total Cap</dt>
        <dd>${CONF.tokenStats.totalCapUsd.label}</dd>
      </div>
      <div>
        <dt>Private Presale</dt>
        <dd>${CONF.tokenStats.presaleCapUsd.label}</dd>
      </div>
      <div>
        <dt>
          Public Sale&nbsp;
          <i className={commonStyles.textDanger}>{isClosed ? 'Closed' : 'Live'}</i>
        </dt>
        <dd>${CONF.tokenStats.publicsaleCapUsd.label}</dd>
      </div>
      <div>
        <dt>Total Supply</dt>
        <dd>{CONF.tokenStats.totalSupply.label} {CONF.tokenName}</dd>
      </div>
    </dl>
  );
}
