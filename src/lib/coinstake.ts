/**
 * Helpers to split a coinstake transaction into staking and masternode rewards.
 */

type RawVin = Record<string, unknown>;
type RawVout = Record<string, unknown>;

export interface CoinstakeRewards {
  /** Address that staked (owner of the first input) */
  stakerAddress: string | null;
  /** Sum of all outputs back to the staker minus the staked inputs */
  stakingRewardSatoshis: number;
  /** Output index (vout array position) of the masternode payment, if any */
  masternodeOutputIndex: number | null;
  masternodeRewardSatoshis: number;
}

/** Converts a BBK amount from the API to satoshis */
export function toSatoshis(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.round(value * 100000000);
}

function outputAddress(output: RawVout): string | null {
  const scriptPubKey = output.scriptPubKey as Record<string, unknown> | undefined;
  const addresses = (scriptPubKey?.addresses as string[]) || [];
  return addresses[0] || null;
}

/**
 * The staker may split the stake into several outputs, so every output back to the
 * staker counts towards the staking reward. The masternode payment is appended as the
 * last output paying a different address; when the block paid no masternode there is none.
 */
export function analyzeCoinstake(vin: RawVin[], vout: RawVout[], totalInputSatoshis: number): CoinstakeRewards {
  const stakerAddress = vin.length > 0 && vin[0].address ? (vin[0].address as string) : null;
  if (!stakerAddress) {
    // Without the staker's address the outputs can't be told apart
    return { stakerAddress, stakingRewardSatoshis: 0, masternodeOutputIndex: null, masternodeRewardSatoshis: 0 };
  }

  let stakerOutputsSatoshis = 0;
  let masternodeOutputIndex: number | null = null;

  vout.forEach((output, index) => {
    const value = toSatoshis(output.value);
    if (value <= 0) return; // Empty marker output
    const address = outputAddress(output);
    if (address === stakerAddress) {
      stakerOutputsSatoshis += value;
    } else {
      masternodeOutputIndex = index;
    }
  });

  const masternodeRewardSatoshis =
    masternodeOutputIndex !== null ? toSatoshis(vout[masternodeOutputIndex].value) : 0;

  return {
    stakerAddress,
    stakingRewardSatoshis: Math.max(0, stakerOutputsSatoshis - totalInputSatoshis),
    masternodeOutputIndex,
    masternodeRewardSatoshis,
  };
}
