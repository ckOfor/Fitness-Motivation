;; Fitness Goals Smart Contract

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-not-found (err u100))
(define-constant err-unauthorized (err u101))

;; Data Variables
(define-data-var last-goal-id uint u0)

;; Define the structure of a fitness goal
(define-map fitness-goals
  { goal-id: uint }
  {
    owner: principal,
    target-steps: uint,
    deadline: uint,
    achieved: bool,
    rewarded: bool
  }
)

;; Create a new fitness goal
(define-public (create-goal (target-steps uint) (duration uint))
  (let
    (
      (goal-id (+ (var-get last-goal-id) u1))
      (deadline (+ block-height duration))
    )
    (map-set fitness-goals
      { goal-id: goal-id }
      {
        owner: tx-sender,
        target-steps: target-steps,
        deadline: deadline,
        achieved: false,
        rewarded: false
      }
    )
    (var-set last-goal-id goal-id)
    (ok goal-id)
  )
)

;; Update goal achievement status
(define-public (update-goal-status (goal-id uint) (steps-completed uint))
  (let
    (
      (goal (unwrap! (map-get? fitness-goals { goal-id: goal-id }) err-not-found))
    )
    (asserts! (is-eq (get owner goal) tx-sender) err-unauthorized)
    (asserts! (<= block-height (get deadline goal)) err-unauthorized)
    (if (>= steps-completed (get target-steps goal))
      (ok (map-set fitness-goals
        { goal-id: goal-id }
        (merge goal { achieved: true })))
      (ok false)
    )
  )
)

;; Claim reward for achieved goal
(define-public (claim-reward (goal-id uint))
  (let
    (
      (goal (unwrap! (map-get? fitness-goals { goal-id: goal-id }) err-not-found))
    )
    (asserts! (is-eq (get owner goal) tx-sender) err-unauthorized)
    (asserts! (get achieved goal) err-unauthorized)
    (asserts! (not (get rewarded goal)) err-unauthorized)
    (try! (as-contract (stx-transfer? u100 tx-sender (get owner goal))))
    (ok (map-set fitness-goals
      { goal-id: goal-id }
      (merge goal { rewarded: true })))
  )
)

;; Get goal details
(define-read-only (get-goal (goal-id uint))
  (map-get? fitness-goals { goal-id: goal-id })
)
