import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import originService from '../services/origin-service'
import contractService from '../services/contract-service'

import ListingDetail from '../components/listing-detail'
import Stats from '../components/stats'
import Form from 'react-jsonschema-form'
import Overlay from '../components/overlay'

export default class ControlICO extends Component {

  constructor(props) {
    super(props)

    // Enum of our states
    this.STEP = {
      PICK_SCHEMA: 1,
      DETAILS: 2,
      PREVIEW: 3,
      METAMASK: 4,
      PROCESSING: 5,
      SUCCESS: 6
    }

    this.schemaList = [
        {type: 'whitelist', name: 'Add address to whitelist', 'img': 'announcements.jpg'},
        {type: 'isWhitelisted', name: 'Check address in whitelist', 'img': 'announcements.jpg'},
        {type: 'updateRate', name: 'Update token-to-Ether-Rate ratio', 'img': 'announcements.jpg'},
        {type: 'ownerSafeWithdrawal', name: 'Execute Withdrawal', 'img': 'announcements.jpg'},
        {type: 'whitelistRemove', name: 'Remove Adress from whitelist', 'img': 'announcements.jpg'},
        {type: 'startOffering', name: 'StartOffering', 'img': 'announcements.jpg', type: 'text-success'},
        {type: 'endOffering', name: 'End ICO', 'img': 'announcements.jpg', type: 'text-danger'},
        {type: 'allocateTokensBeforeOffering', name: 'Allocate Tokens Before Offering', 'img': 'announcements.jpg'},
    ]

    this.state = {
      step: this.STEP.PICK_SCHEMA,
      selectedSchemaType: this.schemaList[0],
      selectedSchema: null,
      schemaFetched: false,
      formListing: {formData: null}
    }

    this.handleSchemaSelection = this.handleSchemaSelection.bind(this)
    this.onDetailsEntered = this.onDetailsEntered.bind(this)
  }

  handleSchemaSelection() {
    fetch(`/schemas/${this.state.selectedSchemaType}.json`)
    .then((response) => response.json())
    .then((schemaJson) => {
      this.setState({
        selectedSchema: schemaJson,
        schemaFetched: true,
        step: this.STEP.DETAILS
      })
    })
  }

  onDetailsEntered(formListing) {
    this.setState({
      formListing: formListing,
      step: this.STEP.PREVIEW
    })
  }

  onExecute(formListing, selectedSchemaType) {
    this.setState({ step: this.STEP.METAMASK })
    contractService.execute(formListing.formData, selectedSchemaType)
    .then((tx) => {
      this.setState({ step: this.STEP.PROCESSING })
      // Submitted to blockchain, now wait for confirmation
      contractService.waitTransactionFinished(tx)
      .then((blockNumber) => {
        this.setState({ step: this.STEP.SUCCESS })
        // TODO: Where do we take them after successful creation?
      })
      .catch((error) => {
        console.error(error)
        alert(error)
        // TODO: Reset form? Do something.
      })
    })
    .catch((error) => {
      console.error(error)
      alert(error)
      // TODO: Reset form? Do something.
    })
  }

  render() {
    window.scrollTo(0, 0)
    return (
      <div className="container listing-form">
        <Stats/>
        { this.state.step === this.STEP.PICK_SCHEMA &&
          <div className="step-container pick-schema">
            <div className="row flex-sm-row-reverse">
              <div className="col-md-12">
                <label>STEP {Number(this.state.step)}</label>

                <div className="row" >
                  <div className="col-md-8">
                    <h2>What type of listing do you want to create?</h2>
                  </div>
                  <div className="col-md-4">
                    <button className="pull-right btn btn-primary" onClick={() => this.handleSchemaSelection()}>
                        Next
                    </button>
                  </div>
                </div>

                <div className="schema-options">
                  {this.schemaList.map(schema => (
                    <div
                      className={
                        this.state.selectedSchemaType === schema.type ?
                        'schema-selection selected' : 'schema-selection'
                      }
                      key={schema.type}
                      onClick={() => this.setState({selectedSchemaType:schema.type})}
                    >
                      <span className={ schema.type ? schema.type : null}>{schema.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        }
        { this.state.step === this.STEP.DETAILS &&
          <div className="step-container">
            <div className="row">
              <div className="col-md-12">
                <label>STEP {Number(this.state.step)}</label>
                <Form
                  className="col-md-5"
                  schema={this.state.selectedSchema}
                  onSubmit={this.onDetailsEntered}
                  formData={this.state.formListing.formData}
                  onError={(errors) => console.log(`react-jsonschema-form errors: ${errors.length}`)}
                >

                  <div className="btn-container">
                    <button className="btn btn-other" onClick={() => this.setState({step: this.STEP.PICK_SCHEMA})}>
                      Back
                    </button>
                    <button type="submit" className="float-right btn btn-primary">Continue</button>
                  </div>

                </Form>

              </div>
            </div>
          </div>
        }
        { (this.state.step >= this.STEP.PREVIEW) &&
          <div className="step-container listing-preview">
            {this.state.step === this.STEP.METAMASK &&
              <Overlay imageUrl="/images/spinner-animation.svg">
                Confirm transaction<br />
                Press &ldquo;Submit&rdquo; in MetaMask window
              </Overlay>
            }
            {this.state.step === this.STEP.PROCESSING &&
              <Overlay imageUrl="/images/spinner-animation.svg">
                Processing<br />
                Please stand by...
              </Overlay>
            }
            {this.state.step === this.STEP.SUCCESS &&
              <Overlay imageUrl="/images/circular-check-button.svg">
                Success<br />
                <Link to="/stats">See your changes</Link>
              </Overlay>
            }
            <div className="row">
              <div className="col-md-7">
                <label className="create-step">STEP {Number(this.state.step)}</label>
                <h2>Preview your action</h2>
              </div>
            </div>
            <div className="row flex-sm-row-reverse">
              <div className="col-md-5">
                <div className="info-box">
                  <div>
                    <h2>What happens next?</h2>
                    When you hit submit,
                    your transaction representing your invetment will be published to <a target="_blank" href="https://ipfs.io">Ethereum network</a>
                    <br/><br/>Please review your investment before submitting. Your investment will NOT appear to others.
                  </div>
                </div>
              </div>
              <div className="col-md-7">
                <div className="preview">
                  <ListingDetail
                    schema={this.state.selectedSchema}
                    listingJson={this.state.formListing.formData} />
                </div>
                <div className="btn-container">
                  <button className="btn btn-other float-left" onClick={() => this.setState({step: this.STEP.DETAILS})}>
                    Back
                  </button>
                  <button className="btn btn-primary float-right"
                    onClick={() => this.onExecute(this.state.formListing, this.state.selectedSchemaType)}>
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    )
  }
}
