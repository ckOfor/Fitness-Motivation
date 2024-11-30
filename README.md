# Fitness Goals Smart Contract

## Overview

The Fitness Goals Smart Contract is a Stacks blockchain-based application that allows users to set, track, and reward fitness goals based on step count. Users can create fitness goals, update their progress, and claim rewards upon successful goal completion.

## Features

- Create personalized fitness goals with step targets and duration
- Track goal achievement status
- Claim rewards for successfully completed goals
- Secure ownership and authorization checks

## Contract Functions

### `create-goal`
- **Parameters**:
    - `target-steps` (uint): Number of steps to achieve
    - `duration` (uint): Number of blocks to complete the goal
- **Returns**: Goal ID (uint)
- **Description**: Creates a new fitness goal with specified step target and deadline

### `update-goal-status`
- **Parameters**:
    - `goal-id` (uint): Unique identifier of the goal
    - `steps-completed` (uint): Number of steps completed
- **Returns**: Boolean indicating goal achievement status
- **Description**: Updates the achievement status of a specific goal based on completed steps

### `claim-reward`
- **Parameters**:
    - `goal-id` (uint): Unique identifier of the goal
- **Returns**: Successful reward transfer
- **Description**: Allows goal owner to claim a 100 STX reward for achieved goals

### `get-goal`
- **Parameters**:
    - `goal-id` (uint): Unique identifier of the goal
- **Returns**: Goal details or `none`
- **Description**: Retrieves details of a specific goal

## Error Codes

- `err-not-found` (u100): Goal not found
- `err-unauthorized` (u101): Unauthorized action (not goal owner or past deadline)

## Usage Example

```clarity
;; Create a goal of 10,000 steps with a 144-block deadline (approx. 1 day)
(create-goal u10000 u144)

;; Update goal status when steps are completed
(update-goal-status goal-id u10500)

;; Claim reward for achieved goal
(claim-reward goal-id)
```

## Security Considerations

- Only goal owners can update goal status and claim rewards
- Goals can only be updated before the deadline
- Rewards can only be claimed once per achieved goal

## Reward Mechanism

- Each successfully completed goal rewards the user with 100 STX
- Rewards are transferred from the contract's balance
- A goal can be rewarded only once

## Deployment Requirements

- Ensure the contract has sufficient STX balance to fund rewards
- Deploy on a Stacks blockchain network

## Potential Improvements

- Add variable reward amounts
- Implement goal verification mechanisms
- Create more complex reward structures
- Add goal categories or types

## License

[Specify your license here, e.g., MIT, Apache 2.0]

## Contributing

Contributions are welcome! Please submit pull requests or open issues on the project repository.
