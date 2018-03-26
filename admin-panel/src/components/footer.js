import React from 'react'

const Footer = (props) => {
  return (
    <footer className="dark-footer">
      <div className="container">
        <div className="row">
          <div className="col-12 col-md-6">
            <div className="logo-container">
              Kairos Project
            </div>
            <p className="company-mission">
              Kairos is building the trustless economy of tomorrow.
              Leap provides the possibility to lock up ether for beneficiary which will unlock upon certain condition.
            </p>
            <p>
              &copy; 2018 Kairos, Project.
            </p>
          </div>
          <div className="col-12 col-md-6">
            <div className="row">
              <div className="col-6 col-md-4">
                <div className="footer-header">
                  Documentation
                </div>
                <ul className="footer-links">
                  <li>
                    <a href="https://www.originprotocol.com/product-brief">Product Brief</a>
                  </li>
                  <li>
                    <a href="https://www.originprotocol.com/whitepaper">Whitepaper</a>
                  </li>
                  <li>
                    <a href="https://github.com/OriginProtocol">Github</a>
                  </li>
                  <li>
                    <a href="http://docs.originprotocol.com/">Docs</a>
                  </li>
                </ul>
              </div>
              <div className="col-6 col-md-4">
                <div className="footer-header">
                  Community
                </div>
                <ul className="footer-links">
                  <li>
                    <a href="http://slack.originprotocol.com">Slack</a>
                  </li>
                  <li>
                    <a href="https://t.me/originprotocol">Telegram</a>
                  </li>
                  <li>
                    <a href="https://medium.com/originprotocol">Medium</a>
                  </li>
                  <li>
                    <a href="https://twitter.com/originprotocol">Twitter</a>
                  </li>
                  <li>
                    <a href="https://www.facebook.com/originprotocol">Facebook</a>
                  </li>
                </ul>
              </div>
              <div className="col-6 col-md-4">
                <div className="footer-header">
                  Organization
                </div>
                <ul className="footer-links">
                  <li>
                    <a href="http://www.originprotocol.com/presale">Presale</a>
                  </li>
                  <li>
                    <a href="http://www.originprotocol.com/team">Team</a>
                  </li>
                  <li>
                    <a href="https://angel.co/originprotocol/jobs">Jobs (We&rsquo;re hiring!)</a>
                  </li>
                  <li>
                    <a href="https://www.google.com/maps/place/845+Market+St+%23450a,+San+Francisco,+CA+94103">845 Market St, #450A, San Francisco, CA 94103</a>
                  </li>
                  <li>
                    <a href="mailto:info@originprotocol.com">info@kairosproject.io</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
