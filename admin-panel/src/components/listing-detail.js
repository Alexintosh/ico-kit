import React, { Component } from 'react'
import contractService from '../services/contract-service'
import ipfsService from '../services/ipfs-service'

import Overlay from './overlay'

class ListingsDetail extends Component {

  componentWillMount() {
    if (this.props.listingJson) {
      // Listing json passed in directly
      this.setState(this.props.listingJson)
      console.log(this.props);
    }
  }


  render() {
    return (
      <div>
        <div className="">
          <div className="row">
            <div className="col-12 col-md-8 detail-info-box">
              <div className="category">{this.props.schema.description}</div>
              { this.props.schema.description === 'Whitelist adresses' ?
                <ul>
                  {this.props.listingJson.addresses.map( (o, i) => <li key={i}>{o}</li>)}
                </ul>
              : null}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ListingsDetail
