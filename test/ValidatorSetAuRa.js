const EternalStorageProxy = artifacts.require('EternalStorageProxy');
const ValidatorSetAuRa = artifacts.require('ValidatorSetAuRaMock');

const ERROR_MSG = 'VM Exception while processing transaction: revert';
const BN = web3.utils.BN;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should();

contract('ValidatorSetAuRa', async accounts => {
  let validatorSetAuRa;

  describe('initialize()', async () => {
    const initialValidators = accounts.slice(0, 3);

    beforeEach(async () => {
      initialValidators.length.should.be.equal(3);
      initialValidators[0].should.not.be.equal('0x0000000000000000000000000000000000000000');
      initialValidators[1].should.not.be.equal('0x0000000000000000000000000000000000000000');
      initialValidators[2].should.not.be.equal('0x0000000000000000000000000000000000000000');
      validatorSetAuRa = await ValidatorSetAuRa.new();
      await validatorSetAuRa.setCurrentBlockNumber(0);
    });
    it('should initialize successfully', async () => {
      await validatorSetAuRa.initialize(
        '0x2000000000000000000000000000000000000001', // _blockRewardContract
        '0x3000000000000000000000000000000000000001', // _randomContract
        '0x0000000000000000000000000000000000000000', // _erc20TokenContract
        initialValidators, // _initialValidators
        1, // _delegatorMinStake
        1, // _candidateMinStake
        200 // _stakingEpochDuration
      ).should.be.fulfilled;
      new BN(200).should.be.bignumber.equal(
        await validatorSetAuRa.stakingEpochDuration.call()
      );
      new BN(0).should.be.bignumber.equal(
        await validatorSetAuRa.stakingEpochStartBlock.call()
      );
      '0x2000000000000000000000000000000000000001'.should.be.equal(
        await validatorSetAuRa.blockRewardContract.call()
      );
      '0x3000000000000000000000000000000000000001'.should.be.equal(
        await validatorSetAuRa.randomContract.call()
      );
      '0x0000000000000000000000000000000000000000'.should.be.equal(
        await validatorSetAuRa.erc20TokenContract.call()
      );
      (await validatorSetAuRa.getValidators.call()).should.be.deep.equal(initialValidators);
      (await validatorSetAuRa.getPendingValidators.call()).should.be.deep.equal(initialValidators);
      for (let i = 0; i < initialValidators.length; i++) {
        new BN(i).should.be.bignumber.equal(
          await validatorSetAuRa.validatorIndex.call(initialValidators[i])
        );
        true.should.be.equal(
          await validatorSetAuRa.isValidator.call(initialValidators[i])
        );
        new BN(i).should.be.bignumber.equal(
          await validatorSetAuRa.poolIndex.call(initialValidators[i])
        );
        true.should.be.equal(
          await validatorSetAuRa.isPoolActive.call(initialValidators[i])
        );
      }
      false.should.be.equal(
        await validatorSetAuRa.isValidator.call('0x0000000000000000000000000000000000000000')
      );
      (await validatorSetAuRa.getValidators.call()).should.be.deep.equal(
        await validatorSetAuRa.getPools.call()
      );
      new BN(web3.utils.toWei('1', 'ether')).should.be.bignumber.equal(
        await validatorSetAuRa.getDelegatorMinStake.call()
      );
      new BN(web3.utils.toWei('1', 'ether')).should.be.bignumber.equal(
        await validatorSetAuRa.getCandidateMinStake.call()
      );
      new BN(1).should.be.bignumber.equal(
        await validatorSetAuRa.validatorSetApplyBlock.call()
      );
    });
    it('should fail if the current block number is not zero', async () => {
      await validatorSetAuRa.setCurrentBlockNumber(1);
      await validatorSetAuRa.initialize(
        '0x2000000000000000000000000000000000000001', // _blockRewardContract
        '0x3000000000000000000000000000000000000001', // _randomContract
        '0x0000000000000000000000000000000000000000', // _erc20TokenContract
        initialValidators, // _initialValidators
        1, // _delegatorMinStake
        1, // _candidateMinStake
        200 // _stakingEpochDuration
      ).should.be.rejectedWith(ERROR_MSG);
    });
    it('should fail if BlockRewardAuRa contract address is zero', async () => {
      await validatorSetAuRa.initialize(
        '0x0000000000000000000000000000000000000000', // _blockRewardContract
        '0x3000000000000000000000000000000000000001', // _randomContract
        '0x0000000000000000000000000000000000000000', // _erc20TokenContract
        initialValidators, // _initialValidators
        1, // _delegatorMinStake
        1, // _candidateMinStake
        200 // _stakingEpochDuration
      ).should.be.rejectedWith(ERROR_MSG);
    });
    it('should fail if RandomAuRa contract address is zero', async () => {
      await validatorSetAuRa.initialize(
        '0x2000000000000000000000000000000000000001', // _blockRewardContract
        '0x0000000000000000000000000000000000000000', // _randomContract
        '0x0000000000000000000000000000000000000000', // _erc20TokenContract
        initialValidators, // _initialValidators
        1, // _delegatorMinStake
        1, // _candidateMinStake
        200 // _stakingEpochDuration
      ).should.be.rejectedWith(ERROR_MSG);
    });
    it('should fail if initial validators array is empty', async () => {
      await validatorSetAuRa.initialize(
        '0x2000000000000000000000000000000000000001', // _blockRewardContract
        '0x3000000000000000000000000000000000000001', // _randomContract
        '0x0000000000000000000000000000000000000000', // _erc20TokenContract
        [], // _initialValidators
        1, // _delegatorMinStake
        1, // _candidateMinStake
        200 // _stakingEpochDuration
      ).should.be.rejectedWith(ERROR_MSG);
    });
    it('should fail if delegatorMinStake is zero', async () => {
      await validatorSetAuRa.initialize(
        '0x2000000000000000000000000000000000000001', // _blockRewardContract
        '0x3000000000000000000000000000000000000001', // _randomContract
        '0x0000000000000000000000000000000000000000', // _erc20TokenContract
        initialValidators, // _initialValidators
        0, // _delegatorMinStake
        1, // _candidateMinStake
        200 // _stakingEpochDuration
      ).should.be.rejectedWith(ERROR_MSG);
    });
    it('should fail if candidateMinStake is zero', async () => {
      await validatorSetAuRa.initialize(
        '0x2000000000000000000000000000000000000001', // _blockRewardContract
        '0x3000000000000000000000000000000000000001', // _randomContract
        '0x0000000000000000000000000000000000000000', // _erc20TokenContract
        initialValidators, // _initialValidators
        1, // _delegatorMinStake
        0, // _candidateMinStake
        200 // _stakingEpochDuration
      ).should.be.rejectedWith(ERROR_MSG);
    });
    it('should fail if already initialized', async () => {
      await validatorSetAuRa.initialize(
        '0x2000000000000000000000000000000000000001', // _blockRewardContract
        '0x3000000000000000000000000000000000000001', // _randomContract
        '0x0000000000000000000000000000000000000000', // _erc20TokenContract
        initialValidators, // _initialValidators
        1, // _delegatorMinStake
        1, // _candidateMinStake
        200 // _stakingEpochDuration
      ).should.be.fulfilled;
      await validatorSetAuRa.initialize(
        '0x2000000000000000000000000000000000000001', // _blockRewardContract
        '0x3000000000000000000000000000000000000001', // _randomContract
        '0x0000000000000000000000000000000000000000', // _erc20TokenContract
        initialValidators, // _initialValidators
        1, // _delegatorMinStake
        1, // _candidateMinStake
        200 // _stakingEpochDuration
      ).should.be.rejectedWith(ERROR_MSG);
    });
    it('should fail if stakingEpochDuration is less than 28', async () => {
      await validatorSetAuRa.initialize(
        '0x2000000000000000000000000000000000000001', // _blockRewardContract
        '0x3000000000000000000000000000000000000001', // _randomContract
        '0x0000000000000000000000000000000000000000', // _erc20TokenContract
        initialValidators, // _initialValidators
        1, // _delegatorMinStake
        1, // _candidateMinStake
        27 // _stakingEpochDuration
      ).should.be.rejectedWith(ERROR_MSG);
      await validatorSetAuRa.initialize(
        '0x2000000000000000000000000000000000000001', // _blockRewardContract
        '0x3000000000000000000000000000000000000001', // _randomContract
        '0x0000000000000000000000000000000000000000', // _erc20TokenContract
        initialValidators, // _initialValidators
        1, // _delegatorMinStake
        1, // _candidateMinStake
        28 // _stakingEpochDuration
      ).should.be.fulfilled;
    });
  });

  describe('_getRandomIndex()', async () => {
    beforeEach(async () => {
      validatorSetAuRa = await ValidatorSetAuRa.new();
    });
    it('should return indexes according to given likelihood', async () => {
      const repeats = 2000;
      const maxFluctuation = 2; // percents, +/-

      const stakeAmounts = [
        170000, // 17%
        130000, // 13%
        10000,  // 1%
        210000, // 21%
        90000,  // 9%
        60000,  // 6%
        0,      // 0%
        100000, // 10%
        40000,  // 4%
        140000, // 14%
        30000,  // 3%
        0,      // 0%
        20000   // 2%
      ];

      const stakeAmountsTotal = stakeAmounts.reduce((accumulator, value) => accumulator + value);
      const stakeAmountsShares = stakeAmounts.map((value) => parseInt(value / stakeAmountsTotal * 100));
      let indexesStats = stakeAmounts.map(() => 0);

      for (let i = 0; i < repeats; i++) {
        const index = await validatorSetAuRa.getRandomIndex.call(
          stakeAmounts,
          stakeAmountsTotal,
          random(0, Number.MAX_SAFE_INTEGER)
        );
        indexesStats[index.toNumber()]++;
      }

      const stakeAmountsRandomShares = indexesStats.map((value) => Math.round(value / repeats * 100));

      //console.log(stakeAmountsShares);
      //console.log(stakeAmountsRandomShares);

      stakeAmountsRandomShares.forEach((value, index) => {
        if (stakeAmountsShares[index] == 0) {
          value.should.be.equal(0);
        } else {
          Math.abs(stakeAmountsShares[index] - value).should.be.most(maxFluctuation);
        }
      });
    });
  });
});

function random(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}
