import {Fragment, h} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import range from '../../../../frontend/wallet/helpers/range'
import printAda from '../../../helpers/printAda'
import {Lovelace} from '../../../state'
import {AdaIcon} from '../../common/svg'

const Account = ({i, account, setAccount, selectedAccount}) => {
  const buttonLabel = () => {
    if (selectedAccount === i) return 'Active'
    if (!account) return `Explore #${i}`
    return `Activate #${i}`
  }
  return (
    <div key={i} className="card account" style={'width: 75%;'}>
      <div className="card-column" style="align-self: center; width">
        <button
          className="button primary"
          disabled={selectedAccount === i}
          onClick={() => {
            setAccount(i)
          }}
        >
          {buttonLabel()}
        </button>
      </div>
      <div className="card-column">
        <h2 className="card-title small-margin">Available balance</h2>
        <div className="balance-amount small">
          {printAda(
            account
              ? account.shelleyBalances.stakingBalance + account.shelleyBalances.nonStakingBalance
              : 0,
            3
          )}
          <AdaIcon />
        </div>
      </div>
      <div className="card-column">
        <h2 className="card-title small-margin">Rewards balance</h2>
        <div className="balance-amount small">
          {printAda(account ? account.shelleyBalances.rewardsAccountBalance : 0, 3)}
          <AdaIcon />
        </div>
      </div>
      <div className="card-column">
        <h2 className="card-title small-margin">Delegation</h2>
        <div className="delegation-account">
          {account ? account.shelleyAccountInfo.delegation.ticker || '-' : '-'}
        </div>
      </div>
    </div>
  )
}

const Accounts = ({accounts, setAccount, selectedAccount, reloadWalletInfo}) => {
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

  return (
    <Fragment>
      <div className="dashboard-column account">
        <div className="card account" style={'width: 100%;'}>
          <div>
            <h2 className="card-title small-margin">Total balance</h2>
            <div className="balance-amount">
              {printAda(totalBalance as Lovelace)}
              <AdaIcon />
            </div>
          </div>
          <div>
            <h2 className="card-title small-margin">Total rewards balance</h2>
            <div className="balance-amount">
              {printAda(totalRewardBalance as Lovelace)}
              <AdaIcon />
            </div>
          </div>
          <div className="card-column">
            <button className="button secondary balance refresh" onClick={reloadWalletInfo}>
              Refresh
            </button>
          </div>
        </div>
        <div className="dashboard-column account wide">
          <div>
            {range(0, Object.keys(accounts).length + 1).map(
              (i) =>
                (i === 0 || accounts[i - 1].isUsed) && (
                  <Account
                    key={i}
                    i={i}
                    account={accounts[i]}
                    setAccount={setAccount}
                    selectedAccount={selectedAccount}
                  />
                )
            )}
          </div>
          <div className="dashboard-column account narrow"> </div>
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
  }),
  actions
)(Accounts)
