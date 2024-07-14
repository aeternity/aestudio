export const examples: SophiaCodeExample = {
  1: {},
  2: {
    tryItYourselfCode: [
      {
        contract: `main contract Counter =
  type state = int
  entrypoint init() = 0
  entrypoint get() = 2
  stateful entrypoint incr() = put(state + 1)

        `,
       /*  contract: `contract VoteTwice =
  entrypoint voteTwice(v : VotingType, alt : string) =
    v.vote(alt)
    v.vote(alt)`, */
        predefCall: `get()`,
        mainContract: `Counter`,
      },
    ],
  },
};

export interface SophiaCodeExample {
    [k: number]: {
        tryItYourselfCode?: Array<{contract: string, predefCall: string, mainContract: string}>;
    }
}