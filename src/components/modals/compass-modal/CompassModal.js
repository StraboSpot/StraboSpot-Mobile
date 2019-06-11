import React from 'react';
import Modal from '../../../shared/ui/modal/Modal.view';
import styles from "../../notebook-panel/notebook-measurements/MeasurementsStyles";
import Compass from '../../../components/compass/Compass';


const CompassModal = (props) => {
  return (
    <Modal
      component={<Compass/>}
      style={styles.compassContainer}
      close={props.close}
      textStyle={{fontWeight: 'bold' }}
    >Tap Compass to record a measurement</Modal>
  )
};

export default CompassModal;
