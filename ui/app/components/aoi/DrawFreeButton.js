import React, { Component } from "react";
import { FormattedMessage } from "react-intl";
import { connect } from "react-redux";

import styles from "../../styles/aoi/DrawAOIToolbar.css";
import {
  setFreeButtonSelected,
  setAllButtonsDefault
} from "../../actions/aoi/mapToolActions";
import { updateMode } from "../../actions/exports";

const DEFAULT_ICON = (
  <div>
    <i className={"material-icons " + styles.defaultButton}>create</i>
    <div className={styles.buttonName}>
      <FormattedMessage id="ui.draw.draw" defaultMessage="DRAW" />
    </div>
  </div>
);

const INACTIVE_ICON = (
  <div>
    <i className={"material-icons " + styles.inactiveButton}>create</i>
    <div className={styles.buttonName + " " + styles.buttonNameInactive}>
      <FormattedMessage id="ui.draw.draw" defaultMessage="DRAW" />
    </div>
  </div>
);

const SELECTED_ICON = (
  <div>
    <i className={"material-icons " + styles.selectedButton}>clear</i>
    <div className={styles.buttonName}>
      <FormattedMessage id="ui.draw.draw" defaultMessage="DRAW" />
    </div>
  </div>
);

export class DrawFreeButton extends Component {
  handleOnClick = () => {
    const icon = this.getIcon();

    if (icon === SELECTED_ICON) {
      this.props.setAllButtonsDefault();
      this.props.handleCancel();
    } else if (icon === DEFAULT_ICON) {
      this.props.setFreeButtonSelected();
      this.props.updateMode("MODE_DRAW_FREE");
    }
  };

  getIcon() {
    const { toolbarIcons: { free: icon } } = this.props;

    switch (icon) {
      case "SELECTED":
        return SELECTED_ICON;

      case "INACTIVE":
        return INACTIVE_ICON;

      default:
        return DEFAULT_ICON;
    }
  }

  render() {
    const icon = this.getIcon();

    return (
      <div className={styles.drawButtonGeneral} onClick={this.handleOnClick}>
        {icon}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    toolbarIcons: state.toolbarIcons,
    mode: state.mode
  };
}

export default connect(mapStateToProps, {
  setAllButtonsDefault,
  setFreeButtonSelected,
  updateMode
})(DrawFreeButton);
