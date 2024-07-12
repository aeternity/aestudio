export const examples: SophiaCodeExample = {
  1: {},
  2: {
    tryItYourselfCode: [
      {
        contract: `contract VoteTwice =
  entrypoint voteTwice(v : VotingType, alt : string) =
    v.vote(alt)
    v.vote(alt)`,
        predefCall: `voteInChildContract("yes")`,
      },
    ],
  },
};

export interface SophiaCodeExample {
    [k: number]: {
        tryItYourselfCode?: Array<{contract: string, predefCall: string}>;
    }
}