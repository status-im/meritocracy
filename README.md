# Status Meritocracy

The Status Meritocracy allows `Contributors` to show their appreciation of other `Contributors` efforts in Status.

### Summary

The Status Meritocracy is a SNT Reward System that allows a `Contributor` in the registry to award allocated SNT, along with praise, to other `Contributors`.

The DApp will also display a leaderboard of `Contributors` who have been awarded the most and have partcipated the most in the Meritocracy, along with their praise

### Roles
#### Contributor
Abilities:
- can send SNT to the Meritocracy contract, which is allocated evenly over `Contributors`
- can `award` allocated SNT to `Contributors`
- can withdraw SNT awarded to them, only when they have awarded all their allocatable SNT (or it has been forfeited by `Admins`)

#### Admin
Abilities:
- add/remove `Contributors`
- set upper limit of `Contributor` `registry`
- forfeit all `Contributors` allocatable SNT, can only be called once a week at maximum.

#### Owner 
Abilities:
- is Admin
- can add/remove `Admins`,
- can changeOwner
- can change ERC20Token contract address
- can recover funds
