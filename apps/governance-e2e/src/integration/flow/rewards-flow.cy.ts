import {
  navigateTo,
  navigation,
  waitForSpinner,
} from '../../support/common.functions';
import {
  clickOnValidatorFromList,
  closeStakingDialog,
  stakingPageAssociateTokens,
  stakingValidatorPageAddStake,
  waitForBeginningOfEpoch,
} from '../../support/staking.functions';
import { ethereumWalletConnect } from '../../support/wallet-eth.functions';
import {
  depositAsset,
  vegaWalletTeardown,
} from '../../support/wallet-teardown.functions';

const vegaAssetAddress = '0x67175Da1D5e966e40D11c4B2519392B2058373de';
const vegaWalletUnstakedBalance =
  '[data-testid="vega-wallet-balance-unstaked"]';
const rewardsTable = 'epoch-total-rewards-table';
const txTimeout = Cypress.env('txTimeout');
const rewardsTimeOut = { timeout: 60000 };

context('rewards - flow', { tags: '@slow' }, function () {
  before('set up environment to allow rewards', function () {
    cy.visit('/');
    waitForSpinner();
    depositAsset(vegaAssetAddress, '1000');
    cy.validatorsSelfDelegate();
    ethereumWalletConnect();
    cy.connectVegaWallet();
    cy.VegaWalletTopUpRewardsPool(30, 200);
    navigateTo(navigation.validators);
    vegaWalletTeardown();
    stakingPageAssociateTokens('6000');
    cy.get(vegaWalletUnstakedBalance, txTimeout).should(
      'contain',
      '6,000.0',
      txTimeout
    );
    cy.get('button').contains('Select a validator to nominate').click();
    clickOnValidatorFromList(0);
    stakingValidatorPageAddStake('3000');
    closeStakingDialog();
    navigateTo(navigation.validators);
    clickOnValidatorFromList(1);
    stakingValidatorPageAddStake('3000');
    closeStakingDialog();
    navigateTo(navigation.rewards);
  });

  it('Should display rewards per epoch', function () {
    cy.getByTestId(rewardsTable, rewardsTimeOut).should('exist');
    cy.getByTestId(rewardsTable)
      .first()
      .within(() => {
        cy.getByTestId('asset').should('have.text', 'Vega');
        cy.getByTestId('ACCOUNT_TYPE_GLOBAL_REWARD').should('have.text', '1');
        cy.getByTestId('ACCOUNT_TYPE_FEES_INFRASTRUCTURE').should(
          'have.text',
          '0'
        );
        cy.getByTestId('total').should('have.text', '1');
      });
  });

  it('Should update when epoch starts', function () {
    cy.getByTestId(rewardsTable)
      .first()
      .within(() => {
        cy.get('h2').first().invoke('text').as('epochNumber');
      });
    waitForBeginningOfEpoch();
    cy.get('@epochNumber').then((epochNumber) => {
      cy.getByTestId(rewardsTable)
        .first()
        .within(() => {
          cy.get('h2').first().invoke('text').should('not.equal', epochNumber);
        });
    });
  });

  // 2002-SINC-009 2002-SINC-010 2002-SINC-011 2002-SINC-012
  it('Should display table of rewards earned by connected vega wallet', function () {
    cy.getByTestId('epoch-reward-view-toggle-individual').click();
    cy.getByTestId('connected-vega-key')
      .find('span')
      .should('have.text', Cypress.env('vegaWalletPublicKey'));
    cy.getByTestId('epoch-individual-rewards-table')
      .first()
      .within(() => {
        cy.get('h2').first().should('contain.text', 'EPOCH');
        cy.getByTestId('individual-rewards-asset').should('have.text', 'Vega');
        cy.getByTestId('ACCOUNT_TYPE_GLOBAL_REWARD')
          .should('contain.text', '0.1177')
          .and('contain.text', '(11.7733%)');
        cy.getByTestId('ACCOUNT_TYPE_FEES_INFRASTRUCTURE')
          .should('contain.text', '0.0001')
          .and('contain.text', '(11.7733%)');
        cy.getByTestId('total').should('have.text', '0.1179');
      });
  });
});
