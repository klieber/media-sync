import logger from '../support/logger';

const log = logger.create('lib/provider/composite-provider');

class CompositeProvider {
  #providers;

  constructor(providers) {
    this.#providers = providers;
  }

  async list() {
    const results = await Promise.allSettled(this.#providers.map((provider) => provider.list()));
    const rejectReasons = results.filter((result) => result.status !== 'fulfilled').map((result) => result.reason);
    const fulfilledValues = results.filter((result) => result.status === 'fulfilled').map((result) => result.value);

    if (rejectReasons.length > 0 && fulfilledValues.length === 0) {
      throw new Error(rejectReasons.join('; '));
    }

    if (rejectReasons.length > 0) {
      log.error(`unable to list files: ${rejectReasons.join('; ')}`);
    }

    return fulfilledValues.flat(1);
  }
}

module.exports = CompositeProvider;
