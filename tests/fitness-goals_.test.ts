import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock blockchain state
interface BlockchainState {
  fitnessGoals: Map<number, FitnessGoal>;
  currentBlock: number;
  balances: Map<string, number>;
}

interface FitnessGoal {
  owner: string;
  targetSteps: number;
  deadline: number;
  achieved: boolean;
  rewarded: boolean;
}

describe('Fitness Goals Smart Contract', () => {
  let state: BlockchainState;
  const wallet1 = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const wallet2 = 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const contractAddress = 'ST3PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  
  beforeEach(() => {
    // Reset blockchain state before each test
    state = {
      fitnessGoals: new Map(),
      currentBlock: 1,
      balances: new Map([
        [wallet1, 1000],
        [wallet2, 1000],
        [contractAddress, 10000]
      ])
    };
  });
  
  // Mock contract functions
  const createGoal = (sender: string, targetSteps: number, duration: number): number => {
    const goalId = state.fitnessGoals.size + 1;
    const goal: FitnessGoal = {
      owner: sender,
      targetSteps,
      deadline: state.currentBlock + duration,
      achieved: false,
      rewarded: false
    };
    state.fitnessGoals.set(goalId, goal);
    return goalId;
  };
  
  const updateGoalStatus = (sender: string, goalId: number, stepsCompleted: number): boolean => {
    const goal = state.fitnessGoals.get(goalId);
    if (!goal || goal.owner !== sender || state.currentBlock > goal.deadline) {
      throw new Error('Unauthorized or goal not found');
    }
    if (stepsCompleted >= goal.targetSteps) {
      goal.achieved = true;
      state.fitnessGoals.set(goalId, goal);
      return true;
    }
    return false;
  };
  
  const claimReward = (sender: string, goalId: number): boolean => {
    const goal = state.fitnessGoals.get(goalId);
    if (!goal || goal.owner !== sender || !goal.achieved || goal.rewarded) {
      throw new Error('Unauthorized or invalid goal state');
    }
    const reward = 100;
    const contractBalance = state.balances.get(contractAddress) || 0;
    const userBalance = state.balances.get(sender) || 0;
    if (contractBalance < reward) {
      throw new Error('Insufficient contract balance');
    }
    state.balances.set(contractAddress, contractBalance - reward);
    state.balances.set(sender, userBalance + reward);
    goal.rewarded = true;
    state.fitnessGoals.set(goalId, goal);
    return true;
  };
  
  // Tests
  it('allows creating a new fitness goal', () => {
    const goalId = createGoal(wallet1, 10000, 30);
    const goal = state.fitnessGoals.get(goalId);
    
    expect(goalId).toBe(1);
    expect(goal).toBeDefined();
    expect(goal?.targetSteps).toBe(10000);
    expect(goal?.owner).toBe(wallet1);
  });
  
  it('allows updating goal status', () => {
    const goalId = createGoal(wallet1, 10000, 30);
    const result = updateGoalStatus(wallet1, goalId, 10000);
    
    expect(result).toBe(true);
    expect(state.fitnessGoals.get(goalId)?.achieved).toBe(true);
  });
  
  it('prevents updating goal status after deadline', () => {
    const goalId = createGoal(wallet1, 10000, 30);
    state.currentBlock += 31;
    
    expect(() => updateGoalStatus(wallet1, goalId, 10000)).toThrow('Unauthorized or goal not found');
  });
  
  it('allows claiming reward for achieved goal', () => {
    const goalId = createGoal(wallet1, 10000, 30);
    updateGoalStatus(wallet1, goalId, 10000);
    const result = claimReward(wallet1, goalId);
    
    expect(result).toBe(true);
    expect(state.fitnessGoals.get(goalId)?.rewarded).toBe(true);
    expect(state.balances.get(wallet1)).toBe(1100);
  });
  
  it('prevents claiming reward for unachieved goal', () => {
    const goalId = createGoal(wallet1, 10000, 30);
    
    expect(() => claimReward(wallet1, goalId)).toThrow('Unauthorized or invalid goal state');
  });
  
  it('prevents claiming reward twice', () => {
    const goalId = createGoal(wallet1, 10000, 30);
    updateGoalStatus(wallet1, goalId, 10000);
    claimReward(wallet1, goalId);
    
    expect(() => claimReward(wallet1, goalId)).toThrow('Unauthorized or invalid goal state');
  });
});

