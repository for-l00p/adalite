import {h} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import Modal from '../../common/modal'
import DelegatePage from '../delegations/delegatePage'

const DelegationModal = ({closeDelegationModal}) => (
  <Modal onRequestClose={closeDelegationModal}>
    <DelegatePage />
  </Modal>
)

export default connect(
  (state) => ({}),
  actions
)(DelegationModal)
