import {Fragment, h} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import range from '../../../../frontend/wallet/helpers/range'
import printAda from '../../../helpers/printAda'
import {Lovelace} from '../../../state'
import {AdaIcon} from '../../common/svg'
import Alert from '../../common/alert'
import SendTransactionModal from './sendTransactionModal'
import DelegationModal from './delegationModal'
import tooltip from '../../common/tooltip'

const Account = ({
  i,
  account,
  firstAddressPerAccount,
  setAccount,
  selectedAccount,
  shouldShowDelegationModal,
  shouldShowSendTransactionModal,
}) => {
  const buttonLabel = () => {
    if (selectedAccount === i) return 'Active'
    if (!account) return `Explore #${i}`
    return `Activate #${i}`
  }
  const Balance = ({value}: {value: Lovelace}) => (
    <Fragment>
      {printAda(value, 3)}
      <AdaIcon />
    </Fragment>
  )

  return (
    <div key={i} className="card account">
      <div className="header-wrapper mobile">
        <h2 className="card-title small-margin">Account {i}</h2>
      </div>
      <div className="card-column account-button-wrapper">
        <h2 className="card-title small-margin account-header desktop">Account {i}</h2>
        <button
          className="button primary no-wrap"
          disabled={selectedAccount === i}
          onClick={() => {
            setAccount(i)
          }}
        >
          {buttonLabel()}
        </button>
      </div>
      <div className="card-column account-item-info-wrapper">
        <h2 className="card-title small-margin no-wrap">
          Available balance
          {account &&
            selectedAccount !== i && (
            <Fragment>
              <span {...tooltip(`Transfer funds to account ${i}`, true)}>
                <a
                  className="account-icon to-wallet"
                  onClick={() =>
                    shouldShowSendTransactionModal(
                      firstAddressPerAccount[i],
                      `Send ADA from account ${selectedAccount} to account ${i}`
                    )
                  }
                />
              </span>
              <span {...tooltip(`Transfer funds from account ${i}`, true)}>
                <a
                  className="account-icon from-wallet"
                  onClick={() =>
                    shouldShowSendTransactionModal(
                      firstAddressPerAccount[selectedAccount],
                      `Send ADA from account ${i} to account ${selectedAccount}`
                    )
                  }
                />
              </span>
            </Fragment>
          )}
        </h2>
        <div className="balance-amount small item">
          {account ? (
            <Balance
              value={
                account.shelleyBalances.stakingBalance + account.shelleyBalances.nonStakingBalance
              }
            />
          ) : (
            '-'
          )}
        </div>
      </div>
      <div className="card-column account-item-info-wrapper">
        <h2 className="card-title small-margin no-wrap">
          Rewards balance
          {account && (
            <span {...tooltip(`Withdraw account ${i} rewards`, true)}>
              <a className="account-icon withdraw" />
            </span>
          )}
        </h2>
        <div className="balance-amount small item">
          {account ? <Balance value={account.shelleyBalances.rewardsAccountBalance} /> : '-'}
        </div>
      </div>
      <div className="card-column account-item-info-wrapper">
        <h2 className="card-title small-margin no-wrap">
          Delegation
          {account && (
            <span {...tooltip(`Delegate account ${i} stake`, true)}>
              <a
                className="account-icon delegation"
                onClick={() => shouldShowDelegationModal(`Delegate Account ${i} Stake`)}
              />
            </span>
          )}
        </h2>
        <div className="delegation-account item">
          {account ? account.shelleyAccountInfo.delegation.ticker || '-' : '-'}
        </div>
      </div>
    </div>
  )
}

const Accounts = ({
  accounts,
  setAccount,
  selectedAccount,
  reloadWalletInfo,
  showTransactionModal,
  showDelegationModal,
  shouldShowSendTransactionModal,
  shouldShowDelegationModal,
}) => {
  const accountInfos = Object.values(accounts)
  const totalBalance = accountInfos.reduce(
    (a, {shelleyBalances}) =>
      shelleyBalances.stakingBalance + shelleyBalances.nonStakingBalance + a,
    0
  )
  const totalRewardBalance = accountInfos.reduce(
    (a, {shelleyBalances}) => shelleyBalances.rewardsAccountBalance + a,
    0
  )
  const firstAddressPerAccount = accountInfos.map((e: any) => e.visibleAddresses[0].address)
  const InfoAlert = () => (
    <Fragment>
      <div className="dashboard-column account sidebar-item info">
        <Alert alertType="info sidebar">
          <p>
            <strong>Accounts</strong> offer a way to split your funds. You are able to delegate to
            different pool from each account. Each account has different set of addresses and keys.
          </p>
        </Alert>
      </div>
      <div className="dashboard-column account sidebar-item info">
        <Alert alertType="info sidebar">
          <p>
            Click explore/activate button to load data for related account. If you are using
            hardware wallet, you will be requested to export public key.
          </p>
        </Alert>
      </div>
      <div className="dashboard-column account info">
        <Alert alertType="warning sidebar">
          <p>
            This feature might not be supported on other wallets yet. If you decide to move your
            funds to <strong>account</strong> other then <strong>account 0</strong>, you might not
            see your funds in other wallets.
          </p>
        </Alert>
      </div>
    </Fragment>
  )

  return (
    <Fragment>
      {showTransactionModal && <SendTransactionModal />}
      {showDelegationModal && <DelegationModal />}
      <div className="dashboard-column account">
        <div className="card account-aggregated">
          <div className="balance">
            <div className="item">
              <h2 className="card-title small-margin">Total balance</h2>
              <div className="balance-amount">
                {printAda(totalBalance as Lovelace)}
                <AdaIcon />
              </div>
            </div>
            <div className="item">
              <h2 className="card-title small-margin">Total rewards balance</h2>
              <div className="balance-amount">
                {printAda(totalRewardBalance as Lovelace)}
                <AdaIcon />
              </div>
            </div>
          </div>
          <div className="refresh-wrapper">
            <button className="button secondary balance refresh" onClick={reloadWalletInfo}>
              Refresh
            </button>
          </div>
        </div>
        <div className="mobile">
          <InfoAlert />
        </div>
        <div className="accounts-wrapper">
          <div className="dashboard-column account list">
            <div>
              {range(0, Object.keys(accounts).length + 1).map(
                (i) =>
                  (i === 0 || accounts[i - 1].isUsed) && (
                    <Account
                      key={i}
                      i={i}
                      account={accounts[i]}
                      firstAddressPerAccount={firstAddressPerAccount}
                      setAccount={setAccount}
                      selectedAccount={selectedAccount}
                      shouldShowSendTransactionModal={shouldShowSendTransactionModal}
                      shouldShowDelegationModal={shouldShowDelegationModal}
                    />
                  )
              )}
            </div>
          </div>
          <div className="desktop">
            <InfoAlert />
          </div>
        </div>
      </div>
    </Fragment>
  )
}

export default connect(
  (state) => ({
    isDemoWallet: state.isDemoWallet,
    accounts: state.accounts,
    selectedAccount: state.selectedAccount,
    showTransactionModal: state.shouldShowSendTransactionModal,
    showDelegationModal: state.shouldShowDelegationModal,
  }),
  actions
)(Accounts)
