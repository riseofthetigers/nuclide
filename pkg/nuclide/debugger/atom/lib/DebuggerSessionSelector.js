'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var DebuggerActions = require('./DebuggerActions');
var DebuggerProcessInfo = require('./DebuggerProcessInfo');
var DebuggerStore = require('./DebuggerStore');
var React = require('react-for-atom');

type ProcessInfo = {
  pid: number;
  name: string;
  command: string;
};

type State = {
  selectedProcess: ?DebuggerProcessInfo;
  processes: Array<DebuggerProcessInfo>;
  debuggerStoreChangeListener: ?atom$Disposable;
};

/**
 * View for setting up a new debugging session.
 */
var DebuggerSessionSelector = React.createClass({
  propTypes: {
    actions: React.PropTypes.instanceOf(DebuggerActions).isRequired,
    store: React.PropTypes.instanceOf(DebuggerStore).isRequired,
  },

  getInitialState(): State {
    return {
      processes: [],
      selectedProcess: null,
      debuggerStoreChangeListener: null,
    };
  },

  componentWillMount() {
    this.setState({
      debuggerStoreChangeListener: this.props.store.onChange(this._updateProcessList.bind(this)),
    });
    this._updateProcessList();
  },

  componentWillUnmount() {
    var listener = this.state.debuggerStoreChangeListener;
    if (listener != null) {
      listener.dispose();
    }
  },

  render(): ?ReactElement {
    return (
      <section className="padded">
        <h2>Attach to Process</h2>
        <div className="form">
          <div className="form-group">
            <select className="form-control" onChange={this._handleSelectProcess}>
              <option disabled selected={this.state.selectedProcess === null}>
                Process ID
              </option>
              {this._renderProcessChoices()}
            </select>
          </div>
          <div className="btn-toolbar form-group">
            <button
                className="btn btn-primary"
                onClick={this._handleClick}
                disabled={this.state.selectedProcess === null}>
              Attach
            </button>
            <button className="btn" onClick={this._updateProcessList}>
              Refresh List
            </button>
          </div>
        </div>
      </section>
    );
  },

  _updateProcessList(): void {
    this.props.store.getProcessInfoList().then(processList => {
      this.setState({
        processes: processList.sort(compareDebuggerProcessInfo)});
    });
  },

  _renderProcessChoices(): ?Array<ReactElement> {
    return this.state.processes
      .map((item, index) =>
        <option
            key={item.toString()}
            value={index}
            selected={item === this.state.selectedProcess}>
          {item.toString()}
        </option>
      );
  },

  _handleSelectProcess(e: any) {
    this.setState({
      selectedProcess: this.state.processes[e.target.value],
    });
  },

  _handleClick(e: any) {
    if (this.state.selectedProcess) {
      this.props.actions.attachToProcess(this.state.selectedProcess);
      this.setState({selectedProcess: null});
    }
  },
});

function compareDebuggerProcessInfo(
  value: nuclide_debugger$DebuggerProcessInfo,
  other: nuclide_debugger$DebuggerProcessInfo,
): number {
  var cmp = value.getServiceName().localeCompare(other.getServiceName());
  if (cmp === 0) {
    return value.compareDetails(other);
  } else {
    return cmp;
  }
}

module.exports = DebuggerSessionSelector;
