import {h, Component, Fragment} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'
import tooltip from '../../common/tooltip'
import printAda from '../../../helpers/printAda'
import {AdaIcon} from '../../common/svg'
import TransactionErrorModal from '../../pages/sendAda/transactionErrorModal'
import {getTranslation} from '../../../translations'
import {errorHasHelp} from '../../../helpers/errorsWithHelp'
import ConfirmTransactionDialog from '../../pages/sendAda/confirmTransactionDialog'
import {Lovelace, State} from '../../../state'
import {ADALITE_CONFIG} from '../../../config'
import Accordion from '../../common/accordion'

const CalculatingFee = () => <div className="validation-message send">Calculating fee...</div>

const DelegationValidation = ({delegationValidationError, txSuccessTab}) =>
  txSuccessTab === 'stake' && !delegationValidationError ? (
    <div className="validation-message transaction-success">Transaction successful!</div>
  ) : (
    delegationValidationError && (
      <div className="validation-message error">
        {getTranslation(delegationValidationError.code)}
      </div>
    )
  )

const StakePoolInfo = ({pool, gettingPoolInfo}) => {
  const {fixedCost, homepage, margin, ticker, name, validationError} = pool
  return (
    <div className={`stake-pool-info ${validationError ? 'invalid' : 'valid'}`}>
      {validationError ? (
        <div>{getTranslation(validationError.code)}</div>
      ) : gettingPoolInfo ? (
        <div>Getting pool info..</div>
      ) : (
        <div>
          <div>{`Name: ${name || ''}`}</div>
          <div>{`Ticker: ${ticker || ''}`}</div>
          <div>
            <a
              {...tooltip(
                'Tax is deducted from the rewards that pool distributes to the delegators.',
                true
              )}
            >
              <span className="delegation show-info">{''}</span>
            </a>
            {`Tax: ${margin * 100 || ''}`}%
          </div>
          <div>
            <a
              {...tooltip(
                'Fixed cost of the pool is taken from the pool rewards every epoch. This fee is shared among all delegators of the pool, not per delegator. Minimum value is 340 ADA.',
                true
              )}
            >
              <span className="delegation show-info">{''}</span>
            </a>
            {`Fixed cost: ${fixedCost ? printAda(parseInt(fixedCost, 10) as Lovelace) : ''}`}
          </div>
          <div>
            {'Homepage: '}
            <a target="_blank" href={homepage || ''}>
              {homepage || ''}
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

interface Props {
  updateStakePoolIdentifier: any
  removeStakePool: any
  stakePool: any
  delegationFee: any
  calculatingDelegationFee: any
  delegationValidationError: any
  isShelleyCompatible: any
  confirmTransaction: any
  closeTransactionErrorModal: any
  transactionSubmissionError: any
  shouldShowTransactionErrorModal: any
  selectAdaliteStakepool: any
  shouldShowConfirmTransactionDialog: any
  txSuccessTab: any
  gettingPoolInfo: boolean
  poolRecommendation: any
  pool: any
  withAccordion: boolean
}

class Delegate extends Component<Props> {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    if (ADALITE_CONFIG.ADALITE_STAKE_POOL_ID !== '') this.props.selectAdaliteStakepool()
  }

  render({
    updateStakePoolIdentifier,
    stakePool,
    delegationFee,
    calculatingDelegationFee,
    delegationValidationError,
    isShelleyCompatible,
    confirmTransaction,
    closeTransactionErrorModal,
    transactionSubmissionError,
    shouldShowTransactionErrorModal,
    shouldShowConfirmTransactionDialog,
    txSuccessTab,
    gettingPoolInfo,
    poolRecommendation,
    pool,
    withAccordion,
  }) {
    const delegationHandler = async () => {
      await confirmTransaction('delegate')
    }
    const validationError =
      delegationValidationError || stakePool.validationError || stakePool.poolHash === ''

    const DelegationHeader = () => <h2 className="card-title no-margin">Delegate Stake</h2>
    const DelegationContent = () => (
      <Fragment>
        <div className="stake-pool">
          <ul className="stake-pool-list">
            <li className="stake-pool-item">
              <input
                type="text"
                className="input stake-pool-id"
                name={'pool'}
                placeholder="Stake Pool ID"
                value={stakePool.poolHash}
                onInput={updateStakePoolIdentifier}
                autoComplete="off"
              />
              <StakePoolInfo pool={stakePool} gettingPoolInfo={gettingPoolInfo} />
              <div />
            </li>
          </ul>
        </div>

        <div className="add-stake-pool-wrapper" />
        <div className="delegation-info-row">
          <label className="fee-label">
            Fee<AdaIcon />
          </label>
          <div className="delegation-fee">{printAda(delegationFee)}</div>
        </div>
        <div className="validation-row">
          <button
            className="button primary"
            disabled={
              !isShelleyCompatible ||
              validationError ||
              calculatingDelegationFee ||
              stakePool.poolHash === ''
            }
            onClick={delegationHandler}
            {...tooltip(
              'You are using Shelley incompatible wallet. To delegate your ADA, follow the instructions to convert you wallet.',
              !isShelleyCompatible
            )}
          >
            Delegate
          </button>
          {[
            calculatingDelegationFee ? (
              <CalculatingFee />
            ) : (
              <DelegationValidation
                delegationValidationError={delegationValidationError}
                txSuccessTab={txSuccessTab}
              />
            ),
          ]}
        </div>
        {shouldShowTransactionErrorModal && (
          <TransactionErrorModal
            onRequestClose={closeTransactionErrorModal}
            errorMessage={getTranslation(
              transactionSubmissionError.code,
              transactionSubmissionError.params
            )}
            showHelp={errorHasHelp(transactionSubmissionError.code)}
          />
        )}
        {shouldShowConfirmTransactionDialog && <ConfirmTransactionDialog isDelegation />}
      </Fragment>
    )

    return (
      <div className="delegate card">
        {withAccordion ? (
          <Accordion
            initialVisibility={
              poolRecommendation.shouldShowSaturatedBanner || !Object.keys(pool).length
            }
            header={<DelegationHeader />}
            body={<DelegationContent />}
          />
        ) : (
          <Fragment>
            <DelegationHeader />
            <DelegationContent />
          </Fragment>
        )}
      </div>
    )
  }
}

Delegate.defaultProps = {
  withAccordion: true,
}

export default connect(
  (state: State) => ({
    stakePool: state.shelleyDelegation.selectedPool,
    calculatingDelegationFee: state.calculatingDelegationFee,
    delegationFee: state.shelleyDelegation.delegationFee,
    delegationValidationError: state.delegationValidationError,
    shouldShowTransactionErrorModal: state.shouldShowTransactionErrorModal,
    transactionSubmissionError: state.transactionSubmissionError,
    shouldShowConfirmTransactionDialog: state.shouldShowConfirmTransactionDialog,
    txSuccessTab: state.txSuccessTab,
    gettingPoolInfo: state.gettingPoolInfo,
    isShelleyCompatible: state.isShelleyCompatible,
    poolRecommendation: state.poolRecommendation,
    pool: state.shelleyAccountInfo.delegation,
  }),
  actions
)(Delegate)
